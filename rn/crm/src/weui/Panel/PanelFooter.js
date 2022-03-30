import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import $V from '../variable';
import Entypo from "react-native-vector-icons/Entypo";
import pxToDp from "../../util/pxToDp";

const $lineColor = '#E5E5E5'
const $grayColor = '#999999'
const styles = StyleSheet.create({
  PanelFooter: {
    paddingTop: 12, // 10
    paddingRight: 15,
    paddingBottom: 12,
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: $lineColor,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  PanelFooterText: {
    flex: 1,
    color: $grayColor,
    fontSize: 14
  }
})
const PanelFooter = (props) => {
  const {children, style, textStyle, access, ...others} = props
  return (
    <TouchableHighlight style={style} underlayColor={$V.itemActiveColor} {...others}>
      <View style={styles.PanelFooter}>
        <Text style={[styles.PanelFooterText, textStyle]}>
          {children}
        </Text>
        {access ?
          <Entypo name='chevron-thin-right' style={{fontSize: 20, color: '#E13030', marginLeft: pxToDp(5)}}/>
          : false}
      </View>
    </TouchableHighlight>
  )
}
PanelFooter.propTypes = {
  access: PropTypes.bool,
  children: PropTypes.node,
  textStyle: Text.propTypes.style,
  others: PropTypes.object
}

export default PanelFooter
