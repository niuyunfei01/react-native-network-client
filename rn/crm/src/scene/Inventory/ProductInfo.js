import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {connect} from "react-redux";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import {tool} from "../../common";
import {List, WhiteSpace} from "antd-mobile-rn";
import ConfirmDialog from "../component/ConfirmDialog";
import JbbInput from "../component/JbbInput";
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
      storeId: store.id,
      storeName: store.name,
      positionDialog: false,
      shelfArea: '',
      shelfNo: '',
      refreshing: false
    }
  }
  
  componentDidMount (): void {
    this.fetchData()
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
      self.setState({productInfo: res, refreshing: false})
    })
  }
  
  onModifyPosition () {
    const self = this
    const navigation = this.props.navigation
    const api = `/api_products/modify_inventory_shelf_no?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(navigation)(api, {
      productId: self.state.productId,
      storeId: self.state.storeId,
      shelfArea: self.state.shelfArea,
      shelfNo: self.state.shelfNo
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
    return (
      <View>
        <JbbCellTitle>库管信息</JbbCellTitle>
        <List>
          <List.Item
            arrow="horizontal"
            extra={this.state.productInfo.shelf_no}
            children={'货架编号'}
            onClick={() => this.setState({positionDialog: true})}
          />
        </List>
      </View>
    )
  }
  
  renderModifyPosition () {
    return (
      <ConfirmDialog
        visible={this.state.positionDialog}
        onClickCancel={() => this.setState({positionDialog: false})}
        onClickConfirm={() => this.onModifyPosition()}
      >
        <JbbInput
          onChange={(shelfArea) => this.setState({shelfArea})}
          value={this.state.shelfArea}
          placeholder={'请输入货架区号'}
        />
        <WhiteSpace/>
        <JbbInput
          onChange={(shelfNo) => this.setState({shelfNo})}
          value={this.state.shelfNo}
          placeholder={'请输入货架编号'}
        />
      </ConfirmDialog>
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
        
        {this.renderModifyPosition()}
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