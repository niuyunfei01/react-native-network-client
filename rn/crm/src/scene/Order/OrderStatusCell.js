
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native'
import * as tool from '../../common/tool'
import * as screen from '../../common/screen'
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp"
import CallBtn from './CallBtn'
import colors from "../../styles/colors";
import _ from 'underscore'


class OrderStatusCell extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const {order} = this.props;

    const packWorkers = order.pack_workers.split(',').map(function(uid){return (order.workers[uid] || {}).nickname})
    const packLoggerName = Object.assign({}, order.workers[order.pack_done_logger]).nickname;

    return <View style={{marginTop: pxToDp(20), backgroundColor:'#f0f9ef'}}>
      <View style={styles.row}>
        <Text>{tool.shortOrderDay(order.orderTime)}#{order.dayId}</Text>
        <View style={{flex: 1}}/>

        <CallBtn label={order.store_name}/>

      </View>
      <View style={styles.row}>
        <Text>订单号：{order.id}</Text>
        <View style={{flex: 1}}/>
        <Text>期望送达 {tool.orderExpectTime(order.expectTime)}</Text>
      </View>
      <View style={[styles.row, {marginBottom: pxToDp(30)}]}>
        <Text>{order.pl_name}#{order.platformId} {order.platform_oid}</Text>
        <View style={{flex: 1}}/>
        <Text>{tool.orderOrderTimeShort(order.orderTime)}下单</Text>
      </View>

      <View style={{height: pxToDp(170), backgroundColor: colors.white, flexDirection: 'row',
        justifyContent:'space-around'}}>
        <OrderStep statusTxt="分拣" workerNames={packWorkers} loggerName={packLoggerName}
                   timeAtStr={tool.shortTimeDesc(order.time_ready)}/>
        <OrderStep statusTxt="待配送" wokerNames={_.defaults(order.workers[order.ship_status], {}).nickname}/>
        <OrderStep statusTxt="开始配送"/>
        <OrderStep statusTxt="已送达"/>
      </View>
      <View style={[styles.stepCircle, {backgroundColor: colors.main_color, left: (screen.width/8-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: colors.main_color, left: (screen.width/8*3-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: '#ccc', left: (screen.width/8*5-5)}]}/>
      <View style={[styles.stepCircle, {backgroundColor: '#ccc', left: (screen.width/8*7-5)}]}/>
    </View>
  }
}


class OrderStep extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const {statusTxt, workerNames, timeAtStr, loggerName, invalid} = this.props;
    const bgColor = invalid || !timeAtStr ? '#ccc' : colors.main_color;

    console.log(`${statusTxt}, ${workerNames}, ${timeAtStr}, ${loggerName}, ${bgColor}`);

    return <View style={{flexDirection: 'column', flex: 1, alignItems:'center'}}>
      <View style={{backgroundColor: bgColor , height: pxToDp(4), width: '100%', marginBottom: pxToDp(18)}}/>
      <Text style={[styles.stepText]}>{statusTxt}</Text>
      { !!workerNames &&
      <Text style={styles.stepText}>{workerNames}</Text>}
      { !!timeAtStr &&
      <Text style={styles.stepText}>{timeAtStr}</Text>}
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
    top: pxToDp(178),
  }
});

export default OrderStatusCell;