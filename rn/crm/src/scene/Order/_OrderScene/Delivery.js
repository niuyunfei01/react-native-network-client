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
import {Modal} from "antd-mobile-rn";
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
  
  onAddTip () {
    
  }
  
  onCallThirdShip () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_CALL_SHIP, {
      orderId: this.props.order.id,
      storeId: this.props.order.store_id,
      onBack: () => this.fetchShipData()
    });
  }
  
  onPackUp () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_PACK, {order: this.props.order});
  }
  
  onConfirmCallSelf () {
    const self = this
    Modal.alert('提醒', '骑手已接单，\n' + '\n' + '当前不能转自配送', [
      {
        text: '确定'
      }, {
        text: '取消'
      }
    ])
  }
  
  onCallSelf () {
    const self = this
    Modal.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定取消呼叫吗？', [
      {
        text: '确定',
        onPress: () => self.onConfirmCallSelf()
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
            <If condition={ship.time_away}>
              <View style={styles.cellRight}>
                <Text style={styles.waitTime}>已等待：{ship.time_away}</Text>
                {/*<JbbButton*/}
                {/*onPress={() => this.onAddTip()}*/}
                {/*text={'加小费'}*/}
                {/*type={'hollow'}*/}
                {/*fontColor={'#000'}*/}
                {/*borderColor={'#000'}*/}
                {/*fontSize={pxToDp(24)}*/}
                {/*width={pxToDp(120)}*/}
                {/*height={pxToDp(40)}*/}
                {/*/>*/}
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
        
        <View style={styles.shipCell}>
          <View style={styles.cellLeft}>
            <Text style={styles.shipWay}>美团专送：待取货</Text>
            <Text style={styles.shipFee}>距离2301米，配送费7元，已加小费3元</Text>
          </View>
          <View style={styles.cellRightCall}>
            <JbbButton
              onPress={() => native.dialNumber('')}
              text={'呼叫骑手'}
              borderColor={'#E84E2A'}
              backgroundColor={'#E84E2A'}
              fontColor={'#fff'}
              fontWeight={'bold'}
              fontSize={pxToDp(30)}
            />
          </View>
        </View>
        
        <View style={styles.shipCell}>
          <View style={styles.cellLeft}>
            <Text style={styles.shipWay}>美团专送：待取货</Text>
            <Text style={styles.shipFee}>距离2301米，配送费7元，已加小费3元</Text>
          </View>
          <View style={styles.cellRight}>
            <Text style={styles.waitTime}>已等待：1时55分01秒</Text>
            <JbbButton
              onPress={() => this.onAddTip()}
              text={'加小费'}
              type={'hollow'}
              fontColor={'#000'}
              borderColor={'#000'}
              fontSize={pxToDp(24)}
              width={pxToDp(120)}
              height={pxToDp(40)}
            />
          </View>
        </View>
      </View>
    )
  }
  
  renderBtn () {
    return (
      <View style={styles.btnCell}>
        <View style={styles.btnBox}>
          <JbbButton
            text={'呼叫第三方配送'}
            onPress={() => this.onCallThirdShip()}
            fontColor={'#fff'}
            fontWeight={'bold'}
            backgroundColor={color.theme}
          />
          <If condition={this.props.order.orderStatus == Cts.ORDER_STATUS_TO_READY}>
            <JbbButton
              type={'hollow'}
              text={'打包完成'}
              onPress={() => this.onPackUp()}
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
    )
  }
  
  render (): React.ReactNode {
    return (
      <View>
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