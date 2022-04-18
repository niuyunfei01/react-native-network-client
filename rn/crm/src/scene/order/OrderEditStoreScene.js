import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import tool from '../../pubilc/util/tool'
import {bindActionCreators} from "redux";
import CommonStyle from '../../pubilc/util/CommonStyles'

import {orderChgStore} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {Button, ButtonArea, Cell, CellBody, Cells, CellsTitle, Dialog, RadioCells, TextArea} from "../../weui/index";
import {hideModal, showError, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderChgStore}, dispatch)}
}

class OrderEditStoreScene extends Component {
  constructor(props: Object) {
    super(props);
    this.state = {
      reasons: [],
      toStoreId: -1,
      why: '',
      isChecked: false,
    };
    this._onStoreSelected = this._onStoreSelected.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
  }

  _onStoreSelected(toStoreId) {
    this.setState({
      toStoreId,
      isChecked: true
    });
  }

  _checkDisableSubmit() {
    return !(this.state.toStoreId);
  }

  _doReply() {
    const {dispatch, global, navigation, route} = this.props;
    const {order} = (route.params || {});
    if (order) {
      showModal('加载中')
      dispatch(orderChgStore(global.accessToken, order.id, this.state.toStoreId, order.store_id, this.state.why, (ok, msg, data) => {
        hideModal();
        if (ok) {
          showSuccess("订单已修改")
        } else {
          this.setState({errorHints: msg});
        }
      }))
    }
  }

  render() {
    const {order} = (this.props.route.params || {});
    const {global} = this.props;

    const orderStoreId = order.store_id;
    const currVendorId = (tool.store(global, orderStoreId) || {}).type;

    //菜鸟和菜鸟食材视作同一个品牌
    //以后要在服务器端实现
    const availableStores = tool.objectFilter(global.canReadStores, (store) => (store.type == currVendorId || (currVendorId == 1 && store.type == 2) || (currVendorId == 2 && store.type == 1)) && store.id != orderStoreId);

    const availableOptions = Object.keys(availableStores).map(store_id => {
      if (store_id > 0) {
        return {label: availableStores[store_id].name, value: store_id};
      }
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
      ><Text style={{color: colors.color333}}>{this.state.errorHints} </Text></Dialog>

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
                placeholder="请输入改店原因（选填）"
                onChange={(v) => {
                  this.setState({why: v})
                }}
                value={this.state.why}
                underlineColorAndroid={'transparent'}
              />
            </CellBody>
          </Cell>
        </Cells>
      </View>

      <ButtonArea style={{marginTop: 35}}>
        {this.state.isChecked ?
          <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply}
                  style={{marginHorizontal: 15}}>确认修改</Button> :
          <Button type="primary" disabled={this._checkDisableSubmit()} onPress={() => {
            showError('请先选择店铺')
          }
          }
                  style={{backgroundColor: 'gray'}}>确认修改</Button>}

      </ButtonArea>


    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderEditStoreScene)
