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
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, Dialog, Icon, Label, Toast,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import {
  fetchProductDetail,
  fetchVendorProduct,
  fetchVendorTags,
  UpdateWMGoods
} from "../../reducers/product/productActions";
import LoadingView from "../../widget/LoadingView";
import Cts from "../../Cts";
import Swiper from 'react-native-swiper';
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import Config from "../../config";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {ToastLong} from "../../util/ToastUtils";

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

class GoodsDetailScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    console.log('navigation', navigation)
    const {params = {}} = navigation.state;
    let {backPage, product_detail} = params;

    return {
      headerTitle: '商品详情',
      headerRight: tool.length(product_detail) > 0 && (<View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => {
            InteractionManager.runAfterInteractions(() => {
              navigation.navigate(Config.ROUTE_GOODS_EDIT, {
                type: 'edit',
                product_detail,
                detail_key: navigation.state.key
              });
            });
          }}
        >
          <FontAwesome name='pencil-square-o' style={styles.btn_edit}/>
        </TouchableOpacity>
      </View>),
    }
  };

  constructor(props: Object) {
    super(props);
    let {fnProviding, is_service_mgr, is_helper} = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      isLoading: false,
      isSyncGoods: false,
      full_screen: false,
      product_detail: {},
      store_product: {},
      fnProviding: fnProviding,
      is_service_mgr: is_service_mgr,
      is_helper: is_helper,
      sync_goods_info: false,
      include_img: false,
      batch_edit_supply: false,
      show_all_store_prods: false,
    };

    this.getProductDetail = this.getProductDetail.bind(this);
    this.getVendorProduct = this.getVendorProduct.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
    this.getVendorTags = this.getVendorTags.bind(this);
    this.onSyncWMGoods = this.onSyncWMGoods.bind(this);

    console.log("constructor", this.state)
  }

  componentWillMount() {
    console.log("will mount begin", this.state)
    let {productId, backPage, vendorId} = (this.props.navigation.state.params || {});
    let {currVendorId} = tool.vendor(this.props.global);
    currVendorId = vendorId ? vendorId : currVendorId
    this.productId = productId;
    const {product_detail, store_tags, basic_category} = this.props.product;

    console.log("will mount before product get", this.state)
    this.getProductDetail();
    this.getVendorProduct();

    if (store_tags[currVendorId] === undefined || basic_category[currVendorId] === undefined) {
      this.getVendorTags(currVendorId);
    }
  }

  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {isRefreshing} = (params || {});
    if (isRefreshing) {
      this.setState({isRefreshing: isRefreshing})
      const setRefresh = this.props.navigation.setParams({
        isRefreshing: false,
        key: key
      });
      this.props.navigation.dispatch(setRefresh);
      this.getProductDetail();
      this.getVendorProduct();
    }

  }

  getVendorTags(_v_id) {
    if (_v_id > 0) {
      const {accessToken} = this.props.global;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchVendorTags(_v_id, accessToken, (resp) => {
          console.log('fetchVendorTags -> ', resp.ok);
        }));
      });
    }
  }

  componentDidMount() {
    let {backPage} = (this.props.navigation.state.params || {});
    if (!!backPage) {
      this.props.navigation.setParams({backPage: backPage});
    }
  }

  getProductDetail() {
    let product_id = this.productId;
    console.log('get_product_detail: product_id:', this.productId)
    if (product_id > 0) {
      let {currVendorId} = tool.vendor(this.props.global);
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchProductDetail(product_id, currVendorId, accessToken, (resp) => {
          console.log("fetchProductDetail in callback:", this.state, resp)
          if (resp.ok) {
            let product_detail = resp.obj;
            _this.setState({
              product_detail: product_detail,
              isRefreshing: false,
            });
            _this.props.navigation.setParams({product_detail});
          } else {
            _this.setState({isRefreshing: false});
          }
        }));
      });
    }
  }

  getVendorProduct() {
    this.setState({isLoading: true});
    let {currVendorId} = tool.vendor(this.props.global);
    let product_id = this.productId;

    if (product_id > 0) {
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchVendorProduct(currVendorId, product_id, accessToken, async (resp) => {
          if (resp.ok) {
            let store_product = resp.obj.goods;
            await _this.setState({
              store_product: store_product,
              batch_edit_supply: resp.obj.batch_edit_supply_price,
              isLoading: false,
            });
          } else {
            _this.setState({isLoading: false});
          }

        }));
      });
    }
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    let {currVendorId} = tool.vendor(this.props.global);
    this.getVendorTags(currVendorId);
    this.getProductDetail();
    this.getVendorProduct();
  }

  headerSupply = (mode) => {
    let map = {};
    map[Cts.STORE_SELF_PROVIDED] = '否';
    map[Cts.STORE_COMMON_PROVIDED] = '是';
    return map[mode]
  };

  IncludeImg(include_img) {
    this.setState({include_img: !include_img});
  }

  onSyncWMGoods() {
    this.setState({isSyncGoods: true});
    let {include_img} = this.state;
    let product_id = this.productId;

    console.log('onSyncWMGoods -> ', product_id, include_img);
    if (product_id > 0) {
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(UpdateWMGoods(product_id, include_img, accessToken, async (resp) => {
          console.log('UpdateWMGoods -> ', resp);
          ToastLong(resp.desc);
          _this.setState({isSyncGoods: false});
        }));
      });
    }
  }

  render() {
    let {full_screen, product_detail} = this.state;
    if (!(tool.length(product_detail) > 0)) {
      return <LoadingView/>;
    }

    if (full_screen) {
      return this.renderImg(product_detail.list_img, product_detail.source_img);
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        {this.renderImg(product_detail.mid_list_img, product_detail.coverimg)}

        <View style={[styles.goods_info, styles.top_line]}>
          <View style={[styles.goods_view]}>
            <Text style={styles.goods_name}>
              {product_detail.name}
              <Text style={styles.goods_id}> (#{product_detail.id})</Text>
            </Text>
            {product_detail.tag_list !== '' && product_detail.tag_list.split(',').map(function (cat_name, idx) {
              return (
                <Text key={idx} style={styles.goods_cats}>
                  {cat_name}
                </Text>
              );
            })}
          </View>
          {!!product_detail.promote_name && <Text style={styles.promote_name}>{product_detail.promote_name}</Text>}
        </View>

        <View style={[styles.box_title, styles.top_line]}>
          <Text style={styles.title_name}>规格</Text>
        </View>
        <Cells style={[styles.cell_box, {marginTop: 0,}]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>平均重量</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>{product_detail.weight}g</Text>
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>SKU单位</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>{product_detail.sku_unit}</Text>
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>份含量</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>{product_detail.sku_having_unit}</Text>
            </CellBody>
          </Cell>
        </Cells>

        {!!product_detail.tag_info_saving && (
          <View>
            <View style={[styles.box_title, styles.top_line]}>
              <Text style={styles.title_name}>保存方法</Text>
            </View>
            <Cells style={[styles.cell_box, {marginTop: 0,}]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.desc_body]}>{product_detail.tag_info_saving}</Text>
                </CellBody>
              </Cell>
            </Cells>
          </View>)}
        {!!product_detail.tag_info_nur && (
          <View>
            <View style={[styles.box_title, styles.top_line]}>
              <Text style={styles.title_name}>介绍</Text>
            </View>
            <Cells style={[styles.cell_box, {marginTop: 0,}]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.desc_body]}>{product_detail.tag_info_nur}</Text>
                </CellBody>
              </Cell>
            </Cells>
          </View>)}

        {this.renderALlStore()}

        {this.renderSyncGoods()}
      </ScrollView>
    );
  }

  renderSyncGoods = () => {
    let {isLoading, include_img, sync_goods_info, isSyncGoods, is_service_mgr, is_helper} = this.state;
    if ((!is_service_mgr && !is_helper) || isLoading) {
      return null;
    }

    return (
      <View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: pxToDp(10),
          backgroundColor: '#fff',
          borderRadius: 4,
          borderWidth: pxToDp(1),
          borderColor: '#ddd',
          height: pxToDp(90),
        }}>
          <Button
            style={{height: pxToDp(70), flex: 1, alignItems: 'center', justifyContent: 'center'}}
            type='primary'
            onPress={() => {
              this.setState({sync_goods_info: true});
            }}
          >同步商品信息至外卖平台</Button>
        </View>
        <Dialog
          onRequestClose={() => {
          }}
          visible={sync_goods_info}
          title='商品信息同步'
          buttons={[{
            type: 'default',
            label: '取消',
            onPress: () => {
              this.setState({sync_goods_info: false, include_img: false})
            }
          }, {
            type: 'default',
            label: '确定',
            onPress: async () => {
              this.onSyncWMGoods();
              this.setState({sync_goods_info: false, include_img: false});
            }
          }]}
        >
          <Text style={{fontSize: pxToDp(30), color: colors.main_color}}>
            该操作会将该商品的 商品名称,广告词,
            <Text style={{color: colors.default_theme}}>
              ({!include_img && '不'}包含商品图片)
            </Text>
            同步至外卖平台
          </Text>
          <Cell
            style={{borderColor: '#666', borderRadius: 10, borderWidth: pxToDp(1), marginTop: pxToDp(15)}}
            onPress={() => this.IncludeImg(include_img)}
            customStyle={{height: pxToDp(70), justifyContent: 'center', borderTopWidth: 0}}>
            <CellBody>
              <Text style={{fontSize: pxToDp(28)}}>是否同步商品图片</Text>
            </CellBody>
            <CellFooter>
              <Icon name={include_img ? "success_circle" : "cancel"} style={{fontSize: 22}}/>
            </CellFooter>
          </Cell>
        </Dialog>

        <Toast
          icon="loading"
          show={isSyncGoods}
          onRequestClose={() => {
          }}
        >同步中</Toast>
      </View>
    );
  };

  renderALlStore = () => {
    let {store_product, product_detail, isLoading, batch_edit_supply} = this.state;
    let {navigation} = this.props;
    if (isLoading) {
      return <LoadingView/>;
    }

    return (
      <View style={styles.all_stores}>
        <View style={styles.box_title}>
          <Text style={styles.title_name}>门店商品信息</Text>
          <View style={{flex: 1}}/>
          <TouchableOpacity
            style={styles.related_edit}
            onPress={() => {
              let {name, coverimg, id, vendor_id} = this.state.product_detail;
              let {store_product} = this.state;
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(Config.ROUTE_GOODS_PRICE_DETAIL, {
                  item: {
                    list_img: coverimg,
                    name: name,
                    product_id: id,
                    sale_store_num: tool.length(store_product)
                  },
                  vendorId: vendor_id
                });
              });
            }}
          >
            <Text style={
              {
                fontSize: pxToDp(30),
                color: '#59b26a',
                textAlignVertical: 'center',
                marginRight: pxToDp(30),
                borderRightColor: colors.fontGray,
                borderRightWidth: pxToDp(1),
                paddingRight: pxToDp(20)
              }
            }>
              比价
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.related_edit]}
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(Config.ROUTE_GOODS_RELATE, {
                  productId: this.productId,
                  store_product: store_product,
                  product_detail: product_detail,
                  detail_key: navigation.state.key,
                  refreshStoreList: () => this.getVendorProduct()
                });
              });
            }}
          >
            <Text
              style={{fontSize: pxToDp(30), color: '#59b26a', textAlignVertical: 'center', marginRight: pxToDp(30)}}>
              关联
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.related_edit}
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                console.log('batch_edit_supply:' + batch_edit_supply);
                navigation.navigate(Config.ROUTE_GOODS_BATCH_PRICE, {
                  productId: this.productId,
                  store_product: store_product,
                  batch_edit_supply: batch_edit_supply,
                  detail_key: navigation.state.key
                });

              });
            }}
          >
            <Text style={{
              fontSize: pxToDp(30),
              color: '#59b26a',
              textAlignVertical: 'center',
              paddingLeft: pxToDp(30),
              borderLeftWidth: pxToDp(1),
              borderColor: '#ccc'
            }}>
              编辑
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.store_head, styles.top_line, styles.show_providing]}>
          <Text style={[styles.title_text, styles.store_title]}>门店</Text>
          <Text style={[styles.title_text, styles.stock_title]}>库存</Text>
          <Text style={[styles.title_text, styles.sale_title]}>售价</Text>
          {
            this.state.fnProviding ? <Text style={[styles.title_text, styles.goods_provide]}>总部供货</Text> : null
          }

        </View>
        {this.renderStoreProduct(store_product)}
      </View>
    );
  };

  renderStoreProduct = (store_product) => {
    let is_dark_bg = false;
    let _this = this;
    let show_keys;
    if (!this.state.show_all_store_prods) {
      show_keys = Object.keys(store_product);
    } else {
      show_keys = Object.keys(store_product).slice(0, 5);
    }

    return show_keys.map(store_id => function (store_id) {
      let s_product = store_product[store_id];
      is_dark_bg = !is_dark_bg;
      return (
        <View key={store_id} style={[styles.store_info, styles.top_line, styles.show_providing]}>
          <View style={[styles.store_view]}>
            <Text style={[styles.info_text, styles.store_name, {flex: 1}]}>{s_product.store_name}</Text>
            {_this.renderIcon(parseInt(s_product.status))}
          </View>

          <Text style={[styles.info_text, styles.stock_num]}>{parseInt(s_product.left_since_last_stat)}件</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', width: pxToDp(150)}}>
            <Text style={[styles.info_text, styles.sale_price]}>
              ¥ {parseInt(s_product.fn_price_controlled) === 0 ? s_product.price / 100 : s_product.supply_price / 100}
            </Text>
            {parseInt(s_product.fn_price_controlled) === 0 ? null :
              <Image
                resizeMode={'contain'}
                style={{height: pxToDp(34), width: pxToDp(34)}}
                source={require('../../img/Goods/bao_.png')}
              />
            }
          </View>

          {_this.state.fnProviding ? <Text style={[styles.info_text, styles.is_provide]}>
            {_this.headerSupply(s_product.self_provided)}
          </Text> : null}
        </View>
      );
    });
  };

  renderIcon = (status) => {
    if (status === Cts.STORE_PROD_ON_SALE) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/shangjia_.png')}/>;
    } else if (status === Cts.STORE_PROD_OFF_SALE) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/xiajia_.png')}/>;
    } else if (status === Cts.STORE_PROD_SOLD_OUT) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/quehuo_.png')}/>;
    }
  };

  renderImg = (list_img, cover_img) => {
    let {full_screen} = this.state;
    let wrapper = full_screen ? full_styles.wrapper : styles.wrapper;
    let goods_img = full_screen ? full_styles.goods_img : styles.goods_img;

    if (tool.length(list_img) > 0) {
      let _this = this;
      let img_list = tool.objectMap(list_img, (img_data, img_id) => {
        let img_url = img_data['url'];
        let img_name = img_data['name'];
        return (
          <TouchableHighlight
            key={img_id}
            onPress={_this.onToggleFullScreen}
          >
            <Image
              style={goods_img}
              source={{uri: img_url}}
            />
          </TouchableHighlight>
        );
      });
      return (
        <Swiper style={wrapper}>
          {img_list}
        </Swiper>
      );
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
  };

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
    resizeMode: Image.resizeMode.contain,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.colorEEE,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    width: pxToDp(720),
    height: pxToDp(444),
  },
  goods_img: {
    width: pxToDp(720),
    height: pxToDp(444),
    resizeMode: Image.resizeMode.contain,
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

  icon_style: {
    width: pxToDp(28),
    height: pxToDp(28),
    marginLeft: pxToDp(20),
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
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(GoodsDetailScene)
