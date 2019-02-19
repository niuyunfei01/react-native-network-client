import React, {PureComponent} from "react";
import {View} from "react-native";
import PropTypes from 'prop-types'
import HttpUtils from "../../../util/http";

export default class Refund extends PureComponent {
  static propTypes = {
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }
  
  static defaultProps = {}
  
  constructor (props) {
    super(props)
  }
  
  componentWillMount () {
    HttpUtils.get()
  }
  
  render () {
    return (
      <View></View>
    )
  }
}