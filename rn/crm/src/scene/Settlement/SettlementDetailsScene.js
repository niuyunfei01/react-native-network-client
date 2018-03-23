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
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items,to_settlement} from '../../reducers/settlement/settlementActions'
import  tool from '../../common/tool.js'
import {Toast,Dialog} from "../../weui/index";
import DateTimePicker from 'react-native-modal-datetime-picker';
import Config from "../../config";
import {Button} from "../../weui/index";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Cts from '../../Cts'
import {NavigationActions} from 'react-navigation';
function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      get_supply_items,
      to_settlement,
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
    }
  };

  constructor(props) {
    super(props);
    let {date,status,id,key} = this.props.navigation.state.params || {};
    console.log(date,status,id,key)
    this.state = {
      total_price: 0,
      order_num: 0,
      date: date,
      goods_list: [],
      status:status,
      query:true,
      dataPicker:false,
      id:id,
      auth_finance_admin:false,
      canClick:true,
      upload:false,
      dialog:false
    }
    this.setBeforeRefresh = this.setBeforeRefresh.bind(this)
  }
  componentWillMount(){
    this.getDateilsList();
  }
  async setBeforeRefresh() {
    
    let {state, dispatch} = this.props.navigation;
     const setRefreshAction =   NavigationActions.setParams({
      params: {isRefreshing: true},
      key: state.params.key
    });
    dispatch(setRefreshAction);
  }
  getDateilsList(){
    let store_id = this.props.global.currStoreId;
    let date= this.state.date;
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_items(store_id,date ,'', token, async (resp) => {
      if (resp.ok ) {
          let {goods_list,order_num,total_price,auth_finance_admin} = resp.obj;
          this.setState({
            goods_list:goods_list,
            order_num:order_num,
            total_price:total_price,
            query:false,
            auth_finance_admin:auth_finance_admin
            
          })
      } else {
        ToastLong(resp.desc)
      }
      this.setState({
        query:false,
        upload:false
      })
    }));
  }
doSettlement(){
  let id= this.state.id;
  let token = this.props.global.accessToken;
  const {dispatch} = this.props;
  dispatch(to_settlement(id,token, async (resp) => {
    if (resp.ok ) {
      ToastLong('结算成功');
      this.setState({status:Cts.BILL_STATUS_PAID});
      await this.setBeforeRefresh();
      this.props.navigation.goBack()
    } else {
      ToastLong(resp.desc);
      this.setState({canClick:true})
    }
    this.setState({query:false,upload:false})
  }));
}
renderStatus(status) {
    if (status == Cts.BILL_STATUS_PAID) {
      return (
          <Text style={[styles.status, {
            borderColor: colors.main_color,
            color: colors.main_color,
          }]}>已打款</Text>
      )
    } else {
      return (
          <Text style={[styles.status]}>{tool.billStatus(status)}</Text>
      )
    }
  }
  renderBtn() {
    if(this.state.auth_finance_admin && this.state.status == Cts.BILL_STATUS_WAIT ){
      return (
          <View style={{paddingHorizontal: pxToDp(20), paddingVertical: pxToDp(20)}}>
            <Button
                onPress={async() => {
                  if(this.state.canClick){
                    await this.setState({canClick:false})
                    this.setState({dialog:true})
                  }else {
                    ToastLong('请勿多次点击!')
                  }
                }}
                type={Cts.BILL_STATUS_WAIT == this.state.status ? 'primary' : 'default'}
                disabled={Cts.BILL_STATUS_WAIT == this.state.status ? false : true}
            >结算</Button>
          </View>
      )
    }else {
      return <View/>
    }
  }
  renderHeader(){
    return(
        <View style={header.box}>
          <View style = {header.title}>
            <TouchableOpacity
                style = {{flexDirection:'row',alignItems:'center',width:pxToDp(200)}}
                onPress = { async()=>{
                  this.setState({dataPicker:true})
                }}
            >
              <Text style={header.time}>{this.state.date}</Text>
              <Image
                  style ={{alignItems:'center',transform:[{scale:0.4}]}}
                  source = {require('../../img/Public/xiangxia_.png')}
              >
              </Image>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center',marginTop:pxToDp(20)}}>
            <View style = {[header.text_box,{borderRightWidth:pxToDp(1),borderColor:'#ECECEC'}]}>
              <Text style = {header.money}>订单数量 : {this.state.order_num}</Text>
              <TouchableOpacity
                  onPress = {()=>{
                    let {date,status} =this.state
                    this.props.navigation.navigate(Config.ROUTE_SETTLEMENT_ORDER,{
                      date:date,
                      status:status
                    });
                  }}
              >
              <View style = {{flexDirection:'row',alignItems:'center',marginTop:pxToDp(20)}}>
                <Text style = {header.headerDeil}>查看详情 </Text>
                <Image
                    style = {{height:pxToDp(19),width:pxToDp(9)}}
                    source = {require('../../img/Public/xiangyou_.png')}
                />
              </View>
              </TouchableOpacity>
            </View>
            <View style = {header.text_box}>
              <Text style = {header.money}>金额 : {tool.toFixed(this.state.total_price)}</Text>
              {
                this.renderStatus(this.state.status)
              }
            </View>
          </View>
        </View>
    )
  }
  renderEmpty() {
    if (!this.state.query) {
      return (
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
            <Image style={{width: pxToDp(100), height: pxToDp(135)}}
                   source={require('../../img/Goods/zannwujilu.png')}/>
            <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
          </View>
      )
    }
  }
  renderList() {
    this.state.goods_list.forEach((item)=>{
      item.key = item.product_id
    });
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
        ListEmptyComponent={this.renderEmpty()}
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
          <ScrollView style = {{flex:1}}>
            {this.renderList()}
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

          <Toast
              icon="loading"
              show={this.state.upload}
              onRequestClose={() => {
              }}
          >提交中</Toast>
       <Dialog onRequestClose={() => {}}
                  visible={this.state.dialog}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => this.setState({dialog: false,canClick:true}),
                  },
                    {
                      type: 'default',
                      label: '确定',
                      onPress: async() => {
                      await  this.setState({dialog: false,upload:true});
                      this.doSettlement()
                      },
                    }
                  ]}
          >
            <Text>确定结算吗？</Text>
          </Dialog>

          <DateTimePicker
              date={new Date(tool.fullDay(this.state.date))}
              maximumDate={new Date()}
              mode='date'
              isVisible={this.state.dataPicker}
              onConfirm={ async (date) => {
                let confirm_data = tool.fullDay(date);
                await this.setState({date:confirm_data,dataPicker: false,query:true});
                this.getDateilsList()
              }}
              onCancel={() => {
                this.setState({dataPicker: false});
              }}
          />
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
});
const styles = StyleSheet.create({
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
    lineHeight: pxToDp(36),
    marginTop:pxToDp(25)
  },
});
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
    lineHeight:pxToDp(30),
    textAlignVertical:'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
