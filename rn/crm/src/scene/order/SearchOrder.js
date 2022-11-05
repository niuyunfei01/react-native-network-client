//import liraries
import React, {PureComponent} from 'react'
import {FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import HttpUtils from "../../pubilc/util/http";
import OrderListItem from "../../pubilc/component/OrderListItem";
import tool from "../../pubilc/util/tool";
import colors from "../../pubilc/styles/colors";
import {hideModal, showError} from "../../pubilc/util/ToastUtils";
import {SearchBar} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import {cross_circle_icon, empty_order, search_icon} from "../../svg/svg";

function mapStateToProps(state) {
  const {global} = state;
  return {global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SearchOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      isRefreshing: false,
      isSearching: false,
      prefix: [],
      orderList: [],
      end: false,
      isLoading: false,
      isCanLoadMore: false,
      query: {
        page: 1,
        limit: 10,
        max_past_day: 90
      }
    };
  }

  fetchOrderSearchPrefix() {
    const {accessToken} = this.props.global
    const api = `/api/order_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      this.setState({prefix: res})
    })
  }

  onRefresh = () => {
    tool.debounces(() => {
      const {query} = this.state
      query.page = 1
      this.setState({
        end: false,
        query: query,
        orderList: []
      }, () => this.FetchOrderList(false))
    })
  }

  onPress(route, params) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onEndReached = () => {
    const {query, end, isLoading, isCanLoadMore} = this.state
    if (!isCanLoadMore || isLoading)
      return;
    if (end) {
      showError('没有更多数据了')
      this.setState({isCanLoadMore: false})
      return
    }
    query.page += 1
    this.setState({
      query: query,
      isLoading: true,
      isCanLoadMore: false
    }, () => {
      this.FetchOrderList(false)
    })
  }

  FetchOrderList = (isChangeType) => {
    const {accessToken} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    const {query, keyword} = this.state

    const params = {
      vendor_id: currVendorId,
      offset: (query.page - 1) * query.limit,
      max_past_day: query.max_past_day,
      limit: query.limit,
      search: encodeURIComponent(`${keyword}`),
      use_v2: 1
    }
    const url = `/api/orders.json?access_token=${accessToken}`;
    HttpUtils.get(url, params).then(res => {
      hideModal()
      const orderList = isChangeType ? res.orders : this.state.orderList.concat(res.orders)
      const end = tool.length(res.orders) < query.limit
      this.setState({orderList: orderList, end: end, isLoading: false})
    }, res => {
      this.setState({isLoading: false})
    }).catch(error => {
      this.setState({isLoading: false})
    })
  }

  onScrollBeginDrag = () => {
    this.setState({isCanLoadMore: true})
  }

  render() {
    const {orderList} = this.state
    return (
      <>
        {this.renderHeader()}
        <FlatList data={orderList}
                  renderItem={(item) => this.renderItem(item)}
                  initialNumToRender={2}
                  onRefresh={this.onRefresh}
                  refreshing={false}
                  onEndReachedThreshold={0.1}
                  onScrollBeginDrag={this.onScrollBeginDrag}
                  onEndReached={this.onEndReached}
                  ListEmptyComponent={this.renderNoOrder()}
                  keyExtractor={(item, index) => `${index}`}
        />
      </>
    );
  }

  onCancel = () => {
    this.setState({keyword: ''});
  }

  renderHeader = () => {
    let {keyword, check_item = 1} = this.state
    let list = [
      {label: '全部全部', value: 0},
      {label: '美团全部', value: 1},
      {label: '饿了么', value: 2},
      {label: '京东到家', value: 3},
      {label: '自定义', value: 4},
      {label: '京东到家', value: 4},
    ];
    return (
      <View style={{backgroundColor: colors.white}}>
        <View style={{flexDirection: "row", alignItems: "center", padding: 10}}>
          <SearchBar
            inputStyle={{fontSize: 14, color: colors.color333}}
            leftIconContainerStyle={{
              width: 20,
              height: 20
            }}
            searchIcon={<SvgXml xml={search_icon()}/>}
            clearIcon={<SvgXml xml={cross_circle_icon()}/>}
            inputContainerStyle={{
              backgroundColor: colors.f5,
              height: 32,
              borderRadius: 16,
              borderWidth: 0
            }}
            containerStyle={{
              flex: 1,
              padding: 0,
              margin: 0,
              height: 31,
              borderRadius: 16
            }}
            lightTheme={'true'}
            placeholder="请输入关键词进行搜索"
            onChangeText={(keyword) => {
              this.setState({
                keyword
              }, () => {
                tool.debounces(() => {
                  // this.fetchAddressBook()
                })
              })
            }}
            onCancel={this.onCancel}
            value={keyword}
          />
          <Text onPress={() => this.onCancel()}
                style={{textAlign: 'center', width: 52, fontSize: 14, color: colors.main_color}}> 搜索 </Text>
        </View>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 9,
          paddingTop: 3,
          paddingHorizontal: 8,
          justifyContent: "flex-start",
          flexWrap: "wrap"
        }}>
          <For index='index' each='info' of={list}>
            <TouchableOpacity onPress={() => {
              console.log(info, '12')
            }} key={index} style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 36,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginTop: 6,
              marginHorizontal: 4,
              borderRadius: 15,
              backgroundColor: Number(info.value) === check_item ? '#DFFAE2' : colors.f5,
            }}>
              <Text style={{
                fontSize: 13,
                color: Number(info.value) === check_item ? colors.main_color : colors.color666,
              }}> {info.label} </Text>
            </TouchableOpacity>
          </For>
        </View>
      </View>
    )
  }


  renderItem(order) {
    const {item, index} = order;
    const {global, navigation} = this.props
    const {accessToken} = global
    return (
      <OrderListItem showBtn={false}
                     item={item}
                     index={index}
                     accessToken={accessToken}
                     key={index}
                     onRefresh={() => this.onRefresh()}
                     navigation={navigation}
                     vendorId={global?.vendor_id}
                     setState={this.setState.bind(this)}
                     allow_edit_ship_rule={false}
                     onPress={this.onPress.bind(this)}
      />
    );
  }

  renderNoOrder = () => {
    let {keyword, isLoading} = this.state;
    return (
      <View style={styles.noOrderContent}>
        <SvgXml style={{marginBottom: 10}} xml={empty_order()}/>

        <If condition={tool.length(keyword) > 0 && !isLoading}>
          <Text style={styles.noOrderDesc}> 未查询到订单 </Text>
          <Text style={styles.noOrderDesc}> 目前只支持查询近90天内订单查询 </Text>
        </If>

        <If condition={tool.length(keyword) <= 0 && !isLoading}>
          <Text style={styles.noOrderDesc}> 搜索支持如下类型关键词 </Text>
          <Text style={styles.noOrderDesc}> 订单号、流水号、手机号及尾号后4位； </Text>
          <Text style={styles.noOrderDesc}> 骑手姓名、商品名、收件地址等 </Text>
        </If>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 86,
  },
  noOrderDesc: {flex: 1, fontSize: 15, color: colors.color999, lineHeight: 21},
});


export default connect(mapStateToProps, mapDispatchToProps)(SearchOrder)
