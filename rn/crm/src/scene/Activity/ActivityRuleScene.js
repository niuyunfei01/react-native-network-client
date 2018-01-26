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
          lower: 0,
          upper: 5,
          percentage: 100,
        },
        {
          lower: 5,
          upper: 10,
          percentage: 100,
        },
        {
          lower: 10,
          upper: 20,
          percentage: 100,
        },
        {
          lower: 20,
          upper: 40,
          percentage: 100,
        },
        {
          lower: 40,
          upper: 10000,
          percentage: 100,
        }
      ],
      specialRuleList: [
        [
          {
            lower: 0,
            upper: 5,
            percentage: 100,
          },
          {
            lower: 5,
            upper: 10,
            percentage: 100,
          },
          {
            lower: 10,
            upper: 20,
            percentage: 100,
          },
          {
            lower: 20,
            upper: 40,
            percentage: 100,
          },
          {
            lower: 40,
            upper: 10000,
            percentage: 100,
          }]
      ],
      specialRule: [
        {
          lower: 0,
          upper: 5,
          percentage: 100,
        },
        {
          lower: 5,
          upper: 10,
          percentage: 100,
        },
        {
          lower: 10,
          upper: 20,
          percentage: 100,
        },
        {
          lower: 20,
          upper: 40,
          percentage: 100,
        },
        {
          lower: 40,
          upper: 10000,
          percentage: 100,
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
      ]
    }
  }
  setDateTime(date) {
    let {timeKey} = this.state;
    this.setState({[timeKey]: date, dataPicker: false})
  }
  renderCommon() {
    let {commonRule} = this.state;
    return (
        <Cells style={style.cells}>
          <Cell customStyle={style.cell} first={true}>
            <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
            <ImgBtn  require={require('../../img/Activity/bianji_.png')} onPress ={()=>this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE,commonRule)}/>
          </Cell>
          {
            commonRule.map((item, index) => {
              let {lower, upper, percentage} = item;
              return (
                  <Percentage
                      key={index}
                      lower={lower}
                      upper={upper}
                      percentage={percentage}
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
                let {lower, upper, percentage} = ite;
                return (
                    <Percentage
                        key={index}
                        lower={lower}
                        upper={upper}
                        percentage={percentage}
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
                this.renderSpecial()
              }
            </Cells>
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊商品规则</Text></CellHeader>
                <ImgBtn  require={require('../../img/Activity/xinjian_.png')} onPress ={()=>this.toSonPage(Config.ROUTE_ACTIVITY_EDIT_RULE,'')}/>
              </Cell>

            </Cells>
          </ScrollView>
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
    let {lower, upper, percentage, tail} = this.props;
    return (
        <Cell customStyle={style.cell} first={false}>
          <CellHeader>
            {
              tail ? <Text style={style.cell_header_text}>{lower}元以上</Text>
                  : <Text style={style.cell_header_text}>{lower}元--{upper}元</Text>
            }
          </CellHeader>

          <CellFooter>
            <Image style={style.operation} source={require('../../img/Activity/jianshao_.png')}/>
            <Text style={style.percentage_text}>{percentage}%</Text>
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
