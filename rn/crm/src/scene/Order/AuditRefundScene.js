import React, { Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderAuditRefund} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, TextArea, RadioCells, ButtonArea, Toast, Label, Dialog, Cells, Input, CellsTitle, Cell, CellHeader, CellBody, CellsTips} from "../../weui/index";
import S from '../../stylekit'

const numeral = require('numeral');

const reasons = {
  custom_talked_ok: '已与用户协商一致',
  custom: '自定义回复'
};


function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderAuditRefund}, dispatch)}
}

class AuditRefundScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '客户退款申请',
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      order: {},
      remind: {},
      refund_yuan: '',
      selected_action: '',
      reason_key:'',
      custom: '',
    };

    this.refundMoney = '1.11';

    this._onActionSelected = this._onActionSelected.bind(this);
    this._onReasonSelected = this._onReasonSelected.bind(this);
    this._checkShowCustomTextArea = this._checkShowCustomTextArea.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._refundYuanChanged = this._refundYuanChanged.bind(this);
    this._doAgreeRefund = this._doAgreeRefund.bind(this);
    this._doRefuseRefund = this._doRefuseRefund.bind(this);
  }

  componentWillMount() {
    const {order, remind} = (this.props.navigation.state.params || {});
    this.setState({order, remind})
  }

  _onReasonSelected(key) {
    this.setState({reason_idx: key})
  }

  _onActionSelected(action) {
    this.setState({selected_action: action})
  }

  _checkShowCustomTextArea() {
    return this.state.reason_idx === 'custom';
  }

  _checkDisableSubmit() {
    return !(this.state.reason_idx && (this.state.reason_idx !== 'custom' || this.state.custom));
  }

  _refundEquals() {
    return this.state.refund_yuan === this.refundMoney;
  }

  _refundYuanChanged(v) {
    this.setState({refund_yuan: v});
  }

  _doAgreeRefund() {
    this.__tpl_action(true, () => {
      this.setState({onSuccessAgreed: true});
    })
  }

  _goBack() {
    const {navigation} = this.props;
    navigation.goBack();
  }

  _doRefuseRefund() {
    this.__tpl_action(false, () => {
      this.setState({onSuccessRefused: true});
    })
  }

  __tpl_action(agreeOrRefuse, doneCall) {
    const {remind} = (this.props.navigation.state.params || {});
    const {dispatch, global} = this.props;

    this.setState({onSubmitting: true});
    const reason = this.state.reason_idx === 'custom' ? this.state.custom : reasons[this.state.reason_idx];
    dispatch(orderAuditRefund(global.accessToken, remind.order_id, remind.id, agreeOrRefuse, reason, (ok, msg, data) => {
      if (ok) {
        this.setState({onSubmitting: false});
        doneCall();
      } else {
        this.setState({onSubmitting: false, errorHints: '提交失败：' + msg});
      }
    }));
  }

  _shouldDisabledAgreeBtn() {
    return this.state.refund_yuan !== this.refundMoney;
  }

  _shouldDisableRefuseBtn() {
    return !this.state.reason_idx || (this.state.reason_idx === 'custom' && this.state.custom === '');
  }

  render() {

    const {order} = (this.props.navigation.state.params || {});
    const reasonOpts = tool.objectMap(reasons, (reason, key) => {
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

      <CellsTitle style={CommonStyle.cellsTitle35}>拒绝还是同意？</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={[{label: '同意退款', value: 'yes'}, {label: '拒绝退款', value: 'no'}]}
        onChange={this._onActionSelected}
        cellTextStyle={[CommonStyle.cellTextH45, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.selected_action}
      />

      {this.state.selected_action === 'no' && <View>
        <CellsTitle style={CommonStyle.cellsTitle35}>拒绝理由</CellsTitle>
        <RadioCells
          style={{marginTop: 2}}
          options={reasonOpts}
          onChange={this._onReasonSelected}
          cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
          value={this.state.reason_idx}
        />

        {this._checkShowCustomTextArea() && <View>
          <CellsTitle>请填写拒绝原因</CellsTitle>
          <Cells style={{marginTop: 2}}>
            <Cell>
              <CellBody>
            <TextArea
              maxLength={20}
              placeholder="请输入"
              onChange={(v) => {
                this.setState({custom: v})
              }}
              value={this.state.custom}
              underlineColorAndroid={'transparent'}
            />
              </CellBody>
            </Cell>
          </Cells></View>}
        <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 15}}>
          <Text style={{color:'#f44040'}}>拒绝前，请保证已与客户沟通过</Text>
        </View>

      </View>}

      {this.state.selected_action === 'yes' && <View>
        <CellsTitle style={CommonStyle.cellsTitle35}>请确认退款金额</CellsTitle>
        <Cells>
          <Cell error={!this._refundEquals()}>
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
      <Dialog onRequestClose={()=>{}}
              visible={this.state.onSuccessRefused}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {this._goBack(); this.setState({onSuccessRefused: false});}
              }]}
      ><Text>已拒绝用户的退款申请</Text></Dialog>
      <Dialog onRequestClose={()=>{}}
              visible={this.state.onSuccessAgreed}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {this._goBack(); this.setState({onSuccessAgreed: false});}
              }]}
      ><Text>已通过用户的退款申请</Text></Dialog>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  cells: {
    marginTop: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuditRefundScene)