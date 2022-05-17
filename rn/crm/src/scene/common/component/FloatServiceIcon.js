import React from 'react'
import {Dimensions, PanResponder, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import {connect} from "react-redux";
import {Text} from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

let height = Dimensions.get("window").height;

class FloatServiceIcon extends React.Component {
  constructor(props) {
    super(props)
    this.timeout = null;
  }

  render() {
    if (Number(this.props.global.config.float_kf_icon) !== 1) {
      return null;
    }
    return (
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.main_color,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 999,
        top: height * 0.65,
        right: 20
      }}
            ref={(c) => this.floatIcon = c}
            {...this._panResponder.panHandlers}>

        <TouchableOpacity onPress={() => {
          let {currVendorId} = tool.vendor(this.props.global)
          let data = {
            v: currVendorId,
            s: this.props.global.currStoreId,
            u: this.props.global.currentUser,
            m: this.props.global.currentUserProfile.mobilephone,
            place: 'float'
          }
          JumpMiniProgram("/pages/service/index", data);
        }}
        >
          <MaterialCommunityIcons style={{color: colors.white, fontSize: 32}} name={'face-agent'}/>
          <Text style={{color: colors.white, fontSize: 10}}>客服</Text>
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
          let {currVendorId} = tool.vendor(this.props.global)
          let data = {
            v: currVendorId,
            s: this.props.global.currStoreId,
            u: this.props.global.currentUser,
            m: this.props.global.currentUserProfile.mobilephone,
            place: 'float'
          }
          JumpMiniProgram("/pages/service/index", data);
        }, 800)
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        const {pageY, locationY, pageX, locationX} = evt.nativeEvent;
        this.preY = pageY - locationY - 58;
        this.preX = pageX - locationX - 23;
        // console.log(pageY, locationY, 'pageY, locationY9')
        // item.setNativeProps({
        //   style: {
        //     shadowColor: "#000",
        //     shadowOpacity: 0.3,
        //     shadowRadius: 5,
        //     shadowOffset: {height: 0, width: 2},
        //     elevation: 5
        //   }
        // });
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
        this.floatIcon.setNativeProps({
          style: {top: top, left: left}
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        // console.log(3)
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // console.log(evt, '4')
        return true;

      },
      onPanResponderTerminate: (evt, gestureState) => {
        // console.log(5)
        return true;
        // Another component has become the responder, so this gesture
        // should be cancelled
      }
    });
  }
}

export default connect(mapStateToProps)(FloatServiceIcon)
