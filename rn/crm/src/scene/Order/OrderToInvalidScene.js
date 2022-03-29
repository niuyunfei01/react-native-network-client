import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderToInvalid} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {
  Button,
  ButtonArea,
  Cell,
  CellBody,
  Cells,
  CellsTitle,
  Dialog,
  RadioCells,
  TextArea,
  Toast
} from "../../weui/index";
import {hideModal, showModal, showSuccess} from "../../util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderToInvalid}, dispatch)}
}

class OrderToInvalidScene extends Component {

  KEY_CUSTOM = 'custom';
  LABEL_CUSTOM = '其他';

  constructor(props: Object) {
    super(props);

    const reasons = [
      {key: 'store_too_busy', label: '店铺忙不过来',},
      {key: 'no_storage', label: '商品缺货',},
      {key: 'order_cancelled', label: '订单已退款',},
      {key: 'customer_cannot_reach', label: '用户联系不上',},
      {key: 'addr_cannot_reach', label: '地址无法配送',},
      {key: 'store_suspend', label: ' 店铺已打烊',},
      {key: 'duplicated', label: '重复订单',},
      {key: 'custom', label: this.LABEL_CUSTOM,},
    ];
    this.state = {
      order: {},
      reasons: reasons,
      reason_idx: -1,
      custom: '',
      doneSubmitting: false,
      onSubmitting: false,
    };

    this._onReasonSelected = this._onReasonSelected.bind(this);
    this._checkShowCustomTextArea = this._checkShowCustomTextArea.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
  }

  _onReasonSelected(idx) {
    this.setState({reason_idx: idx});
    const key = this._getReasonKey(idx);

    if (key === this.KEY_CUSTOM) {
      const label = this.state.reasons[idx]['label'];
      this.setState({custom: label === this.LABEL_CUSTOM ? '' : label});
    }
  }

  _checkShowCustomTextArea() {
    return this._getReasonKey() === this.KEY_CUSTOM;
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
    const {dispatch, global, navigation, route} = this.props;
    const {order} = (route.params || {})
    this.setState({onSubmitting: true});
    showModal('提交中')
    const reasonKey = this._getReasonKey(this.state.reason_idx);
    dispatch(orderToInvalid(global.accessToken, order.id, reasonKey, this.state.custom, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      hideModal()
      if (ok) {
        showSuccess('订单已被置为无效')
        // this.setState({doneSubmitting: true});
        setTimeout(() => {
          // this.setState({doneSubmitting: false});
          navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }))
  }

  render() {
    const {order, remind} = (this.props.route.params || {});
    const reasonOpts = this.state.reasons.map((reason, idx) => {
      return {label: reason.label, value: idx}
    });

    return <ScrollView style={[styles.container, {flex: 1}]}>

      <Dialog onRequestClose={() => {
      }}
              visible={!!this.state.errorHints}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {
                  this.setState({errorHints: ''})
                }
              }]}
      ><Text>{this.state.errorHints} </Text></Dialog>

      <Toast
        icon="loading"
        show={this.state.onLoadingReasons}
        onRequestClose={() => {
        }}
      >正在加载...</Toast>

      <CellsTitle style={styles.cellsTitle}>选择退单原因</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={reasonOpts}
        onChange={this._onReasonSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.reason_idx}
      />

      {this._checkShowCustomTextArea() && <View>
        <CellsTitle style={styles.cellsTitle}>自定义原因</CellsTitle>
        <Cells style={{marginTop: 2}}>
          <Cell>
            <CellBody>
              <TextArea
                maxLength={20}
                placeholder="请输入自定义内容"
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

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply}
                style={{marginHorizontal: 15}}>置为无效</Button>
      </ButtonArea>

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

export default connect(mapStateToProps, mapDispatchToProps)(OrderToInvalidScene)
