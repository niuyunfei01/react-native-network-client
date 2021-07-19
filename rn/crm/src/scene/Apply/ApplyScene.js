import React, {PureComponent} from 'react';
import {View, StyleSheet, Image, Text, ScrollView} from 'react-native'
import {connect} from "react-redux";
import {List, Picker,Provider } from "@ant-design/react-native";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import {CountDownText} from "../../widget/CounterText";
import * as globalActions from '../../reducers/global/globalActions'
import native from "../../common/native";

import {
  Cell,
  CellHeader,
  CellBody,
  Button,
  Input,
  Cells,
  ButtonArea,
  Toast,
  Dialog
} from "../../weui/index";

import {NavigationItem} from "../../widget/index"

import stringEx from "../../util/stringEx"
import HttpUtils from "../../util/http";


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
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}
const namePlaceHold = "店铺联系人称呼";
const shopNamePlaceHold = "门店名称";
const addressPlaceHold = "店铺详细地址，便于骑手快速找到门店";
const referrerIdPlaceHold = "推荐人ID";
const requestCodeSuccessMsg = "短信验证码已发送";
const requestCodeErrorMsg = "短信验证码发送失败";
const applySuccessMsg = "申请成功";
const applyErrorMsg = "申请失败，请重试!";
const addressErroMsg = "获取地址错误!";
const validErrorMobile = "手机号有误";
const validEmptyName = "请输入负责人";
const validEmptyAddress = "请输入店铺地址";
const validEmptyCode = "请输入短信验证码";
const validEmptyShopName = "请输入店铺名字";
const validEmptyRefereesId = "推荐人id";
let labels_city =[] ;
class ApplyScene extends PureComponent {

  constructor(props) {
    super(props)
    const {navigation}=props;
    navigation.setOptions(
        {
          headerTitle: (
              <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Text style={{
                  textAlignVertical: "center",
                  textAlign: "center",
                  color: "#ffffff",
                  fontWeight: 'bold',
                  fontSize: 20
                }}>注册门店信息</Text>
              </View>
          ),
          headerStyle: {backgroundColor: '#59b26a'},
          headerRight: (<View/>),
          headerLeft: (
              <NavigationItem
                  icon={require('../../img/Register/back_.png')}
                  iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
                  onPress={() => {
                    navigation.navigate('Login')
                  }}
              />),

        })
    this.state = {
      mobile: this.props.route.params.mobile,
      verifyCode:this.props.route.params.verifyCode,
      name: '',
      address: '',
      shopName: '',
      referees_id:0,
      value: [],
      address_data:[],
      canAskReqSmsCode: false,
      reRequestAfterSeconds: 60,
      doingApply: false,
      opSuccessMsg: '',
      opErrorMsg: '',
      visibleSuccessToast: false,
      visibleErrorToast: false,
      visibleDialog: false,
      toastTimer: null,
      loadingTimer: null,
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

    this.onGetAddress();
  }

  onGetAddress() {
    let accessToken = this.props.accessToken;
    console.log("do execution access_token:", accessToken)
    HttpUtils.get.bind(this.props)(`/v1/new_api/Address/get_address?access_token=${accessToken}`, {}).then(res => {
      console.log("address_data:", res)
      this.setState({address_data: res})
    }).catch((success, errorMsg) => {
      this.showErrorToast(errorMsg)
    })
  }
  onChange (value: any){
    this.setState({ value });
  };
  onFormat(labels:any){
    labels_city =labels;
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
    if (this.state.doingApply) {
      return false;
    }
    this.doApply();
  }

  doApply() {
    var self = this;
    this.setState({doingApply: true});
    let data = {
      mobile: this.state.mobile,
      dada_address: this.state.address,
      name: this.state.shopName,
      verifyCode: this.state.verifyCode,
      referrer_id: this.state.referrer_id,
      owner_name: this.state.name,
      labels:labels_city,
    };
    this.props.actions.customerApply(data, (success) => {
      self.doneApply();
      if (success) {
        this.showSuccessToast(applySuccessMsg);
        setTimeout(()=>this.props.navigation.navigate('Login'),1000)
      } else {
        this.showErrorToast(applyErrorMsg)
        setTimeout(()=>this.props.navigation.navigate('Login'),1000)
      }
    })
  }

  doneApply() {
    this.setState({doingApply: false})
  }

  clearTimeouts() {
    if (this.state.toastTimer) clearTimeout(this.state.toastTimer);
    if (this.state.loadingTimer) clearTimeout(this.state.loadingTimer);
  }
  showSuccessToast(msg) {
    this.setState({
      visibleSuccessToast: true,
      opSuccessMsg: msg
    });
    this.state.toastTimer = setTimeout(() => {
      this.setState({visibleSuccessToast: false});
    }, 2000);
  }

  showErrorToast(msg) {
    this.setState({
      visibleErrorToast: true,
      opErrorMsg: msg
    });
    this.state.toastTimer = setTimeout(() => {
      this.setState({visibleErrorToast: false});
    }, 2000);
  }

  onRequestSmsCode() {
    if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
      this.setState({canAskReqSmsCode: true});
      this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          this.showSuccessToast(requestCodeSuccessMsg)
        } else {
          this.setState({canAskReqSmsCode: false});
          this.showErrorToast(requestCodeErrorMsg)
        }
      });
    } else {
      this.setState({canAskReqSmsCode: false});
      this.showErrorToast(validErrorMobile)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  componentDidMount() {
    this.setState({})
  }

  render() {
    return (<Provider>
      <ScrollView style={styles.container}>
        <View style={styles.register_panel}>
          <Cells style={{borderTopWidth: 0, borderBottomWidth: 0,}}>
            <Cell first>
              <CellHeader>
                <Image source={require('../../img/Register/login_phone_.png')} style={{
                  width: pxToDp(33),
                  height: pxToDp(47),
                }}/>
              </CellHeader>
              <CellBody>
                {this.state.mobile}
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

            <Cell first>
              <CellBody>
                <Picker
                    data={this.state.address_data}
                    cols={3}
                    value={this.state.value}
                    onChange={this.onChange}
                    format={this.onFormat}
                >
                  <List.Item arrow="horizontal">省市选择</List.Item>
                </Picker>
              </CellBody>
            </Cell>
            <Cell first>
              <CellHeader>
                <Image source={require('../../img/Register/map_.png')} style={{
                  width: pxToDp(39),
                  height: pxToDp(45),
                }}/>
              </CellHeader>
              <CellBody>
                <Input placeholder={addressPlaceHold}
                       onChangeText={(address) => {
                         this.setState({address})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.address}
                       style={styles.input}
                       underlineColorAndroid="transparent"
                />
              </CellBody>
            </Cell>

            <Cell first>
              <CellHeader>
                <Image source={require('../../img/Register/map_.png')} style={{
                  width: pxToDp(39),
                  height: pxToDp(45),
                }}/>
              </CellHeader>
              <CellBody>
                <Input placeholder={referrerIdPlaceHold}
                       onChangeText={(referrer_id) => {
                         this.setState({referrer_id})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.referrer_id}
                       style={styles.input}
                       underlineColorAndroid="transparent"
                />
              </CellBody>
            </Cell>
          </Cells>

          <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(30)}}>
            <Button type="primary" onPress={()=>this.onApply()}>我要开店</Button>
          </ButtonArea>

          <View  style={{flex: 1, justifyContent: 'center', alignItems: 'center',flexDirection:'row'}}>
            <Text style={{fontSize: 16}}>有不明处?</Text>
              <Text style={{fontSize: 16, color: '#59b26a'}} onPress={() => {
                native.dialNumber('18910275329');
              }}>
                联系客服
              </Text>
          </View>
          <Toast icon="loading" show={this.state.doingApply} onRequestClose={() => {
          }}>提交中</Toast>
          <Toast icon="success_circle" show={this.state.visibleSuccessToast} onRequestClose={() => {
          }}>{this.state.opSuccessMsg}</Toast>
          <Toast icon="warn" show={this.state.visibleErrorToast} onRequestClose={() => {
          }}>{this.state.opErrorMsg}</Toast>
          <Dialog
            onRequestClose={() => {
            }}
            visible={this.state.visibleDialog}
            title="申请成功"
            buttons={[
              {
                type: 'default',
                label: '确定',
                onPress: this.hideDialog1,
              }
            ]}
          ><Text>客服马上会联系你</Text></Dialog>
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
    flex: 1,
    backgroundColor: 'white',
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
  input: {
    color: "#999",
    borderBottomWidth:pxToDp(1),
    borderBottomColor:'#999'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ApplyScene)
