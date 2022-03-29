import React, {Component} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderChgPackWorker, orderSetReady} from '../../reducers/order/orderActions'
import {getStorePackers} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {Button, ButtonArea, Cell, CellBody, Cells, CellsTitle, Dialog} from "../../weui/index";
import S from '../../stylekit'
import CheckboxCells from "../../weui/Form/CheckboxCells";
import Switch from "../../weui/Form/Switch";
import CellFooter from "../../weui/Cell/CellFooter";
import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global, store
  } = state;
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderSetReady, getStorePackers, orderChgPackWorker}, dispatch)}
}

class OrderSetPackDone extends Component {

  constructor(props: Object) {
    super(props);
    this.state = {
      doneSubmitting: false,
      onSubmitting: false,
      loadingPacker: false,
      notAutoConfirmed: false,
      storeRemarkConfirmed: false,
      checked: [],
    };
  }

  UNSAFE_componentWillMount() {
    const {dispatch, global, route, store} = this.props;
    const {order} = (route.params || {});
    if (order) {
      this.setState({notAutoConfirmed: !order.remark_warning, storeRemarkConfirmed: !order.store_remark});
      const packWorkers = store.packWorkers[order.store_id];
      if (!packWorkers || packWorkers.length === 0) {
        showModal("加载中")
        this.setState({loadingPacker: true});
        dispatch(getStorePackers(global.accessToken, order.store_id, (ok, msg, workers) => {
          hideModal()
          if (ok) {
            this.setState({loadingPacker: false});
            this.__setCurrentAsDefault();
          } else {
            this.setState({loadingPacker: false, errorHints: msg});
          }
        }))
      }
      return;
    }
    this.__setCurrentAsDefault();
  }

  __setCurrentAsDefault = () => {
    const {global, store, route} = this.props;
    const {order} = (route.params || {});
    if (order) {
      const workers = (store.packWorkers || {})[order.store_id];
      if (workers && this.state.checked.length === 0) {
        const currUid = '' + global.currentUser;
        if (workers.filter(w => w.id === currUid).length > 0) {
          this.setState({checked: [currUid]})
        }
      }
    }
  };

  _back = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  _checkDisableSubmit = () => {
    return !(this.state.checked && this.state.checked.length > 0 && this.state.notAutoConfirmed && this.state.storeRemarkConfirmed);
  };

  _doReply = () => {
    const {dispatch, global, route, navigation} = this.props;
    const {order} = (route.params || {});
    showModal('提交中')
    this.setState({onSubmitting: true});
    dispatch(orderSetReady(global.accessToken, order.id, this.state.checked, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      hideModal()
      if (ok) {
        showSuccess('保存成功')
        // this.setState({doneSubmitting: true});
        setTimeout(() => {
          // this.setState({doneSubmitting: false});
          this.props.navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }))
  };

  render() {
    const {route, store} = this.props;
    const {order} = (route.params || {});
    const workers = store.packWorkers[order.store_id];
    const packOpts = workers ? workers.map((worker, idx) => {
      return {label: `${worker.nickname}`, value: worker.id}
    }) : [];
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
      ><Text>{this.state.errorHints} </Text></Dialog>

      {order.remark_warning && <View>
        <CellsTitle style={{marginTop: 2}}>客户备注确认</CellsTitle>
        <Cells>
          <Cell>
            <CellBody><Text style={{color: 'red'}}>{order.remark} </Text></CellBody>
            <CellFooter>
              <Switch value={this.state.notAutoConfirmed} onChange={(v) => this.setState({notAutoConfirmed: v})}/>
            </CellFooter>
          </Cell>
        </Cells>
      </View>
      }

      {!!order.store_remark && <View>
        <CellsTitle>商家备注确认</CellsTitle>
        <Cells style={{marginTop: 2}}>
          <Cell>
            <CellBody><Text style={{color: 'red'}}>{order.store_remark} </Text></CellBody>
            <CellFooter>
              <Switch value={this.state.storeRemarkConfirmed}
                      onChange={(v) => this.setState({storeRemarkConfirmed: v})}/>
            </CellFooter>
          </Cell>
        </Cells>
      </View>
      }

      <CellsTitle style={CommonStyle.cellsTitle}>选择打包员</CellsTitle>
      <CheckboxCells
        style={{marginTop: 2}}
        options={packOpts}
        onChange={(checked) => this.setState({checked})}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.checked}
      />

      <ButtonArea style={{marginTop: 35}}>
        <Button type={this._checkDisableSubmit() ? 'default' : 'primary'} disabled={this._checkDisableSubmit()}
                onPress={this._doReply} style={[S.mlr15]}>保存</Button>
      </ButtonArea>

      {/*<Toast show={this.state.onSubmitting}>提交中</Toast>*/}
      {/*<Toast show={this.state.loadingPacker}>加载中</Toast>*/}

      {/*<Toast*/}
      {/*  icon="success"*/}
      {/*  show={this.state.doneSubmitting}*/}
      {/*>保存成功</Toast>*/}
    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderSetPackDone)
