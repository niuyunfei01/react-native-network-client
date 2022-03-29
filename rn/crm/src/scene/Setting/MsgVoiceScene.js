import React, {PureComponent} from 'react'
import {
  Alert,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, Flex} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config from "../../pubilc/common/config";
import native from "../../common/native";
import JPush from "jpush-react-native";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

class MsgVoiceScene extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      backgrounder: false,
      msg_status: false,
      isRun: false,
      notificationEnabled: false,
      enable_notify: false,
      Volume: 0,
    }
    this.geterror();
  }

  geterror() {
    JPush.isNotificationEnabled((enabled) => {
      this.setState({notificationEnabled: enabled})
    })

    native.isRunInBg((resp) => {
      resp = resp === 1 ? true : false;
      this.setState({isRun: resp})
    })
    native.getSoundVolume((resp, Volume) => {
      let mute = false;
      if (Volume > 0) {
        mute = true
      }
      this.setState({Volume: mute})
    })

    native.getDisableSoundNotify((disabled) => {
      this.setState({enable_notify: !disabled})
    })
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  onHeaderRefresh() {

  }


  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  render() {

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        } style={{backgroundColor: colors.main_back}}>

        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.notificationEnabled &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View> ||
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.main_color,
                  margin: 5
                }}></View>}
                <Text
                  style={[styles.cell_body_text]}>系统通知权限设置</Text>
              </Flex>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  if (!this.state.notificationEnabled) {


                                    Alert.alert('确认是否已开启', '', [
                                      {
                                        text: '去开启', onPress: () => {
                                          native.toOpenNotifySettings((resp, msg) => {
                                          })
                                          this.geterror();
                                        }
                                      },
                                      {
                                        text: '确认',
                                        onPress: () => {
                                          this.geterror();
                                        }
                                      }
                                    ])


                                    native.toOpenNotifySettings((resp, msg) => {
                                    })
                                  }
                                }}>

                {!this.state.notificationEnabled &&
                <Text style={[styles.status_err]}>去开启</Text> ||
                <Text style={[styles.body_status]}>已开启</Text>}

              </TouchableOpacity>
            </CellFooter>
          </Cell>

          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.enable_notify &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View> ||
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.main_color,
                  margin: 5
                }}></View>}
                <Text
                  style={[styles.cell_body_text]}>语音播报设置</Text>
              </Flex>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  if (!this.state.enable_notify) {
                                    this.onPress(Config.ROUTE_SETTING);
                                  }
                                }}>

                {!this.state.enable_notify &&
                <Text style={[styles.status_err]}>去设置</Text> ||
                <Text style={[styles.body_status]}>正常</Text>}
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.Volume &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View> ||
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.main_color,
                  margin: 5
                }}></View>}
                <Text
                  style={[styles.cell_body_text]}>系统音量设置</Text>
              </Flex>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  if (!this.state.Volume) {
                                    this.props.navigation.goBack()
                                  }
                                }}>

                {!this.state.Volume &&
                <Text style={[styles.status_err]}>去开启</Text> ||
                <Text style={[styles.body_status]}>正常</Text>}
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.isRun &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View> ||
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.main_color,
                  margin: 5
                }}></View>}
                <Text
                  style={[styles.cell_body_text]}>外送帮后台运行</Text>
              </Flex>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  if (!this.state.isRun) {

                                    Alert.alert('确认是否已开启', '', [
                                      {
                                        text: '去开启', onPress: () => {
                                          native.toRunInBg((resp, msg) => {

                                          })
                                          this.geterror();
                                        }
                                      },
                                      {
                                        text: '确认',
                                        onPress: () => {
                                          this.geterror();
                                        }
                                      }
                                    ])


                                    native.toRunInBg((resp, msg) => {
                                      this.setState({isRun: resp});
                                    })
                                  }
                                }}>
                {!this.state.isRun &&
                <Text style={[styles.status_err]}>去设置</Text> ||
                <Text style={[styles.body_status]}>开启</Text>}
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  body_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.main_color,
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(MsgVoiceScene)
