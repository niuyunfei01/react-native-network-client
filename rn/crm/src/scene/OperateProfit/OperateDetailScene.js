import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
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
import {Toast, Dialog, Icon, Button,Input} from "../../weui/index";
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

  toOperateDetail(url,params={}) {
    this.props.navigation.navigate(url,params)
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <Header text={'今日运营收益'} money={56.66}/>
          <ScrollView>
            <View style={content.in_box}>
              <CellsTitle title={'收入流水'} add={'添加收入项'}/>
              <CellAccess title={'订单收入'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {type:Cts.OPERATE_ORDER_IN})
                          }
              />
              <CellAccess title={'其他收入'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {type: Cts.OPERATE_OTHER_IN})
                          }
              />
            </View>

            <View style={content.in_box}>
              <CellsTitle title={'支出流水'} add={''}/>
              <CellAccess title={'用户退款金额(3单)'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_EXPEND_DETAIL, {type: Cts.OPERATE_REFUND_OUT})
                          }
              />
              <CellAccess title={'配送小费(2单)'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_EXPEND_DETAIL, {type: Cts.OPERATE_DISTRIBUTION_TIPS})
                          }
              />

              <CellAccess title={'保底结算'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_SETTLEMENT)}
              />
              <CellAccess title={'呼叫配送费(69单)'} money={'1233.32'}/>
              <CellAccess title={'CRM平台服务费'} money={'1233.32'}/>
              <CellAccess title={'外卖平台服务费'} money={'1233.32'}/>
              <CellsTitle title={'其他支出流水'} add={'添加支出项'}/>
              <CellAccess title={'物料费'} money={'1233.32'}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL,{type:Cts.OPERATE_OTHER_OUT})}
              />
              <CellCancel/>
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
    this.state = {
      dlgShipVisible: false
    }
  }

  render() {
    let {title, add} = this.props;
    return (
        <View style={content.item}>
          <Text style={content.left}>{title}</Text>
          <TouchableOpacity
              onPress={() => {
                this.setState({dlgShipVisible: true})
              }}
          >
            <Text style={content.right}>{add}</Text>
          </TouchableOpacity>
          <Dialog onRequestClose={() => {

          }}
                  visible={this.state.dlgShipVisible}
                  title={'添加其他收入'}
                  titleStyle={{textAlign:'center',color:colors.white}}
                  headerStyle={{backgroundColor:colors.main_color,paddingTop:pxToDp(20),justifyContent:'center',paddingBottom:pxToDp(20)}}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.setState({dlgShipVisible:false});
                    }
                  },{
                    type: 'primary',
                    label: '保存',
                    onPress: () => {
                      this.setState({dlgShipVisible:false});
                    }
                  }]}

          >
            <ScrollView style = {{height:pxToDp(500)}}>
            <Text >项目(不超过15个汉字)</Text>
            <Input
                underlineColorAndroid='transparent'
                style={{borderWidth:pxToDp(1),borderColor:colors.fontGray,borderRadius:pxToDp(10)}}
                maxLength ={15}
            />
            <Text >金额(无)</Text>
            <Input
                underlineColorAndroid='transparent'
                style={{borderWidth:pxToDp(1),borderColor:colors.fontGray,borderRadius:pxToDp(10)}}
                keyboardType = {"numeric"}
            />
            <Text >备注说明</Text>
              <Input
                  underlineColorAndroid='transparent'
                  style={{borderWidth: pxToDp(1), borderColor: colors.fontGray, borderRadius: pxToDp(10),height:pxToDp(150),marginBottom:pxToDp(150)}}
                  multiline={true}
              />
          </ScrollView>
          </Dialog>
        </View>
    )
  }
}

class CellAccess extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    let {title, money} = this.props;
    return (
        <TouchableOpacity
            onPress={() => {
              if(this.props.toOperateDetail){
                this.props.toOperateDetail()
              }else {
                return false
              }
            }}
        >
          <View style={content.item}>
            <Text style={content.text}>{title}</Text>
            <View style={content.item_img}>
              <Text style={content.money}>{money}</Text>
              {
                this.props.toOperateDetail ? <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                /> :<View style = {{width:pxToDp(50)}} />
              }
            </View>
          </View>
        </TouchableOpacity>
    )
  }
}

class CellCancel extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    return (
        <View style={[content.item, {position: 'relative'}]}>
          <Text>支出流水项目名称</Text>
          <Text>103.99</Text>
          <View style={{
            position: 'absolute',
            borderTopWidth: pxToDp(1),
            borderTopColor: '#eee7e8',
            height: pxToDp(2),
            width: '100%'
          }}/>
        </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OperateDetailScene)
