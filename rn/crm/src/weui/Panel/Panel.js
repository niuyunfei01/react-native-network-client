import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'

const lineColor = '#E5E5E5'
const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#fff',
    marginTop: 10,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: lineColor,
  }
})
const Panel = (props) => {
  const {children, style, ...others} = props
  return (
    <View style={[styles.panel, style]} {...others} >
      {children}
    </View>
  )
}
Panel.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  others: PropTypes.object
}

export default Panel
