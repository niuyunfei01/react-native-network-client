//import liraries
import React, {PureComponent} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items, get_supply_orders} from '../../reducers/settlement/settlementActions'
import {hideModal, showModal, ToastLong} from '../../util/ToastUtils';
import tool from '../../common/tool.js'
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

  constructor(props) {
    super(props);
    this.state = {
      total_price: 0,
      order_num: 0,
      date: '',
      status: true,
      list: {},
      query: true,
      dataPicker: false,
      dateList: [],
    }
    this.renderList = this.renderList.bind(this)
    showModal('加载中')
  }

  async UNSAFE_componentWillMount() {
    let {date, dateList} = this.props.route.params || {};
    await this.setState({date: date, dateList: dateList});
    this.getDateilsList();
  }

  getDateilsList() {
    let store_id = this.props.global.currStoreId;
    let date = this.state.date
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_items(store_id, date, 'month', token, async (resp) => {
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
    num = 0;
    item.forEach((item) => {
      num += parseInt(item.total_price);
    });
    return num;
  }

  renderHeader() {
    let {dateList, date} = this.state;
    return (
      <View style={header.box}>
        <View style={header.title}>
          <ModalSelector
            data={dateList}
            onChange={async (option) => {
              if (option.key !== date) {
                await this.setState({date: option.key, query: true});
                showModal('加载中')
                this.getDateilsList();
              }
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={header.time}>{this.state.date}  </Text>
              <Image
                style={{alignItems: 'center', transform: [{scale: 0.4}]}}
                source={require('../../img/Public/xiangxia_.png')}
              >
              </Image>
            </View>
          </ModalSelector>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: pxToDp(20)}}>
          <View style={[header.text_box, {borderRightWidth: pxToDp(1), borderColor: '#ECECEC'}]}>
            <Text style={header.money}>订单数量 : {this.state.order_num}  </Text>
          </View>
          <View style={header.text_box}>
            <Text style={header.money}>金额 : {tool.toFixed(this.state.total_price)}  </Text>
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
          <View key={key} style={{}}>
            <View style={styles.item_title}>
              <TouchableOpacity
                onPress={() => {
                  this.state.list[key].down = !item.down;
                  this.forceUpdate()
                }}
                style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.name}>{key}  </Text>
                  <Text style={styles.total_sum}>共{tool.toFixed(this.arraySum(item))}  </Text>

                </View>
                <Image style={[{width: pxToDp(80), height: pxToDp(80)}]}
                       source={item.down ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                />
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
          <Image style={{width: pxToDp(100), height: pxToDp(135)}}
                 source={require('../../img/Goods/zannwujilu.png')}/>
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录  </Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {
          this.renderHeader()
        }
        <View>
          <View style={title.box}>
            <Text style={title.name}>商品名称  </Text>
            <Text style={title.comm}>月售出  </Text>
            <Text style={title.comm}>单价  </Text>
            <Text style={title.comm}>总价  </Text>
          </View>
        </View>
        <ScrollView style={{paddingBottom: pxToDp(20)}}>

          {
            this.renderList()
          }
        </ScrollView>

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
    paddingLeft: pxToDp(30),
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderColor: '#e5e5e5',

  },
  name: {
    fontSize: pxToDp(32),
    color: colors.main_color,
    fontWeight: '900',
    marginRight: pxToDp(10)

  },
  status: {
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(20),
    lineHeight: pxToDp(34),
    height: pxToDp(36),
    textAlign: 'center',
    marginTop: pxToDp(5),
  }

});
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
    fontSize: pxToDp(24),
    color: colors.fontGray
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
  },
  name: {
    width: pxToDp(216),
    textAlign: 'center'
  },
  comm: {
    width: pxToDp(110),
    textAlign: "center"
  },
  total_sum: {
    color: colors.color666,
    fontSize: pxToDp(28),
    fontWeight: '100',
    marginLeft: pxToDp(20)
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(SettlementGatherScene)
