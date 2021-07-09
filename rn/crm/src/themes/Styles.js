import React, { Component } from "react";
import {
  PixelRatio
} from "react-native";

import Fonts from "./Fonts";
import Metrics from "./Metrics";
import Colors from "./Colors";
import dpi from "./dpi";
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";

const one = 1 / PixelRatio.get();

const fontSizeScaler =
  PixelRatio.get() / PixelRatio.getFontScale(); /*安卓字体比例 */

const w = Metrics.CW;

const Styles = {
  h32bf: {
    color: Colors.greybf,
    fontSize: Fonts.size.h32,
    fontWeight: "bold"
  },
  columnStatWithFullScreen: {
    flexDirection: "column",
    flex: 1
  },
  h22theme: {
    color: Colors.theme,
    fontSize: Fonts.size.h22
  },
  h303e: {
    color: Colors.e3,
    fontSize: Fonts.size.h30,
    fontWeight: "bold"
  },
  h203e: {
    color: Colors.e3,
    fontSize: Fonts.size.h20
  },
  h18theme: {
    color: Colors.theme,
    fontSize: Fonts.size.h18
  },
  h22a2: {
    color: Colors.a2,
    fontSize: Fonts.size.h22
  },
  h223e: {
    color: Colors.e3,
    fontSize: Fonts.size.h22
  },
  h16c4: {
    color: Colors.c4,
    fontSize: Fonts.size.h16
  },
  // 对齐样式
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  around: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  columnAround: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center"
  },
  rowcenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  cowbetween: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  },
  columnCenter: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  columnStart: {
    flexDirection: "column",
  },
  itemsList:{
    width: pxToDp(560),
    height: '100%'
  },
  startcenter: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap"
  },
  endcenter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },

  // 其他通用样式
  border: {
    marginRight: one,
    marginBottom: one
  },

  inputStyle: {
    backgroundColor: Colors.line,
    width: w - 36,
    height: 48,
    marginBottom: 12,
    borderRadius: 3,
    fontSize: dpi.font(14),
    padding: 12
  },

  // 字体样式

  // h3
  h3b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.h3),
    fontWeight: "bold"
  },
  h3white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.h3)
  },
  h3whiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.h3),
    fontWeight: "bold"
  },
  //h5
  h5: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.h5)
  },
  h5b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.h5),
    fontWeight: "bold"
  },
  h5theme: {
    color: Colors.theme,
    fontSize: Fonts.size.h5,
    fontWeight: "bold"
  },
  //h6
  h6white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.h6)
  },

  //t
  t: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title)
  },
  tb: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title),
    fontWeight: "400"
  },
  ttheme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title)
  },
  tthemeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title),
    fontWeight: "bold"
  },
  twhite: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.title)
  },

  twhiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.title),
    fontWeight: "bold"
  },
  tgrey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.title)
  },
  tgrey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.title)
  },

  //t1
  t1: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title1)
  },
  t1b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title1),
    fontWeight: "400"
  },
  t1theme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title1)
  },
  t1themeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title1),
    fontWeight: "bold"
  },
  t1white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.title1)
  },
  t1whiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.title1),
    fontWeight: "bold"
  },
  t1grey3b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title1),
    fontWeight: "400"
  },
  t1grey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.title1)
  },
  t1grey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.title1)
  },
  t1grey9b: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.title1),
    fontWeight: "bold"
  },

  //t2
  t2: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title2)
  },
  t2b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.title2),
    fontWeight: "400"
  },
  t2theme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title2)
  },
  t2themeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.title2),
    fontWeight: "bold"
  },
  t2white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal1)
  },

  t2whiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal1),
    fontWeight: "bold"
  },
  t2grey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.title2)
  },
  t2grey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.title2)
  },
  t2grey9b: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.title2),
    fontWeight: "400"
  },

  //n1
  n0: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal1),
    fontWeight: "bold"
  },
  n1white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1whiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal1),
    fontWeight: "bold"
  },
  n1themeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.normal1),
    fontWeight: "bold"
  },
  n1theme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1green: {
    color: Colors.green,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1grey3: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1grey3b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal1),
    fontWeight: "bold"
  },
  n1greyf: {
    color: Colors.line,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1grey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1grey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1greyb: {
    color: Colors.greyb,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  n1greyc: {
    color: Colors.greyc,
    fontSize: dpi.font(Fonts.size.normal1)
  },

  //n2
  n2: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2b: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.normal2),
    fontWeight: "bold"
  },

  n2grey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2grey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2Green: {
    color: Colors.green,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2greyc: {
    color: Colors.greyc,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2white: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal2)
  },
  n2code: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.badge)
  },
  n2whiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.normal2),
    fontWeight: "bold"
  },

  n2themeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.normal2),
    fontWeight: "bold"
  },
  n2theme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.normal2)
  },

  //input
  input: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.input)
  },
  inputb: {
    color: Colors.grey3,
    fontSize: dpi.font(Fonts.size.input),
    fontWeight: "bold"
  },
  inputtheme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.input)
  },
  inputthemeb: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.input),
    fontWeight: "bold"
  },
  inputGreenb: {
    color: Colors.green,
    fontSize: dpi.font(Fonts.size.input),
    fontWeight: "bold"
  },
  inputwhite: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.input)
  },
  counttheme: {
    color: Colors.theme,
    fontSize: dpi.font(Fonts.size.h7)
  },
  /*引导页题目 */
  guideTitle: {
    color: Colors.black,
    fontSize: dpi.font(Fonts.size.input),
    fontWeight: "bold"
  },
  /*引导页标题 */
  eDesc: {
    color: Colors.black41,
    fontSize: dpi.font(Fonts.size.normal1)
  },
  inputwhiteb: {
    color: Colors.white,
    fontSize: dpi.font(Fonts.size.input),
    fontWeight: "bold"
  },
  inputgrey6: {
    color: Colors.grey6,
    fontSize: dpi.font(Fonts.size.input)
  },
  inputgrey9: {
    color: Colors.grey9,
    fontSize: dpi.font(Fonts.size.input)
  },

  TextInputBox: {
    borderBottomWidth: Metrics.one,
    borderBottomColor: Colors.line,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: 40
  },
  TextInput: {
    width: "70%",
    position: "relative",
    fontSize: dpi.font(14),
    padding: 10
  },
  navLeftIcon: {
    width: pxToDp(28),
    height: pxToDp(28),
    marginRight: 16
  },
  columnRowEnd: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  listImageSize: {
    width: pxToDp(150),
    height: pxToDp(150)
  },
  open_text: {
    color: colors.main_color,
    textAlign: "center"
  },
  close_text: {
    color: colors.warn_red,
    textAlign: "center"
  },
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  }
};

export default Styles;
