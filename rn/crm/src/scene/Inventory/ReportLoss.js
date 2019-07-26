import React from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native';
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
      headerTitle: '商品报损',
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
      history: {
        lists: []
      }
    }
  }
  
  componentDidMount () {
    this.fetchHistory()
  }
  
  fetchHistory () {
    const self = this
    const {global} = self.props;
    const {productId, storeId} = this.state
    const api = `api_products/inventory_loss_history?access_token=${global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {page: 1, pageSize: 5, productId, storeId}).then(res => {
      self.setState({history: res})
    })
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
  
  renderHistory () {
    return (
      <View>
        <JbbCellTitle>报损历史</JbbCellTitle>
        <View style={{backgroundColor: '#fff', padding: pxToDp(20)}}>
          <For of={this.state.history.lists} each="item" index="index">
            <View style={{justifyContent: 'space-between', flexDirection: 'row', height: pxToDp(40)}}>
              <Text>{item.created}</Text>
              <Text>{item.create_user.nickname}</Text>
              <Text>-{item.num}份</Text>
            </View>
          </For>
        </View>
      </View>
    )
  }
  
  render () {
    return (
      <ScrollView>
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
        <WhiteSpace/>
        {this.renderHistory()}
      </ScrollView>
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