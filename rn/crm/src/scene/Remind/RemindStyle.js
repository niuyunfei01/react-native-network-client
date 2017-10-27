const top_styles = StyleSheet.create({
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
  },
  o_store_name_text: {
    height: pxToDp(50),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    color: '#999',
    paddingLeft: pxToDp(30),
  },
  icon_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
    position: 'absolute',
    right: 0,
    // backgroundColor: 'green',
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

const bottom_styles = StyleSheet.create({
  container: {
    height: pxToDp(70),
    borderTopWidth: 1,
    borderTopColor: '#999',
    paddingHorizontal: pxToDp(20),
    flexDirection: 'row',
  },

  time_date: {
    marginRight: pxToDp(10),
  },
  time_date_text: {
    color: '#4d4d4d',
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  time_start: {
    color: '#999',
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  icon_clock: {
    marginLeft: pxToDp(70),
    marginRight: pxToDp(5),
    width: pxToDp(35),
    height: pxToDp(35),
    marginTop: pxToDp(5),
    alignSelf: 'center',
  },
  time_end: {
    color: '#db5d5d',
    fontSize: pxToDp(34),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  operator: {
    position: 'absolute',
    right: pxToDp(20),
  },
  operator_text: {
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
});

export default {top_styles, bottom_styles};