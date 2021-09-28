import React, {PureComponent} from 'react'
import {
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Slider,
  Circle,
  TouchableOpacity,
  Alert
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Flex, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config, {hostPort} from "../../config";
import Button from 'react-native-vector-icons/Entypo';


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
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '消息铃声检测',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      changedValue: 17,
      backgrounder: false,
      msg_status: false,
    }
    this.onAfterChange = value => {
      this.setState({
        changedValue: value,
      });
    };
    this.navigationOptions(this.props)
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
                {!this.state.msg_status &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View>}

                {this.state.msg_status &&
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
                                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                                }}>

                {!this.state.msg_status &&
                <Text onPress={() => {
                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                }} style={[styles.status_err]}>去开启</Text>}

                {this.state.msg_status &&
                <Text style={[styles.body_status]}>已开启</Text>}

              </TouchableOpacity>
            </CellFooter>
          </Cell>

          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.msg_status &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View>}

                {this.state.msg_status &&
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
                                  this.onPress(Config.ROUTE_SETTING);
                                }}>
                {!this.state.msg_status &&
                <Text style={[styles.status_err]}>去设置</Text>}

                {this.state.msg_status &&
                <Text style={[styles.body_status]}>正常</Text>}
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.msg_status &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View>}

                {this.state.msg_status &&
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
                                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                                }}>
                {!this.state.msg_status &&
                <Text style={[styles.status_err]}>去开启</Text>}

                {this.state.msg_status &&
                <Text style={[styles.body_status]}>正常</Text>}
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Flex>
                {!this.state.msg_status &&
                <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#f44040', margin: 5}}></View>}

                {this.state.msg_status &&
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
                                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                                }}>
                {!this.state.msg_status &&
                <Text style={[styles.status_err]}>去设置</Text>}

                {this.state.msg_status &&
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
