import React, {PureComponent} from 'react'
import {Alert, Dimensions, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common"
import PropTypes from 'prop-types'
import {showError, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {orderSetArrived} from '../../reducers/order/orderActions'
import colors from "../../styles/colors";
import {Button} from "react-native-elements";
import HttpUtils from "../../util/http";
import GlobalUtil from "../../util/GlobalUtil";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  return {
    global: state.global,
    store: state.store,
    onSubmitting: false,
  };
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderSetArrived}, dispatch)}
}

class OrderBottom extends PureComponent {
  static propTypes = {
    mobile: PropTypes.string,
    label: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.object,
  }

  constructor(props) {
    super(props);
    const {order} = this.props;
    let {orderStatus} = order;
    orderStatus = parseInt(orderStatus);
    this.state = {
      order,
      btn_list: order.btn_list,
      orderStatus: orderStatus,
    };
  }

  onOverlookDelivery(order_id) {
    const self = this;
    showModal("请求中")
    tool.debounces(() => {
      const api = `/api/transfer_arrived/${order_id}?access_token=${this.props.token}`
      HttpUtils.get.bind(self.props.navigation)(api).then(() => {
        showSuccess('操作成功')
        this.props.fetchData();
        GlobalUtil.setOrderFresh(1)
      }).catch(e => {
        showError('操作失败' + e.desc)
      })
    }, 1000)
  }

  onCallThirdShips(order_id, store_id) {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
      selectedWay: [],
      onBack: (res) => {
        if (res && res.count > 0) {
          this.props.fetchData()

          GlobalUtil.setOrderFresh(1)
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }


  _onToProvide() {
    if (this.state.order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }
    const path = `stores/orders_go_to_buy/${this.state.order.id}.html?access_token=${this.props.token}`;
    this.props.navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }


  onTransferSelf() {
    const api = `/api/order_transfer_self?access_token=${this.props.token}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.state.order.id
    }).then(res => {
      ToastShort('操作成功');
      this.props.fetchData();
    }).catch(e => {
      this.props.fetchData();
    })
  }


  render() {
    let {order, btn_list} = this.state;
    return <View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: pxToDp(15),
        paddingBottom: pxToDp(20),
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: {width: -4, height: -4},
        shadowOpacity: 0.75,
        shadowRadius: 4,
      }}>
        {btn_list && btn_list.btn_pack_green ? <Button title={'打包完成'}
                                                       onPress={() => {
                                                         this._onToProvide()
                                                       }}
                                                       buttonStyle={{
                                                         width: width - 20,
                                                         borderRadius: pxToDp(10),
                                                         backgroundColor: colors.main_color,
                                                       }}
                                                       color={colors.white}
                                                       fontSize={16}
        /> : null}
        {btn_list && btn_list.btn_pack_white ? <Button title={'打包完成'}
                                                       onPress={() => {
                                                         this._onToProvide()
                                                       }}
                                                       buttonStyle={{
                                                         borderRadius: pxToDp(10),
                                                         backgroundColor: colors.white,
                                                         borderWidth: pxToDp(1),
                                                         borderColor: colors.main_color
                                                       }}
                                                       color={colors.main_color}
                                                       fontSize={16}
        /> : null}


        {btn_list && btn_list.btn_ignore_delivery ? <Button title={'忽略配送'}
                                                            onPress={() => {
                                                              Alert.alert('提醒', "忽略配送后系统将不再发单，确定忽略吗？", [{text: '取消'}, {
                                                                text: '忽略',
                                                                onPress: () => {
                                                                  this.onOverlookDelivery(order.id)
                                                                }
                                                              }])
                                                            }}
                                                            buttonStyle={{
                                                              borderRadius: pxToDp(10),
                                                              backgroundColor: colors.fontColor,
                                                            }}
                                                            color={colors.white}
                                                            fontSize={16}
        /> : null}


        {btn_list && btn_list.btn_call_third_delivery_zs ? <Button title={'发起配送'}
                                                                   onPress={() => {
                                                                     this.onCallThirdShips(order.id, order.store_id)
                                                                   }}
                                                                   buttonStyle={{
                                                                     borderRadius: pxToDp(10),
                                                                     backgroundColor: colors.fontColor,
                                                                   }}
                                                                   color={colors.white}
                                                                   fontSize={16}
        /> : null}

        {btn_list && (btn_list.btn_ignore_delivery || btn_list.btn_call_third_delivery_zs) ? <Button title={'我自己送'}
                                                                                                     onPress={() => {

                                                                                                       Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{
                                                                                                         text: '取消'
                                                                                                       }, {
                                                                                                         text: '确定',
                                                                                                         onPress: () => {
                                                                                                           Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
                                                                                                             {
                                                                                                               text: '确定',
                                                                                                               onPress: () => this.onTransferSelf(),
                                                                                                             }, {
                                                                                                               text: '取消'
                                                                                                             }
                                                                                                           ])
                                                                                                         }
                                                                                                       }])
                                                                                                     }}
                                                                                                     buttonStyle={{
                                                                                                       borderRadius: pxToDp(10),
                                                                                                       backgroundColor: colors.white,
                                                                                                       borderWidth: pxToDp(1),
                                                                                                       borderColor: colors.main_color
                                                                                                     }}
                                                                                                     color={colors.main_color}
                                                                                                     fontSize={16}
        /> : null}


        {btn_list && btn_list.btn_call_third_delivery_zs ? <Button title={'忽略配送'}
                                                                   onPress={() => {
                                                                     Alert.alert('提醒', "忽略配送后系统将不再发单，确定忽略吗？", [{text: '取消'}, {
                                                                       text: '忽略',
                                                                       onPress: () => {
                                                                         this.onOverlookDelivery(order.id)
                                                                       }
                                                                     }])

                                                                   }}
                                                                   buttonStyle={{
                                                                     borderRadius: pxToDp(10),
                                                                     backgroundColor: colors.main_color,
                                                                   }}
                                                                   color={colors.white}
                                                                   fontSize={16}
        /> : null}
        {btn_list && btn_list.btn_call_third_delivery ? <Button title={'呼叫配送'}
                                                                onPress={() => {
                                                                  this.onCallThirdShips(order.id, order.store_id)
                                                                }}
                                                                buttonStyle={{
                                                                  borderRadius: pxToDp(10),
                                                                  backgroundColor: colors.main_color,
                                                                }}
                                                                color={colors.white}
                                                                fontSize={16}
        /> : null}
        {btn_list && btn_list.btn_resend ? <Button title={'补  送'}
                                                   onPress={() => {
                                                     this.onCallThirdShips(order.id, order.store_id)
                                                   }}
                                                   buttonStyle={{
                                                     width: width - 20,
                                                     borderRadius: pxToDp(10),
                                                     backgroundColor: colors.main_color,
                                                   }}
                                                   color={colors.white}
                                                   fontSize={16}
        /> : null}
      </View>
    </View>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderBottom)
