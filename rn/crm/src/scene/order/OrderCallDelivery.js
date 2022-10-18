import React, {Component} from 'react'
import {
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {connect} from "react-redux";
import dayjs from "dayjs";
import {MixpanelInstance} from '../../pubilc/util/analytics';
import {Button, CheckBox} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";

import {hideModal, showModal, ToastLong} from "../../pubilc/util/ToastUtils";
import pxToDp from "../../pubilc/util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import colors from "../../pubilc/styles/colors";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";
import {SvgXml} from "react-native-svg";
import {add_tip, cost, remark, time, weight} from "../../svg/svg";

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

class OrderCallDelivery extends Component {
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
      weight: 1,
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
      is_alone_pay_vendor: true,
    };
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("deliverorder_page_view", {});
  }

  fetchData = () => {
    return null;
    this.setState({
      isLoading: true
    })
    showModal('加载中')
    const api = `/v1/new_api/delivery/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}&weight=${this.state.weight}`;
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
        is_alone_pay_vendor: Boolean(obj?.is_alone_pay_vendor),
        isLoading: false,
      })


      let params = {
        store_id: currStoreId,
        vendor_id: currVendorId,
        total_available_ship: tool.length(obj),

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
    const {currStoreId, currentUser, accessToken} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderCallDelivery"
    timeObj['is_record_request_monitor'] = this.props.global?.is_record_request_monitor
    calcMs(timeObj, accessToken)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (tool.length(timeObj.method) > 0) {
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
    let {logistics, logisticFeeMap, maxPrice, minPrice, wayNums} = this.state;
    logisticFeeMap = [];
    maxPrice = 0;
    minPrice = 10001;
    // logisticFeeMap: [{logisticCode: '',paidPartnerId: ''},{logisticCode: '',paidPartnerId: ''}]
    wayNums = 0;
    for (let i in logistics) {
      let obiItem = {};
      if (logistics[i]?.est && logistics[i].est?.isChosed) {
        obiItem.logisticCode = logistics[i].logisticCode;
        obiItem.paidPartnerId = 0;
        wayNums += 1;
        maxPrice = logistics[i].est.delivery_fee > maxPrice ? logistics[i].est.delivery_fee : maxPrice
        minPrice = logistics[i].est.delivery_fee < minPrice ? logistics[i].est.delivery_fee : minPrice
      }
      if (logistics[i]?.store_est && logistics[i].store_est?.isChosed) {
        obiItem.logisticCode = logistics[i].logisticCode;
        obiItem.paidPartnerId = -1;
        wayNums += 1
        maxPrice = logistics[i].store_est.delivery_fee > maxPrice ? logistics[i].store_est.delivery_fee : maxPrice
        minPrice = logistics[i].store_est.delivery_fee < minPrice ? logistics[i].store_est.delivery_fee : minPrice
      }
      if (obiItem.logisticCode) {
        logisticFeeMap.push(obiItem)
      }

    }

    this.setState({
      maxPrice: maxPrice,
      minPrice: minPrice,
      wayNums: wayNums,
      logisticFeeMap: logisticFeeMap
    })

  }

  onCallThirdShipRule = () => {
    let total_selected_ship = tool.length(this.state.newSelected);
    let store_id = this.props.global.currStoreId;
    let {currVendorId} = tool.vendor(this.props.global);

    let total_ok_ship = this.state.total_ok_ship;
    const self = this;
    const {orderId} = this.state;
    this.mixpanel.track("deliverorder_click", {});

    const api = `v1/new_api/delivery/can_call_third_deliverie/${orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props)(api).then(obj => {
      Alert.alert('提示', `${obj.content}`, [{
        text: `${obj.left_btn}`, onPress: () => {
          this.onCallThirdShip()
          this.mixpanel.track("ship.list_to_call.call", {
            store_id,
            vendor_id: currVendorId,
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
          vendor_id: currVendorId,
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
      HttpUtils.post.bind(self.props)(api, {
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
              onBack: () => {
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

  onPress = (route, params = {}) => {
    this.props.navigation.navigate(route, params);
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
  setCheckd = () => {

  }

  render() {
    let {isLoading} = this.state
    return (
      <View style={{flexGrow: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        {this.renderHead()}
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => this.fetchData()}
            tintColor='gray'
          />
        } style={{flex: 1, paddingHorizontal: 12, backgroundColor: colors.f5}}>
          {this.renderCollect()}
          {this.renderCancelDelivery()}
          {this.renderWsbDelivery()}
          {this.renderStoreDelivery()}
          {this.renderOwnDelivery()}
        </ScrollView>
        {this.renderBtn()}
      </View>
    )
  }

  renderCancelDelivery = () => {
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>

        <View style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 12}}>
          <View style={{
            borderBottomWidth: 4,
            borderColor: 'rgba(38,185,66,0.2)'
          }}>
            <Text style={{
              fontWeight: '500',
              fontSize: 17,
              color: colors.color333,
            }}>呼叫中</Text>
          </View>

        </View>
        {this.renderCancalDeliveryItem()}
      </View>
    )
  }

  renderOwnDelivery = () => {
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4, marginBottom: 100}}>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 12}}>
          <View style={{
            borderBottomWidth: 4,
            borderColor: 'rgba(38,185,66,0.2)'
          }}>
            <Text style={{
              fontWeight: '500',
              fontSize: 17,
              color: colors.color333,
            }}>其他配送</Text>
          </View>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
          <Image
            source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E8%87%AA%E9%85%8D%E9%80%81%403x.png'}}
            style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>自配送 </Text>
            </View>
            <Text style={{fontSize: 12, color: colors.color666}}>骑手信息 </Text>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Text>自行配送</Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 18, color: colors.color999}}/>
          </View>
        </View>
      </View>
    )
  }

  renderCancalDeliveryItem = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
        <Image
          source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E7%BE%8E%E5%9B%A2%E5%A4%96%E5%8D%96%403x.png'}}
          style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>闪送 </Text>
          </View>
          <Text style={{fontSize: 12, color: colors.color666}}>12.2公里 </Text>
        </View>

        <Button title={'取消'}
                onPress={console.log(121)}
                buttonStyle={{
                  width: 67,
                  borderRadius: 20,
                  backgroundColor: colors.white,
                  borderColor: colors.colorDDD,
                  borderWidth: 0.5
                }}
                titleStyle={{color: colors.color666, fontSize: 14, lineHeight: 20}}
        />
      </View>
    )
  }

  renderWsbDelivery = () => {
    let {wsb_delivery_all} = this.state
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12}}>
          <View style={{
            borderBottomWidth: 4,
            borderColor: 'rgba(38,185,66,0.2)'
          }}>
            <Text style={{
              fontWeight: '500',
              fontSize: 17,
              color: colors.color333,
            }}>省钱配送</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text>全选</Text>
            <CheckBox
              size={20}
              checkedColor={colors.main_color}
              uncheckedColor={'#DDDDDD'}
              containerStyle={{margin: 0, padding: 0}}
              checked={wsb_delivery_all}
              onPress={this.setCheckd}
            />
          </View>
        </View>
        {this.renderDeliveryItem()}
        {this.renderDeliveryItem()}
        {this.renderDeliveryItem()}
      </View>
    )
  }


  renderStoreDelivery = () => {
    let {wsb_delivery_all} = this.state
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12}}>
          <View style={{
            borderBottomWidth: 4,
            borderColor: 'rgba(38,185,66,0.2)'
          }}>
            <Text style={{
              fontWeight: '500',
              fontSize: 17,
              color: colors.color333,
            }}>自有账号</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text>全选</Text>
            <CheckBox
              size={20}
              checkedColor={colors.main_color}
              uncheckedColor={'#DDDDDD'}
              containerStyle={{margin: 0, padding: 0}}
              checked={wsb_delivery_all}
              onPress={this.setCheckd}
            />
          </View>
        </View>
        {this.renderDeliveryItem()}
        {this.renderDeliveryItem()}
        {this.renderDeliveryItem()}
      </View>
    )
  }

  renderDeliveryItem = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
        <Image
          source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E7%BE%8E%E5%9B%A2%E5%A4%96%E5%8D%96%403x.png'}}
          style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>闪送 </Text>
            <View style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
              <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}>常用</Text>
            </View>
            <View style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
              <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}>最便宜</Text>
            </View>
          </View>
          <Text style={{fontSize: 12, color: colors.color666}}>12.2公里 </Text>
        </View>

        <View style={{marginRight: 1}}>
          <Text style={{fontSize: 12, color: colors.color333}}>
            <Text style={{fontWeight: '500', fontSize: 18, color: colors.color333}}>19.2</Text>元
          </Text>
          <Text style={{fontSize: 12, color: '#FF8309'}}>优惠2元</Text>
        </View>
        <CheckBox
          size={20}
          checkedColor={colors.main_color}
          uncheckedColor={'#DDDDDD'}
          containerStyle={{margin: 0, padding: 0}}
          checked={false}
          onPress={this.setCheckd}
        />
      </View>
    )
  }

  renderCollect = () => {
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{
            backgroundColor: '#FF8309',
            width: 28,
            height: 28,
            borderRadius: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{fontSize: 15, color: colors.white, fontWeight: '500'}}>收</Text>
          </View>
          <View style={{marginLeft: 9}}>
            <Text style={{fontSize: 16, color: colors.color333, fontWeight: '500'}}>味多美（立水桥店） </Text>
            <Text style={{color: colors.color666, fontSize: 12, marginTop: 4}}>博彦科技大厦B座四层2912室 </Text>
          </View>
        </View>
      </View>
    )
  }

  renderHead = () => {
    return (
      <View style={{height: 44, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
          style={{
            paddingLeft: 12,
            width: 36
          }}>
          <Entypo name='chevron-thin-left' style={{fontSize: 24}}/>
        </TouchableOpacity>
        <View style={{flex: 1,}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontWeight: '500', fontSize: 16, color: colors.color333}}>美团 </Text>
            <Text style={{color: colors.color666, fontSize: 14}}>#{"121"} </Text>
          </View>
          <View style={{flex: 1, flexDirection: "row", justifyContent: 'center'}}>
            <Text style={{fontSize: 12, color: '#FF8309'}}>预计送达时间 19：21 </Text>
          </View>
        </View>
        <View style={{width: 36}}/>
      </View>
    )
  }

  handle = (info, index) => {
    const {logistics} = this.state
    if (logistics[index].logisticCode <= 0) {
      return ToastLong("数据错误，请刷新当前页面")
    }
    if (info.error_msg) {
      return false;
    }
    if (info.name === '外送帮账号') {
      let isChosed = logistics[index]?.est?.isChosed ? logistics[index]?.est?.isChosed : false;
      logistics[index].est.isChosed = !isChosed;
      if (logistics[index].store_est) {
        logistics[index].store_est.isChosed = false;
      }
    } else {
      let isChosed = logistics[index].store_est.isChosed ? logistics[index].store_est.isChosed : false;
      logistics[index].store_est.isChosed = !isChosed;
      if (logistics[index].est) {
        logistics[index].est.isChosed = false;
      }
    }
    this.setState({
      logistics: logistics
    })
    this.priceFn();
  }

  renderItem = (info, index) => {
    return (
      <TouchableOpacity
        style={{borderTopWidth: pxToDp(1), borderColor: colors.colorEEE}}
        onPress={() => this.handle(info, index)}>
        <View style={styles.check}>
          <Text style={{fontSize: 14, color: colors.color333, fontWeight: 'bold', lineHeight: 56}}>
            {info.name}
          </Text>

          <View style={{flex: 1}}/>

          <View style={{alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={{fontSize: 12, fontWeight: 'bold', lineHeight: pxToDp(42)}}>
                预估
              </Text>
              <Text style={{fontWeight: 'bold', fontSize: 20, color: colors.color333}}>
                {info.delivery_fee}
              </Text>
            </View>

            {info && info.coupons_amount > 0 ?
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 10, fontWeight: 'bold', lineHeight: pxToDp(42), color: colors.color999}}>
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
            {info?.isChosed ?
              <View style={{
                borderRadius: 10,
                width: 20,
                height: 20,
                backgroundColor: colors.main_color,
                justifyContent: "center",
                alignItems: 'center',
              }}>
                <Entypo name='check' style={{fontSize: pxToDp(25), color: colors.white}}/>
              </View> :
              <Entypo name='circle' style={{fontSize: 20, color: colors.fontGray}}/>}
          </View>

        </View>
      </TouchableOpacity>
    )
  }


  renderBtn = () => {
    let {is_alone_pay_vendor} = this.state;
    return (
      <View style={{paddingHorizontal: 10, paddingBottom: 10, backgroundColor: colors.white}}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 12}}>
          <View style={{
            height: 56,
            width: 56,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            marginHorizontal: 8,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={weight()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>3KG</Text>
          </View>
          <View style={{
            height: 56,
            width: 56,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            marginHorizontal: 8,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={time()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>明天12:00</Text>
          </View>
          <View style={{
            height: 56,
            width: 56,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            marginHorizontal: 8,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={cost()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>50元</Text>
          </View>
          <View style={{
            height: 56,
            width: 56,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            marginHorizontal: 8,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={add_tip()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>加5元</Text>
          </View>
          <View style={{
            height: 56,
            width: 56,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            marginHorizontal: 8,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={remark()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>备注</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row',}}>
          <View style={{
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            flex: 1,
            backgroundColor: colors.color444,
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
          }}>
            <View style={{marginLeft: 30}}>
              <Text style={{color: colors.white, fontWeight: '500', fontSize: 13}}>暂无费用</Text>
              <Text style={{color: colors.colorCCC, fontSize: 11}}>至少选择1个运力</Text>
            </View>
          </View>
          <View style={{
            position: 'absolute',
            top: 0,
            right: 116,
            height: 48,
            zIndex: 1,
            borderLeftWidth: 20,
            borderLeftColor: colors.color444,
            borderBottomWidth: 48,
            borderBottomColor: colors.main_color,
          }}/>
          <View style={{
            width: 136,
            height: 48,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.main_color,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
          }}>
            <Text style={{color: colors.white, fontWeight: '500', fontSize: 16}}>配送下单 </Text>
          </View>
        </View>
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
    color: colors.color111,
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
  dateText: {color: colors.color111, fontWeight: "bold"},
  datePickerHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.colorEEE,
    paddingBottom: 15
  },
  callTime: {fontWeight: "bold", fontSize: pxToDp(32), color: colors.color111},
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

export default connect(mapStateToProps)(OrderCallDelivery)
