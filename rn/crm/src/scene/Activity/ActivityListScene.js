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
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '活动加价历史'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      hide: false,
      vendorId: Cts.STORE_TYPE_GZW,
      platList: [
        Cts.WM_PLAT_ID_WX,
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,
      ],
      platId: Cts.WM_PLAT_ID_WX,
      showDialog: false,
      down: false,
      startTime: '开始时间',
      endTime: '结束时间',
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
      ruleList:[],
      query:true,
      renderList:[],
    }
  }

  componentDidMount() {
    this.getRuleList()
  }

  getRuleList() {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {vendorId}=this.state;
    dispatch(fetchRuleList('active',accessToken,(ok, desc, obj)=>{
      if(ok){
        this.setState({
          ruleList:obj,
          query:false,
          renderList:this.arrFilter(obj,vendorId),
        })
      }
    }))
  }

  arrFilter(arr, id) {
    let list = [];
    arr.forEach((item) => {
      if (item.price_rules.vendor_id == id) {
        list.push(item)
      }
    });
    console.log(list)
    return list;
  }

  setDateTime(date) {
    let {timeKey} = this.state;
    this.setState({[timeKey]: date, dataPicker: false})
  }
  render() {
    let {startTime, endTime, vendorId,ruleList,renderList} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <View style={manage.header}>
            <Cell customStyle={style.cell}>
              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65)}}
                  onPress={() => {
                    this.setState({dataPicker: true, timeKey: 'startTime'})
                  }}
              >
                <Text style={style.time}>{startTime}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65), marginLeft: pxToDp(20)}}
                  onPress={() => {
                    this.setState({dataPicker: true, timeKey: 'endTime'})
                  }}
              >
                <Text style={[style.time]}>{endTime}</Text>
              </TouchableOpacity>
              <ModalSelector
                  style={{height: pxToDp(65)}}
                  skin='customer'
                  data={this.state.vendorList}
                  onChange={async(option) => {
                    await this.setState({
                      vendorId: option.key,
                      renderList:this.arrFilter(ruleList,option.key)
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
              renderList.map((item,key)=>{
                console.log(item)
                return(
                    <ActivityItem
                        key={key}
                        customStyle={{marginLeft: pxToDp(15)}}
                        textStyle={{color:colors.fontGray}}
                        item={item}
                        onPress={()=>{
                          this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE,{rules:item,type:'use'})
                        }}
                    />
                )
              })
            }
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
