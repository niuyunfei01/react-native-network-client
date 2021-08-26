import React, {PureComponent} from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import {hostPort} from "../../config";
import {List, Radio} from "@ant-design/react-native";
import GlobalUtil from "../../util/GlobalUtil";
import JbbText from "../component/JbbText";
import {native} from "../../common";
import JPush from "jpush-react-native";
import HttpUtils from "../../util/http";
import {ToastShort} from "../../util/ToastUtils";
import _ from "lodash";
import {setPrinterName} from "../../reducers/global/globalActions";

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
      enable_notify: true,
      hide_good_titles: false,
      invoice_serial_set: '',
      enable_new_order_notify: true,
      notificationEnabled: 1,
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
      ],
      invoice_serial_setting_labels: {}
    }

    native.getDisableSoundNotify((disabled, msg) => {
      this.setState({enable_notify: !disabled })
    })

    native.getNewOrderNotifyDisabled((disabled, msg) => {
      this.setState({enable_new_order_notify: !disabled})
    })

    this.navigationOptions(this.props)
  }

  componentDidMount() {
    this.setState({isRefreshing: true});
    this.get_store_settings(() => {
      this.setState({isRefreshing: false});
    });
  }

  componentWillUnmount() {

  }

  get_store_settings(callback = () => {}) {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/read_store/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(store_info => {
      this.setState({
        invoice_serial_set: store_info.invoice_serial_set,
        hide_good_titles: Boolean(store_info.hide_good_titles),
        invoice_serial_setting_labels: store_info.invoice_serial_setting_labels
      }, callback)
    })

  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  render() {
    JPush.isNotificationEnabled((enabled) => {
        this.setState({notificationEnabled: enabled})
    })

    const {printer_id} = this.props.global
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />}
        style={{backgroundColor: colors.main_back}}>
        <CellsTitle style={styles.cell_title}>提醒</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>系统通知</Text>
            </CellBody>
            <CellFooter>
              {this.state.notificationEnabled && <Text>已开启</Text> || <Text style={[styles.printer_status, styles.printer_status_error]}>去系统设置中开启</Text>}
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>后台运行</Text>
            </CellBody>
            <CellFooter>
              <Text style={[styles.printer_status, styles.printer_status_error]}>未开启，去设置</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>语音播报</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.enable_notify}
                onValueChange={(val) => {
                  native.setDisableSoundNotify(!val)
                  this.setState({enable_notify: val});
                }}/>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>新订单通知</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.enable_new_order_notify}
                onValueChange={(val) => { this.setState({enable_new_order_notify: val});
                  native.setDisabledNewOrderNotify(!val)
                }} />
            </CellFooter>
          </Cell>
        </Cells>
        {this.renderSerialNoSettings()}
        <CellsTitle style={styles.cell_title}>商品信息</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>对骑手隐藏商品敏感信息</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.hide_good_titles}
                      onValueChange={(val) => {
                        this.save_hide_good_titles(val)
                      }}/>
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
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight:'bold'}} checked={host === server.host} onChange={event => {
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

  save_invoice_serial_set = (invoice_serial_set) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_invoice_serial_setting/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {invoice_serial_set}).then(() => {
      this.setState({
        invoice_serial_set
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  save_hide_good_titles = (hide_good_titles) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_hide_good_titles/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {hide_good_titles}).then(() => {
      this.setState({
        hide_good_titles
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  renderSerialNoSettings = () => {
    let items = _.map(this.state.invoice_serial_setting_labels, (label, val) => {
    return (<RadioItem key={val} style={{fontSize: 12, fontWeight: 'bold'}} checked={this.state.invoice_serial_set === Number(val)}
                          onChange={event => { if (event.target.checked) { this.save_invoice_serial_set(Number(val)) }}}>
      <JbbText>{label}</JbbText></RadioItem>);
    });
    return <View><CellsTitle style={styles.cell_title}>小票/骑手看到的门店名称与序号</CellsTitle>
    <Cells style={[styles.cell_box]}>
      <List style={{marginTop: 12}}>
        {items}
      </List>
    </Cells></View>
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
