import pxToDp from "../util/pxToDp";
import colors from "./colors";

export default {
  selectStyle: {flex: 1},//选择元素的样式定义（仅在默认模式下可用！）。注意：由于React Native中的更改，RN <0.39.0应该flex:1明确地传递给selectStyle支持。
  selectTextStyle: {},//选择元素的样式定义（仅在默认模式下可用）
  overlayStyle: {padding: pxToDp(90), justifyContent: 'center',},//覆盖背景元素的样式定义。RN <= 0.41应该用padding的像素值来重写。
  sectionStyle: {}, //选择元素的样式定义|section: true 的样式
  sectionTextStyle: {fontSize: pxToDp(34), fontWeight: 'bold', color: colors.color333},//选择文本元素的样式定义|section: true 的样式
  optionContainerStyle: {backgroundColor: colors.white, maxHeight: pxToDp(800)},//选项容器元素的样式定义 | 大的框样式
  optionStyle: {height: pxToDp(90)},//选项元素的样式定义
  optionTextStyle: {color: colors.color666},//选项文本元素的样式定义
  cancelStyle: {backgroundColor: colors.white, height: pxToDp(80), marginTop: pxToDp(10)},// 取消元素的样式定义
  cancelTextStyle: {color: colors.color666},//取消文本元素的样式定义
};