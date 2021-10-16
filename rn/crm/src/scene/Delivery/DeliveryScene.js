import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {WingBlank} from '@ant-design/react-native'
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions"
import pxToDp from "../../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {hideModal, showError, showModal} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const customerOpacity = 0.6;
var ScreenWidth = Dimensions.get("window").width;


function FetchDeliveryData({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class DeliveryScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      menu: []
    };
    this.queryDeliveryList();
  }

  checkAlert(route, params = {}) {
    if (params !== {} && params.alert === true) {
      Alert.alert('绑定提示', params.alert_msg, [{
        text: '取消授权'
      }, {
        text: '开始授权',
        onPress: () => {
          this.onPress(route, params);
        }
      }])
    } else {
      this.onPress(route, params);
    }
  }


  queryDeliveryList() {
    let {accessToken} = this.props.global
    showModal("加载中");
    HttpUtils.get.bind(this.props)(`/v1/new_api/Delivery/index`, {access_token: accessToken}).then(res => {
      this.setState({data: res.data, menu: res.menus});
      hideModal()
    })
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      if (route === '') {
        showError("当前版本不支持改配送")
      } else {
        this.props.navigation.navigate(route, params);
      }
    });
  }

  render() {
    let data = this.state.data ? this.state.data : [];
    let menu = this.state.menu ? this.state.menu : [];
    return (
      <ScrollView style={styles.container}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.isRefreshing}
                      onRefresh={() => this.queryDeliveryList()}
                      tintColor='gray'/>
                  }>
        {/*<FetchDeliveryData navigation={this.props.navigation} onRefresh={this.queryDeliveryList}/>*/}
        {data.length > 0 ? (
          <View>
            <WingBlank style={{marginTop: 20, marginBottom: 5,}}>
              <Text style={{marginBottom: 10}}>已绑定</Text>
            </WingBlank>
            <View style={[block_styles.container]}>
              {data.map(item => (
                <TouchableOpacity
                  style={[block_styles.block_box]}
                  onPress={() => {
                    showError("当前版本不能修改或删除")
                  }}
                  activeOpacity={customerOpacity}>
                  {
                    <Image
                      style={[block_styles.block_img]}
                      source={{uri: item.img}}
                    />
                  }
                  <Text style={[block_styles.block_name]}>{item.name}</Text>
                </TouchableOpacity>
              ))}

            </View>
          </View>
        ) : (<View>
        </View>)}
        <WingBlank style={{marginTop: 20, marginBottom: 5,}}>
          <Text style={{marginBottom: 10}}>未绑定</Text>
        </WingBlank>
        {menu.length > 0 ? (
          <View style={[block_styles.container]}>

            {menu.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[block_styles.block_box]}
                onPress={() => this.checkAlert(item.route, {...item})}
                activeOpacity={customerOpacity}>
                <Image
                  style={[block_styles.block_img]}
                  source={!!item.img
                    ? {uri: item.img}
                    : require("../../img/My/touxiang180x180_.png")}
                />
                <Text style={[block_styles.block_name]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (<View>
        </View>)}
      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
  fn_price_msg: {
    fontSize: pxToDp(30),
    color: "#333"
  },
  help_msg: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#00aeff"
  }
});

const block_styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(22),
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white
  },
  block_box: {
    //剩1个格子用正常样式占位
    // width: pxToDp(239),
    // height: pxToDp(188),
    width: ScreenWidth / 4,
    height: ScreenWidth / 4,
    backgroundColor: colors.white,

    // borderColor: colors.main_back,
    // borderWidth: pxToDp(1),
    alignItems: "center"
  },
  empty_box: {
    //剩2个格子用这个样式占位
    width: pxToDp(478),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.main_back,
    borderWidth: pxToDp(1),
    alignItems: "center"
  },
  block_img: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(16),
    width: pxToDp(60),
    height: pxToDp(60)
  },
  block_name: {
    color: colors.color666,
    fontSize: pxToDp(26),
    lineHeight: pxToDp(28),
    textAlign: "center"
  },
  notice_point: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15),
    backgroundColor: '#f00',
    position: 'absolute',
    right: pxToDp(60),
    top: pxToDp(20),
    zIndex: 99
  }
});
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(DeliveryScene);
