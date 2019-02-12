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
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class GoodsPriceIndex extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: `价格指数`,
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => {
            if (navigation.state.params.from == 'rn') {
              navigation.goBack()
            } else {
              native.toGoods();
            }
          }}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    console.log(this.props.global)
    this.state = {
      access_token: this.props.global.accessToken,
      store_id: this.props.global.currStoreId,
      tabOptions: [{label: '建议降低价格', value: '0'}, {label: '建议提高价格', value: '1'}],
      bigImageUri: [],
      bigImageVisible: false,
      storeScore: {
        excellent_range: {}
      },
      tabActiveValue: '0',
      page: 1,
      pageSize: 10,
      isLastPage: false,
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
    const {access_token, store_id, tabActiveValue, page, pageSize} = this.state
    this.setState({isLoading: true})
    HttpUtils.get(`/api/get_store_should_adjust_prods/${tabActiveValue}/${store_id}/${page}/${pageSize}?access_token=${access_token}`).then(res => {
      const list = (this.state.page === 1 ? [] : this.state.list).concat(res.list)
      self.setState({isLastPage: !res.has_more, list: list, isLoading: false})
    })
  }
  
  onClickTab (value) {
    this.setState({page: 1, tabActiveValue: value}, () => this.fetchList())
  }
  
  onRefresh () {
    this.setState({page: 1}, () => this.fetchList())
  }
  
  onLoadMore () {
    const {page} = this.state
    this.setState({page: page + 1}, () => this.fetchList())
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
  
  toApplyPrice (productId, idx, product) {
    const self = this
    InteractionManager.runAfterInteractions(() => {
      self.props.navigation.navigate(Config.ROUTE_GOODS_APPLY_PRICE, {
        pid: productId,
        storeId: self.state.store_id,
        mode: 2,
        onBack: () => {
          let list = self.state.list
          product.hasApply = true
          list.splice(idx, 1, product)
          self.setState({
            list: list
          })
        }
      });
    })
  }
  
  renderMessage () {
    const {storeScore} = this.state
    return (
      <View>
        <View>
          <Text style={styles.message}>
            价格指数：
            <Text style={styles.striking}>{storeScore.score}</Text>
          </Text>
        </View>
        <View>
          <Text style={styles.message}>{storeScore.excellent_range.min}以上为优秀价格指数，调价系统自动通过</Text>
        </View>
      </View>
    )
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
  
  renderRow (product, idx) {
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
          <Text>商圈月销{product.area_sale}</Text>
          <Text style={styles.goodsPrice}>￥{product.supply_price}</Text>
        </View>
        <View style={styles.goodsRight}>
          <If condition={!product.hasApply}>
            <TouchableOpacity onPress={() => this.toApplyPrice(product.product_id, idx, product)}>
              <View style={styles.opBtn}>
                <Text style={styles.opText}>比价/调价</Text>
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
  
  renderList () {
    return (
      <For each="item" index="idx" of={this.state.list}>
        {this.renderRow(item, idx)}
      </For>
    )
  }
  
  render () {
    return (
      <View style={styles.container}>
        {this.renderMessage()}
        {this.renderTab()}
        
        <LoadMore
          loadMoreType={'scroll'}
          renderList={this.renderList()}
          onRefresh={() => this.onRefresh()}
          isLastPage={this.state.isLastPage}
          isLoading={this.state.isLoading}
          onLoadMore={() => this.onLoadMore()}
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
  }
})

export default connect(mapStateToProps)(GoodsPriceIndex)