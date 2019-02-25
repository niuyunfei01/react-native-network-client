import React, { Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView} from 'react-native'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderChgStore} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, TextArea, RadioCells, ButtonArea,Toast, Dialog, Cells, CellsTitle, Cell, CellHeader, CellBody, CellFooter} from "../../weui/index";
import S from '../../stylekit'

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderChgStore}, dispatch)}
}

class OrderEditStoreScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '修改店铺',
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      reasons: [],
      toStoreId: -1,
      why: '',
      doneSubmitting: false,
      onSubmitting: false,
    };

    this._onStoreSelected = this._onStoreSelected.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
  }

  _onStoreSelected(toStoreId) {
    this.setState({toStoreId});
  }

  _checkDisableSubmit() {
    return !(this.state.toStoreId && this.state.why && this.state.why.length >= 3);
  }

  _doReply() {
    const {dispatch, global, navigation} = this.props;
    const {order} = (navigation.state.params || {});
    if (order) {
      this.setState({onSubmitting: true});
      dispatch(orderChgStore(global.accessToken, order.id, this.state.toStoreId, order.store_id, this.state.why, (ok, msg, data) => {
        console.log(ok, msg, data);
        this.setState({onSubmitting: false});
        if (ok) {
          this.setState({doneSubmitting: true});
          setTimeout(() => {
            this.setState({doneSubmitting: false});
            navigation.goBack();
          }, 1000);
        } else {
          this.setState({errorHints: msg});
        }
      }))
    }
  }

  render() {
    const {order} = (this.props.navigation.state.params || {});
    const {global} = this.props;

    const currStoreId = order.store_id;
    const currVendorId = (tool.store(currStoreId, global) || {}).vendor_id;
    //菜鸟和菜鸟食材视作同一个品牌

    const availableStores = tool.objectFilter(global.canReadStores, (store) => (store.vendor_id == currVendorId || (currVendorId == 1 && store.vendor_id == 2)) && store.id != currStoreId);

    const availableOptions = Object.keys(availableStores).map(store_id => {
      if (store_id > 0) {
        return {label: availableStores[store_id].name, value: store_id};
      }
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

      <CellsTitle style={styles.cellsTitle}>将订单转给门店</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={availableOptions}
        onChange={this._onStoreSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.toStoreId}
      />

      <View>
        <CellsTitle style={styles.cellsTitle}>改单原因</CellsTitle>
        <Cells style={{marginTop: 2}}>
          <Cell>
            <CellBody>
            <TextArea
              maxLength={20}
              placeholder="请输入改店原因，不少于3个字"
              onChange={(v)=>{this.setState({why: v})}}
              value={this.state.why}
              underlineColorAndroid={'transparent'}
            />
            </CellBody>
          </Cell>
        </Cells>
      </View>

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply} style={[S.mlr15]}>确认修改</Button>
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
      >订单已修改</Toast>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderEditStoreScene)