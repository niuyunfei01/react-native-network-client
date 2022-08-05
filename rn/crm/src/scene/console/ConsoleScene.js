import React, {PureComponent} from "react";
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import config from "../../pubilc/common/config";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Config from "../../pubilc/common/config";
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import {showError} from "../../pubilc/util/ToastUtils";
import {format} from "../../pubilc/util/TimeUtil";

const BUTTON_LIST = [
  {
    title: '拣货任务',
    iconName: 'list-alt',
    routeName: config.ROUTE_CONSOLE_STOCKING_TASKS
  },
  {
    title: '员工打卡',
    iconName: 'check-square',
    routeName: Config.ROUTE_CONSOLE_SIGN_IN
  }
]

class ConsoleScene extends PureComponent {

  componentDidMount() {
    this.handleSignInIcon()
    this.getLogList(format(new Date()))
  }

  handleSignInIcon = () => {
    const {global} = this.props
    const {show_sign_center} = global.config
    const signInIndex = BUTTON_LIST.findIndex(item => item.title === '员工打卡')
    if (show_sign_center && signInIndex === -1) {
      BUTTON_LIST.push({
        title: '员工打卡',
        iconName: 'check-square',
        routeName: Config.ROUTE_CONSOLE_SIGN_IN
      })
      return
    }
    if (show_sign_center === false && signInIndex !== -1)
      BUTTON_LIST.splice(signInIndex, 1)
  }
  state = {
    sigInInfo: {
      sign_status: 0,
      records: []
    }
  }

  getLogList = (start_day) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `/api/sign_status_with_record/${currStoreId}/${start_day}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({sigInInfo: res})
    })
  }

  onPress = (routeName) => {
    InteractionManager.runAfterInteractions(() => {
      if (Config.ROUTE_CONSOLE_SIGN_IN === routeName) {
        this.props.navigation.navigate(routeName, {sigInInfo: this.state.sigInInfo});
        return
      }
      this.props.navigation.navigate(routeName);
    });
  }

  render() {
    return (
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.title}>
            我的工作台
          </Text>
          <View style={styles.buttonArrayWrap}>
            {
              BUTTON_LIST.map((button, index) => {
                return (
                  <TouchableOpacity style={styles.buttonStyle}
                                    onPress={() => this.onPress(button.routeName)}
                                    key={index}>
                    <FontAwesome5 name={button.iconName} style={styles.iconStyle}/>
                    <Text style={styles.btnTitle}>
                      {button.title}
                    </Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  card: {
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingLeft: 16,
    paddingTop: 22,
    paddingBottom: 12,
    color: '#333333',
    lineHeight: 25
  },
  buttonArrayWrap: {
    paddingLeft: 22,
    paddingBottom: 36,
    paddingRight: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  buttonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  btnTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center'
  },
  iconStyle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
    padding: 4
  }
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

export default connect(mapStateToProps)(ConsoleScene)
