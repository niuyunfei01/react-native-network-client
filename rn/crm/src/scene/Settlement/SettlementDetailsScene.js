//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  DatePickerAndroid
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items,get_supply_bill_list} from '../../reducers/settlement/settlementActions'
import {ToastLong, ToastShort} from '../../util/ToastUtils';
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

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '结算详情',
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
    let {date,status} = this.props.navigation.state.params;
    console.log(date)
    this.state = {
      total_price: 4200,
      order_num: 1,
      date: date,
      goods_list: [],
      status:status
    }
    this.opendate = this.opendate.bind(this)
  }

  componentWillMount(){
    this.getDateilsList()
  }

  getDateilsList(){
    let store_id = this.props.global.currStoreId;
    let date= this.state.date
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_items(store_id,date , token, async (resp) => {
      
      if (resp.ok ) {
        if(resp.obj.goods_list.length>0){
          let {goods_list,order_num,total_price} = resp.obj;
          this.setState({goods_list:goods_list,order_num:order_num,total_price:total_price})
        }else{
          ToastLong('没有相关记录!')
        }
    
      } else {
        console.log(resp.desc)
      }
    }));
  }
async opendate(){
  try {
    const {action, year, month, day} = await DatePickerAndroid.open({
      date: new Date(),
      maxDate:new Date()
    });
    var str = {}
    if (action !== DatePickerAndroid.dismissedAction) {
      return( tool.fullDay(new Date(year,month,day).getTime()));
    }
  } catch ({code, message}) {
    console.warn('Cannot open date picker', message);
  }
}
  renderHeader(){
    const header = StyleSheet.create({
      box: {
        height: pxToDp(244),
        backgroundColor: '#fff',
      },
      title:{
        paddingTop:pxToDp(30),
        alignItems:'center',
      },
      time: {
        fontSize:pxToDp(24),
        color:colors.fontGray
      },
      text_box:{
        flex:1,
        alignItems:'center',
        paddingVertical:pxToDp(10)

      },
      headerDeil:{
        fontSize:pxToDp(24),
        color:'#00a0e9',
        marginTop:pxToDp(30)

      },
      settle:{
        borderWidth:pxToDp(1),
        color:colors.main_color,
        borderColor:colors.main_color,
        paddingHorizontal:pxToDp(10),
        paddingVertical:pxToDp(5),
        borderRadius:pxToDp(20),
        fontSize:pxToDp(24),
        marginTop:pxToDp(20)
      },
      money:{
        fontSize:pxToDp(30)
      }

    });
    return(
        <View style={header.box}>
          <View style = {header.title}>
            <TouchableOpacity
                style = {{flexDirection:'row',alignItems:'center',}}
                onPress = { async()=>{
                  let date = await this.opendate();
                  this.setState({date:date})
                }}
            >
              <Text style={header.time}>{this.state.date}</Text>
              <Image
                  style ={{width:pxToDp(20),alignItems:'center'}}
                  source = {require('../../img/Public/xiangxia_.png')}
                  resizeMode = {'cover'}
              >
              </Image>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center',marginTop:pxToDp(20)}}>
            <View style = {[header.text_box,{borderRightWidth:pxToDp(1),borderColor:'#ECECEC'}]}>
              <Text style = {header.money}>订单数量 : {this.state.order_num}</Text>
              <View>
                <Text style = {header.headerDeil}>查看详情 ></Text>
              </View>
            </View>
            <View style = {header.text_box}>
              <Text style = {header.money}>金额 : {tool.toFixed(this.state.total_price)}</Text>
              <Text style = {[header.headerDeil,header.settle]}>已结算</Text>
            </View>
          </View>
        </View>
    )
  }

  renderList() {
    this.state.goods_list.forEach((item)=>{
      item.key = item.product_id
    })
   return(
       <FlatList
        data={this.state.goods_list}
        renderItem={({item, key}) => {
          return (
              <View style ={{flexDirection:'row',backgroundColor:'#fff',justifyContent:'space-between',height:pxToDp(120),alignItems:'center',paddingHorizontal:pxToDp(30)}}>
                <Text  numberOfLines={2} style = {title.name}>{item.goods_name}</Text>
                <Text  numberOfLines={2} style = {title.comm}>{item.goods_num}</Text>
                <Text  numberOfLines={2} style = {title.comm}>{tool.toFixed(item.supply_price)}</Text>
                <Text  numberOfLines={2} style = {title.comm}>{tool.toFixed(item.total_price)}</Text>
              </View>
          )
        }}
        ItemSeparatorComponent = {()=>{
          return(<View style = {{borderColor:'#E2E2E2',borderBottomWidth:pxToDp(1)}}/>)
        }}
    />
   )
  }

  render() {
    return (
        <View style = {{flex:1}}>
          {
            this.renderHeader()
          }
          <View>
            <View style ={title.box}>
              <Text style = {title.name}>商品名称</Text>
              <Text style = {title.comm}>数量</Text>
              <Text style = {title.comm}>单价</Text>
              <Text style = {title.comm}>总价</Text>
            </View>
          </View>
          <View>
            {this.renderList()}
          </View>
        </View>

    )
  }
}

const title = StyleSheet.create({
  box:{
    height:pxToDp(55),
    flexDirection:'row',
    paddingHorizontal:pxToDp(30),
    justifyContent:'space-between',
    alignItems:'center'
  },
  name:{
    width:pxToDp(216),
    textAlign:'center'
  },
  comm:{
    width:pxToDp(110),
    textAlign:"center"

  }
})


export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
