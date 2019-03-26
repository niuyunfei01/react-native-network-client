import React from "react";
import {StyleSheet} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {CellsTitle} from "../../weui/Cell";

export default class JbbCellTitle extends React.Component {
  render () {
    return (
      <CellsTitle style={[styles.cell_title]}>{this.props.children}</CellsTitle>
    );
  }
}

const styles = StyleSheet.create({
  cellTitle: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  }
})