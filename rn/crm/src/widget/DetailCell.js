//import liraries
import React, {PureComponent} from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import {Heading2, Paragraph} from './Text'
import Separator from './Separator'
import Entypo from "react-native-vector-icons/Entypo";

// create a component
class DetailCell extends PureComponent {
  render() {
    let icon = this.props.image && <Image style={styles.icon} source={this.props.image}/>
    return (
        <View style={styles.container}>
          <TouchableOpacity>
            <View style={[styles.content, this.props.style]}>
              {icon}
              <Heading2>{this.props.title}</Heading2>
              <View style={{flex: 1, backgroundColor: 'blue'}}/>
              <Paragraph style={{color: '#999999'}}>{this.props.subtitle}</Paragraph>
              <Entypo name='chevron-thin-right' style={{fontSize: 14, marginLeft: 5}}/>
            </View>
            <Separator/>
          </TouchableOpacity>
        </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  content: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 10,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  arrow: {
    width: 14,
    height: 14,
    marginLeft: 5,
  }
});

//make this component available to the app
export default DetailCell;
