import React, {PureComponent} from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import {Button, Dialog} from "../../weui/index";
import pxToDp from "../../util/pxToDp";
import {native, tool} from "../../common"
import PropTypes from 'prop-types'
import {ToastShort} from "../../util/ToastUtils";
import Cts from "../../Cts";
import Config from "../../config";
import styles from './OrderStyles'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {orderSetArrived} from '../../reducers/order/orderActions'
import Toast from "../../weui/Toast/Toast";

const numeral = require('numeral');


function mapStateToProps(state) {
  return {
    global: state.global,
    store: state.store,
  };
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderSetArrived}, dispatch)}
}

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

    this._viewShipDetail = this._viewShipDetail.bind(this);
    this._cancelShip = this._cancelShip.bind(this);

    this._defCloseBtn = this._defCloseBtn.bind(this);
  }

  _viewShipDetail = () => {
    const {navigation, order} = this.props;
    this.setState({dlgShipVisible: false});
    navigation.navigate(Config.ROUTE_ORDER_SHIP_DETAIL, {order});
  };

  _cancelShip = () => {
    const {navigation, order} = this.props;
    this.setState({dlgShipVisible: false});
    navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP, {order});
  };

  _setOrderArrived = () => {
    const {dispatch, order, global} = this.props;

    this.setState({onSubmitting: true, dlgShipVisible: false});
    dispatch(orderSetArrived(global.accessToken, order.id, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      if (ok) {
        this.setState({doneSubmitting: true});
        setTimeout(() => {
          this.setState({doneSubmitting: false});
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }  
    }))
  };

  _doDial() {
    const {mobile} = this.props;
    if (mobile) {
      native.dialNumber(mobile);
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

      let title, msg, buttons, leftButtons;
      if (dada_status === Cts.DADA_STATUS_TO_ACCEPT) {
        title = '自动待接单';
        const timeDesc = tool.shortTimeDesc(dada_call_at);
        const shipDetail = (dada_distance || dada_fee) ? `(${dada_distance}米${dada_fee}元)` : '';
        msg = `${timeDesc}已发单${shipDetail}到${auto_plat}, 等待接单中...`;
        buttons = [
          {
            label: '撤回呼叫',
            onPress: this._cancelShip
          },
          this._defCloseBtn('继续等待'),
          {
            label: '查看详细',
            onPress: this._viewShipDetail
          },
        ];

      } else if (dada_status === Cts.DADA_STATUS_TO_FETCH) {
        title = "自动待取货";
        msg = `${auto_plat} ${dada_dm_name} (${dada_mobile}) 已接单，如强制取消扣2元费用`;
        buttons = [
          {
            label: '强行撤单',
            onPress: this._cancelShip,
          },
          {
            label: '呼叫配送员',
            onPress: () => {
              native.dialNumber(dada_mobile);
              this.setState({dlgShipVisible: false});
            }
          },
          this._defCloseBtn(),
        ];
      } else if (dada_status === Cts.DADA_STATUS_CANCEL || dada_status === Cts.DADA_STATUS_TIMEOUT) {
        title = "通过系统呼叫配送";
        msg = "订单已" + (dada_status === Cts.DADA_STATUS_TIMEOUT ? "超时" : "取消") + "，重新发单？";
        buttons = [
          {
            label: '重新发单',
            onPress: () => {
              this._callShipDlg();
              this.setState({dlgShipVisible: false});
            },
          },
          this._defCloseBtn(),
        ];

      } else if (dada_status === Cts.DADA_STATUS_SHIPPING || dada_status === Cts.DADA_STATUS_ARRIVED) {
        title = "配送在途";
        msg = `${auto_plat} ${dada_dm_name} (${dada_mobile}) ` + (dada_status === Cts.DADA_STATUS_SHIPPING ? "配送中" : "已送达");
        buttons = [
          {
            label: '查看详细',
            onPress: this._viewShipDetail
          },
          {
            label: '呼叫配送员',
            onPress: () => {
              native.dialNumber(dada_mobile);
              this.setState({dlgShipVisible: false});
            },
          },
          this._defCloseBtn(),
        ];
      }
      this.setState({
        dlgShipTitle: title,
        dlgShipButtons: buttons,
        left_buttons: leftButtons,
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

  _actionBtnVisible() {
    const order = this.props.order;
    const iStatus = parseInt(order.orderStatus);
    return iStatus !== Cts.ORDER_STATUS_ARRIVED && iStatus !== Cts.ORDER_STATUS_INVALID;
  }

  _onActionBtnClicked() {
    const order = this.props.order;
    const iStatus = parseInt(order.orderStatus);
    const {navigation, global} = this.props;

    if (iStatus === Cts.ORDER_STATUS_SHIPPING) {
      const title = '提醒用户已送达';
      this.setState({
        dlgShipTitle: title,
        dlgShipButtons: [{
          label: '发送提醒',
          onPress: this._setOrderArrived
        }],
        left_buttons: [this._defCloseBtn()],
        dlgShipContent: '请注意，此操作将会通知用户订单已经送达，如客户未收到，会招致投诉',
        dlgShipVisible: true,
      });
    } else if (iStatus === Cts.ORDER_STATUS_TO_READY) {
      navigation.navigate(Config.ROUTE_ORDER_PACK, {order});
    } else if (iStatus === Cts.ORDER_STATUS_TO_SHIP) {
      navigation.navigate(Config.ROUTE_ORDER_START_SHIP, {order: order});
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
              left_buttons={this.state.left_buttons}
              title={this.state.dlgShipTitle}
      ><Text>{this.state.dlgShipContent}</Text>
      </Dialog>
      <Toast show={this.state.onSubmitting}>提交中</Toast>
      <Toast icon="success" show={this.state.doneSubmitting}>保存成功</Toast>
      <Dialog onRequestClose={() => {}}
              visible={!!this.state.errorHints}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {
                  this.setState({errorHints: ''});
                }
              }]}
      ><Text>{this.state.errorHints}</Text></Dialog>

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

export default connect(mapStateToProps, mapDispatchToProps)(OrderBottom)