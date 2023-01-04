//import liraries
import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {get_supply_items, get_supply_orders} from '../../../reducers/settlement/settlementActions'
import {hideModal, showModal, ToastLong} from '../../../pubilc/util/ToastUtils';
import tool from '../../../pubilc/util/tool.js'
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import CustomMonthPicker from "../../../pubilc/component/CustomMonthPicker";

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

  constructor(props) {
    super(props);

    let dates = new Date();
    this.state = {
      total_price: 0,
      order_num: 0,
      date: '',
      dates: dates,
      status: true,
      list: {},
      query: true,
      dataPicker: false,
      dateList: [],
      visible: false
    }

    showModal('加载中')
  }

  async componentDidMount() {
    let {date} = this.props.route.params || {};
    await this.setState({date: date});
    this.getDateilsList();
  }

  getDateilsList() {
    let {date} = this.state
    const {dispatch, global} = this.props;
    let {store_id, accessToken} = global;
    dispatch(get_supply_items(store_id, date, 'month', accessToken, async (resp) => {
      if (resp.ok) {
        this.setState({
          list: resp.obj.goods_list,
          total_price: resp.obj.total_price,
          order_num: resp.obj.order_num,
        })
      } else {
        ToastLong(resp.desc)
      }
      hideModal()
      this.setState({query: false})
    }));
  }

  arraySum(item) {
    let num = 0;
    item.forEach((item) => {
      num += parseInt(item.total_price);
    });
    return num;
  }

  onChange = (event, date) => {
    this.setState({visible: false})
    if (event === 'dateSetAction') {
      this.setState({dates: date, date: this.format(date)}, () => {
        this.getDateilsList();
      })
    }
  }

  format = (date) => {
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
  }

  renderHeader() {
    let {date, total_price, order_num} = this.state;
    return (
      <View style={header.box}>
        <View style={header.title}>
          <Text style={header.time} onPress={() => this.setState({visible: true})}>
            {date} &nbsp;&nbsp;
            <Entypo name='chevron-thin-down' style={{fontSize: 14, color: colors.color333, marginLeft: 5}}/>
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: pxToDp(20)}}>
          <View style={[header.text_box, {borderRightWidth: pxToDp(1), borderColor: '#ECECEC'}]}>
            <Text style={header.money}>订单数量 : {order_num}  </Text>
          </View>
          <View style={header.text_box}>
            <Text style={header.money}>金额 : {tool.toFixed(total_price)}  </Text>
          </View>
        </View>
      </View>
    )
  }

  renderList() {
    let {list} = this.state;
    if (tool.length(list) > 0) {
      return (tool.objectMap(list, (item, key) => {
        return (
          <View key={key}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: pxToDp(100),
              paddingLeft: pxToDp(30),
              backgroundColor: '#fff',
              borderBottomWidth: pxToDp(1),
              borderColor: '#e5e5e5',
            }}>
              <TouchableOpacity
                onPress={() => {
                  list[key].down = !item.down;
                  this.forceUpdate()
                }}
                style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{
                    fontSize: pxToDp(32),
                    color: colors.main_color,
                    fontWeight: '900',
                    marginRight: pxToDp(10)
                  }}>
                    {key}
                  </Text>
                  <Text
                    style={{color: colors.color666, fontSize: pxToDp(28), fontWeight: '100', marginLeft: pxToDp(20)}}>
                    共{tool.toFixed(this.arraySum(item))}
                  </Text>

                </View>
                {
                  item.down ?
                    <Entypo name={"chevron-thin-up"} style={{fontSize: pxToDp(40), color: colors.main_color}}/> :
                    <Entypo name={"chevron-thin-down"} style={{fontSize: pxToDp(40), color: colors.main_color}}/>
                }
              </TouchableOpacity>
            </View>
            {
              item.down &&
              <View style={{marginTop: pxToDp(1)}}>
                {
                  item.map((ite, index) => {
                    let {goods_name, goods_num, supply_price, total_price} = ite;
                    return (
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        height: pxToDp(120),
                        alignItems: 'center',
                        paddingHorizontal: pxToDp(30),
                        borderBottomWidth: 1,
                        borderColor: '#f9f9f9',
                        backgroundColor: '#ffffff'
                      }}
                            key={index}
                      >
                        <Text numberOfLines={2} style={title.name}>{goods_name}  </Text>
                        <Text numberOfLines={2} style={title.comm}>{goods_num}  </Text>
                        <Text numberOfLines={2} style={title.comm}>{tool.toFixed(supply_price)}  </Text>
                        <Text numberOfLines={2} style={title.comm}>{tool.toFixed(total_price)}  </Text>
                      </View>
                    )
                  })
                }
              </View>
            }

          </View>
        )
      }))
    } else {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
          <FontAwesome5 name={'file-signature'} size={52} color={colors.color999}/>
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>
            没有相关记录
          </Text>
        </View>
      )
    }
  }

  render() {
    const {dates, visible} = this.state
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <View>
          <View style={title.box}>
            <Text style={title.name}>商品名称 </Text>
            <Text style={title.comm}>月售出 </Text>
            <Text style={title.comm}>单价 </Text>
            <Text style={title.comm}>总价 </Text>
          </View>
        </View>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{paddingBottom: pxToDp(20)}}>

          {
            this.renderList()
          }
        </ScrollView>
        <CustomMonthPicker visible={visible} onChange={(event, newDate) => this.onChange(event, newDate)} date={dates}/>

      </View>
    )
  }

}

const header = StyleSheet.create({
  box: {
    height: pxToDp(180),
    backgroundColor: '#fff',
  },
  title: {
    paddingTop: pxToDp(30),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  time: {
    color: colors.fontGray,
    fontWeight: 'bold',
    fontSize: 15,
    padding: 5,
    width: 200,
  },
  text_box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: pxToDp(10)

  },
  headerDeil: {
    fontSize: pxToDp(24),
    color: '#00a0e9',
    lineHeight: pxToDp(30),
    textAlignVertical: 'center',
  },
  settle: {
    borderWidth: pxToDp(1),
    color: colors.main_color,
    borderColor: colors.main_color,
    paddingHorizontal: pxToDp(10),
    paddingVertical: pxToDp(5),
    borderRadius: pxToDp(20),
    fontSize: pxToDp(24),
    marginTop: pxToDp(20)
  },
  money: {
    fontSize: pxToDp(30)
  }
});

const title = StyleSheet.create({
  box: {
    height: pxToDp(55),
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginVertical: 6,
  },
  name: {
    width: pxToDp(216),
    textAlign: 'center',
    fontSize: 14,
    color: colors.color333
  },
  comm: {
    width: pxToDp(110),
    textAlign: "center",
    fontSize: 14,
    color: colors.color333
  },
  total_sum: {
    color: colors.color666,
    fontSize: pxToDp(28),
    fontWeight: '100',
    marginLeft: pxToDp(20)
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(SettlementGatherScene)

