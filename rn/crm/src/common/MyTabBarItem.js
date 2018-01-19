import React, {PureComponent} from 'react'
import {Image, View, Text} from 'react-native'
import IconBadge from '../widget/IconBadge';
import pxToDp from "../util/pxToDp";
import * as globalActions from '../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

function mapStateToProps(state) {
  const  {global,remind} = state;
  return {global: global,remind:remind}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}
class MyTabBarItem extends PureComponent {
  render() {
    let {remindNum} = this.props.remind;
    let selectedImage = this.props.selectedImage ? this.props.selectedImage : this.props.normalImage
    return (
        <View style={{position: 'relative',width:'100%',alignItems:'center',}}>
          <Image
              source={this.props.focused
                  ? selectedImage
                  : this.props.normalImage}
              style={{tintColor: this.props.tintColor, width: 25, height: 25}}
          />
          <IconBadge
              BadgeElement={
                <Text style={{color: '#FFFFFF', fontSize: pxToDp(18)}}>{remindNum > 99 ? '99+' : remindNum}</Text>
              }
              MainViewStyle={{position:'absolute',top:0,right:'25%'}}
              Hidden={remindNum == 0}
              IconBadgeStyle={
                {minWidth: 20, height: 15, top: 0, right: 0}
              }
          />
        </View>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyTabBarItem)
