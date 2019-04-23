import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ConfirmDialog from "./ConfirmDialog";
import JbbInput from "./JbbInput";
import PropTypes from 'prop-types'

export default class JbbPrompt extends React.Component {
  static propTypes = {
    onConfirm: PropTypes.func,
    initValue: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool
  }
  
  static defaultProps = {
    initValue: '',
    title: '输入',
    visible: false
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: this.props.visible,
      text: this.props.initValue
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({visible: nextProps.visible, text: nextProps.initValue})
  }
  
  onCancel () {
    this.setState({visible: false})
    this.props.onCancel && this.props.onCancel()
  }
  
  renderConfirm () {
    return (
      <ConfirmDialog
        visible={this.state.visible}
        onClickCancel={() => this.onCancel()}
        onClickConfirm={() => this.props.onConfirm && this.props.onConfirm(this.state.text)}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>{this.props.title}</Text>
        </View>
        
        <View>
          <JbbInput
            onChange={(text) => this.setState({text})}
            value={this.state.text}
            styles={{height: 35}}
          />
        </View>
      </ConfirmDialog>
    )
  }
  
  render () {
    return this.props.children ? (
      <View>
        {this.renderConfirm()}
        
        <If condition={this.props.children}>
          <TouchableOpacity onPress={() => this.setState({visible: true})}>
            {this.props.children}
          </TouchableOpacity>
        </If>
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