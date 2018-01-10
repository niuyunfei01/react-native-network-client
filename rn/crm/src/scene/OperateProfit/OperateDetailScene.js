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
import tool, {toFixed} from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button, Input} from "../../weui/index";
import {fetchProfitDaily, fetchProfitHome} from '../../reducers/operateProfit/operateProfitActions'

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
    this.state = {
      sum: 0,
      editable: false,
      check_detail: false,
      income: {[Cts.OPERATE_ORDER_IN]:{num:0},[Cts.OPERATE_OTHER_IN]:{num:0}},
      outcome_normal: {
        [Cts.OPERATE_REFUND_OUT]:{num:0,order_num:0},
        [Cts.OPERATE_DISTRIBUTION_TIPS]:{num:0,order_num:0},
        [Cts.OPERATE_DISTRIBUTION_FEE]:{num:0,order_num:0},
        [Cts.OPERATE_OUT_BASIC]:{num:0},
        [Cts.OPERATE_OUT_BLX]:{num:0},
        [Cts.OPERATE_OUT_PLAT_FEE]:{num:0},
      },
      outcome_other:[],
      query:true
    }
  }

  toOperateDetail(url, params = {}) {
    params.day = this.props.navigation.state.params.day;
    // if(this.state.check_detail){
      this.props.navigation.navigate(url, params)
    // }else {
    //   ToastLong('您没有权限!')
    // }
  }

  getProfitDaily() {
    let {currStoreId, accessToken} = this.props.global;
    let {day} = this.props.navigation.state.params;
    const {dispatch} = this.props;
    dispatch(fetchProfitDaily(currStoreId, day, accessToken, async (ok, obj, desc) => {
      let {sum, editable, check_detail, income, outcome_normal, outcome_other} = obj;
      if (ok) {
        this.setState({
          sum,
          editable,
          check_detail,
          income,
          outcome_normal,
          outcome_other
        })
      }
      this.setState({query: false,})
    }));
  }
  componentWillMount() {
    this.getProfitDaily();
  }
  renderOtherOut() {
  return  this.state.outcome_other.map((item, index) => {
      if (!(item.valid === false)) {
        return (
            <CellAccess key = {index} title={item.label} money={item.num}
                        toOperateDetail={() =>
                            this.toOperateDetail(Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL,
                                {editable:this.state.editable,
                                  id:item.id,
                                })}
            />
        )
      } else {
        return (
            <CellCancel key = {index} title={item.label} money={item.num}
                        toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL)}
            />
        )
      }
    })
  }
  renderOutNormal() {
    let _this = this;
    let {outcome_normal} = this.state;
    return (
        <View style={content.in_box}>
          <CellsTitle title={'支出流水'} add={''}/>
          <CellAccess title={`用户退款金额(${outcome_normal[Cts.OPERATE_REFUND_OUT]['order_num']})单`} money={outcome_normal[Cts.OPERATE_REFUND_OUT]['num']}
                      toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_EXPEND_DETAIL,{type: Cts.OPERATE_REFUND_OUT})}
          />
          <CellAccess title={`配送小费(${outcome_normal[Cts.OPERATE_DISTRIBUTION_TIPS]['order_num']}单)`} money={outcome_normal[Cts.OPERATE_DISTRIBUTION_TIPS]['num']}
                      toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_EXPEND_DETAIL, {type: Cts.OPERATE_DISTRIBUTION_TIPS})}
          />
          <CellAccess title={'保底结算'} money={outcome_normal[Cts.OPERATE_OUT_BASIC]['num']} toOperateDetail={() => this.toOperateDetail(Config.ROUTE_SETTLEMENT)}
          />
          <CellAccess title={`呼叫配送费(${outcome_normal[Cts.OPERATE_DISTRIBUTION_FEE]['order_num']}单)`} money={outcome_normal[Cts.OPERATE_DISTRIBUTION_FEE]['num']}/>
          <CellAccess title={'CRM平台服务费'} money={outcome_normal[Cts.OPERATE_OUT_BLX]['num']}/>
          <CellAccess title={'外卖平台服务费'} money={outcome_normal[Cts.OPERATE_OUT_PLAT_FEE]['num']}/>
          <CellsTitle title={'其他支出流水'} add={'添加支出项'}/>
          {
            _this.renderOtherOut()
          }
        </View>
    )
  }
  render() {
    let {sum, income,editable} = this.state;
    return (
        <View style={{flex: 1}}>
          <Header text={'今日运营收益'} money={toFixed(sum)}/>
          <ScrollView style = {{paddingBottom:pxToDp(50)}}>
            <View style={content.in_box}>
              <CellsTitle title={'收入流水'} add={'添加收入项'}/>
              <CellAccess title={'订单收入'} money={income[Cts.OPERATE_ORDER_IN].num}
                          toOperateDetail={() =>
                              this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {
                                type: Cts.OPERATE_ORDER_IN,
                                order_money: income[Cts.OPERATE_ORDER_IN].num,
                                other_money: income[Cts.OPERATE_OTHER_IN].num,
                              })}
              />
              <CellAccess title={'其他收入'} money={income[Cts.OPERATE_OTHER_IN].num}
                          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {type: Cts.OPERATE_OTHER_IN})}
              />
            </View>
            {
              this.renderOutNormal()
            }
            {
              editable ? <Button
                  type={'primary'}
                  style={{marginTop: pxToDp(80), marginHorizontal: pxToDp(30), marginBottom: pxToDp(30)}}
                  onPress={() => {
                    if (editable) {

                    } else {
                      ToastLong('您没有权限');
                      return false;
                    }
                  }}
              >给用户结款</Button> : null
            }
          </ScrollView>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
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
    super(props);
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
                      this.setState({dlgShipVisible: false});
                    }
                  }, {
                    type: 'primary',
                    label: '保存',
                    onPress: () => {
                      this.setState({dlgShipVisible: false});
                    }
                  }]}

          >
            <ScrollView style={{height: pxToDp(500)}}>
              <Text>项目(不超过15个汉字)</Text>
              <Input
                  underlineColorAndroid='transparent'
                  style={{borderWidth: pxToDp(1), borderColor: colors.fontGray, borderRadius: pxToDp(10)}}
                  maxLength={15}
              />
              <Text>金额(无)</Text>
              <Input
                  underlineColorAndroid='transparent'
                  style={{borderWidth: pxToDp(1), borderColor: colors.fontGray, borderRadius: pxToDp(10)}}
                  keyboardType={"numeric"}
              />
              <Text>备注说明</Text>
              <Input
                  underlineColorAndroid='transparent'
                  style={{
                    borderWidth: pxToDp(1),
                    borderColor: colors.fontGray,
                    borderRadius: pxToDp(10),
                    height: pxToDp(150),
                    marginBottom: pxToDp(150)
                  }}
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
    let {title, money} = this.props || {};
    return (
        <TouchableOpacity
            onPress={() => {
              if (this.props.toOperateDetail) {
                this.props.toOperateDetail()
              } else {
                return false
              }
            }}
        >
          <View style={content.item}>
            <Text style={content.text}>{title}</Text>
            <View style={content.item_img}>
              <Text style={content.money}>{toFixed(money)}</Text>
              {
                this.props.toOperateDetail ? <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                /> : <View style={{width: pxToDp(50)}}/>
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
        <TouchableOpacity
            onPress={() => {
              if (this.props.toOperateDetail) {
                this.props.toOperateDetail()
              } else {
                return false
              }
            }}
        >
          <View style={[content.item, {position: 'relative'}]}>
            <Text>{this.props.title}</Text>
            <View style = {{flexDirection:'row',alignItems:'center'}}>
              <Text>{toFixed(this.props.money)}</Text>
              {
                this.props.toOperateDetail ? <Image
                    style={{alignItems: 'center', transform: [{scale: 0.4}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                /> : <View style={{width: pxToDp(50)}}/>
              }
            </View>
            <View style={{
              position: 'absolute',
              borderTopWidth: pxToDp(1),
              borderTopColor: '#eee7e8',
              height: pxToDp(2),
              width: '100%'
            }}/>

          </View>
        </TouchableOpacity>

    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OperateDetailScene)
