import React, {Component} from "react"
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool, {simpleStore} from "../../common/tool"
import color from "../../widget/color"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache"
import Mapping from "../../Mapping"
import {Modal, Icon, Button} from "antd-mobile-rn"
import {Button as WButton, Dialog} from "../../weui/index";
import {Input} from "../../weui/Form";
import {NavigationItem} from "../../widget";
import Cts from "../../Cts";
import Toast from "../../weui/Toast/Toast";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";


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
        return {
            headerTitle: '商品列表',
            headerRight: (<View style={[Styles.endcenter, {height: pxToDp(60)}]}>
                <NavigationItem title={'上新'} icon={require('../../img/Goods/zengjiahui_.png')}
                    iconStyle={Styles.navLeftIcon}
                    onPress={() => { navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add'}) }}/>
                <NavigationItem title={'搜索'}
                    iconStyle={[Styles.navLeftIcon, {tintColor: colors.color333}]}
                    icon={require('../../img/Home/icon_homepage_search.png')}
                    onPress={() => { navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {}) }}/>
            </View>
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            storeId: this.props.global.currStoreId,
            fnPriceControlled: false,
            goods: [],
            page: 1,
            pageNum: 50,
            categories: [],
            isLoading: false,
            loadingCategory: true,
            loadCategoryError: null,
            isLastPage: false,
            selectTagId: 0,
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
        const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.navigation.state.params || {};

        const {global, dispatch} = this.props
        simpleStore(global, dispatch, (store) => {
            this.setState({fnPriceControlled: store['fn_price_controlled']})
            this.fetchCategories(store.id, prod_status, accessToken)
        })

    }

    fetchCategories(storeId, prod_status, accessToken) {
        const hideAreaHot = prod_status ? 1 : 0;
        HttpUtils.get.bind(this.props)(`/api/list_store_prod_tags/${storeId}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
            this.setState({categories: res, selectTagId: res[0] ? res[0].id : null, loadingCategory: false, isLoading: true},
                () => this.search()
            )
        }, (ok, reason, obj) => {
            this.setState({loadingCategory: false, loadCategoryError: reason || '加载分类信息错误'})
        })
    }

    search = () => {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        const {prod_status} = this.props.navigation.state.params || {};

        let storeId = this.state.storeId;
        this.setState({isLoading: true})
        const params = {
            vendor_id: currVendorId,
            tagId: this.state.selectTagId,
            page: this.state.page,
            pageNum: this.state.pageNum,
            storeId: storeId,
        }

        if (storeId) {
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
        this.setState({
            modalVisible: true,
            modalType: modalType,
            selectedProduct: product ? product : {}
        })
    }

    changeRowExist(idx, supplyPrice) {
        const products = this.state.goods
        products[idx].is_exist = {supply_price: supplyPrice, status: 1}
        this.setState({goods: products})
    }

    gotoGoodDetail = (pid) => {
        this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
            pid: pid,
            storeId: this.state.storeId
        })
    }

    renderRow = (product, idx) => {
        return (
            <View style={styles.productRow} key={product.id}>
                <TouchableOpacity onPress={()=>{this.gotoGoodDetail(product.id)}}>
                    <CachedImage source={{uri: Config.staticUrl(product.coverimg)}}
                                 style={{width: pxToDp(150), height: pxToDp(150)}}/>
                </TouchableOpacity>
                <View style={styles.productRight}>
                    <View style={styles.productRowTop}>
                        <Text numberOfLines={2} style={Styles.n2b}>{product.name}</Text>
                    </View>
                    <View style={styles.productRowBottom}>
                        <View>
                            <If condition={product.sales}>
                                <Text style={Styles.n2grey6}>销量：{product.sales}</Text>
                            </If>
                        </View>
                    </View>
                </View>
                <View style={styles.productButtonsBottomRow}>
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
                    <Text style={Styles.n2grey6}>{category.name}</Text>
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

    onChangeGoodsStatus = () => {
        const accessToken = this.props.global.accessToken;
        const storeId = this.state.storeId
        const params = {
            product_id: this.state.selectedProduct.id,
        }
        HttpUtils.post.bind(this.props)(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`, params).then(res => {
            this.setState({categories: res, selectTagId: res[0].id}, () => this.search())
        })
    }

    onChangeGoodsPrice = () => {
        console.log('测试修改价格')
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
                                    <Button size="small" type="warning"
                                            onPress={() => this.onChangeGoodsStatus()}>确认修改</Button>
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
                            <Text style={{textAlign: 'center', fontSize: 22}}>修改报价</Text>
                            <TouchableOpacity onPress={() => this.onCloseModal()}>
                                <Text style={{textAlign: 'right', fontSize: 22}}>X<Icon name="account-book" size='md'
                                                                                        color="grey"/></Text>
                            </TouchableOpacity>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{textAlign: 'left', fontSize: 20}}>{this.state.selectedProduct.name}</Text>
                                <View style={{flexDirection: 'column'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={{fontSize: 20}}>报价</Text>
                                        <Input
                                            placeholder={`测试`}
                                            // placeholder={`￥${this.state.selectedProduct.is_exist.supply_price * 100}`}
                                            value={this.state.setPrice}
                                            keyboardType='numeric'
                                            onChangeText={(value) => {
                                                this.setState({setPrice: value})
                                            }}/>
                                    </View>
                                    <Button size="small" type="warning"
                                            onPress={() => this.onChangeGoodsPrice()}>确认修改</Button>
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
                <View style={styles.categoryBox}>
                    <ScrollView>
                        {this.renderCategories()}
                    </ScrollView>
                </View>
                {!this.state.loadingCategory &&
                <View style={{flex: 1}}>
                    <If condition={this.state.goods && this.state.goods.length}>
                        <LoadMore
                            loadMoreType={'scroll'}
                            renderList={this.renderList()}
                            onRefresh={() => this.onRefresh()}
                            onLoadMore={() => this.onLoadMore()}
                            isLastPage={this.state.isLastPage}
                            isLoading={this.state.isLoading}
                            loadMoreBtnText={'加载更多'}
                        />
                    </If>

                    <If condition={!(this.state.goods && this.state.goods.length && !this.state.isLoading)}>
                        <NoFoundDataView/>
                    </If>
                    {this.renderModal()}
                </View>}
                <Dialog onRequestClose={() => {}} visible={this.state.loadCategoryError}
                        buttons={[{
                            type: 'default',
                            label: '知道了',
                            onPress: () => { this.setState({loadCategoryError: ''}) }}]}>
                    <View> <Text style={{color: '#000'}}>{this.state.loadCategoryError}</Text></View>
                </Dialog>

                <Toast icon="loading" show={this.state.loadingCategory} onRequestClose={() => { }}>加载中</Toast>
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
        backgroundColor: colors.colorDDD,
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
    },
    bottomBtn: {
        height: pxToDp(70), flex: 0.8, alignItems: 'center', justifyContent: 'center'
    }
})
