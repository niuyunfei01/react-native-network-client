import React from "react";
import {StyleSheet, TextInput} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import PropTypes from "prop-types";

export default class JbbInput extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    initValue:PropTypes.string,
    rows: PropTypes.number,
    styles: PropTypes.object
  }
  
  static defaultProps = {
    placeholder: '',
    multiline: false,
    initValue:'',
    rows: 1
  }
  
  rerender () {
    this.forceUpdate()
  }
  
  render () {
    return (
      <TextInput
        underlineColorAndroid='transparent'
        placeholder={this.props.placeholder}
        onChangeText={(value) => this.props.onChange(value)}
        value={this.props.value}
        placeholderTextColor={'#cad0d9'}
        style={[styles.formInput, this.props.styles]}
        multiline={this.props.rows > 1}
        numberOfLines={this.props.rows}
        defaultValue={this.props.initValue}
      />
    );
  }
}

const styles = StyleSheet.create({
  formInput: {
    borderWidth: pxToDp(1),
    borderColor: colors.main_color,
    marginHorizontal: pxToDp(50),
    paddingLeft: pxToDp(45),
    textAlign: 'left',
    textAlignVertical: 'top' // 在多行情况下，光标从第一行开始（默认居中）
  }
})