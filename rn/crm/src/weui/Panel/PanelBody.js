import React from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, ViewPropTypes} from 'react-native'

const styles = StyleSheet.create({
  panelBody: {},
})
const PanelBody = (props) => {
  const {children, style, ...others} = props
  const childrenWithProps = React.Children.map(children, (child, idx) => {
    if (idx === 0) {
      return React.cloneElement(child, {first: true})
    }
    return child
  })
  return (
    <View style={[styles.panelBody, styles.cellPrimay, style]} {...others}>
      {childrenWithProps}
    </View>
  )
}
PanelBody.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  others: PropTypes.object
}

export default PanelBody