import React, {Component} from "react"
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool from "../../common/tool"
import color from "../../widget/color"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache"
import Mapping from "../../Mapping"
import {SearchBar} from "antd-mobile-rn"
import Styles from "../../themes/Styles";
import Cts from "../../Cts";


function mapStateToProps(state) {
    const {global} = state
    return {global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch
    };
}

class StoreGoodsSearch extends Component {
    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        return {
            headerTitle: '商品搜索',
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
            searchKeywords: '',
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
            name: this.state.searchKeywords ? this.state.searchKeywords : '',
            storeId: storeId,
        }
        if (limit_store) {
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

    changeRowExist(idx, supplyPrice) {
        const products = this.state.goods
        products[idx].sp = {supply_price: supplyPrice, status: 1}
        this.setState({goods: products})
    }

    showOnlineBtn(product) {
        return !product.sp
            || Mapping.Tools.ValueEqMapping(Mapping.Product.STORE_PRODUCT_STATUS.OFF_SALE.value, product.sp.status)
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

    onSearch(val) {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        const {prod_status} = this.props.navigation.state.params || {};

        let storeId = this.state.storeId;
        this.setState({isLoading: true, searchKeywords: val})
        const params = {
            vendor_id: currVendorId,
            tagId: this.state.selectTagId,
            page: this.state.page,
            pageNum: this.state.pageNum,
            storeId: storeId,
            name: val
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

    onDoneProdUpdate = (pid, prodFields, spFields) => {
        const productIndex = this.state.goods.findIndex(g => g.id === pid);
        let product = this.state.goods[productIndex]
        const isRemoved = `${spFields.status}` === `${Cts.STORE_PROD_OFF_SALE}`

        if (isRemoved) {
            this.state.goods.splice(productIndex, 1)
        } else {
            product = {...product, ...prodFields}
            product.sp = {...product.sp, ...spFields}

            this.state.goods[productIndex] = product
        }

        this.setState({goods: this.state.goods})
    }

    renderSearchBar = () => {
        return (<SearchBar placeholder="请输入产品名称" onChange={(val) => this.onSearch(val)}/>)
    }

    renderRow = (product, idx) => {
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
                    callback: this.onDoneProdUpdate(),
                    pid: product.id
                })
            }}>
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
                            <View style={{flexDirection: 'row'}}>
                                <If condition={this.showSupplyPrice(product.sp)}>
                                    <View style={{marginRight: pxToDp(10)}}>
                                        <Text
                                            style={{color: color.orange}}>￥{tool.toFixed(product.sp.supply_price)}</Text>
                                    </View>
                                </If>
                                <View style={styles.isOnlineBtn}>
                                    <Text style={styles.isOnlineBtnText}>
                                        {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, product.sp.status)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
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

    render() {
        return (
            <View style={Styles.columnStart}>
                {this.renderSearchBar()}
                <View style={[Styles.columnStart]}>
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

                    <If condition={!(this.state.goods && this.state.goods.length) && this.state.searchKeywords}>
                        <NoFoundDataView/>
                    </If>
                </View>
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsSearch);

const styles = StyleSheet.create({
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
