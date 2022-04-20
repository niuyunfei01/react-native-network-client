import {StatusBar, StyleSheet} from 'react-native'
import pxToDp from '../../pubilc/util/pxToDp';

export default StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
  },
  order_box: {
    backgroundColor: '#fff',
    marginHorizontal: pxToDp(0),
    marginVertical: pxToDp(5),
  },
  active: {
    borderWidth: pxToDp(1),
    borderColor: '#000',
  },
  box_top: {
    marginVertical: pxToDp(12),
    marginHorizontal: pxToDp(20),
  },

  order_head: {
    marginBottom: pxToDp(20),
    height: pxToDp(50),
    flexDirection: 'row',
    // backgroundColor: 'red',
  },

  icon_ji: {
    width: pxToDp(35),
    height: pxToDp(35),
    alignSelf: 'center',
    marginRight: pxToDp(5),
  },
  o_index_text: {
    color: '#666',
    fontSize: pxToDp(32),
    fontWeight: 'bold',
    textAlignVertical: 'center',
    marginRight: pxToDp(30),
  },
  o_store_name_text: {
    height: pxToDp(40),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    color: '#999',
  },
  icon_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
    position: 'absolute',
    right: 0,
  },
  tag_right: {
    position: 'absolute',
    right: 0,
  },
  icon_img_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_style: {//和背景图片同框的按钮的样式
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_listStyle: {//下拉列表的样式
    width: pxToDp(150),
    height: pxToDp(141),
    backgroundColor: '#5f6660',
    marginTop: -StatusBar.currentHeight,
  },
  drop_textStyle: {//下拉选项文本的样式
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#fff',
    height: pxToDp(69),
    backgroundColor: '#5f6660',
    borderRadius: pxToDp(3),
    borderColor: '#5f6660',
    borderWidth: 1,
    shadowRadius: pxToDp(3),
  },
  drop_optionStyle: {//选项点击之后的文本样式
    color: '#4d4d4d',
    backgroundColor: '#939195',
  },

  order_body: {
    // backgroundColor: 'green',
  },
  order_body_text: {
    fontSize: pxToDp(30),
    color: '#333',
  },
  o_content: {
    fontWeight: 'bold',
    lineHeight: pxToDp(42),
  },
  ship_status: {
    alignSelf: 'flex-end',
  },
  ship_status_text: {
    fontSize: pxToDp(26),
    color: '#999',
  },
});