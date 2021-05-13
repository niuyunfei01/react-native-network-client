import React, {Component} from "react"
import {View, Text} from "react-native"
import {connect} from "react-redux"
import Config from "../../config"
import tool from "../../common/tool"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {SearchBar} from "@ant-design/react-native"
import Styles from "../../themes/Styles";
import Cts from "../../Cts";
import GoodListItem from "../component/GoodListItem";
import Toast from "../../weui/Toast/Toast";


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
    constructor(props) {
        super(props);
        const {limit_store} = this.props.route.params;

        this.state = {
            storeId: limit_store ? limit_store : this.props.global.currStoreId,
            fnPriceControlled: false,
            goods: [],
            page: 1,
            pageNum: Cts.GOODS_SEARCH_PAGE_NUM,
            isLoading: false,
            isLastPage: false,
            selectTagId: 0,
            searchKeywords: '',
            showNone: false
        }
        this.props.navigation.setOptions({
            headerTitle: '商品搜索',
        })
    }

    search = (showLoading = false) => {
        const term = this.state.searchKeywords ? this.state.searchKeywords : '';
        if (term) {
            const accessToken = this.props.global.accessToken;
            const {currVendorId} = tool.vendor(this.props.global);
            const {type, limit_store, prod_status} = this.props.route.params;
            let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
            this.setState({isLoading: true, showLoading})
            const params = {
                vendor_id: currVendorId,
                tagId: this.state.selectTagId,
                page: this.state.page,
                pageSize: this.state.pageNum,
                name: term,
                storeId: storeId,
            }
            if (limit_store) {
                params['hideAreaHot'] = 1;
                params['limit_status'] = (prod_status || []).join(",");
            }

            HttpUtils.get.bind(this.props)(`/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`, params).then(res => {
                const totalPage = res.count / res.pageSize
                const isLastPage = res.page >= totalPage
                const goods = Number(res.page) === 1 ? res.lists : this.state.goods.concat(res.lists)
                this.setState({
                    goods: goods,
                    isLastPage: isLastPage,
                    isLoading: false,
                    showLoading: false,
                    showNone: !res.lists
                })
            })
        } else {
            this.setState({goods: [], isLastPage: true})
            if (limit_store) {
                params['hideAreaHot'] = 1;
                params['limit_status'] = (prod_status || []).join(",");

            }
        }
    }

    onRefresh() {
        this.setState({page: 1}, () => this.search(true))
    }

    onLoadMore() {
        let page = this.state.page
        this.setState({page: page + 1}, () => this.search(true))
    }

    onDoneProdUpdate = (pid, prodFields, spFields) => {

        const {updatedCallback} = (this.props.route.params || {})
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

    onChange = (searchKeywords: any) => {
        console.log("onChange: searchKeywords:", searchKeywords)
        const toUpdate = { searchKeywords };
        if (this.state.searchKeywords !== searchKeywords) {
            toUpdate.page = 1
        }
        this.setState(toUpdate, () => {
            this.search(false)
        });
    }

    onCancel = () => {
        this.setState({ searchKeywords: '', goods: []});
    }

    renderSearchBar = () => {
        return <SearchBar placeholder="请输入产品名称" value={this.state.searchKeywords} onChange={this.onChange}
                           onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
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
                    <If condition={this.state.showNone && !this.state.isLoading}>
                        <NoFoundDataView/>
                    </If>

                    <Toast icon="loading" show={this.state.showLoading} onRequestClose={() => {}}>加载中</Toast>
                </View>
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsSearch)
