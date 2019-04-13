import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {InputItem, List, Modal, Toast} from "antd-mobile-rn";
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
      skus: [],
      skuPopup: false,
      suppliers: [],
      supplierPopup: false,
      storeId: store.id,
      barCode: '',
      sku: '',
      skuId: 0,
      supplier: '',
      supplierId: 0,
      weight: '0',
      reduceWeight: '0',
      price: '0',
      datetime: moment().format('YYYY-MM-DD hh:mm:ss')
    }
  }
  
  componentDidMount (): void {
    const navigation = this.props.navigation
    const params = navigation.state.params
    
    this.fetchSkus()
    this.fetchSuppliers()
  
    // 如果是扫码进入
    if (params.barCode) {
      // if (params.storeId != this.state.storeId) {
      //   Modal.alert('错误', '货物编号和当前店铺不一致,无法验收,请确认客户端当前店铺')
      //   return
      // }
      if (params.supplierId) {
        this.setSupplier(params.supplierId)
      }
      if (params.skuId) {
        this.setSku(params.skuId)
      }
      this.setState({
        barCode: params.barCode,
        weight: params.weight,
        datetime: params.datetime
      })
    }
  }
  
  setSupplier (supplierId) {
    const self = this
    const navigation = this.props.navigation
    const accessToken = this.props.global.accessToken
    const api = `/api_products/material_get_supplier/${supplierId}?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      if (!res) {
        Modal.alert('错误', '未知供应商')
      } else {
        self.setState({supplier: res.name, supplierId: supplierId})
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
        Modal.alert('错误', '未知商品')
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
  
  goToMine = () => {
    tool.resetNavStack(this.props.navigation, 'Tab', {initTab: 'Mine'})
  }
  
  doSubmit () {
    const self = this
    const navigation = self.props.navigation
    const accessToken = self.props.global.accessToken
    const {skuId, storeId, supplierId, weight, price, reduceWeight, barCode, datetime} = this.state
    const api = `/api_products/material_put_in?access_token=${accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      skuId, storeId, supplierId, weight, price, reduceWeight, barCode, datetime
    }).then(res => {
      Toast.success('录入成功')
      if (self.state.barCode) {
        self.goToMine()
      } else {
        navigation.goBack()
        navigation.state.params.onBack && navigation.state.params.onBack()
      }
    }).catch(e => {
      Modal.alert('错误', e.reason, [
        {
          text: '确定',
          onPress: () => {
            self.goToMine()
          }
        }
      ])
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
          onSelect={(item) => this.setState({supplier: item.name, supplierId: item.id, supplierPopup: false})}
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