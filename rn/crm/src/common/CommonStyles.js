import React from 'react'

import {StyleSheet} from 'react-native';
import colors from "../pubilc/styles/colors";
import screen from "./screen";

const Styles = StyleSheet.create({
  topBottomLine: {
    borderColor: colors.color999,
    borderTopWidth: screen.onePixel,
    borderBottomWidth: screen.onePixel
  },

  cells35: {
    marginTop: 0
  },

  cellsTitle35: {
    fontSize: 13, marginBottom: 0, marginTop: 0, height: 35, paddingTop: 15, paddingBottom: 4
  },

  inputH35: {
    height: 42,
    lineHeight: 20,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0
  },

  cellTextH35: {
    fontSize: 15,
    marginTop: (35 - 20.5) / 2,
    marginBottom: (35 - 20.5) / 2
  },

  cellTextH35W70: {
    width: 70,
    fontSize: 15,
    marginTop: (35 - 20.5) / 2,
    marginBottom: (35 - 20.5) / 2
  },

  cellTextH45: {
    fontSize: 16,
    marginTop: (45 - 21.5) / 2,
    marginBottom: (45 - 21.5) / 2
  },
})

export default Styles
