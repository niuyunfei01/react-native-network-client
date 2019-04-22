//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Toast from "../../weui/Toast/Toast";
import SearchBar from "../../weui/SearchBar/SearchBar";
import {native} from '../../common';
import NavigationItem from "../../widget/NavigationItem";
import Config from "../../config";


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
  static navigationOptions = {title: 'orderSearch', header: null};

  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
      isSearching: false,
    };
  }

  componentDidMount() {
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onSearch = (search) => {
    console.log('search -> ', search);
    native.ordersSearch(search)
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
    }

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
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
});


export default connect(mapStateToProps, mapDispatchToProps)(OrderSearchScene)
