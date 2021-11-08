import React, {PureComponent} from 'react'
import {
  Alert,
  InteractionManager,
  RefreshControl,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import JPush from "jpush-react-native";
import native from "../../common/native";

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


function FetchInform({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class InfromSetting extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '消息与铃声',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      Volume: 0,
      maxVolume: 0,
      mixVolume: 0,
      device_status: true,
      notificationEnabled: 1,
      isRun: false,
      error: 0,
    }
    this.navigationOptions(this.props)
    this.geterror();
  }

  geterror() {
    this.setState({
      error: 0
    })
    JPush.isNotificationEnabled((enabled) => {
      if (!enabled) {
        this.setState({
          error: this.state.error + 1,
          device_status: false,
        })
      }
      this.setState({notificationEnabled: enabled})
    })

    native.isRunInBg((resp) => {
      resp = resp === 1 ? true : false;
      if (!resp) {
        this.setState({
          error: this.state.error + 1,
          device_status: false,
        })
      }
      this.setState({isRun: resp})
    })

    native.getSoundVolume((ok, currentVolume, isRinger, maxVolume, minVolume, msg) => {
      console.log(ok, currentVolume, isRinger, maxVolume, minVolume, msg)
      if (currentVolume === 0) {
        this.setState({
          error: this.state.error + 1,
          device_status: false,
        })
      }
      this.setState({
        Volume: currentVolume,
        maxVolume: maxVolume,
        minVolume: minVolume < 0 ? 0 : minVolume,
      })
    })


    native.getDisableSoundNotify((disabled) => {
      if (disabled) {
        this.setState({
          error: this.state.error + 1,
          device_status: false,
        })
      }
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

        <FetchInform navigation={this.props.navigation} onRefresh={this.geterror.bind(this)}/>
        <CellsTitle style={styles.cell_title}>消息设置</CellsTitle>
        <Cells style={[styles.cell_box]}>

          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text
                style={[styles.cell_body_text]}>新消息通知</Text>
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
                                      console.log(resp, msg)
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
              <Text
                style={[styles.cell_body_text]}>消息提醒设置</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_GUIDE);
                                }}>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text
                style={[styles.cell_body_text]}>消息铃声状态</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_MSG_VOICE);
                                }}>

                {!this.state.device_status &&
                <Text style={[styles.body_status, styles.printer_status_error]}>发现{this.state.error}个问题</Text> ||
                <Text style={[styles.body_status]}>正常</Text>}

                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>音量</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>系统音量</Text>
            </CellBody>
            <CellFooter>
              <View style={{width: "80%"}}>
                <Slider
                  maximumValue={this.state.maxVolume}
                  value={this.state.Volume}
                  step={1}
                  onSlidingComplete={value => {
                    native.setSoundVolume(value, (resp, msg) => {
                      this.setState({
                        Volume: value
                      })
                    })
                    if (value === this.state.maxVolume) {
                      Alert.alert('提示', '当前音量已最大', [{text: '确认', style: 'cancel'}])
                    }
                  }}
                />
              </View>
            </CellFooter>
          </Cell>
        </Cells>
        <CellsTitle style={styles.cell_title}>后台设置</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>后台运行</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.isRun}
                      onValueChange={() => {
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

                            console.log(resp, msg)
                            // this.setState({isRun: resp});
                          })
                        }
                      }}/>
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
  printer_status_error: {
    color: '#f44040',
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


export default connect(mapStateToProps, mapDispatchToProps)(InfromSetting)
