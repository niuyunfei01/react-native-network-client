import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';

import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import tool from "../../../pubilc/util/tool";
import config from "../../../pubilc/common/config";
import colors from "../../../pubilc/styles/colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {Button} from "react-native-elements";
import BottomModal from "../../../pubilc/component/BottomModal";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
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


function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class BindMeituan extends PureComponent {
  constructor(props) {
    super(props);
    let ext_store_id = tool.length(this.props.route.params) > 0 ? this.props.route.params.ext_store_id : 0;
    this.state = {
      isRefreshing: false,
      ext_store_id: ext_store_id,
      headerTitle: '',
      list: [],
      chosed: 0,
      url: '',
      mobile: '',
      is_chosed: false,
      modal: false,
    }
    this.fetchData()
  }

  fetchData() {
    showModal('加载中...')
    const {currStoreId, accessToken} = this.props.global;
    const api = `/api/get_mt_bind_info?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, ext_store_id: this.state.ext_store_id}).then(res => {
      hideModal()
      this.setState({
        headerTitle: res.notice,
        mobile: res.worker_phone,
        list: res.list,
      })
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  closeModal = () => {
    this.setState({
      modal: false
    })
  }

  renderList() {
    let items = []

    for (let i in this.state.list) {
      const info = this.state.list[i]
      if (info.checked && !this.state.is_chosed) {
        this.setState({url: info.bind_url, chosed: info.id, is_chosed: true})
      }
      items.push(
        <View style={{backgroundColor: colors.white, borderRadius: 8, margin: 10}} key={i}>
          <TouchableOpacity onPress={() => {
            this.setState({
              url: info.bind_url,
              chosed: info.id
            })
          }} style={{padding: pxToDp(10)}}>
            <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
              <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>{info.name} </Text>
              <View style={{flex: 1}}>
                <View style={{width: 20, height: 20, marginLeft: 30}}>
                  {this.state.chosed === info.id ?
                    <AntDesign name='checkcircle' style={{fontSize: pxToDp(35), color: colors.main_color}}/> :
                    <Ionicons name={'radio-button-off-outline'}
                              style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
                </View>
              </View>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#333333',
              lineHeight: 17,
              marginLeft: pxToDp(20),
              marginRight: pxToDp(30),
              marginBottom: pxToDp(30)
            }}>
              {info.desc}
            </Text>
            <If condition={info.printer_bind && tool.length(info.printer_bind_info) > 0}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#59B26A',
                  lineHeight: 17,
                  textAlign: "right",
                  marginTop: pxToDp(20),
                  marginRight: pxToDp(40)
                }}>
                {info.printer_bind_info}
              </Text>
            </If>

            <If condition={info.printer_bind && !tool.length(info.printer_bind_info) > 0}>
              <Text
                onPress={() => {
                  this.onPress(config.ROUTE_CLOUD_PRINTER)
                }}
                style={{
                  marginLeft: 'auto',
                  fontSize: pxToDp(24),
                  color: colors.main_color,
                  marginRight: pxToDp(20),
                  marginBottom: pxToDp(30),
                  borderRadius: pxToDp(5),
                  lineHeight: pxToDp(40),
                  textAlign: 'center',
                  borderWidth: pxToDp(1),
                  borderColor: colors.main_color,
                  padding: 10
                }}>绑定打印机</Text>
            </If>
          </TouchableOpacity>
        </View>)
    }
    return <View>
      {items}
    </View>
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <ScrollView style={{backgroundColor: colors.f2, flexGrow: 1}}>
          <Text style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            fontSize: pxToDp(26),
            marginTop: pxToDp(20),
            width: pxToDp(450),
            color: colors.fontGray
          }}>{this.state.headerTitle} </Text>
          {this.renderList()}
        </ScrollView>

        <View style={{
          flexDirection: 'row',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: pxToDp(70),
        }}>
          <Button
            // type={'primary'}
            onPress={() => {
              let {currVendorId} = tool.vendor(this.props.global)
              let data = {
                v: currVendorId,
                s: this.props.global.currStoreId,
                u: this.props.global.currentUser,
                m: this.props.global.currentUserProfile.mobilephone,
                place: 'bindMeituan'
              }
              JumpMiniProgram("/pages/service/index", data);
              // if (tool.length(this.state.mobile) > 0) {
              //   native.dialNumber(this.state.mobile);
              // } else {
              //   ToastLong('请返回重试');
              // }
            }}
            title={'联系客服'}
            titleStyle={{
              color: colors.b2,
            }}
            containerStyle={{width: '40%'}}
            buttonStyle={{
              backgroundColor: colors.white,
              borderRadius: pxToDp(20),
              borderColor: colors.b2,
              borderWidth: pxToDp(2)
            }}/>

          <Button
            onPress={() => {
              if (this.state.chosed === 2 && !tool.length(this.state.list[1].printer_bind_info) > 0) {
                ToastLong("请先绑定打印机")
                return;
              }
              if (this.state.chosed === 3) {
                this.setState({modal: true})
                return;
              }
              let url = config.apiUrl(this.state.url);
              this.onPress(config.ROUTE_WEB, {url: url, title: '绑定美团外卖'})
            }}

            title={'绑定店铺'}
            containerStyle={{width: '40%'}}
            buttonStyle={{
              backgroundColor: tool.length(this.state.url) > 0 ? colors.main_color : '#bbb',
              marginLeft: "10%",
              borderRadius: pxToDp(20),
              borderWidth: pxToDp(0)
            }}/>
        </View>
        <BottomModal
          title={'提示'}
          actionText={'确定'}
          closeText={'取消'}
          onPress={() => {
            let url = config.apiUrl(this.state.url);
            this.onPress(config.ROUTE_WEB, {url: url, title: '绑定美团外卖'})
          }}
          visible={this.state.modal} onPressClose={this.closeModal}
          onClose={this.closeModal}
          btnBottomStyle={{
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
            paddingBottom: 0,
          }}
          closeBtnStyle={{
            borderWidth: 0,
            borderRadius: 0,
            borderRightWidth: 1,
            borderColor: "#E5E5E5",
          }}
          btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
          closeBtnTitleStyle={{color: colors.color333}}
          btnTitleStyle={{color: colors.main_color}}>
          <View style={{paddingVertical: 10, paddingHorizontal: 10}}>
            <Text style={{color: colors.red, fontSize: 12}}> &nbsp;&nbsp;&nbsp;收银模式有以下特点 </Text>
            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text style={{color: colors.color333, fontSize: 14}}>收银模式支持在外送帮呼叫 “美团众包”配送 </Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text style={{color: colors.color333, fontSize: 14}}>如果美团商户端发起配送时，会跟外送帮上的骑手重复 </Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text style={{color: colors.color333, fontSize: 14}}>收银模式不支持自动接单 </Text>
            </View>
          </View>
        </BottomModal>
      </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(BindMeituan)
