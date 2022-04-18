import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'

const styles = StyleSheet.create({
  section: {
    marginBottom: 22.5
  }
})

const Section = (props) =>
  <View style={[styles.section, props.style]}>
    {props.children}
  </View>

Section.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node
}

export default Section
