import React from 'react'
import ReactNative, {Image} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions'
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import HttpUtils from "../../../pubilc/util/http";
import OrderListItem from "../../../pubilc/component/OrderListItem";
import {hideModal, showError, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";

const {
  FlatList,
  Text,
  InteractionManager,
  View,
  SafeAreaView
} = ReactNative;
const {PureComponent} = React;

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

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class OrderQueryResultScene extends PureComponent {
  constructor(props) {
    super(props);
    const {navigation, route} = this.props
    if (route.params.ext_store_id === undefined || !route.params.ext_store_id) {
      navigation.back();
      return showError("参数错误");
    }
    this.state = {
      isLoading: false,
      end: false,
      query: {
        page: 1,
        limit: 10,
        maxPastDays: 20,
      },
      orders: [],
      ext_store_name: '美团外卖店铺',
      today_sync_rate: 90,
      yesterday_sync_rate: 90,
      failed: 0,
      today_sync_color: "",
      yesterday_sync_color: "",
    };
    this.renderItem = this.renderItem.bind(this);
  }

  fetchInfo = () => {
    const {accessToken, currStoreId} = this.props.global;
    const params = {
      store_id: currStoreId,
      ext_store_id: this.props.route.params.ext_store_id,
    }
    let url = `/v1/new_api/delivery_sync_log/detail?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url, params).then(res => {
      this.setState({
        ext_store_name: res.ext_store_name,
        today_sync_rate: res.today_sync_rate,
        yesterday_sync_rate: res.yesterday_sync_rate,
        today_sync_color: res.today_sync_color,
        yesterday_sync_color: res.yesterday_sync_color,
        failed: res.today ? res.today.failed : 0,
      })
    })
  }


  fetchOrders = () => {
    showModal("加载中")
    this.setState({isLoading: true})
    const {accessToken, currStoreId} = this.props.global;
    let {query} = this.state;
    const params = {
      store_id: currStoreId,
      ext_store_id: this.props.route.params.ext_store_id,
      page: query.page,
      page_size: query.limit,
    }
    let url = `/v1/new_api/delivery_sync_log/failed_orders?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url, params).then(res => {
      hideModal()
      if (tool.length(res.orders) < this.state.query.limit) {
        this.setState({
          end: true,
        })
      }
      let orders = this.state.orders.concat(res.orders)
      this.setState({
        orders: orders,
        isLoading: false,
      })
    }).catch((res) => {
      showError('获取失败：' + res.desc)
    })
  }


  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        end: false,
        query: query,
        orders: []
      }, () => {
        this.fetchOrders()
        this.fetchInfo()
      })
    }, 600)
  }

  onEndReached = () => {
    const query = this.state.query;
    if (this.state.end) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.fetchOrders()
    })
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: colors.back_color}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this)}/>
        {this.renderHeader()}
        {this.renderContent()}
      </View>
    );
  }

  renderHeader = () => {
    let {
      today_sync_rate,
      yesterday_sync_rate,
      ext_store_name,
      failed,
      today_sync_color,
      yesterday_sync_color,
    } = this.state
    return (
      <View>
        <View style={{
          backgroundColor: colors.white,
          paddingVertical: 9,
          paddingHorizontal: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
          }}>
            <Image style={{
              width: 60,
              height: 60,
            }} source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/platformLogo/2.png'}}/>
            <View style={{marginLeft: 15, marginTop: 4}}>
              <Text style={{fontSize: 14, color: colors.color333}}>{ext_store_name} </Text>
              <Text style={{fontSize: 14, color: colors.color333, marginTop: 17}}>
                <Text style={{fontSize: 12, color: colors.color333}}>今日回传： </Text>
                <Text style={{fontSize: 14, color: today_sync_color}}>{today_sync_rate}% </Text>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Text style={{fontSize: 12, color: colors.color333}}>昨日回传：</Text>
                <Text style={{fontSize: 14, color: yesterday_sync_color}}>{yesterday_sync_rate}% </Text>
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{backgroundColor: colors.white, marginTop: 9, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontSize: 14, color: colors.color333, marginVertical: 12}}>失败({failed}) </Text>
          <View style={{backgroundColor: colors.main_color, width: 46, height: 4, borderRadius: 2}}/>
        </View>
      </View>
    )
  }

  renderItem = (order) => {
    let {item, index} = order;
    return (
      <OrderListItem showBtn={false} comesBackBtn={true}
                     fetchData={() => this.onSearch('', false)}
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

  renderContent = () => {
    const orders = this.state.orders || []
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
          keyExtractor={(item, index) => `${index}`}
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
                  没有数据
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

}

export default connect(mapStateToProps, mapDispatchToProps)(OrderQueryResultScene)
