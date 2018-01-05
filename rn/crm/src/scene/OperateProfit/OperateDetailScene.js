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
import Header from './OperateHeader';

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

class OperateDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '运营细节',
    };
  };

  constructor(props) {
    super(props);
    // let {currVendorId} = tool.vendor(this.props.global);
    // let currStoreId = this.props.navigation.state.params.store_id

  }

  render() {
    return (
        <View style={{flex: 1}}>
          <Header text={'今日运营收益'} money={56.66}/>
          <ScrollView>
            <View style={content.in_box}>
              <CellsTitle title={'收入流水'} add={'添加输入项'}/>

              <View style={content.item}>

                <Text style={content.text}>订单收入</Text>
                <View style={content.item_img}>
                  <Text style={content.money}>1235.55</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </View>
              </View>
              <View style={content.item}>
                <Text style={content.text}>其他收入</Text>
                <Text style={content.money}>3222.33</Text>
              </View>
            </View>

            <View style={content.in_box}>
              <View style={content.item}>
                <View>
                  <Text style={content.left}>支出流水</Text>
                </View>
                <Text style={content.right}></Text>
              </View>
              <View style={content.item}>
                <View style={content.item_img}>
                  <Text style={content.text}>用户退款金额(3单)</Text>

                </View>
                <Text style={content.money}>1235.55</Text>
              </View>
              <View style={content.item}>
                <View style={content.item_img}>
                  <Text style={content.text}>配送小费(2单)</Text>

                </View>
                <Text style={content.money}>3222.33</Text>
              </View>
              <View style={content.item}>
                <Text style={content.text}>呼单配送费(69单)</Text>
                <Text style={content.money}>3222.33</Text>
              </View>
              <View style={content.item}>

                <Text style={content.text}>保底计算</Text>

                <Text style={content.money}>3222.33</Text>
              </View>
              <View style={content.item}>

                <Text style={content.text}>CRM平台服务费</Text>

                <Text style={content.money}>3222.33</Text>
              </View>

              <View style={content.item}>

                <Text style={content.text}>外卖平台服务费</Text>

                <Text style={content.money}>3222.33</Text>
              </View>
              <View style={[content.in_box, {marginTop: 0, borderTopWidth: pxToDp(1)}]}>
                <View style={content.item}>
                  <View style={content.item_img}>
                    <Text style={content.left}>其他支出流水</Text>

                  </View>
                  <Text style={content.right}>添加支出项</Text>
                </View>
                <View style={content.item}>

                  <Text style={content.text}>物料费</Text>

                  <Text style={content.money}>103.39</Text>
                </View>
                <View style={[content.item, content.cancel_item]}>
                  <Text>报废</Text>
                  <Text>103.39</Text>
                  <View style={content.cancel}/>
                </View>
              </View>
            </View>

            <Button
                type={'primary'}
                style={{marginTop: pxToDp(80), marginHorizontal: pxToDp(30), marginBottom: pxToDp(30)}}
            >
              给用户结款</Button>
          </ScrollView>
        </View>
    )
  }
}


const content = StyleSheet.create({
  in_box: {
    backgroundColor: colors.white,
    marginTop: pxToDp(30),
    paddingHorizontal: pxToDp(30),
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
    alignItems: 'center',
    height: pxToDp(90),
  },
  left: {
    fontSize: pxToDp(30),
    fontWeight: '900',
    color: colors.title_color

  },
  right: {
    fontSize: pxToDp(30),
    fontWeight: '900',
    color: colors.main_color,
  },
  text: {
    fontSize: pxToDp(30),
    color: colors.title_color
  },
  money: {
    fontSize: pxToDp(36),
    color: colors.title_color
  },
  cancel_item: {
    position: 'relative'
  },
  cancel: {
    position: 'absolute',
    borderTopWidth: pxToDp(1),
    width: '100%',
    left: pxToDp(30),
    top: '50%'

  },
  img: {
    height: pxToDp(36),
    width: pxToDp(36),
    marginLeft: pxToDp(10)
  },
  item_img: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

class CellsTitle extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    let {title,add} = this.props;
    return (
        <View style={content.item}>
          <Text style={content.left}>{title}</Text>
          <Text style={content.right}>{add}</Text>
        </View>
    )
  }
}
class CellsTitle extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    let {title,add} = this.props;
    return (
        <View style={content.item}>
          <Text style={content.left}>{title}</Text>
          <Text style={content.right}>{add}</Text>
        </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OperateDetailScene)
