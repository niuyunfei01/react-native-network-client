import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, View, ViewPropTypes} from 'react-native'

const styles = StyleSheet.create({
  mediaInfoMeta: {
    paddingRight: 13 * 1,
  },
  mediaInfoMetaExtra: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: '#CECECE',
    paddingLeft: 13 * 1,
  },
  mediaInfoMetaText: {
    fontSize: 13,
    color: '#CECECE',
  }
})
const MediaInfoMeta = (props) => {
  const {
    extra,
    style,
    textStyle,
    children,
    ...others
  } = props

  return (
    <View style={[styles.mediaInfoMeta, extra ? styles.mediaInfoMetaExtra : {}, style]}>
      <Text style={[styles.mediaInfoMetaText, textStyle]} {...others}>
        {children}
      </Text>
    </View>
  )
}

MediaInfoMeta.propTypes = {
  extra: PropTypes.bool,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  children: PropTypes.node,
}

export default MediaInfoMeta
