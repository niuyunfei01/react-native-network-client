import React, {PureComponent} from "react";
import {Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import Config from "../../../pubilc/common/config";
import {MixpanelInstance} from "../../../pubilc/util/analytics";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
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

class ComesBack extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      msg: "美团外卖对“配送信息上传”行为进行规范，自然日有效配送信息上传率<90%的商家 ，美团将对门店”置休管控“",
      list: [],
      isRefreshing: false,
    }
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('配送回传页')
  }

  fetchData = () => {
    this.setState({isRefreshing: true})
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/delivery_sync_log/list?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then(res => {
      this.setState({
        list: res.list,
        isRefreshing: false,
        msg: res.notice
      })
    })
  }

  render() {
    let {msg, isRefreshing} = this.state
    return (
      <View style={{flex: 1, backgroundColor: colors.background}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => this.fetchData()}
            tintColor="gray"
          />
        }>
          <View
            style={{flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 9}}>
            <FontAwesome
              name="exclamation-circle"
              style={{fontSize: 16, color: "red", marginRight: 5,}}
            />
            <Text style={{fontSize: 10, color: colors.color999}}> {msg} </Text>
          </View>
          <View style={{paddingHorizontal: 10}}>
            {this.renderList()}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderList = () => {
    const {currStoreId} = this.props.global
    let {list} = this.state
    return (
      <For of={list} each='item' index='key'>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate(Config.ROUTE_COMES_BACK_INFO, {
            store_id: currStoreId,
            ext_store_id: item.ext_store_id
          });
          this.mixpanel.track('配送回传页_查看详情')
        }} style={{
          backgroundColor: colors.white, borderRadius: 8,
          paddingVertical: 9,
          paddingHorizontal: 6,
          flexDirection: 'row',
          marginTop: 12,
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
              <Text style={{fontSize: 14, color: colors.color333}}>{item.ext_store_name} </Text>
              <Text style={{fontSize: 14, color: colors.color333, marginTop: 17}}>
                <Text style={{fontSize: 12, color: colors.color333}}>今日回传： </Text>
                <Text style={{fontSize: 14, color: item.today_sync_color}}>{item.today_sync_rate}% </Text>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Text style={{fontSize: 12, color: colors.color333}}>昨日回传：</Text>
                <Text style={{fontSize: 14, color: item.yesterday_sync_color}}>{item.yesterday_sync_rate}% </Text>
              </Text>
            </View>
          </View>
          <Entypo name='chevron-thin-right' style={{fontSize: 24, color: colors.color999}}/>
        </TouchableOpacity>
      </For>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComesBack)
