import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,

} from 'react-native';
import {
  Cell,
  CellHeader,
  CellFooter,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {fetchRuleList} from '../../reducers/activity/activityAction'
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Dialog} from "../../weui/index";
import style from './commonStyle'
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from "../../widget/ModalSelector/index";
import ActivityItem from './ActivityItem'
import RenderEmpty from '../OperateProfit/RenderEmpty'

function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchRuleList,
      ...globalActions
    }, dispatch)
  }
}

class ActivityListScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '活动加价历史'
    })
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      hide: false,
      vendorId: 0,
      showDialog: false,
      down: false,
      vendorList: [
        {
          key: 0,
          label: '全部',
        },
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
      ruleList: [],
      query: true,
      renderList: [],
      stPicker: false,
      edPicker:false,
      startTime: '',
      endTime: '',
    }

    this.navigationOptions(this.props)
  }

  componentDidMount() {
    this.getRuleList()
  }

  getRuleList() {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    dispatch(fetchRuleList('',currVendorId, accessToken, async (ok, desc, obj) => {
      if (ok) {
         this.setState({
          ruleList: obj,
        });
      }else{
        ToastLong("请求出错!")
      }
       this.setState({
        query: false
      });
    }))
  }
  initDate(date) {
    if (date) {
      return new Date(date.replace(/-/g, "/"))
    } else {
      return new Date()
    }
  }

  timeFlag(start_time, end_time,) {
    start_time = new Date(start_time.replace(/-/g, "/")).getTime();
    end_time = new Date(end_time.replace(/-/g, "/")).getTime();
    let {startTime, endTime} = this.state;
    startTime = startTime == '' ? Date.now() : tool.getTimeStamp(startTime);
    endTime = endTime == '' ?  Date.now() : tool.getTimeStamp(`${endTime} 23:59:59`);
    return (endTime < start_time || startTime > end_time)? false:true
  }

  renderList() {
    let {ruleList, vendorId,startTime,endTime } = this.state;
    let arr = [];
    if (vendorId === 0 && (startTime === '') && (endTime === '')) {
      arr = ruleList
    } else if(vendorId === 0) {
      arr = ruleList.filter((item) => {
        let { end_time, start_time} = item.price_rules;
        return this.timeFlag(start_time, end_time)
      });
    }else if(vendorId != 0 &&(startTime === '') && (endTime === '')){
      arr = ruleList.filter((item) => {
        return item.price_rules.vendor_id == vendorId
      });
    }else {
      arr = ruleList.filter((item) => {
        let { vendor_id,end_time, start_time} = item.price_rules;
        return vendorId==vendor_id && this.timeFlag(start_time, end_time)
      });
    }
  return  tool.length(arr)>0?arr.map((item, key) => {
      return (
          <ActivityItem
              key={key}
              customStyle={{marginLeft: pxToDp(15)}}
              textStyle={{color: colors.fontGray}}
              item={item}
              onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE, {rules: item, type: 'use'})
              }}
          />
      )
    }):<RenderEmpty/>
  }

  render() {
    let {startTime, endTime, vendorId} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <View style={manage.header}>
            <Cell customStyle={style.cell}>
              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65)}}
                  onPress={() => {
                    this.setState({stPicker: true,})
                  }}
              >
                <Text style={style.time}>{startTime == '' ? '开始时间' : startTime}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65), marginLeft: pxToDp(20)}}
                  onPress={() => {
                    if(startTime==''){
                      ToastLong('请先选择开始时间');
                      return false
                    }
                    this.setState({edPicker:true})
                  }}
              >
                <Text style={[style.time]}>{endTime == '' ? '结束时间' : endTime}</Text>
              </TouchableOpacity>
              <ModalSelector
                  style={{height: pxToDp(65)}}
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={async (option) => {
                    await this.setState({
                      vendorId: option.key,
                    });
                  }}
              >
                <View style={{
                  minWidth: pxToDp(160),
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  height: pxToDp(65),
                  backgroundColor: '#dadada',
                  borderRadius: pxToDp(5),
                  marginLeft: pxToDp(30),
                  paddingHorizontal: pxToDp(15),
                }}>
                  <Text style={{color: colors.main_color}}>{tool.getVendorName(vendorId)}</Text>
                  <Image style={[{width: pxToDp(28), height: pxToDp(18), marginLeft: pxToDp(8)}]}
                         source={this.state.down ? require('../../img/Public/xiangxialv_.png') : require('../../img/Public/xiangxialv_.png')}
                  />
                </View>
              </ModalSelector>
            </Cell>
          </View>
          <ScrollView style={{backgroundColor: '#fff'}}>
            {
              this.renderList()
            }
          </ScrollView>
          <DateTimePicker
              date={this.initDate(this.state.startTime)}
              mode='date'
              maximumDate={this.initDate(this.state.endTime)}
              isVisible={this.state.stPicker}
              onConfirm={async (date) => {
                let confirm_data = tool.fullDay(date);
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
              mode='date'
              minimumDate={this.initDate(this.state.startTime)}
              maximumDate={new Date()}
              isVisible={this.state.edPicker}
              onConfirm={async (date) => {
                let confirm_data = tool.fullDay(date);
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
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
        </View>
    )
  }
}


const manage = {
  cell_footer_text: {
    textAlign: 'right',
  },
  cells: {
    position: 'relative',
    backgroundColor: colors.white,
    marginBottom: pxToDp(20),
  },
  cell: {
    marginLeft: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    paddingHorizontal: pxToDp(30),
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
    backgroundColor: colors.main_color,
  },
  ball_main_yellow: {
    backgroundColor: colors.fontOrange,
  },
  down: {
    height: pxToDp(22),
    width: pxToDp(40),
  },

}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityListScene)
