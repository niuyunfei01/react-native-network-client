import React, {Component} from "react"
import {View} from "react-native"
import {connect} from "react-redux"
import Config from "../../config"
import tool from "../../common/tool"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {SearchBar} from "antd-mobile-rn"
import Styles from "../../themes/Styles";
import Cts from "../../Cts";
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
            isLoading: false,
            isLastPage: false,
            selectTagId: 0,
            searchKeywords: '',
        }
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

        const {updatedCallback} = (this.props.navigation.state.params || {})
        updatedCallback && updatedCallback(pid, prodFields, spFields)

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
        return <GoodListItem key={idx} onPressImg={() => this.gotoGoodDetail(product.id)} product={product} onPressRight={()=>this.gotoGoodDetail(product.id)}/>
    }

    gotoGoodDetail = (pid) => {
        this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
            pid: pid,
            storeId: this.state.storeId,
            updatedCallback: this.doneProdUpdate
        })
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

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsSearch)
