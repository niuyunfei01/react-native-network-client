import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'
import V from '../variable'

const styles = StyleSheet.create({
  previewFooter: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: V.weuiDialogLineColor,
  },
})

const PreviewFooter = ({style, children, ...other}) =>
    <View style={[styles.previewFooter, style]} {...other}>{children}</View>

PreviewFooter.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node,
}

export default PreviewFooter
