import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Text, View,} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import Entypo from "react-native-vector-icons/Entypo";
import pxToEm from "../../../pubilc/util/pxToEm";
import {List} from '@ant-design/react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";

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
      list: [],
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchExpenses()
  }

  onItemClicked(item) {
    if (item.order_id) {
      this.props.navigation.navigate(Config.ROUTE_ORDER_NEW, {orderId: item.order_id});
    }
  }

  fetchExpenses() {
    const self = this;
    const {global} = self.props;
    const url = `/v1/new_api/bill/freeze_list/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        list: res
      })
    })
  }

  render() {
    const {list} = this.state;
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{flex: 1, backgroundColor: '#f5f5f9'}}>
        <List style={{width: "100%"}}
              renderHeader={() => {
                return (
                  <View style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: 'center',
                    width: "100%",
                    height: 40,
                    backgroundColor: "#f7f7f7"
                  }}>
                    <Text style={{
                      paddingLeft: '5%',
                      width: '93%',
                      fontSize: pxToDp(20),
                    }}>
                      <Entypo
                        name="info-with-circle"
                        style={{
                          fontSize: pxToEm(30),
                          color: "red"
                        }}
                      />
                      &nbsp;&nbsp;为防止余额不足造成无法发单，外送帮发起预扣款，骑手接单后、配送取消
                      后、订单取消后返还预扣款金额 </Text>
                  </View>)
              }}
        >
          {list.map((item, idx) => {
            return <List.Item arrow="horizontal"
                              key={idx}
                              multipleLine
                              onClick={() => this.onItemClicked(item)}
                              extra={
                                <View style={{flexDirection: 'row'}}>
                                  <Text style={[{
                                    textAlign: 'right',
                                    marginLeft: 'auto',
                                    fontWeight: "bold"
                                  }]}>{item.fee}
                                  </Text>
                                </View>}>
              <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                <Text style={{color: colors.color333, fontWeight: "bold"}}>{item.date} </Text>
                <Text style={{
                  color: colors.color333,
                  marginLeft: 10,
                  fontWeight: "bold"
                }}>{item.label} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                <Text
                  style={{color: colors.color999, marginRight: 14}}>{item.time} </Text>
                <Text style={[{fontSize: 13, color: colors.color333}]}>预扣款 </Text>
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
