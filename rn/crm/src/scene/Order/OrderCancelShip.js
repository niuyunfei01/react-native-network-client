import React, {Component} from 'react'
import {ScrollView, Text, TextInput} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {cancelReasonsList, cancelShip, orderCallShip} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {Button, ButtonArea, Dialog, RadioCells} from "../../weui/index";

import pxToDp from "../../util/pxToDp";
import Cts from "../../pubilc/common/Cts";
import {hideModal, showModal, ToastLong} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderCallShip, cancelReasonsList, cancelShip}, dispatch)}
}

class OrderCancelShip extends Component {

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

  UNSAFE_componentWillMount() {
    this.getCancelReasons();
  }

  _onTypeSelected(idx) {
    this.setState({option: idx});
  }

  isShowDialog() {
    let option = this.state.option;
    if (option === Cts.ORDER_CANCEL_SHIP_REASON) {
      this.setState({showOtherDialog: true, reason: ''})
    } else {
      this.setState({showDialog: true})
    }
  }

  timeOutBack(time) {
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  getCancelReasons() {
    let token = this.props.global.accessToken;
    let {ship_id = 0} = this.props.route.params;
    let {dispatch} = this.props;

    let {order} = this.props.route.params;
    const order_id = order ? order.id : 0;

    dispatch(cancelReasonsList(ship_id, order_id, token, async (resp) => {
      this.setState({loading: false});
      if (resp.ok) {
        this.setState({list: resp.obj, loading: false});
      } else {
        ToastLong(`错误: ${resp.desc}`)
      }
    }));
  }

  async upCancelShip() {
    if (this.state.upLoading) {
      return false
    }
    let {ship_id = 0} = this.props.route.params;
    let reason_id = this.state.option;
    let token = this.props.global.accessToken;
    let {dispatch} = this.props;

    let {order} = this.props.route.params;
    const order_id = order ? order.id : 0;

    const self = this;
    dispatch(cancelShip(ship_id, reason_id, order_id, token, async (ok, reason) => {
      this.setState({upLoading: false});
      hideModal()
      if (ok) {
        ToastLong('撤回成功, 即将返回 ');
        this.timeOutBack(300);
        self.props.route.params.onCancelled && self.props.route.params.onCancelled(ok, reason);
      } else {
        ToastLong(reason)
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
                disabled={this.state.option <= 0}
                onPress={() => {
                  this.isShowDialog()
                }}
                style={{marginHorizontal: 15}}>撤回</Button>
      </ButtonArea>

      {/*<Toast*/}
      {/*  icon="loading"*/}
      {/*  show={this.state.loading}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>加载中</Toast>*/}

      {/*<Toast*/}
      {/*  icon="loading"*/}
      {/*  show={this.state.upLoading}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>提交中</Toast>*/}

      <Dialog onRequestClose={() => {
      }}
              visible={this.state.showOtherDialog}
              title={'撤回理由'}
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
                  this.setState({showOtherDialog: false, upLoading: true});
                  showModal('提交中')
                  this.upCancelShip()
                }
              }]}>
        <TextInput
          multiline={true}
          style={{height: pxToDp(70), borderBottomWidth: pxToDp(1), borderBottomColor: colors.main_color}}
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
                  this.setState({showDialog: false, upLoading: true});
                  showModal('提交中')
                  this.upCancelShip()
                }
              }]}
      >
        <Text>确定撤回吗?</Text>
      </Dialog>
    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderCancelShip)
