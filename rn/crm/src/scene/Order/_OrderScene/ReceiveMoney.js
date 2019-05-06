import React from 'react'
import {withNavigation} from "react-navigation";
import ConfirmDialog from "../../component/ConfirmDialog";
import {StyleSheet, TextInput, View} from "react-native";
import Dialog from "../../component/Dialog";
import HttpUtils from "../../../util/http";
import QRCode from 'react-native-qrcode';
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import PropTypes from "prop-types";
import {connect} from "react-redux";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class ReceiveMoney extends React.Component {
  static propTypes = {
    formVisible: PropTypes.bool.isRequired,
    onCloseForm: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired
  }
  
  constructor (props) {
    super(props)
    this.state = {
      receiveQrText: '',
      visibleReceiveQr: false,
      amount: '',
      remark: '订单补款'
    }
  }
  
  showReceiveQr (order) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const url = `/api/gen_wx_pay_qr?access_token=${accessToken}`
    const data = {
      orderId: order.id,
      storeId: order.store_id,
      amount: this.state.amount,
      remark: this.state.remark
    }
    HttpUtils.get.bind(self.props)(url, data).then(res => {
      self.setState({receiveQrText: res.result, visibleReceiveQr: true})
      self.props.onCloseForm()
    })
  }
  
  closeQr () {
    this.setState({visibleReceiveQr: false})
  }
  
  renderForm () {
    return (
      <ConfirmDialog
        visible={this.props.formVisible}
        onClickCancel={() => this.props.onCloseForm()}
        onClickConfirm={() => this.showReceiveQr(this.props.order)}
      >
        <View>
          <TextInput
            underlineColorAndroid='transparent'
            placeholder="请输入金额"
            onChangeText={(amount) => this.setState({amount})}
            value={this.state.amount}
            placeholderTextColor={'#cad0d9'}
            style={styles.formInput}
          />
          
          <TextInput
            underlineColorAndroid='transparent'
            placeholder="请输入原因"
            onChangeText={(remark) => this.setState({remark})}
            value={this.state.remark}
            placeholderTextColor={'#cad0d9'}
            multiline={true}
            numberOfLines={5}
            style={[styles.formInput, styles.formTextArea]}
          />
        </View>
      </ConfirmDialog>
    )
  }
  
  renderQr () {
    return (
      <Dialog
        visible={this.state.visibleReceiveQr}
        onRequestClose={() => this.closeQr()}
        align={'center'}
      >
        <QRCode
          value={this.state.receiveQrText}
          size={200}
          bgColor='black'
          fgColor='white'
        />
      </Dialog>
    
    )
  }
  
  render (): React.ReactNode {
    return (
      <View>
        {this.renderForm()}
        {this.renderQr()}
      </View>
    )
  }
}

export default withNavigation(connect(mapStateToProps)(ReceiveMoney))

const styles = StyleSheet.create({
  formContainer: {},
  formInput: {
    borderWidth: pxToDp(1),
    borderColor: colors.main_color,
    marginHorizontal: pxToDp(50),
    paddingLeft: pxToDp(45),
    textAlign: 'left'
  },
  formTextArea: {
    marginTop: pxToDp(30)
  }
})