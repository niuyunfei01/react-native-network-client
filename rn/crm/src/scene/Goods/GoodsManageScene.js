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
import GoodsSelect from './GoodsSelect'

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

class GoodsMangerScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '商品管理',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      toggle: false
    }
  }

  toggleSelectBox() {
    let {toggle} = this.state;
    this.setState({toggle: !toggle})
  }

  renderSelectBox() {
    let {toggle} = this.state;
    if (toggle) {
      return (
          <View style={select.items_wrapper}>
            <View style={select.items_box}>
              <TouchableOpacity
                  onPress={() => {
                    console.log('选择品牌');
                    this.toggleSelectBox()
                  }}
              >
                <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
              </TouchableOpacity>
              {/*<Text style={[select.select_item, select.select_item_cancel]}>鲜果集</Text>*/}
              {/*<Text style={[select.select_item, select.select_item_cancel]}>比邻生鲜</Text>*/}
              {/*<Text style={[select.select_item, select.select_item_cancel]}>青青果蔬</Text>*/}
              {/*<Text style = {{width:pxToDp(172)}}></Text>*/}
              {/*<Text style={[select.select_item, select.select_item_cancel]}>青青果蔬</Text>*/}
            </View>
            <TouchableWithoutFeedback
                onPress={() => {
                  this.toggleSelectBox()
                }}
            ><View style={{flex: 1}}/>

            </TouchableWithoutFeedback>
          </View>
      )
    } else {
      return null;
    }

  }

  renderGoodsList() {
    return (
        <View style={content.goods_item}>
          <View style={{paddingHorizontal: pxToDp(10)}}>
            <Image style={content.good_img}
                   source={{uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1515670256433&di=51cfe0283cc5167233982f0d790182aa&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Faa64034f78f0f736c987fe250055b319ebc4139c.jpg'}}/>
            <Text style={content.good_id}>#135151</Text>
          </View>
          <View style={{paddingRight: pxToDp(30), flex: 1, paddingLeft: pxToDp(10)}}>
            <Text style={content.good_name}
                  numberOfLines={2}
            >超级无敌宇宙小橘子超级无敌宇宙小橘子超级无敌宇宙小橘子超级无敌宇宙小橘子超级无敌宇宙小橘子</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={content.good_desc}>
                <Text style={content.on_sale}>在售(25)家</Text>
              </View>
              <View style={content.good_desc}>
                <Image style={content.zuidajia_img} source={require('../../img/Goods/zuidajia_.png')}/>
                <Text style={content.zuidajia}>26.45</Text>
              </View>
              <View style={content.good_desc}>
                <Image style={content.zuidajia_img} source={require('../../img/Goods/zuixiaojia_.png')}/>
                <Text style={content.zuixiaojia}>26.45</Text>
              </View>
            </View>
          </View>
        </View>

    )
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={!this.state.toggle ? [select.wrapper] : [select.wrapper, select.wrapper_active]}>

            <ImageBtn name='菜鸟食材'/>
            <View style = {{
              height:pxToDp(100),
              width:pxToDp(220),
              borderBottomColor:colors.white,
            }}>
              <ImageBtn name='销量降序'/>
            </View>

            <ImageBtn name='美团外卖'/>
          </View>
          {
            this.renderSelectBox()
          }

          <View style={content.box}>
            <View style={content.left}>
              <ScrollView>
                <Text style={content.type}>listType</Text>
              </ScrollView>
            </View>

            <ScrollView style={content.right}>
              {
                this.renderGoodsList()
              }

            </ScrollView>
          </View>
        </View>
    )
  }
}

class ImageBtn extends PureComponent {
  constructor() {
    super()
  }

  render() {
    let {name, onPress} = this.props;
    return (
        <TouchableOpacity
            onPress={() => {
              onPress()
            }}
        >
          <View style={select.item}>
            <Text style={select.item_text}>{name}</Text>
            <Image source={require('../../img/Public/xiangxialv_.png')}
                   style={{width: pxToDp(28), height: pxToDp(18), marginLeft: pxToDp(10)}}/>
          </View>
        </TouchableOpacity>
    )
  }
}

const content = StyleSheet.create({
  box: {
    flexDirection: "row",
    flex: 1
  },
  left: {
    width: pxToDp(162),
    height: '100%',
    backgroundColor: colors.white,
  },
  right: {
    height: '100%',
    flex: 1,
  },
  type: {
    height: pxToDp(76),
    textAlign: 'center',
    fontSize: pxToDp(24),
    color: '#4c4c4c',
    textAlignVertical: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: pxToDp(1),
  },
  type_active: {
    height: pxToDp(76),
    textAlign: 'center',
    fontSize: pxToDp(24),
    color: colors.main_color,
    backgroundColor: '#eee'
  },
  goods_item: {
    flexDirection: 'row',
    paddingVertical: pxToDp(15),
    marginBottom: pxToDp(5),
    backgroundColor: colors.white,
    marginLeft: pxToDp(7)
  },
  good_img: {
    height: pxToDp(110),
    width: pxToDp(110),
  },
  good_id: {
    height: pxToDp(40),
    width: pxToDp(110),
    backgroundColor: '#eee',
  },
  good_name: {
    fontSize: pxToDp(26),
    color: '#4a4a4a',
    lineHeight: pxToDp(30),
  },
  on_sale: {
    color: colors.main_color,
    fontSize: pxToDp(24),
    textAlignVertical: "top",
    marginBottom: pxToDp(4),
    height: pxToDp(40),
  },
  zuidajia_img: {
    height: pxToDp(26),
    width: pxToDp(26),
  },
  zuidajia: {
    fontSize: pxToDp(24),
    color: '#e60012',
    marginLeft: pxToDp(8),
  },
  zuixiaojia: {
    fontSize: pxToDp(24),
    color: '#1f9cdd',
  },
  good_desc: {
    height: pxToDp(40),
    flexDirection: 'row',
    alignItems: 'center'
  }

});
const select = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    position: 'relative',
    width: '100%',
    minHeight: pxToDp(100),
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
  },
  wrapper_active: {
    zIndex: 1000,
    borderBottomWidth: 0,
  },
  item: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(57),
    width: pxToDp(186),
    borderRadius: pxToDp(5),
    justifyContent: 'center'
  },
  item_text: {
    // fontSize: pxToDp(24)
  },
  items_wrapper: {
    width: '100%',
    position: 'absolute',
    top: pxToDp(79),
    backgroundColor: 'rgba(0,0,0,.4)',
    height: '100%',
    zIndex: 100,
    borderTopWidth: pxToDp(1)
  },
  items_box: {
    minHeight: pxToDp(50),
    backgroundColor: "#fff",
    paddingHorizontal: pxToDp(45),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: pxToDp(50),
    justifyContent: 'space-between',
    borderTopWidth: pxToDp(1)
  },
  select_item: {
    width: pxToDp(172),
    marginTop: pxToDp(50),
    height: pxToDp(55),
    textAlign: 'center',
    borderRadius: pxToDp(25),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
  },
  select_item_active: {
    backgroundColor: colors.main_color,
    color: colors.white,
  },
  select_item_cancel: {
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(GoodsMangerScene)
