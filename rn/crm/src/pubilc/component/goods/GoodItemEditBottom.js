import React from 'react'
import PropTypes from 'prop-types'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import Cts from "../../common/Cts";
import BottomModal from "../BottomModal";
import {Checkbox, SegmentedControl, WhiteSpace} from "@ant-design/react-native";
import {Left} from "../../../scene/common/component/All";
import Mapping from "../../Mapping";
import HttpUtils from "../../util/http";
import {Dialog} from "../../../weui/Dialog";
import {hideModal, showModal, ToastShort} from "../../util/ToastUtils";
import colors from "../../styles/colors";
import Config from "../../common/config";
import {Button} from "react-native-elements";

const AgreeItem = Checkbox.AgreeItem;

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
    storePro: PropTypes.object
  }

  state = {
    onSubmitting: false,
    modalType: '',
    errorMsg: '',
    pid: '',
    setPrice: '',
    setPriceAddInventory: '',
    remainNum: 0,
    offOption: Cts.RE_ON_SALE_MANUAL,
    storePro: this.props.storePro && this.props.storePro,
    orderUse: 0
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
        setPriceAddInventory: (props.storePro && props.storePro.left_since_last_stat) ? props.storePro.left_since_last_stat : props.storePro.sp.left_since_last_stat,
        remainNum: (props.storePro && props.storePro.left_since_last_stat) ? props.storePro.left_since_last_stat : props.storePro.sp.left_since_last_stat,
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
    showModal('提交中')
    const url = `/api/store_chg_status/${storeId}/${pid}/${currStatus}/${destStatus}?access_token=${accessToken}`;
    HttpUtils.post.bind(this.props)(url).then(res => {
      hideModal()
      this.resetModal()
      doneProdUpdate(pid, {}, {status: destStatus})
    }, (res) => {
      hideModal()
      this.setState({onSubmitting: false, errorMsg: `上架失败：${res.reason}`})
    })
  }

  onOffSale = (accessToken, spId, doneProdUpdate) => {
    const pid = this.state.pid
    const option = this.state.offOption
    const url = `/api/chg_item_when_on_sale/${spId}/${option}?access_token=${accessToken}`;
    this.resetModal()
    this.setState({onSubmitting: true})
    HttpUtils.post.bind(this.props)(url).then(res => {
      this.resetModal()
      doneProdUpdate(pid, {}, {status: res.destStatus})
    }, (res) => {
      this.setState({onSubmitting: false, errorMsg: `下架失败：${res.reason}`})
    })
  }

  onChangeGoodsPrice = (accessToken, storeId, beforePrice, doneProdUpdate, proId, itemPrice) => {
    let pid = 0
    if (proId === 0) {
      pid = this.state.pid
    } else {
      pid = proId
    }
    if (this.state.setPrice !== '' && this.state.setPrice >= 0) {
      const applyPrice = this.state.setPrice * 100;
      let price = 0
      if (itemPrice) {
        price = itemPrice * 100
      } else {
        price = applyPrice
      }
      const params = {
        store_id: storeId,
        product_id: pid,
        apply_price: price,
        before_price: beforePrice,
        remark: '',
        auto_on_sale: 0,
        autoOnline: 0,
        access_token: accessToken,
      }
      this.setState({onSubmitting: true})
      HttpUtils.get.bind(this.props)(`/api/apply_store_price`, params).then((obj) => {
        this.resetModal()
        doneProdUpdate(pid, {}, {applying_price: applyPrice})
      }, (res) => {
        this.setState({onSubmitting: false, errorMsg: `报价失败：${res.reason}`})
      })
    }
  }

  onChangeGoodsPriceAndInventory = (accessToken, storeId, beforePrice, doneProdUpdate) => {
    const pid = this.state.pid
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
        this.resetModal()
        doneProdUpdate(pid, {}, {applying_price: applyPrice})
      }, (res) => {
        this.setState({onSubmitting: false, errorMsg: `报价失败：${res.reason}`})
      })
    }
  }

  handleSubmit(accessToken, storeId, beforeStock, pId) {
    const self = this
    let pid = ''
    if (pId === 0) {
      pid = this.state.pid
    } else {
      pid = pId
    }
    let actualNum = self.state.setPriceAddInventory
    let remainNum = self.state.remainNum
    const api = `api_products/inventory_check?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeId: storeId,
      productId: pid,
      remainNum: remainNum,
      orderUse: this.state.orderUse,
      totalRemain: beforeStock,
      actualNum: actualNum,
      differenceType: 2,
      remark: '快速盘点'
    }).then(res => {
      this.resetModal()
      ToastShort(`#${self.state.pid} 实际库存 ${self.state.setPriceAddInventory}`)
    }).catch(e => {
      if (e.obj == 'THEORY_NUM_CHANGED') {
        self.fetchData()
      }
    })
  }

  fetchData() {
    const self = this
    const api = `api_products/inventory_check_info?access_token=${this.props.global.accessToken}`
    self.setState({loading: true})
    HttpUtils.get.bind(self.props)(api, {
      productId: this.state.pid,
      storeId: self.props.storeId
    }).then(res => {
      self.setState({
        remainNum: res.left_since_last_stat,
        orderUse: res.orderUse,
        setPriceAddInventory: res.totalRemain
      })
    })
  }

  render(): React.ReactNode {
    const {
      productName,
      strictProviding,
      accessToken,
      storeId,
      currStatus,
      spId,
      beforePrice,
      doneProdUpdate,
      navigation,
      storePro
    } = this.props;
    const modalType = this.state.modalType
    const width = Dimensions.get("window").width


    return modalType ? <View>

      <BottomModal title={'上  架'} actionText={'确认上架'}
                   onPress={() => this.onOnSale(accessToken, storeId, currStatus, doneProdUpdate)}
                   onClose={this.resetModal} visible={modalType === 'on_sale'}
                   btnStyle={{backgroundColor: colors.main_color}}
      >
        <Text style={[styles.n1b, {marginTop: 10, marginBottom: 10}]}>{productName} </Text>
      </BottomModal>

      <BottomModal title={'下  架'} actionText={'确认修改'} onPress={() => this.onOffSale(accessToken, spId, doneProdUpdate)}
                   onClose={this.resetModal} visible={modalType === 'off_sale'}
                   btnStyle={{backgroundColor: colors.main_color}}
      >
        <Text style={[styles.n1b, {marginTop: 10, marginBottom: 10}]}>{productName} </Text>
        <SegmentedControl values={['改为缺货', '从本店删除']} onChange={e => {
          const idx = e.nativeEvent.selectedSegmentIndex
          this.setState({offOption: idx === 1 ? Cts.RE_ON_SALE_NONE : Cts.RE_ON_SALE_MANUAL})
        }}/>

        <WhiteSpace size={'lg'}/>
        {this.state.offOption !== Cts.RE_ON_SALE_NONE && <View>
          <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_OFF_WORK} onChange={(e) => {
            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_OFF_WORK : Cts.RE_ON_SALE_MANUAL})
          }}>打烊后自动上架</AgreeItem>

          <WhiteSpace size={'lg'}/>
          <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_MANUAL} onChange={e => {
            this.setState({offOption: Cts.RE_ON_SALE_MANUAL})
          }}>不要自动上架</AgreeItem>
          <WhiteSpace size={'lg'}/>
          {strictProviding && <AgreeItem checked={this.state.offOption === Cts.RE_ON_SALE_PROVIDED} onChange={e => {
            this.setState({offOption: e.target.checked ? Cts.RE_ON_SALE_PROVIDED : Cts.RE_ON_SALE_MANUAL})
          }}>订货送到后自动上架</AgreeItem>}
          <WhiteSpace/>
        </View>}

        {this.state.offOption === Cts.RE_ON_SALE_NONE && <View>
          <Text style={[styles.n2, {paddingLeft: 10}]}>从本店的各个平台渠道下架, 并删除本品</Text>
          <WhiteSpace size={'lg'}/>
        </View>}
      </BottomModal>

      <BottomModal title={'报  价'} actionText={'保存'}
                   onPress={() => this.onChangeGoodsPrice(accessToken, storeId, beforePrice, doneProdUpdate, 0)}
                   btnStyle={{backgroundColor: colors.main_color}}
                   onClose={this.resetModal} visible={modalType === 'set_price' || modalType === 'update_apply_price'}>
        <Text style={[styles.n1b, {marginTop: 10, marginBottom: 10, flex: 1}]}>{productName} </Text>
        <Left title="报价" placeholder="" required={true} value={this.state.setPrice} type="numeric"
              right={<Text style={styles.n2}>元</Text>}
              textInputAlign='center'
              textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
              onChangeText={text => this.setState({setPrice: text})}/>
        <If condition={storePro && storePro.skus !== undefined}>
          <For each="info" index="i" of={storePro.skus}>
            <View key={i}>
              <Text
                style={[styles.n1b, {marginTop: 10, marginBottom: 10, flex: 1}]}>{productName}[{info.sku_name}] </Text>

              <Left title="报价" placeholder="" required={true}
                    value={info.supply_pricee !== undefined ? info.supply_pricee : parseFloat(info.supply_price / 100).toFixed(2)}
                    type="numeric"
                    right={
                      <View style={{flex: 1, flexDirection: "row", alignItems: "center", padding: 10}}>
                        <Text style={styles.n2}>元</Text>
                        <Button buttonStyle={{
                          backgroundColor: colors.main_color,
                          width: width * 0.15,
                          height: 30,
                          marginRight: 10, borderColor: colors.fontColor,
                          borderRightWidth: 1
                        }}
                                titleStyle={{color: colors.white, fontSize: 12}}
                                title="修改"
                                onPress={() => this.onChangeGoodsPrice(accessToken, storeId, parseFloat(info.supply_price / 100).toFixed(2), doneProdUpdate, info.product_id, info.supply_pricee)}/></View>
                    }
                    textInputAlign='center'
                    textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
                    onChangeText={(text) => {
                      let storePro = this.state.storePro
                      info.supply_pricee = text;
                      this.setState({storePro: storePro})
                    }}/>
            </View>
          </For>
        </If>
      </BottomModal>

      <BottomModal title={'价格/库存'} actionText={'关 闭'}
                   onPress={this.resetModal}
                   btnStyle={{backgroundColor: colors.warn_color}}
                   onClose={this.resetModal} visible={modalType === 'set_price_add_inventory'}>
        <View style={{marginVertical: 10}}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
            <Text style={[styles.n1b, {marginBottom: 10, flex: 1, marginLeft: 15}]}>{productName} </Text>
            <Text style={{color: colors.main_color, marginBottom: 10, marginRight: 15}} onPress={() => {
              this.resetModal()
              navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
                productId: this.props.pid,
                storeId: storeId
              })
            }}>盘点历史 </Text>
          </View>
          <Left title="报价" placeholder="" required={true} value={this.state.setPrice} type="numeric"
                right={
                  <View style={{flex: 1, flexDirection: "row", alignItems: "center", padding: 10}}>
                    <Text style={styles.n2}>元</Text>
                    <Button buttonStyle={{
                      backgroundColor: colors.main_color,
                      width: width * 0.15,
                      height: 30,
                      marginRight: 10, borderColor: colors.fontColor,
                      borderRightWidth: 1
                    }}
                            titleStyle={{color: colors.white, fontSize: 12}}
                            title="修改"
                            onPress={() => this.onChangeGoodsPrice(accessToken, storeId, beforePrice, doneProdUpdate, 0)}/></View>
                }
                textInputAlign='center'
                textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
                onChangeText={text => {
                  this.setState({setPrice: text})
                }
                }/>
          <Left title="库存" placeholder="请输入库存数量" required={true} value={this.state.setPriceAddInventory} type="numeric"
                right={
                  <View style={{flex: 1, flexDirection: "row", alignItems: "center", padding: 10}}>
                    <Text style={styles.n2}>份</Text>
                    <Button buttonStyle={{
                      backgroundColor: colors.main_color,
                      width: width * 0.15,
                      height: 30,
                      marginRight: 10, borderColor: colors.fontColor,
                      borderRightWidth: 1
                    }}
                            titleStyle={{color: colors.white, fontSize: 12}}
                            title="修改"
                            onPress={() => this.handleSubmit(accessToken, storeId, this.state.remainNum, 0)}/></View>
                }
                textInputAlign='center'
                textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
                onChangeText={text => this.setState({setPriceAddInventory: text})}/>
        </View>
        <If condition={storePro && storePro.skus !== undefined}>
          <For each="info" index="i" of={storePro.skus}>
            <View key={i}>
              <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <Text style={[styles.n1b, {
                  marginBottom: 10,
                  flex: 1,
                  marginLeft: 15
                }]}>{productName}[{info.sku_name}] </Text>
                <Text style={{color: colors.main_color, marginBottom: 10, marginRight: 15}} onPress={() => {
                  this.resetModal()
                  navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
                    productId: info.id,
                    storeId: storeId
                  })
                }}>盘点历史 </Text>
              </View>
              <Left title="报价" placeholder="" required={true}
                    value={info.supply_pricee !== undefined ? info.supply_pricee : parseFloat(info.supply_price / 100).toFixed(2)}
                    type="numeric"
                    right={
                      <View style={{flex: 1, flexDirection: "row", alignItems: "center", padding: 10}}>
                        <Text style={styles.n2}>元</Text>
                        <Button buttonStyle={{
                          backgroundColor: colors.main_color,
                          width: width * 0.15,
                          height: 30,
                          marginRight: 10, borderColor: colors.fontColor,
                          borderRightWidth: 1
                        }}
                                titleStyle={{color: colors.white, fontSize: 12}}
                                title="修改"
                                onPress={() => this.onChangeGoodsPrice(accessToken, storeId, parseFloat(info.supply_price / 100).toFixed(2), doneProdUpdate, info.id, info.supply_pricee)}/></View>
                    }
                    textInputAlign='center'
                    textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
                    onChangeText={(text) => {
                      let storePro = this.state.storePro
                      info.supply_pricee = text;
                      this.setState({storePro: storePro})
                    }}/>
              <Left title="库存" placeholder="请输入库存数量" required={true}
                    value={info.stockNum !== undefined ? info.stockNum : info.left_since_last_stat} type="numeric"
                    right={
                      <View style={{flex: 1, flexDirection: "row", alignItems: "center", padding: 10}}>
                        <Text style={styles.n2}>份</Text>
                        <Button buttonStyle={{
                          backgroundColor: colors.main_color,
                          width: width * 0.15,
                          height: 30,
                          marginRight: 10, borderColor: colors.fontColor,
                          borderRightWidth: 1
                        }}
                                titleStyle={{color: colors.white, fontSize: 12}}
                                title="修改"
                                onPress={() => this.handleSubmit(accessToken, storeId, this.state.remainNum, 0)}/></View>
                    }
                    textInputAlign='center'
                    textInputStyle={[styles.n2, {marginRight: 10, height: 40}]}
                    onChangeText={text => {
                      let storeItemStock = this.state.storePro
                      info.stockNum = text
                      this.setState({
                        storePro: storeItemStock
                      })
                    }}/>
            </View>
          </For>
        </If>
      </BottomModal>

      <Dialog onRequestClose={() => {
      }} visible={!!this.state.errorMsg}
              buttons={[{type: 'default', label: '知道了', onPress: () => this.setState({errorMsg: ''})}]}>
        <View><Text style={{color: '#000'}}>{this.state.errorMsg} </Text></View>
      </Dialog>
    </View> : null
  }
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

});

export default GoodItemEditBottom
