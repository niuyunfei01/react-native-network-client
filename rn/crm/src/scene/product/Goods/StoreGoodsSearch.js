import React, {Component} from "react"
import {StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import Config from "../../../pubilc/common/config"
import tool from "../../../pubilc/common/tool"
import HttpUtils from "../../../pubilc/util/http"
import NoFoundDataView from "../../common/component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {SearchBar} from "@ant-design/react-native"
import Cts from "../../../pubilc/common/Cts";
import GoodListItem from "../../../pubilc/component/goods/GoodListItem";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../util/pxToDp";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";


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
      showNone: false,
      selectedProduct: {},
      modalType: '',
    }
  }

  search = (showLoading = false) => {
    tool.debounces(() => {
      const term = this.state.searchKeywords ? this.state.searchKeywords : '';
      const {type, limit_store, prod_status} = this.props.route.params;
      if (term) {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
        this.setState({isLoading: true, showLoading})
        // showModal('加载中')
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
    }, 1000)
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
    const toUpdate = {searchKeywords};
    if (this.state.searchKeywords !== searchKeywords) {
      toUpdate.page = 1
    }
    this.setState(toUpdate, () => {
      this.search(true)
    });
  }

  onCancel = () => {
    this.setState({searchKeywords: '', goods: []});
  }

  doneProdUpdate(pid, prodFields, spFields) {
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

  onOpenModal(modalType, product) {
    this.setState({
      modalType: modalType,
      selectedProduct: product ? product : {},
    })
  }

  renderSearchBar = () => {
    return <SearchBar placeholder="请输入产品名称" value={this.state.searchKeywords} onChange={this.onChange}
                      onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
  }

  renderRow = (product, idx) => {
    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onOpen = (product.sp || {}).status !== `${Cts.STORE_PROD_ON_SALE}`;
    return <GoodListItem key={idx} onPressImg={() => this.gotoGoodDetail(product.id)} product={product} modalType={this.state.modalType}
                         onPressRight={() => this.gotoGoodDetail(product.id)}
                         opBar={<View style={[styles.row_center, {
                           flex: 1,
                           padding: 5,
                           backgroundColor: colors.white,
                           borderTopWidth: pxToDp(1),
                           borderColor: colors.colorDDD
                         }]}>

                           {onSale ?
                               <TouchableOpacity style={[styles.toOnlineBtn]}
                                                 onPress={() => this.onOpenModal('off_sale', product)}>
                                 <Text>下架 </Text>
                               </TouchableOpacity> :
                               <TouchableOpacity style={[styles.toOnlineBtn]}
                                                 onPress={() => this.onOpenModal('on_sale', product)}>
                                 <Text>上架 </Text>
                               </TouchableOpacity>}

                           {onOpen ?
                               <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                                                 onPress={() => this.onOpenModal('set_price', product)}>
                                 <Text>报价 </Text>
                               </TouchableOpacity> :
                               <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                                                 onPress={() => this.onOpenModal('set_price_add_inventory', product)}>
                                 <Text>价格/库存 </Text>
                               </TouchableOpacity>
                           }

                         </View>}/>
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
    const p = this.state.selectedProduct;
    const sp = this.state.selectedProduct.sp;
    let {accessToken} = this.props.global;
    return (
        <View style={{
          flexDirection: "column",
          flex: 1,
          maxHeight: 6000
        }}>
          {this.renderSearchBar()}
          {/*<ScrollView>*/}
          <View style={{
            flexDirection: "column",
            paddingBottom: 80
          }}>
            {this.state.goods && this.state.goods.length ? (
                <View>
                  <LoadMore
                      loadMoreType={'scroll'}
                      renderList={this.renderList()}
                      onRefresh={() => this.onRefresh()}
                      onLoadMore={() => this.onLoadMore()}
                      isLastPage={this.state.isLastPage}
                      isLoading={this.state.isLoading}
                      scrollViewStyle={{
                        paddingBottom: 5,
                        marginBottom: 0
                      }}
                      indicatorText={'加载中'}
                      bottomLoadDistance={10}
                  />
                  <View style={{
                    paddingVertical: 9,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    flex: 1
                  }}>
                    {this.state.isLastPage ? <Text>没有更多商品了 </Text> : <Text></Text>}
                  </View>
                </View>
            ) : (<View style={{
              paddingVertical: 9,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: '40%',
              flex: 1
            }}>
              {this.state.searchKeywords ? (<Text>没有找到" {this.state.searchKeywords} "这个商品</Text>) : (
                  <Text>暂时没有商品</Text>)}
            </View>)}

            <If condition={this.state.showNone && !this.state.isLoading}>
              <NoFoundDataView/>
            </If>

            {sp && <GoodItemEditBottom key={sp.id} pid={Number(p.id)} modalType={this.state.modalType}
                                       productName={p.name}
                                       strictProviding={false} accessToken={accessToken}
                                       storeId={Number(this.props.global.currStoreId)}
                                       currStatus={Number(sp.status)}
                                       doneProdUpdate={this.doneProdUpdate.bind(this)}
                                       onClose={() => this.setState({modalType: ''})}
                                       spId={Number(sp.id)}
                                       applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                       navigation={this.props.navigation}
                                       beforePrice={Number(sp.supply_price)}/>}

          </View>
          {/*<ScrollView/>*/}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  toOnlineBtn: {
    borderRightWidth: pxToDp(1),
    borderColor: colors.colorDDD,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  row_center: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsSearch)
