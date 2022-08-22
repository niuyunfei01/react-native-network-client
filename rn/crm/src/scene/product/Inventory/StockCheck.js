import React from 'react'
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {connect} from "react-redux";
import tool from "../../../pubilc/util/tool";
import pxToDp from "../../../pubilc/util/pxToDp";
import BaseComponent from "../../common/BaseComponent";
import {Button, Input} from "react-native-elements";
import native from "../../../pubilc/util/native";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "react-native-modal-selector";
import $V from "../../../weui/variable";
import colors from '../../../pubilc/styles/colors'
import Config from '../../../pubilc/common/config'
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class StockCheck extends BaseComponent {
  constructor(props: Object) {
    super(props);
    const store = tool.store(this.props.global)
    this.state = {
      productId: this.props.route.params.productId,
      storeId: store.id,
      storeName: store.name,
      storeCity: store.city,
      storeVendor: store.vendor,
      productName: this.props.route.params.productName,
      shelfNo: this.props.route.params.shelfNo,
      remainNum: 0,
      orderUse: 0,
      totalRemain: 0,
      actualNum: 0,
      remark: '',
      submitting: false,
      productInfo: {},
      checkTypes: [],
      checkType: {},
      loading: false,
      storeProd: this.props.route.params.storeProd.skus
    }

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation, global, route}) => {
    const store = tool.store(global)
    const productId = route.params.productId
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate(Config.ROUTE_INVENTORY_DETAIL, {storeId: store.id, productId})}
            style={{padding: 10}}>
            <FontAwesome5 name={'ellipsis-v'} style={{fontSize: 20}}/>
          </TouchableOpacity>
        )
      }
    })
  }

  componentDidMount() {
    this.fetchData()
    this.fetchStockCheckType()
  }

  fetchData() {
    const self = this
    const api = `api_products/inventory_check_info?access_token=${this.props.global.accessToken}`
    self.setState({loading: true})
    HttpUtils.get.bind(self.props)(api, {
      productId: this.props.route.params.productId,
      storeId: self.state.storeId
    }).then(res => {
      const { product } = res
      self.setState({
        productName: product.name,
        main_sku_name: product.sku_name,
        productInfo: res,
        remainNum: res.left_since_last_stat,
        orderUse: res.orderUse,
        totalRemain: res.totalRemain,
        actualNum: res.totalRemain,
        loading: false
      })
    })
  }

  fetchStockCheckType() {
    const self = this
    const api = `api_products/inventory_check_types?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {}).then(res => {
      self.setState({checkTypes: res})
    })
  }

  handleSubmit(pid, beforeStock, nowStock, remarkNew) {
    const self = this
    const {global, navigation} = self.props;
    let productId = self.state.productId
    let totalRemain = self.state.totalRemain
    let actualNum = self.state.actualNum
    let remainNum = self.state.remainNum
    let remark = self.state.remark
    if (pid) {
      productId = pid
    }
    if (beforeStock) {
      totalRemain = Number(beforeStock)
      remainNum = String(beforeStock)
    }
    if (nowStock) {
      actualNum = nowStock
    }
    if (remarkNew) {
      remark = remarkNew
    }
    const api = `api_products/inventory_check?access_token=${global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeId: this.state.storeId,
      productId: productId,
      remainNum: remainNum,
      orderUse: this.state.orderUse,
      totalRemain: totalRemain,
      actualNum: actualNum,
      differenceType: this.state.checkType.value,
      remark: remark
    }).then(res => {
      ToastShort(`#${self.state.productId} 实际库存 ${self.state.actualNum}`)
      navigation.goBack()
    }).catch(e => {
      if (e.obj == 'THEORY_NUM_CHANGED') {
        self.fetchData()
      }
    })
  }

  toSearchUseOrders() {
    const useOrderIds = this.state.productInfo.useOrderIds
    if (!useOrderIds || !useOrderIds.length) {
      ToastShort('无占用订单')
      return
    }

    let searchStr = 'id:' + useOrderIds.join(',')
    native.ordersSearch(searchStr)
  }

  renderInfoItem(label, value, extra = '') {
    return (
      <View style={{marginVertical: 10}}>
        <Text style={styles.infoLabel}>{label} </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
          <Text style={{color: colors.color333, width: '60%'}}>{value} </Text>
          <Text style={{color: colors.color333, width: '30%'}}>{extra} </Text>
        </View>
      </View>
    )
  }

  renderInfo() {
    const {storeName, storeCity, storeVendor, productName, shelfNo, productId, storeProd, main_sku_name} = this.state
    return (
      <View>
        <View style={{margin: 10}}>
          <Text style={{color: '#333333'}}>商品信息</Text>
        </View>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
          {this.renderInfoItem(`商品ID(#${productId})`, `${productName}[${main_sku_name}]`, `货架号:${shelfNo ? shelfNo : '无'}`)}
          <If condition={storeProd !== undefined}>
            <For each="info" index="i" of={storeProd}>
              <View style={{marginVertical: 5}} key={i}>
                <Text style={styles.infoLabel}>商品ID(#{info.product_id}) </Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                  <Text style={{color: colors.color333, width: '60%'}}>{productName}[{info.sku_name}] </Text>
                  <Text style={{color: colors.color333, width: '30%'}}>货架号:{info.shelf_no ? info.shelf_no : '无'} </Text>
                </View>
              </View>
            </For>
          </If>
        </View>
      </View>
    )
  }

  render() {
    const {
      remainNum = 0,
      orderUse = 0,
      totalRemain = 0,
      actualNum = 0,
      loading = false,
      productName,
      storeProd,
      main_sku_name
    } = this.state
    let width = Dimensions.get("window").width
    return (
      <View style={{flex: 1}}>
        <ScrollView refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => this.fetchData()}/>
        }>
          {this.renderInfo()}
          <View style={cellStyles.cellTitle}>
            <Text style={cellStyles.cellsTitle}>商品库存</Text>
          </View>
          <View style={[styles.infoContainer, {flexDirection: "column"}]}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              paddingLeft: 5
            }}>
              <Text style={{fontWeight: "bold", width: '70%'}}>{productName}[{main_sku_name}] </Text>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
                  productId: this.state.productId,
                  storeId: this.state.storeId
                })}>
                <Text style={[styles.historyBtn]}>盘点历史</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: "column", paddingLeft: 5}}>
              <View
                style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}}>
                <Text style={{color: colors.color333}}>剩余库存</Text>
                <Text style={{color: colors.color333}}>{`${String(remainNum)}件`} </Text>
              </View>
              <TouchableOpacity
                style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}}
                onPress={() => this.toSearchUseOrders()}>
                <Text style={{color: colors.color333}}>待打包</Text>
                <View style={{flexDirection: "row"}}>
                  <Text style={{color: colors.color333}}>{`${String(orderUse)}件`} </Text>
                  <Entypo name='chevron-thin-right'
                          style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
                </View>
              </TouchableOpacity>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingTop: 10
              }}>
                <Text style={{color: colors.color333}}>理论库存</Text>
                <Text style={{color: colors.color333}}>{`${String(totalRemain)}件`} </Text>
              </View>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 10
              }}>
                <Text style={{color: colors.color333}}>实际库存</Text>
                <Input
                  containerStyle={{width: 100}}
                  inputStyle={{fontSize: 14, textAlign: "center"}}
                  value={String(actualNum)}
                  type='number'
                  placeholder="请输入实际库存"
                  clear
                  onChangeText={(actualNum) => this.setState({actualNum})}
                  rightIcon={<Text style={{color: colors.color333}}>件</Text>}
                />
              </View>
              <If condition={actualNum != totalRemain}>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 10,
                  marginBottom: 10
                }}>
                  <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Text style={{marginRight: 20}}>备注</Text>
                    <TextInput
                      style={{
                        height: 30,
                        width: 0.4 * width,
                        borderWidth: 1,
                        borderColor: "#f2f2f2",
                        padding: 5,
                        textAlignVertical: "center",
                        color: colors.color999,
                        fontSize: 14
                      }}
                      value={this.state.remark}
                      placeholder="请输入原因..."
                      selectTextOnFocus={true}
                      autoCapitalize="none"
                      underlineColorAndroid="transparent"
                      placeholderTextColor={colors.main_color}
                      multiline={true}
                      onChangeText={text => {
                        this.setState({remark: text})
                      }}
                    />
                  </View>
                  <ModalSelector
                    onChange={(option) => this.setState({checkType: option})}
                    cancelText={'取消'}
                    data={this.state.checkTypes}
                  >
                    <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 10
                    }}>
                      <Text style={{color: colors.color333}}>选择原因</Text>
                      <If condition={this.state.checkTypes.label !== ''}>
                        <Entypo name='chevron-thin-right'
                                style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
                      </If>
                      <Text style={{color: colors.main_color}}>{this.state.checkType.label} </Text>
                    </View>
                  </ModalSelector>
                </View>
              </If>
              <Button buttonStyle={{backgroundColor: '#59B26A', height: pxToDp(70)}}
                      titleStyle={{color: colors.white, fontSize: 18}} title='提交'
                      onPress={() => this.handleSubmit()}/>
            </View>
          </View>
          <If condition={storeProd && storeProd !== undefined}>
            <For each="info" index="i" of={storeProd}>
              <View style={[styles.infoContainer, {flexDirection: "column"}]} key={i}>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingLeft: 5
                }}>
                  <Text style={{fontWeight: "bold", width: '70%'}}>{productName}[{info.sku_name}]</Text>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
                      productId: info.product_id,
                      storeId: this.state.storeId
                    })}>
                    <Text style={[styles.historyBtn]}>盘点历史</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: "column", paddingLeft: 5}}>
                  <View
                    style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}}>
                    <Text style={{color: colors.color333}}>剩余库存</Text>
                    <Text style={{color: colors.color333}}>{`${String(info.stock_str)}`} </Text>
                  </View>
                  <TouchableOpacity
                    style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}}
                    onPress={() => this.toSearchUseOrders()}>
                    <Text style={{color: colors.color333}}>待打包</Text>
                    <View style={{flexDirection: "row"}}>
                      <Text style={{color: colors.color333}}>{`${String(orderUse)}件`} </Text>
                      <Entypo name='chevron-thin-right'
                              style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
                    </View>
                  </TouchableOpacity>
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    paddingTop: 10
                  }}>
                    <Text style={{color: colors.color333}}>理论库存</Text>
                    <Text style={{color: colors.color333}}>{`${String(info.total_last_stat)}件`} </Text>
                  </View>
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 10
                  }}>
                    <Text style={{color: colors.color333}}>实际库存</Text>
                    <Input
                      containerStyle={{width: 100}}
                      inputStyle={{fontSize: 14, textAlign: "center"}}
                      value={info.stockNum !== undefined ? String(info.stockNum) : String(info.left_since_last_stat)}
                      type='number'
                      placeholder="请输入实际库存"
                      clear
                      onChangeText={(actualNum) => {
                        let storeItemProduct = this.state.storeProd
                        storeItemProduct[i].stockNum = actualNum
                        this.setState({
                          storeProd: storeItemProduct
                        })
                      }}
                      rightIcon={<Text style={{color: colors.color333}}>件</Text>}
                    />
                  </View>
                  <If condition={info.stockNum !== undefined && info.stockNum != info.total_last_stat}>
                    <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingLeft: 10,
                      marginBottom: 10
                    }}>
                      <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                        <Text style={{marginRight: 20}}>备注</Text>
                        <TextInput
                          style={{
                            height: 30,
                            width: 0.4 * width,
                            borderWidth: 1,
                            borderColor: "#f2f2f2",
                            padding: 5,
                            textAlignVertical: "center",
                            color: colors.color999,
                            fontSize: 14
                          }}
                          value={info.remark_new !== undefined ? String(info.remark_new) : ''}
                          placeholder="请输入原因..."
                          selectTextOnFocus={true}
                          autoCapitalize="none"
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.main_color}
                          multiline={true}
                          onChangeText={text => {
                            let storeItemProduct = this.state.storeProd
                            storeItemProduct[i].remark_new = text
                            this.setState({
                              storeProd: storeItemProduct
                            })
                          }}
                        />
                      </View>
                      <ModalSelector
                        onChange={(option) => this.setState({checkType: option})}
                        cancelText={'取消'}
                        data={this.state.checkTypes}
                      >
                        <View style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 10
                        }}>
                          <Text style={{color: colors.color333}}>选择原因</Text>
                          <If condition={this.state.checkTypes.label !== ''}>
                            <Entypo name='chevron-thin-right'
                                    style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
                          </If>
                          <Text style={{color: colors.main_color}}>{this.state.checkType.label} </Text>
                        </View>
                      </ModalSelector>
                    </View>
                  </If>
                </View>
                <Button buttonStyle={{backgroundColor: '#59B26A', height: pxToDp(70)}}
                        titleStyle={{color: colors.white, fontSize: 18}} title='提交'
                        onPress={() => this.handleSubmit(info.product_id, info.left_since_last_stat, info.stockNum, info.remark_new)}/>
              </View>
            </For>
          </If>
        </ScrollView>
      </View>
    )
  }
}


export default connect(mapStateToProps)(StockCheck)

const styles = StyleSheet.create({
  infoContainer: {
    width: '98%',
    paddingHorizontal: pxToDp(15),
    backgroundColor: '#fff',
    borderRadius: 5,
    marginLeft: '1%'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(28),
    fontWeight: 'bold'
  },
  historyBtn: {
    fontSize: 12,
    color: colors.theme
  }
})

const cellStyles = StyleSheet.create({
  cellTitle: {
    paddingBottom: pxToDp(10),
    backgroundColor: '#f5f5f9',
    borderBottomColor: '#ddd',
    borderBottomWidth: pxToDp(1),
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: pxToDp(80),
    width: '100%'
  },
  cellsTitle: {
    marginTop: $V.weuiCellTipsFontSize * 0.77 + (14 * $V.baseLineHeight - 14) * 0.5,
    paddingLeft: $V.weuiCellGapH,
    paddingRight: $V.weuiCellGapH,
    fontSize: $V.weuiCellTipsFontSize,
    color: '#333333',
  }
})
