import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {native, tool} from '../../common'
import {bindActionCreators} from "redux";
import Icons from 'react-native-vector-icons/FontAwesome';
import {orderAuditRefund} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader, Cells, TextArea, Toast} from "../../weui/index";
import MyBtn from '../../common/MyBtn'
import CellFooter from "../../weui/Cell/CellFooter";
import {ToastLong} from "../../util/ToastUtils";
import Cts from '../../Cts'

const numeral = require('numeral');

const reasons = {
  custom_talked_ok: '已与用户协商一致',
  custom: '自定义回复'
};


function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderAuditRefund}, dispatch)}
}

class AuditRefundScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: '退单详情',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      order: {},
      remind: {},
      refund_yuan: '',
      selected_action: '',
      reason_key: '',
      custom: '',
      chevron: true,
      tabNum: 0,
      reason: '已与用户协商一致',
      onSubmitting: false,
    };
    this.renderReason = this.renderReason.bind(this)
  }

  componentWillMount() {
    let {remind, order} = this.props.navigation.state.params;
    this.setState({
      order: order,
      remind: remind,
    })
  }

  tplAction(reason, agreeOrRefuse) {
    const {remind} = (this.props.navigation.state.params || {});
    const {dispatch, global} = this.props;
    dispatch(orderAuditRefund(global.accessToken, remind.order_id, remind.id, agreeOrRefuse, reason,
      0, (ok, msg, data) => {
        if (ok) {
          ToastLong('发送成功,即将返回上一页');
          this.setState({onSubmitting: false});
          setTimeout(() => {
            this.props.navigation.goBack()
          }, 1000)
        } else {
          this.setState({onSubmitting: false, errorHints: msg ? msg : '保存失败'});
        }
      }));
  }

  renderPartRefundGood(goodList) {
    let items = [];
    goodList.forEach(function (item) {
      items.push(<Text style={[styles.text,]}>商品: {item.name} 价格: ￥{item.price}</Text>);
    });
    return items;
  }

  renderReason() {
    let {tabNum} = this.state;
    if (tabNum === 1) {
      return (
        <View style={styles.bottom_box}>
          <View style={{marginVertical: pxToDp(40)}}>
            <Text style={[styles.bottom_box_text, {color: colors.editStatusAdd}]}>
              同意退款后,货款立即原路退回，无法追回</Text>
          </View>
          <MyBtn
            text={'同意退款'}
            onPress={async () => {
              let {onSubmitting} = this.state;
              if (onSubmitting) {
                return false
              }
              await this.setState({onSubmitting: true});
              this.tplAction(reasons.custom_talked_ok, Cts.REFUND_AUDIT_AGREE)
            }}
            style={styles.handle}/>
        </View>
      )
    } else if (tabNum === 2) {
      return (
        <View style={styles.bottom_box}>
            <TextArea
              maxLength={20}
              value={this.state.reason}
              onChangeText={(text) => {
                this.setState({reason: text})
              }}
              underlineColorAndroid='transparent'
              placeholder='一定要输入理由'
              placeholderTextColor="#ccc"
              style={{
                borderWidth: pxToDp(1),
                marginTop: pxToDp(30),
                borderColor: '#ccc',

              }}
            />
          <MyBtn
            text={'已与用户沟通,拒绝退款'}
            onPress={async () => {
              let {onSubmitting, reason} = this.state;
              if (onSubmitting || (tool.length(reason) <= 0)) {
                ToastLong('一定要输入理由');
                return false
              }
              await this.setState({onSubmitting: true})
              this.tplAction(reason, Cts.REFUND_AUDIT_REFUSE)
            }}
            style={[styles.handle, {color: colors.white, backgroundColor: colors.editStatusAdd}]}/>
        </View>
      )
    }

  }

  render() {
    let {
      id,
      dayId,
      store_name,
      platform,
      platform_oid,
      ship_worker_mobile,
      ship_worker_name,
      expectTime,
      orderTime,
    } = this.state.order;
    let {remind_id, refund_type} = this.state.remind;
    try {
      remind_id = JSON.parse(remind_id)
    } catch (e) {
      remind_id = {};
    }
    return (
      <ScrollView style={{flex: 1}}>
        <Cells style={{borderWidth: 0, marginLeft: 0, borderTopWidth: 0, marginTop: pxToDp(5), borderBottomWidth: 0}}>
          <Cell customStyle={styles.my_cell}>
            <CellHeader>
              <Text style={styles.shop_name}>{id}#{dayId}</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={styles.shop_name}>{store_name}</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.my_cell, {height: pxToDp(120)}]}>
            <CellHeader>
              <Text style={styles.text}>订单号:{id}</Text>
              <Text style={styles.text}>{tool.ship_name(platform)}#{platform_oid}</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <View>
                <Text style={styles.text}>期望送达: {
                  tool.orderExpectTime(expectTime)
                }</Text>
                <Text style={styles.text}>下单时间: {
                  tool.orderExpectTime(orderTime)
                }</Text>
              </View>
            </CellFooter>
          </Cell>
          {
            ship_worker_mobile ? <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={{height: pxToDp(120), justifyContent: 'center'}}>
                <Text style={[styles.text, {fontWeight: '600'}]}>{ship_worker_name}</Text>
                <Text style={styles.text}>{ship_worker_mobile}</Text>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <MyBtn
                  text={'呼叫'}
                  style={styles.btn}
                  onPress={() => {
                    native.dialNumber(ship_worker_mobile);
                  }}
                />
              </CellFooter>
            </Cell> : null
          }
          <Cell customStyle={styles.my_cell}>
            <CellHeader>
              <Text>商品/金额明细</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <TouchableOpacity
                style={{paddingLeft: pxToDp(20), paddingHorizontal: pxToDp(10)}}
                onPress={() => {
                  this.setState((prevState) => {
                    return {chevron: !prevState.chevron}
                  });
                }}
              >
                <Icons name={this.state.chevron ? 'chevron-up' : 'chevron-down'}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          {
            this.state.chevron ?
              <Cell customStyle={[styles.my_cell]}>
                <CellHeader style={{marginVertical: pxToDp(15)}}>
                  <Text style={{color: colors.editStatusAdd}}>
                    {refund_type == 0 ? '用户全额退款' : '用户部分退款'}
                  </Text>
                  {remind_id.hasOwnProperty("total_refund_price") &&
                  <Text style={[styles.text,]}>退款金额 : ￥ {remind_id['total_refund_price']}</Text>}
                  {remind_id.hasOwnProperty("good_list") && this.renderPartRefundGood(remind_id['good_list'])}
                  <Text style={[styles.text,]}>退款理由 : {remind_id.hasOwnProperty("reason") ? remind_id.reason : ""}</Text>
                </CellHeader>
              </Cell> : null
          }
          <Cell customStyle={[styles.my_cell, {height: pxToDp(120)}]}>
            <CellHeader>
              <Text>长时间不处理,系统将自动退款</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.my_cell, {height: pxToDp(120)}]}>
            <CellHeader>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <MyBtn style={
                this.state.tabNum === 2
                  ? [styles.btn, styles.btn_red, {
                    backgroundColor: '#f40',
                    color: colors.white
                  }] : [styles.btn, styles.btn_red]
              }
                     text={'拒绝'}
                     onPress={() => {
                       this.setState({tabNum: 2});
                     }}
              />
              <MyBtn
                style={
                  this.state.tabNum === 1 ?
                    [styles.btn, styles.btn_green, {marginLeft: pxToDp(20)}]
                    : [styles.btn, {marginLeft: pxToDp(20)}]
                }
                onPress={() => {
                  this.setState({tabNum: 1});
                }}
                text={'同意'}/>
            </CellFooter>
          </Cell>
        </Cells>
        {
          this.renderReason()
        }
        <Toast
          onRequestClose={() => {
          }}
          show={this.state.show}
        />
        <Toast
          icon="loading"
          show={this.state.onSubmitting}
          onRequestClose={() => {
          }}
        >提交中</Toast>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  my_cell: {
    marginLeft: pxToDp(30),
    marginRight: pxToDp(30),
    paddingRight: 0,
    minHeight: pxToDp(90),
    flexDirection: "row",
    borderColor: colors.fontGray,
    alignItems: "center",
  },
  shop_name: {
    fontSize: pxToDp(32),
    color: colors.fontBlack,
  },
  text: {
    fontSize: pxToDp(26),
    color: colors.fontGray,
    height: pxToDp(50),
    textAlignVertical: 'center',
  },
  btn: {
    paddingHorizontal: pxToDp(30),
    borderWidth: 0.7,
    borderColor: colors.main_color,
    color: colors.main_color,
    borderRadius: pxToDp(5),
    paddingVertical: pxToDp(8)
  },
  bottom: {
    marginBottom: pxToDp(10)
  },
  btn_red: {
    color: colors.editStatusAdd,
    borderColor: colors.editStatusAdd
  },
  agree: {
    marginTop: pxToDp(30),
    fontSize: pxToDp(30),
    lineHeight: pxToDp(50),
    textAlignVertical: 'center'
  },
  bottom_box: {
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    paddingBottom: pxToDp(50),
    marginTop: pxToDp(10),
    justifyContent: 'center'
  },
  bottom_box_text: {
    lineHeight: pxToDp(40)
  },
  btn_green: {
    color: colors.white,
    backgroundColor: colors.main_color
  },
  handle: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: colors.main_color,
    height: pxToDp(90),
    color: colors.white,
    textAlignVertical: "center",
    borderRadius: pxToDp(8),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AuditRefundScene)