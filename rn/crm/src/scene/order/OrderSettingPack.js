import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {InteractionManager, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import CommonStyle from "../../pubilc/util/CommonStyles";
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";
import {DatePickerView} from "@ant-design/react-native"
import {Input, TextArea} from "../../weui/index";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import {hideModal, showError, showModal, showSuccess, ToastShort} from "../../pubilc/util/ToastUtils";
import HttpUtils from "../../pubilc/util/http";
import Entypo from "react-native-vector-icons/Entypo";
import {CheckBox} from 'react-native-elements';
import * as globalActions from "../../reducers/global/globalActions";
import DateTimePicker from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import {MixpanelInstance} from "../../pubilc/util/analytics";

function mapStateToProps(state) {
  return {
    global: state.global
  };
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

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}


class OrderSettingScene extends Component {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("创建订单");
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
      coordinates: '',
      inputShow: false,
      smartText: '',
      isSaveToBook: false,
      addressId: '',
      refreshDom: false
    };
    this._toSetLocation = this._toSetLocation.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (state.refreshDom) {
      return null;
    } else {
      return {
        name: props.route.params && props.route.params.addressItem !== undefined ? props.route.params.addressItem.name : '',
        mobile: props.route.params && props.route.params.addressItem !== undefined ? props.route.params.addressItem.phone : '',
        address: props.route.params && props.route.params.addressItem !== undefined ? props.route.params.addressItem.address : '',
        addressId: props.route.params && props.route.params.addressItem !== undefined ? props.route.params.addressItem.id : '',
      }
    }
  }

  getCurrentStoreName = () => {
    let {currStoreName} = tool.vendor(this.props.global);
    this.setState({
      currentStoreName: currStoreName
    })
  }

  _toSetLocation = () => {
    this.mixpanel.track('请选择收货地址')
    const {location_long, location_lat, coordinates} = this.state
    let center = ""
    if (location_long && location_lat) {
      center = coordinates
    }

    const params = {
      action: Config.LOC_PICKER,
      center: center,
      loc_lat: tool.store(this.props.global).loc_lat,
      loc_lng: tool.store(this.props.global).loc_lng,
      isType: "orderSetting",
      onBack: resp => {
        let {name, address, location} = resp;
        let locate = name;
        let locate1 = address === '' ? name : address;
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

  onPress = (route, params = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  timeOutBack = (time) => {
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  showDatePicker = () => {
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
          <Text style={styles.modalCancelText1}>确 认</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  onConfirm = () => {
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
    showSuccess(`设置送达时间为${dayjs(time).format('YYYY-MM-DD HH:mm')}`)
  }

  onRequestClose = () => {
    this.setState({
      showDateModal: false,
      expect_time: ''
    })
  }

  updateAddressBook = () => {
    const {name, mobile, mobile_suffix, loc_lat, loc_lng, location_lat, location_long, address} = this.state
    const api = `/v1/new_api/address/updateAddress?access_token=${this.state.accessToken}`;
    let params = {
      name: name,
      phone: mobile,
      lng: loc_lng,
      lat: loc_lat,
      ext: mobile_suffix,
      address: location_lat + location_long,
      street_block: address
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      ToastShort('地址保存成功')
    })
  }

  intelligentIdentification = () => {
    const {smartText} = this.state
    const api = `/v1/new_api/orders/distinguish_delivery_string?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(this.props)(api, {
      copy_string: smartText
    }).then(res => {
      if (res.phone === '') {
        ToastShort('电话号识别失败！')
      } else if (res.name === '') {
        ToastShort('姓名识别失败！')
      } else if (res.address === '') {
        ToastShort('地址识别失败！')
      }
      this.setState({
        name: res.name,
        address: res.address,
        mobile: res.phone,
        refreshDom: true,
        smartText: ''
      })
    })
  }

  orderToSave = (status) => {
    let {
      remark, address, name, mobile,
      mobile_suffix, weight, orderAmount, expect_time, store_id,
      is_right_once, loc_lng, loc_lat, location_long, location_lat, isSaveToBook, addressId
    } = this.state
    const self = this;

    if (!loc_lng && !loc_lng) {
      ToastShort('请先选择定位');
      this._toSetLocation()
      return
    }

    if (isSaveToBook) {
      this.updateAddressBook()
    }

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
      "address_id": addressId
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
    })
  }

  orderToSaveAndIssue = () => {
    this.mixpanel.track('新建订单_保存并发单')
    this.orderToSave(0)
  }

  onCallThirdShips = (id, store_id) => {
    showModal('正在保存并发单，请稍等')
    const {addressId} = this.state
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: id,
      storeId: store_id,
      selectedWay: [],
      expectTime: this.state.expect_time,
      addressId: addressId,
      onBack: (res) => {
        hideModal();
        if (res && 1 > 0) {
          showSuccess('发配送成功')
          setTimeout(() => {
            this.props.navigation.goBack();
          }, 1000)
        } else {
          showError('发配送失败，请联系运营人员')
        }
      }
    });
  }

  render() {
    const {
      location_long,
      location_lat,
      datePickerValue,
      is_right_once,
      orderAmount,
      inputShow,
      isSaveToBook
    } = this.state
    let time = datePickerValue
    let str = dayjs(time).format('YYYY-MM-DD HH:mm')
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.getCurrentStoreName.bind(this)}/>
        <ScrollView style={[styles.container]}>
          <View style={styles.containerTitle}>
            <View style={styles.containerTitleSend}>
              <View style={styles.titleLabel}>
                <Text style={styles.titleLabelText}>寄</Text>
              </View>
              <Input
                value={this.state.currentStoreName}
                editable={false}
                underlineColorAndroid={"transparent"}
                style={CommonStyle.inputH35}
                clearButtonMode={true}
              />
            </View>
            <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={this._toSetLocation}>
              <View style={styles.containerTitlePut}>
                <Text style={styles.titleLabelText}>收</Text>
              </View>
              <Text style={[styles.body_text, {flex: 1}]}>
                {(location_long !== "" && location_lat !== "")
                  ? `${location_long}(${location_lat})` : `请选择定位地址`}
              </Text>
              <Entypo name='chevron-thin-right'
                      style={styles.locationIcon}/>
            </TouchableOpacity>
          </View>
          <View style={styles.containerInfo}>
            <View style={styles.containerInfoAddress}>
              <Text style={{color: colors.color333, marginLeft: 18, marginRight: 10}}>详细地址：</Text>
              <TextInput placeholder="楼号、单元、门牌号等 "
                         underlineColorAndroid="transparent"
                         style={{height: 50, flex: 2}}
                         placeholderTextColor={'#999'}
                         value={this.state.address}
                         onChangeText={value => {
                           this.setState({address: value, refreshDom: true});
                         }}
              />
              <TouchableOpacity style={{
                paddingHorizontal: 20,
                height: 50,
                justifyContent: "center",
                alignItems: 'center'
              }}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_ORDER_ADDRESS_BOOK)
                                  this.setState({
                                    refreshDom: false
                                  })
                                }}><Text style={{color: '#FFD04B'}}> 地址簿 </Text></TouchableOpacity>
            </View>
            <View style={styles.containerInfoName}>
              <Text style={{color: colors.color333, marginLeft: 18, marginRight: 10}}>收货人：</Text>
              <TextInput placeholder="请输入收货人姓名"
                         underlineColorAndroid="transparent"
                         style={{height: 50, marginLeft: 13, width: '80%'}}
                         placeholderTextColor={'#999'}
                         value={this.state.name}
                         onChangeText={value => {
                           this.setState({name: value, refreshDom: true});
                         }}
              />
            </View>
            <View style={styles.containerInfoMobile}>
              <Text style={{color: colors.color333, marginLeft: 15, marginRight: 10}}> 联系方式：</Text>
              <TextInput placeholder="请输入收货人手机号 "
                         maxLength={11}
                         underlineColorAndroid="transparent"
                         style={{height: 50, flex: 3}}
                         placeholderTextColor={'#999'}
                         keyboardType={'numeric'}
                         value={this.state.mobile}
                         onChangeText={value => {
                           const newText = value.replace(/[^\d]+/, '');
                           this.setState({mobile: newText, refreshDom: true});
                         }}
              />
              <TextInput placeholder="分机号(选填)"
                         maxLength={4}
                         underlineColorAndroid="transparent"
                         style={{height: 50, borderLeftColor: '#ddd', borderLeftWidth: 1, flex: 2, paddingStart: -10}}
                         placeholderTextColor={'#999'}
                         keyboardType={'numeric'}
                         value={this.state.mobile_suffix}
                         onChangeText={value => {
                           const newText = value.replace(/[^\d]+/, '');
                           this.setState({mobile_suffix: newText});
                         }}
                         textAlign='center'
              />
            </View>
            <View style={{flexDirection: "column", padding: 15, position: "relative"}}>
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <TouchableOpacity style={this.state.inputShow ? styles.inputActivity : styles.inputNormal}
                                  onPress={() => {
                                    this.setState({
                                      inputShow: !inputShow
                                    })
                                  }}>
                  <Text style={{color: colors.white, fontSize: 12}}>智能填写</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={() => {
                  this.setState({
                    isSaveToBook: !isSaveToBook
                  })
                }}>
                  <CheckBox
                    checked={this.state.isSaveToBook}
                    checkedColor={colors.main_color}
                    checkedIcon='dot-circle-o'
                    uncheckedIcon='circle-o'
                    uncheckedColor='#979797'
                    size={18}
                    onPress={() => {
                      this.setState({
                        isSaveToBook: !isSaveToBook
                      })
                    }}/>
                  <Text style={{color: colors.color333, fontSize: 14, marginLeft: -10}}>保存到地址簿</Text>
                </TouchableOpacity>
              </View>
              {
                this.state.inputShow &&
                <TextArea
                  maxLength={240}
                  style={styles.showInput}
                  placeholder="复制粘贴收货人信息至此,点击智能填写,系统会自动识别并自动填入(若不按指定格式填写,识别将会不精确)。如: 张三 北京市东城区景山前街4号 16666666666"
                  placeholderTextColor={'#bbb'}
                  onChange={value => {
                    this.setState({smartText: value});
                  }}
                  value={this.state.smartText}
                  underlineColorAndroid={"transparent"}
                />
              }
              {
                this.state.inputShow &&
                <TouchableOpacity style={styles.showInputBtn} onPress={() => {
                  this.intelligentIdentification()
                }}>
                  <Text style={{color: colors.white, fontSize: 12}}>智能识别</Text>
                </TouchableOpacity>}
            </View>
          </View>

          <DateTimePicker
            is24Hour={true}
            cancelTextIOS={'取消'}
            confirmTextIOS={'确定'}
            customHeaderIOS={() => {
              return (<View/>)
            }}
            minimumDate={new Date()}
            date={datePickerValue}
            mode='datetime'
            isVisible={this.state.showDateModal}
            onConfirm={(date) => {
              this.setState({datePickerValue: date, showDateModal: false}, () => {
                setTimeout(() => {
                  this.onConfirm()
                }, 1000)
              })
            }}
            onCancel={() => this.onRequestClose()}
          />

          <View style={{backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10}}>
            <View style={styles.containerSetWeight}>
              <Text style={{color: colors.color333}}> 重量：</Text>
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <TextInput placeholder="0"
                           underlineColorAndroid="transparent"
                           style={styles.containerSetWeightInput}
                           placeholderTextColor={'#ddd'}
                           keyboardType={'numeric'}
                           value={this.state.weight}
                           onChangeText={value => {
                             const newText = value.replace(/[^\d]+/, '');
                             this.setState({weight: newText});
                           }}
                           textAlign='center'
                />
                <Text style={{color: colors.color333, marginHorizontal: 10}}>千克</Text>
              </View>
            </View>
            <View style={styles.containerSetAmount}>
              <Text style={{color: colors.color333}}> 订单金额：</Text>
              {(orderAmount > 0) && <View style={styles.containerSetAmountNotice}><Text
                style={{fontSize: pxToDp(16), color: colors.white}}>保价时需填写</Text></View>}
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <TextInput placeholder="0"
                           underlineColorAndroid="transparent"
                           style={styles.containerSetWeightInput}
                           placeholderTextColor={'#ddd'}
                           keyboardType={'numeric'}
                           value={this.state.orderAmount}
                           onChangeText={value => {
                             const newText = value.replace(/[^\d]+/, '');
                             this.setState({orderAmount: newText});
                           }}
                           textAlign='center'
                />
                <Text style={{color: colors.color333, marginRight: 10, marginLeft: 24}}>元</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.dateModal} onPress={() => {
            this.setState({showDateModal: true})
          }}>
            <Text style={{color: colors.color333}}> 期望送达：</Text>
            <TextInput placeholder="默认立即送达"
                       underlineColorAndroid="transparent"
                       style={{height: 40}}
                       placeholderTextColor={Math.round(time / 1000) > Math.round(new Date() / 1000) ? 'white' : '#bbb'}
                       textAlign='center'
                       editable={false}
            />
            <View style={{flexDirection: "row"}}>
              <Text style={{color: colors.color333}}>
                {is_right_once ? `立即送达` : `${str}`}
              </Text>
              {is_right_once ?
                <Entypo name='chevron-thin-right'
                        style={styles.dateModalIcon}/> : null}
            </View>
          </TouchableOpacity>
          <View
            style={styles.setOrderRemark}>
            <View style={styles.orderRemark}>
              <Text style={{color: colors.color333, height: 20, fontWeight: "bold"}}>订单备注</Text>
            </View>
            <TextArea
              maxLength={60}
              style={{fontSize: 16, paddingLeft: 10}}
              placeholder=" 请输入不少于10个字的描述"
              placeholderTextColor={'#bbb'}
              onChange={value => {
                this.setState({remark: value});
              }}
              value={this.state.remark}
              underlineColorAndroid={"transparent"}
            />
          </View>
        </ScrollView>
        <View style={styles.saveBtn}>
          <TouchableOpacity onPress={() => {
            this.mixpanel.track('新建订单_保存')
            this.orderToSave(1)
          }}>
            <View style={styles.saveButtonStyle1}>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
  containerTitle: {backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10},
  containerTitleSend: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  titleLabel: {
    backgroundColor: '#59B26A',
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    margin: 15
  },
  titleLabelText: {color: colors.white, fontSize: 16},
  containerTitlePut: {
    backgroundColor: '#FFB44B',
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    margin: 15
  },
  locationIcon: {fontSize: 16, fontWeight: "bold", color: colors.color999, marginRight: 20},
  containerInfo: {backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10},
  containerInfoAddress: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  containerInfoName: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  containerInfoMobile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  showInput: {
    fontSize: 12,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#EEEEEE',
    marginBottom: 20
  },
  showInputBtn: {
    backgroundColor: colors.main_color,
    borderRadius: 10,
    padding: 10,
    width: 100,
    marginTop: 10,
    position: "absolute",
    right: 70,
    top: 147,
    justifyContent: "center",
    alignItems: "center"
  },
  containerSetWeight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  containerSetWeightInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.colorDDD,
    width: 80,
    borderRadius: 5
  },
  containerSetAmount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  containerSetAmountNotice: {
    position: "absolute",
    left: pxToDp(160),
    top: pxToDp(40),
    backgroundColor: colors.main_color,
    padding: 2,
    borderRadius: 10
  },
  dateModal: {
    backgroundColor: colors.white,
    width: '96%',
    margin: '2%',
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "space-between"
  },
  dateModalIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.color999,
    marginHorizontal: 10
  },
  orderRemark: {
    flexDirection: "row",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  setOrderRemark: {backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10, paddingBottom: 10},
  saveBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: pxToDp(20),
    backgroundColor: colors.white,
    paddingVertical: 10
  },
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999
  },
  cells: {
    marginTop: 0
  },
  body_text: {
    fontSize: pxToDp(25),
    color: colors.color999
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
    borderRadius: 5
  },
  saveButtonStyle1: {
    width: pxToDp(196),
    height: pxToDp(66),
    backgroundColor: colors.main_color,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5
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
    color: colors.theme,
    fontSize: pxToDp(40)
  },
  inputActivity: {backgroundColor: colors.main_color, borderRadius: 10, padding: 5, width: 60},
  inputNormal: {backgroundColor: '#A7A7A7', borderRadius: 10, padding: 5, width: 60}
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderSettingScene);
