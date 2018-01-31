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
      specialRuleList: [
        {
          "categories": [
            "81898589",
            "81898625"
          ],
          "rules": {
            "24": {
              "id": "24",
              "rule_id": "1",
              "type_id": "2",
              "status": "1",
              "categories": "81898589,81898625",
              "min_price": "0",
              "max_price": "30",
              "percent": "123",
              "created": "2018-01-25 17:00:31",
              "updated": "2018-01-25 17:00:31"
            },
            "25": {
              "id": "25",
              "rule_id": "1",
              "type_id": "2",
              "status": "1",
              "categories": "81898589,81898625",
              "min_price": "30",
              "max_price": "10000",
              "percent": "111",
              "created": "2018-01-25 17:00:31",
              "updated": "2018-01-25 17:00:31"
            }
          }
        }

      ],
      specialRule: {
        categories: [],
        rules: {
          1: {
            type_id: 2,
            status: 1,
            categories: [],
            min_price: 0,
            max_price: 30,
            percent: 123,

          },
          2: {
            type_id: 2,
            status: 1,
            categories: [],
            min_price: 30,
            max_price: 10000,
            percent: 111,
          }
        }
      },
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
      goods_data: [{
        product_id: [
          1121,
          1122,
          1123,
          1124,
        ],
        percent: 140
      }],
      goods_rule: {
        product_id: [
          1121,
          1122,
          1123,
          1124,
        ],
        percent: 140
      },
      rule_name:'',
      ext_store_id:[],
      key:'',
    }
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
  componentWillReceiveProps(){
    let{ext_store_id}=this.props.activity;
    console.log(ext_store_id)
    this.setState({ext_store_id})
  }
  renderCommon() {
    let {commonRule, price_rules} = this.state;
    return (
        <Cells style={style.cells}>
          <Cell customStyle={style.cell} first={true}>
            <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
            <ImgBtn require={require('../../img/Activity/bianji_.png')}
                    onPress={() =>
                        this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {rule: commonRule})
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
                      onPressReduce={()=>{
                        item.percent--;
                        this.forceUpdate();
                      }}
                      onPressAdd={()=>{
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

  renderSpecial() {
    let {specialRuleList, vendorId} = this.state;
    return specialRuleList.map((item, inex) => {
      let {categories, rules} = item;
      return (
          <View key={inex}>
            <Cell customStyle={style.cell} first={true}>
              <CellHeader><Text style={[style.cell_header_text, {}]}>加价比例设置</Text></CellHeader>
              <ImgBtn require={require('../../img/Activity/bianji_.png')}
                      onPress={() => this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {rule: rules})}/>
            </Cell>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    this.props.navigation.navigate(Config.ROUTE_ACTIVITY_CLASSIFY, {vendorId: vendorId})
                  }}
            >
              <CellHeader><Text style={style.cell_header_text}>选择分类</Text></CellHeader>
              <CellFooter>
                <Text style={style.cell_footer_text}>已选({categories.length})</Text>
                <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
            {
              tool.objectMap(rules, (ite, index) => {
                let {min_price, max_price, percent} = ite;
                return (
                    <Percentage
                        key={index}
                        min_price={min_price}
                        max_price={max_price}
                        percent={percent}
                        tail={index == (item.length - 1)}
                        onPressReduce={()=>{
                          ite.percent--;
                          this.forceUpdate();
                        }}
                        onPressAdd={()=>{
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
    let {goods_data} = this.state;
    return goods_data.map((item, index) => {
      let {product_id, percent} = item;
      return (
          <View key={index}>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    this.props.navigation.navigate(Config.ROUTE_ACTIVITY_SELECT_GOOD)
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
                    onPressReduce={()=>{
                      item.percent--;
                      this.forceUpdate();
                    }}
                    onPressAdd={()=>{
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
    let {navigate} = this.props.navigation;
    navigate(route, {key,...item})
  }

  render() {
    let {startTime, endTime, vendorId,rule_name,ext_store_id} = this.state;
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <Cells style={style.cells}>
              <ModalSelector
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={(option) => {
                    this.setState({vendorId: option.key});
                    this.forceUpdate();
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
                  <Text style={style.cell_footer_text}>{rule_name}</Text>
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
                this.toSonPage(Config.ROUTE_ACTIVITY_SELECT_STORE, {vendorId: vendorId,ext_store_id:ext_store_id})
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
                        specialRuleList.push(specialRule);
                        this.forceUpdate()
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
                          goods_data.push(goods_rule);
                          this.forceUpdate();
                        }}/>
              </Cell>
              {
                this.renderGoods()
              }
            </Cells>
            <View style={{
              height: pxToDp(120),
              paddingHorizontal: pxToDp(30),
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cell customStyle={{
                marginLeft: 0,
                justifyContent: 'center',
                backgroundColor: colors.main_color,
                alignItems: 'center',
                borderRadius: pxToDp(5),
              }} first={true}
              >
                <Text style={{
                  fontSize: pxToDp(32),
                  color: colors.white,
                  textAlign: 'center',
                  width: '100%',
                  textAlignVertical: 'center',
                  height: pxToDp(80),
                }}>保存</Text>
              </Cell>
            </View>
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
    let {min_price, max_price, percent, tail,text} = this.props||{};
    return (
        <Cell customStyle={style.cell} first={false}>
          {
            text?<CellHeader>
              {
                tail ? <Text style={style.cell_header_text}>{min_price}元以上</Text>
                    : <Text style={style.cell_header_text}>{min_price}元--{max_price}元</Text>
              }
            </CellHeader>:<CellHeader/>
          }
          <CellFooter>
            <TouchableOpacity
                onPress={()=> this.props.onPressReduce(percent)
                }
            >
              <Image style={style.operation}
                     source={percent<=100?require('../../img/Activity/jianshaohui_.png'):require('../../img/Activity/jianshao_.png')}
              />
            </TouchableOpacity>
            <Text style={style.percentage_text}>{percent}%</Text>
            <TouchableOpacity
                onPress={()=> this.props.onPressAdd()}
            >
              <Image style={style.operation} source={require('../../img/Activity/zengjia_.png')}/>
            </TouchableOpacity>
          </CellFooter>
        </Cell>
    )
  }
}




export default connect(mapStateToProps, mapDispatchToProps)(ActivityRuleScene)
