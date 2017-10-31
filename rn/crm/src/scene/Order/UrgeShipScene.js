import React, { PureComponent, Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import InputNumber from 'rc-input-number';
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import Config from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'
import CommonStyle from '../../common/CommonStyles'

import {getOrder, printInCloud, getRemindForOrderPage} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, ActionSheet, TextArea, RadioCells, ButtonArea,Icon, Toast, Msg, Dialog, Cells, CellsTitle, Cell, CellHeader, CellBody, CellFooter} from "../../weui/index";
import {ToastShort} from "../../util/ToastUtils";
import {StatusBar} from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';
import Cts from '../../Cts'
import inputNumberStyles from './inputNumberStyles';
import S from '../../stylekit'

const numeral = require('numeral')

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({getContacts, getOrder, printInCloud, getRemindForOrderPage}, dispatch)}
}

class UrgeShipScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      // headerTitle: '催单',
      // headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>催单</Text>
        </View>
      ),
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      order: {},
      remind: {},
      reasons: {},
      reason_key: '',
      custom: '',
    };

    this._onReasonSelected = this._onReasonSelected.bind(this);
    this._checkShowCustomTextArea = this._checkShowCustomTextArea.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this)
  }

  componentDidMount() {

  }

  componentWillMount() {
    const {order, remind} = (this.props.navigation.state.params || {});
    const reasons = {
      'hasOut': '已送出',
      'inCooking': '正在烹饪',
      'weather': '天气原因',
      'shortHand': '人手不齐',
      'custom': '自定义回复'
    };
    this.setState({order, remind, reasons})
  }

  _onReasonSelected(key) {
    this.setState({reason_key: key})
  }

  _checkShowCustomTextArea() {
    return this.state.reason_key === 'custom';
  }

  _checkDisableSubmit() {
    return !(this.state.reason_key && (this.state.reason_key !== 'custom' || this.state.custom));
  }

  _doReply() {
    console.log('reply...')
  }

  render() {
    const {order} = this.props.order;
    const reasonOpts = tool.objectMap(this.state.reasons, (reason, key) => {
      return {label: reason, value: key}
    });

    return <ScrollView style={[styles.container, {flex: 1}]}>
          { !!this.state.errorHints &&
          <Dialog onRequestClose={()=>{}}
            visible={!!this.state.errorHints}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {this.setState({errorHints: ''})}
            }]}      
          ><Text>{this.state.errorHints}</Text></Dialog>
          }
      <CellsTitle style={styles.cellsTitle}>选择预设信息</CellsTitle>
{/*      <Cells>
        {
          tool.objectMap(this.state.reasons, (reason, key) => {
            return (<Cell key={key} onPress={()=>{this._onReasonSelected(key)}}>
              <CellBody>
                <Text>{reason}</Text>
              </CellBody>
              <CellFooter>
                {this.state.reason_key === key ? (
                  <Icon name="success_no_circle" style={{fontSize: 16,}}/>
                ) : null}
              </CellFooter>
            </Cell>)
          })
        }
      </Cells>*/}
      <RadioCells
        style={{marginTop: 2}}
        options={reasonOpts}
        onChange={this._onReasonSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.reason_key}
      />


      {this._checkShowCustomTextArea() && <View>
        <CellsTitle style={styles.cellsTitle}>自定义回复</CellsTitle>
        <Cells style={{marginTop: 2}}>
          <Cell>
            <CellBody>
            <TextArea
              maxLength={20}
              placeholder="请输入自定义回复内容"
              onChange={(v)=>{this.setState({custom: v})}}
              value={this.state.custom}
              underlineColorAndroid={'transparent'}
            />
            </CellBody>
          </Cell>
        </Cells>
      </View>}

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply} style={[S.mlr15]}>回复客户</Button>
      </ButtonArea>
      
      <Toast
        icon="loading"
        show={this.state.onSubmitting}
        onRequestClose={() => {
        }}
      >提交中</Toast>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  cellsTitle: {
    fontSize: 13, marginBottom: 0, marginTop: 20
  },
  cells: {
    marginTop: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UrgeShipScene)