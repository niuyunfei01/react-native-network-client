import React, {Component} from 'react'
import {Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import EmptyData from "../common/component/EmptyData";
import colors from "../../pubilc/styles/colors";
import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";
import native from "../../util/native";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/common/tool";
import {MixpanelInstance} from '../../util/analytics';
import DeviceInfo from "react-native-device-info";
import {Button, Slider} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";

import DateTimePicker from "react-native-modal-datetime-picker";


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
      logistics_error: [],
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
      headerType: headerType,
      showDeliveryModal: false,
      weight: 0,
      weight_max: 0,
      weight_min: 0,
      weight_step: 0,
      showErr: false,
    };
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("deliverorder_page_view", {});
  }

  fetchThirdWays() {
    const version_code = DeviceInfo.getBuildNumber();
    showModal('加载中')
    const api = `/v1/new_api/delivery/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}&version=${version_code}&weight=${this.state.weight}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      let deliverys = []
      hideModal();
      if (tool.length(res.exist) > 0) {
        for (let i in res.exist) {
          if ((res.exist[i].est !== undefined && res.exist[i].est.error_msg) || (res.exist[i].store_est !== undefined && res.exist[i].store_est.error_msg)) {
            continue;
          }
          if (res.exist[i].est) {
            res.exist[i].est.isChosed = false;
          }
          if (res.exist[i].store_est) {
            res.exist[i].store_est.isChosed = false;
          }
          deliverys.push(res.exist[i])
        }
      }
      const {currStoreId} = this.props.global;
      let {currVendorId} = tool.vendor(this.props.global);
      this.setState({
        logistics: deliverys,
        not_exist: res.not_exist,
        allow_edit_ship_rule: res.allow_edit_ship_rule,
        store_id: currStoreId,
        vendor_id: currVendorId,
        weight: res.weight,
        weight_max: res.weight_max,
        weight_min: res.weight_min,
        weight_step: res.weight_step,
        logistics_error: res.error_ways
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


  closeDialog() {
    this.setState({
      is_mobile_visiable: false
    })
  }


  render() {
    let {allow_edit_ship_rule, store_id, vendor_id, reason, mobile, btn_visiable, is_mobile_visiable} = this.state
    return (
      <View style={{flexGrow: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchThirdWays.bind(this)}/>

        <If condition={!tool.length(this.state.logistics) > 0}>
          <View style={{flex: 1}}></View>
        </If>
        <If condition={tool.length(this.state.logistics) > 0}>
          <ScrollView style={{flex: 1}}>
            {this.renderContent()}
            <If condition={!tool.length(this.state.logistics) > 0}>
              <EmptyData placeholder={'无可用配送方式'}/>
            </If>
            {this.renderList()}
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
              {allow_edit_ship_rule && <TouchableOpacity onPress={() => {
                this.onPress(Config.ROUTE_STORE_STATUS)
                this.mixpanel.track("ship.list_to_call.to_settings", {store_id, vendor_id});
              }} style={{flexDirection: "row", alignItems: "center"}}>
                <Entypo name='cog'
                        style={{fontSize: 18, color: colors.fontColor, marginRight: 4}}/>
                <Text style={{fontSize: 12, color: '#999999'}}>【自动呼叫配送】</Text>
              </TouchableOpacity>}
              {allow_edit_ship_rule && <TouchableOpacity onPress={() => {
                Alert.alert('温馨提示', '  如果开启【自动呼叫配送】，来单后，将按价格从低到高依次呼叫您选择的配送平台；只要一个骑手接单，其他配送呼叫自动撤回。告别手动发单，减少顾客催单。', [
                  {text: '确定'}
                ])
              }}>
                <Entypo name='help-with-circle'
                        style={{fontSize: 18, color: colors.main_color, marginRight: 4}}/>
              </TouchableOpacity>
              }
            </View>
            <Modal animationType={'fade'}
                   transparent={true} visible={this.state.showDateModal} onRequestClose={() => {
              this.setState({
                showDateModal: false,
              });
            }}>
              <DateTimePicker
                cancelTextIOS={'取消'}
                confirmTextIOS={'确定'}
                customHeaderIOS={() => {
                  return (<View>
                    <Text style={{
                      fontsize: pxToDp(20),
                      textAlign: 'center',
                      lineHeight: pxToDp(40),
                      paddingTop: pxToDp(20)
                    }}>预计出餐时间</Text>
                  </View>)
                }}
                date={new Date()}
                mode='datetime'
                isVisible={this.state.dateValue}
                onConfirm={(value) => {
                  this.setState({dateValue: value, showDateModal: false})
                }
                }
                onCancel={() => {
                  this.setState({
                    showDateModal: false,
                  });
                }}
              />
            </Modal>
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
                    <Entypo name={'circle-with-cross'} style={{fontSize: pxToDp(35), color: colors.fontColor}}/>
                  </TouchableOpacity>
                  <Text style={{fontWeight: "bold", fontSize: pxToDp(32)}}>提示</Text>
                  <View style={[styles.container1]}>
                    <Text style={{fontSize: pxToDp(26)}}>{reason}
                      <TouchableOpacity onPress={() => {
                        native.dialNumber(mobile)
                      }}><Text style={{color: colors.main_color}}>{mobile} </Text></TouchableOpacity>
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
        {this.renderBtn()}
        <Modal visible={this.state.showDeliveryModal} hardwareAccelerated={true}
               onRequestClose={() => this.setState({showDeliveryModal: false})}
               transparent={true}>
          <View style={{flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)',}}>
            <TouchableOpacity style={{flex: 1}} onPress={() => {
              this.setState({showDeliveryModal: false})
            }}></TouchableOpacity>
            <View style={{
              backgroundColor: colors.white,
              borderTopLeftRadius: pxToDp(30),
              borderTopRightRadius: pxToDp(30),
              padding: pxToDp(30),
              paddingBottom: pxToDp(50)

            }}>

              <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>商品重量</Text>
              <Text style={{color: '#999999', lineHeight: pxToDp(40)}}>默认显示的重量为您外卖平台维护的商品重量总和，如有不准，可手动调整重量</Text>
              <View style={{
                width: '100%',
                flexDirection: 'row',
              }}>
                <Text style={{marginRight: pxToDp(20), lineHeight: pxToDp(60)}}>当前选择</Text>
                <Text style={{textAlign: 'center', color: 'red', fontWeight: 'bold', fontSize: pxToDp(50)}}>
                  {this.state.weight}
                </Text>
                <Text style={{marginLeft: pxToDp(20), lineHeight: pxToDp(60)}}>千克
                </Text>
              </View>
              <View style={{
                width: '100%',
                flexDirection: 'row',
                marginTop: pxToDp(20),
                marginBottom: pxToDp(20),
              }}>

                <View style={{width: '20%', marginTop: pxToDp(20)}}>
                  <Text>{this.state.weight_min}千克</Text>
                </View>
                <View style={{width: '60%'}}>
                  <Slider
                    value={this.state.weight}
                    maximumValue={this.state.weight_max}
                    minimumValue={this.state.weight_min}
                    step={this.state.weight_step}
                    trackStyle={{height: 10, backgroundColor: 'red'}}
                    thumbStyle={{height: 20, width: 20, backgroundColor: 'green'}}
                    onValueChange={(value) => {
                      this.setState({weight: value})
                    }}
                  />
                </View>
                <View style={{width: '20%', marginTop: pxToDp(20)}}>
                  <Text style={{textAlign: 'right'}}>{this.state.weight_max}千克</Text>
                </View>
              </View>


              <View style={{
                width: '100%',
                flexDirection: 'row',
              }}>
                <Text
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                  }}
                  style={[styles.footbtn2]}>取消</Text>
                <Text
                  onPress={() => {
                    this.fetchThirdWays()
                    this.setState({showDeliveryModal: false})
                  }}
                  style={[styles.footbtn]}>确定</Text>
              </View>

            </View>
          </View>
        </Modal>
      </View>
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
              borderRadius: 8,
              paddingHorizontal: 6,
              margin: 8,
              marginTop: pxToDp(10),
            }}>

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
      <View style={{padding: pxToDp(20), backgroudColor: colors.back_color}}>
        {item}
      </View>
    )
  }

  renderItem(info, i) {
    return (
      <TouchableOpacity style={{borderTopWidth: pxToDp(1), borderColor: colors.fontColor}} onPress={() => {
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
                <Text style={{fontWeight: 'bold', fontSize: 12, color: colors.warn_red}}> {info.coupons_amount} </Text>
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
              <Entypo name='circle' style={{fontSize: pxToDp(35), color: colors.fontGray}}/>}
          </View>

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

  renderErrorList() {
    const {logistics_error} = this.state;
    if (tool.length(logistics_error) > 0) {
      return (
        <View style={{
          backgroundColor: colors.white,
          borderRadius: pxToDp(15),
          padding: pxToDp(20),
          margin: pxToDp(20),
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
                <Text style={{fontSize: 14}}>{item.logisticName}</Text>

                <TouchableOpacity style={{
                  flexDirection: "row",
                  justifyContent: 'center',
                  alignItems: 'center',
                }} onPress={() => {
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


  renderBtn() {
    return (
      <View>

        <TouchableOpacity onPress={() => {
          this.setState({showDeliveryModal: true})
        }}>

          <View style={{
            backgroundColor: colors.white,
            flexDirection: 'row',
            padding: pxToDp(20),
            borderTopColor: '#999999',
            borderTopWidth: pxToDp(1)
          }}>
            <View style={{flex: 1, marginLeft: pxToDp(20)}}>
              <Text>商品重量</Text>
            </View>
            <View style={{flex: 1, marginRight: pxToDp(20),}}>
              <Text
                style={{textAlign: 'right', fontSize: pxToDp(30), fontWeight: 'bold'}}>{this.state.weight}千克</Text>
            </View>
            <Entypo name='chevron-thin-right' style={{fontSize: 14}}/>
          </View>
        </TouchableOpacity>


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
});

export default connect(mapStateToProps)(OrderTransferThird)

