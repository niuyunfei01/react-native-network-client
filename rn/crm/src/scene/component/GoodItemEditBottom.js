import React from 'react'
import PropTypes from 'prop-types'
import {Text, View} from 'react-native'
import Styles from "../../themes/Styles";
import Cts from "../../Cts";
import BottomModal from "./BottomModal";

import {SegmentedControl, WhiteSpace} from "@ant-design/react-native";
import {Checkbox} from '@ant-design/react-native';
const AgreeItem = Checkbox.AgreeItem;
import {Left} from "./All";
import Mapping from "../../Mapping";
import HttpUtils from "../../util/http";
import Toast from "../../weui/Toast/Toast";
import {Dialog} from "../../weui/Dialog";

class GoodItemEditBottom extends React.Component {
  static propTypes = {
    pid: PropTypes.number.isRequired,
    modalType: PropTypes.string,
    productName: PropTypes.string.isRequired,
    strictProviding: PropTypes.bool.isRequired,
    accessToken: PropTypes.string.isRequired,
    storeId: PropTypes.number.isRequired,
    currStatus: PropTypes.number.isRequired,
    doneProdUpdate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    spId: PropTypes.number.isRequired,
    applyingPrice: PropTypes.number.isRequired,
    beforePrice: PropTypes.number.isRequired
  }

  state = {
    onSubmitting: false,
    modalType: '',
    errorMsg: '',
    pid: '',
    setPrice: '',
    offOption: Cts.RE_ON_SALE_MANUAL
  }

  static getDerivedStateFromProps(props, state) {
    if (props.pid && (props.pid !== state.pid || props.modalType !== state.modalType)) {
      return {
        onSubmitting: false,
        errorMsg: '',
        pid: props.pid,
        modalType: props.modalType,
        setPrice: parseFloat(props.applyingPrice / 100).toFixed(2),
        offOption: Cts.RE_ON_SALE_MANUAL,
      }
    }
    return null;
  }

  resetModal = () => {
    const {onClose} = this.props
    onClose()
  }

  onOnSale = (accessToken, storeId, currStatus, doneProdUpdate) => {
      const destStatus = Mapping.Product.STORE_PRODUCT_STATUS.ON_SALE.value
      const {pid} = this.state;

      this.setState({onSubmitting: true})
      const url = `/api/store_chg_status/${storeId}/${pid}/${currStatus}/${destStatus}?access_token=${accessToken}`;
      HttpUtils.post.bind(this.props)(url).then(res => {
        this.resetModal()
        doneProdUpdate(pid, {}, {status: destStatus})
      }, (res) => {
        this.setState({onSubmitting: false, errorMsg: `上架失败：${res.reason}`})
      })
  }

  onOffSale = (accessToken, spId, doneProdUpdate) => {
      const pid = this.state.pid
      const option = this.state.offOption
      const url = `/api/chg_item_when_on_sale/${spId}/${option}?access_token=${accessToken}`;

      this.setState({onSubmitting: true})
      HttpUtils.post.bind(this.props)(url).then(res => {
        this.resetModal()
        doneProdUpdate(pid, {}, {status: res.destStatus})
      }, (res) => {
        this.setState({onSubmitting: false, errorMsg: `下架失败：${res.reason}`})
      })
  }

  onChangeGoodsPrice = (accessToken, storeId, beforePrice, doneProdUpdate) => {
    const pid = this.state.pid
    console.log("start updating ", pid, this.state.setPrice)
    if (this.state.setPrice !== '' && this.state.setPrice >= 0) {
      const applyPrice = this.state.setPrice * 100;
      const params = {
        store_id: storeId,
        product_id: pid,
        apply_price: applyPrice,
        before_price: beforePrice,
        remark: '',
        auto_on_sale: 0,
        autoOnline: 0,
        access_token: accessToken,
      }
      this.setState({onSubmitting: true})
      HttpUtils.get.bind(this.props)(`/api/apply_store_price`, params).then((obj) => {
        doneProdUpdate(pid, {}, {applying_price: applyPrice})
        this.resetModal()
      }, (res) => {
        this.setState({onSubmitting: false, errorMsg: `报价失败：${res.reason}`})
      })
    }
  }

  render(): React.ReactNode {
    const {productName, strictProviding, accessToken, storeId, currStatus, spId, beforePrice, doneProdUpdate} = this.props;
    const modalType = this.state.modalType

    return modalType ? <View>

      <BottomModal title={'上架'} actionText={'确认上架'} onPress={() => this.onOnSale(accessToken, storeId, currStatus, doneProdUpdate)}
                   onClose={this.resetModal} visible={modalType === 'on_sale'}>
        <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{productName}</Text>
      </BottomModal>

      <BottomModal title={'下架'} actionText={'确认修改'} onPress={() => this.onOffSale(accessToken, spId, doneProdUpdate) }
                   onClose={this.resetModal} visible={modalType === 'off_sale'}>
        <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{productName}</Text>
        <SegmentedControl values={['改为缺货', '从本店删除']} onChange={e => {
          const idx = e.nativeEvent.selectedSegmentIndex
          this.setState({offOption: idx === 1 ? Cts.RE_ON_SALE_NONE : Cts.RE_ON_SALE_MANUAL})
        }}/>
        <WhiteSpace size={'lg'}/>
        {this.state.offOption !== Cts.RE_ON_SALE_NONE && <View>
          <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_OFF_WORK} onChange={(e)=>{
            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_OFF_WORK : Cts.RE_ON_SALE_MANUAL})
          }}>打烊后自动上架</AgreeItem>
          <WhiteSpace size={'lg'}/>
          <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_MANUAL} onChange={e => {
            this.setState({offOption: Cts.RE_ON_SALE_MANUAL})
          }}>不要自动上架</AgreeItem>
          <WhiteSpace size={'lg'}/>
          {strictProviding && <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_PROVIDED} onChange={e => {
            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_PROVIDED: Cts.RE_ON_SALE_MANUAL})
          }}>订货送到后自动上架</AgreeItem>}
          <WhiteSpace/>
        </View>}

        {this.state.offOption === Cts.RE_ON_SALE_NONE && <View>
          <Text style={[Styles.n2, {paddingLeft: 10}]}>从本店的各个平台渠道下架, 并删除本品</Text>
          <WhiteSpace size={'lg'}/>
        </View>}
      </BottomModal>

      <BottomModal title={'报价'} actionText={'确认修改'} onPress={() => this.onChangeGoodsPrice(accessToken, storeId, beforePrice, doneProdUpdate) }
                   onClose={this.resetModal} visible={modalType === 'set_price'}>
        <Text style={[Styles.n1b, {marginTop:10, marginBottom: 10}]}>{productName}</Text>
        <Left title="报价" placeholder="" required={true} value={this.state.setPrice} type="numeric"
              right={<Text style={Styles.n2}>元</Text>}
              textInputAlign='right'
              textInputStyle={[Styles.n2, {marginRight: 10, height: 40}]}
              onChangeText={text => this.setState({setPrice: text})}/>
      </BottomModal>

      <Dialog onRequestClose={() => {}} visible={!!this.state.errorMsg}
              buttons={[{ type: 'default', label: '知道了', onPress: () => this.setState({errorMsg: ''}) }]}>
        <View><Text style={{color: '#000'}}>{this.state.errorMsg}</Text></View>
      </Dialog>
      <Toast icon="loading" show={this.state.onSubmitting} onRequestClose={() => { }}>提交中</Toast>
    </View> : null
  }
}

export default GoodItemEditBottom
