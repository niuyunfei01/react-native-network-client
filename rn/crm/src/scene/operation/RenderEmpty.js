import pxToDp from "../../util/pxToDp";
import React, {PureComponent} from 'react';
import {Text, View,} from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../../pubilc/styles/colors";

class RenderEmpty extends PureComponent {
  render() {
    return (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
          <FontAwesome5 name={'file-signature'} size={52}
                        color={colors.color999}
          />
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
        </View>
    )

  }
}

export default RenderEmpty;
