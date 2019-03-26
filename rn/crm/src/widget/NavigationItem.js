/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Image,Dimensions} from 'react-native'
import PropType from 'prop-types'
import pxToDp from "../util/pxToDp";
import color from "./color";
var {height,width}=Dimensions.get('window')
// create a component
class NavigationItem extends PureComponent {
  static propTypes = {
    iconPosition: PropType.oneOf(['left', 'right']),
    title: PropType.string
  }
  
  static defaultProps = {
    iconPosition: 'left'
  }
  
  render() {
    const {icon, iconStyle, title, titleStyle, containerStyle, onPress, children, iconPosition, ...others} = this.props;
    let _icon = this.props.icon &&
      <Image style={[iconPosition === 'left' ? styles.leftIcon : styles.rightIcon, iconStyle]} source={icon}/>

    let _title = this.props.title &&
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    return (
     <View>
        <TouchableOpacity style={[{flexDirection:'row',alignItems:'center'},containerStyle]} onPress={onPress} {...others}>
          {iconPosition === 'left' ? _icon : null}
          {_title}
          {iconPosition === 'right' ? _icon : null}
      </TouchableOpacity>
     </View>
    );
  }
}





// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    width: pxToDp(48),
    height: pxToDp(38),
    marginLeft: pxToDp(31),
  },
  rightIcon: {
    width: pxToDp(48),
    height: pxToDp(38),
    marginVertical: 10,
    marginRight: pxToDp(31),
    tintColor: color.fontGray,
  },
  title: {
    fontSize: 15,
    color: '#333333',
  }
});

//make this component available to the app
export default NavigationItem;
