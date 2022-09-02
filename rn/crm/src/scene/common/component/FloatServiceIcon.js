import React from 'react'
import {Dimensions, PanResponder, Platform, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import {connect} from "react-redux";
import {Text} from "react-native-elements";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {setFloatSerciceIcon, setUserCfg} from "../../../reducers/global/globalActions";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import BottomModal from "../../../pubilc/component/BottomModal";
import native from "../../../pubilc/util/native";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

let height = Dimensions.get("window").height;
let width = Dimensions.get("window").width;

class FloatServiceIcon extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.mixpanel = MixpanelInstance;
    this.timeout = null;
    this.state = {
      show_call_service_modal: false,
      contacts: '',
    }
  }

  oncallservice = () => {
    if (!this.state.is_self_yy) {
      return this.setState({
        show_call_service_modal: true
      })
    }
    this.openMiniprogarm()
  }

  openMiniprogarm = () => {
    const {global, fromComponent} = this.props
    let {currStoreId, currentUser, currentUserProfile} = global;
    if (fromComponent)
      this.mixpanel.track(fromComponent + '_联系客服');
    let {currVendorId} = tool.vendor(global)
    let data = {
      v: currVendorId,
      s: currStoreId,
      u: currentUser,
      m: currentUserProfile.mobilephone,
      place: 'float'
    }
    JumpMiniProgram("/pages/service/index", data);
  }

  contactService = () => {
    let {is_self_yy, contacts} = this.props.global.customer_service_auth;
    if (!is_self_yy) {
      return this.setState({
        show_call_service_modal: true,
        contacts: contacts
      })
    }
    this.openMiniprogarm()
  }

  callService = () => {
    if (this.state.contacts !== '' && this.state.contacts !== undefined) {
      this.setState({
        show_call_service_modal: false
      }, () => {
        native.dialNumber(this.state.contacts);
      })
    } else {
      ToastLong("号码为空")
    }
  }

  oncloseCallModal = (e = 0) => {
    this.setState({
      show_call_service_modal: false
    })
    if (e === 1) {
      this.openMiniprogarm()
    }
  }


  render() {
    const {global, dispatch} = this.props
    let {user_config, show_float_service_icon} = global;
    let {top, left} = user_config !== undefined && user_config?.coordinate ? user_config?.coordinate : {
      top: height * 0.65,
      left: width * 0.82
    };

    if (Number(global?.float_kf_icon) !== 1 || !show_float_service_icon) {
      return null;
    }
    return (
      <View style={[Platform.OS === "ios" ? {
        zIndex: 999
      } : {}]}>
        <View style={{
          width: 62,
          height: 62,
          borderRadius: 30,
          backgroundColor: colors.main_color,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: 999,
          top: top,
          left: left
        }}
              ref={(c) => this.floatIcon = c}
              {...this._panResponder.panHandlers}>


          <BottomModal title={'提示'} actionText={'其他问题'} closeText={'配送问题'} onPress={this.callService}
                       onPressClose={() => this.oncloseCallModal(1)}
                       visible={this.state.show_call_service_modal}
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
                       btnTitleStyle={{color: colors.main_color}} onClose={this.oncloseCallModal}>
            <View style={{
              marginHorizontal: 20,
              marginVertical: 8
            }}>
              <Text style={{
                fontSize: 15,
                color: colors.color333,
              }}>您的问题是：</Text>
              <Text style={{
                fontSize: 15,
                color: colors.color333,
                marginVertical: 4,
              }}> 配送问题：请点击配送问题，联系客服</Text>
              <Text style={{
                fontSize: 15,
                color: colors.color333,
              }}> 其他问题：请点击其他问题或通过其他方式联系店铺运营 </Text>
            </View>
          </BottomModal>

          <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={this.contactService}>
            <FontAwesome5 style={{color: colors.white, fontSize: 26}} name={'headset'}/>
            {/*<MaterialCommunityIcons style={{color: colors.white, fontSize: 32}} name={'face-agent'}/>*/}
            <Text style={{color: colors.white, fontSize: 10, marginTop: 4}}>客服</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity onPress={() => {
          dispatch(setFloatSerciceIcon(false));
          ToastLong("客服快捷功能已关闭，可在设置中打开")
        }} style={{
          position: 'absolute',
          zIndex: 999,
          top: top - 4,
          left: left + 50,
        }} ref={(c) => this.floatIconx = c}
        >
          <Entypo onPress={() => {
            dispatch(setFloatSerciceIcon(false));
            ToastLong("客服快捷功能已关闭，可在设置中打开")
          }} name="circle-with-cross"
                  style={{
                    zIndex: 999, fontSize: 20, color: colors.fontGray
                  }}/>
        </TouchableOpacity>
      </View>
    )
  }


  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        this.timeout = setTimeout(() => {
          this.contactService()
        }, 800)
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        const {pageY, locationY, pageX, locationX} = evt.nativeEvent;
        this.preY = pageY - locationY - 58;
        this.preX = pageX - locationX - 23;
      },
      onPanResponderMove: (evt, gestureState) => {

        if (gestureState.dy === 0 || gestureState.dx === 0) {
          return;
        }
        if (this.timeout != null) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
        let top = this.preY + gestureState.dy;
        let left = this.preX + gestureState.dx;
        if (top > height * 0.8) top = height * 0.8;
        if (left > width * 0.8) left = width * 0.85;
        if (left < 0) left = 10;
        if (top < 0) top = 10;

        tool.debounces(() => {
          let {user_config} = this.props.global
          user_config.coordinate = {
            top: top, left: left
          }
          this.props.dispatch(setUserCfg(user_config));
        }, 2000)


        this.floatIcon.setNativeProps({
          style: {top: top, left: left}
        });
        this.floatIconx.setNativeProps({
          style: {top: top - 4, left: left + 50}
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {
        return true;

      },
      onPanResponderTerminate: (evt, gestureState) => {
        return true;
        // Another component has become the responder, so this gesture
        // should be cancelled
      }
    });
  }
}

export default connect(mapStateToProps)(FloatServiceIcon)
