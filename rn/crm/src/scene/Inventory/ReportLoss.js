import React from 'react'
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {Button, InputItem, List, WhiteSpace} from '@ant-design/react-native';
import {tool} from "../../common";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import BaseComponent from "../BaseComponent";
import HttpUtils from "../../util/http";
import {ToastShort} from "../../util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class ReportLoss extends BaseComponent {
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
      num: '',
      remark: '',
      submitting: false,
      history: {
        lists: []
      }
    }
  }

  componentDidMount() {
    this.fetchHistory()
  }

  fetchHistory() {
    const self = this
    const {global} = self.props;
    const {productId, storeId} = this.state
    const api = `api_products/inventory_loss_history?access_token=${global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {page: 1, pageSize: 10, productId, storeId}).then(res => {
      self.setState({history: res})
    })
  }

  handleSubmit() {
    const self = this
    const {global, navigation} = self.props;
    const {productId, num} = this.state
    const api = `api_products/inventory_report_loss/${productId}/${num}?access_token=${global.accessToken}`
    HttpUtils.post.bind(self.props)(api).then(res => {
      ToastShort('报损成功')
      self.fetchHistory()
    })
  }

  onDisabledLoss(item) {
    if (item.deleted > 0) {
      ToastShort('当前记录已经置为无效')
      return
    }

    const self = this
    const {global} = self.props;
    const api = `api_products/inventory_report_loss_disabled/${item.id}?access_token=${global.accessToken}`
    Alert.alert('提示', '是否将此条报损记录置为无效?', [
      {text: '取消'},
      {
        text: '置为无效',
        onPress: () => {
          HttpUtils.post.bind(self.props)(api).then(res => {
            self.fetchHistory()
          })
        }
      }
    ])
  }

  renderInfoItem(label, value, extra = '') {
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

  renderInfo() {
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

  renderHistory() {
    return (
      <View>
        <JbbCellTitle>报损历史</JbbCellTitle>
        <View style={{backgroundColor: '#fff', padding: pxToDp(20)}}>
          <For of={this.state.history.lists} each="item" index="index">
            {this.renderHistoryItem(item)}
          </For>
        </View>
      </View>
    )
  }

  renderHistoryItem(item) {
    let itemDisabled = item.deleted > 0 ? {textDecorationLine: 'line-through', color: '#dddddd'} : null
    return (
      <View style={{justifyContent: 'space-between', flexDirection: 'row', height: pxToDp(60)}} key={item.id}>
        <Text style={[itemDisabled]}>{item.created}</Text>
        <Text style={[{width: 50}, itemDisabled]}>{item.create_user.nickname}</Text>
        <Text style={[{width: 50, textAlign: 'right'}, itemDisabled]}>-{item.num}份</Text>
        <TouchableOpacity onPress={() => this.onDisabledLoss(item)}>
          <View>
            <Text>撤销</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
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
        <Button type="primary" onPress={() => this.handleSubmit()}>提交</Button>
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
