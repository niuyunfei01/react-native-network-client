import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
} from 'react-native';
import {
  Cell,
  CellHeader,
  CellFooter,
} from "../../weui/index";

import style from "./commonStyle";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import tool from '../../common/tool'

class ActivityItem extends PureComponent {

  render() {
    let {
      customStyle,
      textStyle,
      item,
    } = this.props;
    let {price_rules,interval_rules,goods_rules} = item;
    let {vendor_id,start_time,end_time,rule_name,ext_store}=price_rules;
    return (
        <View style={[manage.cells, customStyle]}>
          <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
            <CellHeader>
              <Text style={{fontSize: pxToDp(36), color: colors.fontBlack,width:pxToDp(300), fontWeight: '900'}}>{rule_name}</Text>
            </CellHeader>
            <View>
              <Text style={[manage.cell_footer_text, textStyle]}>{start_time}</Text>
              <Text style={[manage.cell_footer_text, textStyle]}>至{end_time}</Text>
            </View>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}>
            <CellHeader style={{width:pxToDp(500)}}>
              <Text style={style.cell_header_text}>99</Text>
            </CellHeader>
            <CellFooter>
              <Text>843958</Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}>
            <CellHeader>
              <Text style={style.cell_header_text}>通用加价规则</Text>
            </CellHeader>
            <CellFooter>
              <Text></Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}>
            <CellHeader>
              <Text style={style.cell_header_text}>特殊分类规则</Text>
            </CellHeader>
            <CellFooter>
              <Text>组分类</Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}>
            <CellHeader>
              <Text style={style.cell_header_text}>特殊商品规则</Text>
            </CellHeader>
            <CellFooter>
              <Text>组商品</Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]}>
            <Text style={manage.edit_btn}>复制使用</Text>
          </Cell>
          <View/>
        </View>
    )
  }
}

const manage = {
  cell_footer_text: {
    textAlign: 'right',
    color: colors.main_color,
  },
  cells: {
    position: 'relative',
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    marginBottom: pxToDp(20),
    marginVertical: pxToDp(20)
  },
  cell: {
    marginLeft: 0,
    paddingLeft: pxToDp(15),
    paddingRight: pxToDp(15),
    backgroundColor: 'rgba(0,0,0,0)',
    minHeight:pxToDp(100),
  },
  edit_btn: {
    height: pxToDp(80),
    backgroundColor: colors.fontBlue,
    color: 'white',
    borderRadius: pxToDp(10),
    flex: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  ball: {
    height: pxToDp(22),
    width: pxToDp(22),
    position: 'absolute',
    borderRadius: pxToDp(11),
    top: pxToDp(109)
  },
  ball_left: {
    left: pxToDp(-9),
  },
  ball_right: {
    right: pxToDp(-11),
  },
  ball_main_color: {
    backgroundColor: '#a3d0ac',
  },
  ball_main_yellow: {
    backgroundColor: '#f1c377',
  },
  down: {
    height: pxToDp(22),
    width: pxToDp(40),
  }
}
export default ActivityItem;