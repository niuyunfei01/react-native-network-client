import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, View, ViewPropTypes} from 'react-native'

const $lineColor = '#E5E5E5'
const $grayColor = '#999999'
const styles = StyleSheet.create({
  panelHeader: {
    paddingTop: 14, // 14
    paddingRight: 15,
    paddingBottom: 14, // 12
    marginLeft: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: $lineColor,
  },
  panelHeaderText: {
    color: $grayColor,
    fontSize: 13,
  }
})

const PanelHeader = (props) => {
  const {children, style, textStyle, ...others} = props
  return (
    <View style={[styles.panelHeader, style]} {...others}>
      <Text style={[styles.panelHeaderText, textStyle]}>{children} </Text>
    </View>
  )
}
PanelHeader.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  others: PropTypes.object
}

export default PanelHeader
