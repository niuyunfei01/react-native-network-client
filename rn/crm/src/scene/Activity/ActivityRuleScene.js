import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchSavePriceRule} from '../../reducers/activity/activityAction';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from "../../widget/ModalSelector/index";

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast} from "../../weui/index";
import style from './commonStyle'
import ImgBtn from "./imgBtn";
import BottomBtn from './ActivityBottomBtn'
import {setAccessToken} from "../../reducers/global/globalActions";

function mapStateToProps(state) {
  const {mine, global, activity, product} = state;
  return {mine: mine, global: global, activity: activity, product: product}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class ActivityRuleScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '创建活动价格',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      commonRule: [
        {
          min_price: 0,
          max_price: 5,
          percent: 100,
          type_id: 1,
        },
        {
          min_price: 5,
          max_price: 10,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 10,
          max_price: 20,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 20,
          max_price: 40,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 40,
          max_price: 10000,
          percent: 100,
          type_id: 1,

        }
      ],
      specialRuleList: [],
      specialRule: [
        [
          {
            "type_id": 2,
            "categories": [],
            "min_price": "0",
            "max_price": "30",
            "percent": "100"
          },
          {
            "type_id": 2,
            "categories": [],
            "min_price": "30",
            "max_price": "10000",
            "percent": "100"
          }
        ]
      ],
      dataPicker: false,
      startTime: '开始时间',
      endTime: '结束时间',
      timeKey: '',
      vendorId: 0,
      vendorList: [
        {
          key: Cts.STORE_TYPE_SELF,
          label: '菜鸟食材',
        },
        {
          key: Cts.STORE_TYPE_AFFILIATE,
          label: '菜鸟',
        },
        {
          key: Cts.STORE_TYPE_GZW,
          label: '果知味',
        },
        {
          key: Cts.STORE_TYPE_BLX,
          label: '比邻鲜',
        },
        {
          key: Cts.STORE_TYPE_XGJ,
          label: '鲜果集',
        }
      ],
      price_rules: {},
      interval_rules: {},
      goods_data: [],
      goods_rule: {
        product_id: [],
        percent: 100
      },
      rule_name: '',
      ext_store_id: [],
      key: '',
      store_id: []
    }
    this.uploadData = this.uploadData.bind(this);
  }

  dataToCommon(obj) {
    let arr = [];
    tool.objectMap(obj, (item, key) => {
      let {type_id, min_price, max_price, percent} = item
      arr.push({
        "type_id": type_id,
        "min_price": min_price,
        "max_price": max_price,
        "percent": percent
      })
    });
    return arr;
  }

  setDateTime(date) {
    let {timeKey} = this.state;
    this.setState({[timeKey]: date, dataPicker: false})
  }

  componentWillMount() {
    try {
      let {rules, type} = this.props.navigation.state.params;
      let {price_rules, interval_rules, goods_rules} = rules;
      let {vendor_id, rule_name, ext_store_id, start_time, end_time, store_id, id} = price_rules;
      let commonRule = Object.values(interval_rules[Cts.RULE_TYPE_GENERAL]);
      let specialRuleList = interval_rules[Cts.RULE_TYPE_SPECIAL];
      let arr = [];
      specialRuleList.map((item, key) => {
        arr.push(Object.values(item.rules))
      });
      this.setState({
        ext_store_id: ext_store_id,
        vendorId: vendor_id,
        rule_name: rule_name,
        startTime: start_time,
        endTime: end_time,
        commonRule: commonRule,
        specialRuleList: arr,
        store_id: store_id,
        goods_data: goods_rules,
        id: id,
        type: type,

      })
    } catch (e) {
      console.log(e)
    }
  }

  // componentWillReceiveProps() {
  //   let {rules, type} = this.props.navigation.state.params;
  // }
  renderCommon() {
    let {commonRule, price_rules} = this.state;
    return (
        <Cells style={style.cells}>
          <Cell customStyle={style.cell} first={true}>
            <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
            <ImgBtn require={require('../../img/Activity/bianji_.png')}
                    onPress={() =>
                        this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {
                          rule: commonRule,
                          key: commonRule,
                          type_id: Cts.RULE_TYPE_GENERAL,
                        })
                    }/>
          </Cell>
          {
            commonRule.map((item, index) => {
              let {min_price, max_price, percent} = item;
              return (
                  <Percentage
                      key={index}
                      min_price={min_price}
                      max_price={max_price}
                      percent={percent}
                      tail={index == (commonRule.length - 1)}
                      text={true}
                      onPressReduce={() => {
                        item.percent--;
                        this.forceUpdate();
                      }}
                      onPressAdd={() => {
                        item.percent++;
                        this.forceUpdate();
                      }}
                  />
              )
            })
          }
        </Cells>
    )
  }

  nextSetBefore(key, obj, index = -1) {
    if (index < 0) {
      this.setState({[key]: obj})
    }
  }

  nextSetBeforeCategories(specialRuleList) {
    this.setState({specialRuleList: specialRuleList});
    this.forceUpdate();
  }

  nextSetBeforeGoods(goods_data) {
    this.setState({goods_data: goods_data});
    this.forceUpdate();
  }

  renderSpecial() {
    let {specialRuleList, vendorId} = this.state;
    return specialRuleList.map((item, inex) => {
      return (
          <View key={inex}>
            <Cell customStyle={style.cell} first={true}>
              <CellHeader><Text style={[style.cell_header_text, {}]}>加价比例设置</Text></CellHeader>
              <ImgBtn require={require('../../img/Activity/bianji_.png')}
                      onPress={() =>
                          this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {
                            rule: item,
                            key: inex,
                            categories: item[0].categories,
                            type_id: Cts.RULE_TYPE_SPECIAL,
                          })}
              />
            </Cell>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    this.props.navigation.navigate(Config.ROUTE_ACTIVITY_CLASSIFY, {
                      vendorId: vendorId,
                      nextSetBeforeCategories: (specialRuleList, index) => {
                        this.nextSetBeforeCategories(specialRuleList, index)
                      },
                      index: inex,
                      specialRuleList: specialRuleList,
                      categories: item[0]['categories'],
                    })
                  }}
            >
              <CellHeader><Text style={style.cell_header_text}>选择分类</Text></CellHeader>
              <CellFooter>
                <Text style={style.cell_footer_text}>已选({tool.length(item[0]['categories'])})</Text>
                <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
            {
              tool.objectMap(item, (ite, index) => {
                let {min_price, max_price, percent} = ite;
                return (
                    <Percentage
                        key={index}
                        min_price={min_price}
                        max_price={max_price}
                        percent={percent}
                        tail={index == (item.length - 1)}
                        onPressReduce={() => {
                          ite.percent--;
                          this.forceUpdate();
                        }}
                        onPressAdd={() => {
                          ite.percent++;
                          this.forceUpdate();
                        }}
                        text={true}
                    />
                )
              })
            }
          </View>
      )
    })
  }

  renderGoods() {
    let {goods_data, vendorId, store_id} = this.state;
    return goods_data.map((item, index) => {
      let {product_id, percent} = item;
      return (
          <View key={index}>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    if ((tool.length(store_id)<=0) && (vendorId<=0)) {
                      ToastLong('请选择品牌,店铺')
                      return false
                    }
                    this.props.navigation.navigate(Config.ROUTE_ACTIVITY_SELECT_GOOD, {
                      vendorId: vendorId,
                      store_ids: store_id,
                      index: index,
                      goods_data: goods_data,
                      product_id: product_id,
                      nextSetBeforeGoods: (goods_data) => {
                        this.nextSetBeforeGoods(goods_data)
                      },
                    })
                  }}
            >
              <CellHeader><Text style={style.cell_header_text}>选择商品</Text></CellHeader>
              <CellFooter>
                <Text style={style.cell_footer_text}>已选({product_id.length}个)</Text>
                <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
            <Cell customStyle={style.cell} first={false}>
              <CellHeader>
                <Text>加价规则</Text>
              </CellHeader>
              <CellFooter>
                <Percentage
                    key={index}
                    min_price={''}
                    max_price={''}
                    percent={percent}
                    tail={index == (item.length - 1)}
                    text={false}
                    onPressReduce={() => {
                      item.percent--;
                      this.forceUpdate();
                    }}
                    onPressAdd={() => {
                      item.percent++;
                      this.forceUpdate();
                    }}
                />
              </CellFooter>
            </Cell>
          </View>
      )
    })

  }

  toSonPage(route, item) {
    let {key} = this.state;
    let {navigate} = this.props.navigation;
    navigate(route, {
      nextSetBefore: (key, obj) => {
        this.nextSetBefore(key, obj)
      }, key, ...item
    })
  }

  uploadData() {
    let {rule_name, vendorId, startTime, endTime, ext_store_id, commonRule, specialRuleList, goods_data} = this.state;
    let interval_data = [...commonRule];
    let price_data = {
      rule_name: rule_name,
      vendor_id: vendorId,
      start_time: startTime,
      end_time: endTime,
      ext_store_id: ext_store_id,
    };
    specialRuleList.map((item) => {
      item.map((ite) => {
        interval_data.push(ite);

      })
    });
    let all = {
      price_data: price_data,
      interval_data: interval_data,
      goods_data: goods_data,
    };
    if(false){
      const {dispatch} = this.props;
      const {accessToken}=this.props.global;
      dispatch(fetchSavePriceRule(all,accessToken,(ok,reason,obj)=>{
        console.log(ok);
      }))
    }

  }

  render() {
    let {startTime, endTime, vendorId, rule_name, ext_store_id} = this.state;
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <Cells style={style.cells}>
              <ModalSelector
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={(option) => {
                    if (vendorId != option.key) {
                      this.setState({
                        ext_store_id: [],
                        goods_data: [],
                        vendorId: option.key,
                        specialRuleList: [],
                      })
                    }
                  }}
              >
                <Cell customStyle={style.cell} first={true}>
                  <CellHeader><Text style={style.cell_header_text}>选择品牌</Text></CellHeader>
                  <CellFooter>
                    <Text>
                      {
                        vendorId > 0 ? tool.getVendorName(vendorId) : ''
                      }
                    </Text>
                    <Image
                        style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                        source={require('../../img/Public/xiangxia_.png')}
                    />
                  </CellFooter>
                </Cell>
              </ModalSelector>
            </Cells>

            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>活动加价名称</Text></CellHeader>
                <CellFooter>
                  <TextInput
                      multiline={true}
                      underlineColorAndroid='transparent'
                      style={{minWidth: pxToDp(400)}}
                      placeholderTextColor={"#7A7A7A"}
                      placeholder={'请输入活动名称'}
                      value={rule_name}
                      onChangeText={(text) => {
                        this.setState({rule_name: text})
                      }}
                  />
                </CellFooter>
              </Cell>
              <Cell customStyle={style.cell} first={false}>
                <TouchableOpacity
                    style={{flex: 1, height: pxToDp(65)}}
                    onPress={() => {
                      this.setState({dataPicker: true, timeKey: 'startTime'})
                    }}
                >
                  <Text style={style.time}>{startTime}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1, height: pxToDp(65), marginLeft: pxToDp(40)}}
                    onPress={() => {
                      this.setState({dataPicker: true, timeKey: 'endTime'})
                    }}
                >
                  <Text style={[style.time]}>{endTime}</Text>
                </TouchableOpacity>
              </Cell>
              <Cell customStyle={style.cell} onPress={() => {
                if (vendorId < 1) {
                  ToastLong("请选择品牌");
                  return false;
                }

                this.toSonPage(Config.ROUTE_ACTIVITY_SELECT_STORE, {vendorId: vendorId, ext_store_id: ext_store_id})
              }}>
                <CellHeader><Text style={style.cell_header_text}>选择店铺</Text></CellHeader>
                <CellFooter>
                  <Text style={style.cell_footer_text}>已选({tool.length(ext_store_id)})</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>
            {
              this.renderCommon()
            }
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊分类加价规则</Text></CellHeader>
                <CellFooter>
                  <TouchableOpacity
                      onPress={() => {
                        let {specialRuleList, specialRule} = this.state;
                        let aaa = tool.deepClone(specialRule)
                        specialRuleList.push(...aaa);
                        this.forceUpdate();
                      }}
                  >
                    <Image style={{height: pxToDp(42), width: pxToDp(42)}}
                           source={require('../../img/Activity/xinjian_.png')}/>
                  </TouchableOpacity>

                </CellFooter>
              </Cell>
              {
                this.renderSpecial()
              }
            </Cells>
            {/*商品*/}
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊商品规则</Text></CellHeader>
                <ImgBtn require={require('../../img/Activity/xinjian_.png')}
                        onPress={() => {
                          let {goods_data, goods_rule} = this.state;
                          let clone_goods_rule = tool.deepClone(goods_rule)
                          goods_data.push(clone_goods_rule);
                          this.forceUpdate();
                        }}/>
              </Cell>
              {
                this.renderGoods()
              }
            </Cells>
            <BottomBtn onPress={() => {
              this.uploadData()
            }}/>
          </ScrollView>

          <DateTimePicker
              date={new Date()}
              minimumDate={new Date()}
              mode='datetime'
              isVisible={this.state.dataPicker}
              onConfirm={async (date) => {
                let confirm_data = tool.fullDate(date);
                this.setDateTime(confirm_data);
              }}
              onCancel={() => {
                this.setState({dataPicker: false});
              }}
          />
        </View>
    )
  }
}

class Percentage extends PureComponent {
  render() {
    let {min_price, max_price, percent, tail, text} = this.props || {};
    return (
        <Cell customStyle={style.cell} first={false}>
          {
            text ? <CellHeader>
              {
                tail ? <Text style={style.cell_header_text}>{min_price}元以上</Text>
                    : <Text style={style.cell_header_text}>{min_price}元--{max_price}元</Text>
              }
            </CellHeader> : <CellHeader/>
          }
          <CellFooter>
            <TouchableOpacity
                onPress={() => this.props.onPressReduce(percent)
                }
            >
              <Image style={style.operation}
                     source={percent <= 100 ? require('../../img/Activity/jianshaohui_.png') : require('../../img/Activity/jianshao_.png')}
              />
            </TouchableOpacity>
            <Text style={style.percentage_text}>{percent}%</Text>
            <TouchableOpacity
                onPress={() => this.props.onPressAdd()}
            >
              <Image style={style.operation} source={require('../../img/Activity/zengjia_.png')}/>
            </TouchableOpacity>
          </CellFooter>
        </Cell>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ActivityRuleScene)
