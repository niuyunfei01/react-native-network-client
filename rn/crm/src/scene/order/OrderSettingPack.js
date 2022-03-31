import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CommonStyle from "../../util/CommonStyles";

import {getOrder, saveOrderBasic} from "../../reducers/order/orderActions";
import {createTaskByOrder} from "../../reducers/remind/remindActions";
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {DatePickerView, InputItem, List, WhiteSpace} from "@ant-design/react-native"
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle, Input, Label, TextArea} from "../../weui/index";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Config from "../../pubilc/common/config";
import {tool} from "../../util";
import Dialog from "../common/component/Dialog";
import color from "../../widget/color";
import {hideModal, showError, showModal, showSuccess} from "../../pubilc/util/ToastUtils";
import HttpUtils from "../../pubilc/util/http";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
        {saveOrderBaisc: saveOrderBasic, getOrder, createTaskByOrder, userCanChangeStore},
        dispatch
    )
  };
}

class OrderSettingScene extends Component {
  constructor(props: Object) {
    super(props);
    let {currStoreName} = tool.vendor(this.props.global);


    let {currStoreId, accessToken} = this.props.global
    this.state = {
      accessToken: accessToken,
      remark: '',
      datePickerValue: new Date(),
      address: '',
      name: '',
      mobile: '',
      mobile_suffix: '',
      location_long: '',
      location_lat: '',
      weight: 0,
      orderAmount: 0,
      showDateModal: false,
      expect_time: Math.round(new Date() / 1000),
      currentStoreName: currStoreName,
      store_id: currStoreId,
      is_right_once: 1,
      loc_lng: '',
      loc_lat: '',
      id: '',

      coordinates: ''
    };

    this._toSetLocation = this._toSetLocation.bind(this);
  }

  componentDidMount() {
  }

  UNSAFE_componentWillMount() {
  }

  _toSetLocation() {
    const {location_long, location_lat, coordinates} = this.state
    let center = ""
    if (location_long && location_lat) {
      // center = `${location_long},${location_lat}`
      center = coordinates
    }

    const params = {
      action: Config.LOC_PICKER,
      center: center,
      cityname: tool.store(this.props.global).city,
      loc_lat: tool.store(this.props.global).loc_lat,
      loc_lng: tool.store(this.props.global).loc_lng,
      isType: "orderSetting",
      onBack: resp => {
        let {name, address, location} = resp;
        let locate = name;
        let locate1 = address;
        let locationAll = location.split(',')
        this.setState({
          location_long: locate,
          location_lat: locate1,
          location: location,
          loc_lng: locationAll[0],
          loc_lat: locationAll[1],
          coordinates: resp.location
        });
      }
    };

    this.onPress(Config.ROUTE_SEARC_HSHOP, params);


  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  timeOutBack(time) {
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  showDatePicker() {
    let {datePickerValue} = this.state
    return <View style={{marginTop: 12}}>
      <View style={styles.modalCancel}>
        <Text style={styles.modalCancelText}>期望送达时间</Text>
      </View>
      <DatePickerView value={datePickerValue} minDate={new Date()}
                      minuteStep={10}
                      mode='datetime'
                      onChange={(value) => this.setState({datePickerValue: value})}>
      </DatePickerView>
      <TouchableOpacity onPress={() => {
        this.onConfirm()
      }} style={styles.modalCancel1}>
        <View>
          <Text style={styles.modalCancelText1}>确&nbsp;&nbsp;&nbsp;&nbsp;认</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  onConfirm() {
    this.setState({
      showDateModal: false
    })
    let time = this.state.datePickerValue
    let str = Math.round(new Date(time) / 1000)
    if (str > Math.round(new Date() / 1000)) {
      this.setState({
        is_right_once: 0
      })
    }
    this.setState({
      expect_time: str
    })
    showSuccess("设置成功！")
  }

  onRequestClose() {
    this.setState({
      showDateModal: false,
      expect_time: ''
    })
  }

  orderToSave(status) {
    let {
      remark, address, name, mobile,
      mobile_suffix, weight, orderAmount, expect_time, store_id,
      is_right_once, loc_lng, loc_lat, location_long, location_lat
    } = this.state
    const self = this;
    const api = `/api/order_manual_create?access_token=${this.state.accessToken}`;
    let params = {
      "store_id": store_id,
      "expect_time": expect_time,
      "is_right_once": is_right_once,
      "loc_lng": loc_lng,
      "loc_lat": loc_lat,
      "address": `${location_long}(${location_lat}${address})`,
      "mobile": mobile,
      "mobile_suffix": mobile_suffix,
      "weight": weight,
      "money": orderAmount,
      "remark": remark,
      "receiver": name,
    }
    showModal('正在保存订单，请稍等');
    HttpUtils.post.bind(self.props)(api, params).then(res => {
      hideModal()
      showSuccess("保存成功！")
      this.setState({
        id: res.WaimaiOrder.id
      })
      if (status === 1) {
        this.setState({
          expect_time: Math.round(new Date() / 1000),
          is_right_once: 1,
          address: '',
          loc_lng: '',
          loc_lat: '',
          mobile: '',
          mobile_suffix: '',
          weight: 0,
          orderAmount: 0,
          name: '',
          remark: '',
          location_long: '',
          location_lat: ''
        })
        this.timeOutBack(300);
      } else {
        let {store_id} = this.state
        if (res.WaimaiOrder.id) {
          this.onCallThirdShips(res.WaimaiOrder.id, store_id)
        } else {
          showError('保存失败请重试！')
        }
      }

    }).catch((reason) => {
      showError(reason)
    })
  }

  orderToSaveAndIssue() {
    this.orderToSave(0)
    // let {id, store_id} = this.state
    // if(id) {
    //   this.onCallThirdShips(id, store_id)
    // }else{
    //   showError('保存失败请重试！')
    // }
  }

  onCallThirdShips(id, store_id) {
    showModal('正在保存并发单，请稍等')
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: id,
      storeId: store_id,
      selectedWay: [],
      expectTime: this.state.expect_time,
      onBack: (res) => {
        hideModal();
        if (res && 1 > 0) {
          showSuccess('发配送成功')
          this.props.navigation.goBack();
        } else {
          showError('发配送失败，请联系运营人员')
        }
      }
    });
  }

  render() {
    const {location_long, location_lat, datePickerValue, is_right_once, orderAmount} = this.state
    let time = datePickerValue
    let str = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
    return (
        <ScrollView style={[styles.container, {flex: 1}]}>

          <Cells style={styles.deliverCellBorder}>

            <Cell>
              <CellHeader>
                <Label style={styles.cellLabel}>发</Label>
              </CellHeader>
              <CellBody>
                <Input
                    value={this.state.currentStoreName}
                    editable={false}
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                    clearButtonMode={true}
                />
              </CellBody>
            </Cell>

            <Cell onPress={this._toSetLocation}>
              <CellHeader>
                <Label style={styles.cellLabel}>收</Label>
              </CellHeader>
              <CellBody style={{flexDirection: "row", flex: 1, alignItems: 'center'}}>
                <MIcon name="map-marker-outline" size={26}/>
                <Text style={[styles.body_text]}>
                  {(location_long !== "" && location_lat !== "")
                  && `${location_long}(${location_lat})`}
                </Text>
              </CellBody>
              <CellFooter access/>
            </Cell>

            <Cell style={styles.addressDetail}>
              <CellBody>
                <List>
                  <InputItem
                      value={this.state.address}
                      placeholderTextColor={'black'}
                      onChangeText={value => {
                        this.setState({
                          address: value
                        });
                      }}
                      placeholder="楼号、单元、门牌号等"
                  />
                  <InputItem
                      value={this.state.name}
                      placeholderTextColor={'black'}
                      onChangeText={value => {
                        this.setState({
                          name: value
                        });
                      }}
                      placeholder="收货人姓名"
                  />
                  <InputItem
                      value={this.state.mobile}
                      placeholderTextColor={'black'}
                      onChangeText={value => {
                        this.setState({
                          mobile: value
                        });
                      }}
                      placeholder="收货人电话"
                  />
                  <InputItem
                      value={this.state.mobile_suffix}
                      placeholderTextColor={'black'}
                      onChangeText={value => {
                        this.setState({
                          mobile_suffix: value
                        });
                      }}
                      placeholder="分机号（选填）"
                  />
                </List>
              </CellBody>
            </Cell>

          </Cells>


          <Dialog visible={this.state.showDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>

          <Cells>

            <Cell>
              <CellHeader>
                <Label style={styles.labelFontStyle}>重量</Label>
              </CellHeader>
              <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
                <Input
                    placeholder="0"
                    placeholderTextColor={'black'}
                    style={{
                      borderColor: "black",
                      borderWidth: 1,
                      height: pxToDp(85),
                      width: pxToDp(100),
                      textAlign: 'center'
                    }}
                    keyboardType="numeric"
                    value={this.state.weight}
                    onChangeText={value => {
                      this.setState({
                        weight: value
                      })
                    }}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
              <CellFooter>千克</CellFooter>
            </Cell>

            <Cell>
              <CellHeader>
                <Label style={styles.labelFontStyle}>订单金额</Label>
                {(orderAmount > 0) && <Text style={{
                  position: "absolute",
                  left: pxToDp(130),
                  top: pxToDp(25),
                  fontSize: pxToDp(20),
                  color: colors.white,
                  backgroundColor: colors.main_color,
                  padding: 2,
                  borderRadius: 20
                }}>保价时需填写</Text>}
              </CellHeader>
              <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
                <Input
                    placeholder="0"
                    placeholderTextColor={'black'}
                    style={{
                      borderColor: "black",
                      borderWidth: 1,
                      height: pxToDp(85),
                      width: pxToDp(100),
                      marginRight: pxToDp(30),
                      textAlign: 'center'
                    }}
                    keyboardType="numeric"
                    value={this.state.orderAmount}
                    onChangeText={value => {
                      this.setState({
                        orderAmount: value
                      })
                    }}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
              <CellFooter>元</CellFooter>
            </Cell>
          </Cells>


          <Cells style={styles.deliverCellBorder}>
            <Cell onPress={() => {
              this.setState({
                showDateModal: true
              })
            }}>
              <CellHeader>
                <Label style={styles.labelFontStyle}>期望送达</Label>
              </CellHeader>
              <CellBody style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center'}}>
                <Input
                    editable={false}
                    placeholder="默认立即送达"
                    placeholderTextColor={Math.round(time / 1000) > Math.round(new Date() / 1000) ? 'white' : 'gray'}
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                    clearButtonMode={true}
                />
                <Text style={[styles.body_text]}>
                  {is_right_once ? `立即送达` : `${str}`}
                </Text>
              </CellBody>
              <CellFooter access style={{marginRight: pxToDp(20)}}/>
            </Cell>
          </Cells>

          <CellsTitle style={{fontSize: pxToDp(28), color: colors.fontBlack}}>订单备注</CellsTitle>
          <Cells style={CommonStyle.cells35}>
            <Cell>
              <CellBody>
                <TextArea
                    maxLength={60}
                    placeholder="请输入备注内容"
                    placeholderTextColor={'black'}
                    onChange={value => {
                      this.setState({remark: value});
                    }}
                    value={this.state.remark}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
            </Cell>
          </Cells>

          <WhiteSpace/>

          <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(20)}}>
            <TouchableOpacity onPress={() => {
              this.orderToSave(1)
            }}>
              <View
                  style={styles.saveButtonStyle1}>
                <Text style={styles.saveButtonStyle}> 保存 </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.orderToSaveAndIssue()}>
              <View
                  style={styles.saveSendButtonStyle}>
                <Text style={styles.saveButtonStyle}> 保存并发单 </Text>
              </View>
            </TouchableOpacity>
          </View>
          <WhiteSpace/>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999
  },
  cells: {
    marginTop: 0
  },
  body_text: {
    fontSize: pxToDp(25),
    color: colors.color333
  },
  containerModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fontGray,
  },
  deliverCellBorder: {
    borderRadius: pxToDp(20)
  },
  cellLabel: {
    color: colors.fontBlack,
    paddingLeft: pxToDp(50),
    fontWeight: "bold"
  },
  labelFontStyle: {
    color: colors.fontBlack
  },
  saveButtonStyle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold"
  },
  saveSendButtonStyle: {
    width: pxToDp(196),
    height: pxToDp(66),
    backgroundColor: colors.main_color,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50
  },
  saveButtonStyle1: {
    width: pxToDp(196),
    height: pxToDp(66),
    backgroundColor: colors.main_color,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50
  },
  addressDetail: {
    marginVertical: pxToDp(20),
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderSettingScene);
