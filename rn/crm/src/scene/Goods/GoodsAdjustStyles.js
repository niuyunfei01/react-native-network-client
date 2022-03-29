import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";

export default {
  headerImage: {
    width: pxToDp(35),
    height: pxToDp(37),
    marginLeft: pxToDp(20)
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: pxToDp(30)
  },
  in_cell: {
    minHeight: pxToDp(100),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row",
  },
  tabs: {
    height: pxToDp(64),
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: pxToDp(5),
    backgroundColor: colors.main_color,
    borderBottomWidth: 0.5,
    borderColor: colors.color999
  },
  tabItem: {
    height: pxToDp(62),
    width: pxToDp(180),
    fontSize: pxToDp(30),
    color: colors.main_color,
    backgroundColor: colors.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: 0.5,
    borderColor: colors.main_color,
  },
  tabActive: {
    backgroundColor: colors.main_color,
    color: colors.white
  },
  listItem: {
    marginTop: pxToDp(20),
    paddingVertical: pxToDp(30),
    paddingHorizontal: pxToDp(30),
    backgroundColor: colors.white,
    width: '100%'
  },
  listItemTop: {
    flexDirection: 'row'
  },
  listItemBatchImage: {
    height: pxToDp(52),
    width: pxToDp(52),
    marginRight: pxToDp(30)
  },
  listItemImage: {
    height: pxToDp(80),
    width: pxToDp(80),
    borderWidth: 0.5,
    borderColor: '#eeeeee'
  },
  listItemGoodsName: {
    fontSize: pxToDp(30),
    marginLeft: pxToDp(20),
    color: colors.fontBlack
  },
  listItemRemark: {
    marginTop: pxToDp(20),
    fontSize: pxToDp(24),
    borderWidth: 0.5,
    borderColor: '#eeeeee',
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(20)
  },
  listItemRemarkTag: {
    color: colors.main_color
  },
  listItemRemarkDetail: {
    color: colors.color666
  },
  listItemPrice: {
    fontSize: pxToDp(24),
    borderWidth: 0.5,
    borderColor: '#eeeeee',
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(20),
    borderTopWidth: 0
  },
  listItemOperation: {
    marginTop: pxToDp(20),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  operationTime: {
    fontSize: pxToDp(24),
    color: colors.fontGray,
    height: pxToDp(50),
    textAlignVertical: 'center'
  },
  listItemOperationBtn: {
    width: pxToDp(137),
    height: pxToDp(48),
    borderRadius: pxToDp(24),
    borderWidth: pxToDp(1),
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: pxToDp(6),
    fontSize: pxToDp(24),
  },
  operationBtnLight: {
    color: colors.main_color,
    borderColor: colors.main_color
  },
  operationBtnDark: {
    color: colors.color333,
    borderColor: colors.color333
  },

  dialogTopText: {
    color: '#e07540',
    fontSize: pxToDp(24)
  },
  dialogBottomText: {
    fontSize: pxToDp(24),
    color: colors.color666,
    marginTop: pxToDp(55)
  },
  dialogInput: {
    borderWidth: 0.5,
    borderColor: colors.main_color,
    height: pxToDp(68),
    marginTop: pxToDp(20),
    padding: 0
  }
}
