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
import {Modal, Button} from "antd-mobile-rn"
import {Button as WButton, Dialog} from "../../weui/index";
import {Input} from "../../weui/Form";
import {NavigationItem} from "../../widget";
import Cts from "../../Cts";
import Toast from "../../weui/Toast/Toast";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";
import JbbInput from "../component/JbbInput";
import {Left} from "../component/All";


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
            onSubmitting: false,
            loadingCategory: true,
            errorMsg: null,
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

        HttpUtils.get.bind(this.props)(`/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`, params).then(res => {
            const totalPage = res.count / res.pageSize
            const isLastPage = res.page >= totalPage
            const goods = res.page == 1 ? res.lists : this.state.goods.concat(res.lists)
            this.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
        })
    }

    doneProdUpdate = (pid, prodFields, spFields) => {
        const idx = this.state.goods.findIndex(g => g.id === pid);
        const item = this.state.goods[idx];
        console.log("doneProdUpdate find ", item, "index", idx, prodFields, spFields)

        Object.keys(prodFields).map(k => {
            item[k] = prodFields[k]
        })
        Object.keys(spFields).map(k => {
            item['sp'][k] = spFields[k]
        })

        console.log("doneProdUpdate updated", item, "index", idx)

        this.state.goods[idx] = item;
        this.setState({goods: this.state.goods})
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
        const p = product ? product : {};
        const setPrice = parseFloat((p.sp || {}).supply_price/100).toFixed(2)
        console.log("setPrice ", setPrice, "p", p)
        this.setState({
            modalVisible: true,
            modalType: modalType,
            selectedProduct: p,
            setPrice: setPrice
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
            <View style={[Styles.cowbetween, styles.productRow, {flex: 1, backgroundColor: '#fff'}]} key={product.id}>
                <View style={{flexDirection: 'row', paddingBottom: 5}}>
                    <TouchableOpacity onPress={() => {
                        this.gotoGoodDetail(product.id)
                    }}>
                        <CachedImage source={{uri: Config.staticUrl(product.coverimg)}} style={{width: pxToDp(150), height: pxToDp(150)}}/>
                    </TouchableOpacity>
                    <View style={[Styles.columnStart, {flex: 1, marginLeft: 5}]}>
                            <Text numberOfLines={2} style={Styles.n2b}>{product.name}</Text>
                            <If condition={product.sales}>
                                <Text style={Styles.n2grey6}>销量：{product.sales}</Text>
                            </If>
                    </View>
                </View>
                <View style={[Styles.rowcenter, {flex: 1, padding: 5, borderTopWidth: pxToDp(1), borderColor: colors.colorDDD}]}>
                    <TouchableOpacity style={[styles.toOnlineBtn, {flex: 1}]} onPress={() => this.onOpenModal('off_sale', product)}>
                            <Text>下架</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.toOnlineBtn, {flex: 1, borderRightWidth: 0}]} onPress={() => this.onOpenModal('set_price', product)}>
                            <Text>报价</Text>
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
            product_id: (this.state.selectedProduct || {}).id,
        }
        HttpUtils.post.bind(this.props)(`/api/list_store_prod_tags/${storeId}?access_token=${accessToken}`, params).then(res => {
            this.setState({categories: res, selectTagId: res[0].id}, () => this.search())
        })
    }

    onChangeGoodsPrice = () => {
        const p = this.state.selectedProduct;
        console.log("start updating ", p, this.state.setPrice)
        if (p && p.sp && p.id > 0 && this.state.setPrice !== '' && this.state.setPrice >= 0) {
            console.log("start updating ", p, this.state.setPrice)
            this.onCloseModal()
            const accessToken = this.props.global.accessToken;
            const applyPrice = this.state.setPrice * 100;
            const params = {
                store_id: this.state.storeId,
                product_id: p.id,
                apply_price: applyPrice,
                before_price: p.sp.supply_price,
                remark: '',
                auto_on_sale: 0,
                autoOnline: 0,
                access_token: accessToken,
            }
            this.setState({onSubmitting: true})
            HttpUtils.get.bind(this.props)(`/api/apply_store_price`, params).then((obj) => {
                this.setState({onSubmitting: false})
                this.doneProdUpdate(p.id, {}, {apply_price: applyPrice})
            }, (ok, reason, obj) => {
                this.setState({onSubmitting: false, errorMsg: `改价失败：${reason}`})
            })
        }
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

                    <If condition={!(this.state.goods && this.state.goods.length) && !this.state.isLoading}>
                        <NoFoundDataView/>
                    </If>
                </View>}

                <Modal popup maskClosable visible={this.state.modalVisible && this.state.modalType === 'off_sale'}
                       animationType="slide-up"
                       onClose={this.onCloseModal}>
                    <View style={{paddingBottom: 20, paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{textAlign: 'center', fontSize: 22}}>下架</Text>
                            <TouchableOpacity onPress={this.onCloseModal}>
                                <Text style={{textAlign: 'right', fontSize: 22}}>X</Text>
                            </TouchableOpacity>
                            <View style={{paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'column'}}>
                                <Text style={{
                                    textAlign: 'left',
                                    fontSize: 20,
                                    padding: 10
                                }}>{this.state.selectedProduct.name}</Text>
                                <Button size="small" type="warning"
                                        onPress={() => this.onChangeGoodsStatus()}>确认修改</Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal popup maskClosable visible={this.state.modalVisible && this.state.modalType === 'set_price'}
                       animationType="slide-up"
                       onClose={this.onCloseModal}>
                    <View style={{paddingBottom: 20, paddingHorizontal: 20}}>
                        <View style={{flexDirection: 'column'}}>
                            <View style={Styles.endcenter}>
                                <Text style={[{textAlign: 'center', flex: 1}, Styles.n1b]}>报价</Text>
                                <TouchableOpacity style={[Styles.center, {width: pxToDp(120), height: pxToDp(60)}]}
                                                  onPress={this.onCloseModal}>
                                    <Text style={Styles.n1b}>X</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{this.state.selectedProduct.name}</Text>
                            <Left title="报价" placeholder="" required={true} value={this.state.setPrice} type="numeric"
                                  right={<Text style={Styles.n2}>元</Text>}
                                  textInputAlign='right'
                                  textInputStyle={[Styles.n2, {marginRight: 10}]}
                                  onChangeText={text => this.setState({setPrice: text})}/>
                            <Button size={'small'} type="warning" onClick={() => this.onChangeGoodsPrice()}>确认修改</Button>
                        </View>
                    </View>
                </Modal>

                <Dialog onRequestClose={() => {}} visible={!!this.state.errorMsg}
                        buttons={[{
                            type: 'default',
                            label: '知道了',
                            onPress: () => { this.setState({errorMsg: ''}) }}]}>
                    <View> <Text style={{color: '#000'}}>{this.state.errorMsg}</Text></View>
                </Dialog>

                <Toast icon="loading" show={this.state.loadingCategory} onRequestClose={() => { }}>加载中</Toast>
                <Toast icon="loading" show={this.state.onSubmitting} onRequestClose={() => { }}>提交中</Toast>
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
        padding: 5,
        marginBottom: 3,
        backgroundColor: '#fff',
    },
    toOnlineBtn: {
        borderRightWidth: pxToDp(1),
        borderColor: colors.colorDDD,
        justifyContent: 'center',
        alignItems: 'center',
    }
})
