import React from 'react'
import PropTypes from 'prop-types'
import color from '../../widget/color'
import {Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../util/pxToDp";

class JbbButton extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['default', 'hollow', 'text']), // 默认 空心 文字
    backgroundColor: PropTypes.string,
    borderWidth: PropTypes.number,
    borderColor: PropTypes.string,
    fontWeight: PropTypes.string,
    fontColor: PropTypes.string,
    textUnderline: PropTypes.bool,
    paddingHorizontal: PropTypes.number,
    paddingVertical: PropTypes.number,
    fontSize: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    touchStyle: PropTypes.object,
    disabled: PropTypes.bool
  }
  
  static defaultProps = {
    backgroundColor: '#fff',
    borderColor: color.theme,
    borderWidth: pxToDp(1),
    fontWeight: '400',
    fontColor: color.theme,
    type: 'default',
    textUnderline: false,
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    fontSize: pxToDp(26),
    width: 0,
    height: 0,
    touchStyle: {},
    disabled: false
  }
  
  
  renderBtn () {
    const btnStyle = {
      alignItems: 'center',
      justifyContent: 'center'
    }
    if (this.props.type === 'default') {
      btnStyle.backgroundColor = this.props.disabled ? color.fontGray : this.props.backgroundColor
    }
    if (this.props.type !== 'text') {
      btnStyle.borderColor = this.props.disabled ? color.fontGray : this.props.borderColor
      btnStyle.borderWidth = this.props.borderWidth
      btnStyle.paddingHorizontal = this.props.paddingHorizontal
      btnStyle.paddingVertical = this.props.paddingVertical
      
      if (this.props.width > 0) {
        btnStyle.width = this.props.width
      }
      if (this.props.height > 0) {
        btnStyle.height = this.props.height
      }
    }
    
    const textStyle = {}
    if (this.props.type === 'text') {
      textStyle.textDecorationLine = this.props.textUnderline ? 'underline' : 'none'
    }
    textStyle.fontSize = this.props.fontSize
    textStyle.color = this.props.disabled ? '#fff' : this.props.fontColor
    textStyle.fontWeight = this.props.fontWeight
    
    return (
      <View style={btnStyle}>
        <Text style={textStyle}>{this.props.text}</Text>
      </View>
    )
  }
  
  render (): React.ReactNode {
  
    return this.props.disabled ? this.renderBtn() : (
      <TouchableOpacity
        onPress={() => this.props.onPress()}
        style={this.props.touchStyle}
      >
        {this.renderBtn()}
      </TouchableOpacity>
    )
  }
}

export default JbbButton