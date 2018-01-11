import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
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

class GoodsSelect extends PureComponent {
  constructor() {
    super()
  }

  render() {
    let {name} = this.props;
    return (
        <View style={{flex: 1,position:'relative'}}>
          <View style={select.wrapper}>
            <ImageBtn name='美团外卖'/>
            <ImageBtn name='菜鸟食材'/>
            <ImageBtn name='销量降序'/>
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
    let {name} = this.props;
    return (
          <View style={select.item}>
            <Text style={select.item_text}>{name}</Text>
            <Image source={require('../../img/Public/xiangxialv_.png')} style = {{width:pxToDp(28),height:pxToDp(18),marginLeft:pxToDp(10)}} />
          </View>
    )
  }
}

const select = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    position: 'absolute',
    width:'100%',
    minHeight:pxToDp(100)

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
  items_wrapper:{
    width:'100%',
    position:'absolute',
    top:pxToDp(100),
    backgroundColor:'rgba(0,0,0,.4)',
    height:'100%'
  },
  items_box:{
    minHeight:pxToDp(150),
    backgroundColor:"#fff",
    paddingHorizontal:pxToDp(45),
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'space-between'
  },
  select_item:{
    width:pxToDp(172),
    marginTop:pxToDp(50),
    height:pxToDp(55),
    textAlign:'center',
    borderRadius:pxToDp(25),
    textAlignVertical:'center',
    fontSize:pxToDp(28)
  },
  select_item_active:{
    backgroundColor:colors.main_color,
  }
});
export default GoodsSelect