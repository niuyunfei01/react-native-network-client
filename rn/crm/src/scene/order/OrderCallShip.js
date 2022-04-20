import React, {Component} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../pubilc/util/CommonStyles'

import {orderCallShip} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {Button, ButtonArea, CellsTitle, Dialog, RadioCells} from "../../weui/index";
import Cts from "../../pubilc/common/Cts";
import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";
import dayjs from "dayjs";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderCallShip}, dispatch)}
}

class OrderCallShip extends Component {


  constructor(props: Object) {
    super(props);

    this.state = {
      option: -1,
      doneSubmitting: false,
      onSubmitting: false,
      alert_msg: '',
    };

    this._onTypeSelected = this._onTypeSelected.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  _onTypeSelected(idx) {
    this.setState({option: idx});
  }

  _checkDisableSubmit() {
    return !this.state.option;
  }

  _onClick() {
    if (this.state.option === Cts.SHIP_AUTO_FN) {
      const {order} = (this.props.route.params || {});
      let {expectTime} = order;
      const nowMoment = dayjs(new Date()).unix();
      const dSeconds = (dayjs(expectTime).unix() - nowMoment);
      let diffHours = 0;
      if (dSeconds > 0) {
        diffHours = Math.floor(dSeconds / 3600);
      }

      if (diffHours > 1) {
        diffHours = diffHours - 1;
        this.setState({alert_msg: `该订单是预订单, 配送员将在大约 ${diffHours}小时 后前来取单`});
      } else {
        this._doReply();
      }
    } else {
      this._doReply();
    }
  }

  _doReply() {
    const {dispatch, global, navigation, route} = this.props;
    const {order} = (route.params || {});
    this.setState({onSubmitting: true});
    showModal('提交中')
    dispatch(orderCallShip(global.accessToken, order.id, this.state.option, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      hideModal()
      if (ok) {
        showSuccess('已发出')
        // this.setState({doneSubmitting: true});
        navigation.goBack();
      } else {
        // this.setState({doneSubmitting: false});
        this.setState({errorHints: msg});
      }
    }))
  }

  render() {
    const {dispatch, route} = this.props;
    const {order} = (route.params || {});
    const wayOpts = order.callWays.map((way, idx) => {
      const estimate = way.estimate ? `(${way.estimate})` : '';
      return {label: `${way.name}${estimate}`, value: way.way}
    });

    return <ScrollView style={[{backgroundColor: '#f2f2f2'}, {flex: 1}]}>

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
      <Dialog
        onRequestClose={() => {
        }}
        visible={!!this.state.alert_msg}
        buttons={[{
          type: 'default',
          label: '知道了',
          onPress: () => {
            this.setState({alert_msg: ''});
            this._doReply();
          }
        }]}
      >
        <Text style={{color: 'red'}}>{this.state.alert_msg} </Text>
      </Dialog>

      <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center'}}>
        <Text style={{fontSize: 14, color: 'red'}}>专送平台没有改自配送之前不要使用第三方配送！</Text>
      </View>

      <CellsTitle style={CommonStyle.cellsTitle}>选择第三方配送</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={wayOpts}
        onChange={this._onTypeSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.option}
      />

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._onClick}
                style={{marginHorizontal: 15}}>发配送</Button>
      </ButtonArea>

      {/*<Toast*/}
      {/*  icon="loading"*/}
      {/*  show={this.state.onSubmitting}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>提交中</Toast>*/}

      {/*<Toast*/}
      {/*  icon="success"*/}
      {/*  show={this.state.doneSubmitting}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>已发出</Toast>*/}
    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderCallShip)