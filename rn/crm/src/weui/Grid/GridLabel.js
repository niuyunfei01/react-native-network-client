import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text} from 'react-native'
import V from '../variable'

const styles = StyleSheet.create({
  gridLabel: {
    textAlign: 'center',
    fontSize: V.weuiGridFontSize,
    color: V.globalTitleColor,
    marginTop: 5
  }
})
const GridLabel = (props) => {
  const {children, style, ...others} = props
  return <Text style={[styles.gridLabel, style]} {...others}>{children}</Text>
}
GridLabel.propTypes = {
  children: PropTypes.node,
  style: Text.propTypes.style,
  others: PropTypes.object
}

export default GridLabel
