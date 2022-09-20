import React, {Component} from "react"
import {Alert, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import Config from "../../../pubilc/common/config"
import tool from "../../../pubilc/util/tool"
import HttpUtils from "../../../pubilc/util/http"
import NoFoundDataView from "../../common/component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {SearchBar} from "@ant-design/react-native"
import Cts from "../../../pubilc/common/Cts";
import GoodListItem from "../../../pubilc/component/goods/GoodListItem";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import Ionicons from "react-native-vector-icons/Ionicons";
import Scanner from "../../../pubilc/component/Scanner";
import {showError} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

let codeType = 'search'
let isLoading = false

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
      showScan: false,
    }
  }

  search = () => {
    tool.debounces(() => {
      const {searchKeywords} = this.state
      const {type, limit_store, prod_status} = this.props.route.params;
      let params = {};
      if (searchKeywords) {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
        //showModal('加载中')

        params = {
          vendor_id: currVendorId,
          tagId: this.state.selectTagId,
          page: this.state.page,
          pageSize: this.state.pageNum,
          storeId: storeId,
        }
        if ('upc' === codeType || !isNaN(parseFloat(searchKeywords)) && isFinite(searchKeywords))
          params['upc'] = searchKeywords
        else params['name'] = searchKeywords
        if (limit_store) {
          params['hideAreaHot'] = 1;
          params['limit_status'] = (prod_status || []).join(",");
        }
        console.log('params', params)
        HttpUtils.get.bind(this.props)(`/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`, params).then(res => {

          const totalPage = res.count / res.pageSize
          const isLastPage = res.page >= totalPage
          const goods = Number(res.page) === 1 ? res.lists : this.state.goods.concat(res.lists)
          this.setState({
            goods: goods,
            isLastPage: isLastPage,
            isLoading: false,
            showNone: !res.lists
          })
          isLoading = false
        })
      } else {
        isLoading = false
        this.setState({goods: [], isLastPage: true})
        if (limit_store) {
          params['hideAreaHot'] = 1;
          params['limit_status'] = (prod_status || []).join(",");
        }
      }
    }, 1000)
  }

  onRefresh() {
    this.setState({page: 1}, () => this.search())
  }

  onLoadMore() {
    let {page, isLastPage} = this.state
    console.log('isLoading', isLoading, ' isLastPage', isLastPage)
    if (isLoading || isLastPage) {
      showError('没有更多商品')
      return
    }
    isLoading = true
    this.setState({page: page + 1}, () => this.search())
  }

  onChange = (searchKeywords: any) => {
    codeType = 'search'
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

  doneProdUpdate = (pid, prodFields, spFields) => {
    const {goods} = this.state
    const idx = goods.findIndex(g => `${g.id}` === `${pid}`);
    const item = goods[idx];
    const removal = `${spFields.status}` === `${Cts.STORE_PROD_OFF_SALE}`
    if (removal) {
      goods.splice(idx, 1)
    } else {
      Object.keys(prodFields).map(k => {
        item[k] = prodFields[k]
      })
      Object.keys(spFields).map(k => {
        item['sp'][k] = spFields[k]
      })
      goods[idx] = item;
    }
    this.setState({goods: goods})
  }

  onOpenModal(modalType, product) {
    this.setState({
      modalType: modalType,
      selectedProduct: product ? product : {},
    })
  }

  scanGoodId = () => {
    this.setState({showScan: true})
  }

  renderSearchBar = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 9}}>
          <SearchBar placeholder="请输入商品名称、SKU或UPC" value={this.state.searchKeywords} onChange={this.onChange}
                     onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
        </View>
        <Ionicons name={'scan-circle'} onPress={this.scanGoodId} style={{padding: 4}} size={36}/>
      </View>
    )
  }
  gotoAddMissingPicture = (item) => {
    this.props.navigation.navigate(Config.ROUTE_ADD_MISSING_PICTURE, {goodsInfo: item})
  }
  opBar = (onSale, onStrict, product) => {
    if ('' === product.coverimg) {
      return (
        <View style={[styles.row_center, styles.btnWrap]}>
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.gotoAddMissingPicture(product)}>
            <Text style={styles.goodsOperationBtn}>编辑</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={[styles.row_center, styles.btnWrap]}>

        {onSale ?
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.onOpenModal('off_sale', product)}>
            <Text style={{color: colors.color333}}>下架 </Text>
          </TouchableOpacity> :
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.onOpenModal('on_sale', product)}>
            <Text style={{color: colors.color333}}>上架 </Text>
          </TouchableOpacity>}
        <If condition={product.price_type === 1}>
          {onStrict ?
            <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                              onPress={() => this.jumpToNewRetailPriceScene(product.id)}>
              <Text style={{color: colors.color333}}>价格/库存 </Text>
            </TouchableOpacity> :
            <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                              onPress={() => this.jumpToNewRetailPriceScene(product.id)}>
              <Text style={{color: colors.color333}}>价格 </Text>
            </TouchableOpacity>
          }
        </If>
        <If condition={product.price_type === 0}>
          {onStrict ?
            <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                              onPress={() => this.onOpenModal('set_price_add_inventory', product)}>
              <Text style={{color: colors.color333}}>报价/库存 </Text>
            </TouchableOpacity> :
            <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                              onPress={() => this.onOpenModal('set_price', product)}>
              <Text style={{color: colors.color333}}>报价 </Text>
            </TouchableOpacity>
          }
        </If>

      </View>
    )
  }
  renderRow = (product, idx) => {
    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (product.sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return <GoodListItem key={idx} onPressImg={() => this.gotoGoodDetail(product.id)} product={product}
                         modalType={this.state.modalType}
                         price_type={product.price_type || 0}
                         onPressRight={() => this.gotoGoodDetail(product.id)}
                         fnProviding={onStrict}
                         opBar={this.opBar(onSale, onStrict, product)}/>
  }

  jumpToNewRetailPriceScene = (id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_RETAIL_PRICE_NEW, {productId: id})
  }
  gotoGoodDetail = (pid) => {
    this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
      pid: pid,
      storeId: this.state.storeId,
      updatedCallback: this.doneProdUpdate
    })
  }

  renderList() {
    const {goods} = this.state
    return goods.map((goods, index) => {
      return this.renderRow(goods, index)
    })

  }

  onClose = () => {
    this.setState({showScan: false})
  }

  onScanSuccess = (code) => {
    if (code) {
      codeType = 'upc'
      this.setState({searchKeywords: code});
      this.search(true)
    }
  }

  onScanFail = () => {
    Alert.alert('错误提示', '商品编码不合法', [
      {text: '确定', onPress: () => this.onClose},
    ]);
  }

  closeModal = () => {
    this.setState({modalType: ''})
  }

  render() {
    const p = this.state.selectedProduct;
    const sp = this.state.selectedProduct.sp;
    const {accessToken} = this.props.global;
    const {showScan, goods, searchKeywords, showNone, isLoading, modalType, isLastPage} = this.state
    const onStrict = (sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return (
      <View style={styles.page}>
        <Scanner onClose={this.onClose}
                 visible={showScan}
                 title="退出扫码"
                 onScanSuccess={code => this.onScanSuccess(code)}
                 onScanFail={code => this.onScanFail(code)}/>
        {this.renderSearchBar()}
        {/*<ScrollView>*/}
        <View style={styles.goodsWrap}>
          {
            goods && tool.length(goods) > 0 ?
              <View>
                <LoadMore
                  loadMoreType={'scroll'}
                  renderList={this.renderList()}
                  onRefresh={() => this.onRefresh()}
                  onLoadMore={() => this.onLoadMore()}
                  isLastPage={isLastPage}
                  isLoading={isLoading}
                  scrollViewStyle={{
                    paddingBottom: 5,
                    marginBottom: 0
                  }}
                  indicatorText={'加载中'}
                  bottomLoadDistance={10}
                />
                <View style={styles.notMoreTip}>
                  {isLastPage ? <Text style={{color: colors.color333}}>没有更多商品了 </Text> :
                    <Text style={{color: colors.color333}}></Text>}
                </View>
              </View> :
              <View style={styles.notGoodTip}>
                {
                  tool.length(searchKeywords) > 0 ?
                    <Text style={{color: colors.color333}}>您未添加" {searchKeywords} "这个商品</Text> :
                    <Text style={{color: colors.color333}}>暂时没有商品</Text>
                }
              </View>
          }

          <If condition={showNone && !isLoading}>
            <NoFoundDataView/>
          </If>

          {sp && <GoodItemEditBottom key={sp.id} pid={Number(p.id)} modalType={modalType}
                                     productName={p.name}
                                     skuName={p.sku_name}
                                     strictProviding={onStrict} accessToken={accessToken}
                                     storeId={Number(this.props.global.currStoreId)}
                                     currStatus={Number(sp.status)}
                                     doneProdUpdate={this.doneProdUpdate}
                                     onClose={this.closeModal}
                                     spId={Number(sp.id)}
                                     applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                     navigation={this.props.navigation}
                                     storePro={p}
                                     beforePrice={Number(sp.supply_price)}/>}

        </View>
        {/*<ScrollView/>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    flex: 1,
    maxHeight: 6000
  },
  goodsWrap: {
    flexDirection: "column",
    paddingBottom: 80
  },
  notGoodTip: {
    paddingVertical: 9,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: '40%'
  },
  notMoreTip: {
    paddingVertical: 9,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1
  },
  toOnlineBtn: {
    padding: 8,
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
  btnWrap: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopWidth: pxToDp(1),
    borderColor: colors.colorDDD
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsSearch)
