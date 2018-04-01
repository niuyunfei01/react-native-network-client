import React, {PureComponent} from 'react';
import pxToDp from "../../util/pxToDp";
import font from "./fontStyles";
import colors from "../../styles/colors";
import MyBtn from '../../common/myBtn'
import {
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import {
  Text,
  View,
  Image,
} from 'react-native'

class OrderComponent extends PureComponent {
  render() {
    return (
        <View style={{backgroundColor:'#fff'}}>
          <Cell customStyle={list.init_cell} first>
            <CellHeader style={list.flex}>
              <Text style={[font.font38, font.fontRed, font.fontWeight]}>#01</Text>
              <Text style={[font.font30]}>刘建通 (11111111111)</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
               <Text style={[font.fontBlue,font.font26]}>呼叫</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} access>
            <CellHeader>
              <Text style={[font.font30, font.fontBlack]}>送货时间</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={[font.font28, font.fontBlack]}>2018-03-09 09:30</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} access>
            <CellHeader style={list.flex}>
              <Text style={[font.font30, font.fontBlack]}>商品</Text>
              <Text style={[font.font26, font.fontGray, {marginLeft: pxToDp(20)}]}>$32.5</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={[font.font30, font.fontBlack]}>3</Text>
            </CellFooter>
          </Cell>
          {/*商品*/}
          <View>
            <Cell customStyle={list.init_cell}>
              <CellHeader style={list.flex}>
                <Text style={[font.font26, font.fontGray, {width: pxToDp(200)}]}>商品名</Text>
              </CellHeader>
              <CellFooter>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>分数</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>总量</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>单价</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>总价</Text>
              </CellFooter>
            </Cell>
          </View>

          <Cell customStyle={list.init_cell}>
            <CellHeader>
              <Text style={[font.font26, font.fontOrange]}>朱春浩 确认收货</Text>
              <Text style={[font.font26, font.fontOrange]}>2018-03-09 09:30</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <MyBtn text='确认计算' style={list.blue_btn}/>
            </CellFooter>
          </Cell>
        </View>
    )
  }
}
const list = {
  cell: {
    backgroundColor: colors.white,
  },
  item_header: {
    borderColor: colors.main_back,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(30),
  },
  init_cell: {
    marginLeft: pxToDp(30),
    paddingRight: pxToDp(0),
    marginHorizontal: pxToDp(30),
    minHeight: pxToDp(100),
    alignItems: 'center'
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goods_title: {
    flex: 1,
    textAlign: 'center',
  },
  blue_btn: {
    width: pxToDp(160),
    height: pxToDp(70),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    backgroundColor: colors.fontBlue,
    color: colors.white
  }
}

export default OrderComponent

