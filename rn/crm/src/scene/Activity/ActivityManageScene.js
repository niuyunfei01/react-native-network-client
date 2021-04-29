import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Cell,
  CellHeader,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

import Config from "../../config";
import tool from '../../common/tool';
import {Toast} from "../../weui/index";
import style from './commonStyle'
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
  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    navigation.setOptions({
      headerTitle: '活动加价管理',
      headerRight: () => (
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
    })
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
      operatingList: [],
      willOperatingList: [],
      query: true,
    }
    this.navigationOptions(this.props)
    this.getRuleList = this.getRuleList.bind(this);
    this.differentiateList = this.differentiateList.bind(this);
  }

  differentiateList(obj, type) {
    let arr = [];
    let time =  Date.now()
    obj.map((item) => {
      let {start_time, end_time} = item.price_rules;
      if (type && (time > tool.getTimeStamp(start_time)) && (time < tool.getTimeStamp(end_time))) {
        arr.push(item);
      } else if (type == false && (time < tool.getTimeStamp(start_time))){
        arr.push(item);
      }
    });
    return arr;
  }
  UNSAFE_componentWillMount() {
    this.getRuleList()
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if(nextProps.activity.activityRule){
      this.getRuleList()
    }
  }
  getRuleList = () => {
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    dispatch(fetchRuleList('active', currVendorId, accessToken, (ok, desc, obj) => {
      if (ok) {
        let operatingList = this.differentiateList(obj, true);
        let willOperatingList = this.differentiateList(obj, false);
        this.setState({
          query: false,
          operatingList: operatingList,
          willOperatingList: willOperatingList
        })
      } else {
        this.setState({query: false})
      }
    }))
  }

  render() {
    let {operating, wait, operatingList, willOperatingList} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView
              refreshControl={
                <RefreshControl
                    refreshing={this.state.query}
                    onRefresh={() => {
                      this.setState({query: true});
                      this.getRuleList()
                    }}
                    tintColor='gray'
                />
              }
          >
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
                    operatingList.map((item, key) => {
                      return (
                          <ActivityItem
                              key={key}
                              customStyle={{marginLeft: pxToDp(15), marginRight: pxToDp(15)}}
                              textStyle={{color: colors.main_color}}
                              item={item}
                              edit={true}
                              btn_text={'修改'}
                              onPress={() => {
                                this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE, {rules: item, type: 'edit'})
                              }}
                              ballColor={'#a3d0ac'}
                          />
                      )
                    }) : null
              }
            </View>
            <View style={{backgroundColor: '#f1c377', marginBottom: pxToDp(30)}}>
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
                <Image style={wait ? [manage.down, {transform: [{rotate: '180deg'}]}] : [manage.down]}
                       source={require('../../img/Public/xiangxiabai_.png')}/>
              </Cell>
              {
                wait ? willOperatingList.map((item, key) => {
                  return (
                      <ActivityItem
                          key={key}
                          customStyle={{marginLeft: pxToDp(15), marginRight: pxToDp(15)}}
                          textStyle={{color: colors.fontOrange}}
                          item={item}
                          edit={true}
                          onPress={() => {
                            this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE, {rules: item, type: 'edit'})
                          }}
                          ballColor={'#f1c377'}
                      />
                  )
                }) : null
              }
            </View>
          </ScrollView>

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
