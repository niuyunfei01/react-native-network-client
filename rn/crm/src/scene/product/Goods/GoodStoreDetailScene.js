import React, {PureComponent} from 'react';
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  View
} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import * as tool from "../../../pubilc/util/tool";
import {
  fetchProductDetail,
  fetchVendorProduct,
  fetchVendorTags,
  UpdateWMGoods
} from "../../../reducers/product/productActions";
import Cts from "../../../pubilc/common/Cts";
import Swiper from 'react-native-swiper';
import HttpUtils from "../../../pubilc/util/http";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import {Provider} from "@ant-design/react-native";
import Mapping from "../../../pubilc/Mapping";
import NoFoundDataView from "../../common/component/NoFoundDataView";
import Config from "../../../pubilc/common/config";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import {hideModal, showModal, showSuccess, showError} from "../../../pubilc/util/ToastUtils";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import AntDesign from "react-native-vector-icons/AntDesign";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProductDetail,
      fetchVendorProduct,
      fetchVendorTags,
      UpdateWMGoods,
      ...globalActions
    }, dispatch)
  }
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

const MORE_ITEM = [
  {
    value: '1',
    label: '报价'
  },
  {
    value: '2',
    label: '库存'
  },
  {
    value: '3',
    label: '库存属性'
  },
  {
    value: '4',
    label: '摊位关联'
  },
  {
    value: '5',
    label: '零售价格'
  },
]

class GoodStoreDetailScene extends PureComponent {

  constructor(props: Object) {
    super(props);
    let {pid, storeId, item} = (this.props.route.params || {});
    let {is_service_mgr, is_helper, allow_merchants_edit_prod} = tool.vendor(this.props.global);
    let vendorId = this.props.global.config.vendor.id
    this.state = {
      ext_stores: [],
      isRefreshing: false,
      isLoading: false,
      isSyncGoods: false,
      full_screen: false,
      product_id: pid,
      store_id: storeId,
      product: {},
      store_prod: {},
      fnProviding: false,
      is_service_mgr: is_service_mgr,
      is_helper: is_helper,
      allow_merchants_edit_prod: Number(allow_merchants_edit_prod) === 1,
      sync_goods_info: false,
      include_img: false,
      batch_edit_supply: false,
      fn_price_controlled: true,
      errorMsg: '',
      vendorId: vendorId,
      AffiliatedInfo: item,
      activity: 'offer',
      selectItem: {
        value: '',
        label: '更多'
      },
      selectStall: {
        value: '',
        label: '请选择要关联的摊位'
      },
      selectedSpecArray: [],
      selectedSpec: {
        value: '',
        label: '请选择商品的规格'
      },
      stallVisible: false
    };
    GlobalUtil.setGoodsFresh(2)
    this.getStoreProdWithProd = this.getStoreProdWithProd.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
  }

  componentDidUpdate() {
    let {key, params} = this.props.route;
    let {isRefreshing} = (params || {});
    if (isRefreshing) {
      this.setState({isRefreshing: isRefreshing})
      const setRefresh = this.props.navigation.setParams({
        isRefreshing: false,
        key: key
      });
      this.props.navigation.dispatch(setRefresh);
      this.getStoreProdWithProd();
    }
  }

  componentDidMount() {
    const {fn_stall} = this.props.global.simpleStore
    this.handleAuthItem('fn_stall', fn_stall ? fn_stall : '0')
    //showModal('加载中')
    const {accessToken} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_store_simple/${this.state.store_id}?access_token=${accessToken}`).then(store => {
      //hideModal()
      this.handleAuthItem('strict_providing', store.strict_providing ? store.strict_providing : '0')
      this.setState({
        fn_price_controlled: store['fn_price_controlled'],
        fnProviding: Number(store['strict_providing']) > 0
      })

    }, (res) => {
      //hideModal()
    }).catch(() => {
      //hideModal()
    })
    this.getStoreProdWithProd();
  }

  handleAuthItem = (authName, value) => {
    const stockIndex = MORE_ITEM.findIndex(item => item.label === '库存')
    const stallIndex = MORE_ITEM.findIndex(item => item.label === '摊位关联')
    const retail_price_enabledIndex = MORE_ITEM.findIndex(item => item.label === '零售价格')
    switch (authName) {
      case 'strict_providing':
        if (value === '0' && stockIndex !== -1)
          MORE_ITEM.splice(stockIndex, 2)
        if (value === '1' && stockIndex === -1) {
          MORE_ITEM.push({value: '2', label: '库存'})
          MORE_ITEM.push({value: '3', label: '库存属性'})
        }
        break
      case 'fn_stall':
        if (value === '0' && stallIndex !== -1)
          MORE_ITEM.splice(stallIndex, 1)
        if (value === '1' && stallIndex === -1)
          MORE_ITEM.push({value: '4', label: '摊位关联'})
        break
      case 'retail_price_enabled':
        if (value === '0' && retail_price_enabledIndex !== -1)
          MORE_ITEM.splice(retail_price_enabledIndex, 1)
        if (value === '1' && retail_price_enabledIndex === -1)
          MORE_ITEM.push({value: '5', label: '零售价格'})
        break
    }
  }

  getproduct() {
    //showModal('加载中')
    const {accessToken} = this.props.global;
    const {product_id, store_id, vendorId} = this.state;
    HttpUtils.get.bind(this.props)(`/api/get_product_detail/${product_id}/${vendorId}/${store_id}?access_token=${accessToken}`).then(res => {
      //hideModal()
      if (this.state.allow_merchants_edit_prod) {
        this.props.navigation.setOptions({
          headerRight: () => (<View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => {
                InteractionManager.runAfterInteractions(() => {
                  this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
                    type: 'edit',
                    product_detail: res,
                  });
                });
              }}>
              <FontAwesome name='pencil-square-o' style={styles.btn_edit}/>
            </TouchableOpacity>
          </View>),
        })
      }

    }).catch(error => {
      //hideModal()
    })
  }

  getStoreProdWithProd() {
    this.getproduct()
    const {accessToken} = this.props.global;
    const storeId = this.state.store_id || 0;
    const pid = this.state.product_id || 0;
    const {params} = this.props.route
    const url = `/api_products/get_prod_with_store_detail/${storeId}/${pid}?access_token=${accessToken}`;
    //showModal('加载中')
    HttpUtils.post.bind(this.props)(url).then((data) => {
      const product = pid === 0 ? params.item : data.p
      const spec = {...product, ...data.sp}
      const retail_price_enabled = data.vendor?.retail_price_enabled ? data.vendor.retail_price_enabled : '0'
      this.handleAuthItem('retail_price_enabled', retail_price_enabled)
      const selectedSpecArray = []
      if (spec?.sku_name !== undefined) {
        selectedSpecArray.push({
          value: spec.product_id,
          label: spec.sku_name ? spec.sku_name : spec.name,
          stallName: spec.stall_name,
          price: spec.supply_price,
          goodsName: spec.name,
        })
      }
      if (spec?.skus?.length > 0)
        spec.skus.map(sku => {
          selectedSpecArray.push({
            value: sku.product_id,
            label: sku.sku_name,
            stallName: sku.stall_name,
            price: sku.supply_price,
            goodsName: spec.name
          })
        })
      selectedSpecArray.sort((a, b) => {
        return a.label > b.label ? 1 : -1
      })
      if (pid === 0) {
        this.setState({
          ext_stores: data.ext_stores,
          product: params.item,
          store_prod: data.sp,
          isRefreshing: false,
          selectedSpecArray: selectedSpecArray
        })
      } else {
        this.setState({
          ext_stores: data.ext_stores,
          product: data.p,
          store_prod: data.sp,
          isRefreshing: false,
          selectedSpecArray: selectedSpecArray
        })
      }

      //hideModal()
    }, (res) => {
      //hideModal()
      this.setState({isRefreshing: false, errorMsg: `未找到商品:${res.reason}`})
    }).catch(error => {
      //hideModal()
      this.setState({isRefreshing: false, errorMsg: `未找到商品:${error.reason}`})
    })
  }

  onHeaderRefresh = () => {
    this.setState({isRefreshing: true});
    this.getStoreProdWithProd();
  }

  gotoStockCheck = (store_prod) => {
    this.props.navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK, {
      productId: this.state.product.id,
      storeId: this.state.store_id,
      shelfNo: this.state.store_prod.shelf_no,
      productName: this.state.product.name,
      storeProd: store_prod
    })
  }

  gotoInventoryProp = () => {
    this.props.navigation.navigate(Config.ROUTE_INVENTORY_PRODUCT_INFO, {
      pid: this.state.product.id
    })
  }

  onDoneProdUpdate = (pid, prodFields, spFields) => {

    const {updatedCallback} = (this.props.route.params || {})
    updatedCallback && updatedCallback(pid, prodFields, spFields)

    const {product, store_prod} = this.state;
    const _p = {...product, ...prodFields}
    const _sp = {...store_prod, ...spFields}
    this.setState({store_prod: _sp, product: _p})
  }

  onOpenModal(modalType) {
    this.setState({
      modalType: modalType,
    })
  }

  refreshControl = () => {
    return (
      <RefreshControl refreshing={this.state.isRefreshing} onRefresh={this.onHeaderRefresh} tintColor='gray'/>
    )
  }

  render() {
    let {full_screen, product, store_prod, selectItem, errorMsg, vendorId, product_id, activity} = this.state;
    if (full_screen) {
      if (product_id != 0)
        return this.renderImg(product.list_img, product.source_img);
      return this.renderImg(this.state.AffiliatedInfo.product_img);
    }

    if (!product) {
      return errorMsg ? <NoFoundDataView msg={errorMsg}/> : <NoFoundDataView/>
    }

    const onSale = (store_prod || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (store_prod || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    const {accessToken} = this.props.global;
    const sp = store_prod
    const applyingPrice = parseInt(sp.applying_price || sp.supply_price)
    return (
      <Provider>
        <View style={styles.page}>
          <FetchView navigation={this.props.navigation} onRefresh={this.getStoreProdWithProd.bind(this)}/>
          <ScrollView refreshControl={this.refreshControl()} style={styles.scrollViewWrap}>
            {
              product_id != 0 ? this.renderImg(product.mid_list_img) : this.renderImg(this.state.AffiliatedInfo.product_img)
            }
            <View style={[styles.goods_info, styles.top_line]}>
              <View style={[styles.goods_view]}>
                <If condition={product_id != 0}>
                  <Text style={styles.goods_name}> {product.name} <Text
                    style={styles.goods_id}> (#{product.id}) </Text>
                  </Text>
                </If>
                <If condition={product_id == 0}>
                  <Text style={styles.goods_name}> {product.name} <Text
                    style={styles.goods_id}> (#{product.id}) </Text>
                  </Text>
                </If>
                {product.tag_list && product.tag_list.split(',').map(function (cat_name, idx) {
                  return (
                    <Text key={idx} style={styles.goods_cats}> {cat_name}   </Text>
                  );
                })}
              </View>
            </View>
            <If condition={vendorId != 68}>
              <View style={{margin: 10}}>
                <View style={{marginTop: 18, marginBottom: 8, marginLeft: 8}}>
                  <Text style={{fontSize: 14, color: '#333333'}}>门店状态</Text>
                </View>
                <View style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: colors.white,
                  width: '98%',
                  borderRadius: pxToDp(10),
                  marginBottom: 10
                }}>
                  <View style={{
                    paddingLeft: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <Text style={{fontWeight: "bold", color: colors.color333}}>售卖状态</Text>
                    <View style={{alignItems: "center", justifyContent: "center", flexDirection: "row", padding: 10}}>
                      <Text style={styles.normalText}>
                        {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, store_prod.status)}
                      </Text>
                      <Text style={styles.normalText}>{this.renderIcon(parseInt(store_prod.status))} </Text>
                    </View>
                  </View>
                  <View style={{flexDirection: "row"}}>
                    <TouchableOpacity style={[activity === 'offer' ? styles.tabActivity : styles.tab]}
                                      onPress={() => this.setState({activity: 'offer'})}>
                      <Text style={activity === 'offer' ? styles.tabTextActivity : styles.tabText}>
                        报价
                      </Text>
                    </TouchableOpacity>
                    <If condition={onStrict}>
                      <TouchableOpacity style={activity === 'inventory_num' ? styles.tabActivity : styles.tab}
                                        onPress={() => this.setState({activity: 'inventory_num'})}>
                        <Text style={activity === 'inventory_num' ? styles.tabTextActivity : styles.tabText}>
                          库存数量
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={activity === 'inventory_attribute' ? styles.tabActivity : styles.tab}
                        onPress={() => this.setState({activity: 'inventory_attribute'})}>
                        <Text style={activity === 'inventory_attribute' ? styles.tabTextActivity : styles.tabText}>
                          库存属性
                        </Text>
                      </TouchableOpacity>
                    </If>
                  </View>
                  {this.renderRuleStatusTab()}
                </View>
              </View>
              {this.renderStall()}
            </If>
          </ScrollView>
          <If condition={vendorId != 68}>
            <View style={styles.bottomWrap}>
              <If condition={onSale}>
                <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('off_sale')}>
                  <Text style={styles.bottomText}>下架 </Text>
                </TouchableOpacity>
              </If>
              <If condition={!onSale}>
                <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('on_sale')}>
                  <Text style={styles.bottomText}>上架 </Text>
                </TouchableOpacity>
              </If>
              <If condition={MORE_ITEM.length > 1}>
                <ModalSelector style={[styles.toOnlineBtn]}
                               data={MORE_ITEM}
                               skin="customer"
                               defaultKey={-999}
                               onChange={value => this.onChange(value, store_prod)}>
                  <Text style={styles.moreText}>
                    {selectItem.label}
                  </Text>
                </ModalSelector>
              </If>
              <If condition={MORE_ITEM.length < 2}>
                <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('set_price')}>
                  <Text style={styles.moreText}>报价 </Text>
                </TouchableOpacity>
              </If>
            </View>
            {this.renderModalStall()}
          </If>
          <If condition={sp && product.id && vendorId != 68}>
            <GoodItemEditBottom modalType={this.state.modalType}
                                productName={product.name}
                                pid={Number(sp.product_id)}
                                skuName={product.sku_name}
                                strictProviding={this.state.fnProviding}
                                accessToken={accessToken}
                                storeId={Number(sp.store_id)}
                                currStatus={Number(sp.status)}
                                doneProdUpdate={this.onDoneProdUpdate}
                                onClose={() => this.setState({modalType: ''})}
                                spId={Number(sp.id)}
                                applyingPrice={applyingPrice}
                                storePro={{...product, ...store_prod}}
                                navigation={this.props.navigation}
                                beforePrice={Number(sp.supply_price)}/>
          </If>
        </View>
      </Provider>
    );
  }

  renderStall = () => {
    const {selectedSpecArray} = this.state
    return (
      <If condition={selectedSpecArray.length > 0}>
        <View style={styles.stallWrap}>
          <View style={styles.stallTopWrap}>
            <Text style={styles.stallTopText}>
              关联摊位
            </Text>

          </View>
          <For each="info" index="i" of={selectedSpecArray}>
            <If condition={info?.stallName?.length > 0}>
              <View style={styles.modalRowWrap} key={i}>
                <Text style={styles.stallBottomText}>
                  {info.stallName}
                </Text>
                <Text style={styles.stallBottomText}>
                  {info.label}
                </Text>
              </View>
            </If>
          </For>
        </View>
      </If>

    )
  }

  onShowStall = () => {
    this.getStallData()
  }
  getStallData = () => {
    const {currStoreId, accessToken} = this.props.global;
    const url = `/api_products/get_stall_by_store_id?access_token=${accessToken}`
    const params = {store_id: currStoreId}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      const stallArray = []
      res && res.map(item => {
        stallArray.push({...item, value: item.id, label: item.name})
      })

      this.setState({stallArray: stallArray})
    })
  }

  onChangeStall = (value) => {
    this.setState({selectStall: value})
  }

  onChangeSpec = (value) => {
    this.setState({selectedSpec: value})
  }
  submitStallAndSpec = (product_id, stall_id, flag) => {
    if (!flag) {
      showError('请先选择摊位或者规格')
      return
    }
    const {currStoreId, accessToken} = this.props.global;
    const params = {store_id: currStoreId, product_id: product_id, stall_id: stall_id}
    const url = `/api_products/save_prod_stall?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(url, params).then(() => {
      showSuccess('绑定成功', 3)
      this.getStoreProdWithProd()
      this.closeModal()
    })
  }
  renderModalStall = () => {
    const {stallArray, selectStall, selectedSpec, selectedSpecArray, stallVisible} = this.state
    const flag = selectStall.value && (selectedSpecArray.length > 0 ? selectedSpec.value : selectedSpec.label)
    return (
      <Modal visible={stallVisible} transparent={true} hardwareAccelerated={true} animationType={'fade'}
             onShow={this.onShowStall}>
        <View style={styles.modalWrap}>
          <View style={styles.modalVisibleAreaWrap}>
            <View style={styles.modalTitleWrap}>
              <View/>
              <Text style={styles.modalTitle}>
                摊位关联
              </Text>
              <TouchableOpacity style={styles.modalCloseBtnWrap} onPress={() => this.closeModal()}>
                <AntDesign name={'closesquareo'} style={styles.modalIcon}/>
              </TouchableOpacity>
            </View>
            <View style={styles.modalRowWrap}>
              <Text style={styles.modalRowText}>
                摊位
              </Text>
              <View style={styles.selectWrap}>
                <ModalSelector data={stallArray} onChange={value => this.onChangeStall(value)} skin={'customer'}
                               defaultKey={-999}>
                  <Text>
                    {selectStall.label}
                  </Text>
                </ModalSelector>
              </View>
            </View>
            <If condition={selectedSpecArray.length > 0}>
              <View style={styles.modalRowWrap}>
                <Text style={styles.modalRowText}>
                  规格
                </Text>
                <View style={styles.selectWrap}>
                  <ModalSelector data={selectedSpecArray} onChange={value => this.onChangeSpec(value)} skin={'customer'}
                                 defaultKey={-999}>
                    <Text>
                      {selectedSpec.label}
                    </Text>
                  </ModalSelector>
                </View>
              </View>
            </If>

            <TouchableOpacity style={flag ? styles.modalSelectBtn : styles.modalNotSelectBtn}
                              onPress={() => this.submitStallAndSpec(selectedSpec.value, selectStall.value, flag)}>
              <Text style={styles.modalBtnText}>
                确定
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  closeModal = () => {
    this.setState({
      stallVisible: false,
      selectStall: {
        value: '',
        label: '请选择要关联的摊位'
      },
      selectedSpec: {
        value: '',
        label: '请选择商品的规格'
      },
    })
  }
  onChange = (selectItem, store_prod) => {
    const {ext_stores, selectedSpecArray} = this.state
    switch (selectItem.value) {
      case '1':
        this.onOpenModal('set_price')
        break
      case '2':
        this.gotoStockCheck(store_prod)
        break
      case '3':
        this.gotoInventoryProp()
        break
      case '4':
        this.setState({stallVisible: true})
        break
      case '5':
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.navigate(Config.ROUTE_ORDER_RETAIL_PRICE, {
            ext_stores: ext_stores,
            selectedSpecArray: selectedSpecArray
          });
        });
        break
    }

  }

  renderIcon = (status) => {
    switch (status) {
      case Cts.STORE_PROD_ON_SALE:
        return <FontAwesome name={'cart-arrow-down'} style={styles.iconSaleStyle}/>;
      case Cts.STORE_PROD_OFF_SALE:
        return <FontAwesome name={'cart-arrow-down'} style={styles.iconOffSaleStyle}/>;
      case Cts.STORE_PROD_SOLD_OUT:
        return (
          <View style={[styles.prodStatusIcon]}>
            <Text style={{color: colors.white, fontSize: 12}}>
              缺
            </Text>
          </View>
        )
    }
  };

  renderImg = (list_img, cover_img) => {
    let {full_screen, product_id} = this.state;
    let wrapper = full_screen ? full_styles.wrapper : styles.wrapper;
    let goods_img = full_screen ? full_styles.goods_img : styles.goods_img;

    if (product_id != 0) {
      if (tool.length(list_img) > 0) {
        const img_list = tool.objectMap(list_img, (img_data, img_id) => {
          let img_url = img_data['url'];
          return (
            <TouchableHighlight key={img_id} onPress={this.onToggleFullScreen}>
              <Image style={goods_img} source={{uri: img_url}}/>
            </TouchableHighlight>
          );
        });
        return (
          <Swiper style={wrapper}>
            {img_list}
          </Swiper>
        )
      } else {
        return (
          <TouchableHighlight style={wrapper} onPress={this.onToggleFullScreen}>
            <Image style={[goods_img]} source={{uri: cover_img}}/>
          </TouchableHighlight>
        );
      }
    } else {
      if (tool.length(list_img) > 0) {
        return (
          <TouchableHighlight onPress={this.onToggleFullScreen}>
            <Image style={goods_img} source={{uri: list_img}}/>
          </TouchableHighlight>
        );
      } else {
        return (
          <TouchableHighlight style={wrapper} onPress={this.onToggleFullScreen}>
            <Image style={[goods_img]} source={{uri: list_img}}/>
          </TouchableHighlight>
        );
      }
    }
  };

  renderRuleStatusTab() {
    let {activity, product, store_prod, fn_price_controlled} = this.state;
    return (
      <View style={{
        flexDirection: "column",
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10
      }}>
        <View style={{flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 5}}>
          <Text style={{color: colors.color333, fontSize: 12, flex: 1}}>
            {product.name}{product.sku_name && `[${product.sku_name}]`}
          </Text>
          <View style={typeof store_prod.applying_price !== "undefined" && {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around", flex: 1
          }}>
            <If condition={activity && activity === 'offer'}>
              <Text style={styles.normalText}>
                {`¥ ${parseFloat(fn_price_controlled <= 0 ? (store_prod.price / 100) : (store_prod.supply_price / 100)).toFixed(2)}`}
              </Text>
            </If>
            <If condition={typeof store_prod.applying_price !== "undefined" && activity === 'offer'}>
              <Text style={{textAlign: 'right', color: colors.orange, fontSize: 12}}>
                审核中：{parseFloat(store_prod.applying_price / 100).toFixed(2)}
              </Text>
            </If>
            <If condition={this.state.fnProviding && activity === 'inventory_num'}>
              <Text style={styles.normalText}>{`${store_prod.stock_str}`} </Text>
            </If>
            <If condition={this.state.fnProviding && activity === 'inventory_attribute'}>
              <Text style={styles.normalText}>
                {`${store_prod.shelf_no ? store_prod.shelf_no : '无'}`}
              </Text>
            </If>
          </View>
        </View>
        <If condition={store_prod.skus !== undefined}>
          <For each="info" index="i" of={store_prod.skus}>
            <View
              style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5}}
              key={i}>
              <Text style={{color: colors.color333, fontSize: 12, width: '80%'}}>
                {product.name}[{info.sku_name}]
              </Text>
              <If condition={activity === 'offer'}>
                <Text style={styles.normalText}>
                  {`¥ ${parseFloat(fn_price_controlled <= 0 ? (info.price / 100) : (info.supply_price / 100)).toFixed(2)}`}
                </Text>
              </If>
              <If condition={typeof info.applying_price !== "undefined" && activity === 'offer'}>
                <Text style={{textAlign: 'right', color: colors.orange, fontSize: 12}}>
                  审核中：{parseFloat(info.applying_price / 100).toFixed(2)}
                </Text>
              </If>
              <If condition={this.state.fnProviding && activity === 'inventory_num'}>
                <Text style={styles.normalText}>
                  {`${info.stock_str}`}
                </Text>
              </If>
              <If condition={this.state.fnProviding && activity === 'inventory_attribute'}>
                <Text style={styles.normalText}>
                  {`${info.shelf_no ? info.shelf_no : '无'}`}
                </Text>
              </If>
            </View>
          </For>
        </If>
      </View>
    )
  }

  onToggleFullScreen() {
    let {full_screen} = this.state;
    this.setState({
      full_screen: !full_screen,
    });
  }
}

const full_styles = StyleSheet.create({

  wrapper: {
    flex: 1,
  },
  goods_img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#999',
  },
});

const styles = StyleSheet.create({
  page: {flex: 1, flexDirection: "column"},
  normalText: {color: colors.color333, fontSize: 12},
  iconOffSaleStyle: {fontSize: pxToDp(28), marginLeft: pxToDp(20), color: colors.gray},
  iconSaleStyle: {fontSize: pxToDp(28), marginLeft: pxToDp(20), color: colors.orange},
  scrollViewWrap: {backgroundColor: colors.main_back, flexDirection: 'column'},
  stallWrap: {margin: 10, backgroundColor: colors.white, borderRadius: 8},
  stallTopWrap: {borderBottomWidth: 1, borderBottomColor: colors.colorEEE, borderStyle: 'solid'},
  stallTopText: {
    paddingTop: 12,
    paddingLeft: 12,
    paddingBottom: 12,
    fontSize: 15,
    fontWeight: '500',
    color: colors.color333,
    lineHeight: 21
  },
  stallBottomText: {padding: 4, fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20},
  selectWrap: {
    borderColor: colors.color999,
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    flex: 5,
    marginLeft: 12,
    marginRight: 16
  },
  modalWrap: {flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end'},
  modalVisibleAreaWrap: {
    backgroundColor: colors.white,
    padding: 10,
    width: '100%',
    justifyContent: 'flex-end'
  },
  modalCloseBtnWrap: {padding: 8},
  modalTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  modalTitle: {fontSize: 18, fontWeight: '400', color: colors.color333, lineHeight: 25},
  modalIcon: {fontSize: 24, fontWeight: '400', color: colors.color999},
  modalRowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 11,
    paddingBottom: 11,
  },
  modalRowText: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20, flex: 1, textAlign: 'right'},
  modalNotSelectBtn: {
    backgroundColor: colors.colorCCC,
    marginTop: 39,
    marginBottom: 8,
    paddingBottom: 7,
    paddingTop: 7,
    paddingLeft: 10,
    paddingRight: 10
  },
  modalSelectBtn: {
    backgroundColor: colors.main_color,
    marginTop: 39,
    marginBottom: 8,
    paddingBottom: 7,
    paddingTop: 7,
    paddingLeft: 10,
    paddingRight: 10
  },
  modalBtnText: {color: colors.white, fontSize: 16, fontWeight: '400', lineHeight: 22, textAlign: 'center'},
  wrapper: {height: pxToDp(444),},
  goods_img: {
    width: pxToDp(720),
    height: pxToDp(444),
    resizeMode: 'contain',
    // backgroundColor: colors.main_back,
    backgroundColor: '#999',
    marginBottom: pxToDp(15),
  },
  goods_info: {
    backgroundColor: '#fff',
    paddingTop: pxToDp(32),
    paddingBottom: pxToDp(35),
  },
  goods_view: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  goods_name: {
    lineHeight: pxToDp(42),
    fontSize: pxToDp(32),
    color: '#3e3e3e',
  },
  goods_id: {
    color: '#999',
    fontSize: pxToDp(24),
  },
  goods_cats: {
    marginLeft: pxToDp(20),
    height: pxToDp(35),
    borderRadius: 8,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: pxToDp(10),
    backgroundColor: colors.new_back,
    fontSize: pxToDp(24),
    color: '#41aa55',
  },
  promote_name: {
    fontSize: pxToDp(24),
    color: '#bfbfbf',
    paddingHorizontal: pxToDp(30),
    marginTop: pxToDp(26),
  },
  sale_money: {
    fontSize: pxToDp(28),
    fontWeight: 'bold',
    color: '#f44040',
  },
  goods_stock: {
    fontSize: pxToDp(30),
    color: colors.color333,
  },

  cell_box: {
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.new_back,
  },
  cell_row: {
    paddingHorizontal: pxToDp(30),
    height: pxToDp(80),
    justifyContent: 'center',
    borderColor: colors.new_back,
    marginLeft: 0,
  },
  cell_label: {
    width: pxToDp(126),
    fontSize: pxToDp(30),
    color: '#3e3e3e',
  },
  cell_body: {
    textAlign: 'right',
    fontSize: pxToDp(30),
    color: '#3e3e3e',
  },
  desc_body: {
    fontSize: pxToDp(30),
    color: '#3e3e3e',
  },

  box_title: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    height: pxToDp(70),
    backgroundColor: colors.main_back,
  },
  goods_desc: {
    fontSize: pxToDp(30),
    color: colors.color666,
    paddingHorizontal: pxToDp(30),
    marginVertical: pxToDp(15),
  },

  all_stores: {
    marginVertical: pxToDp(15),
    backgroundColor: '#fff',
  },
  store_head: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    height: pxToDp(80),
    alignItems: 'center',
  },
  top_line: {
    borderTopWidth: pxToDp(1),
    borderColor: '#dcdcdc',
  },
  title_text: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#bfbfbf',
  },
  store_title: {
    width: pxToDp(210),
  },
  stock_title: {
    textAlign: 'center',
    width: pxToDp(150),
  },
  sale_title: {
    textAlign: 'center',
    width: pxToDp(150),
  },
  goods_provide: {
    textAlign: 'center',
    width: pxToDp(150),
  },
  store_info: {
    flexDirection: 'row',
    minHeight: pxToDp(80),
    alignItems: 'center',
    paddingHorizontal: pxToDp(30),
  },
  single_back: {
    backgroundColor: '#e6e6e6',
  },
  info_text: {
    fontSize: pxToDp(30),
    textAlignVertical: 'center',
    color: '#3e3e3e',
  },
  store_view: {
    paddingLeft: 0,
    width: pxToDp(200),
    flexDirection: 'row',
    alignItems: 'center',
  },
  store_name: {},
  stock_num: {
    textAlign: 'center',
    width: pxToDp(150),
  },
  sale_price: {
    textAlign: 'center',
    width: pxToDp(120),
  },
  is_provide: {
    textAlign: 'center',
    width: pxToDp(150),
  },

  prodStatusIcon: {
    width: pxToDp(33),
    height: pxToDp(33),
    backgroundColor: colors.warn_color,
    borderRadius: 28,
    alignItems: "center"
  },
  btn_edit: {
    fontSize: pxToDp(40),
    width: pxToDp(42),
    height: pxToDp(36),
    color: colors.color666,
    marginRight: pxToDp(30),
  },
  title_name: {
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    color: '#bfbfbf',
  },
  show_providing: {
    justifyContent: 'space-between'
  },
  related_edit: {
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(70)
  },
  toOnlineBtn: {
    borderRightWidth: pxToDp(1),
    borderColor: colors.colorDDD,
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%'
  },
  bottomWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.colorDDD,
    shadowColor: colors.color000,
    shadowOffset: {width: -4, height: -4},
  },
  bottomText: {
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    color: colors.color333,
    lineHeight: 22
  },
  moreText: {
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 8,
    paddingBottom: 8,
    color: colors.main_color,
    lineHeight: 22,
  },
  columnStart: {
    flexDirection: "column",
  },
  columnRowEnd: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  around: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  tab: {
    flex: 1,
    borderBottomColor: colors.colorBBB,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  tabActivity: {
    flex: 1,
    borderBottomColor: colors.main_color,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  tabText: {color: colors.title_color, fontWeight: "bold"},
  tabTextActivity: {color: colors.main_color, fontWeight: "bold"},
});


export default connect(mapStateToProps, mapDispatchToProps)(GoodStoreDetailScene)
