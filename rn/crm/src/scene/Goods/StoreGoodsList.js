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
import Mapping from "../../Mapping"
import {SegmentedControl, WhiteSpace, List} from "antd-mobile-rn"
import {Dialog} from "../../weui/index";
import {NavigationItem} from "../../widget";
import Cts from "../../Cts";
import Toast from "../../weui/Toast/Toast";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";
import {Left} from "../component/All";
import BottomModal from "../component/BottomModal";
import AgreeItem from "antd-mobile-rn/es/checkbox/AgreeItem.native";
import {NavigationActions} from "react-navigation";
import GoodListItem from "../component/GoodListItem";


function mapStateToProps(state) {
    const {global} = state
    return {global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch
    };
}

class StoreGoodsList extends Component {
    static navigationOptions = ({navigation}) => {
        const {updatedCallback} = navigation.state.params || {};
        return {
            headerTitle: '商品列表',
            headerRight: (<View style={[Styles.endcenter, {height: pxToDp(60)}]}>
                <NavigationItem title={'上新'} icon={require('../../img/Goods/zengjiahui_.png')}
                    iconStyle={Styles.navLeftIcon}
                    onPress={() => { navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add'}) }}/>
                <NavigationItem title={'搜索'}
                    iconStyle={[Styles.navLeftIcon, {tintColor: colors.color333}]}
                    icon={require('../../img/Home/icon_homepage_search.png')}
                    onPress={() => { navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {updatedCallback}) }}/>
            </View>
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            storeId: this.props.global.currStoreId,
            fnPriceControlled: false,
            strictProviding: false,
            goods: [],
            page: 1,
            pageNum: 50,
            categories: [],
            isLoading: false,
            isLoadingMore: false,
            onSubmitting: false,
            loadingCategory: true,
            errorMsg: null,
            isLastPage: false,
            selectedTagId: '',
            selectedChildTagId: '',
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
        const {accessToken} = this.props.global;
        const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.navigation.state.params || {};
        this.props.navigation.dispatch(NavigationActions.setParams({
            params: {updatedCallback: this.doneProdUpdate},
            key: this.props.navigation.state.key
        }))

        const {global, dispatch} = this.props
        simpleStore(global, dispatch, (store) => {
            this.setState({fnPriceControlled: store['fn_price_controlled']})
            this.fetchCategories(store.id, prod_status, accessToken)
        })

    }

    fetchCategories(storeId, prod_status, accessToken) {
        const hideAreaHot = prod_status ? 1 : 0;
        HttpUtils.get.bind(this.props)(`/api/list_store_prod_tags/${storeId}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
            this.setState({categories: res, selectedTagId: res[0] ? res[0].id : null, loadingCategory: false, isLoading: true},
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
        const params = {
            vendor_id: currVendorId,
            tagId: this.state.selectedChildTagId ? this.state.selectedChildTagId : this.state.selectedTagId,
            page: this.state.page,
            pageNum: this.state.pageNum,
            storeId: storeId,
        }

        if (storeId) {
            params['hideAreaHot'] = 1;
            params['limit_status'] = (prod_status || []).join(",");
        }

        const url = `/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`;
        HttpUtils.get.bind(this.props)(url, params).then(res => {
            const totalPage = res.count / res.pageSize
            const isLastPage = res.page >= totalPage
            const goods = res.page == 1 ? res.lists : this.state.goods.concat(res.lists)
            this.setState({goods: goods, isLastPage: isLastPage, isLoading: false, isLoadingMore: false})
        },(ok, reason, obj) => {
            this.setState({isLoading: false, errorMsg: reason, isLoadingMore: false})
        })
    }

    doneProdUpdate = (pid, prodFields, spFields) => {
        const idx = this.state.goods.findIndex(g => g.id === pid);
        const item = this.state.goods[idx];
        console.log("doneProdUpdate find ", item, "index", idx, prodFields, spFields)

        const removal = `${spFields.status}` === `${Cts.STORE_PROD_OFF_SALE}`
        if (removal) {
            this.state.goods.splice(idx, 1)
            console.log("doneProdUpdate remove at index", idx)
        } else {
            Object.keys(prodFields).map(k => {
                item[k] = prodFields[k]
            })
            Object.keys(spFields).map(k => {
                item['sp'][k] = spFields[k]
            })

            console.log("doneProdUpdate updated", item, "index", idx)

            this.state.goods[idx] = item;
        }
        this.setState({goods: this.state.goods})
    }

    onRefresh() {
        this.setState({page: 1, goods: [], isLoadingMore: true}, () => this.search())
    }

    onLoadMore() {
        let page = this.state.page
        this.setState({page: page + 1}, () => this.search())
    }

    onSelectCategory(category) {
        this.setState({
            selectedTagId: category.id,
            selectedChildTagId: '',
            page: 1,
            onlineType: 'browse',
            isLoading: true,
            goods: []
        }, () => this.search())
    }

    resetModal = () => {
        this.setState({
            modalVisible: false,
            modalType: '',
            selectedProduct: {},
        })
    }

    onOpenModal(modalType, product) {
        const p = product ? product : {};
        this.setState({
            modalVisible: true,
            modalType: modalType,
            selectedProduct: p,
            setPrice: this.supplyPriceInYuan(p),
            offOption: Cts.RE_ON_SALE_MANUAL
        })
    }

    supplyPriceInYuan(p) {
        return parseFloat((p.sp || {}).supply_price / 100).toFixed(2);
    }

    applyingPriceInYuan(p) {
        return parseFloat((p.sp || {}).applying_price/ 100).toFixed(2);
    }

    changeRowExist(idx, supplyPrice) {
        const products = this.state.goods
        products[idx].is_exist = {supply_price: supplyPrice, status: 1}
        this.setState({goods: products})
    }

    gotoGoodDetail = (pid) => {
        this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
            pid: pid,
            storeId: this.state.storeId,
            updatedCallback: this.doneProdUpdate
        })
    }

    renderRow = (product, idx) => {
        const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
        return <GoodListItem product={product} key={idx} onPressImg={() => this.gotoGoodDetail(product.id)}
                opBar={<View style={[Styles.rowcenter, {flex: 1, padding: 5, backgroundColor: colors.white, borderTopWidth: pxToDp(1), borderColor: colors.colorDDD}]}>
                                 {onSale &&
                                 <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('off_sale', product)}>
                                     <Text>下架</Text>
                                 </TouchableOpacity>}

                                 {!onSale &&
                                 <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('on_sale', product)}>
                                     <Text>上架</Text>
                                 </TouchableOpacity>}

                                 <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]} onPress={() => this.onOpenModal('set_price', product)}>
                                     <Text>报价</Text>
                                 </TouchableOpacity>
                             </View>}
        />
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
        const selectCategoryId = this.state.selectedTagId
        const isActive = selectCategoryId === category.id
        return (
            <TouchableOpacity key={category.id} onPress={() => this.onSelectCategory(category)}>
                <View style={[isActive ? styles.categoryItemActive : styles.categoryItem]}>
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

    renderChildrenCategories(){
        if (!this.state.selectedTagId){
            return
        }
        const selectedCategory = this.state.categories.find(category => `${category.id}` === `${this.state.selectedTagId}`)
        if (selectedCategory.children.length){
            {/* TODO 需要定制子分类的样式*/}
            return (
                <View style={[Styles.categoryBox]}>
                    <ScrollView
                        style={{marginBottom: 1, marginLeft: 1}}
                        horizontal={true}
                        showsHorizontalScrollIndicator={true}>
                        {selectedCategory.children.map(childCategory => {
                            return this.renderChildCategory(childCategory)
                        })}
                    </ScrollView>
                </View>
            )
        }
    }

    renderChildCategory(childCategory){
        const isActive = this.state.selectedChildTagId === childCategory.id
        let itemStyle = [styles.categoryItem, isActive && {backgroundColor: '#fff', borderTopWidth: pxToDp(10), borderTopColor: color.theme,}];
        return (
            <TouchableOpacity key={childCategory.id} onPress={() => this.onSelectChildCategory(childCategory)}
                              style={[itemStyle, {padding: 10, backgroundColor: colors.white, marginLeft: 2 }]}>
                <Text style={Styles.n2grey6}>{childCategory.name}</Text>
            </TouchableOpacity>
        )
    }

    onSelectChildCategory(childCategory){
        this.setState({
            selectedChildTagId: childCategory.id,
            page: 1,
            onlineType: 'browse',
            isLoading: true,
            goods: []
        }, () => this.search())
    }

    onOnSale = () => {
        const accessToken = this.props.global.accessToken;
        const storeId = this.state.storeId
        if (this.state.selectedProduct && this.state.selectedProduct.sp) {
            const pid = this.state.selectedProduct.id
            const currStatus = this.state.selectedProduct.sp.status
            const destStatus = Mapping.Product.STORE_PRODUCT_STATUS.ON_SALE.value

            this.setState({onSubmitting: true})
            const url = `/api/store_chg_status/${storeId}/${pid}/${currStatus}/${destStatus}?access_token=${accessToken}`;
            HttpUtils.post.bind(this.props)(url).then(res => {
                this.setState({onSubmitting: false})
                this.doneProdUpdate(pid, {}, {status: destStatus})
            }, (ok, reason, obj) => {
                this.setState({onSubmitting: false, errorMsg: `上架失败：${reason}`})
            })
            this.resetModal()
        }
    }

    onOffSale = () => {
        const accessToken = this.props.global.accessToken;
        if (this.state.selectedProduct && this.state.selectedProduct.sp) {
            const pid = this.state.selectedProduct.id
            const option = this.state.offOption
            const spId = this.state.selectedProduct.sp.id;
            const url = `/api/chg_item_when_on_sale/${spId}/${option}?access_token=${accessToken}`;

            this.setState({onSubmitting: true})
            HttpUtils.post.bind(this.props)(url).then(res => {
                this.setState({onSubmitting: false})
                this.doneProdUpdate(pid, {}, {status: res.destStatus})
            }, (ok, reason, obj) => {
                this.setState({onSubmitting: false, errorMsg: `下架失败：${reason}`})
            })
            this.resetModal()
        }
    }

    onChangeGoodsPrice = () => {
        const p = this.state.selectedProduct;
        console.log("start updating ", p, this.state.setPrice)
        if (p && p.sp && p.id > 0 && this.state.setPrice !== '' && this.state.setPrice >= 0) {
            console.log("start updating ", p, this.state.setPrice)
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
                this.doneProdUpdate(p.id, {}, {applying_price: applyPrice})
            }, (ok, reason, obj) => {
                this.setState({onSubmitting: false, errorMsg: `改价失败：${reason}`})
            })
            this.resetModal()
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
                    {this.renderChildrenCategories()}
                    <If condition={this.state.goods && this.state.goods.length}>
                        <LoadMore
                            loadMoreType={'scroll'}
                            renderList={this.renderList()}
                            onRefresh={() => this.onRefresh()}
                            onLoadMore={() => this.onLoadMore()}
                            isLastPage={this.state.isLastPage}
                            isLoading={this.state.isLoadingMore}
                            loadMoreBtnText={'加载更多'}
                        />
                    </If>

                    <If condition={!(this.state.goods && this.state.goods.length) && !this.state.isLoading && !this.state.isLoadingMore}>
                        <NoFoundDataView/>
                    </If>
                </View>}

                <BottomModal title={'上架'} actionText={'确认上架'} onPress={this.onOnSale} onClose={this.resetModal}
                             visible={this.state.modalVisible && this.state.modalType === 'on_sale'}>
                    <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{this.state.selectedProduct.name}</Text>
                </BottomModal>

                <BottomModal title={'下架'} actionText={'确认修改'} onPress={this.onOffSale} onClose={this.resetModal}
                             visible={this.state.modalVisible && this.state.modalType === 'off_sale'}>
                    <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{this.state.selectedProduct.name}</Text>
                    <SegmentedControl values={['改为缺货', '从本店删除']} onChange={e => {
                        const idx = e.nativeEvent.selectedSegmentIndex
                        this.setState({offOption: idx === 1 ? Cts.RE_ON_SALE_NONE : Cts.RE_ON_SALE_MANUAL})
                    }}/>
                    <WhiteSpace/>
                    {this.state.offOption !== Cts.RE_ON_SALE_NONE && <View>
                        <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_OFF_WORK} onChange={(e)=>{
                            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_OFF_WORK : Cts.RE_ON_SALE_MANUAL})
                        }}>打烊后自动上架</AgreeItem>
                        <WhiteSpace/>
                        <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_MANUAL} onChange={e => {
                            this.setState({offOption: Cts.RE_ON_SALE_MANUAL})
                        }}>不要自动上架</AgreeItem>
                        <WhiteSpace/>
                        {this.state.strictProviding && <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_PROVIDED} onChange={e => {
                            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_PROVIDED: Cts.RE_ON_SALE_MANUAL})
                        }}>订货送到后自动上架</AgreeItem>}
                        <WhiteSpace/>
                    </View>}

                    {this.state.offOption === Cts.RE_ON_SALE_NONE && <View>
                        <Text style={[Styles.n2, {paddingLeft: 10}]}>从本店的各个平台渠道下架, 并删除本品</Text>
                        <WhiteSpace size={'lg'}/>
                    </View>}
                </BottomModal>

                <BottomModal title={'报价'} actionText={'确认修改'} onPress={this.onChangeGoodsPrice} onClose={this.resetModal}
                             visible={this.state.modalVisible && this.state.modalType === 'set_price'}>
                    <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{this.state.selectedProduct.name}</Text>
                    <Left title="报价" placeholder="" required={true} value={this.state.setPrice} type="numeric"
                          right={<Text style={Styles.n2}>元</Text>}
                          textInputAlign='right'
                          textInputStyle={[Styles.n2, {marginRight: 10, height: 40}]}
                          onChangeText={text => this.setState({setPrice: text})}/>
                </BottomModal>

                <Dialog onRequestClose={() => {}} visible={!!this.state.errorMsg}
                        buttons={[{
                            type: 'default',
                            label: '知道了',
                            onPress: () => { this.setState({errorMsg: ''}) }}]}>
                    <View> <Text style={{color: '#000'}}>{this.state.errorMsg}</Text></View>
                </Dialog>

                <Toast icon="loading" show={this.state.loadingCategory} onRequestClose={() => { }}>加载中</Toast>
                <Toast icon="loading" show={this.state.onSubmitting} onRequestClose={() => { }}>提交中</Toast>
                <Toast icon="loading" show={this.state.isLoading} onRequestClose={() => {}}/>
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsList);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    },
    categoryBox: {
        width: pxToDp(160),
        backgroundColor: colors.colorEEE,
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
    toOnlineBtn: {
        borderRightWidth: pxToDp(1),
        borderColor: colors.colorDDD,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    }
})
