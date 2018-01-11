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


class GoodsPriceDetails extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '价格管理',
    };
  };

  constructor(props) {
    super(props)
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
            <Cell customStyle={content.store} style={{borderTopWidth: 0}} first={true}>
              <CellHeader style={content.cell_header}>
                <Text style={content.store_name}>回龙观</Text>
                <Text style={content.store_type}>代运营店铺</Text>
              </CellHeader>
            </Cell>
            <Text>0000</Text>
          </ScrollView>
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
    borderTopWidth: pxToDp(0),
    marginLeft: 0,
    alignItems:'center',
    height:pxToDp(100),
    backgroundColor:'#fff'
  },
  cell_header: {
    flexDirection: 'row',
    paddingHorizontal:pxToDp(30),
    alignItems:'center',
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
    borderWidth:pxToDp(1),
    marginLeft:pxToDp(20),
    fontSize:pxToDp(24),
    textAlignVertical:'center'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsPriceDetails)
