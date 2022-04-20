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
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import {Button} from "react-native-elements";

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


class GoodStoreDetailScene extends PureComponent {

  constructor(props: Object) {
    super(props);
    let {pid, storeId, item} = (this.props.route.params || {});
    let {is_service_mgr, is_helper, allow_merchants_edit_prod} = tool.vendor(this.props.global);
    let vendorId = this.props.global.config.vendor.id
    this.state = {
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
      activity: 'offer'
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
    showModal('加载中')
    const {accessToken} = this.props.global;
    HttpUtils.get.bind(this.props)(`/api/read_store_simple/${this.state.store_id}?access_token=${accessToken}`).then(store => {
      hideModal()
      this.setState({
        fn_price_controlled: store['fn_price_controlled'],
        fnProviding: Number(store['strict_providing']) > 0
      })
    }, (res) => {
    })
    this.getStoreProdWithProd();
  }

  getproduct() {
    showModal('加载中')
    const {accessToken} = this.props.global;
    const {product_id, store_id, vendorId} = this.state;
    HttpUtils.get.bind(this.props)(`/api/get_product_detail/${product_id}/${vendorId}/${store_id}?access_token=${accessToken}`).then(res => {
      hideModal()
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

    })
  }

  getStoreProdWithProd() {
    this.getproduct()
    const {accessToken} = this.props.global;
    const storeId = this.state.store_id || 0;
    const pid = this.state.product_id || 0;
    const {params} = this.props.route
    const url = `/api_products/get_prod_with_store_detail/${storeId}/${pid}?access_token=${accessToken}`;
    showModal('加载中')
    HttpUtils.post.bind(this.props)(url).then((data) => {
      if (pid === 0) {
        this.setState({
          product: params.item,
          store_prod: data.sp,
          isRefreshing: false,
        })
      } else {
        this.setState({
          product: data.p,
          store_prod: data.sp,
          isRefreshing: false,
        })
      }
      hideModal()
    }, (res) => {
      hideModal()
      this.setState({isRefreshing: false, errorMsg: `未找到商品:${res.reason}`})
    })
  }

  onHeaderRefresh() {
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

  upDateKuCun(store_prod) {
    let {activity} = this.state
    if (activity && activity === 'inventory_num') {
      this.gotoStockCheck(store_prod)
    } else if (activity && activity === 'inventory_attribute') {
      this.gotoInventoryProp()
    } else {
      return false
    }
  }

  render() {
    let {full_screen, product, store_prod, fn_price_controlled} = this.state;

    if (full_screen) {
      if (this.state.product_id != 0) {
        return this.renderImg(product.list_img, product.source_img);
      } else {
        return this.renderImg(this.state.AffiliatedInfo.product_img);
      }
    }

    if (!product) {
      return this.state.errorMsg ? <NoFoundDataView msg={this.state.errorMsg}/> : <NoFoundDataView/>
    }

    const onSale = (store_prod || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const onStrict = (store_prod || {}).strict_providing === `${Cts.STORE_PROD_STOCK}`;
    const {accessToken} = this.props.global;
    const sp = store_prod
    const applyingPrice = parseInt(sp.applying_price || sp.supply_price)
    const hasReferId = !isNaN(Number(store_prod.refer_prod_id)) || store_prod.refer_prod_id > 0
    return (<Provider><View style={{flex: 1, flexDirection: "column",}}>

        <FetchView navigation={this.props.navigation} onRefresh={this.getStoreProdWithProd.bind(this)}/>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.onHeaderRefresh()}
                            tintColor='gray'/>
          }
          style={{backgroundColor: colors.main_back, flexDirection: 'column'}}>
          {this.state.product_id != 0 ? this.renderImg(product.mid_list_img) : this.renderImg(this.state.AffiliatedInfo.product_img)}
          <View style={[styles.goods_info, styles.top_line]}>
            <View style={[styles.goods_view]}>
              {this.state.product_id != 0 ?
                <Text style={styles.goods_name}> {product.name} <Text
                  style={styles.goods_id}> (#{product.id}) </Text>
                </Text> :
                <Text style={styles.goods_name}> {product.name} <Text
                  style={styles.goods_id}> (#{product.id}) </Text>
                </Text>}
              {product.tag_list && product.tag_list.split(',').map(function (cat_name, idx) {
                return (
                  <Text key={idx} style={styles.goods_cats}> {cat_name}   </Text>
                );
              })}
            </View>
          </View>
          {this.state.vendorId != 68 &&
          <View style={{marginLeft: '1%'}}>
            <View style={{marginTop: 18, marginBottom: 8, marginLeft: 8}}>
              <Text style={{fontSize: 14, color: '#333333'}}>门店状态</Text>
            </View>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.white,
              width: '98%',
              borderRadius: pxToDp(10),
              paddingLeft: 10,
              marginBottom: 10
            }}>
              <Text style={{fontWeight: "bold", color: colors.color333}}>售卖状态</Text>
              <View style={{alignItems: "center", justifyContent: "center", flexDirection: "row", padding: 10}}>
                <Text
                  style={{color: colors.color333, fontSize: 12}}>{Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, store_prod.status)} </Text>
                <Text style={{color: colors.color333, fontSize: 12}}>{this.renderIcon(parseInt(store_prod.status))} </Text>
              </View>
            </View>
            <View style={{
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: colors.white,
              width: '98%',
              borderRadius: pxToDp(10),
              padding: 10,
              marginBottom: 10
            }}>
              <Text style={{fontWeight: "bold", color: colors.color333}}>售卖规格</Text>
              {this.renderSaleStatusTab()}
            </View>

            <View style={{
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: colors.white,
              width: '98%',
              borderRadius: pxToDp(10),
              marginBottom: 10
            }}>
              <View style={{flexDirection: "row"}}>
                <TouchableOpacity style={[this.state.activity === 'offer' ? styles.tabActivity : styles.tab]}
                                  onPress={() => this.setState({activity: 'offer'})}>
                  <Text style={this.state.activity === 'offer' ? styles.tabTextActivity : styles.tabText}>报价</Text>
                </TouchableOpacity>
                {
                  onStrict && <>
                  <TouchableOpacity style={this.state.activity === 'inventory_num' ? styles.tabActivity : styles.tab}
                                    onPress={() => this.setState({activity: 'inventory_num'})}>
                    <Text
                        style={this.state.activity === 'inventory_num' ? styles.tabTextActivity : styles.tabText}>库存数量</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                  style={this.state.activity === 'inventory_attribute' ? styles.tabActivity : styles.tab}
                  onPress={() => this.setState({activity: 'inventory_attribute'})}>
                  <Text
                  style={this.state.activity === 'inventory_attribute' ? styles.tabTextActivity : styles.tabText}>库存属性</Text>
                  </TouchableOpacity></>
                }

              </View>
              {this.renderRuleStatusTab()}
            </View>
          </View>
          }
        </ScrollView>
        {
          this.state.vendorId != 68 && <View style={[styles.around, {
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#ddd',
            shadowColor: '#000',
            shadowOffset: {width: -4, height: -4},
            height: pxToDp(70),
          }]}>
            {onSale &&
            <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('off_sale')}>
              <Text style={{color: colors.color333}}>下架 </Text>
            </TouchableOpacity>}

            {!onSale &&
            <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('on_sale')}>
              <Text style={{color: colors.color333}}>上架 </Text>
            </TouchableOpacity>}

            <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}
                              onPress={() => this.onOpenModal('set_price')}>
              <Text style={{color: colors.color333}}>报价 </Text>
            </TouchableOpacity>
          </View>
        }

        {sp && product.id && this.state.vendorId != 68 &&
        <GoodItemEditBottom modalType={this.state.modalType} productName={product.name} pid={Number(sp.product_id)}
                            strictProviding={this.state.fnProviding} accessToken={accessToken}
                            storeId={Number(sp.store_id)}
                            currStatus={Number(sp.status)} doneProdUpdate={this.onDoneProdUpdate}
                            onClose={() => this.setState({modalType: ''})}
                            spId={Number(sp.id)} applyingPrice={applyingPrice} storePro={sp}
                            beforePrice={Number(sp.supply_price)}/>}
      </View></Provider>
    );
  }

  renderIcon = (status) => {
    if (status === Cts.STORE_PROD_ON_SALE) {
      return <FontAwesome name={'cart-arrow-down'}
                          style={{fontSize: pxToDp(28), marginLeft: pxToDp(20), color: colors.orange}}/>;
    } else if (status === Cts.STORE_PROD_OFF_SALE) {
      return <FontAwesome name={'cart-arrow-down'}
                          style={{fontSize: pxToDp(28), marginLeft: pxToDp(20), color: colors.gray}}/>;
    } else if (status === Cts.STORE_PROD_SOLD_OUT) {
      return <View style={[styles.prodStatusIcon]}><Text style={{color: colors.white, fontSize: 12}}>缺</Text></View>;
    }
  };

  renderImg = (list_img, cover_img) => {
    let {full_screen} = this.state;
    let wrapper = full_screen ? full_styles.wrapper : styles.wrapper;
    let goods_img = full_screen ? full_styles.goods_img : styles.goods_img;

    if (this.state.product_id != 0) {
      if (tool.length(list_img) > 0) {
        const img_list = tool.objectMap(list_img, (img_data, img_id) => {
          let img_url = img_data['url'];
          return (
            <TouchableHighlight
              key={img_id}
              onPress={this.onToggleFullScreen}
            >
              <Image
                style={goods_img}
                source={{uri: img_url}}
              />
            </TouchableHighlight>
          );
        });
        return (<Swiper style={wrapper}>{img_list}</Swiper>);
      } else {
        return (
          <TouchableHighlight
            style={wrapper}
            onPress={this.onToggleFullScreen}
          >
            <Image
              style={[goods_img]}
              source={{uri: cover_img}}
            />
          </TouchableHighlight>
        );
      }
    } else {
      if (tool.length(list_img) > 0) {
        return (
          <TouchableHighlight
            onPress={this.onToggleFullScreen}
          >
            <Image
              style={goods_img}
              source={{uri: list_img}}
            />
          </TouchableHighlight>
        );
        return (<Swiper style={wrapper}>{list_img}</Swiper>);
      } else {
        return (
          <TouchableHighlight
            style={wrapper}
            onPress={this.onToggleFullScreen}
          >
            <Image
              style={[goods_img]}
              source={{uri: list_img}}
            />
          </TouchableHighlight>
        );
      }
    }
  };

  renderSaleStatusTab() {
    let {product, store_prod, fn_price_controlled} = this.state;
    if (store_prod && store_prod.skus !== undefined) {
      return (
        <View style={{flexDirection: "column", backgroundColor: colors.white, padding: 10}}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5}}>
            <Text style={{color: colors.color333, fontSize: 12}}>{product.name} </Text>
            <Text
              style={{color: colors.color333, fontSize: 12}}> {`¥ ${parseFloat(fn_price_controlled <= 0 ? (store_prod.price / 100) : (store_prod.supply_price / 100)).toFixed(2)}`} </Text>
          </View>
          <For each="info" index="i" of={store_prod.skus}>
            <View
              style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5}}
              key={i}>
              <Text style={{color: colors.color333, fontSize: 12}}>{product.name}[{info.sku_name}] </Text>
              <Text
                style={{color: colors.color333, fontSize: 12}}> {`¥ ${parseFloat(fn_price_controlled <= 0 ? (info.price / 100) : (info.supply_price / 100)).toFixed(2)}`} </Text>
            </View>
          </For>
        </View>
      )
    } else {
      return (
        <View style={{flexDirection: "column", backgroundColor: colors.white, padding: 10}}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
            <Text style={{color: colors.color333, fontSize: 12}}>{product.name} </Text>
            <Text
              style={{color: colors.color333, fontSize: 12}}> {`¥ ${parseFloat(fn_price_controlled <= 0 ? (store_prod.price / 100) : (store_prod.supply_price / 100)).toFixed(2)}`} </Text>
          </View>
        </View>
      )
    }
  }

  renderRuleStatusTab() {
    let {activity} = this.state
    let {product, store_prod, fn_price_controlled} = this.state;
    return (
      <View style={{
        flexDirection: "column",
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10
      }}>
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5}}>
          <Text style={{color: colors.color333, fontSize: 12}}>{product.name} </Text>
          <View style={typeof store_prod.applying_price !== "undefined" && {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}>
            <If condition={activity && activity === 'offer'}>
              <Text
                style={{color: colors.color333, fontSize: 12}}> {`¥ ${parseFloat(fn_price_controlled <= 0 ? (store_prod.price / 100) : (store_prod.supply_price / 100)).toFixed(2)}`} </Text></If>
            <If condition={typeof store_prod.applying_price !== "undefined" && activity === 'offer'}>
              <Text style={{
                textAlign: 'right',
                color: colors.orange, fontSize: 12
              }}>审核中：{parseFloat(store_prod.applying_price / 100).toFixed(2)} </Text>
            </If>
            <If condition={this.state.fnProviding && activity === 'inventory_num'}>
              <Text style={{color: colors.color333, fontSize: 12}}>{`${store_prod.stock_str}`} </Text>
            </If>
            <If condition={this.state.fnProviding && activity === 'inventory_attribute'}>
              <Text style={{color: colors.color333, fontSize: 12}}>{`${store_prod.shelf_no}`} </Text>
            </If>
          </View>
        </View>
        <If condition={store_prod.skus !== undefined}>
          <For each="info" index="i" of={store_prod.skus}>
            <View
              style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5}}
              key={i}>
              <Text style={{color: colors.color333, fontSize: 12}}>{product.name}[{info.sku_name}] </Text>
              <If condition={activity === 'offer'}>
                <Text
                  style={{color: colors.color333, fontSize: 12}}> {`¥ ${parseFloat(fn_price_controlled <= 0 ? (info.price / 100) : (info.supply_price / 100)).toFixed(2)}`} </Text>
              </If>
              <If condition={typeof info.applying_price !== "undefined" && activity === 'offer'}>
                <Text style={{
                  textAlign: 'right',
                  color: colors.orange, fontSize: 12
                }}>审核中：{parseFloat(info.applying_price / 100).toFixed(2)} </Text>
              </If>
              <If condition={this.state.fnProviding && activity === 'inventory_num'}>
                <Text style={{color: colors.color333, fontSize: 12}}>{`${info.stock_str}`} </Text>
              </If>
              <If condition={this.state.fnProviding && activity === 'inventory_attribute'}>
                <Text style={{color: colors.color333, fontSize: 12}}>{`${info.shelf_no}`} </Text>
              </If>
            </View>
          </For>
        </If>
        {
          activity && (activity === 'inventory_num' || activity === 'inventory_attribute')
          && <View style={{flexDirection: "row", justifyContent: "flex-end", marginTop: 10}}>
            <Button buttonStyle={{backgroundColor: '#59B26A', width: pxToDp(238), height: pxToDp(58)}}
                    titleStyle={{color: colors.white, fontSize: 12}} title='去修改'
                    onPress={() => this.upDateKuCun(store_prod)}/>
          </View>
        }
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
  wrapper: {
    height: pxToDp(444),
  },
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
    flex: 1
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
