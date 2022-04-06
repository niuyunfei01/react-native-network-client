import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'

const styles = StyleSheet.create({
  mediaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    paddingBottom: 5,
    overflow: 'hidden',
  }
})
const MediaInfo = (props) => {
  const {
    style,
    children,
    ...others
  } = props

  return (
      <View style={[styles.mediaInfo, style]} {...others}>
        {children}
      </View>
  )
}

MediaInfo.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node,
}

export default MediaInfo
