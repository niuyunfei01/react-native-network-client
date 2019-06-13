import React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {Button, InputItem, List, TextareaItem, WhiteSpace} from 'antd-mobile-rn';
import {tool} from "../../common";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import BaseComponent from "../BaseComponent";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import HttpUtils from "../../util/http";
import ModalSelector from "react-native-modal-selector";
import $V from "../../weui/variable";
import color from '../../widget/color'
import C from '../../config'

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class StockCheck extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '库存盘点',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props: Object) {
    super(props);
    console.log(this.props.navigation)
    const store = tool.store(this.props.global)
    this.state = {
      productId: this.props.navigation.state.params.productId,
      storeId: store.id,
      storeName: store.name,
      storeCity: store.city,
      storeVendor: store.vendor,
      productName: this.props.navigation.state.params.productName,
      shelfNo: this.props.navigation.state.params.shelfNo,
      originStock: 0,
      actualStock: 0,
      remark: '',
      submitting: false,
      productInfo: {},
      checkTypes: [],
      checkType: {}
    }
  }
  
  componentDidMount () {
    this.fetchData()
    this.fetchStockCheckType()
  }
  
  fetchData () {
    const self = this
    const api = `api_products/inventory_info?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {
      productId: this.props.navigation.state.params.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({
        productInfo: res,
        originStock: res.left_since_last_stat,
        actualStock: res.left_since_last_stat
      })
    })
  }
  
  fetchStockCheckType () {
    const self = this
    const api = `api_products/inventory_check_types?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {}).then(res => {
      self.setState({checkTypes: res})
    })
  }
  
  handleSubmit () {
    const self = this
    const {global, navigation} = self.props;
    const api = `api_products/inventory_check?access_token=${global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeId: this.state.storeId,
      productId: this.state.productId,
      theoreticalNum: this.state.originStock,
      actualNum: this.state.actualStock,
      differenceType: this.state.checkType.value,
      remark: this.state.remark
    }).then(res => {
      console.log(`product id ${self.state.productId} 实际库存 ${self.state.actualStock}`)
      native.updatePidStorage(parseInt(self.state.productId), parseInt(self.state.actualStock), () => {
        native.nativeBack()
      })
    })
  }
  
  renderInfoItem (label, value, extra = '') {
    return (
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}：</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text>{value}</Text>
          <Text>{extra}</Text>
        </View>
      </View>
    )
  }
  
  renderInfo () {
    const {storeName, storeCity, storeVendor, productName, shelfNo, productId} = this.state
    return (
      <View>
        <JbbCellTitle>商品信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
          {this.renderInfoItem(`商品(ID:${productId})`, productName, `货架号:${shelfNo ? shelfNo : '无'}`)}
        </View>
      </View>
    )
  }
  
  renderFormHeader () {
    return (
      <View style={cellStyles.cellTitle}>
        <Text style={cellStyles.cellsTitle}>商品库存</Text>
        <TouchableOpacity onPress={() => this.props.navigation.navigate(C.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
          productId: this.state.productId,
          storeId: this.state.storeId
        })}>
          <Text style={[cellStyles.cellsTitle, styles.historyBtn]}>盘点历史</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    return (
      <ScrollView>
        {this.renderInfo()}
        <WhiteSpace/>
        <List renderHeader={this.renderFormHeader()}>
          <InputItem
            value={String(this.state.originStock)}
            defaultValue={String(this.state.originStock)}
            type='number'
            editable={false}
            extra={'件'}
          >理论库存</InputItem>
          <InputItem
            value={String(this.state.actualStock)}
            defaultValue={String(this.state.actualStock)}
            type='number'
            placeholder="请输入实际库存"
            onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)}
            clear
            extra={'件'}
            onChange={(actualStock) => this.setState({actualStock})}
          >实际库存</InputItem>
        </List>
        <WhiteSpace/>
  
        <If condition={this.state.actualStock != this.state.originStock}>
          <List renderHeader={() => '备注'}>
            <ModalSelector
              onChange={(option) => this.setState({checkType: option})}
              cancelText={'取消'}
              data={this.state.checkTypes}
            >
              <List.Item arrow={'horizontal'} extra={this.state.checkType.label}>原因</List.Item>
            </ModalSelector>
            <TextareaItem
              rows={5}
              count={100}
              onChange={(remark) => this.setState({remark})}
            />
          </List>
        </If>
        <WhiteSpace/>
        <Button type="primary" onClick={() => this.handleSubmit()}>提交</Button>
      </ScrollView>
    )
  }
}


export default connect(mapStateToProps)(StockCheck)

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(26),
    fontWeight: 'bold'
  },
  historyBtn: {
    fontSize: 12,
    color: color.theme
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
    color: $V.globalTextColor,
  }
})