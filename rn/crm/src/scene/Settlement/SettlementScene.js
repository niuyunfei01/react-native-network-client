//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';

import {ToastLong, ToastShort} from '../../util/ToastUtils';
// import {fetchWorkers, fetchUserCount, fetchStoreTurnover} from "../../reducers/mine/mineActions";
import {setCurrentStore} from "../../reducers/global/globalActions";
import * as tool from "../../common/tool";
import ModalSelector from "../../widget/ModalSelector/index";
import {upCurrentProfile} from "../../reducers/global/globalActions";
import {NavigationActions} from "react-navigation";
import {color, NavigationItem} from '../../widget';

import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
  CheckboxCells,
  Icon
} from "../../weui/index";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const customerOpacity = 0.6;

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '结算记录',
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
      checked: ['1', '2'],
      authority:true,
      canChecked :false,

    }
  this.renderList =this.renderList.bind(this)
  }

  inArray(key) {

    let checked = this.state.checked;

    if (checked.indexOf(key) >= 0) {
      return true;
    } else {
      return false;
    }


  }

  renderList() {
    let _this =this;
    let arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({value: `${i}`, label: `2017-12-${11+i}`})
    }
      return (
          <View>
            <View
                style={{flexDirection: 'row', height: pxToDp(55), alignItems: 'center', paddingHorizontal: pxToDp(30)}}>
              <Text>2017年12月</Text>
            </View>
            <Cells style={{margin: 0}}>
              {
                arr.map((item,index) => {

                  return (
                      <Cell key ={index} customStyle={{marginLeft: 0, paddingHorizontal: pxToDp(30), borderColor: colors.fontGray}} access>
                        <CellHeader style={{
                          minWidth: pxToDp(180),
                          flexDirection: 'row',
                          height: pxToDp(100),
                          alignItems: 'center'
                        }}>
                          {
                            _this.state.canChecked ?  <Icon name={this.inArray(item.value) ? 'success' : 'circle'} style={{marginRight: pxToDp(10)}}/>:<Text/>
                          }

                          <Text style={{height: 'auto'}}> {item.label}</Text>
                        </CellHeader>
                        <CellBody style={{marginLeft: pxToDp(10)}}>
                          {/*<Text style={[styles.status]}>未结算</Text>*/}
                          <Text style = {[styles.status,{borderColor:colors.main_color,color:colors.main_color}]}>已结算</Text>
                        </CellBody>
                        <CellFooter style={{color: colors.fontGray}}>
                          45454.55元
                        </CellFooter>
                      </Cell>
                  )
                })

              }
            </Cells>
          </View>

      )



  }


  render() {
    return (
        <View style={  this.state.authority ? {flex: 1, paddingBottom:pxToDp(120)}:{flex:1}}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.today_data}>
                今日数据（2017-12-05)
              </Text>
              <View style={{flexDirection: 'row', marginTop: pxToDp(20)}}>
                <Text style={styles.order_text}>订单 : 96</Text>
                <Text style={[styles.order_text, {marginLeft: pxToDp(64)}]}>金额 : 7623.11</Text>
              </View>
            </View>
            {
              this.renderList()
            }

          </ScrollView>


          {
            this.state.authority == true && this.state.canChecked ==false ?
                 <View style={styles.btn_box}>
                   <TouchableOpacity
                       style = {{flex:4.2}}
                       onPress = {() => {
                         this.setState({canChecked:true})
                       }}
                   >
                     <View style = {{justifyContent:'center',alignItems:'center',height:'100%'}}>
                       <Text style = {{color:colors.main_color,fontSize:pxToDp(30)}}>选择</Text>
                     </View>
                   </TouchableOpacity>
                   <View style = {{flex:3,backgroundColor:'#dcdcdc',height:'100%',justifyContent:'center',alignItems:'center'}}>
                     <Text style = {{color:'#fff',fontSize:pxToDp(30)}}>确认计算</Text>
                   </View>

                 </View>

                :
                <View style={styles.btn_box}>
                  <Text style={[styles.btn_text, styles.cancel]}>取消</Text>
                  <Text style={[styles.btn_text, styles.all]}>全选</Text>
                  <Text style={[styles.submit]}>
                    确认结算
                  </Text>
                </View>
          }



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
    justifyContent: 'center'

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
    height:pxToDp(114),
    backgroundColor:'#fff',
    flexDirection:'row',
    alignItems:"center"
  },
  btn_text:{
    fontSize:pxToDp(32),
    color:colors.main_color,
    width:pxToDp(209),
    textAlign:'center'
},
  cancel:{
    borderRightColor:'#eeeeee',
    borderRightWidth:pxToDp(1)
  },
  submit:{
    height:'100%',
    textAlign:'center',
    color:'#fff',
    backgroundColor:colors.main_color,
    flex:1,
    alignItems:'center',
    fontSize:pxToDp(32),
    lineHeight:pxToDp(80)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
