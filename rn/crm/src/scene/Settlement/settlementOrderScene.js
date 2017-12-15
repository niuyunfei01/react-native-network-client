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
      headerTitle: '订单详情',
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
    console.log('///////////',status)
    this.state = {
      total_price: 4200,
      order_num: 1,
      date: date,
      goods_list: [],
      status:status
    }

  }
  render(){
     return(
         <View>
             <View style ={{
               height:pxToDp(140),
               backgroundColor:'#fff',
               paddingHorizontal:pxToDp(30)
             }}>
               <Text style = {{fontSize:pxToDp(24),color:'#bfbfbf',marginTop:pxToDp(20)}}>2017-01-01</Text>
               <View style = {{flexDirection:'row',marginTop:pxToDp(20),justifyContent:"space-between"}}>
                 <View style = {{flexDirection:'row'}}>
                   <Text style ={{fontSize:pxToDp(30),color:'#3e3e3e'}}>订单:99</Text>
                   <Text style ={{fontSize:pxToDp(30),color:'#3e3e3e',marginLeft:pxToDp(80)}}>金额:99999</Text>
                 </View>
                 <Text style = {{}}>已结算</Text>
               </View>
             </View>
             <ScrollView style = {{marginTop:pxToDp(20)}}>
               <View style = {{backgroundColor:'#fff'}}>
                 <View style={styles.item_title}>
                   <Text style = {styles.name}>#33</Text>
                   <Text style = {styles.num}>商品数量:2</Text>
                   <Text style = {styles.price}>金额:80.00</Text>
                   <Image style={[{width: pxToDp(60), height: pxToDp(60)}]}
                          source={require('../../img/Order/pull_down.png')}/>
                 </View>
                 <View style = {{height:pxToDp(20),backgroundColor:colors.main_back}}>

                 </View>
                 <View style = {{}}>
                   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:pxToDp(10)}}>
                     <Text style = {{width:pxToDp(370)}}>name</Text>
                     <Text style = {{width:pxToDp(100),textAlign:'center'}}>x333</Text>
                     <Text style = {{width:pxToDp(130),textAlign:'center',color:'#ff0101'}}>￥3333</Text>
                   </View>
                 </View>
               </View>
             </ScrollView>
         </View>

     ) 
  }

}
const  styles = StyleSheet.create({
  item_title:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:pxToDp(100),
  },
  name:{
    width:pxToDp(200)
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
