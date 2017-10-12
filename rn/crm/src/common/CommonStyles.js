import React from 'react'

import {StyleSheet} from 'react-native';
import colors from "../styles/colors";
import screen from "./screen";

const Styles = StyleSheet.create({
  topBottomLine: {
    borderColor: colors.color999,
    borderTopWidth: screen.onePixel,
    borderBottomWidth: screen.onePixel
  }
})

export default Styles