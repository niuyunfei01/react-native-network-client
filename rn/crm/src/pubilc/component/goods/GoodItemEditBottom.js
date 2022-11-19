import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import Cts from "../../common/Cts";
import BottomModal from "../BottomModal";
import Mapping from "../../Mapping";
import HttpUtils from "../../util/http";
import {showError} from "../../util/ToastUtils";
import colors from "../../styles/colors";
import MultiSpecsModal from "./MultiSpecsModal";
import CommonModal from "./CommonModal";
import AntDesign from "react-native-vector-icons/AntDesign";
import {CheckBox} from 'react-native-elements'

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
    beforePrice: PropTypes.number.isRequired,
    navigation: PropTypes.object,
    storePro: PropTypes.object,
    skuName: PropTypes.string,
  }

  state = {
    onSubmitting: false,
    pid: '',
    setPrice: '',
    setPriceAddInventory: '',
    remainNum: 0,
    totalRemain: 0,
    offOption: -1,
    storePro: this.props.storePro && this.props.storePro,
    orderUse: 0,
  }

  static getDerivedStateFromProps(props, state) {
    if (props.pid && (props.pid !== state.pid || props.modalType !== state.modalType)) {
      return {
        onSubmitting: false,
        pid: props.pid,
        modalType: props.modalType,
        setPrice: parseFloat(props.applyingPrice / 100).toFixed(2),
        offOption: Cts.RE_ON_SALE_MANUAL,
        setPriceAddInventory: (props.storePro && props.storePro.sp) && props.storePro.sp.left_since_last_stat,
        remainNum: (props.storePro && props.storePro.sp) && props.storePro.sp.left_since_last_stat,
        totalRemain: (props.storePro && props.storePro.sp) && props.storePro.sp.left_since_last_stat,
      }
    }
    return null;
  }

  resetModal = () => {
    //this.setItem(-1)
    const {onClose} = this.props
    onClose()
  }

  onOnSale = (accessToken, storeId, currStatus, doneProdUpdate) => {
    const destStatus = Mapping.Product.STORE_PRODUCT_STATUS.ON_SALE.value
    const {pid} = this.state;
    const url = `/api/store_chg_status/${storeId}/${pid}/${currStatus}/${destStatus}?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url).then(() => {
      this.resetModal()
      doneProdUpdate(pid, {}, {status: destStatus})
    }, (res) => {
      this.resetModal()
      showError(`上架失败：${res.reason}`)
    }).catch(error => {
      this.resetModal()
      showError(`上架失败：${error.reason}`)
    })
  }

  onOffSale = (accessToken, spId, doneProdUpdate) => {
    const {pid, offOption} = this.state
    const url = `/api/chg_item_when_on_sale/${spId}/${offOption}?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url).then(res => {
      this.resetModal()
      doneProdUpdate(pid, {}, {status: res.destStatus})

    }, (res) => {
      this.resetModal()
      showError(`下架失败：${res.reason}`)
    }).catch(error => {
      this.resetModal()
      showError(`下架失败：${error.reason}`)
    })
  }

  fetchData() {
    const api = `api_products/inventory_check_info?access_token=${this.props.global.accessToken}`
    this.setState({loading: true})
    HttpUtils.get.bind(this.props)(api, {
      productId: this.state.pid,
      storeId: this.props.storeId
    }).then(res => {
      this.setState({
        remainNum: res.left_since_last_stat,
        orderUse: res.orderUse,
        setPriceAddInventory: res.totalRemain
      })
    })
  }

  setItem = (value) => {
    this.setState({offOption: value})
  }

  render() {
    const {
      productName,
      accessToken,
      storeId,
      currStatus,
      spId,
      modalType,
      doneProdUpdate,
      navigation,
      storePro,
      vendor_id
    } = this.props;
    const {offOption} = this.state
    return (
      <If condition={modalType}>
        <>

          <BottomModal title={'上  架'} actionText={'确认上架'}
                       onPress={() => this.onOnSale(accessToken, storeId, currStatus, doneProdUpdate)}
                       onClose={this.resetModal} visible={modalType === 'on_sale'}
                       btnStyle={{backgroundColor: colors.main_color}}
          >
            <Text style={[styles.n1b, {marginTop: 10, marginBottom: 10}]}>{productName} </Text>
          </BottomModal>
          <CommonModal visible={modalType === 'off_sale'} onRequestClose={this.resetModal} position={'flex-end'}>
            <View style={styles.offSaleWrap}>
              <View style={styles.offSaleTitleWrap}>
                <View/>
                <Text style={styles.offSaleTitleText}>
                  下架
                </Text>
                <AntDesign name={'close'} size={24} onPress={this.resetModal}/>
              </View>
              <Text style={styles.offSaleProductNameText}>
                {productName}
              </Text>
              <LineView/>
              <Text style={styles.offSaleItemTitle}>
                将状态改为下架
              </Text>
              <TouchableOpacity style={styles.offSaleItemWrap} onPress={() => this.setItem(Cts.RE_ON_SALE_OFF_WORK)}>
                <CheckBox center type={'material'} color={'green'} size={16} checkedIcon={'dot-circle-o'}
                          uncheckedIcon={'circle-o'} checked={offOption === Cts.RE_ON_SALE_OFF_WORK}
                          style={{backgroundColor: 'red'}} onPress={() => this.setItem(Cts.RE_ON_SALE_OFF_WORK)}/>
                <Text style={styles.offSaleItemContent}>
                  打烊后自动上架
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.offSaleItemWrap} onPress={() => this.setItem(Cts.RE_ON_SALE_MANUAL)}>
                <CheckBox type={'material'} color={'green'} size={16} checkedIcon={'dot-circle-o'}
                          uncheckedIcon={'circle-o'} checked={offOption === Cts.RE_ON_SALE_MANUAL}
                          style={{backgroundColor: 'red'}} onPress={() => this.setItem(Cts.RE_ON_SALE_MANUAL)}/>
                <Text style={styles.offSaleItemContent}>
                  不要自动上架
                </Text>
              </TouchableOpacity>
              <Text style={styles.offSaleItemTitle}>
                从本店删除
              </Text>
              <TouchableOpacity style={styles.offSaleItemWrap} onPress={() => this.setItem(Cts.RE_ON_SALE_NONE)}>
                <CheckBox type={'material'} color={'green'} size={16} checkedIcon={'dot-circle-o'}
                          uncheckedIcon={'circle-o'} checked={offOption === Cts.RE_ON_SALE_NONE}
                          style={{backgroundColor: 'red'}} onPress={() => this.setItem(Cts.RE_ON_SALE_NONE)}/>
                <Text style={styles.offSaleItemContent}>
                  从本店的各个平台渠道下架, 并删除本品
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={offOption !== Cts.RE_ON_SALE_PROVIDED ? styles.offSaleSaveWrapSelect : styles.offSaleSaveWrap}
                onPress={() => this.onOffSale(accessToken, spId, doneProdUpdate)}>
                <Text style={styles.offSaleSaveText}>
                  确认
                </Text>
              </TouchableOpacity>
            </View>
          </CommonModal>

          <MultiSpecsModal
            visible={modalType === 'set_price' || modalType === 'update_apply_price' || modalType === 'set_price_add_inventory'}
            onClose={this.resetModal}
            storePro={storePro}
            storeId={storeId}
            productName={productName}
            accessToken={accessToken}
            navigation={navigation}
            vendor_id={vendor_id}/>
        </>
      </If>
    )
  }
}

const LineView = () => {
  return (
    <View style={styles.line}/>
  )
}

const styles = StyleSheet.create({
  n1b: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: "bold"
  },
  n2: {
    color: colors.color333,
    fontSize: 12,
    marginRight: 5
  },
  line: {borderBottomColor: colors.colorEEE, borderBottomWidth: 1},
  offSaleWrap: {
    backgroundColor: colors.white, borderTopLeftRadius: 8, borderTopRightRadius: 8
  },
  offSaleTitleWrap: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center'
  },
  offSaleTitleText: {
    fontSize: 18, fontWeight: '600', color: colors.color333, lineHeight: 25
  },
  offSaleProductNameText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    paddingLeft: 16,
    paddingBottom: 5
  },
  offSaleItemTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    paddingTop: 26,
    paddingLeft: 31,
  },
  offSaleItemWrap: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingLeft: 46
  },
  offSaleItemContent: {
    fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20
  },
  offSaleSaveWrap: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 21,
    marginTop: 45,
    backgroundColor: colors.colorCCC,
    borderRadius: 2
  },
  offSaleSaveWrapSelect: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 21,
    marginTop: 45,
    backgroundColor: colors.main_color,
    borderRadius: 2
  },
  offSaleSaveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    paddingTop: 7,
    paddingBottom: 7,
    textAlign: 'center'
  }
});

export default GoodItemEditBottom
