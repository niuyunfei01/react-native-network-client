import React, {PureComponent} from 'react'
import {StyleSheet, Text, View} from "react-native";
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp";

export default class PriceCompeteItem extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    image:PropTypes.string,
    wmPrice:PropTypes.number,
    goods_name:PropTypes.string,
  }
}