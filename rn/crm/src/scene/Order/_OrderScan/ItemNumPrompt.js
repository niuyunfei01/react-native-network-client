import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ConfirmDialog from "../../component/ConfirmDialog";
import PropTypes from 'prop-types'
import inputNumberStyles from "../inputNumberStyles";
import InputNumber from "rc-input-number";

export default class ItemNumPrompt extends React.Component {
  static propTypes = {
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    initValue: PropTypes.any,
    title: PropTypes.string,
    visible: PropTypes.bool,
    maxNumber: PropTypes.any
  }
  
  static defaultProps = {
    initValue: '',
    title: '选择数量',
    visible: false,
    autoFocus: false
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: this.props.visible,
      number: this.props.initValue ? this.props.initValue : 0
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({
      visible: nextProps.visible,
      number: nextProps.initValue ? nextProps.initValue : 0
    })
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
        onClickConfirm={() => this.props.onConfirm && this.props.onConfirm(this.state.number)}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>{this.props.title}</Text>
        </View>
        
        <View style={{height: 60, width: '100%', justifyContent: 'center'}}>
          <InputNumber
            styles={inputNumberStyles}
            min={0}
            max={this.props.maxNumber}
            value={this.state.number}
            style={{backgroundColor: 'white', width: '100%', height: 40}}
            onChange={(number) => this.setState({number})}
            keyboardType={'numeric'}
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