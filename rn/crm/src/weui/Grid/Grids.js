import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'
import Grid from './Grid'
import V from '../variable'
import tool from "../../pubilc/util/tool";

const styles = StyleSheet.create({
  grids: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: V.weuiGridBorderColor,
  }
})

export default class Grids extends Component {
  static defaultProps = {
    data: []
  }

  renderData(data) {
    return data.map((item, i) =>
      <Grid
        key={i}
        icon={item.icon}
        label={item.label}
        {...item}
      />)
  }

  render() {
    const {children, data, style, ...others} = this.props
    return (
      <View style={[styles.grids, style]} {...others}>
        {tool.length(data) > 0 ? this.renderData(data) : children}
      </View>
    )
  }
}

Grids.propTypes = {
  data: PropTypes.array,
  style: ViewPropTypes.style,
  children: PropTypes.node,
}
