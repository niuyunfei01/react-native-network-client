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
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchStoreChgPrice, fetchListStoresGoods} from '../../reducers/product/productActions.js';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Button} from "../../weui/index";
import Dialog from './Dialog'

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
      query: true,
      store_id: 0,
      new_price_cents: '',
      dialogPrice: '',
      isRefreshing: false,
      uploading: false,
      platId: Cts.WM_PLAT_ID_MT,
      sort: 0,
      navListLogo: [
        {plat_id: Cts.WM_PLAT_ID_WX, logo: require('../../img/Goods/weixinjiage_.png')},
        {plat_id: Cts.WM_PLAT_ID_BD, logo: require('../../img/Goods/baiduwaimai_.png')},
        {plat_id: Cts.WM_PLAT_ID_ELE, logo: require('../../img/Goods/elmwaimai_.png')},
        {plat_id: Cts.WM_PLAT_ID_MT, logo: require('../../img/Goods/meituanwaimai_.png')},
        {plat_id: Cts.WM_PLAT_ID_JD, logo: require('../../img/Goods/jingdongdaojia_.png')}
      ],
      storesList: [],
      showDialogRefer: false,
      priceSet: '',
      upperLimit: 100,
      lowerLimit: 100,
      referPrice: 0
    }
  }

  async componentWillMount() {
    let {item, vendorId} = this.props.navigation.state.params;
    let {list_img, max_price, min_price, name, product_id, sale_store_num,} = item;
    await this.setState({list_img, name, product_id, sale_store_num, vendorId});
    this.getListStoresGoods();
  }

  async getListStoresGoods() {
    let {product_id, vendorId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchListStoresGoods(vendorId, product_id, accessToken, (ok, desc, obj) => {
      this.setState({query: false});
      if (ok) {
        let {price, upper_limit, lower_limit} = obj.refer_info ||{};
        this.setState({
          storesList: obj.store_list,
          referPrice: price,
          upperLimit: upper_limit,
          lowerLimit: lower_limit,
        })
      } else {
        ToastLong(desc);
      }
    }));
  }

  reduce(str) {
    let num = this.state[str];
    if (str == 'upperLimit') {
      if (num > 100) {
        num--;
      } else {
        ToastLong('上限值,不能小于100%');
      }
      this.setState({[str]: num})

    } else {
      if (num > 1) {
        num--;
        this.setState({[str]: num})
      } else {
        ToastLong('下限值,不能小于0');
      }
    }
  }

  add(str) {
    let num = this.state[str];
    console.log(num);
    if (str == 'upperLimit') {
      num++;
      console.log(num);
      this.setState({[str]: num})
    } else {
      if (num >= 100) {
        ToastLong('下线最大值不能超过100%')
      } else {
        num++;
        this.setState({[str]: num})
      }
    }
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
    dispatch(fetchStoreChgPrice(store_id, product_id, Math.ceil(new_price_cents * 100), accessToken, async (ok, desc, obj) => {
      this.setState({uploading: false});
      if (ok) {
        await this.getListStoresGoods();
        ToastLong('提交成功');
      } else {
        ToastLong(desc);
      }
    }));
  }

  renderSort(index) {
    let {platId, sort} = this.state;
    if (platId == index) {
      return (
          <Image style={[header.sort_img, {transform: [{rotate: `${sort * (180)}deg`}]}]}
                 source={require('../../img/Goods/paixu_.png')}/>
      )
    } else {
      return <View style={[header.sort_img]}/>
    }
  }
  listSort() {
    let {platId,storesList} = this.state;
    storesList.sort(function (a, b) {
      return b['wm_goods'][platId]-a['wm_goods'][platId]
    });
    console.log(storesList);
    this.forceUpdate();
  }
  renderNav() {
    let {navListLogo} = this.state;
    return navListLogo.map((item, index) => {
      let {logo, plat_id} = item;
      let {sort, platId} = this.state;
      return (
          <TouchableOpacity
              style={{flex: 1}}
              key={index}
              onPress={() => {
                if (platId == plat_id) {
                  this.setState({platId: plat_id, sort: !sort})
                  this.listSort();
                } else {
                  this.setState({platId: plat_id, sort: 0});
                  this.listSort();
                }
              }}
          >
            <View style={header.logo_box}>
              <Image style={header.plat_img} source={logo}/>
              {
                this.renderSort(plat_id)
              }
            </View>
          </TouchableOpacity>
      )
    })

  }

  renderChangePrice(wm_goods) {
    let {platId} = this.state;
    let goodsDetail = wm_goods[platId];
    if (!goodsDetail) {
      return <CellBody/>
    }
    let {price, sync_price} = goodsDetail;
    if(platId==Cts.WM_PLAT_ID_WX){
      return <CellBody/>
    }else if (price == sync_price) {
      return <CellBody/>
    } else {
      return (
          <CellBody style={{flexDirection: 'row'}}>
            <Text style={content.change}>改价</Text>
            <Text style={content.change}>--></Text>
            <Text style={content.change}>{tool.toFixed(sync_price)}</Text>
            <Text style={content.change}>生效中</Text>
          </CellBody>
      )
    }
  }
  getPlatPrice(wm_goods, key) {
    let goodsDetail = wm_goods[key];
    if (!goodsDetail) {
      return '---'
    }
    let {price} = goodsDetail;
    return tool.toFixed(price);
  }

  storeLevel(wm_goods) {
    let {referPrice, upperLimit, lowerLimit, platId} = this.state;
    // let {price} = wm_goods[platId];
    if(!wm_goods[platId]){
      return null
    }else {
      let {price} = wm_goods[platId];
      if (price > referPrice * upperLimit) {
        return require('../../img/Goods/pngpiangao_.png')
      } else if (price < referPrice * lowerLimit) {
        return require('../../img/Goods/piandi_.png')
      } else {
        return require('../../img/Goods/zhengchang_.png')
      }
    }

  }

  renderList() {
    let {storesList, platId} = this.state;
    return storesList.map((item, index) => {
      let {store_name, fn_price_controlled, store_id, supply_price} = item;
      return (
          <View style={content.item} key={index}>
            <Cell customStyle={content.cell} first={true}>
              <CellHeader>
                <Text style={{color: colors.fontGray}}>{store_name}</Text>
              </CellHeader>
              {
                this.renderChangePrice(item.wm_goods)
              }
              {
                fn_price_controlled == 1 ?
                    <CellFooter style={content.cell_footer}>
                      <Text style={{
                        marginRight: pxToDp(10),
                        fontSize: pxToDp(24),
                        color: colors.fontGray
                      }}>{tool.toFixed(supply_price)}</Text>
                      <Image style={content.bao_img} source={require('../../img/Goods/baohui_.png')}/>
                    </CellFooter> : <CellFooter/>
              }
            </Cell>
            <View style={content.price_group}>
              <Image style={content.price_group_img} source={this.storeLevel(item.wm_goods)}/>
              <View style={content.plat_price_box}>
                <TouchableOpacity
                    onPress={() => {
                      this.setState({showDialog: true})
                    }}
                >
                  <Text
                      style={[content.plat_price, content.plat_price_wx]}>{this.getPlatPrice(item.wm_goods, Cts.WM_PLAT_ID_WX)}</Text>
                </TouchableOpacity>
              </View>
              <View style={[content.plat_price_box]}>
                <Text style={
                  Cts.WM_PLAT_ID_BD == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]
                }>
                  {this.getPlatPrice(item.wm_goods, Cts.WM_PLAT_ID_BD)}
                </Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_ELE == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>
                  {this.getPlatPrice(item.wm_goods, Cts.WM_PLAT_ID_ELE)}

                </Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_MT == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>
                  {this.getPlatPrice(item.wm_goods, Cts.WM_PLAT_ID_MT)}

                </Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_JD == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>
                  {this.getPlatPrice(item.wm_goods, Cts.WM_PLAT_ID_JD)}
                </Text>
              </View>
            </View>
          </View>
      )
    })
  }

  render() {
    let {list_img, name, sale_store_num, product_id, upperLimit, lowerLimit,referPrice} = this.state;
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
          <View style={header.nav}>
            {
              this.renderNav()
            }
          </View>
          <ScrollView style={{marginTop: pxToDp(7)}}>
            {
              this.renderList()
            }
          </ScrollView>
          <View style={content.footer}>
            <View>
              <View style={content.footer_text_box}>
                <Text style={content.footer_text}>参考价:{1}</Text>
                <Text style={content.footer_text}>100%</Text>
              </View>
              <View style={content.footer_text_box}>
                <Text style={content.footer_text}>上限值:{tool.toFixed(referPrice*upperLimit)} </Text>
                <Text style={content.footer_text}>{upperLimit}%</Text>
              </View>
              <View style={content.footer_text_box}>
                <Text style={content.footer_text}>下限值:{tool.toFixed(referPrice*lowerLimit)}</Text>
                <Text style={content.footer_text}>{lowerLimit}%</Text>
              </View>
            </View>
            <TouchableOpacity
                onPress={() => {
                  this.setState({showDialogRefer: true})
                }}
            >
              <Text style={content.footer_btn}>
                设置参考价
              </Text>
            </TouchableOpacity>

          </View>

          <Dialog onRequestClose={() => {
          }}
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
              <View style={{marginBottom: pxToDp(10), width: '100%', flexDirection: 'row'}}>
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
          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.showDialogRefer}
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
                      this.setState({showDialogRefer: false,})
                    }
                  }, {
                    type: 'primary',
                    label: '保存',
                    onPress: () => {
                      this.setState({showDialogRefer: false, uploading: true});
                      this.upChangePrice();
                    }
                  }
                  ]}
          >
            <View>
              <View style={{marginBottom: pxToDp(10), width: '100%', flexDirection: 'row'}}>
                <Text> 参考价(元)</Text>
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
              />
            </View>
            <View style={content.refer}>
              <Text style={{marginRight: pxToDp(30)}}>上限值</Text>
              <TouchableOpacity
                  onPress={() => this.reduce('upperLimit')}
              >
                <Image style={content.add} source={require('../../img/Goods/baohui_.png')}/>

              </TouchableOpacity>
              <Text style={content.percentage}>{upperLimit}%</Text>
              <TouchableOpacity
                  onPress={() => {
                    this.add('upperLimit');
                  }}
              >
                <Image style={content.add} source={require('../../img/Goods/baohui_.png')}/>
              </TouchableOpacity>
              <Text style={{width: pxToDp(140), textAlign: 'center'}}>999.99</Text>
            </View>
            <View style={[content.refer, {marginTop: pxToDp(30)}]}>
              <Text style={{marginRight: pxToDp(30)}}>下限值</Text>
              <TouchableOpacity
                  onPress={() => this.reduce('lowerLimit')
                  }
              >
                <Image style={content.add} source={require('../../img/Goods/baohui_.png')}/>

              </TouchableOpacity>
              <Text style={content.percentage}>{lowerLimit}%</Text>
              <TouchableOpacity
                  onPress={() => this.add('lowerLimit')}
              >
                <Image style={content.add} source={require('../../img/Goods/baohui_.png')}/>
              </TouchableOpacity>
              <Text style={{width: pxToDp(140), textAlign: 'center'}}>999.99</Text>
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
  },
  nav: {
    height: pxToDp(100),
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  plat_img: {
    height: pxToDp(56),
    width: pxToDp(56),
    marginRight: pxToDp(5),
  },
  logo_box: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sort_img: {
    height: pxToDp(45),
    width: pxToDp(17),
    position: 'absolute',
    right: pxToDp(15)
  }
});
const content = {
  item: {
    height: pxToDp(170),
    backgroundColor: colors.white,
    marginBottom: pxToDp(1),
    paddingVertical: pxToDp(30),
    position: 'relative',
  },
  cell: {
    marginLeft: 0,
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',
  },
  bao_img: {
    height: pxToDp(28),
    width: pxToDp(28),
  },
  change: {
    marginRight: pxToDp(20)
  },
  cell_footer: {
    alignItems: 'center',
  },
  price_group: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',
    height: pxToDp(100)
  },
  price_group_img: {
    position: 'absolute',
    height: pxToDp(48),
    width: pxToDp(12),
    left: pxToDp(10),
    top: pxToDp(22),
    zIndex: 100,
  },
  plat_price_box: {
    flex: 1,
    paddingHorizontal: pxToDp(5)
  },
  plat_price: {
    fontSize: pxToDp(30),
    fontWeight: '900',
    color: colors.fontBlack,
    textAlign: 'center',
  },
  plat_price_wx: {
    color: colors.fontBlue,
    borderWidth: pxToDp(1),
    borderColor: colors.fontBlue,
    textAlign: 'center',
    borderRadius: pxToDp(6)
  },
  plat_price_select: {
    backgroundColor: '#ede795',
    borderRadius: pxToDp(20),
  },
  footer: {
    height: pxToDp(140),
    backgroundColor: colors.fontBlue,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footer_text: {
    fontSize: pxToDp(24),
    color: colors.white,
  },
  footer_text_box: {
    flexDirection: 'row',
    width: pxToDp(260),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: pxToDp(2),

  },
  footer_btn: {
    height: pxToDp(90),
    width: pxToDp(250),
    backgroundColor: '#fff45c',
    color: colors.fontBlack,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(6)
  },
  refer: {
    flexDirection: 'row',
    marginTop: pxToDp(20),
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  add: {
    height: pxToDp(50),
    width: pxToDp(50),
  },
  percentage: {
    textAlign: 'center',
    width: pxToDp(130),
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray,
    marginHorizontal: pxToDp(15),
    borderRadius: pxToDp(6),
    height: pxToDp(80),
    textAlignVertical: 'center',
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsPriceDetails)
