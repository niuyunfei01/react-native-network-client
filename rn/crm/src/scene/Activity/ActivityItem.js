import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
} from 'react-native';
import {
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";

import style from "./commonStyle";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import tool from '../../common/tool'
import Cts from '../../Cts'
import ActivityDialog from './ActivityDialog'

class ActivityItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      renderType: 0,
      type: 0,
      price_rules: {},
      interval_rules: {},
      goods_rules: [],
      vendor_id: 0,
      price_rules_str: '',
      ext_store: [],
      ext_store_id: [],
      rule_name: '',
      start_time: '',
      end_time: []

    }
  }

  componentWillMount() {
    let _this = this;
    try {
      let {price_rules, interval_rules, goods_rules} = _this.props.item;
      let {min_price, max_price, percent} = interval_rules[Cts.RULE_TYPE_GENERAL][Object.keys(interval_rules[Cts.RULE_TYPE_GENERAL])[0]];
      let {ext_store, vendor_id, rule_name, ext_store_id, start_time, end_time} = price_rules;
      _this.setState({
        price_rules: price_rules,
        interval_rules: interval_rules,
        goods_rules: goods_rules,
        price_rules_str: `${min_price / 100}-${max_price / 100}元${percent}%等`,
        ext_store: ext_store,
        vendor_id: vendor_id,
        ext_store_id: ext_store_id,
        rule_name: rule_name,
        start_time: start_time,
        end_time: end_time,
      })
    } catch (e) {
      console.log(e)
    }
  }

  dialogToggle(type, title) {
    this.setState({
      showDialog: true,
      title: title,
      type: type,
    })
  }

  renderSelect() {
    let {type} = this.state;
    let {ext_store, interval_rules, goods_rules} = this.state;
    switch (type) {
      case constant.VENDOR:
        return tool.objectMap(ext_store, (ite, index) => {
          return (
              <Cell key={index} customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
                <CellHeader>
                  <Text>{ite}</Text>
                </CellHeader>
              </Cell>
          )
        });
        break;
      case Cts.RULE_TYPE_GENERAL:
        return tool.objectMap(interval_rules[Cts.RULE_TYPE_GENERAL], (ite, index) => {
          let {min_price, max_price, percent} = ite;
          return (
              <Cell key={index} customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
                <CellHeader>
                  <Text>{min_price / 100}元-{max_price / 100}元</Text>
                </CellHeader>
                <CellFooter>
                  <Text>{percent}%</Text>
                </CellFooter>
              </Cell>
          )
        });
        break;
      case Cts.RULE_TYPE_SPECIAL:
        return tool.objectMap(interval_rules[Cts.RULE_TYPE_SPECIAL], (item, index) => {
          let {category_list, rules} = item;
          return (
              <View key={index}>
                <Cell key={index} customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
                  <CellHeader>
                    <Text>
                      {
                        Object.values(category_list).join(',')
                      }
                    </Text>
                  </CellHeader>
                </Cell>
                {
                  tool.objectMap(rules, (ite, index) => {
                    let {min_price, max_price, percent} = ite;
                    return (
                        <Cell key={index}
                              customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
                          <CellHeader>
                            <Text>{min_price / 100}元-{max_price / 100}元</Text>
                          </CellHeader>
                          <CellFooter>
                            <Text>{percent}%</Text>
                          </CellFooter>
                        </Cell>
                    )
                  })
                }
              </View>
          )
        });
        break;
      case constant.GOOD_RULE:
        return goods_rules.map((item,index) => {
          let {percent,prod_list}=item;
          return (
              <View key={index}>
                <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15),minHeight:pxToDp(100)}]}>
                  <CellHeader>
                    <Text>
                      {percent}%
                    </Text>
                  </CellHeader>
                </Cell>
                {
                  tool.objectMap(prod_list, (ite, index) => {
                    let {listimg, name} = ite;
                    return (
                        <Cell key={index}
                              customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
                          <CellHeader>
                            <Image style={{height:pxToDp(90),width:pxToDp(90)}} source={{uri:listimg}}/>
                          </CellHeader>
                          <CellBody>
                            <View>
                              <Text>{name}</Text>
                              <Text>#{index}</Text>
                            </View>
                          </CellBody>
                        </Cell>
                    )
                  })
                }
              </View>)
        })

    }

  }

  render() {
    let {
      customStyle,
      textStyle,
    } = this.props;
    let {
      goods_rules,
      interval_rules,
      vendor_id,
      ext_store,
      ext_store_id,
      rule_name,
      start_time,
      end_time,
      price_rules_str,
    } = this.state;
    return (
        <View style={[manage.cells, customStyle]}>
          <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
            <CellHeader>
              <Text style={{
                fontSize: pxToDp(36),
                color: colors.fontBlack,
                width: pxToDp(300),
                fontWeight: '900'
              }}>{rule_name}</Text>
            </CellHeader>
            <View>
              <Text style={[manage.cell_footer_text, textStyle]}>{start_time}</Text>
              <Text style={[manage.cell_footer_text, textStyle]}>{end_time}</Text>
            </View>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}
                onPress={() => this.dialogToggle(constant.VENDOR, `品牌(${tool.getVendorName(vendor_id)})`)}
          >
            <CellHeader style={{width: pxToDp(300)}}>
              <Text style={style.cell_header_text}>店铺({
                tool.getVendorName(vendor_id)
              })</Text>
            </CellHeader>
            <CellFooter>
              <Text>{ext_store[Object.keys(ext_store)[0]]}等</Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}
                onPress={() => this.dialogToggle(Cts.RULE_TYPE_GENERAL, `通用加价规则设计`)}
          >
            <CellHeader>
              <Text style={style.cell_header_text}>通用加价规则</Text>
            </CellHeader>
            <CellFooter>
              <Text>
                {price_rules_str}
              </Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}
                onPress={() => this.dialogToggle(Cts.RULE_TYPE_SPECIAL, `特殊分类规则`)}
          >
            <CellHeader>
              <Text style={style.cell_header_text}>特殊分类规则</Text>
            </CellHeader>
            <CellFooter>
              <Text>{tool.length(interval_rules[Cts.RULE_TYPE_SPECIAL])}组分类</Text>
              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[style.cell, manage.cell]}
                onPress={() => this.dialogToggle(constant.GOOD_RULE, `特殊商品规则`)}
          >
            <CellHeader>
              <Text style={style.cell_header_text}>特殊商品规则</Text>
            </CellHeader>
            <CellFooter>
              <Text>{tool.length(goods_rules)}组商品</Text>
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
          <ActivityDialog
              showDialog={this.state.showDialog}
              title={this.state.title}
              buttons={[{
                type: 'primary',
                label: '确定',
                onPress: () => {
                  this.setState({showDialog: false,});
                }
              }]}
          >
            {
              this.renderSelect()
            }
          </ActivityDialog>
        </View>
    )
  }
}

const constant = {
  VENDOR: 3,
  GOOD_RULE: 4,
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
    minHeight: pxToDp(100),
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
