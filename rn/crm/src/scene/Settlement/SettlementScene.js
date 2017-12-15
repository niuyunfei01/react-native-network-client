//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items,get_supply_bill_list} from '../../reducers/settlement/settlementActions'
import {NavigationActions} from "react-navigation";
import {color, NavigationItem} from '../../widget';
import  tool from '../../common/tool.js'
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Icon
} from "../../weui/index";
import Config from "../../config";
import {Toast} from "../../weui/index";

function mapStateToProps(state) {
  const { global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      get_supply_items,
      get_supply_bill_list,
      ...globalActions
    }, dispatch)
  }
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '打款记录',
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            navigation.goBack();

          }}
      />),
      headerRight: (
          <View style={
            {
              flexDirection: 'row',
              paddingRight: pxToDp(30)
            }
          }>
            <TouchableOpacity
                onPress={() => {
                  params.upLoad();
                }}
            >
              {/* <Text style={{
                  fontSize: pxToDp(32),
                  color: '#59b26a'
                }}>保存</Text> */}
            </TouchableOpacity>
          </View>),
    }
  };

  constructor(props) {
    super(props)
    this.state = {
      query:true,
      checked: ['1', '2'],
      authority: false,
      canChecked: false,
      list: [],
      orderNum :0,
      totalPrice:0,

    };
    this.renderList = this.renderList.bind(this);
    this.renderBtn = this.renderBtn.bind(this)
  }

  componentWillMount(){
    this.getSupplyList()
  }
  inArray(key) {
    let checked = this.state.checked;
    let index = checked.indexOf(key)
    if (index >= 0) {
      return {have: true, index};
    } else {
      return {have: false, index};
    }
  }


  getSupplyList() {
    let store_id = this.props.global.currStoreId;
    let {currVendorId} = tool.vendor(this.props.global);
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_bill_list(currVendorId, store_id,token, async (resp) => {
      console.log(resp)
      if(resp.ok ){
        let list  = resp.obj
        list.forEach((item)=>{
          if(item.bill_date == tool.fullDay(new Date())){
            this.setState({orderNum:item.order_num,totalPrice:item.bill_price})
          }
        })
        this.setState({list:resp.obj,query:false})
      }else {
        console.log(resp.desc)
      }

    }));
  }



  toggleCheck(key,date,status) {
    let checked = this.state.checked
    if (this.state.canChecked) {
      let {have, index} = this.inArray(key)
      if (have) {
        checked.splice(index, 1)

      } else {
        checked.push(key)
      }
      this.forceUpdate()
    }else {
      this.props.navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS,{
        date:date,
        status:status
      });
    }
  }
  renderStatus(status){
    
    if(status == 1){
     return(
         <Text style={[styles.status, {
           borderColor: colors.main_color,
           color: colors.main_color
         }]}>已打款</Text>
         )

    }else {
      return (
          <Text style={[styles.status]}>{tool.billStatus(status)}</Text>
      )
    }

}
  selectAll() {
    let selectAllList = [];
    let {checked, list} = this.state;
    if (checked.length == list.length) {
    } else {
      list.forEach((item) => {
        console.log(item.key)
        selectAllList.push(item.key)
      });
    }
    this.state.checked = selectAllList;
    this.forceUpdate()
  }
  renderBtn() {
    let {checked, list} = this.state;
    if (this.state.authority) {
      if (!this.state.canChecked) {
        return (
            <View style={styles.btn_box}>
              <TouchableOpacity
                  style={{flex: 4.2}}
                  onPress={() => {
                    this.setState({canChecked: true})
                  }}
              >
                <View style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                  <Text style={{color: colors.main_color, fontSize: pxToDp(30)}}>选择</Text>
                </View>
              </TouchableOpacity>
              <View style={{
                flex: 3,
                backgroundColor: '#dcdcdc',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{color: '#fff', fontSize: pxToDp(30)}}>确认打款</Text>
              </View>
            </View>
        )
      } else {
        return (
            <View style={styles.btn_box}>
              <TouchableOpacity
                  onPress={() => {
                    this.setState({canChecked: false})
                  }}>
                <Text style={[styles.btn_text, styles.cancel]}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  onPress={() => {
                    this.selectAll()
                  }}
                  style={{flexDirection: 'row', width: pxToDp(290), justifyContent: 'center'}}
              >
                <Icon name={checked.length == list.length ? 'success' : 'circle'}
                      style={{marginRight: pxToDp(10)}}/>
                <Text style={[styles.btn_text, styles.all, {width: pxToDp(80)}]}>全选</Text>
              </TouchableOpacity>

              <Text style={[styles.submit]}>
                确认打款
              </Text>
            </View>
        )
      }
    }
  }
  renderEmpty(){
      return(
          <View style = {{alignItems:'center',justifyContent:'center',flex:1,marginTop:pxToDp(200)}}>
            <Image style = {{width:pxToDp(100),height:pxToDp(135)}} source={require('../../img/Goods/zannwujilu.png')}/>
            <Text style = {{fontSize:pxToDp(24),color:'#bababa',marginTop:pxToDp(30)}}>没有相关记录</Text>
          </View>
      )
  }
  renderList() {
    let _this = this;
    console.log(this.state)
    if(this.state.list.length > 0){
        this.state.list.forEach((item)=>{
          item.key = item.id;
        })
      return (
          <View>
            <View
                style={{flexDirection: 'row', paddingHorizontal: pxToDp(30),}}>
              <Text style = {{paddingVertical:pxToDp(5),marginTop:pxToDp(15)}}>2017年12月</Text>
            </View>
            <Cells style={{margin: 0, borderBottomColor: '#fff'}}>
              <FlatList
                  data={this.state.list}
                  onEndReachedThreshold={0.9}
                  onEndReached={() => {
                    console.log('上拉加载')
                  }}
                  renderItem={({item, key}) => {
                    return (
                        <Cell customStyle={{marginLeft: 0, paddingHorizontal: pxToDp(30), borderColor: "#EEEEEE"}} access
                              onPress={() => {
                                this.toggleCheck(item.key,item.bill_date,item.status)
                              }}
                        >
                          <CellHeader style={{
                            minWidth: pxToDp(180),
                            flexDirection: 'row',
                            height: pxToDp(100),
                            alignItems: 'center'
                          }}>
                            {
                              _this.state.canChecked ? <Icon name={this.inArray(item.key)['have'] ? 'success' : 'circle'}
                                                             style={{marginRight: pxToDp(10)}}/> : <Text/>
                            }
                            <Text style={{height: 'auto'}}> {item.bill_date}</Text>
                          </CellHeader>
                          <CellBody style={{marginLeft: pxToDp(10)}}>
                            {
                              this.renderStatus(item.status)
                            }
                          </CellBody>
                          <CellFooter style={{color: colors.fontGray}}>
                            {tool.toFixed(item.bill_price)}元
                          </CellFooter>
                        </Cell>

                    )
                  }}
                  refreshing={false}
                  onRefresh={() => {
                    this.setState({query: true,});
                    this.getSupplyList();
                  }}
              />

            </Cells>
          </View>

      )
    }else {
      return(
          this.renderEmpty()
      )

    }

  }

  render() {
    return (
        <View style={this.state.authority ? {flex: 1, paddingBottom: pxToDp(110)} : {flex: 1}}>
          <View style={styles.header}>
            <Text style={styles.today_data}>
              今日数据（{tool.fullDay(new Date())})
            </Text>
            <View style={{flexDirection: 'row', marginTop: pxToDp(20)}}>
              <Text style={styles.order_text}>订单 : {this.state.orderNum}</Text>
              <Text style={[styles.order_text, {marginLeft: pxToDp(64)}]}>金额 : {tool.toFixed(this.state.totalPrice)}</Text>
            </View>
          </View>
          <ScrollView >
            {
              this.renderList()
            }


          </ScrollView>
          {
            this.renderBtn()
          }
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

//make this component available to the app
const styles = StyleSheet.create({
  header: {
    height: pxToDp(140),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: pxToDp(30),
    justifyContent: 'center',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: "#eeeeee",
  },
  today_data: {
    fontSize: pxToDp(24),
    color: colors.fontGray,
  },
  order_text: {
    fontSize: pxToDp(28),
    color: colors.fontBlack,

  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(40),
    borderRadius: pxToDp(20),
    width: pxToDp(100),
    fontSize: pxToDp(24),
    textAlign: 'center',
    justifyContent: 'center',
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(36)
  },
  btn_box: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: pxToDp(112),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: "center",
    borderTopWidth: pxToDp(1),
    borderTopColor: '#CCCCCC'

  },
  btn_text: {
    fontSize: pxToDp(32),
    color: colors.main_color,
    width: pxToDp(209),
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancel: {
    borderRightColor: '#eeeeee',
    borderRightWidth: pxToDp(1),
    width: pxToDp(160)
  },
  submit: {
    height: '100%',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: colors.main_color,
    flex: 1,
    alignItems: 'center',
    fontSize: pxToDp(32),
    lineHeight: pxToDp(80)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
