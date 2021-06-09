import {Colors, Metrics} from "../../themes";
import {Yuan} from "./All";
import React from 'react'
import {TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types'

export default class JbbCheckbox extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    onPress: PropTypes.func
  }
  
  constructor (props) {
    super(props)
    this.state = {
      checked: false
    }
  }
  
  UNSAFE_componentWillReceiveProps (nextProps) {
    this.setState({checked: nextProps.checked})
  }
  
  toggle () {
    let checked = this.state.checked
    checked = !checked
    this.props.onPress(checked)
    this.setState({checked})
  }
  
  render () {
    return (
      <TouchableOpacity onPress={() => this.toggle()}>
        <Yuan
          icon={"md-checkmark"}
          size={10}
          ic={Colors.white}
          w={18}
          bw={Metrics.one}
          bgc={this.state.checked ? Colors.theme : Colors.white}
          bc={this.state.checked ? Colors.theme : Colors.greyc}
          mgr={20}
        />
      </TouchableOpacity>
    )
  }
}