import React, {Component} from 'react'
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import TabButton from "../component/TabButton";
import LoadMore from 'react-native-loadmore'
import color from "../../widget/color";
import {CachedImage} from "react-native-img-cache";
import BigImage from "../component/BigImage";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import Config from "../../config";

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
    console.log(this.props.global)
    this.state = {
      access_token: this.props.global.accessToken,
      store_id: this.props.global.currStoreId,
      tabOptions: [{label: '热销新品上架', value: 'HOT_NEW'}],
      bigImageUri: [],
      bigImageVisible: false,
      tabActiveValue: 'HOT_NEW',
      isLoading: false,
      list: []
    }
  }
  
  componentWillMount () {
    this.fetchStoreScore()
    this.fetchList()
  }
  
  fetchStoreScore () {
    const self = this
    const {access_token, store_id} = this.state
    HttpUtils.get(`/api/store_price_score/${store_id}?access_token=${access_token}`).then(res => {
      self.setState({storeScore: res})
    })
  }
  
  fetchList () {
    const self = this
    const {access_token, store_id, tabActiveValue} = this.state
    let uri = ''
    switch (tabActiveValue) {
      case 'HOT_NEW':
        uri = `/api/area_hot_new_prod/${store_id}`
        break
      case 'HOT_7_DAY':
        uri = `/api/area_7_day_hot_sale/${store_id}`
        break
      default:
        uri = null
        break
    }
    if (uri) {
      uri = `${uri}?access_token=${access_token}`
      this.setState({isLoading: true})
      HttpUtils.get(uri).then(res => {
        self.setState({list: res, isLoading: false})
      })
    } else {
    
    }
  }
  
  onClickTab (value) {
    this.setState({tabActiveValue: value}, () => this.fetchList())
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
  
  toOnlineProduct (productId, idx, product) {
    const self = this
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
  
  renderTab () {
    return (
      <TabButton
        data={this.state.tabOptions}
        onClick={(value) => this.onClickTab(value)}
        containerStyle={styles.tabBtnContainer}
      />
    )
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
          <Text>商圈月销{product.sales}</Text>
          <Text>建议价<Text style={styles.goodsPrice}>￥{product.supply_price}</Text></Text>
        </View>
        <View style={styles.goodsRight}>
          <If condition={!product.hasApply}>
            <TouchableOpacity onPress={() => this.toOnlineProduct(product.product_id, idx, product)}>
              <View style={styles.opBtn}>
                <Text style={styles.opText}>上架</Text>
              </View>
            </TouchableOpacity>
          </If>
          <If condition={product.hasApply}>
            <TouchableOpacity>
              <View style={[styles.opBtn, styles.opBtnDisable]}>
                <Text style={[styles.opText, styles.opTextDisable]}>已改价</Text>
              </View>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }
  
  renderHotSaleRow (item, idx) {
    return (
      <View key={idx} style={styles.goodsRow}>
        <View style={styles.goodsImageBox}>
          <TouchableOpacity onPress={() => this.showBigImage(item.coverImage)}>
            <CachedImage
              style={styles.goodsImage}
              source={{uri: item.coverImage}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.hotSaleRight}>
          <Text style={styles.goodsName}>{item.productName}</Text>
          <View style={styles.saleInfo}>
            <View style={styles.saleInfoColumn}>
              <Text>我的销量:{item.sold_7day}</Text>
              <Text>同行销量:{item.trackTotalSales}</Text>
            </View>
            <View>
              <Text>我的价格:￥{item.wmPrice}</Text>
              <Text>同行价格:￥{item.trackMaxSalePrice}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
  
  renderList () {
    let res = null
    if (this.state.tabActiveValue == 'HOT_NEW') {
      res = (
        <For each="item" index="idx" of={this.state.list}>
          {this.renderHotNewRow(item, idx)}
        </For>
      )
    } else if (this.state.tabActiveValue == 'HOT_7_DAY') {
      res = (
        <For each="item" index="idx" of={this.state.list}>
          {this.renderHotSaleRow(item, idx)}
        </For>
      )
    }
    return res
  }
  
  render () {
    return (
      <View style={styles.container}>
        {/*{this.renderTab()}*/}
        
        <LoadMore
          renderList={this.renderList()}
          onRefresh={() => this.fetchList()}
          isLastPage={true}
          isLoading={this.state.isLoading}
        />
        
        <BigImage
          visible={this.state.bigImageVisible}
          urls={this.state.bigImageUri}
          onClickModal={() => this.closeBigImage()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
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
    marginTop: pxToDp(20)
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
  goodsSales: {
    fontSize: pxToDp(25),
    color: 'rgb(138,138,138)'
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
  saleInfo: {
    flexDirection: 'row',
    width: '100%'
  },
  saleInfoColumn: {
    width: '50%'
  },
  hotSaleRight: {
    justifyContent: 'space-between',
    marginLeft: pxToDp(10)
  }
})

export default connect(mapStateToProps)(GoodsAnalysis)