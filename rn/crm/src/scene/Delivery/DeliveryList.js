import React, {PureComponent} from "react";
import {Image, InteractionManager, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {Provider} from "@ant-design/react-native";
import {hideModal, showModal} from "../../util/ToastUtils";
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import Styles from "../../themes/Styles";
import Metrics from "../../themes/Metrics";
import tool from "../../common/tool";
import Icon from "react-native-vector-icons/Entypo";
import config from "../../config";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
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

class DeliveryList extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      show_type: 1,
      platform_delivery_list: [],
      master_delivery_list: [],
      msg: [
        '阿里旗下开放即时配送平台',
        '为饿了么平台的商户提供即时配送'
      ],

    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {
  }

  fetchData() {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/api/get_store_business_status/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then((res) => {
      console.log(res, 'res')
      this.setState({
        platform_delivery_list: res.business_status,
        master_delivery_list: res.business_status
      })
      hideModal()
    }).catch(() => {
      hideModal()
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  renderHeader() {
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.fontColor,
      }}>
        <Text
          onPress={() => {
            this.setState({
              show_type: 1,
            })
          }}
          style={this.state.show_type === 1 ? [style.header_text] : [style.header_text, style.check_staus]}>外送帮自带</Text>
        <Text
          onPress={() => {
            this.setState({
              show_type: 2,
            })
          }}
          style={this.state.show_type !== 1 ? [style.header_text] : [style.header_text, style.check_staus]}>商家自有</Text>
      </View>
    )
  }

  rendermsg(type = []) {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
          <Text style={{
            color: '#595959',
            fontSize: pxToDp(20)
          }}>{msg}</Text>
        </View>)
      }
    }
    return (
      <View style={{flex: 1}}>
        {items}
      </View>
    )
  }

  renderItem(info) {
    return (
      <View style={[Styles.between, {
        paddingTop: pxToDp(14),
        paddingBottom: pxToDp(14),
        borderTopWidth: Metrics.one,
        borderTopColor: colors.colorDDD,
        backgroundColor: colors.white
      }]}>
        <Image style={[style.img]} source={require(`../../img/PlatformLogo/pl_store_eleme.png`)}/>
        <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginRight: pxToDp(20)
          }}>
            <Text style={{
              fontSize: pxToDp(34),
              fontWeight: "bold",
              color: colors.listTitleColor
            }}>蜂鸟众包</Text>
          </View>

          <View style={{marginTop: pxToDp(10)}}>
            {this.rendermsg(this.state.msg)}

          </View>
        </View>


        <If condition={info.platform === '1'}>
          <Text style={[style.status_err]}>去授权</Text>
        </If>

        <If condition={info.platform === '6'}>
          <View style={{
            width: pxToDp(120),
            marginRight: pxToDp(30),
            flexDirection: 'row'
          }}>
            <Text
              onPress={() => {
                this.onPress(config.ROUTE_DELIVERY_INFO, {id: info.id})
              }}
              style={{
                height: 30,
                color: colors.main_color,
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                textAlignVertical: 'center',
                ...Platform.select({
                  ios: {
                    lineHeight: 30,
                  },
                  android: {}
                }),
              }}>已绑定</Text>
            <Icon name='chevron-thin-right' style={{
              color: colors.main_color,
              fontSize: pxToDp(40),
              paddingTop: pxToDp(7),
              marginLeft: pxToDp(10),
            }}/>
          </View>
        </If>


        <If condition={info.platform === '9'}>
          <View style={{
            width: pxToDp(120),
            marginRight: pxToDp(30),
            flexDirection: 'row'
          }}>
            <Text
              onPress={() => {
                this.onPress(config.ROUTE_DELIVERY_INFO, {id: info.id})
              }}
              style={{
                height: 30,
                color: "#EE2626",
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                textAlignVertical: 'center',
                ...Platform.select({
                  ios: {
                    lineHeight: 30,
                  },
                  android: {}
                }),
              }}>已停用</Text>
            <Icon name='chevron-thin-right' style={{
              color: "#EE2626",
              fontSize: pxToDp(40),
              paddingTop: pxToDp(7),
              marginLeft: pxToDp(10),
            }}/>
          </View>
        </If>
      </View>
    )
  }

  renderList(type = 1) {
    const List = type === 1 ? this.state.platform_delivery_list : this.state.master_delivery_list;
    let items = []
    for (let i in List) {
      const info = List[i]
      items.push(
        <TouchableOpacity
          style={{
            borderBottomWidth: pxToDp(1),
            borderBottomColor: colors.fontGray,
            marginLeft: pxToDp(10),
            marginRight: pxToDp(10),
          }}
          onPress={() => {
          }}>
          {this.renderItem(info)}
        </TouchableOpacity>)
    }
    return (
      <ScrollView style={{
        flex: 1,
        margin: pxToDp(20),
        borderRadius: pxToDp(10),
        backgroundColor: colors.white
      }}>
        {items}
      </ScrollView>
    )
  }

  render() {
    return (<Provider>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <View style={{flex: 1}}>
          {this.renderHeader()}
          {this.renderList(this.state.show_type)}
        </View>
      </Provider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList)

const style = StyleSheet.create({
  header_text: {
    height: 40,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 40,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color,
  },

  img: {
    width: pxToDp(108),
    height: pxToDp(108),
    marginLeft: pxToDp(20),
    marginRight: pxToDp(20),
  },

  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    padding: pxToDp(10),
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    marginRight: pxToDp(20),
    textAlign: 'center',
    width: pxToDp(130),
    color: colors.f7,
  },

})
