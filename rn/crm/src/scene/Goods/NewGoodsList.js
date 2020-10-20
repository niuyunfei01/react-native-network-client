import React, {Component} from "react"
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool from "../../common/tool"
import native from "../../common/native"
import {NavigationActions} from 'react-navigation'
import SearchInputNavigation from "../component/SearchInputNavigation"
import color from "../../widget/color"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache"
import Mapping from "../../Mapping"
import {Modal, Icon, Button, InputItem, List} from "antd-mobile-rn"
import ActionButton from 'react-native-action-button'
import {Input} from "../../weui/Form";
import {Dialog} from "../../weui/Dialog";


function mapStateToProps(state) {
    const {global} = state
    return {global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch
    };
}

class NewGoodsList extends Component {
    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        const type = navigation.state.params.type;
        return {
            headerLeft: (
                <SearchInputNavigation
                    onSearch={(text) => params.search(text)}
                    onBack={() => {
                        if (type !== 'select_for_store') {
                            native.toGoods();
                        }
                    }}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        const {limit_store} = this.props.navigation.state.params;

        this.state = {
            storeId: limit_store ? limit_store : this.props.global.currStoreId,
            fnPriceControlled: false,
            goods: [],
            page: 1,
            pageNum: 15,
            categories: [],
            isLoading: false,
            isLastPage: false,
            selectTagId: 0,
            showCategory: true,
            text: '',
            modalVisible: false,
            modalType: '',
            setPrice: '',
            selectedProduct: {},
            onlineType: 'browse',
            bigImageUri: [],
        }
    }

    componentWillMount() {
        //设置函数
        let accessToken = this.props.global.accessToken;
        const {type, limit_store, prod_status} = this.props.navigation.state.params;
        let storeId = limit_store ? limit_store : this.state.storeId

        this.props.navigation.setParams({search: this.searchWithKeyword})

        HttpUtils.get.bind(this.props)(`/api/read_store_simple/${storeId}?access_token=${accessToken}`).then(store => {
            this.setState({fnPriceControlled: store['fn_price_controlled']})
        }, (ok, reason) => {
            console.log("ok=", ok, "reason=", reason)
        })

        this.fetchCategories(storeId, prod_status, accessToken)
    }

    fetchCategories(storeId, prod_status, accessToken) {
        const hideAreaHot = prod_status ? 1 : 0;

        HttpUtils.get.bind(this.props)(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
            this.setState({categories: res, selectTagId: res[0].id}, () => this.search())
        })
    }

    searchWithKeyword = (text) => {
        let showCategory = !text
        this.setState({
            page: 1,
            showCategory: showCategory,
            text: text, selectTagId: 0,
            onlineType: showCategory ? 'browse' : 'search'
        }, () => this.search())
    }

    search = () => {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);

        const {type, limit_store, prod_status} = this.props.navigation.state.params;

        let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
        this.setState({isLoading: true})
        const params = {
            vendor_id: currVendorId,
            tagId: this.state.selectTagId,
            page: this.state.page,
            pageNum: this.state.pageNum,
            name: this.state.text ? this.state.text : '',
            storeId: storeId,
        }
        if (limit_store) {
            params['hideAreaHot'] = 1;
            params['limit_status'] = (prod_status || []).join(",");
        }

        HttpUtils.get.bind(this.props)(`/api/find_prod_with_pagination.json?access_token=${accessToken}`, params).then(res => {
            const totalPage = res.count / res.pageSize
            const isLastPage = res.page >= totalPage
            const goods = res.page == 1 ? res.lists : this.state.goods.concat(res.lists)
            this.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
        })
    }

    onRefresh() {
        this.setState({page: 1}, () => this.search())
    }

    onLoadMore() {
        let page = this.state.page
        this.setState({page: page + 1}, () => this.search())
    }

    onSelectCategory(category) {
        this.setState({
            selectTagId: category.id,
            page: 1,
            onlineType: 'browse'
        }, () => this.search())
    }

    onCloseModal = () => {
        this.setState({
            modalVisible: false,
            modalType: '',
            selectedProduct: {},
            setPrice: '',
        })
    }

    onOpenModal(modalType, product) {
        console.log(product)
        this.setState({
            modalVisible: true,
            modalType: modalType,
            selectedProduct: product
        })
    }

    changeRowExist(idx, supplyPrice) {
        const products = this.state.goods
        products[idx].is_exist = {supply_price: supplyPrice, status: 1}
        this.setState({goods: products})
    }

    showOnlineBtn(product) {
        return !product.is_exist
            || Mapping.Tools.ValueEqMapping(Mapping.Product.STORE_PRODUCT_STATUS.OFF_SALE.value, product.is_exist.status)
    }

    /**
     * 保底模式并且是售卖中的商品显示保底价
     */
    showSupplyPrice(product) {
        return this.state.fnPriceControlled > 0
            && product
            && !Mapping.Tools.ValueEqMapping(Mapping.Product.STORE_PRODUCT_STATUS.OFF_SALE, product.status)
    }

    showSelect(product) {
        return this.props.navigation.state.params.type === 'select_for_store' && product;
    }

    renderRow = (product, idx) => {
        return (
            <View style={styles.productRow} key={product.id}>
                <TouchableOpacity>
                    <CachedImage source={{uri: Config.staticUrl(product.coverimg)}}
                                 style={{width: pxToDp(150), height: pxToDp(150)}}/>
                </TouchableOpacity>
                <View style={styles.productRight}>
                    <View style={styles.productRowTop}>
                        <Text
                            numberOfLines={2}
                            style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}
                        >
                            {product.name}
                        </Text>
                    </View>
                    <View style={styles.productRowBottom}>
                        <View>
                            <If condition={product.sales}>
                                <Text style={{fontSize: pxToDp(20)}}>销量：{product.sales}</Text>
                            </If>
                        </View>
                        <If condition={this.showSelect(product) && product.is_exist}>
                            <View style={{flexDirection: 'row'}}>
                                <If condition={this.showSupplyPrice(product.is_exist)}>
                                    <View style={{marginRight: pxToDp(10)}}>
                                        <Text
                                            style={{color: color.orange}}>￥{tool.toFixed(product.is_exist.supply_price)}</Text>
                                    </View>
                                </If>
                                <View style={styles.isOnlineBtn}>
                                    <Text style={styles.isOnlineBtnText}>
                                        {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, product.is_exist.status)}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.state.params.onBack(product.name, product.is_exist);
                                    this.props.navigation.dispatch(NavigationActions.back())
                                }}>
                                    <View style={styles.toOnlineBtn}>
                                        <Text style={styles.toOnlineBtnText}>选择</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </If>
                        <If condition={!this.showSelect(product)}>
                            <If condition={!this.showOnlineBtn(product)}>
                                <View style={{flexDirection: 'row'}}>
                                    <If condition={this.showSupplyPrice(product.is_exist)}>
                                        <View style={{marginRight: pxToDp(10)}}>
                                            <Text
                                                style={{color: color.orange}}>￥{tool.toFixed(product.is_exist.supply_price)}</Text>
                                        </View>
                                    </If>
                                    <View style={styles.isOnlineBtn}>
                                        <Text style={styles.isOnlineBtnText}>
                                            {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, product.is_exist.status)}
                                        </Text>
                                    </View>
                                </View>
                            </If>
                            <If condition={this.showOnlineBtn(product)}>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate(Config.ROUTE_ONLINE_STORE_PRODUCT, {
                                        store_id: this.state.storeId,
                                        product_id: product.id,
                                        mode: 2,
                                        onlineType: this.state.onlineType,
                                        onBack: (supplyPrice) => this.changeRowExist(idx, supplyPrice)
                                    })}>
                                    <View style={styles.toOnlineBtn}>
                                        <Text style={styles.toOnlineBtnText}>上架</Text>
                                    </View>
                                </TouchableOpacity>
                            </If>
                        </If>
                    </View>
                </View>
                <View style={styles.productButtonsBottomRow}>
                    <If condition={!this.showOnlineBtn(product)}>
                        <TouchableOpacity onPress={() => this.onOpenModal('off_sale', product)}>
                            <View style={styles.toOnlineBtn}>
                                <Text style={styles.toOnlineBtnText}>下架</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.onOpenModal('set_price', product)}>
                            <View style={styles.toOnlineBtn}>
                                <Text style={styles.toOnlineBtnText}>报价</Text>
                            </View>
                        </TouchableOpacity>
                    </If>
                </View>
            </View>
        )
    }

    renderList() {
        const products = this.state.goods
        let items = []
        for (const idx in products) {
            items.push(this.renderRow(products[idx], idx))
        }
        return items
    }

    renderCategory(category) {
        const selectCategoryId = this.state.selectTagId
        let active = selectCategoryId === category.id
        return (
            <TouchableOpacity key={category.id} onPress={() => this.onSelectCategory(category)}>
                <View style={[active ? styles.categoryItemActive : styles.categoryItem]}>
                    <Text style={styles.categoryText}>{category.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderCategories() {
        const categories = this.state.categories
        let item = []
        for (let i in categories) {
            item.push(this.renderCategory(categories[i]))
        }
        return item
    }

    renderModal() {
        let modalView
        if (this.state.modalType === 'off_sale') {
            modalView =
                <Modal popup maskClosable visible={this.state.modalVisible} animationType="slide-up"
                       onClose={this.onCloseModal}>
                    <View style={{paddingBottom: 20, paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{textAlign: 'center', fontSize: 22}}>下架</Text>
                            <TouchableOpacity onPress={() => this.onCloseModal()}>
                                <Text style={{textAlign: 'right', fontSize: 22}}>X<Icon name="account-book" size='md'
                                                                                        color="grey"/></Text>
                            </TouchableOpacity>
                            <View style={{paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'column'}}>
                                <Text style={{
                                    textAlign: 'left',
                                    fontSize: 20,
                                    padding: 10
                                }}>{this.state.selectedProduct.name}</Text>
                                <View>
                                    <Button size="small" type="warning">确认修改</Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
        }
        if (this.state.modalType === 'set_price') {
            modalView =
                <Modal popup maskClosable visible={this.state.modalVisible} animationType="slide-up"
                       onClose={this.onCloseModal}>
                    <View style={{paddingBottom: 20, paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{textAlign: 'center', fontSize: 22}}>报价</Text>
                            <TouchableOpacity onPress={() => this.onCloseModal()}>
                                <Text style={{textAlign: 'right', fontSize: 22}}>X<Icon name="account-book" size='md'
                                                                                        color="grey"/></Text>
                            </TouchableOpacity>
                            <View style={{flexDirection:'column'}}>
                                <Text style={{textAlign: 'left', fontSize: 20}}>{this.state.selectedProduct.name}</Text>
                                <View style={{flexDirection: 'column'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Input
                                            placeholder={'请输入金额，金额只能大于0,单位为分'}
                                            value={this.state.selectedProduct.is_exist.supply_price}
                                            keyboardType='numeric'

                                            onChangeText={(value) => {
                                                let tempIsExist = {
                                                    ...this.state.selectedProduct.is_exist,
                                                    supply_price: value
                                                }
                                                let tempProduct = {...this.state.selectedProduct, is_exist: tempIsExist}
                                                this.setState({selectedProduct: tempProduct})
                                            }}/>
                                            <Text style={{alignItems: 'flex-end', fontSize:20}}>单位为分</Text>
                                    </View>
                                    <Button size="small" type="warning">确认修改</Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
        }
        return modalView
    }

    render() {
        return (
            <View style={styles.container}>
                {/*分类*/}
                <If condition={this.state.showCategory}>
                    <View style={styles.categoryBox}>
                        <ScrollView>
                            {this.renderCategories()}
                        </ScrollView>
                    </View>
                </If>
                {/*搜索商品列表*/}
                <View style={{flex: 1}}>
                    <If condition={this.state.goods && this.state.goods.length}>
                        <LoadMore
                            loadMoreType={'scroll'}
                            renderList={this.renderList()}
                            onRefresh={() => this.onRefresh()}
                            onLoadMore={() => this.onLoadMore()}
                            isLastPage={this.state.isLastPage}
                            isLoading={this.state.isLoading}
                        />
                    </If>

                    <If condition={!(this.state.goods && this.state.goods.length)}>
                        <NoFoundDataView/>
                    </If>
                    {this.renderModal()}
                    <ActionButton
                        buttonColor="rgba(231,76,60,1)"
                        onPress={() => {
                            alert('你点了我！')
                        }}
                        renderIcon={() => (<View style={styles.actionButtonView}>
                            <Text style={styles.actionButtonText}>新增商品</Text>
                        </View>)}
                    />
                </View>
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewGoodsList);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    },
    actionButtonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: 'white',
    },
    categoryBox: {
        width: pxToDp(200),
        backgroundColor: 'rgb(212,213,214)',
        height: '100%'
    },
    categoryItem: {
        justifyContent: 'center',
        alignItems: 'center',
        height: pxToDp(70)
    },
    categoryItemActive: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderLeftWidth: pxToDp(10),
        borderLeftColor: color.theme,
        height: pxToDp(70)
    },
    categoryText: {
        fontSize: 20
    },
    noFoundBtnRow: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: pxToDp(150)
    },
    noFoundBtn: {
        width: "80%",
        height: pxToDp(50),
        borderColor: color.theme,
        borderWidth: pxToDp(1),
        borderRadius: pxToDp(25),
        alignItems: "center",
        justifyContent: "center"
    },
    noFoundBtnText: {
        color: color.theme,
        textAlign: "center"
    },
    productRow: {
        flex: 1,
        height: pxToDp(170),
        borderWidth: 1,
        borderColor: "#ccc",
        padding: pxToDp(10),
        marginBottom: pxToDp(5),
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    productRight: {
        flex: 1,
        height: pxToDp(150),
        marginLeft: pxToDp(20),
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    productRowTop: {
        flexDirection: 'column'
    },
    productRowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: pxToDp(50)
    },
    productButtonsBottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    isOnlineBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: pxToDp(100),
        height: pxToDp(40),
        backgroundColor: '#ddd'
    },
    isOnlineBtnText: {
        color: '#fff'
    },
    toOnlineBtn: {
        borderWidth: pxToDp(1),
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: color.theme,
        width: pxToDp(100),
        height: pxToDp(40)
    },
    toOnlineBtnText: {
        color: color.theme
    }
})
