//import liraries
import React, {PureComponent} from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config from "../../config";
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

// create a component
class SettingScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '设置',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
    }
  }

  componentWillMount() {
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
              <Text style={[styles.cell_body_text]}>惠普打印机</Text>
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
              <TouchableOpacity
                style={[styles.right_box]}
                onPress={() => {
                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                }}
              >
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
              <Text style={[styles.cell_body_text]}>导航栏提醒</Text>
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
              <Text style={[styles.cell_body_text]}>新消息震动</Text>
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
        </Cells>


        <CellsTitle style={styles.cell_title}>通知筛选</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>新订单</Text>
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
              <Text style={[styles.cell_body_text]}>配送订单</Text>
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
              <Text style={[styles.cell_body_text]}>订单异常</Text>
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
        </Cells>


      </ScrollView>
    );
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
