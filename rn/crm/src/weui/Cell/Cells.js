import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'
import V from '../variable'

const styles = StyleSheet.create({
  cells: {
    marginTop: V.weuiCellsMarginTop,
    backgroundColor: V.weuiCellBg,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: V.weuiCellBorderColor
  }
})
const Cells = (props) => {
  const {children, style, ...others} = props
  const childrenWithProps = React.Children.map(children, (child, idx) => {
    if (idx === 0) {
      return React.cloneElement(child, {first: true})
    }
    return child
  })
  return (
    <View style={[styles.cells, style]} {...others}>
      {childrenWithProps}
    </View>
  )
}
Cells.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  others: PropTypes.object
}

export default Cells
