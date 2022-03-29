import React, {Component} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderCallShip} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {Button, ButtonArea, CellsTitle, Dialog, RadioCells} from "../../weui/index";

import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderCallShip}, dispatch)}
}

class OrderShipDetail extends Component {
  constructor(props: Object) {
    super(props);

    this.state = {
      option: -1,
      doneSubmitting: false,
      onSubmitting: false,
    };

    this._onTypeSelected = this._onTypeSelected.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);
  }

  _onTypeSelected(idx) {
    this.setState({option: idx});
  }

  _checkDisableSubmit() {
    return !this.state.option;
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
        showSuccess('已经发出')
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
    const {dispatch, global, navigation, route} = this.props;
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
      ><Text>{this.state.errorHints} </Text></Dialog>

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
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply}
                style={{marginHorizontal: 15}}>发配送</Button>
      </ButtonArea>

      {/*<Toast*/}
      {/*  icon="loading"*/}
      {/*  show={this.state.onSubmitting}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>提交中</Toast>*/}


    </ScrollView>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderShipDetail)
