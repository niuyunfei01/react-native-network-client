import React, {PureComponent} from 'react';
import {Platform, ScrollView, Text, TextInput, View} from 'react-native'

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  check_is_bind_ext,
  customerApply,
  getCommonConfig,
  setCurrentStore
} from '../../../reducers/global/globalActions'

import native from "../../../pubilc/util/native";
import stringEx from "../../../pubilc/util/stringEx"
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from '../../../pubilc/util/pxToDp';
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import Config from "../../../pubilc/common/config";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import {mergeMixpanelId, MixpanelInstance} from "../../../pubilc/util/analytics";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {hideModal, showModal, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";

import dayjs from "dayjs";
import JPush from "jpush-react-native";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {Button} from "react-native-elements";
import geolocation from "@react-native-community/geolocation";


/**
 * ## Redux boilerplate
 */
function mapStateToProps(state) {
  return {
    userProfile: state.global.currentUserPfile,
    accessToken: state.global.accessToken
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getCommonConfig,
      customerApply,
      check_is_bind_ext,
      setCurrentStore
    }, dispatch)
  }
}

class ApplyScene extends PureComponent {

  constructor(props) {
    super(props)
    this.mixpanel = MixpanelInstance;
    this.state = {
      mobile: this.props.route.params.mobile,
      verifyCode: this.props.route.params.verifyCode,
      name: '',
      address: '',
      shopName: '',
      value: [],
      canAskReqSmsCode: false,
      doingApply: false,
      location_long: '',
      location_lat: '',
      detail_address: '',
      shelfNos: [],
      pickerName: "请选择",
      pickerValue: "",
      cityname: '',
      referrer_id: '',
    };
    this.getTypeList()
    this.autoGetgeolocation()
  }

  getTypeList() {
    let accessToken = this.props.accessToken;
    HttpUtils.get.bind(this.props)(`/v1/new_api/Stores/sale_categories?access_token=${accessToken}`, {}).then(res => {
      res.map((v, i) => {
        v.label = v.name
        v.value = v.id
      })
      this.setState({
        shelfNos: res
      })
    }).catch((success, errorMsg) => {
      ToastShort(errorMsg)
    })
  }

  autoGetgeolocation = () => {
    let that = this
    geolocation.getCurrentPosition((pos) => {
      let coords = pos.coords;
      let location = coords.longitude + "," + coords.latitude;
      let url = "https://restapi.amap.com/v3/geocode/regeo?parameters?";
      const params = {
        key: '85e66c49898d2118cc7805f484243909',
        location: location,
      }
      Object.keys(params).forEach(key => {
          url += '&' + key + '=' + params[key]
        }
      )
      fetch(url).then(response => response.json()).then((data) => {
        if (data.status === "1") {
          console.log(data, 'data1')
          that.setState({
            cityname: data.regeocode.addressComponent.city,
            address: data.regeocode.addressComponent.township + data.regeocode.addressComponent.streetNumber.street,
            location_long: coords.longitude,
            location_lat: coords.latitude,
          })
        }
      });
    })
  }


  onApply() {

    if (!this.state.pickerValue) {
      ToastShort('请先选择店铺类型')
      return false
    }

    if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
      ToastShort('手机号有误')
      return false
    }
    if (!this.state.verifyCode) {
      ToastShort('请输入短信验证码')
      return false
    }
    if (!this.state.name) {
      ToastShort('请输入门店联系人')
      return false
    }
    if (!this.state.shopName) {
      ToastShort('请输入门店名称')
      return false
    }
    if (!this.state.address) {
      ToastShort('请输入门店地址')
      return false
    }

    if (tool.length(this.state.location_lat) === 0 || tool.length(this.state.location_long) === 0) {
      ToastShort('请选择定位')
      return false
    }
    if (this.state.doingApply) {
      return false;
    }
    this.doApply();
  }


  doApply() {
    this.setState({doingApply: true});
    showModal("提交中")
    let data = {
      sale_category: this.state.pickerValue,
      mobile: this.state.mobile,
      dada_address: `${this.state.address}${this.state.detail_address}`,
      name: this.state.shopName,
      verifyCode: this.state.verifyCode,
      referrer_id: this.state.referrer_id,
      owner_name: this.state.name,
      labels: [],
      lat: this.state.location_lat,
      lng: this.state.location_long
    };


    const {dispatch} = this.props;
    dispatch(customerApply(data, (success, msg, res) => {
      hideModal();
      this.setState({doingApply: false})
      if (success) {
        ToastShort("申请成功");
        if (res.user.access_token && res.user.user_id) {
          this.doSaveUserInfo(res.user.access_token);
          this.queryCommonConfig(res.user.uid, res.user.access_token);
          this.mixpanel.track("info_locatestore_click", {msg: '申请成功'})
          if (res.user.user_id) {

            this.mixpanel.getDistinctId().then(mixpanel_id => {
              if (mixpanel_id !== res.user.user_id) {
                mergeMixpanelId(mixpanel_id, res.user.user_id);
              }
            })
            this.mixpanel.identify(res.user.user_id);

            const alias = `uid_${res.user.user_id}`;
            JPush.setAlias({alias: alias, sequence: dayjs().unix()})
            JPush.isPushStopped((isStopped) => {
              if (isStopped) {
                JPush.resumePush();
              }
            })
          }
          return true;
        }
      } else {
        this.mixpanel.track("info_locatestore_click", {msg: msg})
        ToastShort(msg)
      }
    }, this.props))
  }

  doSaveUserInfo(token) {
    HttpUtils.get.bind(this.props)(`/api/user_info2?access_token=${token}`).then(res => {
      GlobalUtil.setUser(res)
    })
    return true;
  }

  queryCommonConfig(uid, accessToken, currStoreId = 0) {
    let flag = false;
    const {dispatch} = this.props;
    dispatch(getCommonConfig(accessToken, currStoreId, (ok, err_msg, cfg) => {
      if (ok) {
        let only_store_id = currStoreId;
        if (only_store_id > 0) {
          dispatch(check_is_bind_ext({token: accessToken, user_id: uid, storeId: only_store_id}, (binded) => {
            this.doneSelectStore(only_store_id, !binded);
          }));
        } else {
          let store = cfg.canReadStores[Object.keys(cfg.canReadStores)[0]];
          this.doneSelectStore(store.id, flag);
        }
      } else {
        ToastShort(err_msg);
      }
    }));
  }

  doneSelectStore(storeId, not_bind = false) {
    const {dispatch, navigation} = this.props;
    const setCurrStoreIdCallback = (set_ok, msg) => {
      if (set_ok) {
        dispatch(setCurrentStore(storeId));
        if (not_bind) {
          hideModal()
          navigation.navigate(Config.ROUTE_PLATFORM_LIST)
          return true;
        }
        navigation.navigate(this.next || Config.ROUTE_ORDER, this.nextParams)
        tool.resetNavStack(navigation, Config.ROUTE_ALERT);
        hideModal()
        return true;
      } else {
        ToastShort(msg);
        return false;
      }
    };
    if (Platform.OS === 'ios') {
      setCurrStoreIdCallback(true, '');
    } else {
      native.setCurrStoreId(storeId, setCurrStoreIdCallback);
    }
  }

  onRequestSmsCode() {
    const {dispatch} = this.props;
    if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
      this.setState({canAskReqSmsCode: true});
      dispatch(requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          ToastShort("短信验证码已发送")
        } else {
          this.setState({canAskReqSmsCode: false});
          ToastShort("短信验证码发送失败")
        }
      }));
    } else {
      this.setState({canAskReqSmsCode: false});
      ToastShort('手机号有误')
    }
  }

  setAddress(res) {
    let lat = res.location.substr(res.location.lastIndexOf(",") + 1, res.location.length);
    let Lng = res.location.substr(0, res.location.lastIndexOf(","));
    this.setState({
      address: res.address,
      location_long: Lng,
      location_lat: lat,
    })
  }

  render() {
    const {location_long, location_lat} = this.state;
    let center = "";
    if (location_long && location_lat) {
      center = `${location_long},${location_lat}`;
    }
    return (
      <ScrollView style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}>
        <View style={{
          paddingTop: 30,
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingBottom: 40,
        }}>


          <View style={{
            flexDirection: 'row',
            marginLeft: 10,
          }}>
            <View style={{
              width: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FontAwesome5 name={'mobile'} style={{
                fontSize: 25,
                color: colors.main_color,
              }}/>
            </View>
            <Text
              style={{
                alignSelf: 'flex-end',
                fontSize: 18,
                paddingLeft: pxToDp(8),
                color: colors.color333,
                textAlignVertical: "center"
              }}>{this.state.mobile} </Text>
          </View>


          <View style={{
            flexDirection: 'row',
            marginLeft: 10,
            marginTop: 10,
          }}>
            <View style={{
              width: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FontAwesome5 name={'user-circle'} style={{
                fontSize: 20,
                color: colors.main_color,
              }}/>
            </View>
            <View style={{
              width: "80%"
            }}>
              <TextInput placeholder={"门店联系人"}
                         onChangeText={(name) => {
                           this.setState({name})
                         }}
                         value={this.state.name}
                         placeholderTextColor={'#ccc'}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           height: pxToDp(90),
                         }}
                         underlineColorAndroid="transparent"/>
            </View>
          </View>


          <View style={{
            flexDirection: 'row',
            marginLeft: 10,
            marginTop: 10,
          }}>
            <View style={{
              width: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FontAwesome5 name={'store'} style={{
                fontSize: 20,
                color: colors.main_color,
              }}/>
            </View>
            <View style={{
              width: "80%"
            }}>
              <TextInput placeholder={"门店名称"}
                         onChangeText={(shopName) => {
                           this.setState({shopName})
                         }}
                         value={this.state.shopName}
                         placeholderTextColor={'#ccc'}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           height: pxToDp(90),
                         }}
                         underlineColorAndroid="transparent"/>
            </View>
          </View>


          <View style={{
            flexDirection: 'row',
            marginLeft: 20,
            marginTop: 10,
          }}>
            <View style={{width: "66%"}}>
              <TextInput placeholder={"请点击定位，获取地址信息"}
                         onChangeText={(address) => {
                           this.setState({address})
                         }}
                         placeholderTextColor={'#ccc'}
                         value={this.state.address}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           // marginHorizontal: pxToDp(50),
                           height: pxToDp(90),
                         }}
                         underlineColorAndroid="transparent"
                         editable={false}
              />
            </View>
            <Button onPress={() => {
              this.mixpanel.track("nfo_locatestore_click", {});
              const params = {
                center: center,
                cityName: this.state.cityname,
                keywords: tool.length(this.state.address) > 0 ? this.state.address : this.state.shopName,
                onBack: (res) => {
                  this.setAddress.bind(this)(res)
                },
              };
              this.props.navigation.navigate(Config.ROUTE_SEARC_HSHOP, params);
            }} buttonStyle={{backgroundColor: colors.main_color, marginLeft: 6}}
                    titleStyle={{fontSize: 14, color: colors.white}}
                    title={"定位门店"}/>
          </View>

          <View style={{
            flexDirection: 'row',
            marginLeft: 20,
            marginTop: 10,
          }}>
            <View style={{width: "90%"}}>
              <TextInput placeholder="例XX菜市场15号摊位,北侧底商22号"
                         onChangeText={(value) => {
                           this.setState({detail_address: value})
                         }}
                         placeholderTextColor={'#ccc'}
                         value={this.state.detail_address}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           // marginHorizontal: pxToDp(50),
                           height: pxToDp(90),
                         }}
                         underlineColorAndroid="transparent"
              />
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            marginLeft: 20,
            marginTop: 10,
          }}>
            <View style={{width: "90%"}}>
              <TextInput placeholder="推荐人ID （没有可不填）"
                         onChangeText={(referrer_id) => {
                           this.setState({referrer_id})
                         }}
                         type={"number"}
                         keyboardType="numeric"
                         placeholderTextColor={'#ccc'}
                         value={this.state.referrer_id}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           // marginHorizontal: pxToDp(50),
                           height: pxToDp(90),
                         }}
                         underlineColorAndroid="transparent"
              />
            </View>
          </View>


          <View style={{
            flexDirection: 'row',
            marginLeft: 10,
            marginTop: 20,
          }}>
            <View style={{
              width: 80,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{fontSize: 14, color: colors.color333}}>店铺类型 </Text>
            </View>
            <View style={{
              width: "68%",
              borderColor: colors.fontColor,
              borderBottomWidth: pxToDp(2),
              padding: 6,
            }}>
              <ModalSelector
                style={{width: "100%"}}
                onChange={option => {

                  if (option.id === 6 || option.id === 7) {
                    ToastLong('鲜花/蛋糕类商品配送价格可能高于其他类型商品，且您在选择店铺类型后将不能随意更改，注册后如需更改请联系客服。')
                  }
                  this.setState({
                    pickerName: option.name,
                    pickerValue: option.id,

                  });
                }}
                data={this.state.shelfNos}
                skin="customer"
                defaultKey={-999}
              >
                <View style={{flexDirection: 'row',}}>
                  <View style={{flex: 1}}></View>
                  <Text style={{paddingTop: pxToDp(4), color: '#ccc', textAlign: 'center'}}>
                    {this.state.pickerName}
                  </Text>
                  <View style={{flex: 1}}></View>
                  <Entypo name='chevron-thin-down' style={{fontSize: 16, color: '#ccc', marginTop: pxToDp(4)}}/>
                </View>
              </ModalSelector>

            </View>
          </View>

          <Button
            title={'下一步'}
            buttonStyle={{
              marginTop: 20,
              backgroundColor: colors.main_color,
              width: "88%",
              marginLeft: '6%'
            }}
            onPress={() => {
              if (this.state.checkBox) {
                this.mixpanel.track("Phoneinput_next_click", {});
              }
              this.onApply()
            }}/>

          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 40}}>
            <Text style={{fontSize: 16}}>遇到问题，请</Text>
            <Text style={{
              fontSize: 16,
              color: '#59b26a',
              textDecorationColor: '#59b26a',
              textDecorationLine: 'underline',
              marginLeft: pxToDp(10)
            }} onPress={() => {
              this.mixpanel.track("info_customerservice_click", {});
              JumpMiniProgram("/pages/service/index", {place: 'apply'});
            }}>联系客服</Text>
          </View>

        </View>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyScene)
