import React, {Component} from 'react'
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import {Checkbox, DatePickerView, List, Toast, WhiteSpace} from '@ant-design/react-native';
import {connect} from "react-redux";
import color from "../../widget/color";
import pxToDp from "../../util/pxToDp";
import JbbButton from "../component/JbbButton";
import HttpUtils from "../../util/http";
import EmptyData from "../component/EmptyData";
import {Styles} from "../../themes";
import colors from "../../styles/colors";
import Dialog from "../component/Dialog";
import {hideModal, showModal, showSuccess} from "../../util/ToastUtils";
import native from "../../common/native";
import Config from "../../config";
import tool from "../../common/tool";
import JbbText from "../component/JbbText";
import {MixpanelInstance} from '../../common/analytics';
import {set_mixpanel_id} from '../../reducers/global/globalActions'

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

const CheckboxItem = Checkbox.CheckboxItem;

class OrderTransferThird extends Component {

  navigationOptions = ({navigation}) => navigation.setOptions({
    headerTitle: '发第三方配送',
  });

  constructor(props: Object) {
    super(props);
    const if_reship = this.props.route.params.if_reship || 0;
    this.state = {
      selected: this.props.route.params.selectedWay,
      newSelected: [],
      orderId: this.props.route.params.orderId,
      storeId: this.props.route.params.storeId,
      accessToken: this.props.global.accessToken,
      logistics: [],
      if_reship: if_reship,
      showDateModal: false,
      dateValue: new Date(),
      mealTime: '',
      expectTime: this.props.route.params.expectTime,
      total_available_ship: 0,
      lowest_price: 0,
      total_ok_ship: 0
    };

    this.navigationOptions(this.props)

    this.mixpanel = MixpanelInstance;
    this.mixpanel.reset();
    this.mixpanel.getDistinctId().then(res => {
      if (tool.length(res) > 0) {
        const {dispatch} = this.props;
        dispatch(set_mixpanel_id(res));
        this.mixpanel.alias("new ID", res)
      }
    })

  }

  UNSAFE_componentWillMount(): void {
    this.fetchThirdWays()
  }

   fetchThirdWays() {
    const self = this;
    showModal('加载中')
    const api = `/api/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.setState({
        allow_edit_ship_rule: res.allow_edit_ship_rule
      })
      delete res.allow_edit_ship_rule
      let {logistics} = this.state
      for (let i in res) {
        logistics.push(res[i])
      }
      self.setState({logistics: logistics, total_available_ship: res.length}, () => {
        hideModal();
      })
      let deliverys = []
      res.map(i => {
        if(i['est']){
          deliverys.push(i['est'].delivery_fee)
        }
      })
      let min_delivery_fee = Math.min.apply(null, deliverys)
      this.setState({lowest_price: min_delivery_fee})
      let {total_available_ship, lowest_price} = this.state
      let store_id = this.state.orderId;
      let vendor_id = this.props.global.config.vendor.id;
      this.mixpanel.track("ship.list_to_call", {store_id, vendor_id, total_available_ship, lowest_price});
    }).catch(() => {
      hideModal();
    })
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
                  this.onCallThirdShip();
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

  onCallThirdShip() {
    const self = this;
    const api = `/api/order_transfer_third?access_token=${this.state.accessToken}`;
    const {orderId, storeId, newSelected, if_reship, mealTime} = this.state;
    HttpUtils.post.bind(self.props.navigation)(api, {
      orderId: orderId,
      storeId: storeId,
      logisticCode: newSelected,
      if_reship: if_reship,
      mealTime: mealTime
    }).then(res => {
      this.setState({
        total_ok_ship: res.count
      })
      Toast.success('正在呼叫第三方配送，请稍等');
      console.log('navigation params => ', this.props.route.params)
      console.log("call third ship", res);
      self.props.route.params.onBack && self.props.route.params.onBack(res);
      self.props.navigation.goBack()
    }).catch((res) => {
      if (tool.length(res.obj.fail_code) > 0 &&res.obj.fail_code === "insufficient-balance") {
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
    this.setState({newSelected: selected})
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
          <Text style={styles.modalCancelText1}>确&nbsp;&nbsp;&nbsp;&nbsp;认</Text>
        </View>
      </TouchableOpacity>
    </List>
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={{color: '#000'}}>发第三方配送并保留专送</Text>
        <Text style={{color: color.fontGray}}>一方先接单后，另一方会被取消</Text>
      </View>
    )
  }

  renderLogistics() {
    const {logistics, selected} = this.state;
    let store_id = this.props.global.currStoreId;
    let vendor_id = this.props.global.config.vendor.id;
    const footerEnd = {
      borderBottomWidth: 1,
      borderBottomColor: colors.back_color,
      height: 56,
      paddingEnd: 16,
      alignItems: 'flex-end'
    };
    return (
      <List renderHeader={() => '选择配送方式'}>
        {logistics.map((i, index) => index !== 'allow_edit_ship_rule' && (<View style={[Styles.between]}><View style={{flex: 1, height: 58}}>
            <CheckboxItem key={i.logisticCode} style={{borderBottomWidth: 0, borderWidth: 0, border_color_base: '#fff'}}
                          checkboxStyle={{color: '#979797'}}
                          onChange={(event) => this.onSelectLogistic(i.logisticCode, event)}
                          disabled={selected.includes(String(i.logisticCode))}
                          defaultChecked={selected.includes(String(i.logisticCode))}>
              {i.logisticName}
              <List.Item.Brief style={{borderBottomWidth: 0}}>{i.logisticDesc}</List.Item.Brief>
            </CheckboxItem>


            {/*判断美团快速达加 接单率93% & 不溢价 闪送加 专人专送*/}
            {i.error_msg !== '暂未开通' && i.logisticCode == 3 && <View style={styles.tagView}>
              <Text style={styles.tag1}>接单率93% </Text>
              <Text style={styles.tag2}>不溢价</Text>
            </View>}
            {i.error_msg !== '暂未开通' && i.logisticCode == 5 && <View style={{flexDirection: "row"}}>
              <Text style={styles.tag3}>专人专送</Text>
            </View>}

          </View>
            {i.error_msg === '暂未开通' ? <View style={{marginRight: pxToDp(40), flexDirection: 'row'}}>
              <Text style={{fontSize: pxToDp(30), color: colors.fontColor, marginRight: pxToDp(130)}}>
                暂未开通
              </Text>
              <Text onPress={() => {
                let ship_type = i.logisticName;
                native.dialNumber(13241729048);
                this.mixpanel.track("ship.list_to_call.request_kf", {store_id, vendor_id, ship_type});
              }} style={{fontSize: pxToDp(30), color: colors.main_color}}>
                联系客服
              </Text>
            </View> : null}
            {i.est && i.est.delivery_fee > 0 &&
            <View style={[Styles.columnCenter, footerEnd]}>
              <View style={[Styles.between]}>
                <Text style={{fontSize: 12}}>预计</Text>
                <JbbText style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.fontBlack,
                  paddingStart: 2,
                  paddingEnd: 2
                }}>{i.est.delivery_fee}</JbbText>
                <Text style={{fontSize: 12}}>元</Text>
              </View>
              {i.est && i.est.coupons_amount > 0 && <View style={[Styles.between]}>
                <Text style={{fontSize: 12, color: colors.warn_color}}>已优惠</Text>
                <JbbText style={{fontSize: 12, color: colors.warn_color}}>{i.est.coupons_amount ?? 0}</JbbText>
                <Text style={{fontSize: 12, color: colors.warn_color}}>元</Text>
              </View>}
            </View>}

            {i.error_msg !== '暂未开通' && !i.est && <View style={[Styles.columnAround, {
              borderBottomWidth: 1,
              borderBottomColor: colors.back_color,
              height: 56,
              paddingEnd: 10,
              alignItems: 'flex-end'
            }]}>
              <Text style={{fontSize: 12}}>暂无预估价</Text>

            </View>}

          </View>
        ))}
      </List>
    )
  }

  renderBtn() {
    let total_selected_ship = this.state.newSelected.length;
    let store_id = this.props.global.currStoreId;
    let vendor_id = this.props.global.config.vendor.id;
    let total_ok_ship = this.state.total_ok_ship
    return (
      <View style={styles.btnCell}>
        <JbbButton
          onPress={
            () => {
              this.onCallThirdShip()
              this.mixpanel.track("ship.list_to_call.call", {store_id, vendor_id, total_selected_ship, total_ok_ship});
            }
          }
          text={'呼叫配送'}
          backgroundColor={color.theme}
          fontColor={'#fff'}
          fontWeight={'bold'}
          height={40}
          fontSize={pxToDp(30)}
          disabled={!this.state.newSelected.length}
        />
      </View>
    )
  }

  render() {
    let store_id = this.props.global.currStoreId;
    let vendor_id = this.props.global.config.vendor.id;
    let allow_edit_ship_rule = this.state.allow_edit_ship_rule
    return (
      <ScrollView>
        {this.renderHeader()}

        <If condition={this.state.logistics.length}>
          {this.renderLogistics()}
          <WhiteSpace/>
          <View style={{flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginRight: pxToDp(15)}}>
            {allow_edit_ship_rule && <TouchableOpacity onPress={() => {
              this.onPress(Config.ROUTE_STORE_STATUS)
              this.mixpanel.track("ship.list_to_call.to_settings", {store_id, vendor_id});
            }}  style={{flexDirection: "row", alignItems: "center"}}>
              <Image source={require("../../img/My/shezhi_.png")} style={{width: pxToDp(30), height: pxToDp(30)}}/>
              <JbbText style={{fontSize: pxToDp(28), color: '#999999'}}>【自动呼叫配送】</JbbText>
            </TouchableOpacity>}
            {
              allow_edit_ship_rule && <TouchableOpacity onPress={() => {
                Alert.alert('温馨提示', '  如果开启【自动呼叫配送】功能，来单后，系统按价格从低到高依次呼叫各个配送平台；当第一个骑手接单时，其他配送呼叫自动撤回。俩次发单之间按照设定时间的间隔，综合成本较低，省心省钱。', [
                  {text: '确定'}
                ])
              }}>
                <Image
                    source={require("../../img/My/help.png")}
                    style={{width: pxToDp(40), height: pxToDp(40), marginLeft: pxToDp(15)}}
                />
              </TouchableOpacity>
            }
          </View>
          <WhiteSpace/>
          {this.renderBtn()}
        </If>

        <If condition={!this.state.logistics.length}>
          <EmptyData placeholder={'无可用配送方式'}/>
        </If>
        <Dialog visible={this.state.showDateModal} onRequestClose={() => this.onRequestClose()}>
          {this.showDatePicker()}
        </Dialog>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: pxToDp(200),
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnCell: {
    padding: pxToDp(30)
  },
  tag1: {
    fontSize: pxToDp(22),
    color: colors.white,
    fontWeight: "bold",
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    textAlign: "center",
    paddingHorizontal: pxToDp(5),
    position: "absolute",
    bottom: 33,
    left: 140
  },
  tag2: {
    fontSize: pxToDp(22),
    color: colors.white,
    fontWeight: "bold",
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    textAlign: "center",
    paddingHorizontal: pxToDp(5),
    position: "absolute",
    bottom: 33,
    left: 218
  },
  tag3: {
    fontSize: pxToDp(22),
    color: colors.white,
    fontWeight: "bold",
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    textAlign: "center",
    paddingHorizontal: pxToDp(5),
    position: "absolute",
    bottom: 33,
    left: 90
  },
  tagView: {
    flexDirection: "row",
    position: "relative"
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
  modalCancelText1: {
    color: color.theme,
    fontSize: pxToDp(40)
  }
});

export default connect(mapStateToProps)(OrderTransferThird)

