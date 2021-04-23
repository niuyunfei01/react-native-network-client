import React, { Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView} from 'react-native'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderAuditUrging, orderUrgingReplyReasons} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, TextArea, RadioCells, ButtonArea,Icon, Toast, Msg, Dialog, Cells, CellsTitle, Cell, CellHeader, CellBody, CellFooter} from "../../weui/index";
import S from '../../stylekit'

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderAuditUrging, orderUrgingReplyReasons}, dispatch)}
}

class UrgeShipScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '催单',
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      order: {},
      remind: {},
      reasons: [],
      reason_idx: -1,
      custom: '',
      doneSubmitting: false,
      onSubmitting: false,
      onLoadingReasons: false,
    };

    this._onReasonSelected = this._onReasonSelected.bind(this);
    this._checkShowCustomTextArea = this._checkShowCustomTextArea.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
  }

  componentWillMount() {
    const {order, remind} = (this.props.route.params || {});
    this.setState({order, remind, onLoadingReasons: true});
    const {dispatch, global, navigation} = this.props;
    dispatch(orderUrgingReplyReasons(global.accessToken, order.id, remind.id, (ok, msg, data) => {
      console.log(ok, msg, data);
      this.setState({onLoadingReasons: false});
      if (ok) {
        this.setState({reasons: data});
      } else {
        this.setState({errorHints: msg});
      }
    }))
  }

  _onReasonSelected(idx) {
    this.setState({reason_idx: idx});
    const key = this._getReasonKey(idx);
    if (key === 'custom') {
      console.log(key, idx);
      const label = this.state.reasons[idx]['label'];
      this.setState({custom: label === '自定义回复' ? '' : label});
    }
  }

  _checkShowCustomTextArea() {
    return this._getReasonKey() === 'custom';
  }

  _checkDisableSubmit() {
    const key = this._getReasonKey();
    return !(key && (key !== 'custom' || this.state.custom));
  }

  _getReasonKey(idx) {
    if (typeof idx === 'undefined') {
      idx = this.state.reason_idx;
    }
    return this.state.reasons && idx >= 0 ? this.state.reasons[idx]['key'] : '';
  }

  _doReply() {
    const {dispatch, global, navigation} = this.props;
    const {order, remind} = (navigation.state.params || {});
    this.setState({onSubmitting: true});
    dispatch(orderAuditUrging(global.accessToken, order.id, remind.id, this.state.reason_idx, this.state.custom, (ok, msg, data) => {
      console.log(ok, msg, data);
      this.setState({onSubmitting: false});
      if (ok) {
        this.setState({doneSubmitting: true});
        setTimeout(() => {
          this.setState({doneSubmitting: false});
          navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }))
  }

  render() {
    const reasonOpts = (this.state.reasons || []).map((reason, idx) => {
      return {label: reason.label, value: idx}
    });

    return <ScrollView style={[styles.container, {flex: 1}]}>

      <Dialog onRequestClose={() => {}}
              visible={!!this.state.errorHints}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {
                  this.setState({errorHints: ''})
                }
              }]}
      ><Text>{this.state.errorHints}</Text></Dialog>

      <Toast
        icon="loading"
        show={this.state.onLoadingReasons}
        onRequestClose={() => {
        }}
      >正在加载...</Toast>

      <CellsTitle style={styles.cellsTitle}>选择预设信息</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={reasonOpts}
        onChange={this._onReasonSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.reason_idx}
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

      <Toast
        icon="success"
        show={this.state.doneSubmitting}
        onRequestClose={() => {
        }}
      >已回复客户</Toast>
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