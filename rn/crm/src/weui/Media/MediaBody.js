import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'

const styles = StyleSheet.create({
  mediaBody: {
    flex: 1
  }
})
const MediaBody = (props) => {
  const {
    style,
    children,
    ...others
  } = props

  return (
    <View style={[styles.mediaBody, style]} {...others}>
      {children}
    </View>
  )
}

MediaBody.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node,
}

export default MediaBody
