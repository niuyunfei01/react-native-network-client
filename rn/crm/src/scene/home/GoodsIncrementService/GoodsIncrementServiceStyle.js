import {StyleSheet, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import React from "react";

export const LineView = () => {
  return (
    <View style={Styles.line}/>
  )
}
export const Styles = StyleSheet.create({
  line: {
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  rowWrap: {
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  zoneWrap: {
    backgroundColor: colors.white,
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 25
  },
  headerTitleText: {
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 21
  },
  saveZoneWrap: {justifyContent: 'flex-end', backgroundColor: colors.white},
  saveWrap: {
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 2,
    backgroundColor: colors.main_color,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 22,
    paddingTop: 7,
    paddingBottom: 7,
    textAlign: 'center'
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  tipText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.red,
    lineHeight: 21,
    paddingLeft: 12,
    paddingBottom: 10
  },
})
