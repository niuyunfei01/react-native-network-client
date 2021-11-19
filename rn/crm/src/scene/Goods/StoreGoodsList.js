import React, {Component, PureComponent} from "react"
import {FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool, {simpleStore} from "../../common/tool"
import color from "../../widget/color"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import {NavigationItem} from "../../widget";
import Cts from "../../Cts";
import colors from "../../styles/colors";
import Styles from "../../themes/Styles";
import GoodListItem from "../component/GoodListItem";
import GoodItemEditBottom from "../component/GoodItemEditBottom";
import {List, Popover, Provider} from "@ant-design/react-native";
import {hideModal, showError, showModal} from "../../util/ToastUtils";
import native from "../../common/native";
import Dialog from "../component/Dialog";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import JbbText from "../component/JbbText";


class ImageBtn extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {

    const {source, onPress, imageStyle, ...others} = this.props;

    return <TouchableOpacity onPress={onPress} others>
      <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
    </TouchableOpacity>
  }
}

function mapStateToProps(state) {
  const {global} = state
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

const initState = {
  currStoreId: '',
  init: false,
  fnPriceControlled: false,
  strictProviding: false,
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
  isLoadingMore: false,
  loadingCategory: true,
  isLastPage: false,
  selectedTagId: '',
  selectedChildTagId: '',
  fnProviding: false,
  modalType: '',
  selectedStatus: '',
  selectedProduct: {},
  onlineType: 'browse',
  bigImageUri: [],
  shouldShowNotificationBar: false,
  showstatusModal: false,
};
const Item = Popover.Item;

class StoreGoodsList extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => {
        return (
          <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
            this.setState({
              showstatusModal: true
            })
          }}>
            <Text style={{
              paddingHorizontal: 9,
              paddingTop: 16,
              color: '#2b2b2b',
              fontWeight: 'bold',
            }}>{this.state.selectedStatus.label}</Text>
            <View style={{paddingTop: pxToDp(10)}}>
              <ImageBtn source={require('../../img/Order/pull_down.png')} imageStyle={{
                width: pxToDp(60),
                height: pxToDp(60)
              }}
              /></View>
          </TouchableOpacity>
        )
      },
      headerRight: () => (<View style={[Styles.endcenter, {height: pxToDp(60)}]}>
          <NavigationItem title={'上新'} icon={require('../../img/Goods/zengjiahui_.png')}
                          iconStyle={Styles.navLeftIcon}
                          onPress={() => {
                            // noinspection JSIgnoredPromiseFromCall
                            native.reportRoute("StoreGoodsListClickEditGoods");
                            navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'add'})
                          }}/>
          <NavigationItem
            iconStyle={[Styles.navLeftIcon, {tintColor: colors.color333}]}
            icon={require('../../img/Home/icon_homepage_search.png')}
            onPress={() => {
              navigation.navigate(Config.ROUTE_NEW_GOODS_SEARCH, {updatedCallback: this.doneProdUpdate.bind(this)})
            }}/>
        </View>
      ),
    })
  }

  state = initState

  static getDerivedStateFromProps(props, state) {
    if (props.global.currStoreId !== state.currStoreId) {
      return {...initState, currStoreId: props.global.currStoreId}
    }
    return null;
  }

  constructor(props) {
    super(props);
    const {currStoreId} = this.props.global;
    this.state.currStoreId = currStoreId;
    this.navigationOptions(this.props)
    showModal('加载中')
  }

  componentDidMount() {
    this.initState()
  }

  showstatusSelect() {
    let items = []
    let that = this;
    let selectedStatus = that.state.selectedStatus;
    for (let i in this.state.statusList) {
      const status = that.state.statusList[i]
      items.push(<RadioItem key={i} style={{
        backgroundColor: colors.white,
        borderBottomWidth: pxToDp(2),
      }}
                            checked={selectedStatus.value === status.value}
                            onChange={event => {
                              if (event.target.checked) {
                                this.setState({
                                  showstatusModal: false,
                                  selectedStatus: status
                                }, () => this.onSelectStatus(status.value))
                              }
                            }}><JbbText
        style={{
          fontSize: 18,
          color: colors.fontBlack,
        }}>{status.label}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 2}}>
      {items}
    </List>
  }

  initState() {
    //设置函数
    const {accessToken} = this.props.global;
    const {global, dispatch} = this.props
    simpleStore(global, dispatch, (store) => {
      this.setState({
        fnPriceControlled: store['fn_price_controlled'],
        fnProviding: Number(store['strict_providing']) > 0,
        init: true
      })
      this.fetchGoodsCount(store.id, accessToken)
      this.fetchUnreadPriceAdjustment(store.id, accessToken)
    })
  }

  fetchCategories(storeId, prod_status, accessToken) {
    const hideAreaHot = prod_status ? 1 : 0;
    const selectedStatus = this.state.selectedStatus.value
    HttpUtils.get.bind(this.props)(`/api/list_store_prod_tags/${storeId}/${selectedStatus}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
      this.setState({
          categories: res,
          selectedTagId: res[0] ? res[0].id : null,
          loadingCategory: false,
          isLoading: true
        },
        () => {
          this.search()
        }
      )
      hideModal()
    }, (res) => {
      hideModal()
      this.setState({loadingCategory: false, loadCategoryError: res.reason || '加载分类信息错误'})
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

  fetchGoodsCount(storeId, accessToken) {
    const props = this.props;
    const {prod_status = Cts.STORE_PROD_ON_SALE} = props.route.params || {};
    HttpUtils.get.bind(props)(`/api/count_products_with_status/${storeId}?access_token=${accessToken}`,).then(res => {
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
        this.navigationOptions(props)
        this.fetchCategories(storeId, prod_status, accessToken)
      })
    }, (res) => {
      hideModal()
      this.setState({loadingCategory: false, loadCategoryError: res.reason || '加载分类信息错误'})
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
      this.setState({goods: goods, isLastPage: isLastPage, isLoading: false, isLoadingMore: false})
    }, (res) => {
      hideModal()
      showError(res.reason)
      this.setState({isLoading: false, isLoadingMore: false})
    })
  }

  doneProdUpdate = (pid, prodFields, spFields) => {
    const idx = this.state.goods.findIndex(g => `${g.id}` === `${pid}`);
    const item = this.state.goods[idx];
    console.log("doneProdUpdate find ", item, "index", idx, prodFields, spFields)

    const removal = `${spFields.status}` === `${Cts.STORE_PROD_OFF_SALE}`
    if (removal) {
      this.state.goods.splice(idx, 1)
      console.log("doneProdUpdate remove at index", idx)
    } else {
      Object.keys(prodFields).map(k => {
        item[k] = prodFields[k]
      })
      Object.keys(spFields).map(k => {
        item['sp'][k] = spFields[k]
      })

      console.log("doneProdUpdate updated", item, "index", idx)

      this.state.goods[idx] = item;
    }
    this.setState({goods: this.state.goods})
  }

  onRefresh() {

    showModal('加载中')

    this.setState({page: 1, goods: [], isLoadingMore: true}, () => {
      this.search()
      this.initState()
    })
  }

  onLoadMore() {
    let page = this.state.page
    showModal('加载中')
    this.setState({page: page + 1, isLoadingMore: true}, () => {
      this.search()
      this.initState()
    })
  }

  onSelectCategory(category) {
    showModal('加载中')
    this.setState({
      selectedTagId: category.id,
      selectedChildTagId: '',
      page: 1,
      onlineType: 'browse',
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
    }, () => {
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
      updatedCallback: this.doneProdUpdate
    })
  }

  renderRow = (product, idx) => {
    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    return <GoodListItem fnProviding={!!this.state.fnProviding} product={product} key={idx}
                         onPressImg={() => this.gotoGoodDetail(product.id)}
                         opBar={<View style={[Styles.rowcenter, {
                           flex: 1,
                           padding: 5,
                           backgroundColor: colors.white,
                           borderTopWidth: pxToDp(1),
                           borderColor: colors.colorDDD
                         }]}>
                           {onSale &&
                           <TouchableOpacity style={[styles.toOnlineBtn]}
                                             onPress={() => this.onOpenModal('off_sale', product)}>
                             <Text>下架</Text>
                           </TouchableOpacity>}

                           {!onSale &&
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

  renderChildCategory(childCategory) {
    const isActive = this.state.selectedChildTagId === childCategory.id
    let itemStyle = [styles.categoryItem, isActive && {
      backgroundColor: '#fff',
      borderTopWidth: pxToDp(10),
      borderTopColor: color.theme,
    }];
    return (
      <TouchableOpacity key={childCategory.id} onPress={() => this.onSelectChildCategory(childCategory)}
                        style={[itemStyle, {padding: 10, backgroundColor: colors.white, marginLeft: 2}]}>
        <Text style={Styles.n2grey6}>{childCategory.name}</Text>
      </TouchableOpacity>
    )
  }

  onSelectStatus = () => {
    showModal('加载中')
    this.setState({
      page: 1,
      onlineType: 'browse',
      isLoading: true,
      goods: [],
      selectedTagId: '',
      selectedChildTagId: '',
    }, () => {
      const {accessToken} = this.props.global;
      const {prod_status = Cts.STORE_PROD_ON_SALE} = this.props.route.params || {};
      this.fetchCategories(this.props.global.currStoreId, prod_status, accessToken)
      this.navigationOptions(this.props)
    })
  }

  readNotification() {
    const {accessToken, currStoreId} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_price_adjustments/${currStoreId}/?access_token=${accessToken}`).then(res => {
      // ToastShort("设置为已读");
    }, (res) => {
      console.log(res)
    })
  }

  onSelectChildCategory(childCategory) {
    showModal('加载中')
    this.setState({
      selectedChildTagId: childCategory.id,
      page: 1,
      onlineType: 'browse',
      isLoading: true,
      goods: []
    }, () => {
      this.search()
      this.initState()
    })
  }

  render() {
    const p = this.state.selectedProduct;
    const sp = this.state.selectedProduct.sp;
    const {accessToken} = this.props.global;
    if (!this.state.init) {
      this.initState();
    }
    return (

      <Provider>
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
            {!this.state.loadingCategory &&
            <View style={{flex: 1}}>
              {this.renderChildrenCategories()}
              <If condition={this.state.goods && this.state.goods.length}>
                <FlatList
                  refreshControl={
                    <RefreshControl
                      refreshing={this.props.isRefreshing}
                      onRefresh={() => {
                        this.onRefresh && this.onRefresh()
                      }}
                      tintColor="#000"
                      title="下拉刷新"
                      titleColor="#000"
                      colors={['#ff0000', '#00ff00', '#0000ff']}
                      progressBackgroundColor="#ffffff"
                    />
                  }
                  renderItem={({item, index}) => this.renderRow(item, index)}
                  data={this.state.goods}
                  onEndReachedThreshold={0.4}>
                </FlatList>
              </If>
              <If
                condition={!(this.state.goods && this.state.goods.length) && !this.state.isLoading && !this.state.isLoadingMore}>
                <NoFoundDataView/>
              </If>
            </View>}
          </View>


          {sp && <GoodItemEditBottom key={sp.id} pid={Number(p.id)} modalType={this.state.modalType}
                                     productName={p.name}
                                     strictProviding={false} accessToken={accessToken}
                                     storeId={Number(this.props.global.currStoreId)}
                                     currStatus={Number(sp.status)}
                                     doneProdUpdate={this.doneProdUpdate}
                                     onClose={() => this.setState({modalType: ''})}
                                     spId={Number(sp.id)}
                                     applyingPrice={Number(sp.applying_price || sp.supply_price)}
                                     beforePrice={Number(sp.supply_price)}/>}

          {/*<Toast icon="loading" show={this.state.loadingCategory} onRequestClose={() => {*/}
          {/*}}>加载中</Toast>*/}
          {/*<Toast icon="loading" show={this.state.isLoading || this.state.isLoadingMore}*/}
          {/*       onRequestClose={() => {*/}
          {/*       }}/>*/}
        </View></Provider>
    )
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
