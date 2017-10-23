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
import {Button, Agreement, ActionSheet, TextArea, RadioCells, ButtonArea,Icon, Toast, Label, Dialog, Cells, Input, CellsTitle, Cell, CellHeader, CellBody, CellsTips} from "../../weui/index";
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

class AuditRefundScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '客户退款申请',
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      order: {},
      remind: {},
      reasons: {},
      refund_yuan: '',
      customer_talked: false,
      selected_action: '',
      custom: '',
    };

    this._onActionSelected = this._onActionSelected.bind(this);
    this._checkShowCustomTextArea = this._checkShowCustomTextArea.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._refundYuanChanged = this._refundYuanChanged.bind(this);
    this._doAgreeRefund = this._doAgreeRefund.bind(this);
    this._doRefuseRefund = this._doRefuseRefund.bind(this);
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

  _onActionSelected(action) {
    this.setState({selected_action: action})
  }

  _checkShowCustomTextArea() {
    return this.state.reason_key === 'custom';
  }

  _checkDisableSubmit() {
    return !(this.state.reason_key && (this.state.reason_key !== 'custom' || this.state.custom));
  }

  _refundYuanChanged(v) {
    this.setState({refund_yuan: v});
  }

  _doAgreeRefund() {
    console.log('agree refund ...')
  }

  _doRefuseRefund() {
    console.log('refuse refund ...')
  }

  _shouldDisabledAgreeBtn() {
    return this.state.refund_yuan !== '1.11';
  }

  _shouldDisableRefuseBtn() {
    return this.state.customer_talked !== true || !this.state.reason_key || (this.state.reason_key === 'custom' && this.state.custom === '');
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

      <CellsTitle style={styles.cellsTitle}>拒绝还是同意？</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={[{label: '同意退款', value: 'yes'}, {label: '拒绝退款', value: 'no'}]}
        onChange={this._onActionSelected}
        cellTextStyle={[CommonStyle.cellTextH45, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.selected_action}
      />

      {this.state.selected_action === 'no' && <View>
        <Agreement value={this.state.customer_talked} textStyle={{color: '#f44040'}} onChange={(v) => {
          this.setState({customer_talked: v})
        }}>请务必先与客户沟通清楚</Agreement>
        <CellsTitle style={styles.cellsTitle}>请选择拒绝理由</CellsTitle>
        <RadioCells
          style={{marginTop: 2}}
          options={reasonOpts}
          onChange={this._onActionSelected}
          cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
          value={this.state.reason_key}
        />

        {this._checkShowCustomTextArea() && <View>
          <Cells style={{marginTop: 2}}>
            <Cell>
              <CellBody>
            <TextArea
              maxLength={20}
              placeholder="您的拒绝原因"
              onChange={(v) => {
                this.setState({custom: v})
              }}
              value={this.state.custom}
              underlineColorAndroid={'transparent'}
            />
              </CellBody>
            </Cell>
          </Cells>
        </View>}
      </View>}

      {this.state.selected_action === 'yes' && <View>
        <CellsTitle style={styles.cellsTitle}>请确认退款金额</CellsTitle>
        <Cells>
          <Cell error>
            <CellHeader><Label>退款金额</Label></CellHeader>
            <CellBody>
              <Input
                placeholder="0.00"
                keyboardType = 'numeric'
                value={this.state.refund_yuan}
                onChangeText={this._refundYuanChanged}
                underlineColorAndroid={'transparent'}
              />
            </CellBody>
          </Cell>
        </Cells>
        <CellsTips>暂不能修改金额，请依平台显示输入</CellsTips>
      </View>
      }

      <ButtonArea style={{marginTop: 35}}>
        {this.state.selected_action === 'yes' &&
        <Button type="primary" disabled={this._shouldDisabledAgreeBtn()} onPress={this._doAgreeRefund} style={[S.mlr15]}>同意退款</Button>}

        {this.state.selected_action === 'no' &&
        <Button type="warn" disabled={this._shouldDisableRefuseBtn()}
                onPress={this._doRefuseRefund} style={[S.mlr15]}>拒绝退款</Button>}
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

export default connect(mapStateToProps, mapDispatchToProps)(AuditRefundScene)