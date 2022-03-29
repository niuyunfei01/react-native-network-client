import React from 'react'
import {Dimensions, TouchableOpacity} from "react-native";
import colors from "../../pubilc/styles/colors";
import tool from "../../pubilc/common/tool";
import {JumpMiniProgram} from "../../pubilc/util/WechatUtils";
import {connect} from "react-redux";
import {Text} from "react-native-elements";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

let height = Dimensions.get("window").height;

class FloatServiceIcon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    if (Number(this.props.global.config.float_kf_icon) !== 1) {
      return null;
    }
    return (
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
      }} style={{
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
      }}>
        <MaterialCommunityIcons style={{color: colors.white, fontSize: 32}} name={'face-agent'}/>
        <Text style={{color: colors.white, fontSize: 10}}>客服</Text>
      </TouchableOpacity>
    )
  }
}

export default connect(mapStateToProps)(FloatServiceIcon)
