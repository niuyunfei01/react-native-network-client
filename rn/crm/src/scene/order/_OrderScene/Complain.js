import React from 'react'
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import Clipboard from '@react-native-community/clipboard';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import CallImg from "../CallImg";
import native from "../../../pubilc/util/native";
import tool from "../../../pubilc/util/tool";
import {showError, ToastShort} from "../../../pubilc/util/ToastUtils";
import config from "../../../pubilc/common/config";
import {MixpanelInstance} from "../../../pubilc/util/analytics";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class Complain extends React.Component {
  constructor(props) {
    super(props)
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("投诉页");
    this.state = {
      accessToken: this.props.global.accessToken,
      delivery_id: this.props.route.params.id,
      store_name: '',
      store_id: '',
      list: [],
      content: '',
      mobile: '',
      complain: [],
      way: 0,//  投诉信息的传参
    }
  }

  componentDidMount = () => {
    this.fetchData()
  }

  onHeaderRefresh = () => {
    this.fetchData()
  }

  fetchData = () => {
    const {accessToken, delivery_id} = this.state

    const {goBack} = this.props.navigation;
    HttpUtils.get.bind(this.props)(`/api/order_delivery_complain/${delivery_id}?access_token=${accessToken}`).then((res) => {

      if (tool.length(res) > 0) {
        this.setState({
          way: res.way,
          complain: res,
          store_name: res.header.store_name,
          store_id: res.header.store_id,
          list: res.header.list,
          content: res.content.compensate,
          mobile: res.content.mobile,
        });
      } else {
        showError('暂不支持');
        goBack()
      }
    })
  }

  onCopy = (text) => {
    Clipboard.setString(text)
    ToastShort("复制成功")
  }

  renderList = () => {
    let items = []
    let that = this;
    for (let i in this.state.list) {
      const item = that.state.list[i]
      items.push(
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
          <Text key={i} style={{
            fontSize: pxToDp(28),
            marginTop: pxToDp(25)
          }}>
            {item.name}：
          </Text>
          <Text key={i} style={{
            fontSize: pxToDp(28),
            marginTop: pxToDp(25),
            color: colors.main_color
          }} onPress={() => this.onCopy(item.val)}>
            {item.val}
          </Text>
        </View>
      )
    }
    return <View>
      {items}
    </View>
  }

  render() {
    return (
      <View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          }
          style={{backgroundColor: colors.main_back, flexGrow: 1}}
        >
          <TouchableOpacity onPress={() => {

            let url = config.apiUrl('help/delivery?type_id=' + this.state.way);
            this.props.navigation.navigate(config.ROUTE_WEB, {url: url, title: '投诉索赔指引'});
          }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              backgroundColor: '#f9edc9',
              height: pxToDp(80)
            }}>
              <Text style={{marginLeft: pxToDp(40)}}>提示：请在投诉或索赔前点击此处查看指引说明。</Text>
            </View>
          </TouchableOpacity>
          <View style={{
            padding: '4%',
            backgroundColor: colors.white,
            borderBottomWidth: pxToDp(1),
            borderBottomColor: colors.color999
          }}>
            <Text style={{fontSize: pxToDp(35)}}>店铺名称：{this.state.store_name} </Text>
            <View style={{flexDirection: "row"}}>
              <Text style={{
                fontSize: pxToDp(28),
                marginTop: pxToDp(25)
              }}>店铺ID：</Text>
              <Text style={{
                fontSize: pxToDp(28),
                color: colors.main_color,
                marginTop: pxToDp(25)
              }}>{this.state.store_id} </Text>
            </View>

            {this.renderList()}
          </View>
          <View style={{
            padding: '4%',
            backgroundColor: colors.white,
            borderBottomWidth: pxToDp(1),
            borderBottomColor: colors.color999
          }}>
            <Text style={{fontSize: pxToDp(35)}}>赔付标准:</Text>
            <Text style={{fontSize: pxToDp(25), marginTop: pxToDp(25)}}>{this.state.content} </Text>

            <TouchableOpacity onPress={() => {
              native.dialNumber(this.state.mobile);
            }} style={{fontSize: pxToDp(35), marginTop: pxToDp(25), flexDirection: 'row', alignItems: "center"}}>
              <Text style={{color: colors.color333}}>投诉电话:</Text>
              <Text style={{
                color: colors.main_color,
                marginLeft: pxToDp(20),
                marginRight: pxToDp(20)
              }}>{this.state.mobile} </Text>
              <Text style={{
                ...Platform.select({
                  ios: {
                    width: pxToDp(20),
                    height: pxToDp(28),
                    marginTop: pxToDp(8)
                  },
                  android: {
                    width: pxToDp(30),
                    height: pxToDp(38),
                    marginTop: pxToDp(0)
                  }
                }),
              }}><CallImg/></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Complain)
