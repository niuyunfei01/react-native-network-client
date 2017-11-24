import React, {PureComponent} from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import CallImg from './CallImg'
import {Button, ActionSheet, ButtonArea, Toast, Msg, Dialog, Icon} from "../../weui/index";
import pxToDp from "../../util/pxToDp";
import {native, tool} from "../../common"
import PropTypes from 'prop-types'
import {ToastShort} from "../../util/ToastUtils";
import Cts from "../../Cts";
import Config from "../../config";
import styles from './OrderStyles'

const numeral = require('numeral');

class OrderBottom extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      dlgShipVisible: false,
      dlgShipButtons: [{
        type: 'default',
        label: '知道了',
        onPress: () => {
        }
      }],
      dlgShipContent:'',
    };

    this._doDial = this._doDial.bind(this);
    this._onToProvide = this._onToProvide.bind(this);
    this._visibleProviding = this._visibleProviding.bind(this);
    this._visibleShipInfoBtn = this._visibleShipInfoBtn.bind(this);

    this._callShipDlg = this._callShipDlg.bind(this);
    this._onShipInfoBtnClicked = this._onShipInfoBtnClicked.bind(this);
    this._shipInfoBtnText = this._shipInfoBtnText.bind(this);
    this._visibleShipInfoBtn = this._visibleShipInfoBtn.bind(this);

    this._actionBtnVisible = this._actionBtnVisible.bind(this);
    this._actionBtnText = this._actionBtnText.bind(this);
    this._onActionBtnClicked = this._onActionBtnClicked.bind(this);

    this._defCloseBtn = this._defCloseBtn.bind(this);
  }

  _doDial() {
    const {mobile} = this.props;
    if (mobile) {
      native.dialNumber(mobile)
    }
  }

  _callShipDlg() {
    const {callShip} = this.props;
    callShip();
  }
  
  _onToProvide() {
    const {onToProvide} = this.props;
    onToProvide();
  }

  _visibleProviding() {
    const {order, fnProvidingOnway} = this.props;
    const iStatus = parseInt(order.orderStatus);
    return (iStatus === Cts.ORDER_STATUS_TO_READY || iStatus === Cts.ORDER_STATUS_TO_SHIP) && fnProvidingOnway
  }

  _visibleShipInfoBtn () {
    let {dada_status, orderStatus, ship_worker_id, dada_distance, auto_plat, dada_fee, dada_dm_name, dada_mobile,
      dada_call_at} = this.props.order;
    dada_status = parseInt(dada_status);
    orderStatus = parseInt(orderStatus);

    return (orderStatus === Cts.ORDER_STATUS_SHIPPING && dada_status !== Cts.DADA_STATUS_NEVER_START)
      || (orderStatus === Cts.ORDER_STATUS_ARRIVED && ship_worker_id === Cts.ID_DADA_MANUAL_WORKER)
      || (orderStatus === Cts.ORDER_STATUS_TO_SHIP)
      || (orderStatus === Cts.ORDER_STATUS_TO_READY);
  }

  _defCloseBtn = (title) => {
    title = title || '关闭';

    return {
      type: 'default',
      label: title,
      onPress: () => { this.setState({dlgShipVisible: false}) }
    }};


  _onShipInfoBtnClicked () {
    let {dada_status, orderStatus, ship_worker_id, dada_distance, auto_plat, dada_fee, dada_dm_name, dada_mobile,
      dada_call_at} = this.props.order;
    dada_status = parseInt(dada_status);
    orderStatus = parseInt(orderStatus);
    ship_worker_id = parseInt(ship_worker_id);
    dada_fee = numeral('0.00').format(dada_fee);

    if (orderStatus === Cts.ORDER_STATUS_ARRIVED && ship_worker_id === Cts.ID_DADA_MANUAL_WORKER) {
      ToastShort("请使用老版本修改送达时间");
    } else if (dada_status === Cts.DADA_STATUS_NEVER_START) {
      this._callShipDlg();
    } else {

      let title, msg, buttons;
      if (dada_status === Cts.DADA_STATUS_TO_ACCEPT) {
        title = '自动待接单';
        const timeDesc = tool.shortTimeDesc(dada_call_at);
        const shipDetail = (dada_distance || dada_fee) ? `(${dada_distance}米${dada_fee}元)` : '';
        msg = `${timeDesc}已发单${shipDetail}到${auto_plat}, 等待接单中...`;
        buttons = [
          {
            type: 'default',
            label: '撤回呼叫',
            onPress: () => {
              // new DadaCancelClicked(false)
            }
          },
          this._defCloseBtn('继续等待'),
          {
            type: 'default',
            label: '刷新状态',
            onPress: () => {
              // new DadaQueryTask(orderId, helper).executeOnNormal();
            }
          },
        ];

      } else if (dada_status === Cts.DADA_STATUS_TO_FETCH) {
        title = "自动待取货";
        msg = `${auto_plat} ${dada_dm_name} (${dada_mobile}) 已接单，如强制取消扣2元费用`;
        buttons = [
          this._defCloseBtn(),
          {
            type: 'default',
            label: '强行撤单',
            onPress: () => {
              //new DadaCancelClicked(true)
            },
          },
          {
            type: 'default',
            label: '呼叫配送员',
            onPress: () => {
              native.dialNumber(dada_mobile);
            }
          },
        ];
      } else if (dada_status === Cts.DADA_STATUS_CANCEL || dada_status === Cts.DADA_STATUS_TIMEOUT) {
        title = "通过系统呼叫配送";
        msg = "订单已" + (dada_status === Cts.DADA_STATUS_TIMEOUT ? "超时" : "取消") + "，重新发单？";
        buttons = [{
          type: 'default',
          label: '重新发单',
          onPress: () => {
            this._callShipDlg();
          },
        },
          this._defCloseBtn(),
        ];

      } else if (dada_status === Cts.DADA_STATUS_SHIPPING || dada_status === Cts.DADA_STATUS_ARRIVED) {
        title = "配送在途";
        msg = `${auto_plat} ${dada_dm_name} (${dada_mobile}) ` + (dada_status === Cts.DADA_STATUS_SHIPPING ? "配送中" : "已送达");
        buttons = [
          {
            type: 'default',
            label: '呼叫配送员',
            onPress: () => {
              native.dialNumber(dada_mobile)
            },
          },
          {
            type: 'default',
            label: '刷新状态',
            onPress: () => {
              //new DadaQueryTask(orderId, helper).executeOnNormal();
            },
          },
          this._defCloseBtn(),
        ];
      }
      this.setState({
        dlgShipTitle: title,
        dlgShipButtons: buttons,
        dlgShipContent: msg,
        dlgShipVisible: true,
      });
    }
  }

  _shipInfoBtnText() {
    let label;
    let {dada_status, orderStatus, ship_worker_id} = this.props.order;
    dada_status = parseInt(dada_status);
    orderStatus = parseInt(orderStatus);
    ship_worker_id = parseInt(ship_worker_id);

    if (orderStatus === Cts.ORDER_STATUS_ARRIVED && ship_worker_id === Cts.ID_DADA_MANUAL_WORKER) {
      label = '修改到达时间';
    }  else {
      switch (dada_status) {
        case Cts.DADA_STATUS_TO_ACCEPT:
          label = "自动:待接单";
          break;
        case Cts.DADA_STATUS_NEVER_START:
          label = "待呼叫配送";
          break;
        case Cts.DADA_STATUS_SHIPPING:
          label = "自动:已在途";
          break;
        case Cts.DADA_STATUS_ARRIVED:
          label = "自动:已送达";
          break;
        case Cts.DADA_STATUS_CANCEL:
          label = "自动:已取消";
          break;
        case Cts.DADA_STATUS_TO_FETCH:
          label = "自动:已接单";
          break;
        case Cts.DADA_STATUS_ABNORMAL:
          label = "自动:配送异常";
          break;
        case Cts.DADA_STATUS_TIMEOUT:
          label = "自动:呼叫超时";
          break;
        default:
          label = dada_status;
      }
    }
    return label;
  }

  /*
  if (fromStatus == Cts.WM_ORDER_STATUS_TO_ARRIVE) {
  AlertDialog.Builder adb = new AlertDialog.Builder(v.getContext());
  adb.setTitle("送达提醒")
.setMessage(String.format("您的食材已由快递小哥【%s】送到，如有缺漏、品质或其他问题请立即联系店长【%s(%s)】。春风十里，不如赐个好评就送个金菠萝给你 :)", shipWorkerName, "青青", "18910275329"))
.setPositiveButton("发送", new DialogInterface.OnClickListener() {
  @Override
    public void onClick(DialogInterface dialog, int which) {
      new OrderActionOp(orderId, OrderSingleActivity.this, listType).executeOnNormal(fromStatus);
    }
  });
  adb.setNegativeButton(getString(R.string.cancel), null);
  adb.show();
} else {
}
*/

  _actionBtnVisible() {
    const order = this.props.order;
    const iStatus = parseInt(order.orderStatus);
    return iStatus !== Cts.ORDER_STATUS_ARRIVED && iStatus !== Cts.ORDER_STATUS_INVALID;
  }

  _onActionBtnClicked() {
    const order = this.props.order;
    const iStatus = parseInt(order.orderStatus);
    const {navigation} = this.props;

    if (iStatus === Cts.ORDER_STATUS_SHIPPING) {
      return "提醒送达";
    } else if (iStatus === Cts.ORDER_STATUS_TO_READY) {
      navigation.navigate(Config.ROUTE_ORDER_PACK, {order});
    } else if (iStatus === Cts.ORDER_STATUS_TO_SHIP) {
      navigation.navigate(Config.ROUTE_ORDER_START_SHIP, {order});
    }
  }

  _actionBtnText() {
    const order = this.props.order;
    const iStatus = parseInt(order.orderStatus);

    if (iStatus === Cts.ORDER_STATUS_SHIPPING) {
      return "提醒送达";
    } else if (iStatus === Cts.ORDER_STATUS_TO_READY) {
      return "打包完成";
    } else if (iStatus === Cts.ORDER_STATUS_TO_SHIP) {
      return "提醒出发";
    }

    return '';
  }

  render() {

    let {label, mobile, onPress, style} = this.props;
    label = label || mobile;

    return <View>
      <Dialog onRequestClose={() => {}}
              visible={this.state.dlgShipVisible}
              buttons={this.state.dlgShipButtons}
              title={this.state.dlgShipTitle}
      ><Text>{this.state.dlgShipContent}</Text>
      </Dialog>
      { (this._actionBtnVisible() || this._visibleProviding() || this._visibleShipInfoBtn()) &&
      <View style={{
        flexDirection: 'row', justifyContent: 'space-around',
        paddingTop: pxToDp(10),
        paddingRight: pxToDp(10),
        paddingLeft: pxToDp(10),
        paddingBottom: pxToDp(10),
        backgroundColor: '#fff',
        // marginLeft: pxToDp(20), marginRight: pxToDp(20),
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',

        shadowOffset: {width: -4, height: -4},
        shadowOpacity: 0.75,
        shadowRadius: 4,
        height: pxToDp(90),
      }}>
      {this._visibleProviding() && <Button style={[styles.bottomBtn, {marginLeft: pxToDp(5),}]} type={'default'}
                                           onPress={this._onToProvide}>备货</Button>}
      {this._actionBtnVisible() && <Button style={[styles.bottomBtn, {marginLeft: pxToDp(5),}]} type={'primary'}
                                           onPress={this._onActionBtnClicked}>{this._actionBtnText()}</Button>}
      {this._visibleShipInfoBtn() && <Button style={[styles.bottomBtn, {marginLeft: pxToDp(5),}]} type={'primary'}
                                             onPress={this._onShipInfoBtnClicked}>{this._shipInfoBtnText()}</Button>}
    </View>}
    </View>;
  }
}

OrderBottom.PropTypes = {
  mobile: PropTypes.string,
  label: PropTypes.string,
  onPress: PropTypes.func,
  style: View.propTypes.style,
};

export default OrderBottom