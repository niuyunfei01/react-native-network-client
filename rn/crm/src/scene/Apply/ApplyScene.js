import React, {PureComponent} from 'react';
import {Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import {Provider} from "@ant-design/react-native";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import {check_is_bind_ext, customerApply, getCommonConfig, setCurrentStore} from '../../reducers/global/globalActions'
import native from "../../common/native";
import {Button, ButtonArea, Cell, CellBody, CellHeader, Cells, Input} from "../../weui/index";
import stringEx from "../../util/stringEx"
import HttpUtils from "../../util/http";
import Config from "../../config";
import colors from "../../styles/colors";
import {hideModal, showError, showModal, showSuccess} from "../../util/ToastUtils";
import GlobalUtil from "../../util/GlobalUtil";
import JPush from "jpush-react-native";
import Moment from "moment/moment";
import tool from "../../common/tool";
import {MixpanelInstance} from "../../common/analytics";
import JbbText from "../component/JbbText";


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

const namePlaceHold = "门店联系人";
const shopNamePlaceHold = "门店名称";
const addressPlaceHold = "请点击定位，获取地址信息";
const referrerIdPlaceHold = "推荐人ID";
const requestCodeSuccessMsg = "短信验证码已发送";
const requestCodeErrorMsg = "短信验证码发送失败";
const applySuccessMsg = "申请成功";
const applyErrorMsg = "申请失败，请重试!";
const validErrorMobile = "手机号有误";
const validEmptyName = "请输入门店联系人";
const validEmptyAddress = "请输入门店地址";
const validEmptyCode = "请输入短信验证码";
const validEmptyShopName = "请输入门店名称";
let labels_city = [];

class ApplyScene extends PureComponent {

  constructor(props) {
    super(props)
    const {navigation} = props;
    this.mixpanel = MixpanelInstance;
    // navigation.setOptions(
    //   {
    //     headerTitle: (
    //       <View style={{flexDirection: 'row', alignSelf: 'center'}}>
    //         <Text style={{
    //           textAlignVertical: "center",
    //           textAlign: "center",
    //           color: "#ffffff",
    //           fontWeight: 'bold',
    //           fontSize: 20
    //         }}>注册门店信息</Text>
    //       </View>
    //     ),
    //     headerStyle: {backgroundColor: '#59b26a'},
    //     headerRight: (<View/>),
    //     headerLeft: (
    //       <NavigationItem
    //         icon={require('../../img/Register/back_.png')}
    //         iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
    //         onPress={() => {
    //           navigation.navigate('Login')
    //         }}
    //       />),
    //   })
    this.state = {
      mobile:this.props.route.params.mobile,
      name: '',
      address: '',
      shopName: '',
      referees_id: 0,
      value: [],
      address_data: [],
      canAskReqSmsCode: false,
      doingApply: false,
      location_long: '',
      location_lat: '',
      detail_address: ''
    };

    this.onChange = this.onChange.bind(this)
    this.onFormat = this.onFormat.bind(this)
    this.doApply = this.doApply.bind(this)
    this.onApply = this.onApply.bind(this)
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
    this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
    this.doneApply = this.doneApply.bind(this)
    this.showSuccessToast = this.showSuccessToast.bind(this)
    this.showErrorToast = this.showErrorToast.bind(this)

    // this.onGetAddress();
  }

  onGetAddress() {
    let accessToken = this.props.accessToken;
    HttpUtils.get.bind(this.props)(`/v1/new_api/Address/get_address?access_token=${accessToken}`, {}).then(res => {
      this.setState({address_data: res})
    }).catch((success, errorMsg) => {
      this.showErrorToast(errorMsg)
    })
  }

  onChange(value: any) {
    this.setState({value});
  }

  onFormat(labels: any) {
    labels_city = labels;
    return labels.join(',');
  }

  onApply() {
    if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
      this.showErrorToast(validErrorMobile)
      return false
    }
    if (!this.state.verifyCode) {
      this.showErrorToast(validEmptyCode)
      return false
    }
    if (!this.state.name) {
      this.showErrorToast(validEmptyName)
      return false
    }
    if (!this.state.shopName) {
      this.showErrorToast(validEmptyShopName)
      return false
    }
    if (!this.state.address) {
      this.showErrorToast(validEmptyAddress)
      return false
    }

    if (tool.length(this.state.location_lat) === 0 || tool.length(this.state.location_long) === 0) {
      this.showErrorToast("请选择定位")
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
      mobile: this.state.mobile,
      dada_address: `${this.state.address}${this.state.detail_address}`,
      name: this.state.shopName,
      verifyCode: this.state.verifyCode,
      referrer_id: this.state.referrer_id,
      owner_name: this.state.name,
      labels: labels_city,
      lat: this.state.location_lat,
      lng: this.state.location_long
    };

    const {dispatch, navigation} = this.props;
    dispatch(customerApply(data, (success, msg, res) => {
      this.doneApply();
      if (success) {

        this.showSuccessToast(applySuccessMsg);
        if (res.user.access_token && res.user.user_id) {
          this.doSaveUserInfo(res.user.access_token);
          this.queryCommonConfig(res.user.uid, res.user.access_token);

          this.mixpanel.track("info_locatestore_click", {msg: applySuccessMsg})
          this.mixpanel.alias("newer ID", res.user.user_id)

          if (res.user.user_id) {
            const alias = `uid_${res.user.user_id}`;
            JPush.setAlias({alias: alias, sequence: Moment().unix()})
            JPush.isPushStopped((isStopped) => {
              if (isStopped) {
                JPush.resumePush();
              }
            })
          }
          return true;
        }
        // setTimeout(() => navigation.navigate(Config.ROUTE_LOGIN), 1000)
      } else {

        this.mixpanel.track("info_locatestore_click", {msg: msg})
        this.showErrorToast(msg)
        // setTimeout(() => this.props.navigation.goBack(), 1000)
        // setTimeout(() => this.props.navigation.navigate(Config.ROUTE_LOGIN), 1000)
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
    showModal('加载中');
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
        showError(err_msg);
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
        showError(msg);
        return false;
      }
    };
    if (Platform.OS === 'ios') {
      setCurrStoreIdCallback(true, '');
    } else {
      native.setCurrStoreId(storeId, setCurrStoreIdCallback);
    }
  }

  doneApply() {
    hideModal();
    this.setState({doingApply: false})
  }

  showSuccessToast(msg) {
    showSuccess(msg)
  }

  showErrorToast(msg) {
    showError(msg)
  }

  onRequestSmsCode() {

    const {dispatch} = this.props;
    if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
      this.setState({canAskReqSmsCode: true});
      dispatch(requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          this.showSuccessToast(requestCodeSuccessMsg)
        } else {
          this.setState({canAskReqSmsCode: false});
          this.showErrorToast(requestCodeErrorMsg)
        }
      }));
    } else {
      this.setState({canAskReqSmsCode: false});
      this.showErrorToast(validErrorMobile)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }

  componentWillUnmount() {
  }

  componentDidMount() {
  }

  goto(routeName, params) {
    this.props.navigation.navigate(routeName, params);
  }

  render() {
    const {location_long, location_lat} = this.state;
    let center = "";
    if (location_long && location_lat) {
      center = `${location_long},${location_lat}`;
    }
    return (<Provider>
        <ScrollView style={styles.container}>
          <View style={styles.register_panel}>
            <Cells style={{borderTopWidth: 0, borderBottomWidth: 0}}>
              <Cell first style={{borderBottomWidth: 0}}>
                <CellHeader>
                  <Image source={require('../../img/Register/login_phone_.png')} style={{
                    width: pxToDp(33),
                    height: pxToDp(39),
                  }}/>
                </CellHeader>
                <CellBody style={{display: 'flex', flexDirection: 'row'}}>
                  <JbbText style={[styles.body_text, {alignSelf: 'flex-end'}]}>{this.state.mobile}</JbbText>
                </CellBody>
              </Cell>
              <Cell first>
                <CellHeader>
                  <Image source={require('../../img/Register/login_name_.png')} style={{
                    width: pxToDp(39),
                    height: pxToDp(39),
                  }}/>
                </CellHeader>
                <CellBody>
                  <Input placeholder={namePlaceHold}
                         onChangeText={(name) => {
                           this.setState({name})
                         }}
                         value={this.state.name}
                         placeholderTextColor={'#ccc'}
                         style={styles.input}
                         underlineColorAndroid="transparent"/>
                </CellBody>
              </Cell>

              <Cell first>
                <CellHeader>
                  <Image source={require('../../img/Register/dianming_.png')} style={{
                    width: pxToDp(39),
                    height: pxToDp(35),
                  }}/>
                </CellHeader>
                <CellBody>
                  <Input placeholder={shopNamePlaceHold}
                         onChangeText={(shopName) => {
                           this.setState({shopName})
                         }}
                         value={this.state.shopName}
                         placeholderTextColor={'#ccc'}
                         style={styles.input}
                         underlineColorAndroid="transparent"/>
                </CellBody>
              </Cell>
              {/*<Cell first>*/}
              {/*  <CellHeader>*/}
              {/*    <Image source={require('../../img/Register/map_.png')}*/}
              {/*           style={{width: pxToDp(39), height: pxToDp(45),}}/>*/}
              {/*  </CellHeader>*/}
              {/*  <CellBody style={{height: 40, justifyContent: 'center', alignItems: 'center'}}>*/}
              {/*    <TouchableOpacity*/}
              {/*      style={{flexDirection: "row", alignSelf: 'flex-start'}}*/}
              {/*      onPress={() => {*/}

              {/*        this.mixpanel.track("nfo_locatestore_click", {});*/}
              {/*        const params = {*/}
              {/*          action: Config.LOC_PICKER,*/}
              {/*          center: center,*/}
              {/*          actionBeforeBack: resp => {*/}
              {/*            let {name, location, address} = resp;*/}
              {/*            console.log("location resp: ", resp);*/}
              {/*            let locate = location.split(",");*/}
              {/*            this.mixpanel.track("nfo_locatestore_click", {msg: '成功'});*/}
              {/*            this.setState({*/}
              {/*              location_long: locate[0],*/}
              {/*              location_lat: locate[1],*/}
              {/*              address: address*/}
              {/*            });*/}
              {/*          }*/}
              {/*        };*/}
              {/*        this.goto(Config.ROUTE_WEB, params);*/}
              {/*      }}>*/}
              {/*      <Text style={[styles.body_text]}>*/}
              {/*        {location_long && location_lat ? `${location_long},${location_lat}` : "点击定位门店地址"}*/}
              {/*      </Text>*/}
              {/*    </TouchableOpacity>*/}
              {/*  </CellBody>*/}
              {/*</Cell>*/}
              <Cell first>
                <CellBody>
                  <Input placeholder={addressPlaceHold}
                         onChangeText={(address) => {
                           this.setState({address})
                         }}
                         placeholderTextColor={'#ccc'}
                         value={this.state.address}
                         style={[styles.input, {fontSize: 12}]}
                         underlineColorAndroid="transparent"
                  />
                </CellBody>
                <TouchableOpacity style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.main_color,
                  padding: pxToDp(5),
                  borderRadius: pxToDp(8)
                }}
                                  onPress={() => {

                                    this.mixpanel.track("nfo_locatestore_click", {});
                                    const params = {
                                      action: Config.LOC_PICKER,
                                      center: center,
                                      actionBeforeBack: resp => {
                                        let {name, location, address} = resp;
                                        console.log("location resp: ", resp);
                                        let locate = location.split(",");
                                        this.mixpanel.track("nfo_locatestore_click", {msg: '成功'});
                                        this.setState({
                                          location_long: locate[0],
                                          location_lat: locate[1],
                                          address: address
                                        });
                                      }
                                    };
                                    this.goto(Config.ROUTE_WEB, params);
                                  }}
                >
                  {/*<Image source={require('../../img/Register/position.png')}*/}
                  {/*       style={{width: pxToDp(28), height: pxToDp(28)}}/>*/}
                  <JbbText style={{color: colors.white, fontSize: pxToDp(28)}}>
                    定位门店
                  </JbbText>
                </TouchableOpacity>
              </Cell>
              <Cell first>
                <CellBody>
                  <Input placeholder="请输入详细地址"
                         onChangeText={(value) => {
                           this.setState({detail_address: value})
                         }}
                         placeholderTextColor={'#ccc'}
                         value={this.state.detail_address}
                         style={styles.input}
                         underlineColorAndroid="transparent"
                  />
                </CellBody>
              </Cell>
              <Cell first>
                <CellBody>
                  <Input placeholder={referrerIdPlaceHold}
                         onChangeText={(referrer_id) => {
                           this.setState({referrer_id})
                         }}
                         type={"number"}
                         keyboardType="numeric"
                         placeholderTextColor={'#ccc'}
                         value={this.state.referrer_id}
                         style={styles.input}
                         underlineColorAndroid="transparent"
                  />
                </CellBody>
              </Cell>
            </Cells>


            <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(30)}}>
              <Button type="primary" onPress={() => this.onApply()}>注册门店</Button>
            </ButtonArea>

            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
              <JbbText style={{fontSize: 16}}>遇到问题，请</JbbText>
              <JbbText style={{
                fontSize: 16,
                color: '#59b26a',
                textDecorationColor: '#59b26a',
                textDecorationLine: 'underline',
                marginLeft: pxToDp(10)
              }} onPress={() => {
                this.mixpanel.track("info_customerservice_click", {});
                native.dialNumber('18910275329');
              }}>联系客服</JbbText>
            </View>
          </View>
        </ScrollView></Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  register_panel: {
    backgroundColor: 'white',
    marginTop: pxToDp(90),
    marginLeft: pxToDp(72),
    marginRight: pxToDp(72)
  },
  counter: {
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#5A5A5A',
    backgroundColor: 'transparent',
    paddingLeft: 14 * 0.75,
    paddingRight: 14 * 0.75,
    paddingTop: 6 * 0.75,
    paddingBottom: 6 * 0.75,
  },
  body_text: {
    paddingLeft: pxToDp(8),
    fontSize: pxToDp(30),
    color: colors.color333,
    height: pxToDp(60),
    textAlignVertical: "center"
  },
  input: {
    color: "#999",
    fontSize: 16,
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#999'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ApplyScene)
