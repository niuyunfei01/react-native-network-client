import React, {Component} from 'react';
import {Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import HttpUtils from "../../pubilc/util/http";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {ActionSheet} from "../../weui";
import pxToDp from "../../pubilc/util/pxToDp";
import colors from "../../pubilc/styles/colors";
import {showError, showSuccess, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import Config from '../../pubilc/common/config'
import tool from '../../pubilc/util/tool'
import native from '../../pubilc/util/native'
import {bindActionCreators} from "redux";
import {getContacts} from '../../reducers/store/storeActions';
import Entypo from "react-native-vector-icons/Entypo";
import BottomModal from "../../pubilc/component/BottomModal";
import {MixpanelInstance} from "../../pubilc/util/analytics";
import {JumpMiniProgram} from "../../pubilc/util/WechatUtils";
import BleManager from "react-native-ble-manager";
import {print_order_to_bt} from "../../pubilc/util/ble/OrderPrinter";
import {printInCloud} from "../../reducers/order/orderActions";

const width = Dimensions.get("window").width;

// 订单操作常量
const MENU_PRINT_AGAIN = 1;               // 再次打印
const MENU_COMPLAINT_RIDER = 2;           // 投诉骑手
const MENU_CANCEL_ORDER = 3;              // 取消订单
const MENU_EDIT_BASIC = 4;                // 修改订单
const MENU_EDIT_STORE = 5;                // 修改门店
const MENU_SEND_MONEY = 6;                // 发红包
const MENU_CALL_STAFF = 7;               // 联系门店
const MENU_SET_INVALID = 8;               // 置为无效
const MENU_SET_COMPLETE = 9;             // 置为完成
const MENU_ORDER_SCAN = 10;               // 订单过机
const MENU_ORDER_SCAN_READY = 11;         // 扫码出库
const MENU_ORDER_CANCEL_TO_ENTRY = 12;    // 退单入库

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getContacts,
    }, dispatch)
  }
}

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

class OrderOperation extends Component {
  constructor(props) {
    super(props)
    this.mixpanel = MixpanelInstance;
    const order_id = (this.props.route.params || {}).orderId;
    this.state = {
      actionSheet: props.route.params.actionSheet,
      checked: true,
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
      showErrorModal: false,
      errMsg: "",
    }
    this.order_reason();
  }

  order_reason() {
    let {accessToken, vendor_id} = this.props.global
    HttpUtils.get(`/api/cancel_order_reason?access_token=${accessToken}&vendorId=${vendor_id}`).then(res => {
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
    let {accessToken, vendor_id} = this.props.global
    Alert.alert('确认将订单置为完成', '订单置为完成后无法撤回，是否继续？', [{
      text: '确认', onPress: () => {
        HttpUtils.get(`/api/complete_order/${this.state.order_id}?access_token=${accessToken}&vendorId=${vendor_id}`).then(res => {
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

  // _onToProvide() {
  //   const {order, navigation} = this.state;
  //   if (order.store_id <= 0) {
  //     ToastLong("所属门店未知，请先设置好订单所属门店！");
  //     return false;
  //   }
  //   const path = `stores/orders_go_to_buy/${order.id}.html?access_token=${global.accessToken}`;
  //   navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  // }

  _onShowStoreCall() {
    const {dispatch, global} = this.props;

    dispatch(getContacts(global.accessToken, this.state.order.store_id, (ok, msg, contacts) => {
      this.setState({store_contacts: contacts, showCallStore: true})
    }));
  }

  cancelOrder = () => {
    this.setState({
      showDeliveryModal: false
    })
    let {orderId} = this.props.route.params;
    let {accessToken} = this.props.global;
    let url = `api/cancel_order/${orderId}.json?access_token=${accessToken}&type=${this.state.type}&reason=${this.state.reasontext}`;
    Alert.alert(
      '确认是否取消订单', '取消订单后无法撤回，是否继续？',
      [
        {
          text: '确认', onPress: () => {
            HttpUtils.get(url).then(res => {
              showSuccess('订单取消成功即将返回!')
              setTimeout(() => {
                this.props.navigation.goBack();
              }, 1000);
            }).catch((error) => {
              this.setState({
                showDeliveryModal: false,
                showErrorModal: true,
                errMsg: "请联系顾客或客服取消订单"
              })
            })
          }
        },
        {
          "text": '返回', onPress: () => {
            this.setState({
              showDeliveryModal: true
            })
          }
        }
      ]
    )
  }

  toComplan = (val) => {
    this.onPress(Config.ROUTE_COMPLAIN, {id: val})
  }

  touchItem = (actionSheet, idx) => {
    actionSheet[idx].checked = true;
    switch (actionSheet[idx].key) {
      case 1:
        this.mixpanel.track('订单操作_再次打印')
        break
      case 2:
        this.mixpanel.track('订单操作_投诉骑手')
        break
      case 3:
        this.mixpanel.track('订单操作_取消订单')
        this.setState({
          showDeliveryModal: true
        })
        break
      case 4:
        this.mixpanel.track('订单操作_修改订单')
        break
      case 5:
        this.mixpanel.track('订单操作_修改门店')
        break
      case 9:
        this.mixpanel.track('订单操作_置为完成')
        break
      case 10:
        this.mixpanel.track('订单操作_订单过机')
        break
      case 11:
        this.mixpanel.track('订单操作_扫码入库')
        break
      case 12:
        this.mixpanel.track('订单操作_退单入库')
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
    // const {accessToken} = global;
    const {order} = this.state
    // const vm_path = order.feedback && order.feedback.id ? "#!/feedback/view/" + order.feedback.id
    //   : "#!/feedback/order/" + order.id;
    // const path = `vm?access_token=${accessToken}${vm_path}`;
    // const url = Config.serverUrl(path, Config.https);
    switch (option?.key) {
      case MENU_PRINT_AGAIN:
        this.onPrint(order?.printer_sn)
        break
      case MENU_COMPLAINT_RIDER:
        this.toComplan(order?.ship_id)
        break
      case MENU_EDIT_BASIC:
        navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order});
        break
      case MENU_EDIT_STORE:
        GlobalUtil.setOrderFresh(1)
        navigation.navigate(Config.ROUTE_ORDER_STORE, {order: order});
        break
      case MENU_SET_INVALID:
        navigation.navigate(Config.ROUTE_ORDER_TO_INVALID, {order: order});
        GlobalUtil.setOrderFresh(1)
        break
      case MENU_CANCEL_ORDER:
        GlobalUtil.setOrderFresh(1)
        this.cancel_order()
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
      case MENU_SET_COMPLETE:
        this.toSetOrderComplete()
        break
      case MENU_CALL_STAFF:
        this._onShowStoreCall()
        break
      // case MENU_REDEEM_GOOD_COUPON:
      //   navigation.navigate(Config.ROUTE_ORDER_GOOD_COUPON, {
      //     type: 'select',
      //     storeId: order.store_id,
      //     orderId: order.id,
      //     coupon_type: Cts.COUPON_TYPE_GOOD_REDEEM_LIMIT_U,
      //     to_u_id: order.user_id,
      //     to_u_name: order.userName,
      //     to_u_mobile: order.mobile,
      //   })
      //   break
      default:
        ToastLong('未知的操作');
        break
    }
  }

  onPrint = (printer_sn) => {
    if (printer_sn) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  _hidePrinterChooser = () => {
    this.setState({showPrinterChooser: false})
  }

  _doBluetoothPrint = () => {
    this._hidePrinterChooser()
    let {order} = this.state;
    const {printer_id, accessToken} = this.props.global
    if (printer_id) {
      setTimeout(() => {
        const clb = (msg,) => {
          if (msg === 'ok') {
            ToastShort("已发送给蓝牙打印机！");
          }
          this._hidePrinterChooser();
        };
        BleManager.retrieveServices(printer_id).then((peripheral) => {
          print_order_to_bt(accessToken, peripheral, clb, order.id, order);
        }).catch(() => {
          BleManager.connect(printer_id).then(() => {
            BleManager.retrieveServices(printer_id).then((peripheral) => {
              print_order_to_bt(accessToken, peripheral, clb, order.id, order);
            }).catch(() => {
              //忽略第二次的结果
            })
          }).catch(() => {
            Alert.alert('提示', '打印机已断开连接', this.buttons);
            this._hidePrinterChooser();
          });
        });
      }, 300);
    } else {
      Alert.alert('提示', '尚未连接到打印机', [
        {
          text: '确定',
          onPress: () => this.props.navigation.navigate(Config.ROUTE_PRINTERS)
        },
        {
          text: '取消'
        }
      ]);
    }
  }

  cancel_order() {
    this.setState({
      showDeliveryModal: true
    })
  }

  openMiniprogarm = () => {
    let {currStoreId, currentUser, currentUserProfile, vendor_id} = this.props.global;
    let data = {
      v: vendor_id,
      s: currStoreId,
      u: currentUser,
      m: currentUserProfile.mobilephone,
      place: 'cancelOrder'
    }
    JumpMiniProgram("/pages/service/index", data);
  }

  renderModal = () => {
    const {
      showCallStore,
      order,
      showDeliveryModal,
      showErrorModal,
      errMsg,
      queList,
      isShowInput
    } = this.state
    return (
      <View>
        <BottomModal title={''} onPress={() => this.openMiniprogarm()} visible={showErrorModal}
                     actionText={'联系客服'}
                     closeText={'取消'}
                     onPressClose={() => this.setState({showErrorModal: false})}
                     onClose={() => this.setState({showErrorModal: false})}>
          <Text style={{
            fontSize: 18,
            color: colors.color333,
            fontWeight: 'bold',
            marginVertical: 20,
            textAlign: 'center',
            flex: 1
          }}>{errMsg} </Text>
        </BottomModal>

        <BottomModal
          visible={showDeliveryModal}
          title={'取消原因'}
          actionText={'确认'}
          onClose={() => this.setState({showDeliveryModal: false})}
          onPress={() => this.cancelOrder()}>
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
      </View>
    )
  }

  printAction = [
    {
      type: 'default',
      label: '取消',
      onPress: this._hidePrinterChooser
    }
  ]

  _cloudPrinterSN = () => {
    const {order} = this.state
    const printerName = order.printer_sn || '未知';
    return `云打印(${printerName})`;
  }

  // 云打印
  _doCloudPrint = () => {
    const {dispatch, global} = this.props;
    let {order} = this.state;
    this._hidePrinterChooser()
    dispatch(printInCloud(global.accessToken, order.id, (ok, msg) => {
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        ToastLong('打印失败：' + msg)
      }
      this._hidePrinterChooser();
    }))
  }

  // 商米打印
  _doSunMiPint = () => {
    const {order} = this.state
    native.printSmPrinter(order).then();
    this._hidePrinterChooser();
  }

  render() {
    const {
      actionSheet,
      showPrinterChooser
    } = this.state
    const menus = [
      {
        type: 'default',
        label: this._cloudPrinterSN(),
        onPress: this._doCloudPrint
      },
      {
        type: 'default',
        label: '蓝牙打印',
        onPress: this._doBluetoothPrint
      },
      {
        type: 'default',
        label: '商米打印',
        onPress: this._doSunMiPint
      }
    ]
    return (
      <View>
        {this.renderModal()}
        <ScrollView
          overScrollMode="always"
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.Content}>
            <For index='index' of={actionSheet} each='info'>
              <TouchableOpacity key={index} style={[styles.checkItem, {
                borderTopWidth: index === 0 ? 0 : 0.5,
                borderTopColor: colors.e5
              }]} onPress={() => this.touchItem(actionSheet, index)}>
                <Text style={styles.checkItemLabel}>
                  {info?.label}
                </Text>
              </TouchableOpacity>
            </For>
            <ActionSheet
              visible={showPrinterChooser}
              onRequestClose={this._hidePrinterChooser}
              menus={menus}
              actions={this.printAction}
            />
          </View>
        </ScrollView>

      </View>
    );
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
  },
  Content: {
    width: width * 0.92,
    marginLeft: width * 0.04,
    backgroundColor: colors.white,
    marginTop: 10,
    padding: 10,
    borderRadius: 6
  },
  checkItem: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 13
  },
  checkItemLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333
  }
});
