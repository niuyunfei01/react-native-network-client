import React, {Component} from 'react'
import {Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {DatePickerView, List} from '@ant-design/react-native';
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import EmptyData from "../component/EmptyData";
import colors from "../../styles/colors";
import Dialog from "../component/Dialog";
import {hideModal, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import native from "../../common/native";
import Config from "../../config";
import tool from "../../common/tool";
import {MixpanelInstance} from '../../common/analytics';
import DeviceInfo from "react-native-device-info";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Button} from "react-native-elements";
import {getContacts} from "../../reducers/store/storeActions";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}


function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class OrderTransferThird extends Component {
  constructor(props: Object) {
    super(props);
    const if_reship = this.props.route.params.if_reship || 0;
    const headerType = this.props.route.params.headerType || 1;
    this.state = {
      selected: this.props.route.params.selectedWay,
      newSelected: [],
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      accessToken: this.props.global.accessToken,
      logistics: [],
      not_exist: [],
      if_reship: if_reship,
      showDateModal: false,
      dateValue: new Date(),
      mealTime: '',
      expectTime: this.props.route.params.expectTime,
      store_id: 0,
      vendor_id: 0,
      total_selected_ship: 0,
      is_mobile_visiable: false,
      reason: '',
      mobile: '',
      btn_visiable: false,
      maxPrice: 0,
      minPrice: 10001,
      wayNums: 0,
      testnum: {
        data: 1,
      },
      logisticFeeMap: [],
      workerList: [],
      worker: 0,
      headerType: headerType,
    };
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("deliverorder_page_view", {});
  }

  UNSAFE_componentWillMount(): void {
    this.fetchThirdWays();
    this.fetchWorker();
  }

  fetchWorker() {
    const {dispatch, global} = this.props;
    dispatch(getContacts(global.accessToken, this.state.storeId, (ok, msg, contacts) => {
      this.setState({workerList: contacts})
    }));
  }

  fetchThirdWays() {

    const version_code = DeviceInfo.getBuildNumber();
    showModal('加载中')
    const api = `/v1/new_api/delivery/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}&version=${version_code}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      let deliverys = []
      hideModal();
      if (tool.length(res.exist) > 0) {
        for (let i in res.exist) {
          if (res.exist[i].est) {
            res.exist[i].est.isChosed = false;
          }
          if (res.exist[i].store_est) {
            res.exist[i].store_est.isChosed = false;
          }
        }
      }
      const {currStoreId} = this.props.global;
      let {currVendorId} = tool.vendor(this.props.global);
      this.setState({
        logistics: res.exist,
        not_exist: res.not_exist,
        allow_edit_ship_rule: res.allow_edit_ship_rule,
        store_id: currStoreId,
        vendor_id: currVendorId,
      })

      let params = {
        store_id: currStoreId,
        vendor_id: currVendorId,
        total_available_ship: res.length,

      }
      this.priceFn();
      this.mixpanel.track("ship.list_to_call", params);
    }).catch(() => {
      hideModal();
    })
  }


  priceFn() {// 取最大价格和最小价格
    let logistics = this.state.logistics;
    this.state.logisticFeeMap = [];
    this.state.maxPrice = 0;
    this.state.minPrice = 10001;
    // logisticFeeMap: [{logisticCode: '',paidPartnerId: ''},{logisticCode: '',paidPartnerId: ''}]
    this.state.wayNums = 0;
    for (let i in logistics) {
      let obiItem = {};
      if (logistics[i].est && logistics[i].est.isChosed) {
        obiItem.logisticCode = logistics[i].logisticCode;
        obiItem.paidPartnerId = 0;
        this.state.wayNums += 1;
        this.state.maxPrice = logistics[i].est.delivery_fee > this.state.maxPrice ? logistics[i].est.delivery_fee : this.state.maxPrice
        this.state.minPrice = logistics[i].est.delivery_fee < this.state.minPrice ? logistics[i].est.delivery_fee : this.state.minPrice
      }
      if (logistics[i].store_est && logistics[i].store_est.isChosed) {
        obiItem.logisticCode = logistics[i].logisticCode;
        obiItem.paidPartnerId = -1;
        this.state.wayNums += 1
        this.state.maxPrice = logistics[i].store_est.delivery_fee > this.state.maxPrice ? logistics[i].store_est.delivery_fee : this.state.maxPrice
        this.state.minPrice = logistics[i].store_est.delivery_fee < this.state.minPrice ? logistics[i].store_est.delivery_fee : this.state.minPrice
      }
      if (obiItem.logisticCode) {
        this.state.logisticFeeMap.push(obiItem)
      }

    }

    this.setState({
      maxPrice: this.state.maxPrice,
      minPrice: this.state.minPrice,
      wayNums: this.state.wayNums
    })

  }

  onCallThirdShipRule() {
    let total_selected_ship = this.state.newSelected.length;
    let store_id = this.props.global.currStoreId;
    let vendor_id = this.props.global.config.vendor.id;
    let total_ok_ship = this.state.total_ok_ship;
    const self = this;
    const {orderId} = this.state;
    this.mixpanel.track("deliverorder_click", {});

    const api = `v1/new_api/delivery/can_call_third_deliverie/${orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(obj => {
      Alert.alert('提示', `${obj.content}`, [{
        text: `${obj.left_btn}`, onPress: () => {
          this.onCallThirdShip()
          this.mixpanel.track("ship.list_to_call.call", {
            store_id,
            vendor_id,
            total_selected_ship,
            total_ok_ship
          });
        }
      }, {text: `${obj.right_btn}`}])
    }).catch(reason => {
      if (reason.ok === false) {
        this.onCallThirdShip()
        this.mixpanel.track("ship.list_to_call.call", {
          store_id,
          vendor_id,
          total_selected_ship,
          total_ok_ship
        });
      }
    })
  }

  onCallThirdShip() {
    tool.debounces(() => {
      const self = this;
      const api = `/api/order_transfer_third?access_token=${this.state.accessToken}`;

      showModal('正在呼叫第三方配送，请稍等')
      const {
        orderId,
        storeId,
        newSelected,
        if_reship,
        mealTime,
        store_id,
        vendor_id,
        total_selected_ship,
        logisticFeeMap
      } = this.state;
      HttpUtils.post.bind(self.props.navigation)(api, {
        orderId: orderId,
        storeId: storeId,
        logisticCode: newSelected,
        if_reship: if_reship,
        mealTime: mealTime,
        logisticFeeMap
      }).then(res => {
        hideModal();
        this.mixpanel.track("ship.list_to_call.call", {
          store_id,
          vendor_id,
          total_selected_ship,
          total_ok_ship: res.count
        });
        self.props.route.params.onBack && self.props.route.params.onBack(res);
        self.props.navigation.goBack()
      }).catch((res) => {
        hideModal();
        if (res.obj.mobile && res.obj.mobile !== '') {
          this.setState({
            reason: res.reason,
            mobile: res.obj.mobile,
            btn_visiable: false,
            is_mobile_visiable: true
          })
        } else if (res.obj.mobile === '') {
          this.setState({
            reason: res.reason,
            btn_visiable: true,
            is_mobile_visiable: true
          })
        }
        this.mixpanel.track("ship.list_to_call.call", {
          store_id,
          vendor_id,
          total_selected_ship,
          total_ok_ship: 0
        });
        if (tool.length(res.obj.fail_code) > 0 && res.obj.fail_code === "insufficient-balance") {
          Alert.alert('发单余额不足，请及时充值', ``, [
            {
              text: '去充值', onPress: () => {
                this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL, {
                  onBack: (res) => {
                    this.showAlert(res)
                  }
                });
              }
            }
          ])
        }
      })
    }, 1000)
  }

  onSelectLogistic(code, event) {
    let selected = this.state.newSelected;
    let index = selected.indexOf(code);
    if (code === 10) {
      let diff_time = (new Date(this.state.expectTime)).getTime() - (new Date()).getTime();
      diff_time = Math.floor(diff_time / 1000 / 60);
      if (diff_time >= 60 && event.target.checked) {
        this.setState({
          showDateModal: true
        })
      } else {
        this.setState({
          mealTime: '',
          showDateModal: false
        })
      }
    }
    if (index >= 0) {
      selected.splice(index, 1)
    } else {
      selected.push(code)
    }
    this.setState({newSelected: selected, total_selected_ship: selected.length})
  }


  showAlert(res) {
    if (res) {
      Alert.alert('充值成功，是否立即发配送', ``, [
        {text: '取消发单'},
        {
          text: '立即发单', onPress: () => {
            this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL, {
              onBack: (res) => {
                if (res) {
                  this.onCallThirdShipRule();
                }
              }
            });
          }
        }
      ])
    } else {
      Alert.alert('充值失败', ``, [
        {text: '取消'},
        {
          text: '再次充值', onPress: () => {
            this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL, {
              onBack: (res) => {
                this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL, {
                  onBack: (res) => {
                    this.showAlert(res)
                  }
                });
              }
            });
          }
        }
      ])
    }
  }

  onConfirm() {
    this.setState({
      showDateModal: false
    })
    let time = this.state.dateValue
    let str = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
    this.setState({
      mealTime: str
    })
    showSuccess("设置成功！")
  }

  onRequestClose() {
    this.setState({
      showDateModal: false,
      mealTime: ''
    })
  }

  onPress(route, params = {}) {
    if (route === Config.ROUTE_GOODS_COMMENT) {
      native.toUserComments();
      return;
    }
    this.props.navigation.navigate(route, params);
  }

  showDatePicker() {
    return <List style={{marginTop: 12}}>
      <View style={styles.modalCancel}>
        <Text style={styles.modalCancelText}>预计出餐时间</Text>
      </View>
      <DatePickerView value={this.state.dateValue} minDate={new Date()}
                      onChange={(value) => this.setState({dateValue: value})}>
      </DatePickerView>
      <TouchableOpacity onPress={() => {
        this.onConfirm()
      }} style={styles.modalCancel1}>
        <View>
          <Text style={{
            color: "#59b26a",
            fontSize: pxToDp(40)
          }}>确&nbsp;&nbsp;&nbsp;&nbsp;认</Text>
        </View>
      </TouchableOpacity>
    </List>
  }

  closeDialog() {
    this.setState({
      is_mobile_visiable: false
    })
  }

  onTransferSelf() {
    if (!this.state.worker > 0) {
      ToastLong('请选择员工');
      return;
    }
    const api = `/api/order_transfer_self?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.state.orderId,
      worker_id: this.state.worker,
    }).then(res => {
      ToastShort('操作成功');
      this.props.route.params.onBack && this.props.route.params.onBack(res);
      this.props.navigation.goBack()
    })
  }


  render() {
    let {allow_edit_ship_rule, store_id, vendor_id, reason, mobile, btn_visiable, is_mobile_visiable} = this.state
    return (
      <View style={{flexGrow: 1}}>

        <FetchView navigation={this.props.navigation} onRefresh={this.fetchThirdWays.bind(this)}/>
        {this.renderHeader()}

        <If condition={tool.length(this.state.logistics) > 0 && this.state.headerType === 1}>
          <ScrollView style={{flex: 1}}>
            {this.renderContent()}
            <If condition={!tool.length(this.state.logistics) > 0}>
              <EmptyData placeholder={'无可用配送方式'}/>
            </If>
            {this.renderList()}
            <If condition={tool.length(this.state.not_exist) > 0}>
              {this.renderNoList()}
            </If>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginRight: pxToDp(15),
                marginBottom: pxToDp(300)
              }}>
              {allow_edit_ship_rule && <TouchableOpacity onPress={() => {
                this.onPress(Config.ROUTE_STORE_STATUS)
                this.mixpanel.track("ship.list_to_call.to_settings", {store_id, vendor_id});
              }} style={{flexDirection: "row", alignItems: "center"}}>
                <Image source={require("../../img/My/shezhi_.png")} style={{width: 12, height: 12}}/>
                <Text style={{fontSize: 12, color: '#999999'}}>【自动呼叫配送】</Text>
              </TouchableOpacity>}
              {allow_edit_ship_rule && <TouchableOpacity onPress={() => {
                Alert.alert('温馨提示', '  如果开启【自动呼叫配送】，来单后，将按价格从低到高依次呼叫您选择的配送平台；只要一个骑手接单，其他配送呼叫自动撤回。告别手动发单，减少顾客催单。', [
                  {text: '确定'}
                ])
              }}>
                <Image
                  source={require("../../img/My/help.png")}
                  style={{width: pxToDp(30), height: pxToDp(30), marginLeft: pxToDp(15)}}
                />
              </TouchableOpacity>
              }
            </View>
            <Dialog visible={this.state.showDateModal} onRequestClose={() => this.onRequestClose()}>
              {this.showDatePicker()}
            </Dialog>
            <Modal
              visible={is_mobile_visiable}
              onRequestClose={() => this.closeDialog()}
              animationType={'slide'}
              transparent={true}
            >
              <View style={styles.modalBackground}>
                <View style={[styles.container]}>
                  <TouchableOpacity onPress={() => {
                    this.closeDialog()
                  }} style={{position: "absolute", right: "3%", top: "10%"}}>
                    <Image
                      source={require("../../img/My/mistake.png")}
                      style={{width: pxToDp(45), height: pxToDp(45), marginRight: pxToDp(10)}}/>
                  </TouchableOpacity>
                  <Text style={{fontWeight: "bold", fontSize: pxToDp(32)}}>提示</Text>
                  <View style={[styles.container1]}>
                    <Text style={{fontSize: pxToDp(26)}}>{reason}
                      <TouchableOpacity onPress={() => {
                        native.dialNumber(mobile)
                      }}><Text style={{color: colors.main_color}}>{mobile}</Text></TouchableOpacity>
                    </Text>
                  </View>
                  {
                    btn_visiable && <View style={styles.btn1}>
                      <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                                onPress={() => {
                                                                  this.setState({is_mobile_visiable: false})
                                                                }}><Text
                        style={styles.btnText}>知道了</Text></TouchableOpacity></View>
                    </View>
                  }
                </View>
              </View>
            </Modal>
          </ScrollView>
        </If>
        {this.state.headerType !== 1 ? this.renderTransfer() : null}
        {this.renderBtn()}
      </View>
    )
  }

  renderHeader() {
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.fontColor,
      }}>
        <Text
          onPress={() => {
            this.setState({
              headerType: 1,
            })
          }}
          style={this.state.headerType === 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>配送平台</Text>
        <Text
          onPress={() => {
            this.setState({
              headerType: 2,
            })
          }}
          style={this.state.headerType === 2 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>自配送</Text>
      </View>)
  }

  renderTransfer() {
    return (
      <ScrollView style={{flex: 1, padding: pxToDp(20)}}>
        <View style={{backgroundColor: colors.white, borderRadius: pxToDp(15)}}>
          {this.renderWorkerList()}
        </View>
      </ScrollView>
    )
  }

  renderWorkerList() {
    if (!this.state.workerList.length > 0) {
      return;
    }
    return (
      <For of={this.state.workerList} index="i" each="info">
        <TouchableOpacity onPress={() => {
          this.setState({
            worker: info.id
          })
        }}>
          <View style={info.id === this.state.worker ? styles.check1 : styles.check}>
            <View style={{width: 20, height: 20, marginRight: pxToDp(30)}}>
              {info.id === this.state.worker ? <Image
                  source={require("../../img/My/correct.png")}
                  style={{
                    width: pxToDp(40),
                    height: pxToDp(40),
                    marginRight: pxToDp(10)
                  }}/> :
                <Ionicons name={'radio-button-off-outline'}
                          style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
            </View>
            <Text style={{
              fontSize: 14,
              lineHeight: pxToDp(42),
            }}>{info.label}-{info.mobile}</Text>
          </View>
        </TouchableOpacity>
      </For>
    )
  }

  renderContent() {
    return (
      <View style={styles.header}>
        <Text style={{color: colors.fontGray}}>一方先接单后，另一方会被取消</Text>
      </View>
    )
  }


  renderList() {
    const {logistics} = this.state;
    let item = [];
    if (tool.length(logistics) > 0) {
      for (let i in logistics) {
        let delivery = logistics[i];
        item.push(
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: pxToDp(15),
              marginTop: pxToDp(10),
              paddingBottom: pxToDp(20),
              paddingHorizontal: pxToDp(20)
            }}>

            <View style={{
              flexDirection: 'row',
              height: pxToDp(70)
            }}>
              <Text style={{fontSize: 16, lineHeight: pxToDp(70)}}>{delivery.logisticName}</Text>
              <View style={{flex: 1}}></View>
              <View style={{marginTop: pxToDp(5)}}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    {delivery.tips && delivery.tips[1] && <View style={{
                      backgroundColor: colors.main_color,
                      borderRadius: pxToDp(6),
                      width: pxToDp(100),
                    }}>
                      <Text style={{
                        color: colors.white,
                        padding: pxToDp(8),
                        fontSize: 8
                      }}>{delivery.tips[1]}</Text>
                    </View>}
                    {delivery.tips && delivery.tips[0] && <View style={{
                      borderRadius: pxToDp(6),
                      backgroundColor: colors.main_color,
                      marginLeft: pxToDp(20),
                    }}>
                      <Text style={{
                        color: colors.white,
                        textAlign: 'right',
                        padding: pxToDp(8),
                        fontSize: 8
                      }}>{delivery.tips[0]}</Text>
                    </View>}
                  </View>
                </View>

              </View>
            </View>

            <View>
              <If condition={delivery.est}>
                {this.renderItem(delivery.est, i, delivery)}
              </If>
              <If condition={delivery.store_est}>
                {this.renderItem(delivery.store_est, i, delivery)}
              </If>
            </View>
          </View>
        )
      }
    }
    return (
      <View style={{padding: pxToDp(20), backgroudColor: colors.back_color}}>
        {item}
      </View>
    )
  }

  renderItem(info, i, delivery) {
    return (
      <TouchableOpacity onPress={() => {
        if (info.error_msg) {
          return false;
        }
        this.state.logistics[i].est.isChosed = !this.state.logistics[i].est.isChosed;
        if (this.state.logistics[i].store_est) {
          this.state.logistics[i].store_est.isChosed = false;
        }
        this.setState({
          logistics: this.state.logistics
        })
        this.priceFn();
      }}>
        <View style={info.isChosed ? styles.check1 : styles.check}>
          <If condition={!info.error_msg}>
            <View style={{width: 20, height: 20, marginRight: pxToDp(30)}}>
              {info.isChosed ? <Image
                  source={require("../../img/My/correct.png")}
                  style={{
                    width: pxToDp(40),
                    height: pxToDp(40),
                    marginRight: pxToDp(10)
                  }}/> :
                <Ionicons name={'radio-button-off-outline'}
                          style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
            </View>
          </If>
          <Text style={{
            fontSize: 14,
            lineHeight: pxToDp(42),
          }}> {info.name} {delivery.logisticDesc} </Text>
          <View style={{flex: 1}}></View>
          {info.error_msg ? <View style={{
            justifyContent: "space-around",
            // alignItems: 'flex-end'
          }}>
            <TouchableOpacity style={{
              marginTop: pxToDp(10),
              flexDirection: "row",
            }} onPress={() => {
              Alert.alert('错误信息', `${info.error_msg}`, [
                {text: '知道了'}
              ])
            }}>
              {tool.length(info.error_msg) > 15 ? <Image
                source={require("../../img/My/help.png")}
                style={{
                  width: pxToDp(30),
                  height: pxToDp(30),
                  marginLeft: pxToDp(15)
                }}
              /> : null}
              <Text
                style={{fontSize: 12}}>{tool.length(info.error_msg) > 15 ? '无法发单' : info.error_msg} </Text>
            </TouchableOpacity>
          </View> : null}
          {!info.error_msg && info ? <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: pxToDp(42),
              textAlign: "center"
            }}>{info.delivery_fee} </Text> : null}
          {info && !info.error_msg && info.coupons_amount > 0 ?
            <Text style={{
              fontSize: 9,
              color: colors.color666,
              lineHeight: pxToDp(42),
              marginLeft: pxToDp(20),
            }}>已减{info.coupons_amount}元 </Text> : null}

          {!info.error_msg && info && !info.coupons_amount > 0 ?
            <Text style={{
              fontSize: 12,
              color: colors.color666,
              lineHeight: pxToDp(42),
            }}> 元 </Text> : null}
        </View>
      </TouchableOpacity>
    )
  }

  renderNoList() {
    const {not_exist} = this.state;
    let item = [];
    if (tool.length(not_exist) > 0) {
      for (let i in not_exist) {
        let delivery = not_exist[i];
        item.push(
          <View style={{
            flexDirection: "row",
            marginHorizontal: pxToDp(20),
            padding: pxToDp(20),
            backgroundColor: colors.white,
            justifyContent: "space-between",
            borderRadius: pxToDp(15),
            marginTop: pxToDp(10),
            alignItems: "center",
            // borderBottomWidth: pxToDp(1),
          }} key={i}>
            <Text style={{fontSize: pxToDp(35)}}> {delivery.logisticName} </Text>
            <Text onPress={() => {
              this.onPress(Config.ROUTE_APPLY_DELIVERY, {delivery_id: delivery.logisticCode})
            }}
                  style={delivery.open_status === 0 ? [styles.status_err] : [styles.status_err1]}>{delivery.open_status === 0 ? "申请开通" : '查看进度'}</Text>
          </View>
        )
      }
    }
    return (
      <View style={{marginBottom: pxToDp(20)}}>
        <Text style={{fontSize: 14, marginBottom: pxToDp(10), marginLeft: pxToDp(35)}}>待开通配送账号</Text>
        <View>
          {item}
        </View>
      </View>
    )
  }

  renderBtn() {
    if (this.state.headerType === 1) {
      return (
        <View
          style={{backgroundColor: colors.white, flexDirection: 'row', padding: pxToDp(15)}}>
          <View style={{marginLeft: pxToDp(25)}}>
            <Text style={{fontSize: 10}}>已选<Text
              style={{color: colors.main_color}}>{this.state.wayNums}</Text>个配送</Text>
            <If condition={this.state.minPrice < 10000 && this.state.minPrice !== this.state.maxPrice}>
              <View style={{flexDirection: 'row', marginTop: pxToDp(10)}}>
                <Text style={{fontSize: 26}}>{this.state.minPrice}~{this.state.maxPrice} </Text>
                <Text style={{fontSize: 16, marginTop: pxToDp(20)}}>元</Text>
              </View>
            </If>
            <If condition={this.state.minPrice > 10000 || this.state.minPrice === this.state.maxPrice}>
              <View style={{flexDirection: 'row', marginTop: pxToDp(10)}}>
                <Text style={{fontSize: 26}}>{this.state.maxPrice} </Text>
                <Text style={{fontSize: 16, marginTop: pxToDp(20)}}>元</Text>
              </View>
            </If>
          </View>
          <View style={{flex: 1}}></View>
          <Button title={'呼叫配送'}
                  onPress={() => {
                    this.onCallThirdShipRule()
                  }}
                  buttonStyle={{
                    marginTop: pxToDp(10),
                    width: pxToDp(200),
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </View>
      )
    } else {
      return (
        <Button title={'发起配送'}
                onPress={() => {
                  Alert.alert('提醒', '自己送后系统将不再分配骑手，确定自己送吗?', [
                    {
                      text: '确定',
                      onPress: () => this.onTransferSelf(),
                    }, {
                      text: '取消'
                    }
                  ])
                }}
                buttonStyle={{
                  marginBottom: pxToDp(40),
                  marginHorizontal: pxToDp(30),
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      )
    }

  }


}

const styles = StyleSheet.create({
  header: {
    height: pxToDp(40),
    marginTop: pxToDp(30),
    alignItems: 'center',
    justifyContent: 'center'
  },
  header_text: {
    height: 40,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.main_color,
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 40,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color,
  },
  modalCancel: {
    width: '100%',
    height: pxToDp(80),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(20)
  },
  modalCancel1: {
    width: '100%',
    height: pxToDp(80),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(20)
  },
  modalCancelText: {
    color: 'black',
    fontSize: pxToDp(40)
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    padding: pxToDp(10),
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    // padding: pxToDp(3),
    color: colors.f7,
    marginRight: pxToDp(30),
  },

  status_err1: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    padding: pxToDp(10),
    backgroundColor: colors.color666,
    borderRadius: pxToDp(5),
    // padding: pxToDp(3),
    color: colors.f7,
    marginRight: pxToDp(30),
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: pxToDp(10),
    padding: pxToDp(20),
    alignItems: 'center'
  },
  container1: {
    width: '95%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    padding: pxToDp(20),
    justifyContent: "flex-start",
    borderTopWidth: pxToDp(1),
    borderTopColor: "#CCCCCC"
  },
  btnText: {
    height: 40,
    backgroundColor: colors.main_color,
    color: 'white',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    borderRadius: pxToDp(10)
  },
  btn1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: pxToDp(15),
    marginBottom: pxToDp(10)
  },
  check: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    margin: pxToDp(10),
  },
  check1: {
    flexDirection: 'row',
    borderRadius: Platform.OS === 'ios' ? pxToDp(15) : pxToDp(20),
    borderColor: colors.main_color,
    backgroundColor: '#B2EAD7',
    opacity: 0.7,
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    margin: pxToDp(10),
    paddingVertical: pxToDp(10),
  },
});

export default connect(mapStateToProps)(OrderTransferThird)

