import React from 'react'
import BaseComponent from "../common/BaseComponent"
import {connect} from "react-redux";
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {CachedImage} from "react-native-img-cache"
import Config from "../../pubilc/common/config";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../pubilc/util/http";
import JbbButton from "../common/component/JbbButton";
import {ToastShort} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class OrderPackage extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      packages: []
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const self = this
    const accessToken = this.props.global.accessToken
    const orderId = this.props.route.params.orderId
    const uri = `/api/get_order_delivery_packages/${orderId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({packages: res})
    })
  }

  setPackageReady(item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const uri = `/api/set_delivery_package_ready/${item.id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      ToastShort('操作成功')
      self.fetchData()
    })
  }

  renderGoodsItem(item) {
    return item.items.map(goods => (
        <View style={styles.goodsContainer} key={goods.product_id}>
          <CachedImage
              source={{uri: Config.staticUrl(goods.product_img)}}
              style={styles.goodsImage}
          />
          <View style={styles.goodsRight}>
            <Text>{goods.product_name} </Text>
            <View style={styles.goodsBottom}>
              <Text style={styles.goodsShelf}>
                {goods.shelf_no ? `货架：${goods.shelf_no} ` : ''}
                {goods.tag_code ? `秤签：${goods.tag_code}` : ''}
              </Text>
              <Text style={styles.goodsNum}>x{goods.num} </Text>
            </View>
          </View>
        </View>
    ))
  }

  render() {
    let refreshControl = <RefreshControl
        refreshing={false}
        onRefresh={() => this.fetchData()}
    />;

    return (
        <View style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.container} refreshControl={refreshControl}>
            {this.state.packages.map(item => (
                <View style={styles.packageContainer} key={item.id}>
                  <View style={styles.row}>
                    <Text>主单号：{item.wm_order_id} </Text>
                  </View>
                  <View style={styles.row}>
                    <Text>子单号：{item.id} 取货码: {item.verify_code} </Text>
                  </View>
                  <View style={styles.row}>
                    <Text>温区：</Text>
                    <Text>{item.div_label} </Text>
                  </View>
                  <View style={styles.row}>
                    <Text>包裹商品：</Text>
                  </View>

                  <View>
                    {this.renderGoodsItem(item)}
                  </View>

                  <View style={styles.btnContainer}>
                    {item.btns.can_set_ready ?
                        <JbbButton text={'打包完成'} onPress={() => this.setPackageReady(item)}/> : null}
                  </View>
                </View>
            ))}
          </ScrollView>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  packageContainer: {
    marginTop: 10,
    width: '90%',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5
  },
  goodsContainer: {
    flexDirection: 'row',
    marginTop: 5
  },
  goodsImage: {
    width: pxToDp(100),
    height: pxToDp(100),
    borderWidth: 1,
    borderColor: '#f8f8f8'
  },
  goodsRight: {
    justifyContent: 'space-between',
    marginLeft: 10,
    flex: 1
  },
  goodsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  goodsShelf: {
    fontSize: 12
  },
  goodsNum: {
    color: '#ea7575'
  },
  btnContainer: {
    marginTop: 5,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: '#f8f8f8'
  }
})
export default connect(mapStateToProps)(OrderPackage)
