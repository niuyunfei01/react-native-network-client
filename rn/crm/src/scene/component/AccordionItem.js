import React from 'react'
import {View, StyleSheet, Text, TouchableOpacity, Image} from "react-native";
import colors from "../../styles/colors";
import styles from "../Order/OrderStyles";
import CommonStyle from "../../common/CommonStyles";
import pxToDp from "../../util/pxToDp";
import PropTypes from 'prop-types'

export default class AccordionItem extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    tips: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.object
  }
  
  static defaultProps = {
    expanded: false,
    tips: '',
    style: {}
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: this.props.expanded
    }
  }
  
  onExpanded () {
    this.props.onPress && this.props.onPress()
    this.setState({visible: !this.state.visible})
  }
  
  render () {
    return (
      <View>
        <View style={[CommonStyle.topBottomLine, styles.block]}>
          <View style={[styles.row, accordionStyles.row]}>
            <Text style={accordionStyles.title}>{this.props.title}</Text>
            <Text style={accordionStyles.tips}>{this.props.tips}</Text>
            <View style={{flex: 1}}/>
            <TouchableOpacity onPress={() => this.onExpanded()}>
              <Image
                source={
                  this.state.visible ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')
                }
                style={accordionStyles.image}/>
            </TouchableOpacity>
          </View>
        </View>
        <If condition={this.state.visible}>
          <View style={accordionStyles.content}>
            <View style={[accordionStyles.container, this.props.style]}>
              {this.props.children}
            </View>
          </View>
        </If>
      </View>
    )
  }
}

const accordionStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    marginTop: 0,
    height: pxToDp(65),
    marginRight: 0,
  },
  title: {
    color: colors.title_color,
    fontSize: pxToDp(30),
    fontWeight: 'bold'
  },
  tips: {
    color: colors.fontGray,
    fontSize: pxToDp(25),
    marginLeft: pxToDp(15)
  },
  content: {
    backgroundColor: '#fff',
    borderTopWidth: pxToDp(1),
    borderTopColor: "#D3D3D3",
    position: 'relative'
  },
  image: {
    alignSelf: 'center',
    marginLeft: pxToDp(20),
    width: pxToDp(90),
    height: pxToDp(72)
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30),
    paddingTop: pxToDp(20),
    width: '100%'
  }
})