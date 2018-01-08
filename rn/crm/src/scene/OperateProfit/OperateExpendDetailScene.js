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

class OperateExpendScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    let {type} = navigation.state.params;
    console.log(type);
    return {
      headerTitle: tool.getOperateDetailsType(type),
  }
    ;
  };
  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let currStoreId = this.props.navigation.state.params.store_id

  }
renderList(){
    return(
        <Cells style={{marginTop: 0}}>
          <Cell access
                style={content.cell}
                onPress={() => {

                }}
          >
            <CellHeader style={content.header}>
              <Text style = {content.order_num}>#93(美团)</Text>
              <Text style = {content.classify}>退款金额(部分退款)</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter >
              <View>
                <Text style = {content.date}>2018-01-10</Text>
                <Text style = {content.money}>10.00</Text>
              </View>
            </CellFooter>
          </Cell>
        </Cells>
    )
}
  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {
              this.renderList()
            }

          </ScrollView>
        </View>
    )
  }
}

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
    height: pxToDp(150),
    alignItems: 'center',
    justifyContent: 'center'
  },

  date: {
    fontSize:pxToDp(30),
    color:'#9d9c9c',
    height:pxToDp(50),

  },
  order_num:{
    fontSize:pxToDp(36),
    color:colors.main_color,
    height:pxToDp(50)
},
  classify:{
    fontSize:pxToDp(30),
    color:colors.color3334,
    marginTop:pxToDp(20),
},
  money:{
    fontSize:pxToDp(36),
    color:'#3e3e3e',
    marginTop:pxToDp(20),
    textAlign:'right'
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(OperateExpendScene)
