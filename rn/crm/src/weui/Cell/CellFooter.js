import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, View} from 'react-native'
import V from '../variable'
import Entypo from "react-native-vector-icons/Entypo";
import pxToDp from "../../pubilc/util/pxToDp";

const styles = StyleSheet.create({
  cellFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  cellFooterText: {
    textAlign: 'center',
    color: V.globalTextColor,
    fontSize: V.weuiCellFontSize
  },
  vcode: {
    width: 100,
    height: 44,
  }
})
const CellFooter = (props) => {
  const {children, style, access, ...others} = props
  const childrenWithProps = React.Children.map(children, child => {
    if (!child.type) return <Text style={[styles.cellFooterText, style]} {...others}>{child} </Text>
    if (child.type && child.type.displayName === 'Image' && !child.props.style) {
      return React.cloneElement(child, {style: [styles.vcode, child.props.style]})
    }
    return child
  })
  return (
    <View style={styles.cellFooter}>
      {childrenWithProps}
      {access ?
        <Entypo name='chevron-thin-right' style={{fontSize: 20, color: '#E13030', marginLeft: pxToDp(5)}}/> : false}
    </View>
  )
}
CellFooter.propTypes = {
  access: PropTypes.bool,
  children: PropTypes.node,
  style: Text.propTypes.style,
  others: PropTypes.object
}

export default CellFooter
