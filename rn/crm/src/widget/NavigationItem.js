/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react'
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import PropType from 'prop-types'
import pxToDp from "../util/pxToDp";
import color from "./color";

var {height,width}=Dimensions.get('window')
// create a component
class NavigationItem extends PureComponent {
  static propTypes = {
    position: PropType.oneOf(['left', 'right']),
    title: PropType.string,
    icon: PropType.any,
    onPress: PropType.func,
    containerStyle: PropType.any,
    iconStyle: PropType.any,
  }
  
  static defaultProps = {
    position: 'left'
  }
  
  render() {
    const {icon, iconStyle, title, titleStyle, containerStyle, onPress, children, position, ...others} = this.props;
    let _icon = this.props.icon &&
      <Image style={[position === 'left' ? styles.leftIcon : styles.rightIcon, iconStyle]} source={icon}/>

    let _title = this.props.title &&
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    return (
     <View>
       <TouchableOpacity style={[styles.containerDefault, containerStyle]} onPress={onPress} {...others}>
         {position === 'left' ? _icon : null}
          {_title}
         {position === 'right' ? _icon : null}
      </TouchableOpacity>
     </View>
    );
  }
}





// define your styles
const styles = StyleSheet.create({
  containerDefault: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: pxToDp(15),
    flex: 1,
  },
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
