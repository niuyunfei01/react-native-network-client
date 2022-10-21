import React, {Component} from 'react'
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {connect} from "react-redux";
import dayjs from "dayjs";
import {Button, CheckBox, Slider} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";

import {hideModal, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import pxToDp from "../../pubilc/util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import colors from "../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {add_tip, cost, remarkIcon, time, weighticon} from "../../svg/svg";
import PropTypes from "prop-types";
import tool from "../../pubilc/util/tool";
import JbbModal from "../../pubilc/component/JbbModal";
import {TextArea} from "../../weui";
import AddTipModal from "../../pubilc/component/AddTipModal";
import {getContacts} from "../../reducers/store/storeActions";
import Config from "../../pubilc/common/config";
import native from "../../pubilc/util/native";
import DatePicker from "react-native-date-picker";

let width = Dimensions.get("window").width;

function mapStateToProps(state) {
  return {
    global: state.global,
    device: state.device
  }
}

const goods_price_list = [
  {label: '20元', value: 20},
  {label: '30元', value: 30},
  {label: '50元', value: 50},
  {label: '100元', value: 100},
  {label: '150元', value: 150},
  {label: '200元', value: 200},
  {label: '300元', value: 300}
]


class OrderCallDelivery extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props: Object) {
    super(props);
    let {order_id, store_id, expect_time, if_reship, address_id} = this.props.route.params;
    this.state = {
      isLoading: false,
      order_id: order_id,
      store_id: store_id,
      if_reship: if_reship,
      address_id: address_id,
      store_est: [],
      est: [],
      exist_waiting_delivery: [],
      maxPrice: 0,
      minPrice: 0,
      wayNums: 0,
      weight: 1,
      weight_input_value: 1,
      weight_max: 20,
      weight_min: 1,
      weight_step: 1,
      logisticFeeMap: [],
      dateArray: [],
      wm_platform: '',
      wm_platform_day_id: '',
      order_expect_time: '',
      wm_address: '',
      wm_user_name: '',
      wm_mobile: '',
      expect_time: expect_time ? expect_time : dayjs(new Date()).format('YYYY-MM-DD HH:MM:ss'),
      order_money: 20,
      order_money_input_value: 20,
      order_money_value: '',
      add_tips: 0,
      add_tips_input_value: '',
      remark: '',
      remark_input_value: '',
      is_alone_pay_vendor: true,
      show_weight_modal: false,
      show_goods_price_modal: false,
      show_date_modal: false,
      show_add_tip_modal: false,
      show_remark_modal: false,
      show_worker_delivey_modal: false,
      is_right_once: 1,
      mealTime: '',
      worker_list: [],
      worker_delivery_id: 0,
      worker_name: '',
      worker_mobile: '',
      is_mobile_visiable: false,
      btn_visiable: false,
      reason: '',
      mobile: '',
      est_all_check: false,
      store_est_all_check: false,
      logistic_fee_map: [],
      params_str: '',
    };
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    this.fetchWorker();
    this.focus = this.props.navigation.addListener('focus', () => {
      this.fetchData()
    })
  }

  fetchWorker() {
    const {dispatch, global} = this.props;
    dispatch(getContacts(global.accessToken, global.store_id, (ok, msg, contacts) => {
      this.setState({worker_list: contacts || []})
    }));
  }

  fetchData = () => {
    let {order_id, weight, expect_time, remark, add_tips, order_money, params_str, isLoading} = this.state;
    let {accessToken, vendor_id, store_id} = this.props.global;
    let params = {
      weight,
      remark,
      add_tips,
      expect_time,
      order_money,
      vendor_id,
      store_id,
    }

    let params_json_str = JSON.stringify(params);
    if (params_str == params_json_str || isLoading) {
      return;
    }
    showModal('加载中')
    this.setState({
      isLoading: true
    })
    const api = `/v4/wsb_delivery/pre_call_delivery/${order_id}?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(api, params).then(obj => {
      hideModal();
      this.setState({
        params_str: params_json_str,
        store_est: obj?.store_est,
        est: obj?.est,
        exist_waiting_delivery: obj?.exist_waiting_delivery,
        wm_platform: obj?.wm_platform,
        wm_platform_day_id: obj?.wm_platform_day_id,
        wm_address: obj?.wm_address,
        wm_user_name: obj?.wm_user_name,
        wm_mobile: obj?.wm_mobile,
        order_expect_time: obj?.expect_time,
        order_money: Number(obj?.wm_order_money),
        order_money_input_value: Number(obj?.wm_order_money),
        weight: Number(obj?.weight),
        weight_input_value: Number(obj?.weight),
        weight_max: obj?.weight_max,
        weight_min: obj?.weight_min,
        weight_step: obj?.weight_step,
        is_alone_pay_vendor: Boolean(obj?.is_alone_pay_vendor),
        isLoading: false,
      })
      this.priceFn();
    }).catch(() => {
      hideModal();
      this.setState({
        isLoading: false,
      })
    })
  }


  priceFn = () => {// 取最大价格和最小价格
    let {est, store_est} = this.state;
    let maxPrice = 0;
    let minPrice = 0;
    let wayNums = 0;
    let est_all_check = true;
    let store_est_all_check = true;

    for (let info of est) {
      if (info?.ischeck) {
        wayNums += 1;
        if (wayNums === 1) {
          minPrice = maxPrice = info?.delivery_fee
        } else {
          maxPrice = info?.delivery_fee > maxPrice ? info?.delivery_fee : maxPrice
          minPrice = info?.delivery_fee < minPrice ? info?.delivery_fee : minPrice
        }
      } else {
        est_all_check = false
      }
    }

    for (let info of store_est) {
      if (info?.ischeck) {
        wayNums += 1;
        if (wayNums === 1) {
          minPrice = maxPrice = info?.delivery_fee
        } else {
          maxPrice = info?.delivery_fee > maxPrice ? info?.delivery_fee : maxPrice
          minPrice = info?.delivery_fee < minPrice ? info?.delivery_fee : minPrice
        }
      } else {
        store_est_all_check = false;
      }
    }

    this.setState({
      maxPrice: maxPrice,
      minPrice: minPrice,
      wayNums: wayNums,
      est_all_check: est_all_check,
      store_est_all_check: store_est_all_check,
    })
  }

  onPress = (route, params = {}) => {
    this.props.navigation.navigate(route, params);
  }

  cancelDelivery = (ship_id) => {
    let {accessToken, order_id} = this.props.global
    const api = `/api/pre_cancel_order?access_token=${accessToken}`;
    let params = {
      order_id: order_id
    }
    let order = {
      id: order_id
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      if (res?.deduct_fee < 0) {
        Alert.alert('提示', `该订单已有骑手接单，如需取消配送可能会扣除相应违约金`, [{
          text: '确定', onPress: () => {
            this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
              {
                order: order,
                ship_id: ship_id,
                onCancelled: () => {
                  this.fetchData()
                }
              });
          }
        }, {'text': '取消'}]);
      } else if (Number(res?.deduct_fee) === 0) {
        this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
          {
            order: order,
            ship_id: ship_id,
            onCancelled: () => {
              this.fetchData()
            }
          });
      } else {
        Alert.alert('提示', `该订单已有骑手接单，如需取消配送会扣除相应违约金${res?.deduct_fee}元`, [{
          text: '确定', onPress: () => {
            this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
              {
                order: order,
                ship_id: ship_id,
                onCancelled: () => {
                  this.fetchData()
                }
              });
          }
        }, {'text': '取消'}]);
      }
    }).catch(e => {
      ToastShort(e.reason, 0)
    })
  }


  onWorkerDelivery() {
    let {accessToken} = this.props.global;
    let {worker_delivery_id, order_id} = this.state;
    if (!this.state.worker_delivery_id > 0) {
      ToastShort('请选择员工');
      return;
    }
    const api = `/api/order_transfer_self?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {
      orderId: order_id,
      userId: worker_delivery_id,
      sync_order: 0
    }).then(() => {
      hideModal();
      this.props.route.params.onBack && this.props.route.params.onBack({count: 1});
      this.props.navigation.goBack()
    }).catch(() => hideModal())
  }

  onCallDelivery = () => {
    showModal('正在呼叫配送，请稍等')
    let {vendor_id, store_id, accessToken} = this.props.global;
    let {
      order_id,
      logistic_fee_map,
      if_reship,
      address_id,
      weight,
      expect_time,
      order_money,
      add_tips,
      remark,
      worker_delivery_id
    } = this.state;
    if (worker_delivery_id > 0) {
      return this.onWorkerDelivery();
    }
    tool.debounces(() => {
      let params = {
        vendor_id,
        store_id,
        order_id,
        logistic_fee_map,
        if_reship,
        address_id,
        weight,
        expect_time,
        order_money,
        order_tips: add_tips,
        remark
      }
      const api = `/v4/wsb_delivery/call_delivery?access_token=${accessToken}`;
      HttpUtils.post.bind(this.props)(api, params).then(res => {
        hideModal();
        this.props.route.params.onBack && this.props.route.params.onBack(res);
        this.props.navigation.goBack()
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
        if (tool.length(res?.obj?.fail_code) > 0 && res?.obj?.fail_code === "insufficient-balance") {
          Alert.alert('发单余额不足，请及时充值', ``, [
            {
              text: '去充值', onPress: () => {
                this.onPress(Config.ROUTE_ACCOUNT_FILL, {
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

  showAlert = (res) => {
    if (res) {
      Alert.alert('充值成功，是否立即发配送', ``, [
        {text: '取消发单'},
        {
          text: '立即发单', onPress: () => {
            this.onPress(Config.ROUTE_ACCOUNT_FILL, {
              onBack: (res) => {
                if (res) {
                  this.onCallDelivery();
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
            this.onPress(Config.ROUTE_ACCOUNT_FILL, {
              onBack: () => {
                this.onPress(Config.ROUTE_ACCOUNT_FILL, {
                  onBack: (res) => {
                    this.showAlert(res)
                  }
                });
              }
            })
          }
        }
      ])
    }
  }

  closeModal = () => {
    this.setState({
      show_weight_modal: false,
      show_worker_delivey_modal: false,
      show_goods_price_modal: false,
      show_date_modal: false,
      show_add_tip_modal: false,
      show_remark_modal: false,
    })
  }

  onSelectDeliveyAll = (type, cancel = 0) => {
    let {est, store_est, store_est_all_check, est_all_check, logistic_fee_map} = this.state;
    let list = type === 1 ? est : store_est;
    let lists = type === 1 ? store_est : est;
    let bool = type === 1 ? !est_all_check : !store_est_all_check;
    if (cancel === 1) bool = false;
    for (let i in list) {
      list[i].ischeck = bool;
    }

    let check = false
    let check_logistic = {}
    for (let idx in list) {
      for (let i in lists) {
        if (lists[i]?.logisticCode === list[idx]?.logisticCode) {
          lists[i].ischeck = false;
        }
      }
      check = false
      for (let i in logistic_fee_map) {
        if (logistic_fee_map[i]?.logistic_code === list[idx]?.logisticCode) {
          check = true
          if (bool) {
            logistic_fee_map[i].logistic_code = list[idx]?.logisticCode
            logistic_fee_map[i].paid_partner_id = list[idx]?.fee_by
          } else {
            logistic_fee_map.splice(i, 1)
          }
        }
      }
      if (!check && cancel === 0) {
        check_logistic = {
          logistic_code: list[idx]?.logisticCode,
          paid_partner_id: list[idx]?.fee_by
        }
        logistic_fee_map.push(check_logistic)
      }
    }

    let params = type === 1 ?
      {logistic_fee_map, est: [...list], store_est: [...lists], est_all_check: bool} :
      {logistic_fee_map, store_est: [...list], est: [...lists], store_est_all_check: bool};
    if (cancel === 0) {
      params.worker_delivery_id = 0;
    }
    this.setState(
      params
      , () => {
        this.priceFn()
      })
  }
  onSelectDelivey = (item, key, type) => {
    let {est, store_est, logistic_fee_map} = this.state;
    let list = type === 0 ? est : store_est;
    let lists = type === 0 ? store_est : est
    item.ischeck = item?.ischeck !== undefined ? !item?.ischeck : true;
    list[key] = item;
    let check = false
    for (let idx in logistic_fee_map) {
      if (logistic_fee_map[idx]?.logistic_code === item?.logisticCode) {
        check = true;
        if (item.ischeck) {

          for (let i in lists) {
            if (lists[i]?.logisticCode === item?.logisticCode) {
              lists[i].ischeck = false;
            }
          }
          logistic_fee_map[idx].paid_partner_id = item?.fee_by
        } else {
          if (logistic_fee_map[idx].paid_partner_id === item?.fee_by) {
            logistic_fee_map.splice(idx, 1)
          }
        }


      }
    }
    if (!check) {
      let check_logistic = {
        logistic_code: item?.logisticCode,
        paid_partner_id: item?.fee_by
      }
      logistic_fee_map.push(check_logistic)
    }
    let params = type === 0 ?
      {worker_delivery_id: 0, logistic_fee_map, est: [...list], store_est: [...lists]} :
      {worker_delivery_id: 0, logistic_fee_map, store_est: [...list], est: [...lists]};
    this.setState(
      params
      , () => {
        this.priceFn()
      })
  }

  checkDatePicker = (date) => {
    this.setState({
      expect_time: dayjs(date).format('YYYY-MM-DD HH:mm'),
      show_date_modal: false,
      mealTime: dayjs(date).format('HH:mm'),
      is_right_once: 0,
    }, () => {
      this.fetchData()
    })
  };

  render() {
    let {isLoading, order_id, add_tips, show_add_tip_modal, show_date_modal} = this.state
    return (
      <View style={{flexGrow: 1}}>
        {this.renderHead()}
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
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
        {this.renderWorkerDeliveryModal()}
        {this.renderWeightModal()}
        {this.renderGoodsPriceModal()}
        {this.renderRemarkModal()}
        {this.renderReasonModal()}

        <DatePicker
          confirmText={'确定'}
          cancelText={'取消'}
          title={'期望送达时间'}
          modal
          open={show_date_modal}
          date={new Date()}
          minimumDate={new Date()}
          onConfirm={(date) => {
            this.checkDatePicker(date)
          }}
          onCancel={() => {
            this.closeModal()
          }}
        />
        <AddTipModal
          setState={this.setState.bind(this)}
          fetchData={this.fetchData.bind(this)}
          id={order_id}
          add_money={add_tips}
          set_add_tip_money={true}
          show_add_tip_modal={show_add_tip_modal}/>

      </View>
    )
  }

  renderCancelDelivery = () => {
    let {exist_waiting_delivery} = this.state
    if (tool.length(exist_waiting_delivery) <= 0) {
      return;
    }
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
        {this.renderCancalDeliveryItem(exist_waiting_delivery)}
      </View>
    )
  }

  renderOwnDelivery = () => {
    let {worker_delivery_id, worker_name, worker_mobile} = this.state;
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

        <TouchableOpacity onPress={() => {
          if (tool.length(this.state.worker_list) <= 0) {
            return ToastShort('暂无可选自配信息');
          }
          this.setState({
            show_worker_delivey_modal: true
          })
        }} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
          <Image
            source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E8%87%AA%E9%85%8D%E9%80%81%403x.png'}}
            style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>自配送 </Text>
            </View>
            <Text style={{fontSize: 12, color: colors.color666}}>
              {worker_delivery_id > 0 ? worker_name + '' + worker_mobile : '骑手信息'}
            </Text>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 14, color: colors.color666}}>自行配送</Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 18, color: colors.color999}}/>
          </View>

        </TouchableOpacity>
      </View>
    )
  }

  renderCancalDeliveryItem = (exist_waiting_delivery) => {
    return (
      <For index='key' each='item' of={exist_waiting_delivery}>
        <View key={key} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
          <Image
            source={{uri: item?.icon}}
            style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>{item?.platform_name} </Text>
            </View>
            <Text style={{fontSize: 12, color: colors.color666}}>
              已等待 <Text style={{fontSize: 12, color: "#FF8309"}}>{item?.waiting_time} </Text>分钟
            </Text>
          </View>
          <Button title={'取消'}
                  onPress={() => {
                    this.cancelDelivery(item.id)
                  }}
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
      </For>
    )
  }

  renderWsbDelivery = () => {
    let {est_all_check, est} = this.state
    if (tool.length(est) <= 0) {
      return;
    }
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>

        <TouchableOpacity
          onPress={() => this.onSelectDeliveyAll(1)}
          style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12}}>
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

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            right: -10,
            top: 0,
            position: 'relative',
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.color333,
            }}>全选</Text>
            <CheckBox
              size={20}
              checkedColor={colors.main_color}
              uncheckedColor={'#DDDDDD'}
              containerStyle={{
                margin: 0,
                padding: 0,
              }}
              checked={est_all_check}
              onPress={() => this.onSelectDeliveyAll(1)}
            />
          </View>
        </TouchableOpacity>
        {this.renderDeliveryItem(est, 0)}
      </View>
    )
  }

  renderStoreDelivery = () => {
    let {store_est_all_check, store_est} = this.state
    if (tool.length(store_est) <= 0) {
      return;
    }
    return (
      <View style={{marginTop: 10, backgroundColor: colors.white, padding: 12, borderRadius: 4}}>
        <TouchableOpacity
          onPress={() => this.onSelectDeliveyAll(2)}
          style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12}}>
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
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            right: -10,
            top: 0,
            position: 'relative',
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.color333,
            }}>全选</Text>
            <CheckBox
              size={20}
              checkedColor={colors.main_color}
              uncheckedColor={'#DDDDDD'}
              containerStyle={{
                margin: 0,
                padding: 0,
              }}
              checked={store_est_all_check}
              onPress={() => this.onSelectDeliveyAll(2)}
            />
          </View>
        </TouchableOpacity>
        {this.renderDeliveryItem(store_est, 1)}
      </View>
    )
  }


  renderDeliveryItem = (list = [], type = 0) => {
    if (tool.length(list) <= 0) {
      return null
    }
    return (
      <For index='key' each='item' of={list}>
        <TouchableOpacity onPress={() => {
          this.onSelectDelivey(item, key, type)
        }} key={key} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12}}>
          <Image
            source={{uri: item?.icon}}
            style={{width: 36, height: 36, borderRadius: 18, marginRight: 8}}/>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 14, color: colors.color333, fontWeight: '500'}}>{item?.logisticName} </Text>
              <If condition={tool.length(item?.marking[0]) > 0}>
                <View style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
                  <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}>常用</Text>
                </View>
              </If>
              <If condition={tool.length(item?.marking[0]) > 0}>
                <View style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
                  <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}>最便宜</Text>
                </View>
              </If>
            </View>
            <Text style={{fontSize: 12, color: colors.color666}}>{item?.logisticDesc} </Text>
          </View>

          <View style={{
            marginRight: 1,
            right: -10,
            top: 0,
            position: 'relative',
          }}>
            <Text style={{fontSize: 12, color: colors.color333, width: 80, textAlign: 'right'}}>
              <Text style={{fontWeight: '500', fontSize: 18, color: colors.color333}}>{item?.delivery_fee}</Text>元
            </Text>
            <If condition={tool.length(item?.coupons_amount) > 0 && Number(item?.coupons_amount) > 0}>
              <Text
                style={{fontSize: 12, color: '#FF8309', width: 80, textAlign: 'right'}}>优惠{item?.coupons_amount}元</Text>
            </If>
          </View>
          <CheckBox
            size={20}
            checkedColor={colors.main_color}
            uncheckedColor={'#DDDDDD'}
            containerStyle={{
              margin: 0,
              padding: 0,
              right: -10,
              top: 0,
              position: 'relative',
            }}
            checked={item?.ischeck}
            onPress={() => {
              this.onSelectDelivey(item, key, type)
            }}
          />
        </TouchableOpacity>
      </For>
    )
  }

  renderCollect = () => {
    let {wm_address, wm_user_name, wm_mobile, exist_waiting_delivery} = this.state;
    if (tool.length(exist_waiting_delivery) > 0) {
      return;
    }
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
            <Text style={{fontSize: 16, color: colors.color333, fontWeight: '500'}}>
              {tool.length((wm_address)) > 18 ? wm_address.substring(0, 17) + '...' : wm_address}
            </Text>
            <Text style={{color: colors.color666, fontSize: 12, marginTop: 4}}>{wm_user_name}&nbsp;{wm_mobile} </Text>
          </View>
        </View>
      </View>
    )
  }

  renderHead = () => {
    let {order_expect_time, wm_platform_day_id, wm_platform} = this.state;
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
            <Text style={{fontWeight: '500', fontSize: 16, color: colors.color333}}>{wm_platform} </Text>
            <Text style={{color: colors.color666, fontSize: 14}}>#{wm_platform_day_id} </Text>
          </View>
          <View style={{flex: 1, flexDirection: "row", justifyContent: 'center'}}>
            <Text style={{fontSize: 12, color: '#FF8309'}}>预计送达时间{order_expect_time} </Text>
          </View>
        </View>
        <View style={{width: 36}}/>
      </View>
    )
  }


  renderBtn = () => {
    let {
      is_alone_pay_vendor,
      weight,
      order_money,
      remark,
      add_tips,
      is_right_once,
      mealTime,
      worker_delivery_id,
      maxPrice,
      minPrice,
      wayNums
    } = this.state;
    let iron_width = width * 0.9 / 6;
    return (
      <View style={{paddingHorizontal: 10, paddingBottom: 10, backgroundColor: colors.white}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12}}>
          <TouchableOpacity onPress={() => {
            if (is_alone_pay_vendor) {
              return ToastShort('不支持修改商品重量');
            }
            this.setState({
              show_weight_modal: true
            })
          }} style={{
            height: iron_width,
            width: iron_width,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={weighticon()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>{weight}KG</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({
              show_date_modal: true,
            })
          }} style={{
            height: iron_width,
            width: iron_width,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={time()}/>
            <Text style={{
              fontSize: 11,
              color: colors.color333,
              marginTop: 5
            }}>{is_right_once === 0 ? mealTime : '立即送达'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({
              show_goods_price_modal: true
            })
          }} style={{
            height: iron_width,
            width: iron_width,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={cost()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>{order_money}元</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({
              show_add_tip_modal: true
            })
          }} style={{
            height: iron_width,
            width: iron_width,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={add_tip()}/>
            <Text style={{
              fontSize: 11,
              color: colors.color333,
              marginTop: 5
            }}>{add_tips > 0 ? '加' + add_tips + '元' : '加小费'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({
              show_remark_modal: true
            })
          }} style={{
            height: iron_width,
            width: iron_width,
            borderRadius: 4,
            borderColor: colors.e5,
            borderWidth: 0.5,
            alignItems: 'center'
          }}>
            <SvgXml style={{marginTop: 5}} xml={remarkIcon()}/>
            <Text style={{fontSize: 11, color: colors.color333, marginTop: 5}}>
              {tool.length(remark) > 0 ? '已' : ''}备注
            </Text>
          </TouchableOpacity>
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
            <If condition={worker_delivery_id > 0}>
              <View style={{marginLeft: 30}}>
                <Text style={{color: colors.white, fontWeight: '500', fontSize: 13}}>0元 </Text>
                <Text style={{color: colors.colorCCC, fontSize: 11}}>已选择自配送 </Text>
              </View>
            </If>
            <If condition={worker_delivery_id <= 0 && wayNums <= 0}>
              <View style={{marginLeft: 30}}>
                <Text style={{color: colors.white, fontWeight: '500', fontSize: 13}}>暂无费用 </Text>
                <Text style={{color: colors.colorCCC, fontSize: 11}}>至少选择1个运力 </Text>
              </View>
            </If>

            <If condition={worker_delivery_id <= 0 && wayNums > 0}>
              <View style={{marginLeft: 30}}>
                <Text style={{color: colors.white, fontSize: 11}}>
                  预计<Text style={{
                  fontWeight: '500',
                  color: colors.white,
                  fontSize: 16
                }}> {wayNums === 1 ? minPrice : minPrice + '～' + maxPrice} </Text>元
                </Text>
                <Text style={{color: colors.colorCCC, fontSize: 11}}>已选择{wayNums}个运力 </Text>
              </View>
            </If>
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
          <TouchableOpacity onPress={this.onCallDelivery} style={{
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
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderWorkerDeliveryModal = () => {
    let {show_worker_delivey_modal, worker_list, worker_delivery_id} = this.state;
    return (
      <JbbModal
        visible={show_worker_delivey_modal}
        HighlightStyle={{padding: 0}}
        modalStyle={{padding: 20}}
        onClose={() => {
          this.setState({
            worker_delivery_id: 0
          })
          this.closeModal()
        }}
        modal_type={'bottom'}>
        <View style={{marginBottom: 30,}}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              自配信息
            </Text>
            <Entypo onPress={() => {
              this.setState({
                worker_delivery_id: 0
              })
              this.closeModal()
            }} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>
          <If condition={tool.length(worker_list) > 0}>
            <For each='worker' index='idx' of={worker_list}>
              <TouchableOpacity onPress={() => {
                this.setState({
                  worker_delivery_id: worker?.id,
                  worker_name: worker?.label,
                  worker_mobile: worker?.mobile,
                })
              }} key={idx} style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderColor: colors.colorDDD,
                borderBottomWidth: 0.5
              }}>
                <View style={{flexDirection: 'row', alignItems: 'center',}}>
                  <Text style={{fontSize: 14, fontWeight: 'bold', color: colors.color333}}>{worker?.label} </Text>
                  <Text style={{fontSize: 14, color: colors.color666}}>{worker?.mobile} </Text>
                </View>
                <If condition={worker_delivery_id === worker?.id}>
                  <Entypo name={'check'} style={{
                    fontSize: 22,
                    color: colors.main_color,
                  }}/>
                </If>
              </TouchableOpacity>
            </For>
          </If>

          <Button title={'确 定'}
                  onPress={() => {
                    this.onSelectDeliveyAll(1, 1)
                    this.onSelectDeliveyAll(2, 1)
                    this.closeModal()
                  }}
                  buttonStyle={[{
                    marginTop: 20,
                    backgroundColor: worker_delivery_id > 0 ? colors.main_color : colors.fontGray,
                    borderRadius: 24,
                    marginHorizontal: 10,
                    length: 42,
                  }]}
                  titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
        </View>
      </JbbModal>
    )
  }


  renderWeightModal = () => {
    let {show_weight_modal, weight_min, weight_max, weight_input_value, weight_step} = this.state;
    return (
      <JbbModal visible={show_weight_modal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'bottom'}>
        <View>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
            borderBottomWidth: 0.5,
            borderColor: '#EEEEEE'
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              物品重量
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>
          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <View
              style={{flexDirection: 'row', marginTop: 20, alignContent: 'center', justifyContent: 'space-between'}}>
              <Text style={{color: colors.color333, fontSize: 14, fontWeight: 'bold'}}>当前选择重量 </Text>
              <Text style={{color: colors.color333, fontSize: 14, fontWeight: 'bold'}}>
                <Text style={{color: '#E32321', fontSize: 20}}>
                  {weight_input_value}
                </Text>
                千克 </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              marginVertical: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{color: colors.color333, fontSize: 12, marginRight: 10}}>
                {weight_min}千克
              </Text>
              <View style={{flex: 1}}>
                <Slider
                  thumbTintColor={'red'}
                  minimumTrackTintColor={colors.main_color}
                  maximumTrackTintColor={colors.f5}
                  value={weight_input_value}
                  maximumValue={weight_max}
                  minimumValue={weight_min}
                  step={weight_step}
                  trackStyle={{height: 6, borderRadius: 7}}
                  thumbStyle={{
                    height: 26,
                    width: 26,
                    borderRadius: 13,
                    backgroundColor: colors.colorEEE
                  }}
                  onValueChange={(value) => {
                    this.setState({weight_input_value: value})
                  }}
                />
              </View>
              <Text style={{color: colors.color333, fontSize: 12, textAlign: 'right', marginLeft: 10}}>
                {weight_max}千克
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
              marginBottom: 10,
            }}>
              <Text style={{fontSize: 14, color: colors.color999}}>请合理填写物品的实际重量</Text>
            </View>
            <Button title={'确 定'}
                    onPress={() => {
                      if (weight_input_value <= 0) {
                        return ToastShort('请选择物品重量')
                      }
                      this.setState({
                        weight: weight_input_value
                      }, () => {
                        this.fetchData()
                        this.closeModal()
                      })
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      marginHorizontal: 10,
                      length: 42,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  setOrderMoney = (price) => {
    this.setState({
      order_money_input_value: price
    })
  }

  renderGoodsPriceModal = () => {
    let {show_goods_price_modal, order_money_value, order_money, order_money_input_value} = this.state;
    return (
      <JbbModal visible={show_goods_price_modal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={Platform.OS !== 'ios' ? 'bottom' : 'center'}>
        <View style={{marginBottom: 20}}>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              物品价值
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>
          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                justifyContent: "space-around",
                flexWrap: "wrap"
              }}>
              <For index='index' each='info' of={goods_price_list}>
                <Text key={index} style={{
                  borderWidth: 0.5,
                  height: 36,
                  borderColor: Number(info.value) === Number(order_money_input_value) ? colors.main_color : colors.colorDDD,
                  fontSize: 14,
                  color: Number(info.value) === Number(order_money_input_value) ? colors.main_color : colors.color333,
                  backgroundColor: Number(info.value) === Number(order_money_input_value) ? '#DFFAE2' : colors.white,
                  width: width * 0.25,
                  textAlign: 'center',
                  paddingVertical: 8,
                  marginVertical: 5
                }} onPress={() => {
                  this.setOrderMoney(Number(info.value))
                }}>{info.label} </Text>
              </For>
              <TextInput
                onChangeText={(order_money_value) => {
                  this.setState({order_money_value: Number(order_money_value), order_money: 0})
                }}
                defaultValue={order_money_value}
                value={order_money_value}
                placeholderTextColor={colors.color999}
                underlineColorAndroid='transparent'
                placeholder="自定义"
                keyboardType={'numeric'}
                style={{
                  fontSize: 14,
                  height: 36,
                  width: width * (Platform.OS !== 'ios' ? 0.56 : 0.52),
                  borderWidth: 0.5,
                  color: colors.color333,
                  borderColor: colors.colorDDD,
                  textAlign: 'center',
                  paddingVertical: 8,
                  marginVertical: 5,
                }}
              />
            </View>
            <Button title={'确 定'}
                    onPress={() => {

                      if (order_money_value <= 0 && order_money_input_value <= 0) {
                        return ToastShort('请选择物品价值')
                      }

                      let order_money = order_money_input_value === 0 ? order_money_value : order_money_input_value;

                      this.setState({
                        order_money
                      }, () => {
                        this.fetchData()
                        this.closeModal()
                      })
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      marginHorizontal: 10,
                      length: 42,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderRemarkModal = () => {
    let {show_remark_modal, remark_input_value} = this.state;
    return (
      <JbbModal visible={show_remark_modal} onClose={this.closeModal}
                modal_type={Platform.OS !== 'ios' ? 'bottom' : 'center'}>
        <View style={{marginBottom: 20}}>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              备注
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>
          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <TextArea
              multiline={true}
              numberOfLines={4}
              value={remark_input_value}
              onChange={(remark_input_value) => this.setState({remark_input_value})}
              showCounter={false}
              placeholder={'请在此填写备注信息，最多不超过30个字符'}
              placeholderTextColor={colors.color999}
              underlineColorAndroid="transparent" //取消安卓下划线
              style={{
                marginBottom: 12,
                height: 100,
                fontSize: 14,
                color: colors.color333,
                backgroundColor: colors.f5,
                borderRadius: 4
              }}
            >
            </TextArea>
            <Button title={'确 定'}
                    onPress={() => {
                      this.setState({
                        remark: remark_input_value
                      }, () => {
                        this.fetchData()
                        this.closeModal()
                      })
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      marginHorizontal: 10,
                      length: 42,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderReasonModal = () => {
    let {is_mobile_visiable, reason, mobile, btn_visiable} = this.state;
    return (
      <JbbModal onClose={() => this.closeDialog()} visible={is_mobile_visiable} modal_type={'center'}>
        <View>
          <Text style={{fontWeight: "bold", fontSize: pxToDp(32)}}>提示</Text>
          <View style={[styles.container1]}>
            <Text style={{fontSize: pxToDp(26)}}>{reason}
              <TouchableOpacity onPress={() => native.dialNumber(mobile)}>
                <Text style={{color: colors.main_color}}>
                  {mobile}
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
          <If condition={btn_visiable}>
            <View style={styles.btn1}>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                  onPress={() => this.setState({is_mobile_visiable: false})}>
                  <Text style={styles.btnText}>知道了</Text>
                </TouchableOpacity>
              </View>
            </View>
          </If>

        </View>
      </JbbModal>
    )
  }
}

const styles = StyleSheet.create({
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
  container1: {
    width: '95%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    padding: pxToDp(20),
    justifyContent: "flex-start",
    borderTopWidth: pxToDp(1),
    borderTopColor: "#CCCCCC"
  },
  btn1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: pxToDp(15),
    marginBottom: pxToDp(10)
  },
  container: {flex: 1},
});

export default connect(mapStateToProps)(OrderCallDelivery)
