import React, {PureComponent} from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
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
import HttpUtils from "../../util/http";

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
    let {productId, storeId} = (this.props.navigation.state.params || {});
    let {fnProviding, is_service_mgr, is_helper} = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      isLoading: false,
      isSyncGoods: false,
      full_screen: false,
      product: {},
      store_prod: {},
      fnProviding: fnProviding,
      is_service_mgr: is_service_mgr,
      is_helper: is_helper,
      sync_goods_info: false,
      include_img: false,
      batch_edit_supply: false,
      show_all_store_prods: false,
    };

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
    const storeId = this.state.store_id;
    const pid = this.state.product_id;
    const url = `/api_products/get_prod_with_store_detail/${storeId}/${pid}`;
    HttpUtils.post.bind(this.props)(url).then((data)=>{
      _this.setState({
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

  render() {
    let {full_screen, product, store_prod} = this.state;
    if (!(tool.length(product) > 0)) {
      return <LoadingView/>;
    }

    if (full_screen) {
      return this.renderImg(product.list_img);
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.onHeaderRefresh()} tintColor='gray'/>
        }
        style={{backgroundColor: colors.main_back}}>
        {this.renderImg(product.mid_list_img)}

        <View style={[styles.goods_info, styles.top_line]}>
          <View style={[styles.goods_view]}>
            <Text style={styles.goods_name}> {product.name} <Text style={styles.goods_id}> (#{product.id})</Text> </Text>
            {product.tag_list !== '' && product.tag_list.split(',').map(function (cat_name, idx) {
              return (
                <Text key={idx} style={styles.goods_cats}> {cat_name} </Text>
              );
            })}
          </View>
        </View>
        <View style={[styles.box_title, styles.top_line]}>
          <Text style={styles.title_name}>门店状态信息</Text>
        </View>
        <Cells style={[styles.cell_box, {marginTop: 0,}]}>
          <Cell customStyle={[styles.cell_row]}><CellHeader><Label style={[styles.cell_label]}>售卖状态</Label></CellHeader>
            <CellBody>
              {this.renderIcon(parseInt(store_prod.status))}
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader><Label style={[styles.cell_label]}>报价</Label></CellHeader>
            <CellBody>
              <Text style={[styles.info_text, styles.sale_price]}>
                ¥ {fn_price_controlled <= 0 ? store_prod.price / 100 : store_prod.supply_price / 100}
              </Text>
              {fn_price_controlled <= 0 ? null :
                  <Image resizeMode={'contain'} style={{height: pxToDp(34), width: pxToDp(34)}} source={require('../../img/Goods/bao_.png')} />
              }
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader><Label style={[styles.cell_label]}>份含量</Label></CellHeader>
            <CellBody>
              <Text style={[styles.cell_body]}>{product.sku_having_unit}</Text>
            </CellBody>
          </Cell>
        </Cells>
      </ScrollView>
    );
  }

  renderIcon = (status) => {
    if (status === Cts.STORE_PROD_ON_SALE) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/shangjia_.png')}/>;
    } else if (status === Cts.STORE_PROD_OFF_SALE) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/xiajia_.png')}/>;
    } else if (status === Cts.STORE_PROD_SOLD_OUT) {
      return <Image style={[styles.icon_style]} source={require('../../img/Goods/quehuo_.png')}/>;
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


export default connect(mapStateToProps, mapDispatchToProps)(GoodStoreDetailScene)
