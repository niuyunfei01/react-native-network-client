//import liraries
import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import native from '../../pubilc/util/native';
import Config from "../../pubilc/common/config";
import ModalSelector from "react-native-modal-selector";
import HttpUtils from "../../pubilc/util/http";
import {SearchBar} from "../../weui";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {getTime} from "../../pubilc/util/TimeUtil";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";

function mapStateToProps(state) {
  const {mine, user, global, device} = state;
  return {mine: mine, user: user, global: global, device: device}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}//记录耗时的对象
class OrderSearchScene extends PureComponent {
  constructor(props: Object) {
    super(props);
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    this.state = {
      isRefreshing: false,
      isSearching: false,
      prefix: [],
      selectPrefix: {}
    };
  }

  componentDidMount() {
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ""
    timeObj.method[0].methodName = "componentDidMount"
    const {deviceInfo} = this.props.device
    const {currStoreId, currentUser, assessToken, config} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderSearchScene"
    timeObj['is_record_request_monitor'] = config.is_record_request_monitor
    calcMs(timeObj, assessToken)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (timeObj.method.length > 0) {
      const endTime = getTime()
      const startTime = timeObj.method[0].startTime
      timeObj.method.push({
        interfaceName: '',
        executeStatus: 'success',
        startTime: startTime,
        endTime: endTime,
        methodName: 'componentDidUpdate',
        executeTime: endTime - startTime
      })
      const duplicateObj = {...timeObj}
      timeObj.method = []
      calcMs(duplicateObj, this.props.global.accessToken)
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchOrderSearchPrefix()
  }

  fetchOrderSearchPrefix() {
    const accessToken = this.props.global.accessToken
    const api = `/api/order_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      timeObj.method.push({
        interfaceName: api,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchOrderSearchPrefix',
        executeTime: res.endTime - res.startTime
      })
      this.setState({prefix: res.obj, selectPrefix: res.obj[0]})

    })
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onSearch = (search) => {
    search = this.state.selectPrefix.value + search
    const {navigation} = this.props
    navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {term: search})
  };

  onPress(route, params = {}) {
    let _this = this;

    if (route === Config.ROUTE_ORDER_INVALID) {
      native.ordersInvalid();
      return;
    } else if (route === Config.ROUTE_ORDER_SERIOUS_DELAY) {
      native.ordersSeriousDelay();
      return;
    } else if (route === Config.ROUTE_ORDER_PEND_PAYMENT) {
      this.onSearch("paid:offline");
    } else if (route === 'to_revisit:') {
      this.onSearch("to_revisit:");
    }

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  onSelectPrefix(item) {
    const self = this
    this.setState({selectPrefix: item})
    const accessToken = self.props.global.accessToken
    const uri = `/api/last_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri, {key: item.key})
  }

  renderSearchBarPrefix() {
    return (
      <ModalSelector
        data={this.state.prefix}
        onChange={(item) => this.onSelectPrefix(item)}
        cancelText={'取消'}
      >
        <View style={styles.searchBarPrefix}>
          <Text style={{fontSize: 12, fontWeight: 'bold'}}>
            {this.state.selectPrefix.label}
          </Text>
          <FontAwesome5 name={'sort-down'} style={{fontSize: 15, color: colors.title_color}}/>
        </View>
      </ModalSelector>
    )
  }

  render() {
    return (
      <ScrollView
        // refreshControl={
        //   <RefreshControl
        //     refreshing={this.state.isRefreshing}
        //     onRefresh={() => this.onHeaderRefresh()}
        //     tintColor='gray'
        //   />
        // }
        style={{backgroundColor: colors.main_back}}
      >
        <SearchBar
          placeholder="序号/编号/收货手机姓名/地址/备注/发票/商品"
          onBlurSearch={this.onSearch.bind(this)}
          lang={{cancel: '搜索'}}
          prefix={this.renderSearchBarPrefix()}
        />
        <View style={styles.label_box}>
          <Text style={styles.alert_msg}>
            点击标签直接搜索
          </Text>
          <View style={styles.label_view}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress(Config.ROUTE_ORDER_INVALID)}>
              <Text style={styles.label_style}>无效订单 </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress(Config.ROUTE_ORDER_SERIOUS_DELAY)}>
              <Text style={styles.label_style}>严重延误 </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress(Config.ROUTE_ORDER_PEND_PAYMENT)}>
              <Text style={styles.label_style}>需收款 </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress('to_revisit:')}>
              <Text style={styles.label_style}>待回访 </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    );
  }

}


const styles = StyleSheet.create({
  label_box: {
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
  },
  alert_msg: {
    paddingHorizontal: pxToDp(5),
    paddingVertical: pxToDp(10),
    fontSize: pxToDp(28),
    color: colors.color999,
  },
  label_view: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label_style: {
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: pxToDp(1),
    borderColor: colors.color999,
    margin: pxToDp(10),
    borderRadius: 13,
    paddingVertical: pxToDp(8),
    paddingHorizontal: pxToDp(20),
  },
  searchBarPrefix: {
    flexDirection: 'row',
    width: pxToDp(140),
    flex: 1,
    position: 'relative',
    alignItems: 'center'
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(OrderSearchScene)
