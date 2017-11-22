/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, TouchableHighlight, ScrollView, RefreshControl, InteractionManager} from 'react-native';
import {Cells, CellsTitle, Cell, CellHeader, CellBody, CellFooter, Input, Label, Icon, Toast,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import * as tool from "../../common/tool";
import {fetchProductDetail, fetchVendorProduct} from "../../reducers/product/productActions";
import LoadingView from "../../widget/LoadingView";
import Cts from "../../Cts";
import Swiper from 'react-native-swiper';
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import Config from "../../config";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProductDetail,
      fetchVendorProduct,
      ...globalActions
    }, dispatch)
  }
}

class GoodsDetailScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {backPage} = params;
    return {
      headerLeft: (
        <NavigationItem
          icon={require('../../img/Register/black_back_.png')}
          iconStyle={{width: pxToDp(87), height: pxToDp(79)}}
          onPress={() => {
            if(!!backPage){
              console.log('backPage -> ', backPage);
              native.gotoPage(backPage);
            }
          }}
        />),
      headerTitle: '商品详情',
      headerRight: ( <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => {
            InteractionManager.runAfterInteractions(() => {
              navigation.navigate(Config.ROUTE_GOODS_EDIT, {
                type: 'edit',
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

    this.state = {
      isRefreshing: false,
      full_screen: false,
      product_detail: {},
      store_product: {},
    };

    this.getProductDetail = this.getProductDetail.bind(this);
    this.getVendorProduct = this.getVendorProduct.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
  }

  componentWillMount() {
    let {productId, backPage} = (this.props.navigation.state.params || {});

    this.productId = productId;
    const {product_detail} = this.props.product;
    if (product_detail[productId] === undefined) {
      this.getProductDetail();
    } else {
      this.setState({
        product_detail: product_detail[productId],
      });
    }
    this.getVendorProduct();
  }

  componentDidMount() {
    let {backPage} = (this.props.navigation.state.params || {});
    if(!!backPage){
      this.props.navigation.setParams({backPage: backPage});
    }
  }

  getProductDetail() {
    let product_id = this.productId;
    if (product_id > 0) {
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchProductDetail(product_id, accessToken, (resp) => {
          // console.log('product_detail -> ', product_detail);
          if (resp.ok) {
            let product_detail = resp.obj;
            _this.setState({
              product_detail: product_detail,
              isRefreshing: false,
            });
          } else {
            _this.setState({isRefreshing: false});
          }
        }));
      });
    }
  }

  getVendorProduct() {
    let {currVendorId} = tool.vendor(this.props.global);
    let product_id = this.productId;

    if (product_id > 0) {
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchVendorProduct(currVendorId, product_id, accessToken, (resp) => {
          // console.log('getVendorProduct -> ', resp);
          if (resp.ok) {
            let store_product = resp.obj;
            _this.setState({
              store_product: store_product,
              isRefreshing: false,
            });
          } else {
            _this.setState({isRefreshing: false});
          }
        }));
      });
    }
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getProductDetail();
    this.getVendorProduct();
  }

  render() {
    let {full_screen, product_detail} = this.state;
    if (!(tool.length(product_detail) > 0)) {
      return <LoadingView/>;
    }

    if(full_screen){
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

        <View style={[styles.goods_view, {marginBottom: 0}]}>
          <Text style={styles.goods_name}>
            {product_detail.name}
          </Text>
        </View>
        <View style={[styles.goods_view, {marginTop: 0, justifyContent: 'flex-end'}]}>
          <Text style={styles.goods_cats}>
            分类: {product_detail.tag_list}
          </Text>
        </View>
        {!!product_detail.promote_name ?
          <Text style={styles.promote_name}>描述/广告词：{product_detail.promote_name}</Text> : null}

        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>重量</Label>
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
              <Label style={[styles.cell_label]}>箱含量</Label>
            </CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>{product_detail.sku_having_unit}</Text>
            </CellBody>
          </Cell>
        </Cells>

        {!!product_detail.tag_info_saving ? (<Text style={styles.goods_desc}>
          保存方法：{product_detail.tag_info_saving}
        </Text>) : null}
        {!!product_detail.tag_info_nur ? (<Text style={styles.goods_desc}>
          介绍：{product_detail.tag_info_nur}
        </Text>) : null}

        {this.renderALlStore()}
      </ScrollView>
    );
  }

  renderALlStore = () => {
    let {store_product} = this.state;
    if (!(tool.length(store_product) > 0)) {
      return <LoadingView/>;
    }

    return (
      <View style={styles.all_stores}>
        <View style={styles.store_head}>
          <Text style={[styles.title_text, styles.store_title]}>门店</Text>
          <Text style={[styles.title_text, styles.stock_title]}>库存</Text>
          <Text style={[styles.title_text, styles.sale_title]}>售价</Text>
        </View>
        {this.renderStoreProduct(store_product)}
      </View>
    );
  };

  renderStoreProduct = (store_product) => {
    let is_dark_bg = false;
    let _this = this;

    return tool.objectMap(store_product, function (s_product, store_id) {
      is_dark_bg = !is_dark_bg;
      return (
        <View key={store_id} style={[styles.store_info, is_dark_bg && styles.single_back]}>
          <View style={[styles.store_view]}>
            <Text style={[styles.info_text, styles.store_name]}>{s_product.store_name}</Text>
            {_this.renderIcon(parseInt(s_product.status))}
          </View>
          <Text style={[styles.info_text, styles.stock_num]}>{parseInt(s_product.left_since_last_stat)}件</Text>
          <Text style={[styles.info_text, styles.sale_price]}>¥ {s_product.price/100}</Text>
        </View>
      );
    });
  };

  renderIcon = (status) => {
    if(status === Cts.STORE_PROD_ON_SALE){
      return <Entypo name='upload' style={[styles.icon_style, styles.icon_on_sale]}/>;
    } else if (status === Cts.STORE_PROD_OFF_SALE){
      return <Entypo name='download' style={[styles.icon_style, styles.icon_lack_stock]}/>
    } else if (status === Cts.STORE_PROD_SOLD_OUT){
      return <Octicons name='alert' style={[styles.icon_style, styles.icon_off_sale]}/>
    }
  };

  renderImg = (list_img, cover_img) => {
    let {full_screen} = this.state;
    let wrapper = full_screen ? full_styles.wrapper : styles.wrapper;
    let goods_img = full_screen ? full_styles.goods_img : styles.goods_img;

    if(tool.length(list_img) > 0){
      let _this = this;
      let img_list = list_img.map((img_url, idx) => {
        return (
          <TouchableHighlight
            key={idx}
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

  onToggleFullScreen(){
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
  goods_view: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    marginVertical: pxToDp(15),
    alignItems: 'center',
  },
  goods_name: {
    fontSize: pxToDp(34),
    color: colors.color333,
  },
  goods_cats: {
    fontSize: pxToDp(28),
    color: colors.color666,
  },
  promote_name: {
    fontSize: pxToDp(30),
    color: colors.color999,
    fontWeight: 'bold',
    paddingHorizontal: pxToDp(30),
    marginVertical: pxToDp(15),
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
    backgroundColor: colors.main_back,
    marginVertical: pxToDp(15),
    marginHorizontal: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    marginLeft: 0,
    paddingLeft: pxToDp(3),
    paddingRight: pxToDp(5),
    height: pxToDp(60),
    justifyContent: 'center',
  },
  cell_label: {
    width: pxToDp(126),
    borderRightWidth: pxToDp(1),
    borderColor: colors.color666,
    fontSize: pxToDp(26),
    fontWeight: 'bold',
    color: colors.color666,
  },
  cell_body: {
    textAlign: 'right',
    fontSize: pxToDp(26),
    fontWeight: 'bold',
    color: colors.color333,
  },

  goods_desc: {
    fontSize: pxToDp(30),
    color: colors.color666,
    paddingHorizontal: pxToDp(30),
    marginVertical: pxToDp(15),
  },

  all_stores: {
    marginVertical: pxToDp(15),
  },
  store_head: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    height: pxToDp(90),
    alignItems: 'center',

    borderTopWidth: pxToDp(1),
    borderColor: colors.color666,
  },
  title_text: {
    fontSize: pxToDp(40),
    fontWeight: 'bold',
    color: colors.color666,
    paddingLeft: pxToDp(10),
  },
  store_title: {
    width: pxToDp(340),
    paddingLeft: 0,
  },
  stock_title: {
    width: pxToDp(190),
  },
  sale_title: {
    width: pxToDp(190),
  },
  store_info: {
    flexDirection: 'row',
    height: pxToDp(60),
    alignItems: 'center',
    paddingHorizontal: pxToDp(30),
  },
  single_back: {
    backgroundColor: '#e6e6e6',
  },
  info_text: {
    fontSize: pxToDp(28),
    fontWeight: 'bold',
    textAlignVertical: 'center',
    height: pxToDp(35),
    paddingLeft: pxToDp(10),
  },
  store_view: {
    paddingLeft: 0,
    width: pxToDp(340),
    flexDirection: 'row',
    alignItems: 'center',
  },
  store_name: {
    paddingLeft: 0,
    color: '#111',
  },
  stock_num: {
    width: pxToDp(190),
    color: colors.color999,
    borderLeftWidth: pxToDp(1),
    borderRightWidth: pxToDp(1),
    borderColor: colors.color666,
  },
  stock_warning: {
    color: '#f44040',
  },
  sale_price: {
    width: pxToDp(190),
    color: colors.color666,
    fontWeight: 'normal',
  },

  icon_style: {
    width: pxToDp(30),
    height: pxToDp(30),
    fontSize: pxToDp(30),
    marginLeft: pxToDp(10),
  },
  icon_on_sale: {
    color: colors.main_color,
  },
  icon_lack_stock: {
    color: '#f44040',
  },
  icon_off_sale: {
    color: colors.color999,
  },
  btn_edit: {
    fontSize: pxToDp(40),
    width: pxToDp(42),
    height: pxToDp(36),
    color: colors.color666,
    marginRight: pxToDp(30),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(GoodsDetailScene)
