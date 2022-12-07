import React, {PureComponent} from "react";
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import config from "../../pubilc/common/config";
import Config from "../../pubilc/common/config";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import {format} from "../../pubilc/util/TimeUtil";


class ConsoleScene extends PureComponent {

  state = {
    sigInInfo: {
      sign_status: 0,
      records: []
    },
    BUTTON_LIST: []
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    this.focus = this.props.navigation.addListener('focus', () => this.handleSignInIcon())
    this.getLogList(format(new Date()))
  }

  handleSignInIcon = () => {
    const BUTTON_LIST = []
    const {store_info = {}} = this.props.global
    const {fn_allot_order = '0', fn_stall = '0'} = store_info
    if (fn_allot_order === '1')
      BUTTON_LIST.push({
        title: '员工打卡',
        iconName: 'check-square',
        routeName: Config.ROUTE_CONSOLE_SIGN_IN
      })
    if (fn_stall === '1')
      BUTTON_LIST.push({
        title: '拣货任务',
        iconName: 'list-alt',
        routeName: config.ROUTE_CONSOLE_STOCKING_TASKS
      })

    this.setState({BUTTON_LIST: BUTTON_LIST})
  }

  getLogList = (start_day) => {
    const {store_id, accessToken} = this.props.global;
    const api = `/api/sign_status_with_record/${store_id}/${start_day}?access_token=${accessToken}`
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
    const {BUTTON_LIST} = this.state
    return (
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.title}>
            我的工作台
          </Text>
          <View style={styles.buttonArrayWrap}>
            {
              BUTTON_LIST && BUTTON_LIST.map((button, index) => {
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
