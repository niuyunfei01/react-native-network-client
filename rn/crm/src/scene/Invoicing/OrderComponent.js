import React, {PureComponent} from 'react';
import pxToDp from "../../util/pxToDp";
import font from "./fontStyles";
import colors from "../../pubilc/styles/colors";
import {Cell, CellBody, CellFooter, CellHeader, Cells} from "../../weui/index";
import {Text, View,} from 'react-native'
import CallBtn from './CallBtn'
import {padNum} from "../../util/common"
import numeral from "numeral";
import _ from "lodash"
import PropTypes from 'prop-types';
import Constant from "../../Constat"

class OrderComponent extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      expandGood: false
    }
    this.getOrderCost = this.getOrderCost.bind(this)
    this.renderGoods = this.renderGoods.bind(this)
  }

  getOrderCost(order) {
    let totalCost = 0;
    let reqItems = order['req_items'];
    reqItems.forEach(function (item) {
      totalCost += parseFloat(item['total_cost']);
    });
    return numeral(totalCost).format('0.00')
  }

  renderGoods(items) {
    let goods = [];
    _.forEach(items, function (item, idx) {
      goods.push(<Cell key={idx} customStyle={list.good_cell} access={false}>
        <CellHeader style={list.flex}>
          <Text style={{width: pxToDp(150)}}>{item['name']} </Text>
        </CellHeader>
        <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {/*<Text style={[font.font26, font.fontGray, list.goods_title]}>{item['total_req']} </Text>*/}
          <Text
            style={[font.font26, font.fontGray, list.goods_title]}>{item['req_amount']}{Constant.INVOICING.SkuUnitMap[item['unit_type']]} </Text>
          <Text style={[font.font26, font.fontGray, list.goods_title]}>{item['unit_price']} </Text>
          <Text style={[font.font26, font.fontGray, list.goods_title]}>{item['total_cost']} </Text>
        </CellBody>
        <CellFooter access={false}/>
      </Cell>);
    });
    return (<View>
      <Cell customStyle={list.init_cell} access={false}>
        <CellHeader style={list.flex}>
          <Text style={[font.font26, font.fontGray, {width: pxToDp(200)}]}>商品名</Text>
        </CellHeader>
        <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {/*<Text style={[font.font26, font.fontGray, list.goods_title]}>分数</Text>*/}
          <Text style={[font.font26, font.fontGray, list.goods_title]}>总量</Text>
          <Text style={[font.font26, font.fontGray, list.goods_title]}>单价</Text>
          <Text style={[font.font26, font.fontGray, list.goods_title]}>总价</Text>
        </CellBody>
      </Cell>
      <Cells style={{borderTopWidth: 0.5, borderBottomWidth: 0}}>
        {goods}
      </Cells>
    </View>);
  }

  render() {
    let {data, idx, supplier} = this.props;
    let self = this;
    return (
      <View style={{backgroundColor: '#fff'}} key={idx}>
        <Cell customStyle={list.init_cell} first>
          <CellHeader style={list.flex}>
            <Text style={[font.font38, font.fontRed, font.fontWeight]}>#{padNum(idx + 1, 2)} </Text>
            <Text style={[font.font30]}>{supplier['name']} ({supplier['mobile']}) </Text>
          </CellHeader>
          <CellBody/>
          <CellFooter>
            <CallBtn mobile={supplier['mobile']} label={'呼叫'}/>
          </CellFooter>
        </Cell>
        <Cell customStyle={list.init_cell} access>
          <CellHeader>
            <Text style={[font.font30, font.fontBlack]}>送货时间</Text>
          </CellHeader>
          <CellBody/>
          <CellFooter>
            <Text style={[font.font28, font.fontBlack]}>{data['consignee_date']} </Text>
          </CellFooter>
        </Cell>
        <Cell customStyle={list.init_cell} access onPress={() => {
          self.setState({expandGood: !self.state.expandGood})
        }}>
          <CellHeader style={list.flex}>
            <Text style={[font.font30, font.fontBlack]}>商品</Text>
            <Text style={[font.font26, font.fontGray, {marginLeft: pxToDp(20)}]}>￥{this.getOrderCost(data)} </Text>
          </CellHeader>
          <CellBody/>
          <CellFooter>
            <Text style={[font.font30, font.fontBlack]}>{data['req_items'].length} </Text>
          </CellFooter>
        </Cell>
        {/*商品*/}
        {this.state.expandGood && this.renderGoods(data['req_items'])}
        <Cell customStyle={list.init_cell}>
          <CellHeader>
            <Text style={[font.font26, font.fontGray]}>{data['consignee_name']} 确认收货</Text>
            <Text style={[font.font26, font.fontGray]}>{data['consignee_date']} </Text>
          </CellHeader>
          <CellBody style={{marginLeft: 25,}}>
            <Text style={[font.font26, font.fontGray]}>{data['balance_name']} 确认结算</Text>
            <Text style={[font.font26, font.fontGray]}>{data['balance_date']} </Text>
          </CellBody>
          <CellFooter/>
        </Cell>
      </View>
    )
  }
}

OrderComponent.PropTypes = {
  idx: PropTypes.number,
  data: PropTypes.object,
  supplier: PropTypes.object
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
  },
  good_cell: {
    marginLeft: pxToDp(30),
    paddingRight: pxToDp(0),
    marginHorizontal: pxToDp(30),
    minHeight: pxToDp(80),
    alignItems: 'center'
  },
}

export default OrderComponent

