import React, {PureComponent} from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config, {hostPort} from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import {List, Radio} from "@ant-design/react-native";
import GlobalUtil from "../../util/GlobalUtil";
import JbbText from "../component/JbbText";

const {HOST_UPDATED} = require("../../common/constants").default;
const RadioItem = Radio.RadioItem;

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

class SettingScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '设置',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
      servers: [
        {name: '正式版1', host: "www.cainiaoshicai.cn"},
        {name: '正式版2', host: "api.waisongbang.com"},
        {name: '预览版', host: "rc.waisongbang.com"},
        {name: 'Beta版', host: "beta7.waisongbang.com"},
        {name: '测试版4', host: "fire4.waisongbang.com"},
        {name: '测试版5', host: "fire5.waisongbang.com"},
        {name: '测试版6', host: "fire6.waisongbang.com"},
        {name: '测试版7', host: "fire7.waisongbang.com"},
        {name: '测试版8', host: "fire8.waisongbang.com"},
      ]
    }

    this.navigationOptions(this.props)
  }

  componentDidMount() {
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
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
        }
        style={{backgroundColor: colors.main_back}}
      >
        <CellsTitle style={[styles.cell_title]}>蓝牙打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>自动打印</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}
              />
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>蓝牙打印机</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                style={[styles.right_box]}
                onPress={() => {
                  this.onPress(Config.ROUTE_PRINTER_CONNECT);
                }}
              >
                <Text style={[styles.printer_status, styles.printer_status_ok]}>正常</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>云打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>添加云打印机</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                onPress={() => { this.onPress(Config.ROUTE_CLOUD_PRINTER); }}>
                <Text style={[styles.printer_status, styles.printer_status_error]}>异常</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>提醒</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>语音播报</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.switch_val}
                onValueChange={(val) => {
                  this.setState({switch_val: val});
                }}/>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>导航栏提醒</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.switch_val}
                onValueChange={(val) => { this.setState({switch_val: val}); }}/>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>通知选择</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>新订单</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.switch_val}
                onValueChange={(val) => { this.setState({switch_val: val}); }} />
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>配送订单</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.switch_val} onValueChange={(val) => { this.setState({switch_val: val}); }} />
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>订单异常</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.switch_val} onValueChange={(val) => { this.setState({switch_val: val}); }}/>
            </CellFooter>
          </Cell>
        </Cells>
        {this.renderServers()}
      </ScrollView>
    );
  }

  onServerSelected = (host) => {
    const {dispatch} = this.props;
    dispatch({type: HOST_UPDATED, host: host});
    GlobalUtil.setHostPort(host)
  }

  renderServers = () => {
    let items = []
    const host = hostPort();
    for (let i in this.state.servers) {
      const server = this.state.servers[i]
      items.push(<RadioItem style={{fontSize: 12, fontWeight:'bold'}} checked={host === server.host} onChange={event => {
        if (event.target.checked) {
          this.onServerSelected(server.host)
        }
      }}><JbbText>{server.name}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      <Text style={{marginTop: 12, paddingLeft: 15}}>选择服务器</Text>
      {items}
    </List>
  }
}

// define your styles
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
  printer_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color999,
  },
  printer_status_ok: {
    color: colors.main_color,
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


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
