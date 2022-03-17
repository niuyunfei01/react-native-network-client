import React, {Component} from "react"
import {FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool, {simpleStore} from "../../common/tool"
import HttpUtils from "../../util/http"
import Cts from "../../Cts";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";
import GoodListItem from "../component/GoodListItem";
import GoodItemEditBottom from "../component/GoodItemEditBottom";
import {hideModal, showError, showModal, ToastLong} from "../../util/ToastUtils";
import Dialog from "../component/Dialog";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import GlobalUtil from "../../util/GlobalUtil";
import Entypo from "react-native-vector-icons/Entypo";


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

const initState = {
  currStoreId: '',
  goods: [],
  page: 1,
  statusList: [
    {label: '全部', value: 'all'},
    {label: '缺货', value: 'out_of_stock'},
    {label: '最近上新', value: 'new_arrivals'},
    {label: '在售', value: 'in_stock'},
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
};

class StoreGoodsList extends Component {
  state = initState

  constructor(props) {
    super(props);
    const {currStoreId, accessToken} = this.props.global;
    this.state.currStoreId = currStoreId;
    const {global, dispatch} = this.props
    simpleStore(global, dispatch, (store) => {
      this.setState({
        fnPriceControlled: store['fn_price_controlled'],
        fnProviding: Number(store['strict_providing']) > 0,
        init: true
      })
      this.fetchUnreadPriceAdjustment(store.id, accessToken)
    })
  }

  restart() {
    this.fetchGoodsCount()
  }

  fetchGoodsCount() {
    const {currStoreId, accessToken} = this.props.global;
    const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
    HttpUtils.get.bind(this.props)(`/api/count_products_with_status/${currStoreId}?access_token=${accessToken}`,).then(res => {
      const newStatusList = [
        {label: '全部 ' + res.all, value: 'all'},
        {label: '缺货 ' + res.out_of_stock, value: 'out_of_stock'},
        {label: '最近上新 ' + res.new_arrivals, value: 'new_arrivals'},
        {label: '在售 ' + res.in_stock, value: 'in_stock'},
      ]
      this.setState({
        statusList: [...newStatusList],
        selectedStatus: {...newStatusList[0]}
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
      hideModal()
    }, () => {
      this.setState({loadingCategory: false})
    })
  }

  fetchUnreadPriceAdjustment(storeId, accessToken) {
    HttpUtils.get.bind(this.props)(`/api/is_existed_unread_price_adjustments/${storeId}?access_token=${accessToken}`).then(res => {
      if (res) {
        this.setState({
          shouldShowNotificationBar: true
        })
      }
    })
  }


  search = () => {
    showModal('加载中')
    const accessToken = this.props.global.accessToken;
    const {currVendorId} = tool.vendor(this.props.global);
    const {prod_status} = this.props.route.params || {};

    const storeId = this.props.global.currStoreId;
    const params = {
      vendor_id: currVendorId,
      status: this.state.selectedStatus.value,
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
      hideModal()
      const totalPage = res.count / res.pageSize
      const isLastPage = res.page >= totalPage
      const goods = Number(res.page) === 1 ? res.lists : this.state.goods.concat(res.lists)
      this.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
    }, (res) => {
      hideModal()
      showError(res.reason)
      this.setState({isLoading: false})
    })
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

  onRefresh() {
    if (GlobalUtil.getGoodsFresh() === 2) {
      GlobalUtil.setGoodsFresh(1)
      return null;
    }
    this.setState({page: 1, goods: []}, () => {
      this.search()
    })
  }

  onLoadMore() {
    let page = this.state.page
    this.setState({page: page + 1}, () => {
      this.search()
    })
  }

  onSelectCategory(category) {
    this.setState({
      selectedTagId: category.id,
      selectedChildTagId: '',
      page: 1,
      isLoading: true,
      goods: []
    }, () => {
      this.search()
    })
  }

  onSelectChildCategory(childCategory) {
    this.setState({
      selectedChildTagId: childCategory.id,
      page: 1,
      isLoading: true,
      goods: []
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
    const categories = this.state.categories
    let item = []
    for (let i in categories) {
      item.push(this.renderCategory(categories[i]))
    }
    return item
  }


  onSelectStatus = () => {
    this.setState({
      page: 1,
      isLoading: true,
      goods: [],
      selectedTagId: '',
      selectedChildTagId: '',
    }, () => {
      const {accessToken} = this.props.global;
      const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
      this.fetchCategories(this.props.global.currStoreId, prod_status, accessToken)
    })
  }

  readNotification() {
    const {accessToken, currStoreId} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_price_adjustments/${currStoreId}/?access_token=${accessToken}`).then(res => {
      // ToastShort("设置为已读");
    })
  }


  render() {
    const p = this.state.selectedProduct;
    const sp = this.state.selectedProduct.sp;
    const {accessToken} = this.props.global;

    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <FetchRender navigation={this.props.navigation} onRefresh={this.restart.bind(this)}/>
        <View style={styles.container}>

          <Dialog visible={this.state.showstatusModal} onRequestClose={() => this.setState({showstatusModal: false})}>
            {this.showstatusSelect()}
          </Dialog>

          {this.state.shouldShowNotificationBar ? <View style={styles.notificationBar}>
            <Text style={[Styles.n2grey6, {padding: 12, flex: 10}]}>您申请的调价商品有更新，请及时查看</Text>
            <TouchableOpacity onPress={() => {
              this.readNotification()
              this.props.navigation.navigate(Config.ROUTE_GOODS_APPLY_RECORD)
            }}
                              style={{
                                marginRight: 10,
                                marginBottom: 8,
                                flex: 2,
                                alignItems: 'center',
                                alignSelf: 'flex-end',
                                backgroundColor: '#E26A6E',
                              }}>
              <Text style={{color: 'white'}}>查看</Text>
            </TouchableOpacity>
          </View> : null}

          <View style={{
            flex: 14, flexDirection: 'row'
          }}>

            <View style={styles.categoryBox}>
              <ScrollView>
                {this.renderCategories()}
              </ScrollView>
            </View>

            <View style={{flex: 1}}>
              {this.renderChildrenCategories()}
              <FlatList
                extraData={this.state.goods}
                data={this.state.goods}
                legacyImplementation={false}
                directionalLockEnabled={true}
                onEndReachedThreshold={0.3}
                onEndReached={() => {
                  if (this.state.isCanLoadMore) {
                    this.setState({isCanLoadMore: false}, () => {
                      this.onLoadMore();
                    })
                  }
                }}
                onMomentumScrollBegin={() => {
                  this.setState({
                    isCanLoadMore: true
                  })
                }}
                onTouchMove={(e) => {
                  if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
                    this.setState({scrollLocking: true});
                  } else {
                    this.setState({scrollLocking: false});
                  }
                }}
                renderItem={this.renderItem.bind(this)}
                onRefresh={this.onRefresh.bind(this)}
                refreshing={this.state.isLoading}
                keyExtractor={this._keyExtractor}
                shouldItemUpdate={this._shouldItemUpdate}
                getItemLayout={this._getItemLayout}
                initialNumToRender={5}
              />
            </View>
          </View>

          {sp && <GoodItemEditBottom key={sp.id} pid={Number(p.id)} modalType={this.state.modalType}
                                     productName={p.name}
                                     strictProviding={false} accessToken={accessToken}
                                     storeId={Number(this.props.global.currStoreId)}
                                     currStatus={Number(sp.status)}
                                     doneProdUpdate={this.doneProdUpdate.bind(this)}
                                     onClose={() => this.setState({modalType: ''})}
                                     spId={Number(sp.id)}
                                     applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                     beforePrice={Number(sp.supply_price)}/>}
        </View>

      </View>
    )
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
    return (
      <View style={{
        flexDirection: 'row',
        height: 40,
        backgroundColor: colors.white,
        borderBottomColor: colors.fontGray,
        borderBottomWidth: pxToDp(1)
      }}>
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginLeft: 15}}
                          onPress={() => {
                            this.setState({
                              showstatusModal: true
                            })
                          }}>
          <Text>{this.state.selectedStatus.label}</Text>
          <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5}}/>
        </TouchableOpacity>

        <View style={{flex: 1}}></View>
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginLeft: 15}}
                          onPress={() => {
                            navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add'})
                          }}>
          <Text>上新</Text>
          <Entypo name='circle-with-plus' style={{fontSize: 18, marginLeft: 5}}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={{flexDirection: 'row', justifyContent: "center", alignItems: 'center', marginHorizontal: 15}}
          onPress={() => {
            navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {updatedCallback: this.doneProdUpdate.bind(this)})
          }}>
          <Entypo name='magnifying-glass' style={{fontSize: 18, marginLeft: 5}}/>
        </TouchableOpacity>
      </View>
    )
  }


  showstatusSelect() {
    let items = []
    let that = this;
    let selectedStatus = that.state.selectedStatus;
    for (let i in this.state.statusList) {
      const status = that.state.statusList[i]
      items.push(<RadioItem key={i} style={{
        backgroundColor: colors.white,
      }}
                            checked={selectedStatus.value === status.value}
                            onChange={event => {
                              if (event.target.checked) {
                                this.setState({
                                  showstatusModal: false,
                                  selectedStatus: status
                                }, () => this.onSelectStatus(status.value))
                              }
                            }}><Text
        style={{
          fontSize: 18,
          color: colors.fontBlack,
        }}>{status.label}</Text></RadioItem>)
    }
    return <View style={{marginTop: 2}}>
      {items}
    </View>
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
        <Text style={Styles.n2grey6}>{childCategory.name}</Text>
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


  renderItem(order) {
    let {item, index} = order;
    const onSale = (item.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    return (
      <GoodListItem fnProviding={this.state.fnProviding} product={item} key={index}
                    onPressImg={() => this.gotoGoodDetail(item.id)}
                    opBar={<View style={[Styles.rowcenter, {
                      flex: 1,
                      padding: 5,
                      backgroundColor: colors.white,
                      borderTopWidth: pxToDp(1),
                      borderColor: colors.colorDDD
                    }]}>

                      {onSale ?
                        <TouchableOpacity style={[styles.toOnlineBtn]}
                                          onPress={() => this.onOpenModal('off_sale', product)}>
                          <Text>下架</Text>
                        </TouchableOpacity> :
                        <TouchableOpacity style={[styles.toOnlineBtn]}
                                          onPress={() => this.onOpenModal('on_sale', product)}>
                          <Text>上架</Text>
                        </TouchableOpacity>}

                      <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                                        onPress={() => this.onOpenModal('set_price', product)}>
                        <Text>报价</Text>
                      </TouchableOpacity>

                    </View>}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreGoodsList);

const styles = StyleSheet.create({
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
    flex: 1
  }
})
