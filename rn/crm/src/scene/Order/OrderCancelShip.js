import React, {Component} from 'react'
import {Platform, View, Text, StyleSheet, ScrollView} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderCallShip, cancelReasonsList, cancelShip} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {Button, RadioCells, Icon, ButtonArea, Toast, Input, Dialog, CellsTitle} from "../../weui/index";

import S from '../../stylekit'
import pxToDp from "../../util/pxToDp";
import Cts from "../../Cts";
import {ToastLong} from "../../util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderCallShip, cancelReasonsList, cancelShip}, dispatch)}
}

class OrderCancelShip extends Component {
  static navigationOptions = {
    headerTitle: '撤回呼叫',
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      option: -1,
      doneSubmitting: false,
      onSubmitting: false,
      list: [],
      showDialog: false,
      loading: true,
      reason: '',
      showOtherDialog: false,
      upLoading: false,
    };

    this._onTypeSelected = this._onTypeSelected.bind(this);

  }

  componentWillMount() {
    this.getCancelReasons();
  }

  _onTypeSelected(idx) {
    this.setState({option: idx});
  }

  isShowDialog() {
    let option = this.state.option;
    console.log(option);
    if (option === Cts.ORDER_CANCEL_SHIP_REASON) {
      this.setState({showOtherDialog: true,reason:''})
    } else {
      this.setState({showDialog: true})
    }
  }

  getCancelReasons() {
    let token = this.props.global.accessToken;
    let {id} = this.props.navigation.state.params.order;
    let {dispatch} = this.props;
    dispatch(cancelReasonsList(id, token, async (resp) => {
      this.setState({list: resp,loading: false});
    }));
  }

  upCancelShip() {
    if (this.state.upLoading) {
      return false
    }
    let {id, auto_ship_type,} = this.props.navigation.state.params.order;
    let reason_id = this.state.option;
    let reason_text = this.state.reason;
    let token = this.props.global.accessToken;
    let {dispatch} = this.props;
    let data = {
      type: auto_ship_type,
      reason_text: reason_text
    };
    console.log(id, reason_id, data, token);
    dispatch(cancelShip(id, reason_id, data, token, async (resp) => {
      this.setState({upLoading:false});
      if(resp.ok){
        ToastLong('撤销成功')
      }else {
        ToastLong(resp.desc)
      }

    }));
  }

  render() {
    const wayOpts = this.state.list.map((item, idx) => {
      return {label: item.info, value: item.id}
    });
    return <ScrollView style={[{backgroundColor: '#f2f2f2'}, {flex: 1}]}>
      <RadioCells
          style={{marginTop: 2}}
          options={wayOpts}
          onChange={this._onTypeSelected}
          cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
          value={this.state.option}
      />

      <ButtonArea style={{marginTop: 35}}>
        <Button type={this.state.option > 0 ? 'primary' : 'default'}
                disabled={this.state.option > 0 ? false : true}
                onPress={() => {
                  this.isShowDialog()
                }}
                style={[S.mlr15]}>撤回呼叫</Button>
      </ButtonArea>

      <Toast
          icon="loading"
          show={this.state.loading}
          onRequestClose={() => {
          }}
      >加载中</Toast>

      <Toast
          icon="loading"
          show={this.state.upLoading}
          onRequestClose={() => {
          }}
      >提交中</Toast>

      <Dialog onRequestClose={() => {
      }}
              visible={this.state.showOtherDialog}
              title={'撤销理由'}
              buttons={[{
                type: 'default',
                label: '取消',
                onPress: () => {
                  this.setState({showOtherDialog: false})
                }
              }, {
                type: 'primary',
                label: '确定',
                onPress: async () => {
                  this.setState({showOtherDialog: false, upLoading: true})
                  this.upCancelShip()

                }
              }]}
      >
        <Input
            multiline={true}
            style={{height: pxToDp(90)}}
            value={this.state.reason}
            onChangeText={(text) => {
              this.setState({reason: text})
            }}
        />
      </Dialog>

      <Dialog onRequestClose={() => {
      }}
              visible={this.state.showDialog}
              title={''}
              buttons={[{
                type: 'default',
                label: '取消',
                onPress: () => {
                  this.setState({showDialog: false})
                }
              }, {
                type: 'primary',
                label: '确定',
                onPress: async () => {
                  this.setState({showDialog: false, upLoading: true})
                  this.upCancelShip()
                }
              }]}
      >
        <Text>确定撤销呼叫吗?</Text>
      </Dialog>
    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderCancelShip)