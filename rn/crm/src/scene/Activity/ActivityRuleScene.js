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
  Alert,
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
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from "../../widget/ModalSelector/index";

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon} from "../../weui/index";
import style from './commonStyle'
import ImgBtn from "./imgBtn";
import BottomBtn from './ActivityBottomBtn'
import {setAccessToken} from "../../reducers/global/globalActions";
import native from "../../common/native";

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
          max_price: 500,
          percent: 100,
          type_id: 1,
        },
        {
          min_price: 500,
          max_price: 1000,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 1000,
          max_price: 2000,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 2000,
          max_price: 4000,
          percent: 100,
          type_id: 1,

        },
        {
          min_price: 4000,
          max_price: 1000000,
          percent: 100,
          type_id: 1,

        }
      ],
      specialRuleList: [],
      specialRule: [
        [
          {
            type_id: 2,
            categories: [],
            min_price: 0,
            max_price: 3000,
            percent: 100
          },
          {
            type_id: 2,
            categories: [],
            min_price: 3000,
            max_price: 1000000,
            percent: 100
          }
        ]
      ],
      stPicker: false,
      edPicker:false,
      startTime: '',
      endTime: '',
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
          label: '鲜果集',
        },
        {
          key: Cts.STORE_TYPE_BLX,
          label: '比邻鲜',
        },
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
    };
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


  componentWillMount() {
    try {
      let {rules, type} = this.props.navigation.state.params;
      let {price_rules, interval_rules, goods_rules} = rules;
      let {vendor_id, rule_name, ext_store_id, start_time, end_time, store_id, id} = price_rules;
      let commonRule = Object.values(interval_rules[Cts.RULE_TYPE_GENERAL]).sort(function (a, b) {
        return a.min_price - b.min_price
      });
      let specialRuleList = interval_rules[Cts.RULE_TYPE_SPECIAL] || [];
      let arr = [];
      let goods_data = [];
      specialRuleList.map((item) => {
        arr.push(Object.values(item.rules))
      });
      goods_rules.forEach((item) => {
        let {product_id, percent} = item;
        goods_data.push({product_id, percent})
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
        goods_data: goods_data,
        id: id,
        type: type,
      })
    } catch (e) {
      console.log(e)
    }
  }

  renderCommon() {
    let {commonRule, price_rules} = this.state;
    return (
        <Cells style={style.cells}>
          <Cell customStyle={style.cell} >
            <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
            <ImgBtn require={require('../../img/Activity/bianji_.png')}
                    onPress={() =>
                    {
                      console.log(commonRule);
                      console.log(tool.deepClone(commonRule));
                      this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {
                        rule: tool.deepClone(commonRule),
                        key: 'commonRule',
                        type_id: Cts.RULE_TYPE_GENERAL,
                      })
                    }
                    }/>
          </Cell>
          {
            commonRule.map((item, index) => {
              let {min_price, max_price, percent} = tool.deepClone(item);
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
    } else {
       this.state.specialRuleList[key] = obj
    }
    console.log(obj);
    this.forceUpdate();
  }

  nextSetBeforeCategories(specialRuleList) {
    this.setState({specialRuleList: specialRuleList});
    this.forceUpdate();
  }

  nextSetBeforeGoods(goods_data) {
    this.setState({goods_data: goods_data});
    this.forceUpdate();
  }
//类别加价
  renderSpecial() {
    let {specialRuleList, vendorId} = this.state;
    return specialRuleList.map((item, inex) => {
      return (
          <View key={inex}>
            <Cell customStyle={style.cell} >
              <CellHeader style={{flexDirection: 'row'}}>
                <Text style={[style.cell_header_text]}>加价比例设置 </Text>
                <TouchableOpacity
                    onPress={() => {
                      specialRuleList.splice(inex, 1);
                      this.forceUpdate()
                    }}
                >
                  <Icon
                      name={'clear'}
                      size={pxToDp(40)}
                      style={{backgroundColor: '#fff'}}
                      color={'#d81e06'}
                      msg={false}
                  />
                </TouchableOpacity>
              </CellHeader>
              <ImgBtn require={require('../../img/Activity/bianji_.png')}
                      onPress={() =>
                          this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE, {
                            rule: item,
                            key: inex,
                            categories: item[0].categories,
                            type_id: Cts.RULE_TYPE_SPECIAL,
                            specialRuleList:specialRuleList
                          })}
              />
            </Cell>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    if(vendorId<=0){
                      ToastLong('请选择品牌');
                      return false
                    }
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

  initDate(date) {
    if (date) {
      return new Date(date.replace(/-/g, "/"))
    } else {
      return new Date()
    }
  }
  initMinDate(date){
    if (date) {
      return new Date(date.replace(/-/g, "/"))
    } else {
      return new Date()
    }
  }
  initMaxDate(date){
    if (date) {
      return new Date(date.replace(/-/g, "/"))
    } else {
      return new Date(Date.now()+ 180*86400000);
    }
  }
  renderGoods() {
    let {goods_data, vendorId, store_id} = this.state;
    return goods_data.map((item, index) => {
      let {product_id, percent} = item;
      return (
          <View key={index}>
            <Cell customStyle={style.cell}
                  onPress={() => {
                    if ((tool.length(store_id) <= 0) || (vendorId <= 0)) {
                      ToastLong('请选择品牌,店铺');
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
              <CellHeader style={{flexDirection: 'row'}}>
                <Text style={style.cell_header_text}>选择商品</Text>
                <TouchableOpacity
                    onPress={() => {
                      goods_data.splice(index, 1);
                      this.forceUpdate()
                    }}
                >
                  <Icon
                      name={'clear'}
                      size={pxToDp(40)}
                      style={{backgroundColor: '#fff'}}
                      color={'#d81e06'}
                      msg={false}
                  />
                </TouchableOpacity>
              </CellHeader>
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

  checkContinuity(arr, type) {
    let flag = true;
    if (type == Cts.RULE_TYPE_GENERAL) {
      try {
        arr.forEach((item, index) => {
          if (item['max_price'] != arr[index + 1]['min_price']) {
            flag = false
          }
        });

      } catch (e) {
      }
    } else {
      try {
        arr.forEach((item) => {
          item.forEach((ite, i) => {
            if (ite['max_price'] != item[i + 1]['min_price'] || ite['categories'] != item[i + 1]['categories']) {
              flag = false
            }
          })
        })
      } catch (e) {
      }
    }
    return flag
  }

  checkData(interval_data) {
    let {rule_name, vendorId, startTime, endTime, ext_store_id, commonRule, specialRuleList, goods_data} = this.state;
    let commonFlag = this.checkContinuity(commonRule, Cts.RULE_TYPE_GENERAL);
    let specialFlag = this.checkContinuity(specialRuleList, Cts.RULE_TYPE_SPECIAL);
    if (vendorId <= 0) {
      ToastLong('请选择品牌');
      return false;
    }
    if (tool.length(rule_name.replace(/\s/g, "")) <= 0) {
      ToastLong('请输入有活动名称');
      return false;
    }
    if ((tool.getTimeStamp(startTime) - tool.getTimeStamp(endTime)) >= 0 || isNaN(tool.getTimeStamp(startTime) - tool.getTimeStamp(endTime))) {
      ToastLong('活动结束时间必须大于开始时间')
      return false;
    }
    if (tool.length(ext_store_id) <= 0) {
      ToastLong('请选择店铺!');
      return false;
    }
    if (tool.length(commonRule.length) < 0 || !commonFlag) {
      ToastLong('请检查通用加价规则是否连续');
      return false;
    }
    if (tool.length(specialRuleList.length) > 0 && !specialFlag) {
      ToastLong('请检查特殊加价规则的连续性');
      return false;
    }
    if (tool.length(goods_data) > 0) {
      for (let i = 0; i < goods_data.length; i++) {
        let {product_id, percent} = goods_data[i];
        if ((product_id.length <= 0) || (percent < 100)) {
          ToastLong('特殊商品加价比例不能小于100%,商品不能空')
          return false
        }
      }
    }
    if (tool.length(interval_data) > 0){
      for (let i = 0; i < interval_data.length; i++) {
        let {percent,min_price,max_price} = interval_data[i];
        if (percent < 100) {
          ToastLong('加价比例,不能小于100%');
          return false
        }else if(min_price<0 || max_price<0){
          ToastLong('价格不能小于0');
          return false
        }
      }
    }
    return true;
  }

  uploadData() {
    let _this=this;
    let {rule_name, vendorId, startTime, endTime, ext_store_id, commonRule, specialRuleList, goods_data, type, id} = this.state;
    let interval_data = [];
    commonRule.forEach((item) => {
      let {type_id, min_price, max_price, percent} = item;
      interval_data.push({type_id, min_price, max_price, percent});
    });
    let price_data = {
      rule_name: rule_name,
      vendor_id: vendorId,
      start_time: startTime,
      end_time: endTime,
      ext_store_id: ext_store_id,
    };
    if (type == 'edit') {
      price_data.id = id
    }
    specialRuleList.map((item) => {
      item.map((ite) => {
        let {type_id, categories, min_price, max_price, percent} = ite;
        interval_data.push({type_id, categories, min_price, max_price, percent});
      })
    });
    let all = {
      price_data: price_data,
      interval_data: interval_data,
      goods_data: goods_data,
    };
    if (this.checkData()) {
      const {dispatch} = this.props;
      const {accessToken} = this.props.global;
      dispatch(fetchSavePriceRule(all, accessToken, (ok, reason, obj) => {
        this.setState({uploading:false});
        if (ok) {
          ToastLong('提交成功');
          setTimeout(()=>{
            _this.props.navigation.goBack();
          },1000)
        }else {
          ToastLong(reason);
        }
      }))
    }else{
      this.setState({uploading:false});
    }
  }

  render() {
    let {startTime, endTime, vendorId, rule_name, ext_store_id,timeKey} = this.state;
    return (
        <View style={{flex: 1}}>
          <ScrollView >
            <Cells style={style.cells}>
              <ModalSelector
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={(option) => {
                    if (vendorId != option.key) {
                      this.setState({
                        ext_store_id: [],
                        store_id: [],
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
                      style={{minWidth: pxToDp(400), textAlign: 'right',minHeight:pxToDp(100)}}
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
                      this.setState({stPicker: true,})
                    }}
                >
                  <Text style={style.time}>{startTime == '' ? '开始时间' : startTime}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1, height: pxToDp(65), marginLeft: pxToDp(40)}}
                    onPress={() => {
                      if(startTime==''){
                        ToastLong('请先选择开始时间')
                        return false
                      }
                      this.setState({edPicker:true})
                    }}
                >
                  <Text style={[style.time]}>{endTime == '' ? '结束时间' : endTime}</Text>
                </TouchableOpacity>
              </Cell>
              <Cell customStyle={style.cell} onPress={() => {
                if (vendorId < 1 ) {
                  ToastLong("请选择品牌");
                  return false;
                }
                if(endTime ===''|| startTime ===''){
                  ToastLong("请选择时间");
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
                        let newSpecial = tool.deepClone(specialRule)
                        specialRuleList.push(...newSpecial);
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
            <BottomBtn onPress={async () => {
              let {uploading}=this.state
              if(uploading){
                return false
              }

              await this.setState({uploading:true});

              this.uploadData()
            }}/>
          </ScrollView>
          <DateTimePicker
              date={this.initDate(this.state.startTime)}
              mode='datetime'
              minimumDate={new Date()}
              maximumDate={this.initMaxDate(this.state.endTime)}
              isVisible={this.state.stPicker}
              onConfirm={async (date) => {
                let confirm_data = tool.fullDate(date);
                this.setState({
                  startTime:confirm_data,
                  stPicker:false,
                })
              }}
              onCancel={() => {
                this.setState({stPicker: false});
              }}
          />
          <DateTimePicker
              date={this.initDate(this.state.endTime)}
              mode='datetime'
              minimumDate={this.initMinDate(this.state.startTime)}
              isVisible={this.state.edPicker}
              onConfirm={async (date) => {
                let confirm_data = tool.fullDate(date);
                this.setState({
                  endTime:confirm_data,
                  edPicker:false,
                })
              }}
              onCancel={() => {
                this.setState({edPicker: false});
              }}
          />
          <Toast
              icon="loading"
              show={this.state.uploading}
              onRequestClose={() => {
              }}
          >提交中</Toast>
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
                tail ? <Text style={style.cell_header_text}>{tool.toFixed(min_price, 'int')}元以上</Text>
                    : <Text
                        style={style.cell_header_text}>{tool.toFixed(min_price, 'int')}元--{tool.toFixed(max_price, 'int')}元</Text>
              }
            </CellHeader> : <CellHeader/>
          }
          <CellFooter>
            <TouchableOpacity
                onPress={() => {
                  if (percent > 100) {
                    this.props.onPressReduce()
                  } else {
                    ToastLong('加价比例不能小于100%')
                  }

                }
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
