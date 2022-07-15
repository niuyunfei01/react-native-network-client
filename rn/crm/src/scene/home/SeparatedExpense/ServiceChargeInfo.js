import React, {PureComponent} from 'react'
import {ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {List} from '@ant-design/react-native';
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

class ServiceChargeInfo extends PureComponent {
  constructor(props: Object) {
    super(props);
    this.state = {
      records: [],
      by_labels: [],
      date_labels: [],
      platform_labels: [],
      show_pay_notice: false
    }
  }

  UNSAFE_componentWillMount() {
    this.fetch_list()
  }

  fetch_list = () => {
    const self = this;
    const {global} = self.props;
    const url = `/v1/new_api/delivery/service_fee_detail?access_token=${global.accessToken}`;
    HttpUtils.post.bind(this.props)(url, {
      store_id: global.currStoreId,
      date: self.props.route.params.day
    }).then(res => {
      console.log(res, 'res')
      self.setState({
        records: res.records,
        by_labels: res.by_labels,
        date_labels: res.date_labels,
        platform_labels: res.platform_labels,
        show_pay_notice: res.show_pay_notice
      })
    })
  }
  onItemClicked = (item) => {
    if (item.wm_id) {
      this.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: item.wm_id});
    }
  }
  onServiceDesc = () => {
    this.props.navigation.navigate(Config.ROUTE_SERVICE_CHARGE_DESC);
  }

  render() {
    const {records} = this.state;
    return (
      <ScrollView style={{flex: 1, backgroundColor: colors.background}}>
        <List style={{width: "100%"}}
              renderHeader={() => {
                return (
                  <TouchableOpacity onPress={() => this.onServiceDesc()} style={{
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    alignItems: 'center',
                    width: "100%",
                    height: 40,
                    backgroundColor: colors.white
                  }}>
                    <Text style={{
                      paddingLeft: '5%',
                      fontSize: 12,
                    }}>
                      <FontAwesome
                        name="exclamation-circle"
                        style={{fontSize: 16, color: "red"}}
                      />
                      &nbsp;&nbsp;使用商家自有账号发单收取服务费 </Text>
                    <Text style={{fontSize: 12, color: colors.main_color}}>了解详情&nbsp;&nbsp;&nbsp;&nbsp; </Text>
                  </TouchableOpacity>)
              }}
        >
          <View style={{paddingVertical: 12, paddingHorizontal: 10, backgroundColor: colors.background}}>
            {records.map((item, idx) => {
              return <List.Item arrow="horizontal"
                                style={{borderRadius: 4,}}
                                key={idx}
                                multipleLine
                                onClick={() => this.onItemClicked(item)}
                                extra={
                                  <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                  }}>
                                    <If condition={item.by === '-1-0'}>
                                      <Text style={[{
                                        textAlign: 'right',
                                        marginLeft: 'auto',
                                        color: 'black'
                                      }]}>{`${item.amount > 0 && '+' || ''}${item.amount}`}
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
                                      }]}>{`${item.amount > 0 && '+' || ''}${item.amount}`}
                                      </Text>
                                    </If>
                                  </View>}>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 5,
                }}>
                  <Text style={{
                    color: colors.color333,
                    fontSize: 14,
                    fontWeight: "bold"
                  }}>{this.state.date_labels[item.wm_id]}</Text>
                  <Text style={{
                    color: colors.color333,
                    fontSize: 14,
                    marginLeft: 10,
                  }}>{item.name}({this.state.platform_labels[item.wm_id]}) </Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                  <Text
                    style={{color: colors.color999, marginRight: 14, fontSize: 12}}>{item.hm} </Text>
                  <Text
                    style={[{color: colors.color999, fontSize: 12}]}>{this.state.by_labels[item.by]} </Text>
                </View>
              </List.Item>
            })}
          </View>
        </List>
      </ScrollView>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ServiceChargeInfo);
