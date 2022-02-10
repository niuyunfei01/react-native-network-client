//import liraries
import React, {PureComponent} from 'react'
import {StyleSheet, View} from 'react-native'

import color from './color'

// create a component
class SpacingView extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    height: 14,
    backgroundColor: color.background,
  },
});

//make this component available to the app
export default SpacingView;
