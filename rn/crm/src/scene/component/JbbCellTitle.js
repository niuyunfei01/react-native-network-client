import React from "react";
import {StyleSheet, Text, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import PropTypes from 'prop-types'

export default class JbbCellTitle extends React.Component {
  static propTypes = {
    right: PropTypes.any
  }

  render() {
    return (
      <View style={styles.cellTitle}>
        <Text style={styles.cellsTitle}>{this.props.children}</Text>
        {this.props.right}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cellTitle: {
    paddingVertical: pxToDp(10),
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f9',
    borderBottomColor: '#ddd',
    borderBottomWidth: pxToDp(1),
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%'
  },
  cellsTitle: {
    fontSize: 15,
    color: '#3e3e3e',
    fontWeight: 'bold'
  }
})
