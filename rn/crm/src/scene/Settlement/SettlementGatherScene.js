//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import pxToDp from "../../util/pxToDp";
import DateTimePicker from 'react-native-modal-datetime-picker';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import { get_supply_orders} from '../../reducers/settlement/settlementActions'
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import tool from '../../common/tool.js'
import {Toast} from "../../weui/index";
import Cts from "../../Cts"
import Config from '../../config'
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      get_supply_orders,
      ...globalActions
    }, dispatch)
  }
}

class SettlementGatherScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '月销量汇总',
    }
  };
  constructor(props) {
    super(props);
    let {date, status} = this.props.navigation.state.params || {};
    this.state = {
      total_price: 0,
      order_num: 0,
      date: '2018-01-17',
      status:true,
      order_list: [],
      query:true,
      dataPicker:false,
    }
    this.renderList = this.renderList.bind(this)
  }

  componentWillMount(){
    this.getSettleOrders()
  }
  getSettleOrders(){
    let store_id = this.props.global.currStoreId;
    let date= this.state.date
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_orders(store_id,date , token, async (resp) => {
      console.log(resp);
      if (resp.ok ) {
        this.setState({
          order_list:resp.obj.order_list,
          total_price:resp.obj.total_price,
          order_num:resp.obj.order_num,
        })
      } else {
        ToastLong(resp.desc)
      }
      this.setState({query:false})
    }));
  }
  renderHeader(){
    return(
        <View style={header.box}>
          <View style = {header.title}>
            <ModalSelector
                data={[
                  {key:1,label:'2018-01'},
                  {key:2,label:'2017-12'},
                  {key:3,label:'2017-11'},
                  {key:4,label:'2017-10'},
                  {key:5,label:'2017-09'},
                ]}

            >
              <View style ={{flexDirection:'row',alignItems:'center'}}>
                <Text style={header.time}>{this.state.date}</Text>
                <Image
                    style ={{alignItems:'center',transform:[{scale:0.4}]}}
                    source = {require('../../img/Public/xiangxia_.png')}
                >
                </Image>
              </View>
            </ModalSelector>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center',marginTop:pxToDp(20)}}>
            <View style = {[header.text_box,{borderRightWidth:pxToDp(1),borderColor:'#ECECEC'}]}>
              <Text style = {header.money}>订单数量 : {this.state.order_num}</Text>
            </View>
            <View style = {header.text_box}>
              <Text style = {header.money}>金额 : {tool.toFixed(this.state.total_price)}</Text>
            </View>
          </View>
        </View>
    )
  }
  renderList() {
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        let{orderTime,platform,dayId,total_goods_num,total_supply_price,id} = item
        return (
            <View key={key} style={{backgroundColor: '#fff',borderBottomWidth:pxToDp(1),borderColor:'#d9d9d9'}}>
              <View style={styles.item_title}>
                <TouchableOpacity
                      onPress={() => {
                        this.state.order_list[key].down = !item.down;
                        this.forceUpdate()
                      }}
                      style ={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flex:1}}
                >
                  <Text style={styles.name}>叶菜</Text>
                  <Image style={[{width: pxToDp(80), height: pxToDp(80)}]}
                         source={item.down ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                  />
                </TouchableOpacity>
              </View>
              {
                item.down ? <View>
                  <View style={{height: pxToDp(1), backgroundColor: colors.main_back}}/>
                  {
                    item.items.map((ite, index) => {
                      return (
                          <View style ={{
                            flexDirection:'row',
                            backgroundColor:'#fff',
                            justifyContent:'space-between',
                            height:pxToDp(120),
                            alignItems:'center',
                            paddingHorizontal:pxToDp(30),
                            borderBottomWidth:pxToDp(1),
                            borderColor:'#f9f9f9'
                          }}>
                            <Text  numberOfLines={2} style = {title.name}>{'大白菜'}</Text>
                            <Text  numberOfLines={2} style = {title.comm}>{'10000'}</Text>
                            <Text  numberOfLines={2} style = {title.comm}>{tool.toFixed(ite.supply_price)}</Text>
                            <Text  numberOfLines={2} style = {title.comm}>{tool.toFixed(ite.total_price)}</Text>
                          </View>
                      )
                    })
                  }
                </View> : null
              }

            </View>
        )
      }))
    }
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
              <Text style = {title.comm}>月售出</Text>
              <Text style = {title.comm}>单价</Text>
              <Text style = {title.comm}>总价</Text>
            </View>
          </View>
          <ScrollView >

            {
              this.renderList()
            }
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

const styles = StyleSheet.create({
  item_title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: pxToDp(100),
    paddingLeft: pxToDp(30)
  },
  name: {
    minWidth: pxToDp(200),
    fontSize:pxToDp(32),
    color:colors.main_color,
    fontWeight:'900',

  },
  status:{
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(20),
    lineHeight: pxToDp(34),
    height: pxToDp(36),
    textAlign: 'center',
    marginTop:pxToDp(5),
  }

});
const header = StyleSheet.create({
  box: {
    height: pxToDp(180),
    backgroundColor: '#fff',
  },
  title:{
    paddingTop:pxToDp(30),
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'center',
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

const title = StyleSheet.create({
  box:{
    height:pxToDp(55),
    flexDirection:'row',
    paddingHorizontal:pxToDp(30),
    justifyContent:'space-between',
    alignItems:'center',
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
export default connect(mapStateToProps, mapDispatchToProps)(SettlementGatherScene)
