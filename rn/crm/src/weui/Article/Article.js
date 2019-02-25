import React from 'react';
import PropTypes from 'prop-types';
import {
  ScrollView,
  StyleSheet,
  ViewPropTypes
} from 'react-native'

const styles = StyleSheet.create({
  article: {
    paddingTop: 20,
    paddingRight: 15,
    paddingBottom: 20,
    paddingLeft: 15,
  },
})

const Article = (props) =>
  <ScrollView style={[styles.article, props.style]}>
    {props.children}
  </ScrollView>

Article.propTypes = {
  style: ViewPropTypes.style,
  children: PropTypes.node
}

export default Article
