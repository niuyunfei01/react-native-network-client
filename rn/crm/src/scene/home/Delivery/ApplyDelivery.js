//import liraries
import React, {PureComponent} from "react";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import Config from "../../../pubilc/common/config";
import {Icon} from "../../../weui";
import native from "../../../pubilc/util/native";
import HttpUtils from "../../../pubilc/util/http";
import tool from "../../../pubilc/util/tool";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";


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
    const {store_id, accessToken} = this.props.global;
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
      can_call_worker: false,
      store_id,
      accessToken
    }
    this.get_platform();
  }

  get_platform() {
    showModal('加载中...')
    const {store_id, accessToken, delivery_id} = this.state;
    const api = `/v1/new_api/delivery/get_delivery_status/${store_id}/${delivery_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      hideModal()
      if (tool.length(res.work_order) > 0) {
        this.setState({
          err_msg: res.work_order.content,
          service_mobile: res.work_order.phone,
          can_call_worker: res.work_order.can_call_worker === 1
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
      });
    })
  }

  submit() {
    if (this.state.status !== 0) {
      ToastLong('申请状态错误，请刷新重试')
      return;
    }
    tool.debounces(() => {
      showModal('申请开通中...')
      const {store_id, accessToken, delivery_id} = this.state;
      let data = {
        store_id: store_id,
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
      }, (ret) => {
        hideModal()
        ToastLong('操作失败' + ret.desc);
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
    let {
      lng,
      lat,
      store_name,
      delivery_name,
      status,
      apply_time,
      can_call_worker,
      err_msg,
      address,
      user_mobile
    } = this.state;
    return (
      <View style={{backgroundColor: colors.white, flex: 1, padding: pxToDp(35)}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{flexGrow: 1}}>
          <Text style={{
            fontSize: pxToDp(35),
            color: colors.fontGray,
            marginTop: pxToDp(10)
          }}>您正在申请开通“{delivery_name}”配送平台</Text>

          <If condition={status < 2}>
            <Text style={{
              fontSize: pxToDp(35),
              color: colors.fontGray,
              marginTop: pxToDp(10)
            }}>预计开通时间：{apply_time} </Text>
          </If>


          <If condition={status === 1}>
            <View style={{marginTop: pxToDp(100), marginBottom: pxToDp(50)}}>
              <Text style={{fontSize: pxToDp(65), textAlign: "center", marginTop: pxToDp(30)}}>已提交申请</Text>
            </View>
            <Text
              style={{
                fontSize: pxToDp(35),
                color: colors.fontBlack,
                marginTop: pxToDp(30)
              }}>“{delivery_name}”平台需要等平台核对，创建完成后将自动开通。</Text>
            <View style={{marginTop: pxToDp(30), marginBottom: pxToDp(50)}}>
              {can_call_worker ? <TouchableOpacity
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
                }}>
                <Text style={{color: colors.color333}}>联系客服</Text>
              </TouchableOpacity> : null}
            </View>
          </If>

          <If condition={status === 3}>
            <View style={{marginTop: pxToDp(140), marginBottom: pxToDp(100)}}>
              <Icon name="warn"
                    size={pxToDp(100)}
                    style={{backgroundColor: "#fff"}}
                    color={"#d81e06"}/>
              <Text style={{fontSize: pxToDp(50), textAlign: "center", marginTop: pxToDp(30)}}>开通失败</Text>
            </View>
            <Text style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(50)}}>错误信息:</Text>
            <Text
              style={{
                fontSize: pxToDp(35),
                color: colors.fontBlack,
                marginTop: pxToDp(30)
              }}>{err_msg} </Text>

          </If>


          <If condition={status === 2}>
            <View style={{marginTop: pxToDp(140), marginBottom: pxToDp(100)}}>
              <Icon name="success"
                    size={pxToDp(100)}
                    style={{backgroundColor: "#fff"}}/>
              <Text style={{fontSize: pxToDp(50), textAlign: "center", marginTop: pxToDp(30)}}>开通成功</Text>
            </View>
          </If>

          <Text style={{fontSize: pxToDp(35), color: colors.fontBlack, marginTop: pxToDp(50)}}>取货地址:</Text>
          <Text
            style={{
              fontSize: pxToDp(35),
              color: colors.fontBlack,
              marginTop: pxToDp(30)
            }}>{address} </Text>
          <Text style={{
            fontSize: pxToDp(35),
            color: colors.fontBlack,
            marginTop: pxToDp(25)
          }}>联系电话： {user_mobile} </Text>

          <If condition={status === 0 && lat && lng}>
            <View style={{height: pxToDp(600), marginTop: pxToDp(50)}}>
              <MapView
                mapType={MapType.Navi}
                initialCameraPosition={{
                  target: {latitude: Number(lat), longitude: Number(lng)},
                  zoom: 16
                }}>
                <Marker
                  draggable={false}
                  position={{latitude: Number(lat), longitude: Number(lng)}}
                  onPress={() => alert("onPress")}
                >
                  <View style={{alignItems: 'center'}}>

                    <View style={{
                      zIndex: 999,
                      backgroundColor: colors.main_color,
                      marginBottom: 15,
                      padding: 8,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: colors.white,
                        fontSize: 18,
                      }}>{store_name} </Text>
                    </View>
                    <Entypo name={'triangle-down'}
                            style={{color: colors.main_color, fontSize: 30, position: 'absolute', top: 24}}/>
                  </View>
                </Marker>
              </MapView>
            </View>
          </If>

        </ScrollView>
        <View style={{
          flexDirection: 'row',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: pxToDp(70),
        }}>

          <If condition={status === 0}>
            <TouchableOpacity
              type={'primary'}
              onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_STORE_ADD, {
                  btn_type: "edit",
                  editStoreId: this.props.global.store_id,
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
              }}>
              <Text style={{color: 'white', lineHeight: pxToDp(60), textAlign: 'center'}}>修改地址电话</Text>
            </TouchableOpacity>
            <TouchableOpacity
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
              }}>
              <Text style={{color: 'white', lineHeight: pxToDp(60), textAlign: 'center'}}>申请开通</Text>
            </TouchableOpacity>
          </If>

          <If condition={status === 3 && can_call_worker}>
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: '#4a98e7',
                // marginHorizontal: pxToDp(30),
                borderRadius: pxToDp(20),
                textAlign: 'center',
                // marginBottom: pxToDp(70),
              }} onPress={() => {
              this.callMobile()
            }}><Text
              style={{color: 'white', lineHeight: pxToDp(60), textAlign: 'center'}}>联系客服</Text></TouchableOpacity>
          </If>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyDelivery);
