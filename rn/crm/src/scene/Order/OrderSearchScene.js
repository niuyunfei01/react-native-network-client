//import liraries
import React, {PureComponent} from 'react'
import {Image, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import Toast from "../../weui/Toast/Toast";
import SearchBar from "../../weui/SearchBar/SearchBar";
import {native} from '../../common';
import Config from "../../config";
import ModalSelector from "react-native-modal-selector";
import HttpUtils from "../../util/http";


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

class OrderSearchScene extends PureComponent {
  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
      isSearching: false,
      prefix: [],
      selectPrefix: {}
    };
  }

  componentDidMount() {
  }

 UNSAFE_componentWillMount() {
    this.fetchOrderSearchPrefix()
  }
  
  fetchOrderSearchPrefix () {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api/order_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      self.setState({prefix: res, selectPrefix: res[0]})
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
  
  onSelectPrefix (item) {
    const self = this
    this.setState({selectPrefix: item})
    const accessToken = self.props.global.accessToken
    const uri = `/api/last_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri, {key: item.key})
  }
  
  renderSearchBarPrefix () {
    console.log("prefix list:", this.state.prefix)
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
          <Image
            source={require('../../img/triangle_down.png')}
            style={{width: 15, height: 15, marginTop: 2}}
          />
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
              <Text style={styles.label_style}>无效订单</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress(Config.ROUTE_ORDER_SERIOUS_DELAY)}>
              <Text style={styles.label_style}>严重延误</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress(Config.ROUTE_ORDER_PEND_PAYMENT)}>
              <Text style={styles.label_style}>需收款</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.onPress('to_revisit:')}>
              <Text style={styles.label_style}>待回访</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Toast
          icon="loading"
          show={this.state.isSearching}
          onRequestClose={() => {
          }}
        >提交中</Toast>
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
