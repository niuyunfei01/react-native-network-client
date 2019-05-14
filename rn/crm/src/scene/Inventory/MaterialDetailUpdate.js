import React from "react";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {InputItem, List, Toast} from "antd-mobile-rn";
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";
import {NavigationActions} from "react-navigation";
import {ToastShort} from "../../util/ToastUtils";

const ListItem = List.Item

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialDetailUpdate extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '原料入库',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    const store = tool.store(this.props.global)
    this.state = {
      skus: [],
      skuPopup: false,
      suppliers: [],
      supplierPopup: false,
      storeId: store.id,
      barCode: null,
      sku: '',
      skuId: 0,
      supplier: '',
      supplierId: 0,
      weight: '0',
      reduceWeight: '0',
      price: '0',
      datetime: null,
      detail: {}
    }
  }
  
  componentDidMount (): void {
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    
    this.fetchDetail()
    this.fetchSkus()
    this.fetchSuppliers()
  }
  
  fetchDetail () {
    const self = this
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    const accessToken = this.props.global.accessToken
    const api = `api_products/inventory_material_detail_info/${params.receiptDetailId}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({
        barCode: res.bar_code,
        sku: res.sku.name,
        skuId: res.sku_id,
        supplier: res.supplier.name,
        supplierId: res.supplier_id,
        weight: res.weight,
        reduceWeight: res.reduce_weight,
        price: res.price,
        datetime: res.receipt_time,
        detail: res
      })
    })
  }
  
  fetchSkus () {
    const self = this
    const accessToken = this.props.global.accessToken
    const currStoreId = this.props.global.currStoreId
    const api = `api_products/material_skus?access_token=${accessToken}&_sid=${currStoreId}&with_code=1`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({skus: res})
    })
  }
  
  fetchSuppliers () {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `api_products/material_suppliers?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({suppliers: res})
    })
  }
  
  doSubmit () {
    const self = this
    const navigation = self.props.navigation
    const {params = {}} = navigation.state
    const accessToken = self.props.global.accessToken
    const {skuId, supplierId, weight, price, reduceWeight} = this.state
    const api = `api_products/material_detail_update/${params.receiptDetailId}?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId, supplierId, weight, reduceWeight, price
    }).then(res => {
      ToastShort('修改成功')
      navigation.goBack()
      navigation.state.params.onBack && navigation.state.params.onBack()
    }).catch(e => {
      Alert.alert('错误', e.reason)
    })
  }
  
  onDisabledReceipt () {
    const self = this
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    const {detail} = self.state
    Alert.alert('警告', `确定将此条记录置为无效么\n【${detail.sku.name}】${detail.weight}${detail.type == 1 ? '公斤' : '件'}`, [
      {text: '取消'},
      {
        text: '确定',
        onPress: () => {
          const accessToken = this.props.global.accessToken
          const api = `/api_products/material_detail_disabled/${params.receiptDetailId}?access_token=${accessToken}`
          HttpUtils.post.bind(self.props)(api).then(res => {
            Toast.success('操作成功')
            navigation.goBack()
          })
        }
      }
    ])
  }
  
  render () {
    return (
      <ScrollView
        contentContainerStyle={{justifyContent: 'space-between', flex: 1}}
        style={{flex: 1}}
      >
        <List>
          <ListItem
            arrow="horizontal"
            onClick={() => this.setState({skuPopup: true})}
            extra={this.state.sku}
          >商品名称</ListItem>
          <ListItem
            arrow="horizontal"
            onClick={() => this.setState({supplierPopup: true})}
            extra={this.state.supplier}
          >供货商</ListItem>
          <InputItem
            extra={'公斤'}
            value={this.state.weight}
            defaultValue={this.state.weight}
            onChange={(weight) => this.setState({weight})}
          >重量</InputItem>
          <InputItem
            extra={'公斤'}
            value={this.state.reduceWeight}
            defaultValue={this.state.reduceWeight}
            onChange={(reduceWeight) => this.setState({reduceWeight})}
          >扣重</InputItem>
          <InputItem
            extra={'元'}
            value={this.state.price}
            defaultValue={this.state.price}
            onChange={(price) => this.setState({price})}
          >金额</InputItem>
          <ListItem
            extra={this.state.datetime}
          >时间</ListItem>
        </List>
        
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.footerItem} onPress={() => this.onDisabledReceipt()}>
            <View style={[styles.footerBtn, styles.errorBtn]}>
              <Text style={styles.footerBtnText}>置为无效</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit()}>
            <View style={[styles.footerBtn, styles.successBtn]}>
              <Text style={styles.footerBtnText}>更新数据</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <SearchPopup
          visible={this.state.skuPopup}
          dataSource={this.state.skus}
          title={'选择原料名称'}
          onClose={() => this.setState({skuPopup: false})}
          onSelect={(item) => this.setState({sku: item.name, skuId: item.id, skuPopup: false})}
        />
        <SearchPopup
          visible={this.state.supplierPopup}
          dataSource={this.state.suppliers}
          title={'选择供应商'}
          onClose={() => this.setState({supplierPopup: false})}
          onSelect={(item) => this.setState({
            supplier: item.name,
            supplierId: item.supplier_code,
            supplierPopup: false
          })}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
    width: '100%'
  },
  footerItem: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  successBtn: {
    backgroundColor: '#59b26a'
  },
  errorBtn: {
    backgroundColor: '#e94f4f'
  },
  footerBtnText: {
    color: '#fff'
  }
})
export default connect(mapStateToProps)(MaterialDetailUpdate)