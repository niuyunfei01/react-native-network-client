import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import Icon from "react-native-vector-icons/FontAwesome";
import pxToEm from "../../../pubilc/util/pxToEm";
import {List} from '@ant-design/react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";

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

class SeparatedExpenseInfo extends PureComponent {
  constructor(props: Object) {
    super(props);
    this.state = {
      records: [],
      by_labels: [],
      data_labels: [],
      platform_labels: [],
      show_pay_notice: false
    }

    let wsbShowBtn = props.route.params.showBtn && props.route.params.showBtn === 1
    wsbShowBtn && this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}>
          <View style={{
            width: pxToDp(96),
            height: pxToDp(46),
            backgroundColor: colors.main_color,
            marginRight: 8,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 充值 </Text>
          </View>
        </TouchableOpacity>
      )
    })
  }

  onItemAccountStyle(item) {
    return item.sa === 1 ? (item.amount > 0 ? style.saAmountAddStyle : style.saAmountStyle) : {};
  }

  UNSAFE_componentWillMount() {
    this.fetchExpenses()
  }

  onItemClicked(item) {
    if (item.wm_id) {
      this.props.navigation.navigate(Config.ROUTE_ORDER_NEW, {orderId: item.wm_id});
    }
  }

  fetchExpenses() {
    showModal("加载中...")
    const self = this;
    const {global} = self.props;
    const url = `api/new_store_separated_items/${global.currStoreId}/${self.props.route.params.day}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({
        records: res.records,
        by_labels: res.by_labels,
        data_labels: res.data_labels,
        platform_labels: res.platform_labels,
        show_pay_notice: res.show_pay_notice
      })
    }).catch(() => {
      ToastLong("请求失败，请稍后再试")
      hideModal()
      this.props.navigation.goBack()
    })

  }

  render() {
    const {records} = this.state;
    if (records) hideModal()
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{flex: 1, backgroundColor: '#f5f5f9'}}>
        <List style={{width: "100%"}}
              renderHeader={() => {
                return <If condition={this.state.show_pay_notice}>
                  <View style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: 'center',
                    width: "100%",
                    height: 40,
                    backgroundColor: "#f7f7f7"
                  }}>
                    <Text style={{paddingLeft: '5%', width: '93%', fontSize: pxToDp(20),}}>
                      <Icon name="question-circle" style={{fontSize: pxToEm(30), color: "red"}}/>
                      &nbsp;&nbsp;美团众包在平台扣费，外送帮不收费，只做扣费记录，方便查看
                    </Text>
                  </View>
                </If>
              }}
        >
          {records.map((item, idx) => {
            return <List.Item arrow="horizontal"
                              key={idx}
                              multipleLine
                              onClick={() => this.onItemClicked(item)}
                              extra={
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  <If condition={item.by === '-1-0'}>
                                    <Text style={[{textAlign: 'right', marginLeft: 'auto', color: 'black'}]}>
                                      {`${item.amount > 0 && '+' || ''}${item.amount}`}
                                    </Text>
                                    <List.Item.Brief style={{textAlign: 'right'}}>
                                      <Text style={{color: 'black'}}>{this.state.by_labels[item.by]} </Text>
                                    </List.Item.Brief>
                                  </If>

                                  <If condition={item.by !== '-1-0'}>
                                    <Text style={[{
                                      textAlign: 'right',
                                      marginLeft: 'auto',
                                      fontWeight: "bold"
                                    }, this.onItemAccountStyle(item)]}>
                                      {`${item.amount > 0 && '+' || ''}${item.amount}`}
                                    </Text>
                                    <Text style={[this.onItemAccountStyle(item), {
                                      color: colors.color999,
                                      fontSize: 13,
                                      textAlign: 'right'
                                    }]}>
                                      余额：{item.left_balance}
                                    </Text>
                                  </If>
                                </View>}>
              <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                <Text style={{color: colors.color333, fontWeight: "bold"}}>{this.state.data_labels[item.wm_id]}</Text>
                <Text style={{color: colors.color333, marginLeft: 10, fontWeight: "bold"}}>
                  {item.name}({this.state.platform_labels[item.wm_id]})
                </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                <Text style={{color: colors.color999, marginRight: 14}}>
                  {item.hm}
                </Text>
                <Text style={[this.onItemAccountStyle(item), {fontSize: 13}]}>
                  {this.state.by_labels[item.by]}
                </Text>
              </View>
            </List.Item>
          })}
        </List>
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  saAmountStyle: {
    color: colors.orange,
  },
  saAmountAddStyle: {
    color: colors.main_vice_color,
  },
  right_btn: {
    fontSize: pxToDp(40),
    textAlign: "center",
    color: colors.main_color
  },
  chevron_right: {
    position: "absolute",
    right: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    width: pxToDp(60),
    height: pxToDp(140)
  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28)
  },
  success: {
    color: colors.main_color,
    borderColor: colors.main_color
  },
  warn: {
    color: colors.orange,
    borderColor: colors.orange
  },
  detailBox: {
    padding: pxToDp(40),
    backgroundColor: '#fff'
  },
  remarkBox: {
    flexDirection: 'row'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpenseInfo);
