import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
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
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
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
      ...globalActions
    }, dispatch)
  }
}


class GoodsPriceDetails extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '价格管理',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
    }
  }

  render_status(num) {
    if (num === 1) {
      return (
          <TouchableOpacity
              onPress={() => {
                this.setState({showDialog: true})
              }}
          >
            <Text style={content.change_price}>修改价格</Text>
          </TouchableOpacity>
      )
    } else if (num === 2) {
      return (
          <View style={{width: pxToDp(200)}}>
            <Text style={[content.plat_price, {fontWeight: '100', color: colors.color333}]}>51.00 同步中...</Text>
            <Text style={[content.plat_min_price, {
              lineHeight: pxToDp(28),
              textAlignVertical: 'center',
              marginTop: pxToDp(13),
              marginBottom: pxToDp(2)
            }]}>45.00 同步中...</Text>
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

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={header.box}>
            <Image
                style={header.image}
                source={{uri: 'http://images2.1tu.com/jpg_00/00/00/72/77/45/220_6003716697_dOKxo6OdHzuR8C27EDgA.jpg'}}
            />
            <View style={header.desc}>
              <Text style={header.text}>优质品牌优质橘子500g</Text>
              <Text style={header.text}>#187171</Text>
              <Text style={header.text}>在售此商品店铺数:32</Text>
            </View>
          </View>
          <ScrollView>
            {/*<Cells>*/}
            <Cell customStyle={content.store} style={{borderTopWidth: 0}} first={true}>
              <CellHeader style={content.cell_header}>
                <Text style={content.store_name}>回龙观</Text>
                <Text style={content.store_type}>代运营店铺</Text>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <Text style={content.store_price}>￥20.00</Text>
                <Image source={require('../../img/Goods/baojia_.png')}
                       style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
              </CellFooter>
            </Cell>
            <Cell customStyle={content.store} style={{borderTopWidth: 0}}>
              <CellHeader style={content.cell_header}>
                <Image source={require('../../img/Goods/weixinjiage_.png')} style={content.plat_img}/>
                <View>
                  <Text style={content.plat_price}>5145.00</Text>
                  {/*<Text style={content.plat_min_price}>45.00</Text>*/}
                </View>
                <Image style={content.price_status} source={require('../../img/Goods/zuidajia_.png')}/>
              </CellHeader>
              <CellBody>

                {
                  this.render_status(1)
                }
              </CellBody>
              <CellFooter>
                <Image source={require('../../img/Goods/shangjia.png')}
                       style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
              </CellFooter>
            </Cell>

            <Cell customStyle={content.store} style={{borderTopWidth: 0}}>
              <CellHeader style={content.cell_header}>
                <Image source={require('../../img/Goods/meituanwaimai_.png')} style={content.plat_img}/>
                <View>
                  <Text style={content.plat_price}>51.00</Text>
                  <Text style={content.plat_min_price}>45.00</Text>
                </View>
                <Image style={content.price_status} source={require('../../img/Goods/zuidajia_.png')}/>
              </CellHeader>
              <CellBody>

                {
                  this.render_status(2)
                }
              </CellBody>
              <CellFooter>
                <Image source={require('../../img/Goods/shangjia.png')}
                       style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
              </CellFooter>
            </Cell>

            <Cell customStyle={content.store} style={{borderTopWidth: 0}}>
              <CellHeader style={content.cell_header}>
                <Image source={require('../../img/Goods/meituanwaimai_.png')} style={content.plat_img}/>
                <View>
                  <Text style={content.plat_price}>51.00</Text>
                  <Text style={content.plat_min_price}>45.00</Text>
                </View>
                <Image style={content.price_status} source={require('../../img/Goods/zuidajia_.png')}/>
              </CellHeader>
              <CellBody>

                {
                  this.render_status(3)
                }
              </CellBody>
              <CellFooter>
                <Image source={require('../../img/Goods/shangjia.png')}
                       style={{height: pxToDp(28), width: pxToDp(28), marginLeft: pxToDp(20)}}/>
              </CellFooter>
            </Cell>
            {/*</Cells>*/}
          </ScrollView>
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
                      this.setState({showDialog: false,})
                    }
                  }
                  ]}
          >
            <View >
              <Text style ={{marginBottom:pxToDp(10)}}>
                输入要修改的价格(元)<Text style ={{color:colors.main_color,fontSize:pxToDp(24)}}>原价:23.65元</Text>
              </Text>
              <TextInput
                  style={{
                    height:pxToDp(90),
                    borderRadius:pxToDp(10),
                    borderWidth:pxToDp(1),
                    borderColor:colors.fontGray,
                  }}
                  keyboardType={'numeric'}
                  underlineColorAndroid={'transparent'}
                  onChange={(text) => {
                    console.log(text);
                  }}
              />
            </View>

          </Dialog>
        </View>
    )
  }
}

const header = StyleSheet.create({
  box: {
    height: pxToDp(134),
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
    height: pxToDp(95),
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
  },
  cell_header: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',
    width: pxToDp(270),
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
    height: pxToDp(32),
    fontWeight: '600',
    color: colors.main_color,
  },
  price_status: {
    height: pxToDp(28),
    width: pxToDp(28),
    marginLeft: pxToDp(20)
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
    borderRadius: pxToDp(5)
  }


});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsPriceDetails)
