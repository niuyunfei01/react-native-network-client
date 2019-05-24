import React from "react";
import {StyleSheet, Text, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import $V from "../../weui/variable";

export default class JbbCellTitle extends React.Component {
  render () {
    return (
      <View style={styles.cellTitle}>
        <Text style={styles.cellsTitle}>{this.props.children}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cellTitle: {
    paddingBottom: pxToDp(10),
    backgroundColor: '#f5f5f9',
    borderBottomColor: '#ddd',
    borderBottomWidth: pxToDp(1),
    flex: 1
  },
  cellsTitle: {
    marginTop: $V.weuiCellTipsFontSize * 0.77 + (14 * $V.baseLineHeight - 14) * 0.5,
    paddingLeft: $V.weuiCellGapH,
    paddingRight: $V.weuiCellGapH,
    fontSize: $V.weuiCellTipsFontSize,
    color: $V.globalTextColor,
  }
})