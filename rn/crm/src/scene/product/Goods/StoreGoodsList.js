import React, {Component} from "react"
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../../pubilc/util/pxToDp"
import Config from "../../../pubilc/common/config"
import HttpUtils from "../../../pubilc/util/http"
import Cts from "../../../pubilc/common/Cts";
import colors from "../../../pubilc/styles/colors";
import GoodListItem from "../../../pubilc/component/goods/GoodListItem";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import PropTypes from "prop-types";
import AntDesign from "react-native-vector-icons/AntDesign";
import Scanner from "../../../pubilc/component/Scanner";
import {addGoods, right, scan, search} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";
import * as globalActions from "../../../reducers/global/globalActions";
import {setSGCategory} from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import TopSelectModal from "../../../pubilc/component/TopSelectModal";

function mapStateToProps(state) {
  const {global} = state
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        setSGCategory,
        ...globalActions
      },
      dispatch
    )
  };
}

class StoreGoodsList extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.state = {
      goods: [],
      page: 1,
      statusList: [
        {label: '全部 0', value: 'all'},
        {label: '上架 0', value: 'in_stock'},
        {label: '下架 0', value: 'out_of_stock'},
        {label: '最近上新 0', value: 'new_arrivals'},

      ],
      showStatusList: [],
      showMoreGoodsStatus: false,
      pageNum: 20,
      categories: [],
      isLoading: false,
      loadingCategory: true,
      isLastPage: false,
      isCanLoadMore: false,
      selectedTagId: '',
      isSelectedCategory: '',
      selectedChildTagId: '',
      fnProviding: false,
      modalType: '',
      selectedStatus: '',
      selectedProduct: {},
      shouldShowNotificationBar: false,
      storeName: '',
      storeCity: '',
      storeVendor: '',
      all_amount: 0,
      all_count: 0,
      inventorySummary: {},
      onStrict: false,
      showScan: false,
      showScanType: 'add',//add-扫码新建，search-扫码搜索
      in_audit: 0,
      no_pass_audit: 0,
      fail_audit: 0
    }
  }

  componentDidMount() {
    const {global, navigation} = this.props
    const {accessToken, store_id, store_info} = global;
    this.setState({fnProviding: Number(store_info?.strict_providing) > 0})
    this.fetchUnreadPriceAdjustment(store_id, accessToken)
    this.getSGCategory()
    this.focus = navigation.addListener('focus', () => this.restart());
  }

  getSGCategory() {
    const {dispatch} = this.props
    const {accessToken, vendor_id} = this.props.global;
    const url = `/data_dictionary/get_app_sg_tags/${vendor_id}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((obj) => {
      dispatch(setSGCategory(obj))
    }).catch()
  }

  componentWillUnmount() {
    this.focus()
  }

  restart() {
    if (GlobalUtil.getGoodsFresh() === 2) {
      GlobalUtil.setGoodsFresh(1)
      this.onRefresh()
      return;
    }
    this.fetchGoodsCount()
  }

  fetchGoodsCount() {
    const {store_id, accessToken, vendor_id, vendor_info} = this.props.global;
    const {show_audit_prod} = vendor_info
    const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
    HttpUtils.get.bind(this.props)(`/api/count_products_with_status/${store_id}?access_token=${accessToken}`,).then(res => {
      let newStatusList
      const {
        all = 0, in_stock = 0, out_of_stock = 0, in_stock_but_nil = 0, new_arrivals = 0, common_provided = 0,
        self_provided = 0, no_img = 0, in_audit = 0, no_pass_audit = 0, fail_audit = 0, strict_providing = 0
      } = res
      if (strict_providing === '1') {
        newStatusList = [
          {label: '全部 ' + all, value: 'all'},
          {label: '上架 ' + in_stock, value: 'in_stock'},
          {label: '下架 ' + out_of_stock, value: 'out_of_stock'},
          {label: '售罄 ' + in_stock_but_nil, value: 'in_stock_but_nil'},
          {label: '最近上新 ' + new_arrivals, value: 'new_arrivals'},
          {label: '总部供货 ' + common_provided, value: 'common_provided'},
          {label: '门店自采 ' + self_provided, value: 'self_provided'},
        ]
      } else {
        newStatusList = [
          {label: '全部 ' + all, value: 'all'},
          {label: '上架 ' + in_stock, value: 'in_stock'},
          {label: '下架 ' + out_of_stock, value: 'out_of_stock'},
          {label: '最近上新 ' + new_arrivals, value: 'new_arrivals'}
        ]
      }
      if (114 === vendor_id && no_img)
        newStatusList = [
          {label: '全部 ' + all, value: 'all'},
          {label: '缺失图片 ' + no_img, value: 'no_img'},
          {label: '上架 ' + in_stock, value: 'in_stock'},
          {label: '下架 ' + out_of_stock, value: 'out_of_stock'},
          {label: '最近上新 ' + new_arrivals, value: 'new_arrivals'},
        ]
      if (show_audit_prod == 1) {
        newStatusList.push({label: '审核中 ' + in_audit, value: 'in_audit'})
        newStatusList.push({label: '未通过 ' + no_pass_audit, value: 'no_pass_audit'})
        newStatusList.push({label: '失败 ' + fail_audit, value: 'fail_audit'})
      }
      this.setState({
        statusList: newStatusList,
        showStatusList: newStatusList.length > 4 ? newStatusList.slice(0, 4) : newStatusList,
        selectedStatus: newStatusList[0],
        all_amount: res.all_amount,
        all_count: res.all_count,
        inventorySummary: res,
        in_audit: in_audit,
        no_pass_audit: no_pass_audit,
        fail_audit: fail_audit,
        onStrict: strict_providing === '1'
      }, () => {
        this.fetchCategories(store_id, prod_status, accessToken)
      })
    }, (res) => {
      ToastLong('加载数量错误' + res.reason)
      this.setState({loadingCategory: false})
    })
  }

  fetchCategories(storeId, prod_status, accessToken) {
    const hideAreaHot = prod_status ? 1 : 0;
    const selectedStatus = this.state.selectedStatus.value
    const url = `/api/list_store_prod_tags/${storeId}/${selectedStatus}?access_token=${accessToken}`
    const params = {
      hideAreaHot: hideAreaHot,
      is_get_all: 1
    }
    HttpUtils.get.bind(this.props)(url, params).then(res => {

      this.setState({
        categories: res,
        selectedTagId: res[0] ? res[0].id : '',
        isSelectedCategory: res[0] ? res[0].id : '',
        selectedChildTagId: res[0] && res[0].children && res[0].children.length > 0 ? res[0].children && res[0].children[0].id : ''
      }, () => {
        this.search();
      })
    }, () => {
      this.setState({loadingCategory: false})
    })
  }

  fetchUnreadPriceAdjustment(storeId, accessToken) {
    const url = `/api/is_existed_unread_price_adjustments/${storeId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      if (res) {
        this.setState({shouldShowNotificationBar: true})
      }
    })
  }

  search = (setList = 1, isRefreshItem = false) => {
    const {
      isLoading, selectedStatus, selectedChildTagId, selectedTagId, page, pageNum, selectedProduct, goods
    } = this.state
    if (isLoading) {
      return;
    }
    const {accessToken, store_id, vendor_id} = this.props.global;
    const {prod_status} = this.props.route.params || {};
    this.setState({
      isLoading: true,
    })
    const params = {
      vendor_id: vendor_id,
      status: selectedStatus.value,
      tagId: selectedChildTagId ? selectedChildTagId : selectedTagId,
      page: page,
      pageSize: pageNum,
      storeId: store_id,
    }
    if (store_id) {
      params['hideAreaHot'] = 1;
      params['limit_status'] = (prod_status || []).join(",");
    }
    if (isRefreshItem) {
      params.pid = selectedProduct.id || goods[0]
      params.page = 1
    }
    const url = `/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      const {lists = [], isLastPage = false} = res
      if (isRefreshItem) {
        const index = goods.findIndex(item => item.id === selectedProduct.id)
        if (Array.isArray(lists) && lists.length > 0)
          goods[index] = lists[0]
        this.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
        return
      }
      const goodList = setList === 1 ? lists : goods.concat(lists)

      this.setState({
        goods: goodList,
        isLastPage: isLastPage,
        isLoading: false
      })
    }, (res) => {
      ToastLong(res.reason)
      this.setState({isLoading: false})
    })
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

  onRefresh = () => {
    const status = global.currentRouteName !== 'Goods'
    if (status) {
      this.search(status ? 1 : 0, status)//如果global.currentRouteName的值不是当前页面，只刷新某一个值
      return
    }
    this.setState({page: 1}, () => {
      this.search()
    })
  }

  onLoadMore = () => {
    let {page, isLastPage} = this.state
    if (isLastPage) {
      // ToastShort("暂无更多数据")
      return;
    }

    this.setState({page: page + 1}, () => {
      this.search(0)
    })

  }

  onOpenModal(modalType, product) {
    this.setState({
      modalType: modalType,
      selectedProduct: product ? product : {},
    })
  }

  changeRowExist(idx, supplyPrice) {
    const {goods} = this.state
    goods[idx].is_exist = {supply_price: supplyPrice, status: 1}
    this.setState({goods: goods})
  }

  gotoGoodDetail = (item) => {
    this.setState({selectedProduct: item})
    this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
      pid: item.id,
      storeId: this.props.global.store_id,
      // updatedCallback: this.doneProdUpdate
    })
  }

  selectCategory = (category, selectedTagId, isSelectedCategory) => {
    if (category.id === isSelectedCategory) {
      this.setState({
        selectedTagId: selectedTagId,
        isSelectedCategory: '0000',
        selectedChildTagId: '',
        page: 1
      }, () => this.search())
      return
    }
    if (category.children.length > 0) {
      this.selectCategoryChildren(category, category.children[0])
      return;
    }
    this.setState({
      selectedTagId: category.id,
      isSelectedCategory: category.id,
      selectedChildTagId: '',
      page: 1
    }, () => this.search())
  }

  selectCategoryChildren = (category, categoryChildren) => {
    this.setState({
      selectedTagId: category.id,
      isSelectedCategory: category.id,
      selectedChildTagId: categoryChildren.id,
      page: 1
    }, () => this.search())
  }

  renderCategories() {
    const {categories, selectedTagId, isSelectedCategory, selectedChildTagId} = this.state
    return (
      <For each="items" of={categories} index="i">
        <TouchableOpacity key={i}
                          onPress={() => this.selectCategory(items, selectedTagId, isSelectedCategory)}
                          style={[isSelectedCategory === items.id ? styles.categoryItemActive : styles.categoryItem]}>
          <Text style={isSelectedCategory === items.id ? styles.activeCategoriesText : styles.categoriesText}>
            {items.name}
          </Text>
          <If condition={items.children.length > 0}>
            <AntDesign name={isSelectedCategory === items.id ? 'up' : 'down'} color={colors.color999} size={14}
                       style={{paddingVertical: 7}}/>
          </If>
        </TouchableOpacity>
        <If condition={isSelectedCategory === items.id && items.children.length > 0}>
          <For index='index' of={items.children} each='item'>
            <TouchableOpacity key={index} onPress={() => this.selectCategoryChildren(items, item)}
                              style={selectedChildTagId === item.id ? styles.selectCategoryChildrenWrap : styles.cateChildrenWrap}>
              <Text
                style={selectedChildTagId === item.id ? styles.selectCategoryChildrenText : styles.categoryChildrenText}>
                {item.name}
              </Text>
            </TouchableOpacity>
          </For>
        </If>
      </For>
    )
  }

  onSelectStatus = () => {
    this.setState({
      page: 1,
      selectedTagId: '',
      isSelectedCategory: '',
      selectedChildTagId: '',
    }, () => {
      const {accessToken, store_id} = this.props.global;
      const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
      this.fetchCategories(store_id, prod_status, accessToken)
    })
  }

  readNotification = () => {
    const {accessToken, store_id} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_price_adjustments/${store_id}/?access_token=${accessToken}`).then(res => {
      // ToastShort("设置为已读");
    })
    this.props.navigation.navigate(Config.ROUTE_GOODS_APPLY_RECORD)
  }

  onEndReached = () => {
    if (this.state.isCanLoadMore) {
      this.setState({isCanLoadMore: false}, () => {
        this.onLoadMore();
      })
    }
  }
  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }
  onTouchMove = (e) => {
    if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
      this.setState({scrollLocking: true});
    } else {
      this.setState({scrollLocking: false});
    }
  }

  getNotification = () => {
    const {shouldShowNotificationBar} = this.state
    if (shouldShowNotificationBar)
      return (
        <View style={styles.notificationBar}>
          <Text style={[styles.n2grey6, {paddingHorizontal: 10, paddingVertical: 6}]}>
            您申请的调价商品有更新，请及时查看
          </Text>
          <TouchableOpacity onPress={this.readNotification} style={styles.readNotification}>
            <Text style={styles.readNotificationText}>查看</Text>
          </TouchableOpacity>
        </View>
      )
  }

  getScanView = () => {
    const {showScan} = this.state
    return (
      <Scanner onClose={() => this.setScanStatus(false, '')}
               visible={showScan}
               title="退出扫码"
               onScanSuccess={code => this.onScanSuccess(code)}
               onScanFail={code => this.onScanFail(code)}/>
    )
  }
  listFooterComponent = () => {
    const {isLastPage} = this.state
    if (isLastPage)
      return (
        <Text style={{color: colors.color999, fontSize: 14, textAlign: 'center', paddingVertical: 8}}>
          已经到底了~
        </Text>
      )
  }

  jumpToGoodsAudit = () => {
    this.props.navigation.navigate(Config.ROUTE_GOODS_AUDIT)
  }
  renderTip = () => {
    const {fail_audit, no_pass_audit} = this.state
    if (fail_audit || no_pass_audit)
      return (

        <View style={{backgroundColor: colors.white}}>
          <TouchableOpacity style={styles.tipWrap} onPress={this.jumpToGoodsAudit}>
            <Text style={{fontSize: 12, color: '#FF8309', lineHeight: 17}}>
              有<If condition={no_pass_audit}>{no_pass_audit}个商品未通过，</If><If
              condition={fail_audit}>{fail_audit}个商品失败</If>，请立即处理
            </Text>
            <SvgXml xml={right(20, 20, '#FF8309')}/>
          </TouchableOpacity>
        </View>
      )
    return null
  }

  render() {

    const {accessToken, store_id, vendor_id} = this.props.global;
    let {selectedProduct, goods, isLoading} = this.state;
    const {sp} = selectedProduct;
    return (
      <View style={styles.page}>
        {this.getHeader()}
        {this.renderGoodsStatus()}
        <View style={styles.container}>
          {this.getNotification()}
          <View style={{flex: 14, flexDirection: 'row'}}>
            <View style={styles.categoryBox}>
              <ScrollView>
                {this.renderCategories()}
              </ScrollView>
            </View>
            <View style={{flex: 1}}>
              {this.renderTip()}
              <FlatList
                data={goods}
                style={{flex: 1}}
                legacyImplementation={false}
                directionalLockEnabled={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                onEndReachedThreshold={0.5}
                onEndReached={this.onEndReached}
                onMomentumScrollBegin={this.onMomentumScrollBegin}
                onTouchMove={(e) => this.onTouchMove(e)}
                renderItem={this.renderItem}
                onRefresh={this.onRefresh}
                refreshing={false}
                keyExtractor={this._keyExtractor}
                shouldItemUpdate={this._shouldItemUpdate}
                getItemLayout={this._getItemLayout}
                initialNumToRender={5}
                ListFooterComponent={this.listFooterComponent()}
              />
            </View>


          </View>
          {this.getBottomButton()}
          <If condition={sp}>
            <GoodItemEditBottom key={sp.id} pid={Number(selectedProduct.id)}
                                modalType={this.state.modalType}
                                skuName={selectedProduct.sku_name}
                                productName={selectedProduct.name}
                                strictProviding={false} accessToken={accessToken}
                                storeId={Number(store_id)}
                                currStatus={Number(sp.status)}
                                vendor_id={vendor_id}
                                doneProdUpdate={this.doneProdUpdate}
                                onClose={() => {
                                  this.setState({modalType: ''})
                                  this.search(1, true)
                                }}
                                spId={Number(sp.id)}
                                applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                navigation={this.props.navigation}
                                storePro={selectedProduct}
                                beforePrice={Number(sp.supply_price)}/>
          </If>
        </View>
        {this.getScanView()}
      </View>
    )
  }

  onScanSuccess = (code) => {
    const {showScanType} = this.state
    if (showScanType === 'search') {
      // this.setState({searchKeywords: code});
      this.jumpToSearchGoodsList(code)
      return
    }
    this.jumpToGoodsEdit(code)
  }
  setScanStatus = (value, showScanType) => {
    this.setState({showScan: value, showScanType: showScanType})
  }
  onScanFail = () => {
    Alert.alert('错误提示', '商品编码不合法', [{text: '确定', onPress: () => this.setScanStatus(false, '')}]);
  }
  _keyExtractor = (item) => {
    return item.id.toString();
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: pxToDp(242), offset: pxToDp(242) * index, index}
  }

  selectGoodsStatus = (item, index) => {
    const {statusList} = this.state
    this.scrollRef.scrollTo({x: index * 0.224 * width, y: 0, animated: true})
    if (index > 3) {

      this.setState({selectedStatus: item, showStatusList: statusList.slice(3), showMoreGoodsStatus: false})
      this.onSelectStatus()

      return
    }
    if (index <= 3) {
      this.setState({selectedStatus: item, showStatusList: statusList.slice(0, 4), showMoreGoodsStatus: false})
      this.onSelectStatus()
      return;
    }
    this.setState({selectedStatus: item, showMoreGoodsStatus: false})
    this.onSelectStatus()
  }

  renderGoodsStatus = () => {
    const {statusList, selectedStatus, showMoreGoodsStatus} = this.state
    return (
      <>
        <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,}}>
          <ScrollView style={styles.headerGoodsStatusWrap}
                      horizontal={true}
                      ref={ref => this.scrollRef = ref}
                      automaticallyAdjustContentInsets={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}>
            {
              statusList.map((item, index) => {
                const isSelect = selectedStatus.value === item.value
                return (
                  <View key={index} style={isSelect ? styles.selectGoodsStatusWrap : styles.goodsStatusWrap}>
                    <Text onPress={() => this.selectGoodsStatus(item)}
                          style={isSelect ? styles.selectGoodsStatusText : styles.goodsStatusText}>
                      {item.label}
                    </Text>
                  </View>
                )
              })}

          </ScrollView>
          <If condition={statusList.length > 4}>
            <AntDesign name={showMoreGoodsStatus ? 'up' : 'down'}
                       size={16}
                       color={colors.color999}
                       style={{marginRight: 10, marginLeft: 4}}
                       onPress={() => this.setState({showMoreGoodsStatus: !showMoreGoodsStatus})}/>
          </If>
        </View>
        <TopSelectModal visible={showMoreGoodsStatus}
                        list={statusList}
                        initialNumToRender={10}
                        numColumns={4}
                        marTop={78}
                        default_val={selectedStatus.value}
                        selectWrap={styles.selectShowMoreGoodsStatusWrap}
                        warp={styles.showMoreGoodsStatusWrap}
                        selectTextStyle={styles.selectShowMoreGoodsStatusText}
                        textStyle={styles.showMoreGoodsStatusText}
                        onPress={(item, index) => this.selectGoodsStatus(item, index)}
                        onClose={() => this.setState({showMoreGoodsStatus: !showMoreGoodsStatus})}/>
      </>
    )
  }

  jumpToGoodsEdit = (upcCode = '') => {
    let {navigation} = this.props;
    this.mixpanel.track('商品页面_上新')
    navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add', upcCode: upcCode})
  }

  jumpToSearchGoodsList = (value) => {
    let {navigation} = this.props;
    navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {searchKeywords: value})
  }

  jumpToSearchAndCreateGoods = () => {
    let {navigation} = this.props;
    navigation.navigate(Config.ROUTE_SEARCH_AND_CREATE_GOODS)
  }
  getBottomButton = () => {
    return (
      <View style={styles.bottomButtonWrap}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => this.jumpToSearchAndCreateGoods()}>
          <SvgXml xml={search()}/>
          <Text style={styles.bottomButtonText}>
            搜索新建
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.jumpToGoodsEdit('')} style={styles.bottomButton}>
          <SvgXml xml={addGoods()}/>
          <Text style={styles.bottomButtonText}>
            手动新建
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}
                          onPress={() => this.setScanStatus(true, 'add')}>
          <SvgXml xml={scan()}/>
          <Text style={styles.bottomButtonText}>
            扫码新建
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  getHeader() {
    let {searchKeywords} = this.state
    return (
      <View style={styles.HeaderWrap}>
        <View style={styles.HeaderInputWrap}>
          <AntDesign name={'search1'} size={18} style={{marginLeft: 10}}/>
          <TextInput value={searchKeywords}
                     style={{flex: 1, padding: 8, marginLeft: 13}}
                     onFocus={() => this.jumpToSearchGoodsList(searchKeywords)}
                     placeholderTextColor={colors.color999}
                     placeholder={'请输入商品名称、SKU或UPC'}/>
          <SvgXml xml={scan()} onPress={() => this.setScanStatus(true, 'search')} style={{marginRight: 10}}/>
        </View>
      </View>
    )
  }

  opBar = (onSale, onStrict, item, price_type) => {
    const {vendor_info} = this.props.global
    if ('' === item.coverimg) {
      return (
        <View style={[styles.row_center]}>
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.gotoAddMissingPicture(item)}>
            <Text style={styles.goodsOperationBtn}>编辑</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={[styles.row_center]}>
        <If condition={onStrict}>
          <If condition={price_type}>
            <TouchableOpacity style={[styles.toOnlineBtn]}
                              onPress={() => this.jumpToNewRetailPriceScene(item)}>
              <Text style={styles.goodsOperationBtn}>价格/库存 </Text>
            </TouchableOpacity>
          </If>
          <If condition={!price_type}>
            <TouchableOpacity style={[styles.toOnlineBtn]}
                              onPress={() => this.onOpenModal('set_price_add_inventory', item)}>
              <Text style={styles.goodsOperationBtn}>报价/库存 </Text>
            </TouchableOpacity>
          </If>
        </If>
        <If condition={!onStrict}>
          <If condition={price_type}>
            <TouchableOpacity style={[styles.toOnlineBtn]}
                              onPress={() => this.jumpToNewRetailPriceScene(item)}>
              <Text style={styles.goodsOperationBtn}>价格 </Text>
            </TouchableOpacity>
          </If>
          <If condition={!price_type}>
            <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('set_price', item)}>
              <Text style={styles.goodsOperationBtn}>报价 </Text>
            </TouchableOpacity>
          </If>
        </If>
        <If condition={onSale}>
          <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('off_sale', item)}>
            <Text style={styles.goodsOperationBtn}>下架 </Text>
          </TouchableOpacity>
        </If>
        <If condition={!onSale}>
          <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('on_sale', item)}>
            <Text style={styles.goodsOperationBtn}>上架 </Text>
          </TouchableOpacity>
        </If>
        <If condition={vendor_info?.allow_merchants_edit_prod == 1}>
          <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.jumpToGoodsEditPage(item.id)}>
            <Text style={styles.goodsOperationBtn}>编辑</Text>
          </TouchableOpacity>
        </If>

      </View>
    )
  }

  jumpToGoodsEditPage = (id) => {
    let {navigation, global} = this.props;
    const {store_id, accessToken, vendor_id} = global
    const url = `/api/get_product_detail/${id}/${vendor_id}/${store_id}?access_token=${accessToken}`
    showModal('加载中')
    HttpUtils.get.bind(this.props)(url).then(res => {
      hideModal()
      navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'edit', product_detail: res});
    })

  }
  jumpToNewRetailPriceScene = (item) => {
    this.setState({selectedProduct: item})
    this.props.navigation.navigate(Config.ROUTE_ORDER_RETAIL_PRICE_NEW, {
      productId: item.id
    })
  }

  gotoAddMissingPicture = (item) => {
    this.setState({selectedProduct: item})
    this.props.navigation.navigate(Config.ROUTE_ADD_MISSING_PICTURE, {goodsInfo: item})
  }
  renderItem = (order) => {
    const {price_type} = this.props.global.vendor_info
    let {item} = order;
    const onSale = (item.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (item.sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return (
      <GoodListItem fnProviding={onStrict} product={item} key={item.id}
                    onPressImg={() => this.gotoGoodDetail(item)}
                    price_type={price_type}
                    opBar={this.opBar(onSale, onStrict, item, price_type)}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsList);
const {width, height} = Dimensions.get('window')
const styles = StyleSheet.create({
  tipWrap: {
    backgroundColor: '#FFEEDD',
    borderRadius: 4,
    height: 30,
    marginLeft: 10,
    marginRight: 10,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  showMoreGoodsStatusZone: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: colors.white
  },
  selectShowMoreGoodsStatusWrap: {
    backgroundColor: colors.main_color,
    borderRadius: 2,
    width: 0.224 * width,
    height: 0.0369 * height,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 7
  },
  showMoreGoodsStatusWrap: {
    backgroundColor: colors.colorEEE,
    borderRadius: 2,
    width: 0.224 * width,
    height: 0.0369 * height,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 7
  },
  selectShowMoreGoodsStatusText: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center'
  },
  showMoreGoodsStatusText: {
    fontSize: 12,
    color: colors.color333,
    textAlign: 'center'
  },
  selectCategoryChildrenWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.main_color,
    borderBottomColor: colors.main_color,
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  cateChildrenWrap: {
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'
  },
  selectCategoryChildrenText: {fontSize: 14, color: colors.main_color, paddingVertical: 7},
  categoryChildrenText: {fontSize: 14, color: colors.color666, paddingVertical: 7},
  bottomButtonWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 48,
    borderTopColor: colors.colorEEE,
    borderTopWidth: 1,
    backgroundColor: colors.white
  },
  bottomButton: {alignItems: 'center', justifyContent: 'center'},
  bottomButtonText: {fontSize: 10, color: colors.color333, paddingTop: 7},
  HeaderWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: colors.white
  },
  HeaderInputWrap: {
    flex: 9, flexDirection: 'row', alignItems: 'center', borderRadius: 17, backgroundColor: '#f7f7f7'
  },
  page: {flex: 1},
  headerGoodsStatusWrap: {
    flexDirection: 'row',

    paddingLeft: 10,
    paddingVertical: 8,

  },
  selectGoodsStatusWrap: {marginRight: 10, borderBottomColor: colors.main_color, borderBottomWidth: 2},
  goodsStatusWrap: {marginRight: 10, color: colors.color999},
  selectGoodsStatusText: {color: colors.color333, paddingVertical: 6},
  goodsStatusText: {color: colors.color999, paddingVertical: 6},
  headerWrap: {
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    elevation: 5,
    shadowRadius: 8,
  },
  stockWrap: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: colors.main_color,
    width: pxToDp(35),
    height: pxToDp(35),
    borderRadius: pxToDp(17)
  },
  stockText: {
    color: colors.white, fontWeight: "bold", fontSize: 12
  },
  modalDetermineWrap: {
    borderTopColor: '#E5E5E5',
    borderTopWidth: pxToDp(1),
    width: '100%',
    paddingTop: pxToDp(20),
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCountText: {
    fontSize: pxToDp(30), color: colors.color333
  },
  goodsOperationBtn: {color: colors.color333, fontSize: 14},
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  categoryBox: {
    width: pxToDp(160),
    backgroundColor: colors.colorEEE,
    height: '100%'
  },
  notificationBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238,38,38,0.09)',
    justifyContent: 'space-between'
  },
  categoryItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 8,
    flexWrap: 'wrap',
  },
  categoryItemActive: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingRight: 8,
    flexWrap: 'wrap',

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
    borderColor: colors.main_color,
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(25),
    alignItems: "center",
    justifyContent: "center"
  },
  noFoundBtnText: {
    color: colors.main_color,
    textAlign: "center"
  },
  toOnlineBtn: {
    borderWidth: 1,
    borderColor: colors.colorCCC,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginRight: 4,
    borderRadius: 2,
    flex: 1
  },
  activeCategoriesText: {
    flex: 1,
    fontSize: 14,
    color: colors.color333,
    paddingVertical: 7,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  categoriesText: {flex: 1, fontSize: 12, color: colors.color666, textAlign: 'center', paddingVertical: 7,},
  n2grey6: {
    color: colors.color666,
    fontSize: 12
  },
  row_center: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
    marginLeft: 4
  },
  readNotification: {
    marginVertical: 6,
    marginHorizontal: 10,
    backgroundColor: '#EE2626',
    borderRadius: 2
  },
  readNotificationText: {
    color: colors.white, paddingHorizontal: 8, paddingVertical: 1, fontSize: 12
  }
})
