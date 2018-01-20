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
      query: false,
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
      storesList: [{}],
    }
  }

  async componentWillMount() {
    let {item, vendorId} = this.props.navigation.state.params;
    let {list_img, max_price, min_price, name, product_id, sale_store_num,} = item;
    await this.setState({list_img, name, product_id, sale_store_num, vendorId});
    // this.getListStoresGoods()
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
                } else {
                  this.setState({platId: plat_id, sort: 0})
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

  renderList() {
    let {storesList, platId} = this.state;
    return storesList.map((item, index) => {
      return (
          <View style={content.item} key={index}>

            <Cell customStyle={content.cell} first={true}>
              <CellHeader>
                <Text>海军水果</Text>
              </CellHeader>
              <CellBody style={{flexDirection: 'row'}}>
                <Text style={content.change}>改价</Text>
                <Text style={content.change}>--></Text>
                <Text style={content.change}>52.50</Text>
                <Text style={content.change}>生效中</Text>
              </CellBody>
              <CellFooter style={content.cell_footer}>
                <Text style={{marginRight: pxToDp(10), fontSize: pxToDp(24), color: colors.fontGray}}>39.00</Text>
                <Image style={content.bao_img} source={require('../../img/Goods/baohui_.png')}/>
              </CellFooter>
            </Cell>
            <View style={content.price_group}>
              <View style={content.plat_price_box}>
               <TouchableOpacity
                   onPress ={()=>{
                     this.setState({showDialog:true})
                   }}
               >
                 <Text style={[content.plat_price, content.plat_price_wx]}>585.26</Text>
               </TouchableOpacity>
              </View>
              <View style={[content.plat_price_box]}>
                <Text style={
                  Cts.WM_PLAT_ID_BD == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]
                }>559.26</Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_ELE == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>
                  595.26
                </Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_MT == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>595.26</Text>
              </View>
              <View style={content.plat_price_box}>
                <Text
                    style={Cts.WM_PLAT_ID_JD == platId ? [content.plat_price, content.plat_price_select] : [content.plat_price]}>595.26</Text>
              </View>
            </View>
          </View>
      )
    })
  }

  render() {
    let {list_img, name, sale_store_num, product_id} = this.state;
    console.log('list_img',list_img);
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
              <View style = {content.footer_text_box}>
                <Text style={content.footer_text}>参考价:62.88 </Text>
                <Text style={content.footer_text}>100%</Text>
              </View>
              <View style = {content.footer_text_box}>
                <Text style={content.footer_text}>参考价:62.88 </Text>
                <Text style={content.footer_text}>100%</Text>
              </View>
              <View style = {content.footer_text_box}>
                <Text style={content.footer_text}>参考价:62.88 </Text>
                <Text style={content.footer_text}>100%</Text>
              </View>

            </View>
              <Text style ={{
                height:pxToDp(90),
                width:pxToDp(250),
                backgroundColor:'#fff45c',
                color:colors.fontBlack,
                textAlign:'center',
                textAlignVertical:'center',
                borderRadius:pxToDp(6)
              }
  }>
                设置参考价
              </Text>
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
    paddingVertical: pxToDp(30)
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
    marginTop: pxToDp(20)
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
    height:pxToDp(140),
    backgroundColor:colors.fontBlue,
    paddingHorizontal:pxToDp(30),
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  footer_text:{
    fontSize:pxToDp(24),
    color:colors.white,
  },
  footer_text_box:{
    flexDirection:'row',
    width:pxToDp(260),
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:pxToDp(2),

  }


}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsPriceDetails)
