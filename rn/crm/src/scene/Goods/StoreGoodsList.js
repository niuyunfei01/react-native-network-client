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
import {Dialog} from "../../weui/index";
import {NavigationItem} from "../../widget";
import Cts from "../../Cts";
import Toast from "../../weui/Toast/Toast";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";
import {NavigationActions} from "react-navigation";
import GoodListItem from "../component/GoodListItem";
import GoodItemEditBottom from "../component/GoodItemEditBottom";
import DropDownPicker from 'react-native-dropdown-picker'


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
        const {params} = navigation.state;

        const onChangeStatus = value => {
            params.search(value.value)
        }
        const statuses = [
            {
                label: '全部',
                value: '',
            },
            {
                label: '在售',
                value: Cts.STORE_PROD_ON_SALE,
            },
            {
                label: '缺货',
                value: Cts.STORE_PROD_SOLD_OUT
            }
        ];
        let selectedStatus = ''
        return {
            headerTitle: '商品列表',
            headerRight: (<View style={[Styles.endcenter, {height: pxToDp(60)}]}>
                    <DropDownPicker
                        items={statuses}
                        defaultValue={selectedStatus}
                        containerStyle={{height: 40}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                            justifyContent: 'flex-start'
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => onChangeStatus}
                    />
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
            pageNum: Cts.GOODS_SEARCH_PAGE_NUM,
            categories: [],
            isLoading: false,
            isLoadingMore: false,
            loadingCategory: true,
            errorMsg: null,
            isLastPage: false,
            selectedTagId: '',
            selectedChildTagId: '',
            modalType: '',
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
        this.props.navigation.setParams({search: this.onSelectStatus})

    }

    fetchCategories(storeId, prod_status, accessToken) {
        const hideAreaHot = prod_status ? 1 : 0;
        HttpUtils.get.bind(this.props)(`/api/list_store_prod_tags/${storeId}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
            this.setState({categories: res, selectedTagId: res[0] ? res[0].id : null, loadingCategory: false, isLoading: true},
                () => this.search()
            )
        }, (res) => {
            this.setState({loadingCategory: false, loadCategoryError: res.reason || '加载分类信息错误'})
        })
    }

    search = () => {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        const {prod_status} = this.props.navigation.state.params || {};

        let storeId = this.state.storeId;
        const params = {
            vendor_id: currVendorId,
            status: this.state.selectedStatus,
            tagId: this.state.selectedChildTagId ? this.state.selectedChildTagId : this.state.selectedTagId,
            page: this.state.page,
            pageSize: this.state.pageNum,
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
        },(res) => {
            this.setState({isLoading: false, errorMsg: res.reason, isLoadingMore: false})
        })
    }

    doneProdUpdate = (pid, prodFields, spFields) => {
        const idx = this.state.goods.findIndex(g => `${g.id}` === `${pid}`);
        const item = this.state.goods[idx];

        const removal = `${spFields.status}` === `${Cts.STORE_PROD_OFF_SALE}`
        if (removal) {
            this.state.goods.splice(idx, 1)
        } else {
            Object.keys(prodFields).map(k => {
                item[k] = prodFields[k]
            })
            Object.keys(spFields).map(k => {
                item['sp'][k] = spFields[k]
            })

            this.state.goods[idx] = item;
        }
        this.setState({goods: this.state.goods})
    }

    onRefresh() {
        this.setState({page: 1, goods: [], isLoadingMore: true}, () => this.search())
    }

    onLoadMore() {
        let page = this.state.page
        this.setState({page: page + 1, isLoadingMore: true}, () => this.search())
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


    onOpenModal(modalType, product) {
        this.setState({
            modalType: modalType,
            selectedProduct: product ? product : {},
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

    onSelectStatus = (status) => {
        this.setState({
            selectedStatus: status,
            page: 1,
            onlineType: 'browse',
            isLoading: true,
            goods: [],
        }, () => this.search())
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

    render() {
        const p = this.state.selectedProduct;
        const sp = this.state.selectedProduct.sp;
        const accessToken = this.props.global.accessToken;
        const storeId = this.state.storeId;

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


                <Dialog onRequestClose={() => {}} visible={!!this.state.errorMsg}
                        buttons={[{
                            type: 'default',
                            label: '知道了',
                            onPress: () => { this.setState({errorMsg: ''}) }}]}>
                    <View> <Text style={{color: '#000'}}>{this.state.errorMsg}</Text></View>
                </Dialog>

                {sp && <GoodItemEditBottom key={sp.id} pid={parseInt(p.id)} modalType={this.state.modalType}
                                           productName={p.name}
                                           strictProviding={false} accessToken={accessToken} storeId={storeId}
                                           currStatus={sp.status}
                                           doneProdUpdate={this.doneProdUpdate}
                                           onClose={() => this.setState({modalType: ''})}
                                           spId={sp.id} applyingPrice={parseInt(sp.applying_price || sp.supply_price)}
                                           beforePrice={sp.supply_price}/>}

                <Toast icon="loading" show={this.state.loadingCategory} onRequestClose={() => { }}>加载中</Toast>
                <Toast icon="loading" show={this.state.isLoading || this.state.isLoadingMore} onRequestClose={() => {}}/>
            </View>
        )
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
