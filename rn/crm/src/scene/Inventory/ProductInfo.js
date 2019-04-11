import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {connect} from "react-redux";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";
import {List, Picker, WhiteSpace} from "antd-mobile-rn";
import HttpUtils from "../../util/http";

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
          onPress={() => native.nativeBack()}
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
        product: {}
      },
      shelfNos: [[{label: '', value: ''}], [{label: '', value: ''}]],
      selectShelfNo: [],
      storeId: store.id,
      storeName: store.name,
      positionDialog: false,
      shelfArea: '',
      shelfNo: '',
      refreshing: false
    }
  }
  
  componentWillMount (): void {
    this.fetchShelfNos()
  }
  
  componentDidMount (): void {
    this.fetchData()
  }
  
  fetchShelfNos () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/inventory_shelf_nos?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(navigation)(api, {
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
    HttpUtils.get.bind(navigation)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({productInfo: res, refreshing: false, selectShelfNo: res.shelf_no})
    })
  }
  
  onModifyPosition (value) {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/modify_inventory_shelf_no?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId,
      shelfNo: value
    }).then(res => {
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
    console.log(this.state.shelfNos)
    return (
      <View>
        <JbbCellTitle>库管信息</JbbCellTitle>
        <List>
          <Picker
            data={this.state.shelfNos}
            title="选择货架"
            cascade={false}
            extra={this.state.productInfo.shelf_no}
            onOk={v => this.onModifyPosition(v.join(''))}
          >
            <List.Item arrow="horizontal">货架编号</List.Item>
          </Picker>
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
})

export default connect(mapStateToProps)(ProductInfo)