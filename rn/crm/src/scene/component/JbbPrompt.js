import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ConfirmDialog from "./ConfirmDialog";
import JbbInput from "./JbbInput";
import PropTypes from 'prop-types'

export default class JbbPrompt extends React.Component {
  static propTypes = {
    beforeVisible: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    initValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    autoFocus: PropTypes.bool,
    visible: PropTypes.bool,
    keyboardType: PropTypes.oneOf(['default', 'number-pad', 'decimal-pad', 'numeric', 'email-address', 'phone-pad']),
    rows: PropTypes.number
  }
  
  static defaultProps = {
    initValue: '',
    title: '输入',
    visible: false,
    autoFocus: false,
    keyboardType: 'default',
    rows: 1
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: this.props.visible,
      text: this.props.initValue ? this.props.initValue : ''
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({
      visible: nextProps.visible,
      text: nextProps.initValue ? nextProps.initValue : ''
    })
  }
  
  onCancel () {
    this.setState({visible: false})
    this.props.onCancel && this.props.onCancel()
  }
  
  onConfirm () {
    this.props.onConfirm && this.props.onConfirm(this.state.text)
    this.setState({visible: false})
  }
  
  renderConfirm () {
    return (
      <ConfirmDialog
        visible={this.state.visible}
        onClickCancel={() => this.onCancel()}
        onClickConfirm={() => this.onConfirm()}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>{this.props.title}</Text>
        </View>
        
        <View>
          <JbbInput
            initValue={this.state.text}
            autoFocus={this.props.autoFocus}
            onChange={(text) => this.setState({text})}
            value={String(this.state.text)}
            styles={this.props.rows > 1 ? {} : {height: 35}}
            keyboardType={this.props.keyboardType}
            rows={this.props.rows}
          />
        </View>
      </ConfirmDialog>
    )
  }
  
  handlePressChild = () => {
    if (this.props.beforeVisible) {
      if (!this.props.beforeVisible()) {
        return
      }
    }
    this.setState({visible: true})
  }
  
  render () {
    return this.props.children ? (
      <View>
        {this.renderConfirm()}
  
        <TouchableOpacity onPress={this.handlePressChild.bind(this)}>
          <View pointerEvents="none">
            {this.props.children}
          </View>
        </TouchableOpacity>
      </View>
    ) : this.renderConfirm()
  }
}

const styles = StyleSheet.create({
  titleWrap: {
    height: 35,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold'
  }
})