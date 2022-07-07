import React, {Component} from 'react';
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {
  addTipMoney,
  clearLocalOrder,
  getOrder,
  getRemindForOrderPage,
  orderCancelZsDelivery,
  orderWayRecord,
  printInCloud,
  saveOrderDelayShip,
  saveOrderItems,
} from '../../reducers/order/orderActions'
import HttpUtils from "../../pubilc/util/http";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import Cts from '../../pubilc/common/Cts'
import {ActionSheet} from "../../weui";
import pxToDp from "../../pubilc/util/pxToDp";
import colors from "../../pubilc/styles/colors";
import {CheckBox} from 'react-native-elements'
import {showError, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import DateTimePicker from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import Config from '../../pubilc/common/config'
import tool from '../../pubilc/util/tool'
import native from '../../pubilc/util/native'
import ReceiveMoney from "./_OrderScene/ReceiveMoney";
import {bindActionCreators} from "redux";
import {getContacts} from '../../reducers/store/storeActions';
import {markTaskDone} from '../../reducers/remind/remindActions';
import Entypo from "react-native-vector-icons/Entypo";
import BottomModal from "../../pubilc/component/BottomModal";
import {MixpanelInstance} from "../../pubilc/util/analytics";

const MENU_EDIT_BASIC = 1;
const MENU_EDIT_EXPECT_TIME = 2;
const MENU_EDIT_STORE = 3;
const MENU_FEEDBACK = 4;
const MENU_SET_INVALID = 5; // 置为无效
const MENU_ADD_TODO = 6;
const MENU_OLD_VERSION = 7;
const MENU_PROVIDING = 8;
const MENU_SEND_MONEY = 9;
const MENU_RECEIVE_QR = 10;
const MENU_ORDER_SCAN = 11;
const MENU_ORDER_SCAN_READY = 12;
const MENU_ORDER_CANCEL_TO_ENTRY = 13;
const MENU_REDEEM_GOOD_COUPON = 14;
const MENU_CANCEL_ORDER = 15; // 取消订单
const MENU_SET_COMPLETE = 16; // 置为完成
const MENU_CALL_STAFF = 17; // 联系员工


function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getContacts,
      getOrder,
      printInCloud,
      getRemindForOrderPage,
      saveOrderItems,
      markTaskDone,
      orderWayRecord,
      clearLocalOrder,
      orderCancelZsDelivery,
      addTipMoney,
    }, dispatch)
  }
}


function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,

  }
}


class OrderOperation extends Component {
  constructor(props) {
    super(props)
    this.mixpanel = MixpanelInstance;
    const order_id = (this.props.route.params || {}).orderId;
    this.state = {
      actionSheet: this.props.route.params.ActionSheet,
      checked: true,
      isEndVisible: false,//修改配送时间弹窗
      visibleReceiveQr: false,//收款码
      showCallStore: false,//修改门店
      show_no_rider_tips: false,
      isShowInput: false,
      reasontext: "",//取消原因
      order: this.props.route.params.order,
      order_id: order_id,
      isVisible: true,
      queList: [],
      type: "",
      showDeliveryModal: false,
      idx: -1,
    }
    this.order_reason();
  }


  renderReceiveQr(order) {
    return (
      <ReceiveMoney
        formVisible={this.state.visibleReceiveQr}
        onCloseForm={() => this.setState({visibleReceiveQr: false})}
        order={order}
      />
    )
  }

  order_reason() {
    let {accessToken, config} = this.props.global
    const {id} = config.vendor
    HttpUtils.get(`/api/cancel_order_reason?access_token=${accessToken}&vendorId=${id}`).then(res => {
      let arr = [];
      let obj
      res.map((v, i) => {
        obj = {}
        obj['msg'] = v;
        obj['checked'] = false;
        obj['type'] = i;
        arr.push(obj)
      })
      this.setState({
        queList: arr
      })
    }).catch(() => {
      showError('失败')
    })
  }

  _hideCallStore() {
    this.setState({showCallStore: false});
  }

  toSetOrderComplete() {
    let {accessToken, config} = this.props.global
    const {id} = config.vendor
    Alert.alert('确认将订单置为完成', '订单置为完成后无法撤回，是否继续？', [{
      text: '确认', onPress: () => {
        HttpUtils.get(`/api/complete_order/${this.state.order_id}?access_token=${accessToken}&vendorId=${id}`).then(res => {
          ToastLong('订单已完成, 即将返回!')
          GlobalUtil.setOrderFresh(1)
          setTimeout(() => {
            this.props.navigation.goBack()
          }, 1000)
        }).catch((e) => {
          showError(`置为完成失败, ${e.reason}`)
        })
      }
    }, {text: '再想想'}])
  }

  onSaveDelayShip(date) {
    let expect_time = tool.fullDate(date);
    const {order} = this.state;
    if (dayjs(expect_time).unix() <= dayjs().unix()) {
      ToastLong('不能小于当前时间')
      return null;
    }
    let send_data = {
      wm_id: order.id,
      expect_time: expect_time,
    };
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(saveOrderDelayShip(send_data, accessToken, (resp) => {
        if (resp.ok) {
          ToastShort('操作成功');
          this.setState({
            isEndVisible: false
          })
        }
      }));
    });
  }

  _contacts2menus() {
    // ['desc' => $desc, 'mobile' => $mobile, 'sign' => $on_working, 'id' => $uid]
    return (this.state.store_contacts || []).map((contact, idx) => {
      const {sign, mobile, desc, id} = contact;
      return {
        type: 'default',
        label: desc + (sign ? '[上班] ' : ''),
        onPress: () => {
          native.dialNumber(mobile)
        }
      }
    });
  }

  _onToProvide() {
    const {order, navigation} = this.props;
    if (order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }
    const path = `stores/orders_go_to_buy/${order.id}.html?access_token=${global.accessToken}`;
    navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }

  _onShowStoreCall() {
    const {store, dispatch, global} = this.props;

    const store_id = this.state.order.store_id;
    const contacts = (store.store_contacts || {}).store_id;
    if (!contacts || contacts.length === 0) {
      this.setState({showContactsLoading: true});
      dispatch(getContacts(global.accessToken, store_id, (ok, msg, contacts) => {
        this.setState({store_contacts: contacts, showContactsLoading: false, showCallStore: true})
      }));
    } else {
      this.setState({showCallStore: true})
    }
  }

  cancel_order() {
    this.setState({
      showDeliveryModal: true
    })

  }

  render() {
    const {actionSheet, showCallStore, order, showDeliveryModal, queList, isShowInput} = this.state
    return (
      <View>
        <BottomModal
          visible={showDeliveryModal}
          title={'取消原因'}
          actionText={'确认'}
          onClose={() => this.setState({showDeliveryModal: false})}
          onPress={() => {
            let {orderId} = this.props.route.params;
            let {accessToken} = this.props.global;
            let url = `api/cancel_order/${orderId}.json?access_token=${accessToken}&type=${this.state.type}&reason=${this.state.reasontext}`;
            Alert.alert(
              '确认是否取消订单', '取消订单后无法撤回，是否继续？',
              [
                {
                  text: '确认', onPress: () => {
                    HttpUtils.get(url).then(res => {
                      ToastLong('订单取消成功即将返回!')
                      this.setState({
                        showDeliveryModal: false
                      }, () => {
                        setTimeout(() => {
                          this.props.navigation.goBack();
                        }, 1000);
                      })
                    }).catch(() => {
                      showError('取消订单失败')
                    })
                  }
                },
                {
                  "text": '返回', onPress: () => {
                    Alert.alert('我知道了')
                  }
                }
              ]
            )
          }}>
          <View>
            {
              queList.map((item, idx) => {
                item.checked = false;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 15
                      }
                    ]}
                    onPress={() => {
                      queList[idx].checked = true;
                      this.setState({
                        queList: queList,
                        idx: idx,
                        type: queList[idx].type
                      })
                      if ((idx + 1) === tool.length(queList)) {
                        this.setState({isShowInput: true})
                      } else {
                        this.setState({isShowInput: false})
                      }
                    }}
                  >
                    <View style={{
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      backgroundColor: this.state.idx === idx ? colors.main_color : colors.white,
                      justifyContent: "center",
                      alignItems: 'center',
                    }}>
                      <Entypo name={this.state.idx === idx ? 'check' : 'circle'}
                              size={pxToDp(32)}
                              style={{color: this.state.idx === idx ? 'white' : colors.main_color}}/>
                    </View>
                    <Text style={{marginLeft: 20}}>
                      {item.msg}
                    </Text>
                  </TouchableOpacity>
                )
              })}

            <If condition={isShowInput}>
              <TextInput
                style={[styles.TextInput]}
                placeholder="请输入取消原因!"
                onChangeText={(text) => this.setState({reasontext: text})}
              />
            </If>
          </View>

        </BottomModal>


        <ActionSheet
          visible={showCallStore}
          onRequestClose={() => {
            this.setState({showCallStore: false})
          }}
          menus={this._contacts2menus()}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: this._hideCallStore.bind(this),
            }
          ]}
        />
        {this.renderReceiveQr(order)}
        <DateTimePicker
          cancelTextIOS={'取消'}
          confirmTextIOS={'修改'}
          customHeaderIOS={() => {
            return (<View/>)
          }}
          date={new Date()}
          mode='datetime'
          isVisible={this.state.isEndVisible}
          onConfirm={(date) => {
            this.onSaveDelayShip(date)
          }}
          onCancel={() => {
            this.setState({
              isEndVisible: false,
            });
          }}
        />
        <ScrollView
          overScrollMode="always"
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {
            actionSheet.map((item, idx) => {
              item.checked = false
              return (
                <CheckBox
                  key={idx}
                  left
                  title={item.label}
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checked={item.checked || false}
                  checkedColor={colors.main_color}
                  onPress={() => this.touchItem(actionSheet, idx)}
                />
              )
            })
          }
          <View style={{width: '100%', height: pxToDp(200)}}></View>
        </ScrollView>

      </View>
    );
  }

  touchItem = (actionSheet, idx) => {
    actionSheet[idx].checked = true;
    switch (actionSheet[idx].key) {
      case 3:
        this.mixpanel.track('点击修改门店')
        break
      case 15:
        this.mixpanel.track('点击取消订单')
        this.setState({
          showDeliveryModal: true
        })
        break
      case 16:
        this.mixpanel.track('点击置为完成')
        break
    }
    this.setState({
      actionSheet
    }, () => {
      this.onMenuOptionSelected(actionSheet[idx])
    })
  }

  onMenuOptionSelected(option) {
    const {navigation, global} = this.props;
    const {accessToken} = global;
    const {order} = this.state
    const vm_path = order.feedback && order.feedback.id ? "#!/feedback/view/" + order.feedback.id
      : "#!/feedback/order/" + order.id;
    const path = `vm?access_token=${accessToken}${vm_path}`;
    const url = Config.serverUrl(path, Config.https);
    switch (option?.key) {
      case MENU_EDIT_BASIC:
        navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order});
        break
      case MENU_EDIT_EXPECT_TIME://修改配送时间
        this.setState({
          isEndVisible: true,
        });
        break
      case MENU_EDIT_STORE:
        GlobalUtil.setOrderFresh(1)
        navigation.navigate(Config.ROUTE_ORDER_STORE, {order: order});
        break
      case MENU_FEEDBACK:
        navigation.navigate(Config.ROUTE_WEB, {url});
        break
      case MENU_SET_INVALID:
        navigation.navigate(Config.ROUTE_ORDER_TO_INVALID, {order: order});
        GlobalUtil.setOrderFresh(1)
        break
      case MENU_CANCEL_ORDER:
        GlobalUtil.setOrderFresh(1)
        this.cancel_order()
        break
      case MENU_ADD_TODO:
        navigation.navigate(Config.ROUTE_ORDER_TODO, {order: order});
        break
      case MENU_OLD_VERSION:
        GlobalUtil.setOrderFresh(1)
        native.toNativeOrder(order.id).then();
        break
      case MENU_PROVIDING:
        this._onToProvide();
        break
      case MENU_RECEIVE_QR:
        this.setState({visibleReceiveQr: true})
        break
      case MENU_SEND_MONEY:
        navigation.navigate(Config.ROUTE_ORDER_SEND_MONEY, {orderId: order.id, storeId: order.store_id})
        break
      case MENU_ORDER_SCAN:
        navigation.navigate(Config.ROUTE_ORDER_SCAN, {orderId: order.id})
        break
      case MENU_ORDER_SCAN_READY:
        navigation.navigate(Config.ROUTE_ORDER_SCAN_REDAY)
        break
      case MENU_ORDER_CANCEL_TO_ENTRY:
        navigation.navigate(Config.ROUTE_ORDER_CANCEL_TO_ENTRY, {orderId: order.id})
        break
      case MENU_REDEEM_GOOD_COUPON:
        navigation.navigate(Config.ROUTE_ORDER_GOOD_COUPON, {
          type: 'select',
          storeId: order.store_id,
          orderId: order.id,
          coupon_type: Cts.COUPON_TYPE_GOOD_REDEEM_LIMIT_U,
          to_u_id: order.user_id,
          to_u_name: order.userName,
          to_u_mobile: order.mobile,
        })
        break
      case MENU_SET_COMPLETE:
        this.toSetOrderComplete()
        break
      case MENU_CALL_STAFF:
        this._onShowStoreCall()
        break
      default:
        ToastLong('未知的操作');
        break
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderOperation)
const styles = StyleSheet.create({
  checkname: {
    paddingLeft: 0,
    marginLeft: 0,
    backgroundColor: 'white',
    borderColor: 'transparent',
    fontSize: 14,
    color: '#333333'
  },
  footBtn: {
    marginTop: pxToDp(20),
    backgroundColor: colors.white,
    flexDirection: 'row',
  },
  footBtnItem: {
    flex: 1,
    textAlign: 'center'
  },
  TextInput: {
    marginTop: pxToDp(20),
    borderWidth: pxToDp(2),
    borderColor: '#f7f7f7',
    borderRadius: pxToDp(4),
    padding: pxToDp(10),
    width: '90%',
    left: '5%',
    height: pxToDp(100),
  }

});
