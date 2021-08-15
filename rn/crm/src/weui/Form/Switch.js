import React from 'react';import PropTypes from 'prop-types';
import {
  Switch as RNSwitch,
  StyleSheet,
  ViewPropTypes
} from 'react-native'

const styles = StyleSheet.create({
  switch: {}
})

const Switch = (props) => {
  const {
    value,
    onChange,
    onValueChange,
    style,
    ...others
  } = props

  return (
    <RNSwitch
      style={[styles.switch, style]}
      onValueChange={onValueChange || onChange}
      value={value}
      {...others}
    />
  )
}

Switch.propTypes = {
  value: PropTypes.bool,
  style: ViewPropTypes.style,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
}

export default Switch
