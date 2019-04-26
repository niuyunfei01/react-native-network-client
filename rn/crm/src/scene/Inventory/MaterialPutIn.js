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
import moment from 'moment'
import {NavigationActions} from "react-navigation";

const ListItem = List.Item

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class MaterialPutIn extends React.Component {
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
      receiptId: null,
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
      datetime: null
    }
  }
  
  componentDidMount (): void {
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    
    this.fetchSkus()
    this.fetchSuppliers()
  
    let state = {}
    state.receiptId = params.receiptId ? params.receiptId : null
    state.barCode = params.barCode ? params.barCode : null
    state.weight = params.weight ? params.weight : '0'
    state.datetime = params.datetime ? params.datetime : moment().format('YYYY-MM-DD hh:mm:ss')
    this.setState(state)
    
    if (params.workerId) {
      this.setSupplier(params.workerId)
    }
    if (params.skuId) {
      this.setSku(params.skuId)
    }
  }
  
  setSupplier (supplierCode) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_get_supplier/${supplierCode}?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      if (!res) {
        Alert.alert('错误', '未知供应商')
      } else {
        self.setState({supplier: res.name, supplierId: res.id})
      }
    })
  }
  
  setSku (skuId) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_get_sku/${skuId}?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      if (!res) {
        Alert.alert('错误', '未知商品')
      } else {
        self.setState({sku: res.name, skuId: skuId})
      }
    })
  }
  
  fetchSkus () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_skus?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      self.setState({skus: res})
    })
  }
  
  fetchSuppliers () {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_suppliers?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      self.setState({suppliers: res})
    })
  }
  
  doSubmit () {
    const self = this
    const navigation = self.props.navigation
    const accessToken = self.props.global.accessToken
    const {skuId, storeId, supplierId, weight, price, reduceWeight, barCode, datetime, receiptId} = this.state
    const api = `/api_products/material_put_in?access_token=${accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      id: receiptId,
      skuId, storeId, supplierId, weight, price, reduceWeight, barCode, datetime
    }).then(res => {
      Toast.success('录入成功')
        navigation.goBack()
        navigation.state.params.onBack && navigation.state.params.onBack()
    }).catch(e => {
      Alert.alert('错误', e.reason)
    })
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
          <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit()}>
            <View style={[styles.footerBtn, styles.successBtn]}>
              <Text style={styles.footerBtnText}>入库</Text>
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
    width: '100%',
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
export default connect(mapStateToProps)(MaterialPutIn)