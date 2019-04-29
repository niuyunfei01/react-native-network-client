import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {connect} from "react-redux";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";
import {List, Picker, Switch, Toast, WhiteSpace} from "antd-mobile-rn";
import HttpUtils from "../../util/http";
import Swipeout from 'react-native-swipeout';
import JbbPrompt from "../component/JbbPrompt";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}


class ProductInfo extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '库管详情',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.toGoods()}
        />
      )
    }
  };
  
  constructor (props) {
    super(props)
    const pid = this.props.navigation.state.params.pid
    const store = tool.store(this.props.global)
    this.state = {
      productId: pid,
      productInfo: {
        product: {},
        sku: {}
      },
      shelfNos: [[{label: '', value: ''}], [{label: '', value: ''}]],
      selectShelfNo: [],
      storeId: store.id,
      storeName: store.name,
      positionDialog: false,
      shelfArea: '',
      shelfNo: '',
      refreshing: false,
      tagCodePrompt: false,
      isStandard: false, // 是否是标品
      upcPrompt: false
    }
  }
  
  componentWillMount (): void {
    this.fetchShelfNos()
  }
  
  componentDidMount (): void {
    this.fetchData()
  }
  
  componentWillUnmount (): void {
  }
  
  fetchShelfNos () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/inventory_shelf_nos?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({shelfNos: res})
    })
  }
  
  fetchData () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/inventory_info?access_token=${this.props.global.accessToken}`
    self.setState({refreshing: true})
    HttpUtils.get.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({
        productInfo: res,
        refreshing: false,
        selectShelfNo: res.shelf_no,
        isStandard: !!res.product.upc
      })
    })
  }
  
  onModifyPosition (value) {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/modify_inventory_shelf_no?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId,
      shelfNo: value
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onClearShelfNo () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/clear_inventory_shelf_no?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onChgTagCode (val) {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/chg_sku_tag_code?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      tagCode: val
    }).then(res => {
      this.setState({tagCodePrompt: false})
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  onConfirmUpc (upc) {
    console.log('upc => ', upc)
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/chg_prod_upc?access_token=${this.props.global.accessToken}`
    native.clearUpcScan(upc)
    HttpUtils.post.bind(self.props)(api, {
      productId: self.state.productId,
      upc: upc
    }).then(res => {
      this.setState({upcPrompt: false})
      Toast.success('操作成功')
      self.fetchData()
  
    })
  }
  
  onChangeNeedPack (checked) {
    console.log('on switch changed => ', checked)
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/chg_sku_need_pack?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      skuId: self.state.productInfo.sku.id,
      storeId: self.state.storeId,
      need_pack: checked ? 1 : 0
    }).then(res => {
      Toast.success('操作成功')
      self.fetchData()
    })
  }
  
  renderHeader () {
    return (
      <View>
        <JbbCellTitle>商品信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>店铺：</Text>
            <Text>{this.state.storeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>商品：</Text>
            <Text>{this.state.productInfo.product.name}</Text>
          </View>
        </View>
      </View>
    )
  }
  
  renderForm () {
    const shelfNoSwipeOutBtns = [
      {
        text: '清除',
        type: 'delete',
        onPress: () => this.onClearShelfNo()
      }
    ]
    
    return (
      <View>
        <View style={styles.formHeader}>
          <Text>库管信息</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text>标品</Text>
            <Switch
              checked={this.state.isStandard}
              onChange={(checked) => this.setState({isStandard: checked})}
            />
          </View>
        </View>
        <List>
          <Swipeout right={shelfNoSwipeOutBtns} autoClose={true}>
            <Picker
              data={this.state.shelfNos}
              title="选择货架"
              cascade={false}
              extra={this.state.productInfo.shelf_no}
              onOk={v => this.onModifyPosition(v.join(''))}
            >
              <List.Item arrow="horizontal">货架编号</List.Item>
            </Picker>
          </Swipeout>
  
          <If condition={!this.state.isStandard}>
            <List.Item
              arrow={"horizontal"}
              extra={this.state.productInfo.sku.name}
            >秤签名称</List.Item>
            <List.Item
              onClick={() => this.setState({tagCodePrompt: true})}
              arrow={"horizontal"}
              extra={this.state.productInfo.sku.material_code}
            >秤签编号</List.Item>
            <List.Item
              extra={<Switch
                disabled={!this.state.productInfo.sku.material_code}
                checked={this.state.productInfo.sku.need_pack == 1}
                onChange={(checked) => this.onChangeNeedPack(checked)}
              />}
            >需要打包</List.Item>
          </If>
  
          <If condition={this.state.isStandard}>
            <List.Item
              onClick={() => this.setState({upcPrompt: true})}
              extra={this.state.productInfo.product.upc}
              arrow="horizontal"
            >商品码</List.Item>
          </If>
        </List>
      </View>
    )
  }
  
  render (): React.ReactNode {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.fetchData()}
          />
        }>
        {this.renderHeader()}
        <WhiteSpace/>
        {this.renderForm()}
  
        <JbbPrompt
          onConfirm={(value) => this.onChgTagCode(value)}
          onCancel={() => this.setState({tagCodePrompt: false})}
          initValue={this.state.productInfo.sku.material_code}
          visible={this.state.tagCodePrompt}
        />
  
        <JbbPrompt
          autoFocus={true}
          title={'输入标品商品码'}
          onConfirm={(value) => this.onConfirmUpc(value)}
          onCancel={() => this.setState({upcPrompt: false})}
          initValue={''}
          visible={this.state.upcPrompt}
        />
      </ScrollView>
    );
  }
}

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
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: pxToDp(20),
    height: pxToDp(50)
  }
})

export default connect(mapStateToProps)(ProductInfo)