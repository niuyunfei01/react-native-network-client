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
  CheckboxCells,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import ActivityDialog from './ActivityDialog'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Dialog} from "../../weui/index";
import style from './commonStyle'
import SelectBox from './SelectBox'
import ImgBtn from "./imgBtn";
import {fetchRuleList} from "../../reducers/activity/activityAction";
import ActivityItem from './ActivityItem'
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

class ActivityManageScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '活动加价管理',
      headerRight: (
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => params.toggle()}>
            <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Config.ROUTE_ACTIVITY_LIST)
                }}
            >
              <Image style={{width: pxToDp(42), height: pxToDp(42), marginHorizontal: pxToDp(30)}}
                     source={require('../../img/Activity/lishijilu_.png')}/>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Config.ROUTE_ACTIVITY_RULE)
                }}
            >
              <Image style={{width: pxToDp(42), height: pxToDp(42), marginHorizontal: pxToDp(30)}}
                     source={require('../../img/Activity/xinjian_.png')}/>
            </TouchableOpacity>
          </TouchableOpacity>
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      hide: false,
      vendorId: 0,
      showDialog: false,
      list: [],
      title: '',
      operating: false,
      wait: false,
      operatingList:[],
      willOperatingList:[],
    }
  }

  componentWillMount() {

    this.getRuleList()
  }
componentDidMount(){
  let {navigation} = this.props;
  navigation.setParams({toggle: this.toggle});
}
  getRuleList() {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchRuleList('active',accessToken,(ok, desc, obj)=>{
      if(ok){
        this.setState({
          operatingList:this.differentiateList(obj,0),
          willOperatingList:this.differentiateList(obj,1),
        })
      }
    }))
  }

  differentiateList(obj, type) {
    let arr = [];
    let time = new Date().getTime();
    obj.map((item) => {
      let {start_time, end_time} = item.price_rules;
      let startTime = new Date(start_time).getTime();
      let endTime = new Date(end_time).getTime();
      if ((type == 0) && (time > startTime) && (time < endTime)) {
        arr.push(item);
      } else if ((type == 1) && (time < startTime)) {
        arr.push(item);
      }
    });
    return obj;
  }

  render() {
    let {operating, wait,operatingList,willOperatingList} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView>
            <View style={{backgroundColor: '#a3d0ac', marginBottom: pxToDp(30)}}>
              <Cell customStyle={[style.cell, {backgroundColor: 'rgba(0,0,0,0)'}]} first={true}
                    onPress={() => {
                      this.setState({operating: !operating})
                    }}
              >
                <CellHeader style={{flexDirection: 'row'}}>
                  <Image source={require('../../img/Activity/yunxingzhong_.png')}
                         style={{height: pxToDp(40), width: pxToDp(40)}}/>
                  <Text style={style.cell_header_text_white}>运行中({tool.length(operatingList)})</Text>
                </CellHeader>
                <Image style={operating ? [manage.down, {transform: [{rotate: '180deg'}]}] : [manage.down]}
                       source={require('../../img/Public/xiangxiabai_.png')}/>
              </Cell>
              {
                operating ?
                    operatingList.map((item,key)=>{
                      return(
                          <ActivityItem
                              key={key}
                              customStyle={{marginLeft: pxToDp(15),marginRight:pxToDp(15)}}
                              textStyle={{color:colors.main_color}}
                              item={item}
                              btn_text={'修改'}
                              onPress={()=>{
                                this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE,{rules:item,type:0})
                              }}
                          />
                      )
                    }) : null
              }
            </View>
            <View style={{backgroundColor: '#f1c377',marginBottom:pxToDp(30)}}>
              <Cell customStyle={[style.cell, {backgroundColor: 'rgba(0,0,0,0)'}]} first={true}
                    onPress={() => {
                      this.setState({wait: !wait})
                    }}
              >
                <CellHeader style={{flexDirection: 'row'}}>
                  <Image source={require('../../img/Activity/daizhixing_.png')}
                         style={{height: pxToDp(40), width: pxToDp(40)}}/>
                  <Text style={style.cell_header_text_white}>待执行({tool.length(willOperatingList)})</Text>
                </CellHeader>
                <Image style={manage.down} source={require('../../img/Public/xiangxiabai_.png')}/>
              </Cell>
              {
                wait ? willOperatingList.map((item,key)=>{
                      return(
                          <ActivityItem
                              key={key}
                              customStyle={{marginLeft: pxToDp(15),marginRight:pxToDp(15)}}
                              textStyle={{color:colors.fontOrange}}
                              item={item}
                              btn_text={'修改'}
                              onPress={()=>{
                                this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE,{rules:item,type:0})
                              }}
                          />
                      )
                    }) : null
              }
            </View>
          </ScrollView>
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
            <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
              <CellHeader>
                <Text>回龙观店(微信)</Text>
              </CellHeader>
            </Cell>
            <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
              <CellHeader>
                <Text>回龙观店(微信)</Text>
              </CellHeader>
            </Cell>
          </ActivityDialog>
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
    marginHorizontal: pxToDp(30),
    position: 'relative',
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    marginBottom: pxToDp(20),
  },
  cell: {
    marginLeft: 0,
    paddingLeft: pxToDp(15),
    paddingRight: pxToDp(15),
    backgroundColor: 'rgba(0,0,0,0)'
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
export default connect(mapStateToProps, mapDispatchToProps)(ActivityManageScene)
