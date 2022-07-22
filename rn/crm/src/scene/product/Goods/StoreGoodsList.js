import React, {Component} from "react"
import {FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../../pubilc/util/pxToDp"
import Config from "../../../pubilc/common/config"
import tool, {simpleStore} from "../../../pubilc/util/tool"
import HttpUtils from "../../../pubilc/util/http"
import Cts from "../../../pubilc/common/Cts";
import colors from "../../../pubilc/styles/colors";
import GoodListItem from "../../../pubilc/component/goods/GoodListItem";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import Dialog from "../../common/component/Dialog";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import Entypo from "react-native-vector-icons/Entypo";
import {MixpanelInstance} from "../../../pubilc/util/analytics";


function mapStateToProps(state) {
  const {global} = state
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

function FetchRender({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class StoreGoodsList extends Component {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    const {global, dispatch} = this.props
    const {currStoreId, accessToken} = global;
    this.state = {
      currStoreId: currStoreId,
      goods: [],
      page: 1,
      statusList: [
        {label: '全部商品', value: 'all'},
        {label: '售罄商品', value: 'out_of_stock'},
        {label: '最近上新', value: 'new_arrivals'},
        {label: '在售商品', value: 'in_stock'},
      ],
      pageNum: Cts.GOODS_SEARCH_PAGE_NUM,
      categories: [],
      isLoading: false,
      loadingCategory: true,
      isLastPage: false,
      isCanLoadMore: false,
      selectedTagId: '',
      selectedChildTagId: '',
      fnProviding: false,
      modalType: '',
      selectedStatus: '',
      selectedProduct: {},
      shouldShowNotificationBar: false,
      showstatusModal: false,
      inventory_Dialog: false,
      storeName: '',
      storeCity: '',
      storeVendor: '',
      all_amount: 0,
      all_count: 0,
      inventorySummary: {},
      selectStatusItem: '',
      onStrict: false
    }
    simpleStore(global, dispatch, currStoreId, (store) => {
      this.setState({
        fnPriceControlled: store['fn_price_controlled'],
        fnProviding: Number(store['strict_providing']) > 0,
        init: true
      })
      this.fetchUnreadPriceAdjustment(store.id, accessToken)
    })
  }

  restart() {
    if (GlobalUtil.getGoodsFresh() === 2) {
      GlobalUtil.setGoodsFresh(1)
      this.onRefresh()
      return null;
    }
    this.fetchGoodsCount()
  }

  fetchGoodsCount() {
    const {currStoreId, accessToken} = this.props.global;
    const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
    HttpUtils.get.bind(this.props)(`/api/count_products_with_status/${currStoreId}?access_token=${accessToken}`,).then(res => {
      let newStatusList = []
      if (res.strict_providing === '1') {
        newStatusList = [
          {label: '全部商品 - ' + res.all, value: 'all'},
          {label: '总部供货 - ' + res.common_provided, value: 'common_provided'},
          {label: '门店自采 - ' + res.self_provided, value: 'self_provided'},
          {label: '售罄商品 - ' + res.out_of_stock, value: 'out_of_stock'},
          {label: '最近上新 - ' + res.new_arrivals, value: 'new_arrivals'},
          {label: '在售商品 - ' + res.in_stock, value: 'in_stock'},
          {label: '下架商品 - ' + res.off_stock, value: 'off_stock'},
        ]
      } else {
        newStatusList = [
          {label: '全部商品 - ' + res.all, value: 'all'},
          {label: '售罄商品 - ' + res.out_of_stock, value: 'out_of_stock'},
          {label: '最近上新 - ' + res.new_arrivals, value: 'new_arrivals'},
          {label: '在售商品 - ' + res.in_stock, value: 'in_stock'},
          {label: '下架商品 - ' + res.off_stock, value: 'off_stock'},
        ]
      }
      this.setState({
        statusList: [...newStatusList],
        selectedStatus: {...newStatusList[0]},
        all_amount: res.all_amount,
        all_count: res.all_count,
        inventorySummary: res,
        onStrict: res.strict_providing === '1'
      }, () => {
        this.fetchCategories(currStoreId, prod_status, accessToken)
      })
    }, (res) => {
      ToastLong('加载数量错误' + res.reason)
      this.setState({loadingCategory: false})
    })
  }

  fetchCategories(storeId, prod_status, accessToken) {
    const hideAreaHot = prod_status ? 1 : 0;
    const selectedStatus = this.state.selectedStatus.value
    HttpUtils.get.bind(this.props)(`/api/list_store_prod_tags/${storeId}/${selectedStatus}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
      this.setState({
        categories: res,
        selectedTagId: res[0] ? res[0].id : null,
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
        this.setState({
          shouldShowNotificationBar: true
        })
      }
    })
  }


  search(setList = 1) {
    const {isLoading, selectedStatus, selectedChildTagId, selectedTagId, page, pageNum} = this.state
    if (isLoading) {
      return;
    }
    const {accessToken, currStoreId} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    const {prod_status} = this.props.route.params || {};
    this.setState({
      isLoading: true,
    })
    const params = {
      vendor_id: currVendorId,
      status: selectedStatus.value,
      tagId: selectedChildTagId ? selectedChildTagId : selectedTagId,
      page: page,
      pageSize: pageNum,
      storeId: currStoreId,
    }
    if (currStoreId) {
      params['hideAreaHot'] = 1;
      params['limit_status'] = (prod_status || []).join(",");
    }
    const url = `/api/find_prod_with_multiple_filters.json?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      const goods = setList === 1 ? res.lists : this.state.goods.concat(res.lists)
      this.setState({goods: goods, isLastPage: res.isLastPage, isLoading: false})
    }, (res) => {
      ToastLong(res.reason)
      this.setState({isLoading: false})
    })
  }

  doneProdUpdate(pid, prodFields, spFields) {
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

  onRefresh() {
    this.setState({page: 1}, () => {
      this.search()
    })
  }

  onLoadMore() {
    let {page, isLastPage} = this.state
    if (isLastPage) {
      ToastShort("暂无更多数据")
      return null;
    }

    this.setState({page: page + 1}, () => {
      this.search(0)
    })

  }

  onSelectCategory(category) {
    this.setState({
      selectedTagId: category.id,
      selectedChildTagId: '',
      page: 1
    }, () => {
      this.search()
    })
  }

  onSelectChildCategory(childCategory) {
    this.setState({
      selectedChildTagId: childCategory.id,
      page: 1
    }, () => {
      this.search()
    })
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
      storeId: this.props.global.currStoreId,
      updatedCallback: this.doneProdUpdate.bind(this)
    })
  }


  renderCategories() {
    const {categories, selectedTagId} = this.state
    return (
      <For each="item" of={categories} index="i">
        <TouchableOpacity key={i} onPress={() => this.onSelectCategory(item)}>
          <View style={[selectedTagId === item.id ? styles.categoryItemActive : styles.categoryItem]}>
            <Text style={styles.n2grey6}>{item.name} </Text>
          </View>
        </TouchableOpacity>
      </For>
    )
  }

  onSelectStatus = () => {
    this.setState({
      page: 1,
      selectedTagId: '',
      selectedChildTagId: '',
    }, () => {
      const {accessToken, currStoreId} = this.props.global;
      const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
      this.fetchCategories(currStoreId, prod_status, accessToken)
    })
  }

  readNotification = () => {
    const {accessToken, currStoreId} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_price_adjustments/${currStoreId}/?access_token=${accessToken}`).then(res => {
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

  render() {
    const p = this.state.selectedProduct;
    const {sp} = this.state.selectedProduct;
    const {accessToken, simpleStore} = this.props.global;
    let {all_amount, all_count, inventorySummary, selectStatusItem} = this.state;
    const {currVendorId} = tool.vendor(this.props.global);
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <FetchRender navigation={this.props.navigation} onRefresh={this.restart.bind(this)}/>
        <View style={styles.container}>

          <Dialog visible={this.state.showstatusModal} onRequestClose={() => this.setState({showstatusModal: false})}>
            {this.showstatusSelect()}
          </Dialog>
          <If condition={this.state.shouldShowNotificationBar}>
            <View style={styles.notificationBar}>
              <Text style={[styles.n2grey6, {padding: 12, flex: 10}]}>您申请的调价商品有更新，请及时查看 </Text>
              <TouchableOpacity onPress={this.readNotification} style={styles.readNotification}>
                <Text style={{color: 'white'}}>查看 </Text>
              </TouchableOpacity>
            </View>
          </If>
          <View style={{flex: 14, flexDirection: 'row'}}>
            <View style={styles.categoryBox}>
              <ScrollView>
                {this.renderCategories()}
              </ScrollView>
            </View>

            <View style={{flex: 1,}}>
              <View style={{marginBottom: 4, marginLeft: 1}}>
                {this.renderChildrenCategories()}
              </View>
              <FlatList
                style={{flex: 1}}
                data={this.state.goods}
                legacyImplementation={false}
                directionalLockEnabled={true}
                onEndReachedThreshold={0.3}
                onEndReached={this.onEndReached}
                onMomentumScrollBegin={this.onMomentumScrollBegin}
                onTouchMove={(e) => this.onTouchMove(e)}
                renderItem={this.renderItem}
                onRefresh={this.onRefresh.bind(this)}
                refreshing={this.state.isLoading}
                keyExtractor={this._keyExtractor}
                shouldItemUpdate={this._shouldItemUpdate}
                getItemLayout={this._getItemLayout}
                initialNumToRender={5}
              />
            </View>
          </View>
          <If condition={sp}>
            <GoodItemEditBottom key={sp.id} pid={Number(p.id)} modalType={this.state.modalType} skuName={p.sku_name}
                                productName={p.name}
                                strictProviding={false} accessToken={accessToken}
                                storeId={Number(this.props.global.currStoreId)}
                                currStatus={Number(sp.status)}
                                vendor_id={currVendorId}
                                doneProdUpdate={this.doneProdUpdate.bind(this)}
                                onClose={() => this.setState({modalType: ''}, () => {
                                  this.search()
                                })}
                                spId={Number(sp.id)}
                                applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                navigation={this.props.navigation}
                                storePro={p}
                                beforePrice={Number(sp.supply_price)}/>
          </If>
          <Modal
            visible={this.state.inventory_Dialog}
            onRequestClose={this.closeCountModal}
            animationType={'fade'}
            transparent={true}
          >
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
              <View style={{
                width: '80%',
                maxHeight: '70%',
                backgroundColor: '#fff',
                borderRadius: pxToDp(10),
                padding: pxToDp(20),
                alignItems: 'center'
              }}>
                <Text style={{fontSize: pxToDp(36), fontWeight: "bold", marginTop: pxToDp(15)}}>
                  {simpleStore.name}
                </Text>
                <View style={{
                  flexDirection: "column",
                  marginVertical: pxToDp(30)
                }}>
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginVertical: pxToDp(15)
                  }}>
                    <If condition={selectStatusItem === 'all' || selectStatusItem === ''}>
                      <Text style={styles.modalCountText}>店铺库存汇总：</Text>
                      <Text style={styles.modalCountText}>{all_count}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'common_provided'}>
                      <Text style={styles.modalCountText}>总部供货库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['common_provided_count']}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'in_stock'}>
                      <Text style={styles.modalCountText}>在售商品库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['in_stock_count']}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'new_arrivals'}>
                      <Text style={styles.modalCountText}>最近上新库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['new_arrivals_count']}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'off_stock'}>
                      <Text style={styles.modalCountText}>下架商品库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['off_stock_count']}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'out_of_stock'}>
                      <Text style={styles.modalCountText}>售罄商品库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['out_of_stock_count']}件</Text>
                    </If>
                    <If condition={selectStatusItem === 'self_provided'}>
                      <Text style={styles.modalCountText}>门店自采库存汇总：</Text>
                      <Text style={styles.modalCountText}>{inventorySummary['self_provided_count']}件</Text>
                    </If>
                  </View>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <If condition={selectStatusItem === 'all' || selectStatusItem === ''}>
                      <Text style={styles.modalCountText}>店铺库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{all_amount}</Text>
                    </If>
                    <If condition={selectStatusItem === 'common_provided'}>
                      <Text style={styles.modalCountText}>总部供货库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['common_provided_amount']}</Text>
                    </If>
                    <If condition={selectStatusItem === 'in_stock'}>
                      <Text style={styles.modalCountText}>在售商品库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['in_stock_amount']}</Text>
                    </If>
                    <If condition={selectStatusItem === 'new_arrivals'}>
                      <Text style={styles.modalCountText}>最近上新库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['new_arrivals_amount']}</Text>
                    </If>
                    <If condition={selectStatusItem === 'off_stock'}>
                      <Text style={styles.modalCountText}>下架商品库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['off_stock_amount']}</Text>
                    </If>
                    <If condition={selectStatusItem === 'out_of_stock'}>
                      <Text style={styles.modalCountText}>售罄商品库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['out_of_stock_amount']}</Text>
                    </If>
                    <If condition={selectStatusItem === 'self_provided'}>
                      <Text style={styles.modalCountText}>门店自采库存总价：</Text>
                      <Text style={styles.modalCountText}>¥{inventorySummary['self_provided_amount']}</Text>
                    </If>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalDetermineWrap} onPress={this.closeCountModal}>
                  <Text style={{color: colors.main_color, fontSize: pxToDp(32), fontWeight: "bold"}}>
                    确 定
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>

      </View>
    )
  }

  closeCountModal = () => {
    this.setState({inventory_Dialog: false})
  }

  openCountModal = () => {
    this.setState({inventory_Dialog: true})
  }
  _keyExtractor = (item) => {
    return item.id.toString();
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }


  renderHeader() {
    let navigation = this.props.navigation;
    let {onStrict} = this.state
    return (
      <View style={{
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderBottomColor: colors.fontGray,
        borderBottomWidth: pxToDp(1)
      }}>
        <TouchableOpacity
          style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginLeft: 15}}
          onPress={() => {
            this.setState({
              showstatusModal: true
            })
          }}>
          <Text style={{color: colors.color333}}>{this.state.selectedStatus.label}  </Text>
          <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5}}/>
        </TouchableOpacity>

        <View style={{flex: 1}}></View>
        <If condition={onStrict}>
          <TouchableOpacity style={styles.stockWrap} onPress={this.openCountModal}>
            <Text style={styles.stockText}> 库 </Text>
          </TouchableOpacity>
        </If>
        <TouchableOpacity
          style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginLeft: 15}}
          onPress={() => {
            this.mixpanel.track('商品页面_上新')
            navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add'})
          }}>
          <Text style={{color: colors.color333}}>上新 </Text>
          <Entypo name='circle-with-plus' size={18}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginHorizontal: 15}}
          onPress={() => {
            navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {updatedCallback: this.doneProdUpdate.bind(this)})
          }}>
          <Entypo name='magnifying-glass' style={{fontSize: 18, marginLeft: 5, color: colors.color333}}/>
        </TouchableOpacity>
      </View>
    )
  }

  onChangeRadioItem = (event, item) => {
    if (event.target.checked) {
      this.setState({
        showstatusModal: false,
        selectedStatus: item,
        selectStatusItem: item.value
      }, () => this.onSelectStatus(item.value))
    }
  }

  showstatusSelect() {
    let {selectedStatus, statusList} = this.state;
    return (
      <View style={{marginTop: 2}}>
        <For each="item" of={statusList} index="i">
          <RadioItem key={i} style={{backgroundColor: colors.white}}
                     checked={selectedStatus.value === item.value}
                     onChange={event => this.onChangeRadioItem(event, item)}>
            <Text style={{fontSize: 18, color: colors.fontBlack,}}>
              {item.label}
            </Text>
          </RadioItem>
        </For>
      </View>
    )
  }

  renderChildCategory(childCategory) {
    const isActive = this.state.selectedChildTagId === childCategory.id
    let itemStyle = [styles.categoryItem, isActive && {
      backgroundColor: '#fff',
      borderBottomWidth: pxToDp(5),
      borderBottomColor: colors.main_color,
    }];
    return (
      <TouchableOpacity key={childCategory.id} onPress={() => this.onSelectChildCategory(childCategory)}
                        style={[itemStyle, {padding: 10, backgroundColor: colors.white, marginLeft: 2}]}>
        <Text style={styles.n2grey6}>{childCategory.name} </Text>
      </TouchableOpacity>
    )
  }

  renderChildrenCategories() {
    if (!this.state.selectedTagId) {
      return
    }
    const selectedCategory = this.state.categories.find(category => `${category.id}` === `${this.state.selectedTagId}`)
    if (selectedCategory.children.length) {
      {/* TODO 需要定制子分类的样式*/
      }
      return (
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={true}>
          {selectedCategory.children.map(childCategory => {
            return this.renderChildCategory(childCategory)
          })}
        </ScrollView>
      )
    }
  }

  opBar = (onSale, onStrict, item) => {
    return (
      <View style={[styles.row_center, styles.btnWrap]}>
        <If condition={onSale}>
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.onOpenModal('off_sale', item)}>
            <Text style={styles.goodsOperationBtn}>下架 </Text>
          </TouchableOpacity>
        </If>
        <If condition={!onSale}>
          <TouchableOpacity style={[styles.toOnlineBtn]}
                            onPress={() => this.onOpenModal('on_sale', item)}>
            <Text style={styles.goodsOperationBtn}>上架 </Text>
          </TouchableOpacity>
        </If>
        <If condition={onStrict}>
          <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                            onPress={() => this.onOpenModal('set_price_add_inventory', item)}>
            <Text style={styles.goodsOperationBtn}>价格/库存 </Text>
          </TouchableOpacity>
        </If>
        <If condition={!onStrict}>
          <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                            onPress={() => this.onOpenModal('set_price', item)}>
            <Text style={styles.goodsOperationBtn}>报价 </Text>
          </TouchableOpacity>
        </If>
        {/*{onOpen &&*/}
        {/*    <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}*/}
        {/*                      onPress={() => this.onOpenModal('set_price', item)}>*/}
        {/*      <Text style={{color: colors.color333}}>报价 </Text>*/}
        {/*    </TouchableOpacity>}*/}

      </View>
    )
  }

  renderItem = (order) => {
    let {item, index} = order;
    const onSale = (item.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (item.sp || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    return (
      <GoodListItem fnProviding={onStrict} product={item} key={index}
                    onPressImg={() => this.gotoGoodDetail(item.id)}
                    opBar={this.opBar(onSale, onStrict, item)}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsList);

const styles = StyleSheet.create({
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
    width: '100%',
    backgroundColor: '#EEDEE0',
    height: pxToDp(150)
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
    borderLeftColor: colors.main_color,
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
    borderRightWidth: pxToDp(1),
    borderColor: colors.colorDDD,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    flex: 1
  },
  btnWrap: {
    flex: 1,
    backgroundColor:
    colors.white,
    borderTopWidth: pxToDp(1),
    borderColor: colors.colorDDD
  },
  n2grey6: {
    color: colors.color666,
    fontSize: 12
  },
  row_center: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  readNotification: {
    marginRight: 10,
    marginBottom: 8,
    flex: 2,
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#E26A6E',
  }
})
