import React, {Component} from 'react'
import {Image, InteractionManager, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import LoadMore from 'react-native-loadmore'
import color from "../../widget/color";
import {CachedImage} from "react-native-img-cache";
import BigImage from "../component/BigImage";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import Config from "../../config";
import {Accordion} from "antd-mobile-rn";
import Dialog from "../component/Dialog";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class GoodsAnalysis extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: `热销新品上架`
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      access_token: this.props.global.accessToken,
      store_id: this.props.global.currStoreId,
      bigImageUri: [],
      bigImageVisible: false,
      isLoading: false,
      page: 1,
      pageSize: 20,
      isLastPage: false,
      list: [],
      skuProdList: [],
      productListModal: false
    }
  }
  
  componentWillMount () {
    this.fetchList()
  }
  
  fetchList () {
    const self = this
    const {access_token, store_id, page, pageSize} = this.state
    uri = `/api/area_hot_new_sku/${store_id}?access_token=${access_token}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props.navigation)(uri, {page, pageSize}).then(res => {
      if (page !== 1) {
        lists = this.state.list.concat(res.lists)
      } else {
        lists = res.lists
      }
      self.setState({
        list: lists,
        page: res.page + 1,
        pageSize: res.pageSize,
        isLastPage: res.isLastPage,
        isLoading: false
      })
    })
  }
  
  showBigImage (coverimg) {
    this.setState({
      bigImageUri: [{url: coverimg}],
      bigImageVisible: true
    })
  }
  
  closeBigImage () {
    this.setState({
      bigImageUri: [],
      bigImageVisible: false
    })
  }
  
  onProductListModalClose () {
    this.setState({productListModal: false, skuProdList: []})
  }
  
  toOnlineProduct (productId, idx, product) {
    const self = this
    self.onProductListModalClose()
    InteractionManager.runAfterInteractions(() => {
      self.props.navigation.navigate(Config.ROUTE_ONLINE_STORE_PRODUCT, {
        store_id: this.state.store_id,
        product_id: product.id,
        mode: 2,
        onlineType: 'analysis',
        onBack: () => this.changeRowExist(idx)
      })
    })
  }
  
  onRefresh () {
    this.setState({page: 1}, () => {
      this.fetchList()
    })
  }
  
  onClickSkuCell (skuId) {
    if (skuId) {
      const self = this
      const {access_token, store_id} = this.state
      HttpUtils.get.bind(this.props.navigation)(`/api/area_hot_new_prod/${store_id}/${skuId}?access_token=${access_token}`).then(res => {
        self.setState({skuProdList: res, productListModal: true})
      })
    }
  }
  
  renderHotNewRow (product, idx) {
    return (
      <View style={styles.goodsRow} key={idx}>
        <View style={styles.goodsImageBox}>
          <TouchableOpacity onPress={() => this.showBigImage(product.coverimg)}>
            <CachedImage
              style={styles.goodsImage}
              source={{uri: product.coverimg}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.goodsInfo}>
          <View style={styles.goodsNameRow}>
            <Text style={styles.goodsName}>{product.name}</Text>
            <If condition={product.sku_label}>
              <View style={styles.profitType}>
                <Text style={styles.profitTypeText}>{product.sku_label}</Text>
              </View>
            </If>
          </View>
          <Text>建议外卖价：
            <If condition={product.price}>
              <Text style={styles.goodsPrice}>￥{product.price}</Text>
            </If>
            <If condition={!product.price}>
              <Text style={styles.goodsPrice}>-</Text>
            </If>
          </Text>
        </View>
        <View style={styles.goodsRight}>
          <If condition={!product.exist}>
            <TouchableOpacity onPress={() => this.toOnlineProduct(product.product_id, idx, product)}>
              <View style={styles.opBtn}>
                <Text style={styles.opText}>上架</Text>
              </View>
            </TouchableOpacity>
          </If>
          <If condition={product.exist}>
            <TouchableOpacity>
              <View style={[styles.opBtn, styles.opBtnDisable]}>
                <Text style={[styles.opText, styles.opTextDisable]}>已上架</Text>
              </View>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }
  
  renderSkuCell (item) {
    return (
      <View style={styles.accordionHeader} key={item.sku_id}>
        <Text>{item.sku_name}(月销量：{item.sales})</Text>
        <Image
          source={require('../../img/Public/arrow.png')}
          style={styles.accordionHeaderArrow}
        />
      </View>
    )
  }
  
  renderProductList () {
    return (
      <View>
        <For each="product" index="prodIdx" of={this.state.skuProdList}>
          {this.renderHotNewRow(product, prodIdx)}
        </For>
      </View>
    )
  }
  
  renderList () {
    return (
      <For each="item" index="idx" of={this.state.list}>
        <TouchableOpacity key={idx} onPress={() => this.onClickSkuCell(item.sku_id)}>
          {this.renderSkuCell(item)}
        </TouchableOpacity>
      </For>
    )
  }
  
  render () {
    return (
      <View style={styles.container}>
        
        <LoadMore
          renderList={this.renderList()}
          onRefresh={() => this.onRefresh()}
          isLastPage={this.state.isLastPage}
          isLoading={this.state.isLoading}
          loadMoreType={'scroll'}
          onLoadMore={() => this.fetchList()}
        />
        
        <BigImage
          visible={this.state.bigImageVisible}
          urls={this.state.bigImageUri}
          onClickModal={() => this.closeBigImage()}
        />
        
        <Dialog
          visible={this.state.productListModal}
          onRequestClose={() => this.onProductListModalClose()}
        >
          <ScrollView>
            {this.renderProductList()}
          </ScrollView>
        </Dialog>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  message: {
    alignItems: 'flex-end',
    fontSize: pxToDp(30)
  },
  striking: {
    fontSize: pxToDp(40),
    color: 'rgb(225,64,68)',
    fontWeight: 'bold'
  },
  tabBtnContainer: {
    marginVertical: pxToDp(15)
  },
  goodsRow: {
    flexDirection: 'row',
    flex: 1,
    height: pxToDp(160),
    // backgroundColor: '#fff',
    marginVertical: pxToDp(10)
  },
  goodsImageBox: {
    width: pxToDp(160),
    height: pxToDp(160),
    backgroundColor: '#fff'
  },
  goodsImage: {
    width: pxToDp(160),
    height: pxToDp(160)
  },
  goodsInfo: {
    marginLeft: pxToDp(15),
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1
  },
  goodsNameRow: {
    flexDirection: 'row'
  },
  goodsName: {
    fontWeight: 'bold'
  },
  profitType: {
    backgroundColor: 'rgb(238,134,48)',
    justifyContent: 'center',
    alignItems: 'center',
    width: pxToDp(40),
    height: pxToDp(40),
    marginLeft: pxToDp(10)
  },
  profitTypeText: {
    color: '#fff',
    fontSize: pxToDp(20)
  },
  goodsPrice: {
    fontSize: pxToDp(30),
    color: 'rgb(225,64,68)',
    fontWeight: 'bold'
  },
  goodsRight: {
    width: pxToDp(130),
    justifyContent: 'center'
  },
  opBtn: {
    height: pxToDp(50),
    width: pxToDp(130),
    borderWidth: pxToDp(1),
    borderColor: color.theme,
    borderRadius: pxToDp(10),
    justifyContent: 'center',
    alignItems: 'center'
  },
  opText: {
    color: color.theme,
    fontSize: pxToDp(20)
  },
  opBtnDisable: {
    backgroundColor: color.fontGray,
    borderColor: color.fontGray
  },
  opTextDisable: {
    color: '#fff'
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: 'space-between',
    flex: 1,
    height: 40,
    alignItems: 'center',
    paddingHorizontal: pxToDp(20),
    marginTop: pxToDp(10),
    backgroundColor: '#fff'
  },
  accordionHeaderArrow: {
    width: pxToDp(16),
    height: pxToDp(27)
  }
})

export default connect(mapStateToProps)(GoodsAnalysis)