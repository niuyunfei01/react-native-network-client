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

var {height,width}=Dimensions.get('window')
// create a component
class NavigationItem extends PureComponent {
  render() {

    const {icon, iconStyle, title, titleStyle, containerStyle, onPress,children, ...others,} = this.props;
    let _icon = this.props.icon &&
      <Image style={[styles.icon, iconStyle]} source={icon}/>

    let _title = this.props.title &&
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    return (
     <View>
        <TouchableOpacity style={[{flexDirection:'row',alignItems:'center'},containerStyle]} onPress={onPress} {...others}>
        {_icon}
        {_title}
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
  icon: {
    width: 27,
    height: 27,
    margin: 8,
  },
  title: {
    fontSize: 15,
    color: '#333333',
    margin: 8,
  }
});

//make this component available to the app
export default NavigationItem;
