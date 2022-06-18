import React, {PureComponent} from "react";
import ReactNative, {InteractionManager, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";

import pxToDp from "../../../pubilc/util/pxToDp";
import Config from "../../../pubilc/common/config";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../../../pubilc/util/http";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";

const {StyleSheet} = ReactNative

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
        {
          ...globalActions
        },
        dispatch
    )
  };
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

class HistoryNoticeScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      historyAdviceList: [],
      page: 1,
      pageSize: 20,
      title: '',
      detailContent: ''
    };
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  componentDidMount() {
    this.fetchHistoryAdvicesList()
  }

  // 请求历史公告
  fetchHistoryAdvicesList = () => {
    showModal('加载中')
    const {accessToken} = this.props.global;
    const api = `/v1/new_api/advice/getHistoryAdvices`
    HttpUtils.get.bind(this.props)(api, {
      page: 1,
      pageSize: 20,
      title: '',
      store_id: '',
      vendor_id: '',
      access_token: accessToken
    }).then((res) => {
      hideModal()
      this.setState({
        historyAdviceList: res
      })
    })
  }

  // 去公告详情页面
  toDetail = (info) => {
    this.onPress(Config.ROUTE_DETAIL_NOTICE, {
      content: info
    })
  }

  render() {
    return (
        <ScrollView style={Styles.scrollStyle}>
          <FetchView navigation={this.props.navigation} onRefresh={this.fetchHistoryAdvicesList.bind(this)}/>
          {this.renderHistoryAdvicesList()}
        </ScrollView>
    );
  }

  cutAdvicesContent = (val) => {
    let str = val
    if (str.length > 30) {
      str = str.substr(0, 30) + '.....'
    }
    return str
  }

  renderHistoryAdvicesList = () => {
    let {historyAdviceList} = this.state
    return (
        <For each='info' index="i" of={historyAdviceList}>
          <TouchableOpacity onPress={() => this.toDetail(info)} style={Styles.advicesListContainer} key={i}>
            <View style={Styles.advicesListTitle}>
              <Text style={Styles.advicesListTitleText}>{info.title}</Text>
              <View style={Styles.flex1}/>
              <Entypo name={"chevron-thin-right"} style={Styles.advicesListTitleIcon}/>
            </View>

            <View style={Styles.advicesListItem}>
              <If condition={!info.is_read}>
                <View style={{backgroundColor: '#F72D2D', width: 15, height: 15, borderRadius: 15, position: "absolute", top: 13, left: 85}}/>
              </If>
              <Text style={Styles.advicesListItemTime}>{info.created_format} </Text>
              <View style={Styles.advicesListItemBody}>
                <Text style={Styles.advicesListItemContent} numberOfLines={2} ellipsizeMode={'clip'}>{this.cutAdvicesContent(info.content)} </Text>
              </View>
            </View>
          </TouchableOpacity>
        </For>
    )
  }

}

const Styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background
  },
  advicesListContainer: {
    backgroundColor: colors.white,
    padding: 10, borderRadius: 8,
    marginBottom: pxToDp(20)
  },
  advicesListTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: pxToDp(10),
    marginLeft: pxToDp(10)
  },
  advicesListTitleText: {
    color: colors.color333,
    fontWeight: 'bold', fontSize: 18
  },
  advicesListTitleIcon: {
    fontSize: 14,
    color: colors.color999
  },
  advicesListItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    borderTopWidth: pxToDp(1),
    borderColor: colors.colorEEE,
    padding: 10
  },
  advicesListItemTime: {
    color: colors.color666,
    fontWeight: "400",
    fontSize: 14,
    marginBottom: 10,
    marginTop: 5
  },
  advicesListItemContent: {
    color: colors.color999,
    fontSize: 18,
    flexWrap: 'wrap'
  },
  advicesListItemBody: {
    backgroundColor: '#F7F7F7',
    width: '100%',
    borderRadius: pxToDp(10),
    padding: 10
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HistoryNoticeScene);
