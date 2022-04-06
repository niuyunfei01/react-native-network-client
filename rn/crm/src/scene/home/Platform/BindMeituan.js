import React, {PureComponent} from 'react'
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import pxToDp from "../../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {Button, List} from "@ant-design/react-native";
import colors from "../../../pubilc/styles/colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import tool from "../../../pubilc/common/tool";
import config from "../../../pubilc/common/config";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import AntDesign from "react-native-vector-icons/AntDesign";

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

  renderList() {
    let items = []

    for (let i in this.state.list) {
      const info = this.state.list[i]
      if (info.checked && !this.state.is_chosed) {
        this.setState({url: info.bind_url, chosed: info.id, is_chosed: true})
      }
      items.push(<List style={{margin: 10}} key={i}>
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
                  width: pxToDp(160),
                  marginRight: pxToDp(20),
                  marginBottom: pxToDp(30),
                  borderRadius: pxToDp(5),
                  lineHeight: pxToDp(40),
                  textAlign: 'center',
                  borderWidth: pxToDp(1),
                  borderColor: colors.main_color,
                }}>绑定打印机</Text>
          </If>
        </TouchableOpacity>
      </List>)
    }
    return <View>
      {items}
    </View>
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
          <ScrollView style={{backgroundColor: colors.main_back, flexGrow: 1}}>
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
                style={{
                  backgroundColor: colors.white,
                  // color: colors.white,
                  width: '40%',
                  lineHeight: pxToDp(60),
                  textAlign: 'center',
                  borderRadius: pxToDp(20),
                  borderWidth: pxToDp(2)
                }}>联系客服</Button>

            <Button
                type={'primary'}
                onPress={() => {
                  if (this.state.chosed === 2) {
                    if (!tool.length(this.state.list[1].printer_bind_info) > 0) {
                      ToastLong("请先绑定打印机")
                      return;
                    }
                    Alert.alert('提示', '•兼容模式不支持在外送帮呼叫 “美团众包”配送；\n' +
                        '•如果美团商户端发起配送时，会跟外送帮上的骑手重复；\n' +
                        '•兼容模式不支持自动接单\t\t\t',
                        [
                          {text: '取消'},
                          {
                            text: '去授权',
                            onPress: () => {
                              let url = config.apiUrl(this.state.url);
                              this.onPress(config.ROUTE_WEB, {url: url, title: '绑定美团外卖'})
                            }
                          }
                        ]
                    )
                    return;
                  }

                  let url = config.apiUrl(this.state.url);
                  this.onPress(config.ROUTE_WEB, {url: url, title: '绑定美团外卖'})
                }}
                disabled={!tool.length(this.state.url) > 0}
                style={{
                  backgroundColor: tool.length(this.state.url) > 0 ? colors.main_color : '#bbb',
                  color: colors.white,
                  width: '40%',
                  marginLeft: "10%",
                  lineHeight: pxToDp(60),
                  textAlign: 'center',
                  borderRadius: pxToDp(20),
                  borderWidth: pxToDp(0)
                }}>绑定店铺</Button>

          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({});


export default connect(mapStateToProps, mapDispatchToProps)(BindMeituan)
