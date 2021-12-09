import React, {Component} from 'react'
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
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

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

const CheckboxItem = Checkbox.CheckboxItem;

class OrderTransferThird extends Component {


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
    };
  }

  UNSAFE_componentWillMount(): void {
    this.fetchThirdWays()
  }

  fetchThirdWays() {
    const self = this;
    showModal('加载中')
    const api = `/api/order_third_logistic_ways/${this.state.orderId}?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      self.setState({logistics: res}, () => {
        hideModal();
      })
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

      Toast.success('正在呼叫第三方配送，请稍等');
      self.props.route.params.onBack && self.props.route.params.onBack(res);
      self.props.navigation.goBack()
    }).catch((res) => {
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
    const footerEnd = {
      borderBottomWidth: 1,
      borderBottomColor: colors.back_color,
      height: 56,
      paddingEnd: 16,
      alignItems: 'flex-end'
    };
    return (
      <List renderHeader={() => '选择配送方式'}>
        {logistics.map((i, index) => (<View style={[Styles.between]}><View style={{flex: 1, height: 58}}>
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
                native.dialNumber(13241729048);
              }} style={{fontSize: pxToDp(30), color: colors.main_color}}>
                联系客服
              </Text>
            </View> : null}
            {i.est && i.est.delivery_fee > 0 &&
            <View style={[Styles.columnCenter, footerEnd]}>
              <View style={[Styles.between]}>
                <Text style={{fontSize: 12}}>预计</Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.fontBlack,
                  paddingStart: 2,
                  paddingEnd: 2
                }}>{i.est.delivery_fee}</Text>
                <Text style={{fontSize: 12}}>元</Text>
              </View>
              {i.est && i.est.coupons_amount > 0 && <View style={[Styles.between]}>
                <Text style={{fontSize: 12, color: colors.warn_color}}>已优惠</Text>
                <Text style={{fontSize: 12, color: colors.warn_color}}>{i.est.coupons_amount ?? 0}</Text>
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
    return (
      <View style={styles.btnCell}>
        <JbbButton
          onPress={() => this.onCallThirdShip()}
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
    return (
      <ScrollView>
        {this.renderHeader()}

        <If condition={this.state.logistics.length}>
          {this.renderLogistics()}
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

