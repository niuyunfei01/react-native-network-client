import {Yuan} from "./All";
import React from 'react'
import {TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types'
import colors from "../../pubilc/styles/colors";
import PixelRatio from "react-native/Libraries/Utilities/PixelRatio";

export default class JbbCheckbox extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    onPress: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      checked: false
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({checked: nextProps.checked})
  }

  toggle() {
    let checked = this.state.checked
    checked = !checked
    this.props.onPress(checked)
    this.setState({checked})
  }

  render() {
    return (
      <TouchableOpacity onPress={() => this.toggle()}>
        <Yuan
          icon={"md-checkmark"}
          size={10}
          ic={colors.white}
          w={18}
          bw={1 / PixelRatio.get()}
          bgc={this.state.checked ? colors.theme : colors.white}
          bc={this.state.checked ? colors.theme : colors.gray}
          mgr={20}
        />
      </TouchableOpacity>
    )
  }
}
