import BaseComponent from "../BaseComponent";
import React from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import {InputItem, List, Toast, WhiteSpace} from "@ant-design/react-native";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {ToastShort} from "../../util/ToastUtils";
import * as tool from "../../common/tool";
import InputNumber from "rc-input-number";
import inputNumberStyles from "../Order/inputNumberStyles";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class StandardDetailUpdate extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '标品入库',
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
    this.state = {
      upc: '',
      product: {},
      supplierPopup: false,
      suppliers: [],
      supplier: {},
      number: '0',
      price: '0'
    }
  }
  
  componentDidMount (): void {
    this.fetchSuppliers()
    this.fetchDetail()
  }
  
  componentWillUnmount () {
  }
  
  fetchDetail () {
    const self = this
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    const accessToken = this.props.global.accessToken
    const api = `api_products/inventory_material_detail_info/${params.receiptDetailId}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({
        upc: res.bar_code,
        product: res.sku,
        supplier: res.supplier,
        number: res.weight,
        price: res.price
      })
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
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    if (!this.state.product.upc) {
      ToastShort('未知商品')
    }
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_detail_update/${params.receiptDetailId}?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      supplierId: self.state.supplier.id,
      price: self.state.price,
      weight: self.state.number
    }).then(res => {
      navigation.goBack()
    })
  }
  
  setInvalid () {
    const self = this
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    const {product, number} = self.state
    Alert.alert('警告', `确定将此条记录置为无效么\n【${product.name}】${number}件`, [
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
  
  renderProdInfo () {
    return (
      <View>
        <View style={[styles.cell_box]}>
          <View style={styles.cell}>
            <View style={[styles.goods_image]}>
              <Image
                style={[styles.goods_image]}
                source={this.state.product.coverimg ? {uri: this.state.product.coverimg} : require('../../img/Order/zanwutupian_.png')}
              />
            </View>
            <View style={[styles.item_right]}>
              <Text style={[styles.goods_name]}>
                {this.state.product.name ? this.state.product.name : '未知商品'}
              </Text>
              <View>
                <Text style={styles.sku}>商品ID：{this.state.product.id}</Text>
                <Text style={styles.sku}>商品码：{this.state.product.upc}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
  
  renderInput () {
    return (
      <List>
        <List.Item
          arrow="horizontal"
          onClick={() => this.setState({supplierPopup: true})}
          extra={this.state.supplier.name}
        >供货商</List.Item>
        <InputItem
          extra={'元'}
          value={this.state.price}
          defaultValue={this.state.price}
          onChange={(price) => this.setState({price})}
        >总价</InputItem>
      </List>
    )
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.setInvalid()}>
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
    )
  }
  
  renderStepper () {
    return (
      <View style={styles.stepperRow}>
        <InputNumber
          styles={inputNumberStyles}
          min={0}
          value={this.state.number}
          style={{backgroundColor: 'white', width: '100%', height: 40}}
          onChange={(number) => this.setState({number})}
          keyboardType={'numeric'}
        />
      </View>
    )
  }
  
  render () {
    return (
      <ScrollView
        contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}
        style={{flex: 1}}
      >
        <View>
          {this.renderProdInfo()}
          <WhiteSpace/>
          {this.renderInput()}
          {this.renderStepper()}
        </View>
        
        {this.renderBtn()}
        
        <SearchPopup
          visible={this.state.supplierPopup}
          dataSource={this.state.suppliers}
          title={'选择供应商'}
          onClose={() => this.setState({supplierPopup: false})}
          onSelect={(item) => this.setState({
            supplier: item,
            supplierPopup: false
          })}
        />
      </ScrollView>
    )
      ;
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26),
    backgroundColor: '#ffffff'
  },
  cell: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee',
    flexDirection: 'row',
  },
  goods_image: {
    width: pxToDp(120),
    height: pxToDp(120)
  },
  item_right: {
    flex: 1,
    height: pxToDp(120),
    marginLeft: pxToDp(20),
    justifyContent: 'space-between',
  },
  sku: {
    fontSize: pxToDp(20)
  },
  arrow: {
    width: pxToDp(40),
    flex: 1,
    justifyContent: 'center'
  },
  stepperRow: {
    width: '100%',
    height: 70,
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(15),
    backgroundColor: '#fff'
  },
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

export default connect(mapStateToProps)(StandardDetailUpdate)