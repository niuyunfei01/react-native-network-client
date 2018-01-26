import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

const style = {
  cell: {
    backgroundColor: colors.white,
    height: pxToDp(100),
    marginLeft: 0,
    paddingLeft: pxToDp(40),
    justifyContent: 'space-between',
    borderTopColor: colors.main_back
  },
  cells: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  cell_header_text: {
    fontSize: pxToDp(30),
    color: colors.fontBlack,
  },
  cell_header_text_white: {
    fontSize: pxToDp(30),
    color: colors.white,
  },
  cell_footer_text: {
    fontSize: pxToDp(30),
    color: colors.fontGray,
  },
  time: {
    flex: 1,
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray,
    borderRadius: pxToDp(5),
    height: pxToDp(65),
    textAlignVertical: 'center',
    paddingLeft: pxToDp(16),
  },
  operation: {
    height: pxToDp(50),
    width: pxToDp(50),
  },
  percentage_text: {
    height: pxToDp(56),
    width: pxToDp(126),
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray,
    borderRadius: pxToDp(5),
    color: colors.fontBlack,
    textAlignVertical: 'center',
    textAlign: 'center',
    marginHorizontal: pxToDp(40),
  }
};
export default style;

