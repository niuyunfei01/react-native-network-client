import React from 'react'

import {StyleSheet} from 'react-native';
import colors from "../styles/colors";
import screen from "./screen";

const Styles = StyleSheet.create({
  topBottomLine: {
    borderColor: colors.color999,
    borderTopWidth: screen.onePixel,
    borderBottomWidth: screen.onePixel
  },

  cellTextH35: {
    fontSize: 15,
    marginTop: (35-20.5)/2,
    marginBottom: (35-20.5)/2
  },
  
  cellTextH45: {
    fontSize: 16,
    marginTop: (45-21.5)/2,
    marginBottom: (45-21.5)/2
  },
})

export default Styles