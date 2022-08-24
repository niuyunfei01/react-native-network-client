import React, {Component} from 'react'
import {Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import {connect} from "react-redux";
import pxToDp from "../../pubilc/util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import EmptyData from "../common/component/EmptyData";
import colors from "../../pubilc/styles/colors";
import {hideModal, showModal, ToastLong} from "../../pubilc/util/ToastUtils";
import native from "../../pubilc/util/native";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import {MixpanelInstance} from '../../pubilc/util/analytics';
import DeviceInfo from "react-native-device-info";
import {Button, Slider} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import JbbModal from "../../pubilc/component/JbbModal";
import {TextArea} from "../../weui";
import dayjs from "dayjs";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";

function mapStateToProps(state) {
  return {
    global: state.global,
    device: state.device
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

const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}//记录耗时的对象


class OrderTransferThird extends Component {
  constructor(props: Object) {
    super(props);
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    const if_reship = this.props.route.params.if_reship || 0;
    const headerType = this.props.route.params.headerType || 1;
    this.state = {
      selected: this.props.route.params.selectedWay,
      newSelected: [],
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      addressId: this.props.route.params.addressId ? this.props.route.params.addressId : '',
      accessToken: this.props.global.accessToken,
      logistics: [],
      logistics_error: [],
      not_exist: [],
      if_reship: if_reship,
      isLoading: true,
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
      headerType: headerType,
      showDeliveryModal: false,
      weight: 0,
      weight_max: 0,
      weight_min: 0,
      weight_step: 0,
      showErr: false,
      is_merchant_ship: 0,
      merchant_reship_tip: '',
      showContentModal: false,
      remark: '',
      datePickerType: 'today',
      datePickerList: [],
      datePickerOther: [],
      callDelivery_Day: dayjs(new Date()).format('YYYY-MM-DD'),
      callDelivery_Time: `${new Date().getHours()}:${new Date().getMinutes()}`,
      dateArray: [],
      set_default_product_weight: false,
    };
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("deliverorder_page_view", {});
  }

  fetchThirdWays = () => {
    const version_code = DeviceInfo.getBuildNumber();
    this.setState({
      isLoading: true
    })
    showModal('加载中')
    const api = `/v1/new_api/delivery/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}&version=${version_code}&weight=${this.state.weight}`;
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      let deliverys = []
      const {obj} = res
      timeObj.method.push({
        interfaceName: api,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchThirdWays',
        executeTime: res.endTime - res.startTime
      })
      hideModal();
      if (tool.length(obj.exist) > 0) {
        for (let i in obj.exist) {
          let is_push = false
          if (obj.exist[i].est && !obj.exist[i].est.error_msg) {
            obj.exist[i].est.isChosed = false;
            is_push = true
          } else {
            delete obj.exist[i].est;
          }
          if (obj.exist[i].store_est && !obj.exist[i].store_est.error_msg) {
            obj.exist[i].store_est.isChosed = false;
            is_push = true
          } else {
            delete obj.exist[i].store_est;
          }

          if (is_push) deliverys.push(obj.exist[i])
        }
      }
      const {currStoreId} = this.props.global;
      let {currVendorId} = tool.vendor(this.props.global);
      this.setState({
        logistics: deliverys,
        not_exist: obj.not_exist,
        allow_edit_ship_rule: obj.allow_edit_ship_rule,
        store_id: currStoreId,
        vendor_id: currVendorId,
        weight: obj.weight,
        weight_max: obj.weight_max,
        weight_min: obj.weight_min,
        weight_step: obj.weight_step,
        logistics_error: obj.error_ways,
        is_merchant_ship: obj.is_merchant_ship,
        merchant_reship_tip: obj.merchant_reship_tip,
        isLoading: false,
      })

      let params = {
        store_id: currStoreId,
        vendor_id: currVendorId,
        total_available_ship: obj.length,

      }
      this.priceFn();
      this.mixpanel.track("ship.list_to_call", params);
    }).catch((res) => {
      timeObj.method.push({
        interfaceName: api,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchThirdWays',
        executeTime: res.endTime - res.startTime
      })
      hideModal();
      this.setState({
        isLoading: false,
      })
    })
  }

  componentDidMount() {
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ""
    timeObj.method[0].methodName = "componentDidMount"
    const {deviceInfo} = this.props.device
    const {currStoreId, currentUser, accessToken, config} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderTransferThird"
    timeObj['is_record_request_monitor'] = config.is_record_request_monitor
    calcMs(timeObj, accessToken)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (timeObj.method.length > 0) {
      const endTime = getTime()
      const startTime = timeObj.method[0].startTime
      timeObj.method.push({
        interfaceName: '',
        executeStatus: 'success',
        startTime: startTime,
        endTime: endTime,
        methodName: 'componentDidUpdate',
        executeTime: endTime - startTime
      })
      const duplicateObj = {...timeObj}
      timeObj.method = []
      calcMs(duplicateObj, this.props.global.accessToken)
    }
  }

  priceFn = () => {// 取最大价格和最小价格
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

  onCallThirdShipRule = () => {
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

  onCallThirdShip = () => {
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
        logisticFeeMap,
        addressId,
        weight
      } = this.state;
      HttpUtils.post.bind(self.props.navigation)(api, {
        orderId: orderId,
        storeId: storeId,
        logisticCode: newSelected,
        if_reship: if_reship,
        mealTime: mealTime,
        logisticFeeMap,
        address_id: addressId,
        remark: this.state.remark,
        weight: weight
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


  showAlert = (res) => {
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

  onRequestClose = () => {
    this.setState({
      showDateModal: false,
      mealTime: ''
    })
  }

  onPress = (route, params = {}) => {
    if (route === Config.ROUTE_GOODS_COMMENT) {
      native.toUserComments();
      return;
    }
    this.props.navigation.navigate(route, params);
  }


  closeDialog = (res) => {
    this.setState({
      is_mobile_visiable: false
    })
  }

  timeSlot = (step, isNow) => {
    let date = new Date()
    let timeArr = []
    let slotNum = 24 * 60 / step
    if (!isNow) {
      date.setHours(0, 0, 0, 0)
    } else {
      slotNum = (24 - date.getHours()) * 60 / step - Math.ceil(date.getMinutes() / 10)
      date.setHours(date.getHours(), date.getMinutes() - date.getMinutes() % 10 + 10, 0, 0)
    }
    for (let f = 0; f < slotNum; f++) {
      let time = new Date(Number(date.getTime()) + Number(step * 60 * 1000 * f))
      let hour = '', sec = '';
      time.getHours() < 10 ? hour = '0' + time.getHours() : hour = time.getHours()
      time.getMinutes() < 10 ? sec = '0' + time.getMinutes() : sec = time.getMinutes()
      timeArr.push({label: hour + ':' + sec})
      if (isNow && timeArr.findIndex((item) => item.label === '立即发单')) {
        timeArr.unshift({label: '立即发单'})
      }
    }
    return timeArr
  }

  createDatePickerArray = () => {
    Date.prototype.addDays = function (days) {
      let dat = new Date(this.valueOf())
      dat.setDate(dat.getDate() + days);
      return dat;
    }

    function getDates(startDate, stopDate) {
      let dateArray = [];
      let currentDate = startDate;
      while (currentDate <= stopDate) {
        dateArray.push(dayjs(currentDate).format('YYYY-MM-DD'))
        currentDate = currentDate.addDays(1);
      }
      return dateArray;
    }

    return getDates(new Date(), (new Date()).addDays(2))
  }
  update_default_product_weight = () => {
    if (!this.state.set_default_product_weight) return null;
    let {currStoreId, accessToken} = this.props.global;
    const api = `/v1/new_api/stores/update_default_product _weight?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api, {store_id: currStoreId, weight: this.state.weight}, true).then(res => {
      ToastLong("设置默认重量成功");
    })
  }

  render() {
    let {allow_edit_ship_rule, store_id, vendor_id} = this.state
    return (
      <View style={{flexGrow: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchThirdWays.bind(this)}/>

        <ScrollView style={{flex: 1}}>
          {this.renderContent()}
          {!tool.length(this.state.logistics) > 0 && !this.state.isLoading ?
            <EmptyData containerStyle={{marginBottom: 40}} placeholder={'无可用配送方式'}/> : this.renderList()}
          {this.renderErrorList()}
          {this.renderNoList()}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              marginRight: pxToDp(15),
              marginBottom: pxToDp(300)
            }}>

            <If condition={allow_edit_ship_rule}>
              <TouchableOpacity onPress={() => {
                this.onPress(Config.ROUTE_STORE_STATUS)
                this.mixpanel.track("ship.list_to_call.to_settings", {store_id, vendor_id});
              }} style={{flexDirection: "row", alignItems: "center"}}>
                <Entypo name='cog'
                        style={{fontSize: 18, color: colors.fontColor, marginRight: 4}}/>
                <Text style={{fontSize: 12, color: '#999999'}}>【自动呼叫配送】</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                this.mixpanel.track('自动发单说明')
                Alert.alert('温馨提示', '  如果开启【自动呼叫配送】，来单后，将按价格从低到高依次呼叫您选择的配送平台；只要一个骑手接单，其他配送呼叫自动撤回。告别手动发单，减少顾客催单。', [
                  {text: '确定'}
                ])
              }}>
                <Entypo name='help-with-circle'
                        style={{fontSize: 18, color: colors.main_color, marginRight: 4}}/>
              </TouchableOpacity>
            </If>
          </View>
        </ScrollView>
        {this.renderBtn()}
        {this.renderModal()}
      </View>
    )
  }


  renderContent = (res) => {
    let {if_reship, is_merchant_ship, merchant_reship_tip} = this.state
    return (
      <View style={styles.header}>
        <Text style={{color: colors.fontGray}}>一方先接单后，另一方会被取消</Text>
        <If condition={if_reship !== undefined && if_reship === 1 && is_merchant_ship === 1}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <FontAwesome5 name={'exclamation-circle'} size={14} style={{marginRight: 7, color: '#F32B2B'}}/>
            <Text style={{color: colors.fontGray}}>{merchant_reship_tip}</Text>
          </View>
        </If>
      </View>
    )
  }


  renderList = () => {
    const {logistics} = this.state;
    let item = [];
    if (tool.length(logistics) > 0) {
      for (let i in logistics) {
        let delivery = logistics[i];
        item.push(
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 8,
              paddingHorizontal: 6,
              margin: 10,
              marginVertical: 4,
            }} key={i}>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 16,
                padding: 10,
                color: colors.color333,
                fontWeight: 'bold'
              }}>{delivery.logisticName}-{delivery.logisticDesc} </Text>

              <View style={{marginTop: pxToDp(5)}}>
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
                    }}>{delivery.tips[1]} </Text>
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
                    }}>{delivery.tips[0]} </Text>
                  </View>}
                </View>
              </View>
            </View>

            <View>
              <If condition={delivery.est}>
                {this.renderItem(delivery.est, i)}
              </If>
              <If condition={delivery.store_est}>
                {this.renderItem(delivery.store_est, i)}
              </If>
            </View>
          </View>
        )
      }
    }
    return (
      <View style={{marginVertical: 8,}}>
        {item}
      </View>
    )
  }

  renderItem = (info, i) => {
    return (
      <TouchableOpacity style={{borderTopWidth: pxToDp(1), borderColor: colors.colorEEE}} onPress={() => {
        if (info.error_msg) {
          return false;
        }
        if (info.name === '外送帮账号') {
          let isChosed = this.state.logistics[i].est.isChosed ? this.state.logistics[i].est.isChosed : false;
          this.state.logistics[i].est.isChosed = !isChosed;
          if (this.state.logistics[i].store_est) {
            this.state.logistics[i].store_est.isChosed = false;
          }
        } else {
          let isChosed = this.state.logistics[i].store_est.isChosed ? this.state.logistics[i].store_est.isChosed : false;
          this.state.logistics[i].store_est.isChosed = !isChosed;
          if (this.state.logistics[i].est) {
            this.state.logistics[i].est.isChosed = false;
          }
        }
        this.setState({
          logistics: this.state.logistics
        })
        this.priceFn();
      }}>
        <View style={styles.check}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            fontWeight: 'bold',
            lineHeight: 56,
          }}> {info.name} </Text>

          <View style={{flex: 1}}></View>

          <View style={{alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  lineHeight: pxToDp(42)
                }}>
                预估
              </Text>
              <Text style={{fontWeight: 'bold', fontSize: 20, color: colors.color333,}}> {info.delivery_fee} </Text>
            </View>

            {info && info.coupons_amount > 0 ?
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    lineHeight: pxToDp(42),
                    color: colors.color999
                  }}>
                  已优惠
                </Text>
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: 12,
                  color: colors.warn_red
                }}> {info.coupons_amount} </Text>
              </View>
              : null}
          </View>

          <View style={{width: 20, height: 20, marginVertical: pxToDp(15)}}>
            {info.isChosed ?
              <View style={{
                borderRadius: 10,
                width: 20,
                height: 20,
                backgroundColor: colors.main_color,
                justifyContent: "center",
                alignItems: 'center',
              }}>
                <Entypo name='check' style={{
                  fontSize: pxToDp(25),
                  color: colors.white,
                }}/></View> :
              <Entypo name='circle' style={{fontSize: 20, color: colors.fontGray}}/>}
          </View>

        </View>
      </TouchableOpacity>
    )
  }

  renderNoList = () => {
    const {not_exist} = this.state;
    let item = [];
    if (tool.length(not_exist) > 0) {
      for (let i in not_exist) {
        let delivery = not_exist[i];
        item.push(
          <View style={{
            flexDirection: "row",
            marginHorizontal: 10,
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
                  style={delivery.open_status === 0 ? [styles.status_err] : [styles.status_err1]}>{delivery.open_status === 0 ? "申请开通" : '查看进度'} </Text>
          </View>
        )
      }
      return (
        <View style={{marginBottom: pxToDp(20)}}>
          <Text style={{
            fontSize: 14,
            marginBottom: pxToDp(10),
            marginLeft: pxToDp(35),
            color: colors.color333,
            fontWeight: 'bold'
          }}>待开通配送账号</Text>
          <View>
            {item}
          </View>
        </View>
      )
    }
    return null;
  }

  renderErrorList = () => {
    const {logistics_error} = this.state;
    if (tool.length(logistics_error) > 0) {
      return (
        <View style={{
          backgroundColor: colors.white,
          borderRadius: pxToDp(15),
          padding: pxToDp(20),
          margin: 10,
          marginTop: 0,
        }}>
          <TouchableOpacity onPress={() => {
            this.setState({showErr: !this.state.showErr})
          }} style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: this.state.showErr ? pxToDp(20) : 0
          }}>
            <Text style={{fontSize: 17, color: colors.color333, fontWeight: 'bold'}}>不能发单配送</Text>
            {this.state.showErr ?
              <Entypo name='chevron-thin-down' style={{fontSize: 20, color: colors.color333}}/>
              :
              <Entypo name='chevron-thin-right' style={{fontSize: 20, color: colors.color333}}/>}
          </TouchableOpacity>
          <If condition={this.state.showErr}>
            <For of={logistics_error} index="idx" each='item'>
              <View style={{
                flexDirection: 'row',
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: colors.fontGray,
                borderTopWidth: pxToDp(1),
                paddingVertical: pxToDp(20)
              }}>
                <Text style={{fontSize: 14}}>{item.logisticName} </Text>

                <TouchableOpacity style={{
                  flexDirection: "row",
                  justifyContent: 'center',
                  alignItems: 'center',
                }} onPress={() => {
                  this.mixpanel.track('不能发单配送说明')
                  Alert.alert('错误信息', `${item.error_msg}`, [
                    {text: '知道了'}
                  ])
                }}>
                  {tool.length(item.error_msg) > 15 ?
                    <Entypo name='help-with-circle'
                            style={{fontSize: 18, color: colors.main_color, marginRight: 4}}/> : null}
                  <Text style={{fontSize: 12}}>{tool.length(item.error_msg) > 15 ? '不能发单' : item.error_msg} </Text>
                </TouchableOpacity>

              </View>
            </For>
          </If>
        </View>
      )
    }
    return null
  }


  renderBtn = () => {
    return (
      <View>

        <View style={{

          backgroundColor: colors.white,
          flexDirection: 'row',
          padding: pxToDp(20),
          borderTopColor: '#999999',
          borderTopWidth: pxToDp(1)
        }}>

          <TouchableOpacity onPress={() => {
            this.mixpanel.track('预约配送')
            this.setState({showDateModal: true, datePickerList: this.timeSlot(10, true)})
          }} style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <Text style={{textAlign: 'right', fontSize: pxToDp(30), fontWeight: 'bold', marginRight: 6}}>
              呼叫时间
            </Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 18}}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({showContentModal: true})
            this.mixpanel.track('设置备注')
          }} style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftColor: '#999999',
            borderLeftWidth: pxToDp(1),
            flex: 1
          }}>
            <Text style={{textAlign: 'right', fontSize: pxToDp(30), fontWeight: 'bold', marginRight: 6}}>
              {this.state.remark ? "已备注" : "写备注"}
            </Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 18}}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({showDeliveryModal: true, set_default_product_weight: false})
            this.mixpanel.track('设置重量')
          }} style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftColor: '#999999',
            borderLeftWidth: pxToDp(1),
            flex: 1
          }}>
            <Text
              style={{
                textAlign: 'right',
                fontSize: pxToDp(30),
                fontWeight: 'bold',
                marginRight: 6
              }}>{this.state.weight}千克 </Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 18}}/>
          </TouchableOpacity>

        </View>


        <View
          style={{
            backgroundColor: colors.white,
            flexDirection: 'row',
            padding: pxToDp(15),
            borderTopColor: '#999999',
            borderTopWidth: pxToDp(1)
          }}>
          <View style={{marginLeft: pxToDp(25)}}>
            <Text style={{fontSize: 10}}>已选<Text
              style={{color: colors.main_color}}>{this.state.wayNums} </Text>个配送</Text>
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
      </View>
    )
  }

  renderDatePicker = () => {
    let {datePickerType, datePickerList, dateArray, datePickerOther, callDelivery_Day, callDelivery_Time} = this.state
    let mealtime = callDelivery_Day + ' ' + callDelivery_Time
    return (
      <View>
        <View style={styles.datePickerHead}>
          <Text style={styles.callTime}>呼叫时间</Text>
          <Text style={styles.sureBtn} onPress={() => {
            this.setState({dateValue: mealtime, mealTime: mealtime, showDateModal: false})
          }}>确定</Text>
        </View>
        <Text style={styles.dateMsg}>(选择预约时间后最终配送价格可能有变)</Text>
        <View style={{flexDirection: "row", justifyContent: "space-evenly"}}>
          <View style={{flexDirection: "column", justifyContent: "space-around", flex: 1}}>
            <TouchableOpacity style={datePickerType === 'today' ? styles.datePickerActive : styles.datePicker}
                              onPress={() => {
                                this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                                this.setState({
                                  datePickerType: 'today',
                                  callDelivery_Day: dayjs(new Date()).format('YYYY-MM-DD')
                                })
                              }}><Text
              style={datePickerType === 'today' ? styles.dateTextActive : styles.dateText}>今天</Text></TouchableOpacity>
            <TouchableOpacity style={datePickerType === 'tomorrow' ? styles.datePickerActive : styles.datePicker}
                              onPress={() => {
                                this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                                this.setState({
                                  datePickerType: 'tomorrow',
                                  callDelivery_Day: this.createDatePickerArray()[1],
                                  datePickerOther: this.timeSlot(10, false)
                                })
                              }}><Text
              style={datePickerType === 'tomorrow' ? styles.dateTextActive : styles.dateText}>明天</Text></TouchableOpacity>
            <TouchableOpacity
              style={datePickerType === 'after-tomorrow' ? styles.datePickerActive : styles.datePicker}
              onPress={() => {
                this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                this.setState({
                  datePickerType: 'after-tomorrow',
                  callDelivery_Day: this.createDatePickerArray()[2],
                  datePickerOther: this.timeSlot(10, false)
                })
              }}>
              <Text style={datePickerType === 'after-tomorrow' ? styles.dateTextActive : styles.dateText}>
                后天
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 3, height: 250}}>
            <ScrollView
              style={{flex: 1}}
              ref={(scrollView) => {
                this._scrollView = scrollView
              }}
              showsVerticalScrollIndicator={false}
              directionalLockEnabled={!false}
              scrollEventThrottle={16}
              bounces={false}
              onMomentumScrollEnd={(e) => {
                let offsetY = e.nativeEvent.contentOffset.y;
                let contentSizeHeight = e.nativeEvent.contentSize.height;
                let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height;
                if (offsetY + oriageScrollHeight >= contentSizeHeight) {
                  if (datePickerType === 'today') {
                    this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                    this.setState({
                      datePickerType: 'tomorrow',
                      callDelivery_Day: this.createDatePickerArray()[1],
                      datePickerOther: this.timeSlot(10, false)
                    })
                  } else if (datePickerType === 'tomorrow') {
                    this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                    this.createDatePickerArray()
                    this.setState({
                      datePickerType: 'after-tomorrow',
                      callDelivery_Day: this.createDatePickerArray()[2],
                      datePickerOther: this.timeSlot(10, false)
                    })
                  }
                }
              }}
            >
              <For of={datePickerType === 'today' ? datePickerList : datePickerOther} index="idx" each='item'>
                <TouchableOpacity
                  key={idx}
                  style={item.isChosed ? styles.datePickerItemActive : styles.datePickerItem}
                  onPress={() => {
                    let datePickerListCopy = datePickerType === 'today' ? datePickerList : datePickerOther
                    datePickerListCopy.forEach(checkedItem => {
                      checkedItem.isChosed = false
                    })
                    datePickerListCopy[idx].isChosed = true
                    if (datePickerType === 'today') {
                      this.setState({
                        datePickerList: datePickerListCopy
                      })
                    } else {
                      this.setState({
                        datePickerOther: datePickerListCopy
                      })
                    }
                    if (item.label !== '立即发单') {
                      this.setState({callDelivery_Time: item.label})
                    } else {
                      this.setState({
                        callDelivery_Time: `${new Date().getHours()}:${new Date().getMinutes()}`
                      }, () => {
                      })
                    }
                  }}>
                  <Text style={item.isChosed ? styles.dateTextActive : styles.dateText}>{item.label}</Text>
                  <View style={{width: 20, height: 20, marginVertical: pxToDp(15)}}>
                    {item.isChosed ?
                      <View style={styles.datePickerIcon}>
                        <Entypo name='check' style={{
                          fontSize: pxToDp(25),
                          color: colors.white,
                        }}/></View> :
                      <Entypo name='circle' style={{fontSize: 20, color: colors.fontGray}}/>}
                  </View>
                </TouchableOpacity>
              </For>
            </ScrollView>
          </View>
        </View>
      </View>
    )
  }

  renderModal = () => {
    let {reason, mobile, btn_visiable, is_mobile_visiable} = this.state
    return (
      <View>
        <JbbModal visible={this.state.showContentModal} onClose={() => this.setState({
          showContentModal: false,
        })} modal_type={'center'}>
          <View>
            <TouchableOpacity onPress={() => this.setState({
              showContentModal: false,
            })} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), color: colors.color333}}>配送备注</Text>
              <Text style={{fontWeight: 'bold', fontSize: 12, color: colors.warn_red, flex: 1}}>
                ·美团众包及达达暂不支持填写备注
              </Text>
              <Entypo name="circle-with-cross"
                      style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
            </TouchableOpacity>
            <TextArea
              value={this.state.remark}
              onChange={(remark) => {
                this.setState({remark})
              }}
              showCounter={false}
              defaultValue={'请输入备注信息'}
              underlineColorAndroid="transparent" //取消安卓下划线
              style={{
                borderWidth: 1,
                borderColor: colors.fontColor,
                marginTop: 12,
                height: 100,
              }}
            >
            </TextArea>

            <View style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: 20,
            }}>
              <Text
                onPress={() => {
                  this.setState({remark: '', showContentModal: false})
                }}
                style={{
                  height: 40,
                  width: "30%",
                  marginHorizontal: '10%',
                  fontSize: pxToDp(30),
                  textAlign: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlignVertical: 'center',
                  backgroundColor: 'gray',
                  color: 'white',
                  lineHeight: 40,
                }}>取消</Text>
              <Text
                onPress={() => {
                  this.setState({showContentModal: false})
                }}
                style={{
                  height: 40,
                  width: "30%",
                  marginHorizontal: '10%',
                  fontSize: pxToDp(30),
                  textAlign: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlignVertical: 'center',
                  backgroundColor: colors.main_color,
                  color: 'white',
                  lineHeight: 40,
                }}>确定</Text>
            </View>
          </View>
        </JbbModal>

        <JbbModal onClose={() => this.setState({showDateModal: false})} visible={this.state.showDateModal}
                  modal_type={'bottom'}>
          {this.renderDatePicker()}
        </JbbModal>

        <JbbModal onClose={() => this.closeDialog()} visible={is_mobile_visiable} modal_type={'center'}>
          <View>
            <Text style={{fontWeight: "bold", fontSize: pxToDp(32)}}>提示</Text>
            <View style={[styles.container1]}>
              <Text style={{fontSize: pxToDp(26)}}>{reason}
                <TouchableOpacity onPress={() => {
                  native.dialNumber(mobile)
                }}><Text style={{color: colors.main_color}}>{mobile} </Text></TouchableOpacity>
              </Text>
            </View>
            <If condition={btn_visiable}>
              <View style={styles.btn1}>
                <View style={{flex: 1}}>
                  <TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                    onPress={() => {
                                      this.setState({is_mobile_visiable: false})
                                    }}>
                    <Text
                      style={styles.btnText}>知道了</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </If>

          </View>
        </JbbModal>

        <JbbModal visible={this.state.showDeliveryModal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                  onClose={() => this.setState({
                    showDeliveryModal: false,
                  })} modal_type={'bottom'}>
          <View>
            <View style={{
              flexDirection: 'row',
              padding: 12,
              justifyContent: 'space-between',
              borderBottomWidth: 0.5,
              borderColor: '#EEEEEE'
            }}>

              <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
                商品重量
              </Text>
              <Entypo onPress={() => this.setState({
                showDeliveryModal: false,
              })} name="circle-with-cross"
                      style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
            </View>
            <View style={{
              paddingHorizontal: 12, paddingVertical: 5,
            }}>
              <Text style={{color: colors.color999, fontSize: 11,}}>
                默认显示的重量为您外卖平台维护的商品重量总和，如有不准，可手动调整重量
              </Text>
              <View style={{
                flexDirection: 'row',
                marginTop: 20,
                justifyContent: 'space-between',
              }}>
                <Text style={{color: colors.color333, fontSize: 14,}}>当前选择重量 </Text>
                <Text style={{color: colors.color333, fontSize: 14,}}>{this.state.weight}千克 </Text>
              </View>

              <Text style={{color: colors.color999, fontSize: 11, marginTop: 3}}>
                修改商品重量将使配送费发生变化，请在确认重量候修改。
              </Text>
              <View style={{
                width: '100%',
                flexDirection: 'row',
                marginVertical: 46,
                justifyContent: 'center',
                alignItems: 'center'
              }}>

                <Text style={{color: colors.color999, fontSize: 10, marginRight: 10}}>{this.state.weight_min}千克 </Text>
                <View style={{flex: 1}}>
                  <Slider
                    value={this.state.weight}
                    maximumValue={this.state.weight_max}
                    minimumValue={this.state.weight_min}
                    step={this.state.weight_step}
                    trackStyle={{height: 2, backgroundColor: 'red'}}
                    thumbStyle={{height: 8, width: 8, backgroundColor: 'green'}}
                    onValueChange={(value) => {
                      this.setState({weight: value})
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: colors.color999,
                    fontSize: 10,
                    textAlign: 'right',
                    marginLeft: 10
                  }}>{this.state.weight_max}千克 </Text>
              </View>
              <TouchableOpacity onPress={() => {
                this.setState({
                  set_default_product_weight: !this.state.set_default_product_weight
                })
              }} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <Text style={{color: colors.color333, fontSize: 14,}}>设为默认重量 </Text>
                {this.state.set_default_product_weight ?
                  <View style={{
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    backgroundColor: colors.main_color,
                    justifyContent: "center",
                    alignItems: 'center',
                  }}>
                    <Entypo name='check' style={{
                      fontSize: pxToDp(25),
                      color: colors.white,
                    }}/></View> :
                  <Entypo name='circle' style={{fontSize: 20, color: colors.fontGray}}/>}
              </TouchableOpacity>
              <View style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginVertical: 34,
              }}>
                <Button title={'取消'}
                        onPress={() => {
                          this.setState({showDeliveryModal: false})
                        }}
                        buttonStyle={{
                          width: 170,
                          backgroundColor: colors.color999,
                        }}
                        titleStyle={{
                          color: colors.white,
                          fontSize: 16
                        }}
                />
                <Button title={'确定'}
                        onPress={() => {
                          this.fetchThirdWays()
                          this.update_default_product_weight()
                          this.setState({showDeliveryModal: false})
                        }}
                        buttonStyle={{
                          width: 170,
                          backgroundColor: colors.main_color,
                        }}
                        titleStyle={{
                          color: colors.white,
                          fontSize: 16
                        }}
                />
              </View>
            </View>

          </View>
        </JbbModal>

      </View>
    )
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
  footbtn: {
    height: 40,
    width: "30%",
    margin: '10%',
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.main_color,
    color: 'white',
    lineHeight: 40,
  },
  footbtn2: {
    height: 40,
    width: "30%",
    margin: '10%',
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'gray',
    color: 'white',
    lineHeight: 40,
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
    alignItems: 'center',
    // paddingHorizontal: pxToDp(20),
    margin: pxToDp(10),
  },
  datePicker: {
    backgroundColor: colors.colorEEE,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  datePickerActive: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  dateTextActive: {color: colors.main_color, fontWeight: "bold"},
  dateText: {color: colors.title_color, fontWeight: "bold"},
  datePickerHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.colorEEE,
    paddingBottom: 15
  },
  callTime: {fontWeight: "bold", fontSize: pxToDp(32), color: colors.title_color},
  sureBtn: {fontSize: pxToDp(32), color: colors.main_color},
  dateMsg: {fontWeight: "bold", fontSize: pxToDp(22), color: '#DA0000', marginVertical: 10},
  datePickerItem: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 5},
  datePickerItemActive: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5
  },
  datePickerIcon: {
    borderRadius: 10,
    width: 20,
    height: 20,
    backgroundColor: colors.main_color,
    justifyContent: "center",
    alignItems: 'center',
  }
});

export default connect(mapStateToProps)(OrderTransferThird)

