import React, { Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderChgPackWorker, orderSetReady} from '../../reducers/order/orderActions'
import {getStorePackers} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {Button, ButtonArea,Toast, Dialog, Cells, CellsTitle, Cell, CellBody} from "../../weui/index";
import S from '../../stylekit'
import CheckboxCells from "../../weui/Form/CheckboxCells";
import Switch from "../../weui/Form/Switch";
import CellFooter from "../../weui/Cell/CellFooter";

function mapStateToProps(state) {
  return {
    global, store
  } = state;
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderSetReady, getStorePackers, orderChgPackWorker}, dispatch)}
}

class OrderSetPackDone extends Component {

  static navigationOptions = {
    headerTitle: '设置打包完成',
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      doneSubmitting: false,
      onSubmitting: false,
      loadingPacker: false,
      remarkConfirmed: false,
      storeRemarkConfirmed: false,
      checked: [],
    };
  }

  componentWillMount() {
    const {dispatch, global, navigation, store} = this.props;
    const {order} = (navigation.state.params || {});

    this.setState({remarkConfirmed: !order.remark_warning, storeRemarkConfirmed: !order.store_remark});

    const packWorkers = store.packWorkers[order.store_id];
    if (!packWorkers || packWorkers.length === 0) {
      this.setState({loadingPacker: true});
      dispatch(getStorePackers(global.accessToken, order.store_id, (ok, msg, workers) => {
        if (ok) {
          this.setState({loadingPacker: false});
        } else {
          this.setState({loadingPacker: false, errorHints: msg});
        }
      }))
    }
  }

  _back = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  _checkDisableSubmit = () => {
    console.log(this.state);
    return !(this.state.checked && this.state.checked.length > 0 && this.state.remarkConfirmed && this.state.storeRemarkConfirmed);
  };

  _doReply = () => {
    const {dispatch, global, navigation} = this.props;
    const {order} = (navigation.state.params || {});
    this.setState({onSubmitting: true});
    dispatch(orderSetReady(global.accessToken, order.id, this.state.checked, (ok, msg, data) => {
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
  };

  render() {
    const {dispatch, global, navigation, store} = this.props;
    const {order} = (navigation.state.params || {});

    const workers = store.packWorkers[order.store_id];


    const packOpts = workers ? workers.map((worker, idx) => {
      return {label: `${worker.nickname}`, value: worker.id}
    }) : [];

    console.log(packOpts);

    return <ScrollView style={[{backgroundColor: '#f2f2f2'}, {flex: 1}]}>

      <Dialog onRequestClose={() => {}}
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

      {order.remark_warning && <View>
        <CellsTitle>客户备注确认</CellsTitle>
        <Cells>
          <Cell>
            <CellBody><Text style={{color: 'red'}}>{order.remark}</Text></CellBody>
            <CellFooter>
            <Switch value={this.state.remarkConfirmed} onChange={(v) => this.setState({remarkConfirmed: v})}/>
            </CellFooter>
          </Cell>
        </Cells>
      </View>
      }

      {!!order.store_remark && <View>
        <CellsTitle>商家备注确认</CellsTitle>
        <Cells>
          <Cell>
            <CellBody><Text style={{color: 'red'}}>{order.store_remark}</Text></CellBody>
            <CellFooter>
            <Switch value={this.state.storeRemarkConfirmed} onChange={(v) => this.setState({storeRemarkConfirmed: v})}/>
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
        <Button type={this._checkDisableSubmit() ? 'default' : 'primary'} disabled={this._checkDisableSubmit()} onPress={this._doReply} style={[S.mlr15]}>保存</Button>
      </ButtonArea>

      <Toast show={this.state.onSubmitting}>提交中</Toast>
      <Toast show={this.state.loadingPacker}>加载中</Toast>

      <Toast
        icon="success"
        show={this.state.doneSubmitting}
      >保存成功</Toast>
    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderSetPackDone)