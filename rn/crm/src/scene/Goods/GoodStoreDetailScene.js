import React, {PureComponent} from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight, TouchableOpacity,
  View
} from 'react-native';
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
import HttpUtils from "../../util/http";
import Styles from "../../themes/Styles";
import GoodItemEditBottom from "../component/GoodItemEditBottom";
import { List, WhiteSpace } from "antd-mobile-rn";
import Mapping from "../../Mapping";

const Item = List.Item;
const Brief = List.Item.Brief;

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

class GoodStoreDetailScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    console.log('navigation', navigation)
    const {params = {}} = navigation.state;
    let {backPage} = params;

    return {
      headerTitle: '门店商品详情',
    }
  };

  constructor(props: Object) {
    super(props);
    let {pid, storeId, updatedCallback = {}, fn_price_controlled = null} = (this.props.navigation.state.params || {});
    let {fnProviding, is_service_mgr, is_helper} = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      isLoading: false,
      isSyncGoods: false,
      full_screen: false,
      product_id: pid,
      store_id: storeId,
      product: {},
      store_prod: {},
      fnProviding: fnProviding,
      is_service_mgr: is_service_mgr,
      is_helper: is_helper,
      sync_goods_info: false,
      include_img: false,
      batch_edit_supply: false,
      fn_price_controlled: true,
    };

    if (fn_price_controlled === null) {
      const {accessToken} = this.props.global;
      HttpUtils.get.bind(this.props)(`/api/read_store_simple/${storeId}?access_token=${accessToken}`).then(store => {
        this.setState({fn_price_controlled: store['fn_price_controlled']})
      } , (ok, reason) => {
        console.log("ok=",ok, "reason=", reason)
      })
    }

    this.getStoreProdWithProd = this.getStoreProdWithProd.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
  }

  componentWillMount() {
    this.getStoreProdWithProd();
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
      this.getStoreProdWithProd();
    }

  }

  componentDidMount() {
    let {backPage} = (this.props.navigation.state.params || {});
    if (!!backPage) {
      this.props.navigation.setParams({backPage: backPage});
    }
  }

  getStoreProdWithProd() {
    const {accessToken} = this.props.global;
    const storeId = this.state.store_id;
    const pid = this.state.product_id;
    const url = `/api_products/get_prod_with_store_detail/${storeId}/${pid}?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url).then((data)=>{
      this.setState({
        product: data.p,
        store_prod: data.sp,
        isRefreshing: false,
      })
    })
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getStoreProdWithProd();
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

  onDoneProdUpdate = (pid, prodFields, spFields) => {

    const {updatedCallback} = (this.props.navigation.state.params || {})
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

  render() {
    let {full_screen, product, store_prod, fn_price_controlled} = this.state;
    if (!(tool.length(product) > 0)) {
      return <LoadingView/>;
    }

    if (full_screen) {
      return this.renderImg(product.list_img);
    }

    const onSale = (store_prod|| {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const {accessToken} = this.props.global;
    const sp = store_prod
    const applyingPrice = parseInt(sp.applying_price || sp.supply_price)

    return (<View style={[Styles.columnStart, {flex: 1}]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.onHeaderRefresh()} tintColor='gray'/>
        }
        style={{backgroundColor: colors.main_back, flexDirection:'column', borderWidth:1, borderColor: colors.orange}}>
        {this.renderImg(product.mid_list_img)}
        <View style={[styles.goods_info, styles.top_line]}>
          <View style={[styles.goods_view]}>
            <Text style={styles.goods_name}> {product.name} <Text style={styles.goods_id}> (#{product.id})</Text> </Text>
            {product.tag_list && product.tag_list.split(',').map(function (cat_name, idx) {
              return (
                <Text key={idx} style={styles.goods_cats}> {cat_name} </Text>
              );
            })}
          </View>
        </View>
        <List renderHeader={'门店状态信息'}>
          <Item extra={<View style={[Styles.columnRowEnd, {borderWidth:1, borderColor: colors.orange}]}>{this.renderIcon(parseInt(store_prod.status))}
            <Brief style={{textAlign: 'right'}}>{Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, store_prod.status)}</Brief>
          </View>}>
            售卖状态
          </Item>
          <Item extra={<View style={[Styles.columnRowEnd]}>
            {`¥ ${parseFloat(fn_price_controlled <= 0 ? store_prod.price / 100 : store_prod.supply_price / 100).toFixed(2)}`}
            {typeof store_prod.applying_price !== "undefined" &&
              <Brief style={{textAlign:'right',color: colors.orange}}>审核中：{parseFloat(store_prod.applying_price / 100).toFixed(2)}</Brief>}
          </View>}>报价</Item>
        </List>
      </ScrollView>
          <View style={[Styles.around, { backgroundColor: '#fff',
            borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOffset: {width: -4, height: -4}, height: pxToDp(70),
          }]}>
              {onSale &&
              <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('off_sale')}>
                <Text>下架</Text>
              </TouchableOpacity>}

              {!onSale &&
              <TouchableOpacity style={[styles.toOnlineBtn]} onPress={() => this.onOpenModal('on_sale')}>
                <Text>上架</Text>
              </TouchableOpacity>}

              <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]} onPress={() => this.onOpenModal('set_price')}>
                <Text>报价</Text>
              </TouchableOpacity>
          </View>

          {this.state.modalType && sp && product.id && <GoodItemEditBottom modalType={this.state.modalType} productName={product.name} pid={parseInt(sp.product_id)}
                              strictProviding={this.state.fnProviding} accessToken={accessToken} storeId={parseInt(sp.store_id)}
                              currStatus={parseInt(sp.status)} doneProdUpdate={this.onDoneProdUpdate} onClose={()=>this.setState({modalType: ''})}
                              spId={parseInt(sp.id)} applyingPrice={applyingPrice} beforePrice={parseInt(sp.supply_price)}/>}
        </View>
    );
  }

  renderIcon = (status) => {
    if (status === Cts.STORE_PROD_ON_SALE) {
      return <Image style={[styles.prodStatusIcon]} source={require('../../img/Goods/shangjia_.png')}/>;
    } else if (status === Cts.STORE_PROD_OFF_SALE) {
      return <Image style={[styles.prodStatusIcon]} source={require('../../img/Goods/xiajia_.png')}/>;
    } else if (status === Cts.STORE_PROD_SOLD_OUT) {
      return <Image style={[styles.prodStatusIcon]} source={require('../../img/Goods/quehuo_.png')}/>;
    }
  };

  renderImg = (list_img) => {
    let {full_screen} = this.state;
    let wrapper = full_screen ? full_styles.wrapper : styles.wrapper;
    let goods_img = full_screen ? full_styles.goods_img : styles.goods_img;

    if (tool.length(list_img) > 0) {
      let _this = this;
      let img_list = tool.objectMap(list_img, (img_data, img_id) => {
        let img_url = img_data['url'];
        return (<TouchableHighlight key={img_id} onPress={_this.onToggleFullScreen}>
            <Image style={goods_img} source={{uri: img_url}}/>
          </TouchableHighlight>
        );
      });
      return (<Swiper style={wrapper}>{img_list}</Swiper>);
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
    backgroundColor: '#999',
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

  prodStatusIcon: {
    width: pxToDp(28),
    height: pxToDp(28),
    marginLeft: pxToDp(20),
    alignSelf: "flex-end"
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
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(GoodStoreDetailScene)
