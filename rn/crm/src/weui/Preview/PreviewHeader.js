import React from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, ViewPropTypes} from 'react-native'
import V from '../variable'

const styles = StyleSheet.create({
  previewHeader: {
    paddingTop: V.weuiCellGapV,
    paddingBottom: V.weuiCellGapV,
    paddingRight: V.weuiCellGapH,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: V.weuiCellBorderColor,
    marginLeft: V.weuiCellGapH,
  },
})

const PreviewHeader = ({style, children, ...other}) => {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (child.type.name === 'PreviewItem') {
      return React.cloneElement(child, {preset: 'header'})
    }
    return child
  })

  return (
    <View style={[styles.previewHeader, style]} {...other}>{childrenWithProps}</View>
  )
}

PreviewHeader.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node,
}

export default PreviewHeader
