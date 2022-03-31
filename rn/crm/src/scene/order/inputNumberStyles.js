import {StyleSheet} from 'react-native';
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#222',
  },
  stepWrap: {
    width: pxToDp(40),
    height: pxToDp(40),
    borderRadius: 6,
    backgroundColor: colors.main_color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    textAlign: 'center',
    fontSize: pxToDp(38),
    color: colors.white,
    backgroundColor: 'transparent',
  },
  stepDisabled: {
    borderColor: '#d9d9d9',
    backgroundColor: 'rgba(239, 239, 239, 0.72)',
  },
  disabledStepTextColor: {
    color: '#ccc',
  },
  highlightStepTextColor: {
    color: '#2DB7F5',
  },
  highlightStepBorderColor: {
    borderColor: '#2DB7F5',
  },
});
