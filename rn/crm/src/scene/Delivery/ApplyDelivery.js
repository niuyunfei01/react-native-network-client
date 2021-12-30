//import liraries
import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {WebView} from "react-native-webview";
import {Button} from "@ant-design/react-native";
import Config from "../../config";
import {Icon} from "../../weui";
import native from "../../common/native";
import HttpUtils from "../../util/http";
import tool from "../../common/tool";
import {hideModal, showModal, ToastLong} from "../../util/ToastUtils";

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}


const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class ApplyDelivery extends PureComponent {

  constructor(props) {
    super(props);
    let delivery_id = this.props.route.params.delivery_id;
    const {currStoreId, accessToken} = this.props.global;
    this.state = {
      status: 0,
      source: {},
      delivery_id: delivery_id,
      delivery_name: '配送平台',
      apply_time: '20分钟',
      address: '北京市朝阳区',
      user_mobile: '',
      lng: '',
      lat: '',
      store_name: '店铺昵称',
      err_msg: "当前城市无运力",
      service_mobile: "15507992268",
      can_call_worker:false,
      currStoreId,
      accessToken
    }
    this.get_platform();
  }

  get_platform() {
    showModal('加载中...')
    const {currStoreId, accessToken, delivery_id} = this.state;
    const api = `/v1/new_api/delivery/get_delivery_status/${currStoreId}/${delivery_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      hideModal()
      if (tool.length(res.work_order) > 0) {
        this.setState({
          err_msg: res.work_order.content,
          service_mobile: res.work_order.phone,
          can_call_worker:res.worker.can_call_worker === 1
        })
      }
      let {platform_name, complete_time, apply_status, store} = res;
      this.setState({
        delivery_name: platform_name,
        apply_time: complete_time,
        status: apply_status,
        store_name: store.store_name,
        address: store.address,
        lng: store.lng,
        lat: store.lat,
        user_mobile: store.mobile,
      }, this.webview.reload());
    })
  }

  submit() {
    if (this.state.status !== 0) {
      ToastLong('申请状态错误，请刷新重试')
      return;
    }
    tool.debounces(() => {
      showModal('申请开通中...')
      const {currStoreId, accessToken, delivery_id} = this.state;
      let data = {
        store_id: currStoreId,
        platform: delivery_id,
      }
      const api = `/v1/new_api/delivery/create_delivery_shop?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, data).then((res) => {
        hideModal()
        // ToastShort('操作成功');
        if (tool.length(res) > 0) {
          this.setState({
            status: res.apply_status,
            service_mobile: res.service_mobile,
            err_msg: res.err_msg,
          })
        }
      }, (ok, msg, ret) => {
        hideModal()
        ToastLong('操作失败' + msg);
      })
    }, 1000)
  }

  callMobile(type = 1) {
    let mobile = this.state.user_mobile;
    if (type === 1) {
      mobile = this.state.service_mobile;
    }
    native.dialNumber(mobile);
  }

  render() {
    let url = `https://m.amap.com/navi/?dest=${this.state.lng},${this.state.lat}&destName=${this.state.store_name}&hideRouteIcon=1&key=85e66c49898d2118cc7805f484243909`
    return (
      <View style={{backgroundColor: colors.white, flex: 1, padding: pxToDp(35)}}>
        <ScrollView style={{flexGrow: 1}}>
          <Text style={{
            fontSize: pxToDp(35),
            color: colors.fontGray,
            marginTop: pxToDp(10)
          }}>您正在申请开通“{this.state.delivery_name}”配送平台</Text>

          <If condition={this.state.status < 2}>
            <Text style={{
              fontSize: pxToDp(35),
              color: colors.fontGray,
              marginTop: pxToDp(10)
            }}>预计开通时间：{this.state.apply_time}</Text>
          </If>


          <If condition={this.state.status === 1}>
            <View style={{marginTop: pxToDp(100), marginBottom: pxToDp(50)}}>
              <Text style={{fontSize: pxToDp(65), textAlign: "center", marginTop: pxToDp(30)}}>已提交申请</Text>
            </View>
            <Text
              style={{
                fontSize: pxToDp(35),
                color: colors.fontBlack,
                marginTop: pxToDp(30)
              }}>“{this.state.delivery_name}”平台需要等平台核对，创建完成后将自动开通。</Text>
            <View style={{marginTop: pxToDp(30), marginBottom: pxToDp(50)}}>
              {this.state.can_call_worker ? <Button
                type={'primary'}
                onPress={() => {
                  this.callMobile();
                }}
                // size={"small"}
                style={{
                  backgroundColor: '#bbb',
                  color: colors.white,
                  width: pxToDp(240),
                  lineHeight: pxToDp(60),
                  textAlign: 'center',
                  borderRadius: pxToDp(20),
                  borderWidth: pxToDp(0)
                }}>联系客服</Button>:null}
            </View>
          </If>

          <If condition={this.state.status === 3}>
            <View style={{marginTop: pxToDp(140), marginBottom: pxToDp(100)}}>
              <Icon name="warn"
                    size={pxToDp(100)}
                    style={{backgroundColor: "#fff"}}
                    color={"#d81e06"}/>
              <Text style={{fontSize: pxToDp(50), textAlign: "center", marginTop: pxToDp(30)}}>开通失败</Text>
            </View>
            <Text style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(50)}}>错误信息:</Text>
            <Text
              style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(30)}}>{this.state.err_msg}</Text>

          </If>


          <If condition={this.state.status === 2}>
            <View style={{marginTop: pxToDp(140), marginBottom: pxToDp(100)}}>
              <Icon name="success"
                    size={pxToDp(100)}
                    style={{backgroundColor: "#fff"}}/>
              <Text style={{fontSize: pxToDp(50), textAlign: "center", marginTop: pxToDp(30)}}>开通成功</Text>
            </View>
          </If>

          <Text style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(50)}}>取货地址:</Text>
          <Text
            style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(30)}}>{this.state.address}</Text>
          <Text style={{
            fontSize: pxToDp(35),
            color: colors.fontBlack,
            marginTop: pxToDp(25)
          }}>联系电话： {this.state.user_mobile}</Text>

          <If condition={this.state.status === 0}>
            <View style={{height: pxToDp(600), marginTop: pxToDp(50)}}>
              <WebView
                ref={(webview) => (this.webview = webview)}
                automaticallyAdjustContentInsets={true}
                source={{uri: url}}
                scalesPageToFit
              />
            </View>
          </If>

        </ScrollView>
        <View style={{
          flexDirection: 'row',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: pxToDp(70),
        }}>

          <If condition={this.state.status === 0}>
            <Button
              type={'primary'}
              onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_STORE_ADD, {
                  btn_type: "edit",
                  editStoreId: this.props.global.currStoreId,
                  actionBeforeBack: resp => {
                  }
                });
              }}
              style={{
                backgroundColor: '#bbb',
                color: colors.white,
                width: '48%',
                lineHeight: pxToDp(40),
                textAlign: 'center',
                borderRadius: pxToDp(20),
                borderWidth: pxToDp(0)
              }}>修改地址电话</Button>
            <Button
              type={'primary'}
              onPress={() => {
                this.submit();
              }}
              style={{
                backgroundColor: colors.main_color,
                color: colors.white,
                width: '48%',
                lineHeight: pxToDp(60),
                textAlign: 'center',
                marginLeft: "4%",
                borderRadius: pxToDp(20),
                borderWidth: pxToDp(0)
              }}>申请开通</Button>
          </If>

          <If condition={this.state.status === 3 && this.state.can_call_worker}>
            <Button
              type={'primary'}
              style={{
                width: '100%',
                backgroundColor: '#4a98e7',
                // marginHorizontal: pxToDp(30),
                borderRadius: pxToDp(20),
                textAlign: 'center',
                // marginBottom: pxToDp(70),
              }} onPress={() => {
              this.callMobile()
            }}>联系客服</Button>
          </If>
        </View>
      </View>
    );
  }
}

const
  styles = StyleSheet.create({});
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(ApplyDelivery);
