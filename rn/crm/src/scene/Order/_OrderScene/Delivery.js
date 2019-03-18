import React from 'react'
import PropType from 'prop-types'
import {StyleSheet, Text, View} from 'react-native'
import pxToDp from "../../../util/pxToDp";
import color from '../../../widget/color'
import JbbButton from "../../component/JbbButton";
import {withNavigation} from 'react-navigation'
import {connect} from "react-redux";
import Config from "../../../config";
import Cts from "../../../Cts";
import {native} from "../../../common";
import {Modal, Toast} from "antd-mobile-rn";
import HttpUtils from "../../../util/http";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class Delivery extends React.Component {
  static propTypes = {
    order: PropType.object
  }
  
  static defaultProps = {}
  
  constructor (props) {
    super(props)
    this.state = {
      logistics: [],
      accessToken: this.props.global.accessToken
    }
  }
  
  componentWillMount (): void {
    this.fetchShipData()
  }
  
  fetchShipData () {
    const self = this
    const navigation = self.props.navigation
    const api = `/api/order_deliveries/${this.props.order.id}?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      this.setState({logistics: res})
    })
  }
  
  onConfirmAddTip (logisticId, val) {
    const self = this
    const navigation = self.props.navigation
    const api = `/api/order_add_tips/${this.props.order.id}?access_token=${this.state.accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      logisticId: logisticId,
      tips: val
    }).then(res => {
      this.setState({order: res})
    })
  }
  
  onAddTip (ship) {
    const self = this
    Modal.prompt('订单加小费', '请输入小费金额', (val) => self.onConfirmAddTip(ship.id, val), 'default', ship.tip, '请输入小费金额')
  }
  
  onCallThirdShip () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_CALL_SHIP, {
      orderId: this.props.order.id,
      storeId: this.props.order.store_id,
      onBack: () => this.fetchShipData()
    });
  }
  
  onTransferSelf () {
    const self = this
    const api = `/api/order_transfer_self?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.order.id
    }).then(res => {
      self.fetchShipData()
    }).catch(e => {
      self.fetchShipData()
    })
  }
  
  onPackUp () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_PACK, {order: this.props.order});
  }
  
  onRemindShip () {
    const self = this
    const api = `/api/order_transfer_self/${this.props.order.id}?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.fetchShipData()
    })
  }
  
  onRemindArrived () {
    const self = this
    const api = `/api/order_transfer_self/${this.props.order.id}?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.fetchShipData()
    })
  }
  
  onCallSelf () {
    const self = this
    Modal.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定取消呼叫吗？', [
      {
        text: '确定',
        onPress: () => self.onTransferSelf()
      }, {
        text: '取消'
      }
    ])
  }
  
  renderShips () {
    return (
      <View>
        <For each='ship' index='idx' of={this.state.logistics}>
          <View style={styles.shipCell} key={idx}>
            <View style={styles.cellLeft}>
              <Text style={styles.shipWay}>{ship.logistic_name}：{ship.status_name}</Text>
              <Text style={styles.shipFee}>距离{ship.distance}米，配送费{ship.fee}元，已加小费{ship.tip}元</Text>
            </View>
            <If condition={ship.time_away && ship.can_add_tip}>
              <View style={styles.cellRight}>
                <Text style={styles.waitTime}>已等待：{ship.time_away}</Text>
                <JbbButton
                  onPress={() => this.onAddTip(ship)}
                  text={'加小费'}
                  type={'hollow'}
                  fontColor={'#000'}
                  borderColor={'#000'}
                  fontSize={pxToDp(24)}
                  width={pxToDp(120)}
                  height={pxToDp(40)}
                />
              </View>
            </If>
            <If condition={!ship.time_away && ship.delivery_phone}>
              <View style={styles.cellRightCall}>
                <JbbButton
                  onPress={() => native.dialNumber(ship.delivery_phone)}
                  text={'呼叫骑手'}
                  borderColor={'#E84E2A'}
                  backgroundColor={'#E84E2A'}
                  fontColor={'#fff'}
                  fontWeight={'bold'}
                  fontSize={pxToDp(30)}
                />
              </View>
            </If>
          </View>
        </For>
      </View>
    )
  }
  
  renderBtn () {
    const {orderStatus, auto_ship_type} = this.props.order
    return (
      <If condition={orderStatus != Cts.ORDER_STATUS_ARRIVED && orderStatus != Cts.ORDER_STATUS_INVALID}>
        <View style={styles.btnCell}>
          <View style={styles.btnBox}>
            <JbbButton
              text={'呼叫第三方配送'}
              onPress={() => this.onCallThirdShip()}
              fontColor={'#fff'}
              fontWeight={'bold'}
              backgroundColor={color.theme}
            />
            <If condition={orderStatus == Cts.ORDER_STATUS_TO_READY}>
              <JbbButton
                type={'hollow'}
                text={'打包完成'}
                onPress={() => this.onPackUp()}
                fontWeight={'bold'}
                backgroundColor={color.theme}
                touchStyle={{marginLeft: pxToDp(10)}}
              />
            </If>
            <If condition={auto_ship_type == Cts.SHIP_SELF && orderStatus == Cts.ORDER_STATUS_TO_SHIP}>
              <JbbButton
                type={'hollow'}
                text={'提现出发'}
                onPress={() => this.onRemindShip()}
                fontWeight={'bold'}
                backgroundColor={color.theme}
                touchStyle={{marginLeft: pxToDp(10)}}
              />
            </If>
            <If condition={auto_ship_type == Cts.SHIP_SELF && orderStatus == Cts.ORDER_STATUS_ARRIVED}>
              <JbbButton
                type={'hollow'}
                text={'提醒送达'}
                onPress={() => this.onRemindArrived()}
                fontWeight={'bold'}
                backgroundColor={color.theme}
                touchStyle={{marginLeft: pxToDp(10)}}
              />
            </If>
          </View>
          <View>
            <JbbButton
              type={'text'}
              text={'我自己送'}
              onPress={() => this.onCallSelf()}
              fontColor={'#000'}
              textUnderline={true}
            />
          </View>
        </View>
      </If>
    )
  }
  
  render (): React.ReactNode {
    return (
      <View style={{marginTop: pxToDp(20)}}>
        {this.renderShips()}
        {this.renderBtn()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  shipCell: {
    borderBottomWidth: pxToDp(1),
    borderBottomColor: color.fontGray,
    paddingVertical: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  cellLeft: {
    height: pxToDp(100),
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cellRight: {
    height: pxToDp(100),
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  cellRightCall: {
    height: pxToDp(100),
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  shipWay: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: '#000'
  },
  shipFee: {
    fontSize: pxToDp(24)
  },
  waitTime: {
    fontSize: pxToDp(24)
  },
  btnCell: {
    borderBottomWidth: pxToDp(1),
    borderBottomColor: color.fontGray,
    paddingVertical: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  btnBox: {
    flexDirection: 'row'
  }
})

export default withNavigation(connect(mapStateToProps)(Delivery))