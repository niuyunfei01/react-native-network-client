import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {getVendorStores} from "../../reducers/mine/mineActions";
import {fetchStoreChgPrice, fetchListStoresGoods} from '../../reducers/product/productActions.js';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import InputNumber from 'rc-input-number';

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchListStoresGoods,
      fetchStoreChgPrice,
      ...globalActions
    }, dispatch)
  }
}


class GoodsPriceDetails extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '价格监管',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      list_img: '',
      name: '',
      product_id: '',
      sale_store_num: '',
      vendorId: 0,
      storesList: [],
      query: true,
      store_id: 0,
      new_price_cents: '',
      dialogPrice: '',
      isRefreshing: false,
      uploading: false,

    }
  }

  async componentWillMount() {
    let {item, vendorId} = this.props.navigation.state.params;
    let {list_img, max_price, min_price, name, product_id, sale_store_num,} = item;
    await this.setState({list_img, name, product_id, sale_store_num, vendorId});
    this.getListStoresGoods()
  }

  async getListStoresGoods() {
    let {product_id, vendorId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchListStoresGoods(vendorId, product_id, accessToken, (ok, desc, obj) => {
      this.setState({query: false});
      if (ok) {
        this.setState({storesList: obj})
      } else {
        ToastLong(desc);
      }
    }));
  }

  upChangePrice() {
    let {product_id, store_id, new_price_cents, uploading} = this.state;
    if (Math.ceil(new_price_cents * 100) < 0) {
      ToastLong('修改价格不能小于0');
      return false
    }
    if (uploading && Math.ceil(new_price_cents * 100) < 0) {
      return false
    }
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchStoreChgPrice(store_id, product_id, Math.ceil(new_price_cents * 100), accessToken, async(ok, desc, obj) => {
      this.setState({uploading: false});
      if (ok) {
        await this.getListStoresGoods();
        ToastLong('提交成功');
      } else {
        ToastLong(desc);
      }
    }));
  }

  price_status(item, store_id = 0) {
    let {status, price, platform_id, sync_price} = item || {};
    if (platform_id == Cts.WM_PLAT_ID_WX) {
      return (
          <TouchableOpacity
              onPress={() => {
                this.setState({showDialog: true, store_id: store_id, dialogPrice: price, new_price_cents: ''})
              }}
          >
            <Text style={content.change_price}>修改价格</Text>
          </TouchableOpacity>
      )
    } else if (sync_price >= 0 && (Math.abs(parseInt(sync_price) - parseInt(price)) > 10)) {
      return (
          <View style={{minWidth: pxToDp(200), maxWidth: pxToDp(300)}}>
            <Text style={{fontSize:pxToDp(30)}}>{tool.toFixed(sync_price)} 同步中...</Text>
            <Text style={[content.plat_min_price, {
              lineHeight: pxToDp(28),
              textAlignVertical: 'center',
              marginTop:pxToDp(4),
            }]}>{tool.toFixed(price)} 同步中...</Text>
          </View>
      )
    } else {
      return (
          <View style={{width: pxToDp(150), justifyContent: 'center', alignItems: 'center'}}>
            <Icon
                name={'success_circle'}
                size={pxToDp(50)}
                color={'#bfbfbf'}
                msg={false}/>
          </View>
      )
    }
  }

  priceMaxMinImg(item) {
    let {is_max, is_min} = item;

    if (is_max) {
      return require('../../img/Goods/zuidajia_.png')
    } else if (is_min) {
      return require('../../img/Goods/zuixiaojia_.png')
    } else {
      return null;
    }
  }

  renderList() {
    let {storesList} = this.state;
    return storesList.map((item, index) => {
      let {fn_price_controlled, store_id, store_name, wm_goods, supply_price} = item || {};
      return (
          <Cells key={index}>
            <Cell customStyle={content.store} style={{borderTopWidth: 0}} first={true}>
              <CellHeader style={content.cell_header}>
                <Text style={content.store_name}>{store_name}</Text>
                {
                  fn_price_controlled == 1 ? <Text style={content.store_type}>代运营店铺</Text> : <Text/>
                }
              </CellHeader>
              <CellBody/>
              {
                fn_price_controlled == 1 ? <CellFooter>
                  <Text style={content.store_price}>￥{tool.toFixed(supply_price)}</Text>
                  <Image source={require('../../img/Goods/baojia_.png')}
                         style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
                </CellFooter> : <Text/>
              }
            </Cell>
            {
              wm_goods.map((ite, key) => {
                let {status, price, platform_id, before_price} = ite;
                return (
                    <Cell key={key} customStyle={content.store} style={{borderTopWidth: 0}}>
                      <CellHeader style={content.cell_header}>
                        <Image source={tool.platformsLogo(platform_id)} style={content.plat_img}/>
                        <View>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={content.plat_price}>{tool.toFixed(price)}</Text>
                            <Image style={content.price_status} source={this.priceMaxMinImg(ite)}/>
                          </View>
                          {
                            before_price ?
                                <Text style={content.plat_min_price}>{tool.toFixed(before_price)}</Text> : null
                          }
                        </View>
                      </CellHeader>
                      <CellBody>
                        {
                          this.price_status(ite, store_id)
                        }
                      </CellBody>
                      <CellFooter>
                        <Image source={tool.goodSoldStatusImg(status)}
                               style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
                      </CellFooter>
                    </Cell>
                )
              })
            }
          </Cells>
      )
    })
  }

  render() {
    let {list_img, name, sale_store_num, product_id} = this.state;
    return (
        <View style={{flex: 1}}>
          <View style={header.box}>
            <Image
                style={header.image}
                source={{uri: list_img}}
            />
            <View style={header.desc}>
              <Text style={header.text}>{name}</Text>
              <Text style={header.text}>#{product_id}</Text>
              <Text style={header.text}>在售此商品店铺数:{sale_store_num}</Text>
            </View>
          </View>
          <ScrollView
              style = {{flex:1}}
              refreshControl={
                <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={() => {
                      this.setState({query: true});
                      this.getListStoresGoods()
                    }
                    }
                    tintColor='gray'
                />
              }

          >
            {
              this.renderList()
            }
            <View style = {{height:pxToDp(20)}}/>
          </ScrollView>
          <Dialog onRequestClose={() => {}}
                  visible={this.state.showDialog}
                  title={'价格修改'}
                  titleStyle={{textAlign: 'center', color: colors.white}}
                  headerStyle={{
                    backgroundColor: colors.main_color,
                    paddingTop: pxToDp(20),
                    justifyContent: 'center',
                    paddingBottom: pxToDp(20)
                  }}
                  buttons={[{

                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.setState({showDialog: false,})
                    }
                  }, {
                    type: 'primary',
                    label: '保存',
                    onPress: () => {
                      this.setState({showDialog: false, uploading: true});
                      this.upChangePrice();
                    }
                  }
                  ]}
          >
            <View>
              <View style={{marginBottom: pxToDp(10),width:'100%',flexDirection:'row'}}>
                <Text> 输入要修改的价格(元)</Text>
                <Text style={{color: colors.main_color, fontSize: pxToDp(24), marginLeft: pxToDp(20)}}>
                  原价:{tool.toFixed(this.state.dialogPrice)}元
                </Text>
              </View>
              <TextInput
                  style={{
                    height: pxToDp(90),
                    borderRadius: pxToDp(10),
                    borderWidth: pxToDp(1),
                    borderColor: colors.fontGray,
                  }}
                  keyboardType={'numeric'}
                  underlineColorAndroid={'transparent'}
                  onChangeText={(text) => {
                    console.log(text);
                    this.setState({new_price_cents: text})
                  }}
              />
            </View>

          </Dialog>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中...</Toast>
          <Toast
              icon="loading"
              show={this.state.uploading}
              onRequestClose={() => {
              }}
          >提交中...</Toast>
        </View>
    )
  }
}

const header = StyleSheet.create({
  box: {
    minHeight: pxToDp(134),
    backgroundColor: colors.main_color,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',

  },
  image: {
    height: pxToDp(95),
    width: pxToDp(95),
  },
  desc: {
    minHeight: pxToDp(95),
    marginLeft: pxToDp(20),
  },
  text: {
    fontSize: pxToDp(24),
    color: colors.white,
    textAlignVertical: 'center',
    lineHeight: pxToDp(30)
  }
})
const content = StyleSheet.create({
  store: {
    marginLeft: 0,
    alignItems: 'center',
    height: pxToDp(100),
    backgroundColor: '#fff',
    borderColor: colors.fontGray,
  },
  cell_header: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',
    minWidth: pxToDp(270),
    maxWidth:pxToDp(350),
  },
  store_name: {
    fontSize: pxToDp(36),
    color: colors.fontBlack
  },
  store_type: {
    color: colors.main_color,
    borderColor: colors.main_color,
    height: pxToDp(35),
    lineHeight: pxToDp(30),
    borderRadius: pxToDp(18),
    borderWidth: pxToDp(1),
    marginLeft: pxToDp(20),
    fontSize: pxToDp(24),
    textAlignVertical: 'center',
    width: pxToDp(140),
    textAlign: 'center',
  },
  store_price: {
    fontSize: pxToDp(30),
    color: colors.main_color,
  },
  plat_img: {
    height: pxToDp(56),
    width: pxToDp(56),
    marginRight: pxToDp(20),
  },
  plat_price: {
    fontSize: pxToDp(32),
    fontWeight: '900',
    color: colors.main_color,
    lineHeight: pxToDp(32),
  },
  price_status: {
    height: pxToDp(28),
    width: pxToDp(28),
    marginLeft: pxToDp(20),
  },
  plat_min_price: {
    fontSize: pxToDp(20),
    color: colors.fontGray,
    marginTop: pxToDp(15),
    width: '100%'
  },
  change_price: {
    width: pxToDp(150),
    height: pxToDp(50),
    color: colors.white,
    textAlign: 'center',
    backgroundColor: '#00a0e9',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    fontSize:pxToDp(24),
  }


});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsPriceDetails)
