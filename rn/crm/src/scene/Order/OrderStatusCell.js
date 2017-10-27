
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native'
import * as tool from '../../common/tool'
import screen from '../../common/screen'
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp"
import CallBtn from './CallBtn'
import colors from "../../styles/colors";
import _ from 'underscore'
import moment from 'moment'
import Cts from '../../Cts'
import Styles from '../../common/CommonStyles'


class OrderStatusCell extends PureComponent {

  constructor(props) {
    super(props)
  }

  _validStepColor(datetimeStr) {
    return datetimeStr && moment(datetimeStr).unix() > moment('2010-01-01').unix() ? colors.main_color : '#ccc';
  }

  render() {

    const {order, onPressCall} = this.props;

    const packWorkersStr = order.pack_workers  ? order.pack_workers : '';
    const packWorkers = packWorkersStr.split(',').map(function(uid){return (order.workers[uid] || {}).nickname})
    const packLoggerName = Object.assign({}, order.workers[order.pack_done_logger]).nickname;

    const invalidStyle = order.orderStatus == Cts.ORDER_STATUS_INVALID ?  {textDecorationLine: 'line-through'} : {};

    return <View style={[Styles.topBottomLine, {marginTop: pxToDp(10), backgroundColor:'#f0f9ef'}]}>
      <View style={styles.row}>
        <Text style={[invalidStyle, {fontSize: pxToDp(36), color: colors.color333, fontWeight: 'bold'}]}>{tool.shortOrderDay(order.orderTime)}#{order.dayId}</Text>
        <View style={{flex: 1}}/>

        <CallBtn label={order.store_name} onPress={onPressCall}/>

      </View>
      <View style={styles.row}>
        <Text style={[invalidStyle, {color: colors.color999, fontSize: pxToDp(26)}]}>订单号：{order.id}</Text>
        <View style={{flex: 1}}/>
        <Text style={[invalidStyle, {color: colors.color333}]}>期望送达 {tool.orderExpectTime(order.expectTime)}</Text>
      </View>
      <View style={[styles.row, {marginBottom: pxToDp(30)}]}>
        <Text style={[invalidStyle, {fontSize: pxToDp(20), fontWeight: 'bold'}]}>{order.pl_name}#{order.platformId} {order.platform_oid}</Text>
        <View style={{flex: 1}}/>
        <Text style={[invalidStyle, {color: colors.color666}]}>{tool.orderOrderTimeShort(order.orderTime)}下单</Text>
      </View>

      <View style={{ backgroundColor: colors.white, flexDirection: 'row',
        justifyContent:'space-around'}}>
        <OrderStep statusTxt="已收单" bgColor={this._validStepColor(order.orderTime)} timeAtStr={tool.shortTimeDesc(order.orderTime)}/>
        <OrderStep statusTxt="已分拣" bgColor={this._validStepColor(order.time_ready)} workerNames={packWorkers} loggerName={packLoggerName}
                   timeAtStr={tool.shortTimeDesc(order.time_ready)}/>
        <OrderStep statusTxt="已出发" bgColor={this._validStepColor(order.time_start_ship)} workerNames={order.ship_worker_name} timeAtStr={tool.shortTimeDesc(order.time_start_ship)}/>
        <OrderStep statusTxt="已送达" bgColor={this._validStepColor(order.time_arrived)} workerNames={order.ship_worker_name} timeAtStr={tool.shortTimeDesc(order.time_arrived)}/>
      </View>
      <View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.orderTime), left: (screen.width/8-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_ready), left: (screen.width/8*3-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_start_ship), left: (screen.width/8*5-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: this._validStepColor(order.time_arrived), left: (screen.width/8*7-5)}]}/>
    </View>
  }
}


class OrderStep extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const {statusTxt, workerNames, timeAtStr, loggerName, invalid, bgColor} = this.props;

    return <View style={{flexDirection: 'column', flex: 1, alignItems:'center'}}>
      <View style={{backgroundColor: bgColor , height: pxToDp(4), width: '100%', marginBottom: pxToDp(18)}}/>
      <Text style={[styles.stepText, {color: bgColor, fontSize: pxToDp(26)}]}>{statusTxt}</Text>
      { !!workerNames &&
      <Text style={styles.stepText}>{workerNames}</Text>}
      { !!timeAtStr &&
      <Text style={styles.stepText}>{timeAtStr}</Text>}
      { !!loggerName &&
      <Text style={styles.stepText}>(by {loggerName})</Text>}
    </View>;
  }
}

OrderStep.PropTypes = {
  statusTxt: PropTypes.string.isRequired,
  loggerName: PropTypes.string.isRequired,
  timeAtStr: PropTypes.string.isRequired,
  invalid: PropTypes.bool,
  workerNames: PropTypes.string,
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: pxToDp(30),
    marginRight: pxToDp(40),
    alignContent: 'center',
    marginTop: pxToDp(14)
  },
  stepCircle: {
    borderRadius: pxToDp(10),
    width:pxToDp(20),
    height:pxToDp(20),
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