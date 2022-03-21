import React, {PureComponent} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {tool} from '../../common'
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp"
import CallBtn from './CallBtn'
import colors from "../../styles/colors";
import Cts from '../../Cts'
import Styles from '../../common/CommonStyles'
import dayjs from "dayjs";


class OrderStatusCell extends PureComponent {

  constructor(props) {
    super(props)
    this._callShip = this._callShip.bind(this);
  }

  _validStepColor(datetimeStr, orderStatus, shouldStatus) {
    //return datetimeStr && dayjs(datetimeStr).unix() > dayjs('2010-01-01').unix() ? colors.main_color : '#ccc';
    if (orderStatus && shouldStatus) {
      return (orderStatus >= shouldStatus && orderStatus !== Cts.ORDER_STATUS_INVALID) ? colors.main_color : '#ccc';
    } else {
      return datetimeStr && dayjs(datetimeStr).unix() > dayjs('2010-01-01').unix() ? colors.main_color : '#ccc';
    }
  }

  onPressOid(oid) {
    Alert.alert('提示', oid, [{text: '确定',}])
  }

  _callShip = () => {
    const {order, onCallNum} = this.props;
    onCallNum(order.ship_worker_mobile, '骑手信息');
  };

  render() {

    const {order, onPressCall, onCallShip} = this.props;

    const packWorkersStr = order.pack_workers ? order.pack_workers : '';
    const packWorkers = packWorkersStr.split(',').map(function (uid) {
      return (order.workers[uid] || {}).nickname
    })
    const packLoggerName = Object.assign({}, order.workers[order.pack_done_logger]).nickname;

    const invalidStyle = parseInt(order.orderStatus) === Cts.ORDER_STATUS_INVALID ? {textDecorationLine: 'line-through'} : {};
    let orderStatus = parseInt(order.orderStatus);

    return <View style={[Styles.topBottomLine, {marginTop: pxToDp(10), backgroundColor: '#f0f9ef'}]}>
      <View style={styles.row}>
        <Text style={[invalidStyle, {
          fontSize: pxToDp(36),
          color: colors.color333,
          fontWeight: 'bold'
        }]}>{order.show_seq || tool.shortOrderDay(order.orderTime)}{!order.show_seq ? `#${order.dayId}` : ''} </Text>
        <View style={{flex: 1}}/>
        <CallBtn label={order.show_store_name || order.store_name} onPress={onPressCall}/>
      </View>
      <View style={styles.row}>
        <Text selectable={true}
              style={[invalidStyle, {flex: 1, color: colors.color999, fontSize: pxToDp(26)}]}>订单号：{order.id} </Text>

        <Text style={[invalidStyle, {
          flex: 1,
          textAlign: 'right'
        }, tool.isPreOrder(order.expectTime) ? {color: colors.orange} : {color: colors.color333}]}>期望送达 {tool.orderExpectTime(order.expectTime)} </Text>
      </View>
      <View style={[styles.row, {marginBottom: pxToDp(30)}]}>
        <View style={{flex: 1}}>
          <Text selectable={true} style={[invalidStyle, {fontSize: pxToDp(18)}]}
                onLongPress={() => this.onPressOid(order.platform_oid)}>{order.pl_name}#{order.platform_dayId} {order.platform_oid} </Text>
          <If condition={order.eb_order_from == '1'}>
            <Text selectable={true} style={[invalidStyle, {fontSize: pxToDp(18), fontWeight: 'bold'}]}
                  onLongPress={() => this.onPressOid(order.ele_id)}>饿了么#{order.platform_dayId} {order.ele_id} </Text>
          </If>
        </View>
        <Text style={[invalidStyle, {
          textAlign: 'right',
          color: colors.color666,
          flex: 1
        }]}>{tool.orderOrderTimeShort(order.orderTime)}下单</Text>
      </View>

      <View style={{
        backgroundColor: colors.white, flexDirection: 'row', paddingBottom: pxToDp(10),
        justifyContent: 'space-around'
      }}>
        <OrderStep
          statusTxt="已收单"
          bgColor={this._validStepColor(order.orderTime, orderStatus, Cts.ORDER_STATUS_TO_READY)}
          timeAtStr={tool.shortTimeDesc(order.orderTime)}/>
        <OrderStep
          statusTxt="已分拣"
          bgColor={this._validStepColor(order.time_ready, orderStatus, Cts.ORDER_STATUS_TO_SHIP)}
          workerNames={packWorkers} loggerName={packLoggerName}
          timeAtStr={tool.shortTimeDesc(order.time_ready)} onPress={onPressCall}/>
        <OrderStep
          statusTxt="已出发"
          bgColor={this._validStepColor(order.time_start_ship, orderStatus, Cts.ORDER_STATUS_SHIPPING)}
          workerNames={order.ship_worker_name} timeAtStr={tool.shortTimeDesc(order.time_start_ship)}
          onPress={this._callShip}/>
        <OrderStep
          statusTxt="已送达"
          bgColor={this._validStepColor(order.time_arrived, orderStatus, Cts.ORDER_STATUS_ARRIVED)}
          workerNames={order.ship_worker_name} timeAtStr={tool.shortTimeDesc(order.time_arrived)}
          onPress={this._callShip}/>
      </View>
      {/*<View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.orderTime), left: (screen.width/8-5)}]}/>*/}
      {/*<View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_ready), left: (screen.width/8*3-5)}]}/>*/}
      {/*<View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_start_ship), left: (screen.width/8*5-5)}]}/>*/}
      {/*<View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_arrived), left: (screen.width/8*7-5)}]}/>*/}
    </View>
  }
}


class OrderStep extends PureComponent {
  static propTypes = {
    statusTxt: PropTypes.string.isRequired,
    loggerName: PropTypes.string,
    timeAtStr: PropTypes.string.isRequired,
    invalid: PropTypes.bool,
    workerNames: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  }

  constructor(props) {
    super(props)
  }

  render() {

    const {
      statusTxt, workerNames, timeAtStr, loggerName, invalid, bgColor, onPress = function () {
      }
    } = this.props;

    return <TouchableOpacity style={{flexDirection: 'column', flex: 1, alignItems: 'center'}} onPress={onPress}>
      <View style={{backgroundColor: bgColor, height: pxToDp(4), width: '100%', marginBottom: pxToDp(18)}}/>
      <Text style={[styles.stepText, {color: bgColor, fontSize: pxToDp(26)}]}>{statusTxt} </Text>
      {!!workerNames &&
      <Text style={styles.stepText}>{workerNames} </Text>}
      {!!timeAtStr &&
      <Text style={styles.stepText}>{timeAtStr} </Text>}
      {!!loggerName &&
      <Text style={styles.stepText}>(by {loggerName}) </Text>}
    </TouchableOpacity>;
  }
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: pxToDp(30),
    marginRight: pxToDp(40),
    alignContent: 'center',
    marginTop: pxToDp(14),
  },
  stepCircle: {
    borderRadius: pxToDp(10),
    width: pxToDp(20),
    height: pxToDp(20),
    position: 'absolute',
    top: pxToDp(188),
  },
  stepText: {
    textAlign: 'center',
    color: colors.color999,
    fontSize: pxToDp(24)
  },
});

export default OrderStatusCell;
