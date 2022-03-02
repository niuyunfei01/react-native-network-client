import {StyleSheet,} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {screen} from '../../common'
import {color} from '../../widget'

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  btn_select: {
    marginRight: pxToDp(20),
    height: pxToDp(60),
    width: pxToDp(60),
    fontSize: pxToDp(40),
    color: colors.color666,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  icon: {
    width: pxToDp(74),
    height: pxToDp(56),
    alignItems: 'flex-end'
  },
  btn4text: {
    width: pxToDp(152),
    height: pxToDp(40)
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
  banner: {
    width: screen.width,
    height: screen.width * 0.5
  },
  row: {
    flexDirection: 'row',
    marginLeft: pxToDp(30),
    marginRight: pxToDp(40),
    alignContent: 'center',
    marginTop: pxToDp(14)
  },
  remarkText: {
    color: '#808080',
    fontWeight: 'bold',
    fontSize: pxToDp(24),
  },
  remarkTextBody: {
    marginLeft: pxToDp(6), marginRight: pxToDp(140)
  },
  moneyLeft: {
    width: pxToDp(480),
    flexDirection: 'row',
  },
  moneyRow: {marginTop: 0, marginBottom: pxToDp(12), alignItems: 'center'},
  moneyListTitle: {
    fontSize: pxToDp(26),
    color: colors.color333,
  },
  moneyListSub: {
    fontSize: pxToDp(26),
    color: colors.main_color,
  },
  moneyListNum: {
    fontSize: pxToDp(26),
    color: colors.color777,
  },
  buyButton: {
    backgroundColor: '#fc9e28',
    width: 94,
    height: 36,
    borderRadius: 7,
  },
  tagContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },
  tipHeader: {
    height: 35,
    justifyContent: 'center',
    borderWidth: screen.onePixel,
    borderColor: color.border,
    paddingVertical: 8,
    paddingLeft: 20,
    backgroundColor: 'white'
  },
  bottomBtn: {
    height: pxToDp(70), flex: 1, alignItems: 'center', justifyContent: 'center'
  },
  block: {
    marginTop: pxToDp(10),
    backgroundColor: colors.white,
  },
  editStatus: {
    color: colors.white,
    fontSize: pxToDp(22),
    borderRadius: pxToDp(5),
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2
  },
  product_img: {
    height: pxToDp(90),
    width: pxToDp(90),
    marginRight: pxToDp(15),
    borderRadius: 10,
    borderWidth: pxToDp(1),
    borderColor: '#999'
  },
  priceMode: {
    borderWidth: pxToDp(1),
    borderColor: '#ff6600',
    color: '#ff6600',
    marginRight: pxToDp(10),
    height: pxToDp(25),
    width: pxToDp(25),
    fontSize: pxToDp(20),
    textAlign: 'center'
  },
  goodsItem: {
    paddingTop: pxToDp(14),
    paddingBottom: pxToDp(14),
    borderBottomColor: colors.color999,
    borderBottomWidth: screen.onePixel
  },
  cell_row:{
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cell_body: {
    margin:pxToDp(40),
    padding:pxToDp(20),
    borderRadius:pxToDp(8),
    backgroundColor:'white'

  },
  footBtn:{
    marginTop:pxToDp(20),
    width:'100%',
    height: pxToDp(80),

    borderTopWidth:pxToDp(1),
    borderTopColor:'#999999',
    position: "relative",

  },

  btn1:{
    lineHeight: pxToDp(80),
    width:'100%',
    textAlign:'center',
    color:colors.main_color,

  },
  Item:{
    position: "relative",
  },
  txt:{
    marginLeft: pxToDp(40),
    lineHeight:pxToDp(80)

  },
  txt2:{
    marginLeft: pxToDp(40),

  },
  circle:{
    position: "absolute",
    top: pxToDp(26),
    width:pxToDp(26),
    height:pxToDp(26),
    borderRadius:pxToDp(50),
    backgroundColor:'black',


  },
  right_btn: {
    position: "absolute",
    top: pxToDp(20),
    right: pxToDp(-100),

    fontSize: pxToDp(50),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,

  },
  right_btn2: {
    position: "absolute",
    top: pxToDp(40),
    right: pxToDp(-100),

    fontSize: pxToDp(50),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,

  },
  cell_title:{
    marginLeft:pxToDp(40)
  }
});

export default styles;
