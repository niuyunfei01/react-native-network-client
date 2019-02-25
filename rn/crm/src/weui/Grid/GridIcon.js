import React from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, ViewPropTypes} from 'react-native'
import V from '../variable'

const styles = StyleSheet.create({
  gridIcon: {
    width: V.weuiGridIconSize,
    height: V.weuiGridIconSize,
    alignSelf: 'center'
  }
})
const GridIcon = (props) => {
  const {children, style, ...others} = props
  return <View style={[styles.gridIcon, style]} {...others}>{children}</View>
}
GridIcon.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  others: PropTypes.object
}

export default GridIcon
