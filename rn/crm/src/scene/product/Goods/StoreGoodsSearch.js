import React, {Component} from "react"
import {Alert, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import Config from "../../../pubilc/common/config"
import tool from "../../../pubilc/util/tool"
import HttpUtils from "../../../pubilc/util/http"
import Cts from "../../../pubilc/common/Cts";
import GoodListItem from "../../../pubilc/component/goods/GoodListItem";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import Scanner from "../../../pubilc/component/Scanner";
import {hideModal, showError, showModal} from "../../../pubilc/util/ToastUtils";
import {SvgXml} from "react-native-svg";
import {scan} from "../../../svg/svg";

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

class StoreGoodsSearch extends Component {
  constructor(props) {
    super(props);
    const {limit_store, searchKeywords = ''} = this.props.route.params;

    this.state = {
      storeId: limit_store ? limit_store : this.props.global.currStoreId,
      fnPriceControlled: false,
      goods: [],
      page: 1,
      pageNum: Cts.GOODS_SEARCH_PAGE_NUM,
      isLoading: false,
      isLastPage: false,
      selectTagId: 0,
      searchKeywords: searchKeywords,
      showNone: false,
      selectedProduct: {},
      modalType: '',
      showScan: false,
      isCanLoadMore: false
    }
  }

  componentDidMount() {

    const {searchKeywords} = this.state

    if (searchKeywords)
      this.search()
  }

  search = () => {
    showModal('加载中')

    tool.debounces(() => {
      const {searchKeywords, selectTagId, page, pageNum} = this.state
      const {type, limit_store, prod_status} = this.props.route.params;
      let params = {};
      if (searchKeywords) {
        const accessToken = this.props.global.accessToken;
        const {currVendorId} = tool.vendor(this.props.global);
        let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
        params = {
          vendor_id: currVendorId,
          tagId: selectTagId,
          page: page,
          pageSize: pageNum,
          storeId: storeId,
        }
        if ('upc' === codeType || !isNaN(parseFloat(searchKeywords)) && isFinite(searchKeywords))
          params['upc'] = searchKeywords
        else params['name'] = searchKeywords
        if (limit_store) {
          params['hideAreaHot'] = 1;
          params['limit_status'] = (prod_status || []).join(",");
        }

        HttpUtils.get.bind(this.props)(`/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`, params).then(res => {

          hideModal()
          const totalPage = res.count / res.pageSize
          const isLastPage = res.page >= totalPage
          const goods = Number(res.page) === 1 ? res.lists : this.state.goods.concat(res.lists)
          this.setState({
            goods: goods,
            isLastPage: isLastPage,
            isLoading: false,
            showNone: !res.lists
          })
        })
      } else {

        hideModal()
        this.setState({goods: [], isLoading: false, isLastPage: true})
        if (limit_store) {
          params['hideAreaHot'] = 1;
          params['limit_status'] = (prod_status || []).join(",");
        }
      }
      Keyboard.dismiss()
    }, 1000)
  }

  onRefresh = () => {
    this.setState({page: 1}, () => this.search())
  }

  onLoadMore = () => {
    let {page, isLastPage, isLoading, isCanLoadMore} = this.state
    if (!isCanLoadMore)
      return;
    if (isLastPage) {
      showError('没有更多商品')
      this.setState({isCanLoadMore: false})
      return
    }
    if (isLoading)
      return;
    this.setState({page: page + 1, isLoading: true, isCanLoadMore: false}, () => this.search())
  }

  onChange = (searchKeywords: any) => {
    codeType = 'search'
    const toUpdate = {searchKeywords};
    if (this.state.searchKeywords !== searchKeywords) {
      toUpdate.page = 1
    }
    this.setState(toUpdate);
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
      <View style={{flexDirection: 'row', alignItems: 'center', margin: 10, flex: 1}}>
        <TextInput value={this.state.searchKeywords}
                   style={{padding: 8, backgroundColor: colors.white, flex: 3, borderRadius: 4}}
                   onChangeText={this.onChange}
                   placeholder={'请输入商品名称、SKU或UPC'}
                   clearButtonMode={'while-editing'}
                   placeholderTextColor={colors.color999}
                   onSubmitEditing={this.search}
                   returnKeyType={'search'}/>
        <If condition={this.state.searchKeywords}>
          <Text onPress={this.search} style={{padding: 4, color: colors.color333, fontSize: 14}}>
            搜索
          </Text>
        </If>
        <SvgXml xml={scan()} onPress={this.scanGoodId} style={{padding: 4, flex: 1}}/>
      </View>
    )
  }
  gotoAddMissingPicture = (item) => {
    this.props.navigation.navigate(Config.ROUTE_ADD_MISSING_PICTURE, {goodsInfo: item})
  }
  opBar = (onSale, onStrict, product, price_type) => {
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
        <If condition={price_type}>
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
        <If condition={!price_type}>
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
  renderRow = ({item}) => {
    const {price_type} = this.props.global.vendor_info
    const onSale = (item.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (item.sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return <GoodListItem onPressImg={() => this.gotoGoodDetail(item.id)} product={item}
                         modalType={this.state.modalType}
                         price_type={price_type || 0}
                         onPressRight={() => this.gotoGoodDetail(item.id)}
                         fnProviding={onStrict}
                         opBar={this.opBar(onSale, onStrict, item, price_type)}/>
  }

  jumpToNewRetailPriceScene = (id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_RETAIL_PRICE_NEW, {productId: id})
  }
  gotoGoodDetail = (pid) => {
    this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
      pid: pid,
      storeId: this.state.storeId,
      //updatedCallback: this.doneProdUpdate
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
  _keyExtractor = (item) => {
    return item.id.toString();
  }
  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }
  renderNoProduct = () => {
    const {searchKeywords, goods, isLoading, showNone} = this.state
    if (showNone && !isLoading)
      return (
        <View style={styles.notGoodTip}>
          {
            tool.length(searchKeywords) > 0 && tool.length(goods) <= 0 ?
              <Text style={{fontSize: 12, color: colors.color333}}>您未添加" {searchKeywords} "这个商品</Text> :
              <Text style={{fontSize: 12, color: colors.color333}}>暂时没有商品</Text>
          }
        </View>
      )
  }
  onScrollBeginDrag = () => {
    this.setState({isCanLoadMore: true})
  }

  render() {
    const {selectedProduct, showScan, goods, modalType} = this.state;
    const {sp} = selectedProduct;
    const {accessToken} = this.props.global;
    const onStrict = (sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return (
      <View style={styles.page}>
        <Scanner onClose={this.onClose}
                 visible={showScan}
                 title="退出扫码"
                 onScanSuccess={code => this.onScanSuccess(code)}
                 onScanFail={code => this.onScanFail(code)}/>
        {this.renderSearchBar()}

        <View style={styles.goodsWrap}>
          <FlatList data={goods}
                    renderItem={this.renderRow}
                    initialNumToRender={5}
                    onRefresh={this.onRefresh}
                    refreshing={false}
                    keyExtractor={this._keyExtractor}
                    getItemLayout={this._getItemLayout}
                    onScrollBeginDrag={this.onScrollBeginDrag}
                    onEndReachedThreshold={0.2}
                    onEndReached={this.onLoadMore}
          />

          {this.renderNoProduct()}

          {sp && <GoodItemEditBottom key={sp.id} pid={Number(selectedProduct.id)} modalType={modalType}
                                     productName={selectedProduct.name}
                                     skuName={selectedProduct.sku_name}
                                     strictProviding={onStrict} accessToken={accessToken}
                                     storeId={Number(this.props.global.currStoreId)}
                                     currStatus={Number(sp.status)}
                                     doneProdUpdate={this.doneProdUpdate}
                                     onClose={this.closeModal}
                                     spId={Number(sp.id)}
                                     applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                     navigation={this.props.navigation}
                                     storePro={selectedProduct}
                                     beforePrice={Number(sp.supply_price)}/>}

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    flex: 1,
  },
  goodsWrap: {
    flex: 10,
    flexDirection: "column",
  },
  notGoodTip: {
    paddingVertical: 9,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
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
