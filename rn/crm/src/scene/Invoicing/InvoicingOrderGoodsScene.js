import React, {PureComponent} from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native'
import font from './fontStyles'
import styles from './InvoicingStyles'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Cell from "../../weui/Cell/Cell";
import CellHeader from "../../weui/Cell/CellHeader";
import CellBody from "../../weui/Cell/CellBody";
import MyBtn from '../../common/myBtn'
import Cells from "../../weui/Cell/Cells";
import CellFooter from "../../weui/Cell/CellFooter";

class InvoicingOrderGoods extends PureComponent {
  constructor(props) {
    super(props)
  }

  tab() {
    return (
        <View style={[styles.in_cell, {
          backgroundColor: colors.white,
          marginBottom: pxToDp(10),
        }]}>
          <View style={tabs.tabs}>
            <Text style={[tabs.tabs_item, tabs.tabs_item_active, tabs.tabs_item_active_radius]}>待收货</Text>
            <Text style={[tabs.tabs_item,]}>待审核</Text>
            <Text style={[tabs.tabs_item, tabs.tabs_item_active, tabs.tabs_item_active_radius]}>待结算</Text>
          </View>
        </View>
    )
  }

  render() {
    return (
        <ScrollView>
          {
            this.tab()
          }
          <View style={list.cell}>
            <View style={[styles.in_cell, list.item_header]}>
              <View>
                <Text style={[font.font30, font.fontBlack]}>
                  回龙观店
                  <Text style={[font.font24, font.fontGray]}>2个订单</Text>
                </Text>
                <Text style={[font.font24, font.fontRed]}>待结算金额: $95.75</Text>
              </View>
              <View style={{flexDirection: 'row', width: pxToDp(220)}}>
                <View style={{
                  borderWidth: 1,
                  borderColor: colors.fontBlue,
                  width: pxToDp(160),
                  borderRadius: pxToDp(5),
                }}>
                  <Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>计算本店</Text>
                  <Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>所有订单</Text>
                </View>
              </View>
            </View>
            {/*
            展开详情
            */}
            <View>
              <Cell customStyle={list.init_cell} first>
                <CellHeader style={list.flex}>
                  <Text style={[font.font38, font.fontRed, font.fontWeight]}>#01</Text>
                  <Text style={[font.font30]}>刘建通 (11111111111)</Text>
                </CellHeader>
                <CellBody/>
                <CellFooter>
                  <Text>呼叫</Text>
                </CellFooter>
              </Cell>
              <Cell customStyle={list.init_cell} access>
                <CellHeader>
                  <Text style={[font.font30,font.fontBlack]}>送货时间</Text>
                </CellHeader>
                <CellBody/>
                <CellFooter>
                  <Text style={[font.font28,font.fontBlack]}>2018-03-09 09:30</Text>
                </CellFooter>
              </Cell>
              <Cell customStyle={list.init_cell} access>
                <CellHeader style={list.flex}>
                  <Text style={[font.font30,font.fontBlack]}>商品</Text>
                  <Text style={[font.font26,font.fontGray,{marginLeft:pxToDp(20)}]}>$32.5</Text>
                </CellHeader>
                <CellBody/>
                <CellFooter>
                  <Text style={[font.font30,font.fontBlack]}>3</Text>
                </CellFooter>
              </Cell>
              {/*商品*/}
              <View>
                <Cell customStyle={list.init_cell} >
                  <CellHeader style={list.flex}>
                    <Text style={[font.font26,font.fontGray,{width:pxToDp(200)}]}>商品名</Text>
                  </CellHeader>
                  <CellFooter>
                    <Text style={[font.font26,font.fontGray,list.goods_title]}>分数</Text>
                    <Text style={[font.font26,font.fontGray,list.goods_title]}>总量</Text>
                    <Text style={[font.font26,font.fontGray,list.goods_title]}>单价</Text>
                    <Text style={[font.font26,font.fontGray,list.goods_title]}>总价</Text>
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
          </View>
        </ScrollView>
    )
  }
}

const tabs = {
  tabs: {
    height: pxToDp(70),
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: pxToDp(35),
    backgroundColor: colors.fontBlue
  },
  tabs_item: {
    height: pxToDp(70),
    textAlignVertical: 'center',
    width: pxToDp(130),
    textAlign: 'center',
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.fontBlue,
  },
  tabs_item_active: {
    backgroundColor: colors.fontBlue,
    color: colors.white
  },
  tabs_item_active_radius: {
    borderRadius: pxToDp(35)
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
    minHeight:pxToDp(100),
    alignItems:'center'
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goods_title:{
    flex:1,
    textAlign:'center',
  },
  blue_btn:{
    width:pxToDp(160),
    height:pxToDp(70),
    textAlign:'center',
    textAlignVertical:'center',
    borderRadius:pxToDp(5),
    backgroundColor:colors.fontBlue,
    color:colors.white
  }
}
export default InvoicingOrderGoods