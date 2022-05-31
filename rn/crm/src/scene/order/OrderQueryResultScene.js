import React from 'react'
import ReactNative, {TouchableOpacity,StyleSheet} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../pubilc/util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../pubilc/common/Cts'
import colors from "../../pubilc/styles/colors";
import tool from "../../pubilc/util/tool";
import HttpUtils from "../../pubilc/util/http";
import OrderListItem from "../../pubilc/component/OrderListItem";
import {hideModal, showError, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import DateTimePicker from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import {SearchBar} from "../../weui";

const {
  FlatList,
  Text,
  InteractionManager,
  View,
  SafeAreaView
} = ReactNative;
const {PureComponent} = React;

function mapStateToProps(state) {
  const {remind, global} = state;
  return {remind: remind, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchRemind,
      updateRemind,
      fetchRemindCount,
      delayRemind, ...globalActions
    }, dispatch)
  }
}

const STATUS_FILTER=[
  {label: '全部订单', id: 0},
  {label: '已取消', id: 5},
  {label: '异常', id: 8}
]

class OrderQueryResultScene extends PureComponent {
  constructor(props) {
    super(props);
    const {navigation, route} = this.props
    let title = ''
    let type = 'done'
    if (tool.length(route.params.term) > 0) {
      title = `订单中搜索:${route.params.term || ""}`
      type = 'search'
    } else {
      title = '全部订单'
    }
    if (route.params.additional !== undefined && route.params.additional) {
      title = '补送单'
      type = 'additional'
    }
    this.state = {
      isLoading: false,
      query: {
        page: 1,
        limit: 10,
        maxPastDays: 20,
      },
      orders: [],
      isCanLoadMore: false,
      type: type,
      date: dayjs().format('YYYY-MM-DD'),
      showDatePicker: false,
      end: false,
      dateBtn: 1,
      platformBtn: 0,
      platform: [
        {label: '全部', id: 0},
        {label: '美团外卖', id: 3},
        {label: '饿了么', id: 4},
        {label: '京东', id: 6},
        {label: '其它', id: -1},
      ],
      selectStatus:STATUS_FILTER[0]
    };
    navigation.setOptions({headerTitle: title})
    this.onSearch('',false)
    this.renderItem = this.renderItem.bind(this);
  }

  onRefresh=()=> {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        end: false,
        query: query,
        orders: []
      }, () => {
        this.onSearch('',false)
      })
    }, 600)
  }

  onPress(route, params) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onEndReached() {
    const query = this.state.query;
    if (this.state.end) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.onSearch('',false)
    })
  }

  renderItem(order) {
    let {item, index} = order;
    return (
      <OrderListItem showBtn={false}
                     fetchData={()=>this.onSearch('',false)}
                     item={item} index={index}
                     accessToken={this.props.global.accessToken}
                     key={index}
                     onRefresh={() => this.onRefresh()}
                     navigation={this.props.navigation}
                     vendorId={this.props.global.config.vendor.id}
                     setState={this.setState.bind(this)}
                     allow_edit_ship_rule={false}
                     onPress={this.onPress.bind(this)}
      />
    );
  }

  renderContent(orders) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.back_color, color: colors.fontColor}}>
        <FlatList
          extraData={orders}
          data={orders}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh.bind(this)}
          onEndReachedThreshold={0.1}
          // onEndReached={this.onEndReached.bind(this)}
          onEndReached={() => {
            if (this.state.isCanLoadMore) {
              this.onEndReached();
              this.setState({isCanLoadMore: false})
            }
          }}
          onMomentumScrollBegin={() => {
            this.setState({
              isCanLoadMore: true
            })
          }}
          refreshing={this.state.isLoading}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          // getItemLayout={this._getItemLayout}
          ListEmptyComponent={() =>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'row',
              height: 210
            }}>
              <If condition={!this.state.isLoading}>
                <Text style={{fontSize: 18, color: colors.fontColor}}>
                  未搜索到订单
                </Text>
              </If>

            </View>}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }

  _keyExtractor = (item) => {
    return item.id.toString();
  }

  render() {
    const orders = this.state.orders || []
    return (
      <View style={{flex: 1, backgroundColor: colors.back_color}}>
        <If condition={this.state.type === 'done'}>
          {this.renderHeader()}
        </If>
        {this.renderContent(orders)}
      </View>
    );
  }

  onSearch = (keywords,isSearch) => {
    const{isLoading,date,platformBtn,selectStatus,query,orders}=this.state
    if (isLoading) {
          return
    }
      showModal("加载中...")
      this.setState({isLoading: true})
      let params = {
          search_date:date,
          platform:platformBtn,
          order_status:selectStatus.id,
          search_from:'app',
          page:query.page,
          limit:query.limit
      }
    if(keywords.length>0)
        params={...params,keywords:keywords}
      const url = `/v1/new_api/orders/order_all_list`;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
          hideModal()
          if (res.length < query.limit) {
              this.setState({
                  end: true,
              })
          }
          //如果是搜索，直接使用接口返回的数据，如果是下拉或者上拉，添加数据
          this.setState({
              orders: isSearch?res:orders.concat(res),
              isLoading: false,
          })
      }, (res) => {
          this.setState({isLoading: false})
          showError(res.reason)
      })
  };

  selectItem=(item)=>{
    this.setState({
      selectStatus: item,
    }, () => {
      this.onRefresh()
    })
  }

  renderHeader() {
    const {selectStatus,date,showDatePicker,dateBtn,platform,platformBtn} = this.state
    return (
      <View>
        <SearchBar placeholder="平台订单号/外送帮单号/手机号/顾客地址" onBlurSearch={(keywords)=>this.onSearch(keywords,true)} lang={{cancel: '搜索'}}/>
        <View style={styles.rowWrap}>
          <DateTimePicker
            cancelTextIOS={'取消'}
            confirmTextIOS={'确定'}
            customHeaderIOS={() => {
              return (<View/>)
            }}
            date={new Date(date)}
            mode='date'
            isVisible={showDatePicker}
            onConfirm={(date) => {
              this.setState({
                showDatePicker: false,
                date: tool.fullDay(date),
              }, () => {
                this.onRefresh()
              });
            }}
            onCancel={() => {
              this.setState({
                showDatePicker: false,
              });
            }}
          />
          <Text style={styles.description}> 下单日期 </Text>
          <TouchableOpacity style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 1 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text onPress={() => {
              this.setState({
                dateBtn: 1,
                date: dayjs().format('YYYY-MM-DD')
              }, () => {
                this.onRefresh()
              })
            }} style={{
              fontSize: 12,
              color: dateBtn === 1 ? colors.white : colors.fontBlack,
            }}>今天</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 2 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text onPress={() => {
              this.setState({
                dateBtn: 2,
                date: dayjs().subtract(1, 'day').format('YYYY-MM-DD')
              }, () => {
                this.onRefresh()
              })
            }} style={{
              fontSize: 12,
              color: dateBtn === 2 ? colors.white : colors.fontBlack,
            }}>昨天</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 3 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text onPress={() => {
              this.setState({
                dateBtn: 3,
                showDatePicker: !showDatePicker
              })
            }} style={{
              fontSize: 12,
              color: dateBtn === 3 ? colors.white : colors.fontBlack,
            }}>自定义</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowWrap}>
          <Text style={styles.description}> 平台筛选 </Text>
          <For index='i' each='info' of={platform}>
            <TouchableOpacity key={i} style={{
              borderRadius: 2,
              backgroundColor: platformBtn === info.id ? colors.main_color : colors.white,
              marginLeft: pxToDp(15),
              alignItems: 'center',
              justifyContent: 'center',
              padding: pxToDp(10),
            }}>
              <Text onPress={() => {
                this.setState({
                  platformBtn: info.id,
                }, () => {
                  this.onRefresh()
                })
              }} style={{
                fontSize: 12,
                color: platformBtn === info.id ? colors.white : colors.fontBlack,
              }}>{info.label} </Text>
            </TouchableOpacity>
          </For>

        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.description}> 状态筛选 </Text>
          {
            STATUS_FILTER.map((item,index)=>{
              const backgroundColor=selectStatus.id === item.id ? colors.main_color : colors.white
              const color=selectStatus.id === item.id ? colors.white : colors.fontBlack
              return(
                  <TouchableOpacity key={index} style={[styles.btnWrap,{backgroundColor:backgroundColor }]}>
                    <Text onPress={() => this.selectItem(item)} style={{fontSize: 12, color: color}}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
              )
            })
          }
        </View>
      </View>
    )
  }

}

const styles=StyleSheet.create({
  description:{
    fontSize: 14,
    marginTop: pxToDp(3),
    padding: pxToDp(10),
  },
  rowWrap:{
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: pxToDp(20),
    paddingTop: pxToDp(10),
    paddingLeft: 0,
  },
  btnWrap:{
    borderRadius: 2,
    marginLeft: pxToDp(15),
    alignItems: 'center',
    justifyContent: 'center',
    padding: pxToDp(10),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(OrderQueryResultScene)
