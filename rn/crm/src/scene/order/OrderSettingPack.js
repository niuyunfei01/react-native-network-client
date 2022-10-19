import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import * as globalActions from "../../reducers/global/globalActions";
import {hideModal, showError, showModal, showSuccess, ToastShort} from "../../pubilc/util/ToastUtils";
import dayjs from "dayjs";
import Entypo from "react-native-vector-icons/Entypo";
import {Button, Slider} from 'react-native-elements';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import pxToDp from "../../pubilc/util/pxToDp";
import Config from "../../pubilc/common/config";
import {MixpanelInstance} from "../../pubilc/util/analytics";
import * as tool from "../../pubilc/util/tool";
import JbbModal from "../../pubilc/component/JbbModal";
import {TextArea} from "../../weui";
import Clipboard from '@react-native-community/clipboard'

let width = Dimensions.get("window").width;

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
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


class OrderSettingScene extends Component {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("创建订单");
    let {currStoreId, accessToken, store_info} = this.props.global
    this.state = {
      accessToken: accessToken,
      store_id: currStoreId,
      city: store_info?.city,
      store_name: store_info?.name,
      store_address: store_info?.dada_address,
      name: '',
      mobile: '',
      mobile_suffix: '',
      address: '',
      street_block: '',
      loc_lng: '',
      loc_lat: '',
      weight: 1,
      weight_min: 0,
      weight_max: 20,
      goods_price: 0,
      goods_price_value: 0,
      remark: '',
      showDateModal: false,
      showWeightModal: false,
      showGoodsPriceModal: false,
      showContentModal: false,
      show_smart_modal: false,
      mealTime: '',
      datePickerType: 'today',
      datePickerList: [],
      datePickerOther: [],
      callDelivery_Day: dayjs(new Date()).format('YYYY-MM-DD'),
      callDelivery_Time: dayjs(new Date()).format('HH:ii'),
      expect_time: Math.round(new Date() / 1000),
      is_right_once: 1,
      id: '',
      smartText: '',
      show_smart_input: false,
      isSaveToBook: false,
      address_id: '',
    };

  }

  setAddressInfo = (info) => {
    this.setState({
      address_id: info && info?.id,
      name: info && info?.name,
      mobile: info && info?.phone,
      mobile_suffix: info && info?.ext,
      loc_lat: info && info?.lat,
      loc_lng: info && info?.lng,
      address: info && info?.address,
      street_block: info && info?.street_block,
    })
  }


  goSelectAddress = () => {
    let {address, loc_lng, loc_lat, city} = this.state;
    let center = ""
    if (loc_lng && loc_lat) {
      center = loc_lng + ',' + loc_lat
    }
    const params = {
      center: center,
      cityName: city,
      show_select_city: false,
      keywords: address,
      onBack: (res) => {
        this.setAddress.bind(this)(res)
      },
    };
    this.props.navigation.navigate(Config.ROUTE_SEARC_HSHOP, params);
  }

  setAddress = (res) => {
    let Lng = (res.location).split(',')[0];
    let lat = (res.location).split(',')[1];
    let states = {
      loc_lng: Lng,
      loc_lat: lat,
    }
    if (res?.name) {
      states.address = res.name;
    }
    if (res?.address) {
      states.street_block = res?.address;
    }
    this.setState({...states})
  }

  selectStore = (store_info) => {
    this.setState({
      store_id: store_info?.id,
      store_name: store_info?.name,
      city: store_info?.city,
      store_address: store_info?.dada_address,
    })
  }

  componentDidMount() {
    this.getClipboardText()
  }

  getClipboardText = () => {
    Clipboard.getString().then(res => {
      if (tool.length(res) > 0) {
        Alert.alert('"外送帮"想从粘贴板粘贴', '你允许这样做吗？', [{
          text: '允许', onPress: () => {
            this.setState({
              smartText: res,
            }, () => {
              this.intelligentIdentification()
            })
          }
        }, {'text': '不允许'}]);
      }
    });

  }
  onPress = (route, params = {}) => {
    this.props.navigation.navigate(route, params);
  }

  timeOutBack = (time) => {
    this.cancelData()
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  updateAddressBook = () => {
    const {name, mobile, mobile_suffix, loc_lat, loc_lng, address, street_block, accessToken} = this.state
    const api = `/v1/new_api/address/updateAddress?access_token=${accessToken}`;
    let params = {
      name: name,
      phone: mobile,
      ext: mobile_suffix,
      lng: loc_lng,
      lat: loc_lat,
      address: address,
      street_block: street_block
    }
    HttpUtils.get.bind(this.props)(api, params).then()
  }

  intelligentIdentification = () => {
    const {smartText, accessToken, city} = this.state
    if (tool.length(smartText) <= 0) {
      return ToastShort("请粘贴地址", 0)
    }
    const api = `/v1/new_api/orders/distinguish_delivery_string?access_token=${accessToken}`;
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
        smartText: ''
      })

      const params = {
        cityName: city,
        show_select_city: false,
        keywords: res.address,
        onBack: (res) => {
          this.setAddress.bind(this)(res)
          this.setState({show_smart_modal: true,})
        },
      };
      this.props.navigation.navigate(Config.ROUTE_SEARC_HSHOP, params);
    })
  }


  orderToSave = (status) => {
    let {
      store_id,
      name,
      mobile,
      mobile_suffix,
      loc_lng,
      loc_lat,
      address,
      street_block,
      weight,
      goods_price,
      expect_time,
      remark,
      is_right_once,
      isSaveToBook,
      accessToken,
      address_id
    } = this.state

    if (!loc_lng && !loc_lng) {
      ToastShort('请先选择定位', 0);
      return this.goSelectAddress()
    }
    if(Number(goods_price) <= 0){
      return  ToastShort('请选择物品价值');
    }

    if(Number(weight) <= 0){
      return  ToastShort('请选择物品重量');
    }

    if (isSaveToBook) {
      this.updateAddressBook()
    }

    let params = {
      store_id,
      receiver: name,
      mobile,
      mobile_suffix,
      address: address + street_block,
      loc_lng,
      loc_lat,
      is_right_once,
      expect_time,
      remark,
      address_id,
      weight,
      money: goods_price,
    }

    showModal('正在保存订单，请稍等');
    const api = `/api/order_manual_create?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(api, params).then(res => {
      hideModal()
      showSuccess("保存成功！")
      if (status === 1) {
        this.mixpanel.track('新建订单_保存')
        this.timeOutBack(300);
      } else {
        this.mixpanel.track('新建订单_保存并发单')
        if (res.WaimaiOrder.id) {
          this.onCallThirdShips(res.WaimaiOrder.id, store_id)
        } else {
          showError('保存失败请重试！')
        }
      }
    }).catch(() => {
      hideModal()
    })
  }

  cancelData = () => {
    this.setState({
      expect_time: Math.round(new Date() / 1000),
      is_right_once: 1,
      name: '',
      mobile: '',
      mobile_suffix: '',
      address: '',
      street_block: '',
      loc_lng: '',
      loc_lat: '',
      weight: 0,
      goods_price: 0,
      smartText: '',
    })
  }

  onCallThirdShips = (id, store_id) => {
    showModal('正在保存并发单，请稍等')
    const {address_id, expect_time} = this.state
    this.props.navigation.navigate(Config.ROUTE_ORDER_CALL_DELIVERY, {
      order_id: id,
      store_id: store_id,
      expect_time: expect_time,
      address_id: address_id,
      onBack: (res) => {
        hideModal();
        if (res?.count > 0) {
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
    let {store_name, store_address} = this.state
    return (
      <View style={{flex: 1,}}>
        <KeyboardAwareScrollView enableOnAndroid={false}>
          <View style={{paddingHorizontal: 12, paddingVertical: 10}}>
            <TouchableOpacity
              onPress={() => {
                this.onPress(Config.ROUTE_STORE_SELECT, {
                  onBack: (item) => {
                    this.selectStore(item)
                  }
                })
              }}
              style={{
                borderRadius: 4,
                height: 69,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.white,
                padding: 12,
              }}>
              <View>
                <Text style={{fontSize: 16, color: colors.color333, fontWeight: '500'}}>
                  {tool.length((store_name || '')) > 12 ? store_name.substring(0, 11) + '...' : store_name} </Text>
                <View style={{marginTop: 6, flexDirection: 'row', alignItems: 'center'}}>
                  <Entypo style={{fontSize: 16, color: colors.color666}} name={'location-pin'}/>
                  <Text style={{
                    color: colors.color666,
                    fontSize: 12
                  }}>{tool.length((store_address || '')) > 18 ? '...' + store_address.substring(-18) : store_address}  </Text>
                </View>
              </View>
              <Entypo name='chevron-thin-right' style={styles.locationIcon}/>
            </TouchableOpacity>

            {this.renderUserFrom()}
            {this.renderGoodsFrom()}
            {this.renderContent()}
            {this.renderWeightModal()}
            {this.renderGoodsPriceModal()}
            {this.renderSmartModal()}
            {this.renderContentModal()}
            {this.renderDatePicker()}
          </View>
        </KeyboardAwareScrollView>
        {this.renderBtn()}
      </View>
    )
  }

  renderUserFrom = () => {
    let {mobile, address, smartText, name, mobile_suffix, street_block, show_smart_input} = this.state;
    return (
      <View
        style={{
          borderRadius: 4,
          backgroundColor: colors.white,
          padding: 12,
          marginTop: 10,
          // height: 292,
        }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: '500', fontSize: 14, color: colors.color333}}>地址 </Text>
          <TouchableOpacity onPress={this.goSelectAddress} style={{
            flex: 1,
            borderColor: colors.e5,
            borderRightWidth: 1,
          }}>
            <Text style={{
              fontSize: 14,
              color: tool.length(address) > 0 ? colors.color333 : colors.color999,
            }}>{tool.length(address) > 0 ? address : '收件人地址，如小区/大厦/学校'} </Text>
          </TouchableOpacity>
          <Text onPress={() => {
            this.onPress(Config.ROUTE_ORDER_ADDRESS_BOOK, {
              onBack: resp => {
                this.setAddressInfo(resp)
              }
            })
          }} style={{
            width: 54,
            fontSize: 14,
            color: colors.color666,
            textAlign: 'right'
          }}>地址簿 </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: '500', fontSize: 14, color: colors.color333}}>门牌号 </Text>
          <TextInput placeholder="详细楼号，单元，门牌号（选填） "
                     underlineColorAndroid="transparent"
                     style={{height: 50, flex: 1}}
                     placeholderTextColor={'#999'}
                     value={street_block}
                     onChangeText={street_block => {
                       this.setState({street_block});
                     }}
          />
        </View>


        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: '500', fontSize: 14, color: colors.color333}}>联系人 </Text>
          <TextInput placeholder="收件人姓名"
                     underlineColorAndroid="transparent"
                     style={{height: 50, flex: 1}}
                     placeholderTextColor={'#999'}
                     value={name}
                     onChangeText={value => {
                       this.setState({name: value});
                     }}
          />
        </View>


        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: '500', fontSize: 14, color: colors.color333}}>电话 </Text>
          <View style={{
            flex: 1,
            borderColor: colors.e5,
            borderRightWidth: 1,
          }}>
            <TextInput placeholder="联系电话 "
                       maxLength={11}
                       underlineColorAndroid="transparent"
                       placeholderTextColor={'#999'}
                       keyboardType={'numeric'}
                       value={mobile}
                       onChangeText={value => {
                         const newText = value.replace(/[^\d]+/, '');
                         this.setState({mobile: newText});
                       }}
            />
          </View>

          <TextInput placeholder="分机号(选填)"
                     maxLength={4}
                     underlineColorAndroid="transparent"
                     style={{width: 77, fontSize: 14, color: colors.color333}}
                     placeholderTextColor={colors.color666}
                     keyboardType={'numeric'}
                     value={mobile_suffix}
                     onChangeText={value => {
                       const newText = value.replace(/[^\d]+/, '');
                       this.setState({mobile_suffix: newText});
                     }}
                     textAlign='center'
          />
        </View>
        <View style={{
          borderRadius: 4,
          marginTop: 11
        }}>
          <TextArea
            showCounter={false}
            style={{
              height: show_smart_input ? 110 : 44,
              fontSize: 12,
              paddingLeft: 10,
              borderRadius: 5,
              backgroundColor: colors.f5,
            }}
            onBlur={() => {
              this.setState({
                show_smart_input: true
              })
            }}
            placeholder={show_smart_input ? "复制粘贴收货人信息至此,点击智能填写,系统会自动识别并自动填入(若不按指定格式填写,识别将会不精确)。如: 张三 北京市东城区景山前街4号 16666666666"
              : "智能地址识别"}
            placeholderTextColor={colors.color999}
            onChange={value => {
              this.setState({smartText: value});
            }}
            value={smartText}
            underlineColorAndroid={"transparent"}
          />

          <If condition={show_smart_input}>
            <Button title={'识别'}
                    onPress={this.intelligentIdentification}
                    containerStyle={{
                      borderRadius: 5,
                      width: 70,
                      position: 'absolute',
                      top: 70, right: 5,
                    }}
                    buttonStyle={{
                      backgroundColor: colors.main_color,
                    }}
                    titleStyle={{color: colors.white, fontSize: 12, lineHeight: 20}}/>

          </If>

        </View>

      </View>
    )
  }

  renderGoodsFrom = () => {
    let {weight, goods_price, is_right_once, mealTime} = this.state;
    return (
      <View
        style={{
          borderRadius: 4,
          backgroundColor: colors.white,
          paddingHorizontal: 12,
          marginTop: 10,
          height: 184,
        }}>
        <TouchableOpacity onPress={() => {
          this.setState({
            showWeightModal: true
          })
        }} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 56,
        }}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>物品重量 </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: weight > 0 ? colors.color333 : colors.color999,
              textAlign: 'right'
            }}>{weight > 0 ? weight + 'Kg' : '请选择物品重量'}</Text>
          <Entypo name='chevron-thin-right'
                  style={styles.locationIcon}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          this.setState({
            showGoodsPriceModal: true
          })
        }} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 63,
        }}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>物品价值 </Text>

          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: goods_price > 0 ? colors.color333 : colors.color999,
              textAlign: 'right'
            }}>{goods_price > 0 ? goods_price + '元' : '请选择物品价值'}</Text>

          <Entypo name='chevron-thin-right'
                  style={styles.locationIcon}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          this.setState({
            showDateModal: true,
            datePickerList: this.timeSlot(10, true)
          })
        }} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 63,
        }}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>期望送达 </Text>

          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.color333,
              textAlign: 'right'
            }}>{is_right_once === 0 ? mealTime : '立即送达'}</Text>

          <Entypo name='chevron-thin-right'
                  style={styles.locationIcon}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderContent = () => {
    let {remark} = this.state;
    return (
      <TouchableOpacity onPress={() => {
        this.setState({
          showContentModal: true
        })
      }}
                        style={{
                          borderRadius: 4,
                          backgroundColor: colors.white,
                          paddingHorizontal: 12,
                          marginTop: 10,
                        }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 63,
        }}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>备注信息 </Text>

          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: tool.length(remark) > 0 ? colors.color333 : colors.color999,
              textAlign: 'right'
            }}>{tool.length(remark) > 0 ? '已备注' : '请填写备注信息'}</Text>

          <Entypo name='chevron-thin-right'
                  style={styles.locationIcon}/>
        </View>
      </TouchableOpacity>
    )
  }

  closeModal = () => {
    this.setState({
      showWeightModal: false,
      showGoodsPriceModal: false,
      showContentModal: false,
      showDateModal: false,
      show_smart_modal: false,
    })
  }

  renderWeightModal = () => {
    let {showWeightModal, weight_min, weight_max, weight,} = this.state;
    return (
      <JbbModal visible={showWeightModal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
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
                  {weight}
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
                  value={weight}
                  maximumValue={weight_max}
                  minimumValue={weight_min}
                  step={1}
                  trackStyle={{height: 6, borderRadius: 7}}
                  thumbStyle={{
                    height: 26,
                    width: 26,
                    borderRadius: 13,
                    backgroundColor: colors.colorEEE
                  }}
                  onValueChange={(value) => {
                    this.setState({weight: value})
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
                    onPress={this.closeModal}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      length: 48,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }
  setGoodsPirce = (price) => {
    this.setState({
      goods_price: price
    })
  }

  renderGoodsPriceModal = () => {
    let {showGoodsPriceModal, goods_price_value, goods_price} = this.state;
    return (
      <JbbModal visible={showGoodsPriceModal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'center'}>
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
                  borderColor: Number(info.value) === goods_price ? colors.main_color : colors.colorDDD,
                  fontSize: 14,
                  color: Number(info.value) === goods_price ? colors.main_color : colors.color333,
                  backgroundColor: Number(info.value) === goods_price ? '#DFFAE2' : colors.white,
                  width: width * 0.25,
                  textAlign: 'center',
                  paddingVertical: 8,
                  marginVertical: 5
                }} onPress={() => {
                  this.setGoodsPirce(Number(info.value))
                }}>{info.label} </Text>
              </For>
              <TextInput
                onChangeText={(goods_price_value) => {
                  this.setState({goods_price_value: Number(goods_price_value), goods_price: 0})
                }}
                defaultValue={goods_price_value}
                value={goods_price_value}
                placeholderTextColor={colors.color999}
                underlineColorAndroid='transparent'
                placeholder="自定义"
                keyboardType={'numeric'}
                style={{
                  fontSize: 14,
                  width: width * 0.53,
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
                      if (goods_price === 0) this.setGoodsPirce(goods_price_value)
                      this.closeModal()
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      length: 48,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderSmartModal = () => {
    let {show_smart_modal, address, name, street_block, mobile} = this.state;
    return (
      <JbbModal visible={show_smart_modal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'center'}>
        <View style={{marginBottom: 20}}>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              使用复制的收件信息？
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>

          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <View style={{paddingHorizontal: 20, paddingBottom: 20}}>
              <View style={{flexDirection: "row", alignItems: 'center'}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>地址： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{tool.length((address || '')) > 10 ? address.substring(0, 9) + '...' : address} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>门牌号： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{street_block} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>联系人： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{name} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>联系电话： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{mobile} </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Button title={'取消'}
                      onPress={() => {
                        this.cancelData()
                        this.closeModal()
                      }}
                      containerStyle={{
                        flex: 1,
                        borderRadius: 20,
                        length: 40,
                        marginRight: 10
                      }}
                      buttonStyle={{
                        backgroundColor: colors.f5,
                      }}
                      titleStyle={{color: colors.color333, fontWeight: '500', fontSize: 16, lineHeight: 28}}/>

              <Button title={'确定'}
                      onPress={this.closeModal}
                      containerStyle={{
                        flex: 1,
                        borderRadius: 20,
                        length: 40,
                      }}
                      buttonStyle={{
                        backgroundColor: colors.main_color,
                      }}
                      titleStyle={{color: colors.white, fontWeight: '500', fontSize: 16, lineHeight: 28}}/>
            </View>
          </View>
        </View>
      </JbbModal>
    )
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
      if (isNow && timeArr.findIndex((item) => item.label === '立即送达')) {
        timeArr.unshift({label: '立即送达'})
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

  checkDateItem = (idx, item) => {
    let {
      datePickerType,
      datePickerList,
      datePickerOther,
    } = this.state
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
    if (item?.label !== '立即送达') {
      this.setState({callDelivery_Time: item?.label, is_right_once: 0})
    } else {
      this.setState({
        callDelivery_Time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        is_right_once: 1
      })
    }
  }

  renderDatePicker = () => {
    let {
      datePickerType,
      datePickerList,
      showDateModal,
      datePickerOther,
      callDelivery_Day,
      callDelivery_Time
    } = this.state
    let mealtime = callDelivery_Day + ' ' + callDelivery_Time
    return (
      <JbbModal onClose={this.closeModal} visible={showDateModal} HighlightStyle={{padding: 0}}
                modalStyle={{padding: 0}}
                modal_type={'bottom'}>
        <View>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              期望送达时间
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>

          <View
            style={{flexDirection: "row", justifyContent: "space-evenly", paddingHorizontal: 12, paddingVertical: 5}}>
            <View style={{flexDirection: "column", justifyContent: "space-around", flex: 1}}>
              <TouchableOpacity style={datePickerType === 'today' ? styles.datePickerActive : styles.datePicker}
                                onPress={() => {
                                  this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                                  this.setState({
                                    datePickerType: 'today',
                                    callDelivery_Day: dayjs(new Date()).format('YYYY-MM-DD')
                                  })
                                }}>
                <Text style={datePickerType === 'today' ? styles.dateTextActive : styles.dateText}>
                  今天
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={datePickerType === 'tomorrow' ? styles.datePickerActive : styles.datePicker}
                                onPress={() => {
                                  this._scrollView.scrollTo({x: 0, y: 0, animated: true})
                                  this.setState({
                                    datePickerType: 'tomorrow',
                                    callDelivery_Day: this.createDatePickerArray()[1],
                                    datePickerOther: this.timeSlot(10, false)
                                  })
                                }}>
                <Text style={datePickerType === 'tomorrow' ? styles.dateTextActive : styles.dateText}>
                  明天
                </Text>
              </TouchableOpacity>

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
                directionalLockEnabled={true}
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
                    style={item?.isChosed ? styles.datePickerItemActive : styles.datePickerItem}
                    onPress={() => this.checkDateItem(idx, item)}>
                    <Text style={item?.isChosed ? styles.dateTextActive : styles.dateText}>{item.label} </Text>
                    <View style={{width: 20, height: 20, marginVertical: pxToDp(15)}}>
                      {item?.isChosed ?
                        <View style={styles.datePickerIcon}>
                          <Entypo name='check' style={{fontSize: 13, color: colors.white,}}/>
                        </View> :
                        <Entypo name='circle' style={{fontSize: 20, color: colors.fontGray}}/>}
                    </View>
                  </TouchableOpacity>
                </For>
              </ScrollView>
            </View>
          </View>
          <Button title={'确 定'}
                  onPress={() => {
                    this.setState({dateValue: mealtime, mealTime: mealtime, showDateModal: false})
                  }}
                  buttonStyle={[{
                    backgroundColor: colors.main_color,
                    borderRadius: 24,
                    marginHorizontal: 10,
                    length: 48,
                  }]}
                  titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
        </View>
      </JbbModal>
    )
  }

  renderContentModal = () => {
    let {showContentModal, remark} = this.state;
    return (
      <JbbModal visible={showContentModal} onClose={this.closeModal} modal_type={'center'}>
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
              value={remark}
              onChange={(remark) => this.setState({remark})}
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
                      this.closeModal()
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 24,
                      length: 48,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderBtn = () => {
    return (
      <View style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: colors.white,
        padding: 10
      }}>
        <Button title={'保存订单'}
                onPress={() => this.orderToSave(1)}
                containerStyle={{flex: 1}}
                buttonStyle={{
                  backgroundColor: colors.white,
                  borderColor: colors.main_color,
                  borderWidth: 1,
                  borderRadius: 20,
                  length: 42,
                }}
                titleStyle={{color: colors.main_color, fontWeight: '500', fontSize: 16, lineHeight: 22}}
        />
        <Button title={'下配送单'}
                onPress={() => this.orderToSave(0)}
                containerStyle={{flex: 1, marginLeft: 20}}
                buttonStyle={{
                  backgroundColor: colors.main_color,
                  borderRadius: 20,
                  length: 42,
                }}
                titleStyle={{color: colors.white, fontWeight: '500', fontSize: 16, lineHeight: 22}}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {flex: 1},
  locationIcon: {fontSize: 16, fontWeight: "bold", color: colors.color666},
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderSettingScene);
