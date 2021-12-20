import React, {Component} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderStartShip} from '../../reducers/order/orderActions'
import {getStoreShippers} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {
  Button,
  ButtonArea,
  Cell,
  CellBody,
  CellFooter,
  Cells,
  CellsTitle,
  Dialog,
  RadioCells,
  Switch,
} from "../../weui/index";
import S from '../../stylekit'
import Cts from "../../Cts";
import {hideModal, showModal, showSuccess} from "../../util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
    store: state.store,
  };
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderStartShip, getStoreShippers}, dispatch)}
}

class OrderSetShipStart extends Component {

  constructor(props: Object) {
    super(props);

    this.state = {
      doneSubmitting: false,
      onSubmitting: false,
      loadingShippers: false,
      notAutoConfirmed: false,
      checked: 0,
    }
  }

  UNSAFE_componentWillMount() {
    const {dispatch, global, route, store} = this.props;
    const {order} = (route.params || {});
    this.setState({notAutoConfirmed: !this.should_show_ship_auto(order)});
    const shipWorkers = store && store.shipWorkers ? store.shipWorkers[order.store_id] : null;
    if (!shipWorkers || shipWorkers.length === 0) {
      this.setState({loadingShippers: true});
      showModal('加载中')
      dispatch(getStoreShippers(global.accessToken, order.store_id, (ok, msg, workers) => {
        hideModal()
        if (ok) {
          this.setState({loadingShippers: false});
        } else {
          this.setState({loadingShippers: false, errorHints: msg});
        }
      }))
    }
  }

  _back = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  _checkDisableSubmit = () => {
    return !(this.state.checked && this.state.notAutoConfirmed);
  };

  _doReply = () => {
    const {dispatch, global, route, navigation} = this.props;
    const {order} = (route.params || {});
    this.setState({onSubmitting: true});
    showModal('提交中')
    dispatch(orderStartShip(global.accessToken, order.id, this.state.checked, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      hideModal()
      if (ok) {
        showSuccess('保存成功')
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }))
  };

  render() {
    const {route, store} = this.props;
    const {order} = (route.params || {});
    const workers = (store && store.shipWorkers && store.shipWorkers[order.store_id] || []);
    const shipperOpts = workers ? workers.map((worker, idx) => {
      const mobile = worker.id === '' + Cts.ID_DADA_SHIP_WORKER ? order.ship_worker_mobile : worker.mobilephone;
      return {label: `${worker.nickname}-${mobile}`, value: worker.id}
    }) : [];

    console.log(shipperOpts);
    return <ScrollView style={[{backgroundColor: '#f2f2f2'}, {flex: 1}]}>

      <Dialog onRequestClose={() => {
      }}
              visible={!!this.state.errorHints}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {
                  this.setState({errorHints: ''});
                  this._back();
                }
              }]}
      ><Text>{this.state.errorHints}</Text></Dialog>

      {this.should_show_ship_auto(order) && <View>
        <CellsTitle style={{marginTop: 2}}>强制出发确认</CellsTitle>
        <Cells>
          <Cell>
            <CellBody><Text style={{color: 'red'}}>已通过系统呼叫过配送，确定要改为手动管理吗？</Text></CellBody>
            <CellFooter>
              <Switch value={this.state.notAutoConfirmed} onChange={(v) => this.setState({notAutoConfirmed: v})}/>
            </CellFooter>
          </Cell>
        </Cells>
      </View>
      }

      <CellsTitle style={CommonStyle.cellsTitle}>选择配送员</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={shipperOpts}
        onChange={(checked) => this.setState({checked})}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.checked}
      />

      <ButtonArea style={{marginTop: 35}}>
        <Button type={this._checkDisableSubmit() ? 'default' : 'primary'} disabled={this._checkDisableSubmit()}
                onPress={this._doReply} style={[S.mlr15]}>通知用户已出发</Button>
      </ButtonArea>

    </ScrollView>
  }

  should_show_ship_auto(order) {
    const iDadaStatus = parseInt(order.dada_status);
    return `${order.ship_worker_id}` === `${Cts.ID_DADA_SHIP_WORKER}`
      && iDadaStatus !== Cts.DADA_STATUS_NEVER_START && iDadaStatus !== Cts.DADA_STATUS_TIMEOUT
      && iDadaStatus !== Cts.DADA_STATUS_CANCEL;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderSetShipStart)
