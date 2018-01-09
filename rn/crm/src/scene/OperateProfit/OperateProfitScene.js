import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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
import {uploadImg, newProductSave} from "../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      uploadImg,
      newProductSave,
      ...globalActions
    }, dispatch)
  }
}

class OperateProfitScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '运营收益',
    };
  };

  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let currStoreId = this.props.navigation.state.params.store_id

  }

  toOperateDetail() {
    this.props.navigation.navigate(Config.ROUTE_OPERATE_DETAIL)
  }

  render() {
    return (
        <View style={{flex: 1}}>

          <View style={header.wrapper}>
            <Text style={header.profit}>83.39</Text>
            <Text style={header.desc}>待结算运营收益额</Text>
          </View>
          <ScrollView>
            <View style={content.item_header}>
              <Text style={{color: '#b2b2b2'}}>2018年12月</Text>
            </View>
            <View>
              <Cells style={{marginTop: 0}}>
                <Cell access
                      style={content.cell}
                      onPress={() => {
                        this.toOperateDetail()
                      }}
                >
                  <CellHeader style={content.header}>
                    <Text style={content.date}> 2017-12-12</Text>
                    <Text style={content.payment}>结款 -1700.00</Text>
                  </CellHeader>
                  <CellBody style={{marginLeft: pxToDp(10)}}>

                    <Text style={[content.text_right, content.take_in]}>+86.00</Text>
                  </CellBody>
                  <CellFooter style={[content.text_right, content.foot, content.date]}>
                    10000.00
                  </CellFooter>
                </Cell>
              </Cells>
            </View>
          </ScrollView>
        </View>
    )
  }
}

const header = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    height: pxToDp(290),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: pxToDp(1),
    borderColor: colors.fontGray
  },
  profit: {
    fontSize: pxToDp(72),
    color: colors.main_color,
  },
  desc: {
    fontSize: pxToDp(24),
    color: "#3e3e3e",
    marginTop: pxToDp(50)
  }
});
const content = StyleSheet.create({
  item_header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(60),
    paddingHorizontal: pxToDp(30)
  },
  item_time: {
    fontSize: pxToDp(28),
    color: colors.fontColor
  },
  cell: {
    height: pxToDp(125),
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    minWidth: pxToDp(150),
  },
  body: {
    width: pxToDp(175),
    alignItems: 'flex-end',
  },
  text_right: {
    textAlign: 'right'
  },
  foot: {
    width: pxToDp(150)
  },
  date: {
    color: colors.fontBlack
  },
  payment: {
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(30),
    borderColor: '#fe0000',
    color: '#fe0000',
    fontSize: pxToDp(24),
    textAlign: 'center',
    lineHeight: pxToDp(30),
    paddingHorizontal:pxToDp(10),
    paddingVertical:pxToDp(5),
    marginTop:pxToDp(2)
  },
  expend: {
    color: '#fe0000'
  },
  take_in: {
    color: colors.main_color
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(OperateProfitScene)
