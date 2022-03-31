import React, {PureComponent} from 'react'
import {Image, StyleSheet} from 'react-native'
import pxToDp from "../../util/pxToDp";

class CallImg extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    return <Image source={require('../../pubilc/img/Public/call.png')} style={styles.callIcon}/>;
  }
}

const styles = StyleSheet.create({
  callIcon: {
    width: pxToDp(20),
    height: pxToDp(28),
    marginLeft: pxToDp(6)
  },
});


export default CallImg


