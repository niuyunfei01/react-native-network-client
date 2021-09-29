import React, {PureComponent} from 'react'
import {
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
      Volume: 100,
      msg_status: false,
      notificationEnabled: 1,
      isRun: false,
    }
    this.navigationOptions(this.props)
  }

  onAfterChange(value) {
    console.log(value)
    this.setState({
      Volume: value / 30,
    });
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

    JPush.isNotificationEnabled((enabled) => {
      this.setState({notificationEnabled: enabled})
    })

    native.isRunInBg((resp) => {
      this.setState({isRun: resp})
    })
    native.getSoundVolume((resp, msg) => {
      console.log(resp, msg)
      this.setState({Volume: msg})
    })
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        } style={{backgroundColor: colors.main_back}}>
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

                {!this.state.msg_status &&
                <Text style={[styles.body_status, styles.printer_status_error]}>发现X个问题</Text> ||
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
                  // max={100}
                  // min={1}
                  // step={1}
                  // defaultValue={this.state.Volume}
                  value={this.state.Volume / 30}
                  onPress={value => {

                    native.setSoundVolume(15, (resp, msg) => {
                      console.log(resp, msg)
                    })
                    console.log(value / 30)
                    this.onAfterChange(value)
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
                        native.toRunInBg((resp, msg) => {
                          console.log(resp, msg)
                          this.setState({isRun: resp});
                        })
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
