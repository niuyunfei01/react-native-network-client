import React from 'react'
import PropType from 'prop-types'
import {Alert,StyleSheet, Text, View} from 'react-native'
import pxToDp from "../../../util/pxToDp";
import color from '../../../widget/color'
import JbbButton from "../../component/JbbButton";
import { withNavigation } from '@react-navigation/compat';
import {connect} from "react-redux";
import Config from "../../../config";
import colors from "../../../styles/colors";
import Cts from "../../../Cts";
import {native} from "../../../common";
import {Modal, Toast} from "@ant-design/react-native";
import HttpUtils from "../../../util/http";
import tool from "../../../common/tool";
import _ from 'lodash'
import JbbPrompt from "../../component/JbbPrompt";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class Delivery extends React.Component {
  static propTypes = {
    order: PropType.object,
    logistics: PropType.array,
    fetchData:PropType.func,
    onCallNum: PropType.func
  };

  static defaultProps = {};

  constructor (props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    this.state = {
      logistics: this.props.logistics,
      accessToken: this.props.global.accessToken,
      timer: null
    }
  }

 UNSAFE_componentWillMount (): void {
    const self = this
    let orderStatus = this.props.order.orderStatus
    self.props.fetchData()
    // 如果订单完成或者无效则不设置定时刷新任务
    // if (!Mapping.Tools.ValueEqMapping(Mapping.Order.ORDER_STATUS.ARRIVED, orderStatus) && !Mapping.Tools.ValueEqMapping(Mapping.Order.ORDER_STATUS.INVALID, orderStatus)) {
    //   let timer = setInterval(function () {
    //     self.fetchShipData()
    //   }, 10000)
    //   self.setState({timer: timer})
    // }
  }

  componentWillUnmount (): void {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.setState({timer: null})
    }
  }

  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({logistics: nextProps.logistics})
  }

  _callNum = (num, title) => {
    const {onCallNum} = this.props;
    onCallNum(num, title);
  };

  onConfirmCancel = (ship_id) => {
    const {navigation, order} = this.props;
    this.setState({dlgShipVisible: false});
    navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP, {order, ship_id, onCancelled: (ok, reason) => {
        this.props.fetchData()
      }});
  };

  onConfirmAddTip (logisticId, val) {
    const self = this;
    const api = `/api/order_add_tips/${this.props.order.id}?access_token=${this.state.accessToken}`;
    HttpUtils.post.bind(self.props)(api, {
      logisticId: logisticId,
      tips: val
    }).then(res => {
      self.props.fetchData()
    }).catch(e => {
      self.props.fetchData()
    })
  }

  onCallThirdShip () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: this.props.order.id,
      storeId: this.props.order.store_id,
      selectedWay: [],
      onBack: (res) => {
        if (res && res.count > 0) {
          Toast.success('发配送成功')
        } else {
          Toast.fail('发配送失败，请联系运营人员')
        }
        this.props.fetchData()
      }
    });
  }

  onTransferSelf () {
    const self = this;
    const api = `/api/order_transfer_self?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.order.id
    }).then(res => {
      Toast.success('操作成功');
      self.props.fetchData()
    }).catch(e => {
      self.props.fetchData()
    })
  }

  onPackUp () {
    this.props.navigation.navigate(Config.ROUTE_ORDER_PACK, {order: this.props.order});
  }

  onRemindShip () {
    const self = this;
    const api = `/api/order_transfer_self/${this.props.order.id}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      Toast.success('操作成功');
      self.props.fetchData()
    }).catch(e => {
      self.props.fetchData()
    })
  }

  onRemindArrived () {
    const self = this;
    const api = `/api/order_transfer_self/${this.props.order.id}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      Toast.success('操作成功');
      self.props.fetchData()
    }).catch(e => {
      self.props.fetchData()
    })
  }

  onCallSelf () {
    const self = this;
    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
      {
        text: '确定',
        onPress: () => self.onTransferSelf(),
      }, {
        text: '取消'
      }
    ])
  }

  _descText = (ship) => {
    return ship.desc_text ||
      (ship.distance >= 0?`${ship.distance}米`:'')+(ship.fee > 0 ? `, 合计${ship.fee}元`:'') + (ship.tip > 0?`, 小费${ship.tip}元`:'') + (ship.driver_name ? ` 骑手${ship.driver_name}`:'');
  };

  renderShips () {
    return (
      <View>
        <For each='ship' index='idx' of={this.state.logistics}>
          {
          }
          <View style={styles.shipCell} key={idx}>
            <View style={styles.cellLeft}>
              <Text style={styles.shipWay}>{ship.logistic_name}：{ship.status_name}</Text>
              <Text style={styles.shipFee}>{this._descText(ship)}</Text>
            </View>
            <View style={styles.cellRight}>
              <If condition={ship.show_trace}>
                <JbbButton text={'位置轨迹'}
                           borderColor={colors.color999}
                           onPress={() => {
                             console.log(ship.id)
                             const accessToken = this.props.global.accessToken
                             let path = '/rider_tracks.html?delivery_id=' + ship.id + "&access_token=" + accessToken;
                             const uri = Config.serverUrl(path);
                             this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
                           }}
                           fontSize={pxToDp(20)}
                           marginLeft={pxToDp(20)}
                />
              </If>
              <If condition={ship.time_away}>
                <Text style={styles.waitTime}>已等待：{ship.time_away}</Text>
              </If>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <If condition={ship.can_add_tip && !ship.driver_phone}>
                <JbbPrompt
                  title={'输入小费'}
                  onConfirm={(value) => this.onConfirmAddTip(ship.id, value)}
                  initValue={ship.tip}>
                  <JbbButton
                    text={'加小费'}
                    type={'hollow'}
                    borderColor={colors.color999}
                    fontSize={pxToDp(20)}
                    paddingHorizontal={pxToDp(10)}
                    marginLeft={pxToDp(20)}
                  />
                </JbbPrompt>
              </If>
              <If condition={!!ship.driver_phone}>
                <JbbButton
                  onPress={() => this._callNum(ship.driver_phone, '骑手信息')}
                  text={'呼叫骑手'}
                  borderColor={colors.main_color}
                  fontWeight={'bold'}
                  fontSize={pxToDp(20)}
                  marginLeft={pxToDp(20)}
                />
              </If>
              <If condition={ship.can_cancel}>
                <JbbButton text={'撤回呼叫'}
                           borderColor={colors.color999}
                           onPress={() => this.onConfirmCancel(ship.id)}
                           fontSize={pxToDp(20)}
                           marginLeft={pxToDp(20)}
                />
              </If>
              </View>
            </View>
          </View>
        </For>
      </View>
    )
  }

  renderBtn () {
    const {orderStatus, auto_ship_type} = this.props.order;
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
            <If condition={orderStatus != Cts.ORDER_STATUS_ARRIVED && orderStatus != Cts.ORDER_STATUS_INVALID}>
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
                  text={'提醒出发'}
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
            </If>
          </View>
          <If condition={orderStatus != Cts.ORDER_STATUS_ARRIVED && orderStatus != Cts.ORDER_STATUS_INVALID}>
            <View>
              <JbbButton
                type={'text'}
                text={'我自己送'}
                onPress={() =>
                    Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{
                      text: '取消'
                    }, {
                      text: '确定',
                      onPress: () => {
                        this.onCallSelf()
                      }
                    }])

                    }
                fontColor={'#000'}
                textUnderline={true}

              />
            </View>
          </If>
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
    // height: pxToDp(100),
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
