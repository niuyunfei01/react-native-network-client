import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {InputItem, List} from "antd-mobile-rn";
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";

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
      price: '0'
    }
  }
  
  componentDidMount (): void {
    this.fetchSkus()
    this.fetchSuppliers()
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
  
  doSubmit (isContinue = false) {
    const self = this
    const navigation = self.props.navigation
    const accessToken = self.props.global.accessToken
    const {skuId, storeId, supplierId, weight, price, reduceWeight, barCode} = this.state
    const api = `/api_products/material_put_in?access_token=${accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      skuId, storeId, supplierId, weight, price, reduceWeight, barCode
    }).then(res => {
      if (isContinue) {
      
      } else {
        navigation.goBack()
        navigation.state.params.onBack && navigation.state.params.onBack()
      }
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
        </List>
        
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit(false)}>
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