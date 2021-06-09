import React from 'react'
import {PickerView} from "@ant-design/react-native";
import ConfirmDialog from "./ConfirmDialog";
import PropTypes from 'prop-types'
import {TouchableOpacity, View} from 'react-native'

/**
 * Demo <JbbPicker> ... </JbbPicker>
 */

export default class JbbPicker extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    data: PropTypes.array.isRequired,
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      selectValue: []
    }
  }
  
  onChange (value) {
    console.log('on change', value)
    this.setState({selectValue: value})
  }
  
  onScrollChange (value) {
    console.log('on scroll change', value)
  }
  
  onConfirm () {
    this.setState({visible: false})
    this.props.onConfirm && this.props.onConfirm(this.state.selectValue.join(''), this.state.selectValue)
  }
  
  render () {
    return (
      <View>
        <ConfirmDialog
          visible={this.state.visible}
          onClickCancel={() => this.props.onCancel()}
          onClickConfirm={() => this.onConfirm()}
          onRequestClose={() => this.setState({visible: false})}
        >
          <PickerView
            data={this.props.data}
            onChange={this.onChange}
            onScrollChange={this.onScrollChange}
            value={this.state.selectValue}
            cascade={false}
          />
        </ConfirmDialog>
        
        <TouchableOpacity onPress={() => this.setState({visible: true})}>
          {this.props.children}
        </TouchableOpacity>
      </View>
    )
  }
}