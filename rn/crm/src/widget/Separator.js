//import liraries
import React, {PureComponent} from 'react'
import {StyleSheet, View} from 'react-native'

import color from './color'
import {screen} from '../util'

// create a component
class Separator extends PureComponent {
  render() {
    return (
        <View style={[styles.line, this.props.style]}/>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  line: {
    width: screen.width,
    height: screen.onePixel,
    backgroundColor: color.border,
  },
});

//make this component available to the app
export default Separator;
