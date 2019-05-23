import React from 'react'
import {ScollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {Button, InputItem, List, WhiteSpace} from 'antd-mobile-rn';
import {tool} from "../../common";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import BaseComponent from "../BaseComponent";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import HttpUtils from "../../util/http";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class ReportLoss extends BaseComponent {
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
      num: '',
      remark: '',
      submitting: false,
    }
  }
  
  componentDidMount () {
  
  }
  
  handleSubmit () {
    const self = this
    const {global, navigation} = self.props;
    const {productId, num} = this.state
    const api = `api_products/inventory_report_loss/${productId}/${num}?access_token=${global.accessToken}`
    HttpUtils.post.bind(self.props)(api).then(res => {
      native.nativeBack()
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
    const {storeName, storeCity, storeVendor, productName, productId} = this.state
    return (
      <View>
        <JbbCellTitle>商品信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
          {this.renderInfoItem(`商品(ID:${productId})`, productName)}
        </View>
      </View>
    )
  }
  
  render () {
    return (
      <ScollView>
        {this.renderInfo()}
        <WhiteSpace/>
        <List renderHeader={() => '商品库存'}>
          <InputItem
            value={String(this.state.num)}
            defaultValue={String(this.state.num)}
            onChange={(num) => this.setState({num})}
            type='number'
            extra={'件'}
          >报损数</InputItem>
        </List>
        <WhiteSpace/>
        <Button type="primary" onClick={() => this.handleSubmit()}>提交</Button>
      </ScollView>
    )
  }
}


export default connect(mapStateToProps)(ReportLoss)

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
  }
})