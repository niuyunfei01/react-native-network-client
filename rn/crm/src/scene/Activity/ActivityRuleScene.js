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
function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
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
        },
        {
          min_price: 5,
          max_price: 10,
          percent: 100,
        },
        {
          min_price: 10,
          max_price: 20,
          percent: 100,
        },
        {
          min_price: 20,
          max_price: 40,
          percent: 100,
        },
        {
          min_price: 40,
          max_price: 10000,
          percent: 100,
        }
      ],
      specialRuleList: [
        [
          {
            min_price: 0,
            max_price: 5,
            percent: 100,
          },
          {
            min_price: 5,
            max_price: 10,
            percent: 100,
          },
          {
            min_price: 10,
            max_price: 20,
            percent: 100,
          },
          {
            min_price: 20,
            max_price: 40,
            percent: 100,
          },
          {
            min_price: 40,
            max_price: 10000,
            percent: 100,
          }]
      ],
      specialRule: [
        {
          min_price: 0,
          max_price: 5,
          percent: 100,
        },
        {
          min_price: 5,
          max_price: 10,
          percent: 100,
        },
        {
          min_price: 10,
          max_price: 20,
          percent: 100,
        },
        {
          min_price: 20,
          max_price: 40,
          percent: 100,
        },
        {
          min_price: 40,
          max_price: 10000,
          percent: 100,
        }],
      dataPicker: false,
      startTime: '开始时间',
      endTime: '结束时间',
      timeKey: '',
      vendorId:0,
      vendorList:[
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
      price_rules:{},
      interval_rules:{},
      goods_rules:[],

    }
  }

  componentWillMount(){
    let obj = {
      "price_rules": {
        "id": "1",
        "rule_name": "满49减20",
        "vendor_id": "1",
        "status": "1",
        "start_time": "2018-01-25 00:00:00",
        "end_time": "2018-01-26 00:00:00",
        "ext_store_id": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]

      },
      "interval_rules": {
        "1": {
          "21": {
            "id": "21",
            "rule_id": "1",
            "type_id": "1",
            "status": "1",
            "categories": null,
            "min_price": "0",
            "max_price": "20",
            "percent": "120",

          },
          "22": {
            "id": "22",
            "rule_id": "1",
            "type_id": "1",
            "status": "1",
            "categories": null,
            "min_price": "20",
            "max_price": "50",
            "percent": "130"
          },
          "23": {
            "id": "23",
            "rule_id": "1",
            "type_id": "1",
            "status": "1",
            "categories": null,
            "min_price": "50",
            "max_price": "10000",
            "percent": "110"
          }
        },
        "2": [{
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
              "percent": "123"
            },
            "25": {
              "id": "25",
              "rule_id": "1",
              "type_id": "2",
              "status": "1",
              "categories": "81898589,81898625",
              "min_price": "30",
              "max_price": "10000",
              "percent": "111"
            }
          }
        }]
      },
      "goods_rules": [{
        "id": "9",
        "rule_id": "1",
        "status": "1",
        "product_id": [
          "1121",
          "1122",
          "1123",
          "1124"
        ],
        "percent": "140"

      }]
    };
    let {price_rules,interval_rules,goods_rules} = obj;

    this.setState({
      price_rules:price_rules,
      interval_rules:interval_rules,
      goods_rules:goods_rules,
      commonRule: this.dataToCommon(interval_rules[Cts.RULE_TYPE_GENERAL]),
    })

  }
  dataToCommon(obj){
    let arr=[];
    tool.objectMap(obj,(item,key)=>{
      let {type_id,min_price,max_price,percent}=item
      arr.push({
        "type_id": type_id,
        "min_price": min_price,
        "max_price": max_price,
        "percent": percent
      })
    })
    return arr;
  }
  setDateTime(date) {
    let {timeKey} = this.state;
    this.setState({[timeKey]: date, dataPicker: false})
  }
  renderCommon() {
    let {commonRule,price_rules} = this.state;
    return (
        <Cells style={style.cells}>
          <Cell customStyle={style.cell} first={true}>
            <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
            <ImgBtn  require={require('../../img/Activity/bianji_.png')} onPress ={()=>this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE,commonRule)}/>
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
                  />
              )
            })
          }
        </Cells>
    )
  }

  renderSpecial() {
    let {specialRuleList} = this.state;
    return specialRuleList.map((item, inex) => {
      return (
          <View key={inex}>
            <Cell customStyle={style.cell} first={true}>
              <CellHeader><Text style={[style.cell_header_text, {}]}>加价比例设置</Text></CellHeader>
              <ImgBtn  require={require('../../img/Activity/bianji_.png')} onPress ={()=>this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE,item)}/>
            </Cell>
            <Cell customStyle={style.cell}>
              <CellHeader><Text style={style.cell_header_text}>选择已选分类</Text></CellHeader>
              <CellFooter>
                <Text style={style.cell_footer_text}>已选(0)</Text>
                <Image
                    style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                    source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
            {
              item.map((ite, index) => {
                let {min_price, max_price, percent} = ite;
                return (
                    <Percentage
                        key={index}
                        min_price={min_price}
                        max_price={max_price}
                        percent={percent}
                        tail={index == (item.length - 1)}
                    />
                )
              })
            }
          </View>
      )
    })
  }


  toSonPage(route,item) {
    let {navigate} = this.props.navigation;
    navigate(route, {
      rule: item
    })
  }

  render() {
    let {startTime, endTime,vendorId} = this.state;
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <Cells style={style.cells}>
              <ModalSelector
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={(option)=>{
                    this.setState({vendorId:option.key});
                    this.forceUpdate();
                  }}
              >
                <Cell customStyle={style.cell} first={true}>
                  <CellHeader><Text style={style.cell_header_text}>选择品牌</Text></CellHeader>
                  <CellFooter>
                    <Text>
                      {
                        vendorId > 0 ? tool.getVendorName(vendorId): ''
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
                  <Text style={style.cell_footer_text}>如满49减20</Text>
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
              <Cell customStyle={style.cell} onPress={()=>{this.toSonPage(Config.ROUTE_ACTIVITY_SELECT_STORE)}}>
                <CellHeader><Text style={style.cell_header_text}>选择店铺</Text></CellHeader>
                <CellFooter>
                  <Text style={style.cell_footer_text}>已选(0)</Text>
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
                // this.renderSpecial()
              }
            </Cells>
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊商品规则</Text></CellHeader>
                <ImgBtn  require={require('../../img/Activity/xinjian_.png')}
                         onPress ={
                           ()=>this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE,{
                             commonRule:JSON.stringify(this.state.commonRule)
                           })
                         }/>

              </Cell>
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
    let {min_price, max_price, percent, tail} = this.props;
    return (
        <Cell customStyle={style.cell} first={false}>
          <CellHeader>
            {
              tail ? <Text style={style.cell_header_text}>{min_price}元以上</Text>
                  : <Text style={style.cell_header_text}>{min_price}元--{max_price}元</Text>
            }
          </CellHeader>

          <CellFooter>
            <Image style={style.operation} source={require('../../img/Activity/jianshao_.png')}/>
            <Text style={style.percent_text}>{percent}%</Text>
            <Image style={style.operation} source={require('../../img/Activity/zengjia_.png')}/>
          </CellFooter>
        </Cell>
    )
  }
}


class ImgBtn extends PureComponent {
  onPress() {
    this.props.onPress()
  }

  render() {
    let {require} = this.props
    return (
        <TouchableOpacity
            onPress={() => this.onPress()}
        >
          <Image style={{height: pxToDp(42), width: pxToDp(42)}}
                 source={require}/>
        </TouchableOpacity>
    )
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(ActivityRuleScene)
