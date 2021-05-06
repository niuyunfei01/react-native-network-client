import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import GoodsItem from './_GoodsApplyPrice/GoodsItem'
import InputPrice from "./_GoodsApplyPrice/InputPrice";
import TradeStoreItem from "./_GoodsApplyPrice/TradeStoreItem";
import ResultDialog from "../../Components/Goods/ResultDialog";
import colors from "../../styles/colors"
import {connect} from "react-redux";
import AppConfig from "../../config";
import FetchEx from "../../util/fetchEx";
import {Toast} from '@ant-design/react-native'
import HttpUtils from "../../util/http";
import native from "../../common/native";
import NavigationItem from "../../widget/NavigationItem";
import Cts from "../../Cts";
import ReportErrorDialog from "./_GoodsApplyPrice/ReportErrorDialog";
import _ from 'lodash'

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

/**
 * mode: 1抽佣模式 2保底模式
 */
class GoodsApplyPrice extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: `修改价格`,
    }
  }
  
  constructor (props) {
    super(props);
    
    this.state = {
      product_id: this.props.route.params.pid,
      store_id: this.props.route.params.storeId,
      type: this.props.route.params.type,
      mode: this.props.route.params.mode,
      // product_id: 62093,
      // store_id: 928,
      // mode: 2,
      access_token: this.props.global.accessToken,
      resultDialog: false,
      resultMsg: '',
      resultDialogType: 'info',
      product: {
        name: '',
        listimg: '',
        waimai_product: {
          price: 0
        },
        store_product: {
          supply_price: 0
        }
      },
      trade_products: [],
      refer_price: 0,
      price_ratio: {},
      supply_price: this.props.route.params.supplyPrice,
      wmPrice: 0,
      autoOnline: true,
      originPrice: this.props.route.params.supplyPrice,
      unitPrices: []
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const {store_id, product_id, access_token, type} = self.state
    const url = `api_products/trade_product_price/${store_id}/${product_id}.json?access_token=${access_token}`;
    HttpUtils.get.bind(this.props)(url, {sortType: type}).then(res => {
      self.setState({
        product: res.product,
        trade_products: res.trade_products,
        refer_price: res.refer_price,
        price_ratio: res.price_ratio,
        supplyPrice: String(res.product.store_product.supply_price),
        originPrice: String(res.product.store_product.supply_price)
      }, () => {
        self.sortPrice()
      })
    })
  }
  
  onBack = () => {
    let from = this.props.route.params.from;
    if ('native' == from) {
      native.nativeBack();
    } else {
      this.props.navigation.goBack();
    }
  }
  
  onSave () {
    if (this.state.supply_price) {
      this.onApplyStorePrice("自助调价")
    } else {
      Toast.info('请输入保底价！')
    }
  }
  
  onApplyStorePrice (remark) {
    const self = this
    const {store_id, product_id, access_token, supply_price} = self.state
    
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postForm(`api/apply_store_price?access_token=${access_token}`, {
        store_id: store_id,
        product_id: product_id,
        apply_price: supply_price * 100,
        before_price: self.state.product.store_product.supply_price * 100,
        remark: remark,
        auto_on_sale: 0,
        autoOnline: this.state.autoOnline
      }))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          native.updatePidApplyPrice(product_id, supply_price * 100, () => {
          })
          self.setState({resultDialog: true, resultMsg: '修改价格成功', resultDialogType: 'success'})
          if (this.props.route.params.onBack) {
            this.props.route.params.onBack()
            this.props.navigation.goBack()
          } else {
            native.nativeBack();
          }
        } else {
          self.setState({resultDialog: true, resultMsg: `调价失败，请稍后重试。${resp.reason}`, resultDialogType: 'info'})
        }
      })
  }
  
  onAutoOnlineChange (val) {
    this.setState({autoOnline: val})
  }
  
  sortPrice () {
    const {trade_products, product, wmPrice} = this.state
    let unitPrices = _.map(trade_products, 'unit_price')
    if (product.spec_mark === 'g' && product.spec && wmPrice) {
      unitPrices.push(wmPrice / product.spec * 500)
    }
  
    unitPrices = _.uniq(unitPrices)
    unitPrices.sort(function (a, b) {
      return a - b
    })
    console.log('sort ', unitPrices)
    this.setState({unitPrices})
  }
  
  onInputNewPrice (supplyPrice, wmPrice) {
    const self = this
    self.setState({
      supply_price: supplyPrice,
      wmPrice: wmPrice
    }, () => {
      self.sortPrice()
    })
  }
  
  renderBtn () {
    const {supply_price, originPrice} = this.state
    let priceIsChange = parseFloat(supply_price) != parseFloat(originPrice)
    return (
      <View style={[styles.bottom_box]}>
        <If condition={priceIsChange}>
          <TouchableOpacity onPress={() => this.onSave()}>
            <View style={[styles.bottom_btn]}>
              <Text style={{color: '#ffffff'}}>保存</Text>
            </View>
          </TouchableOpacity>
        </If>
        <If condition={!priceIsChange}>
          <View style={[styles.bottom_btn, styles.disabledBtn]}>
            <Text style={{color: '#ffffff'}}>保存</Text>
          </View>
        </If>
        <TouchableOpacity onPress={() => this.onBack()}>
          <View style={styles.bottom_btn}>
            <Text style={{color: '#ffffff'}}>返回</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    let unitWmPrice = this.state.wmPrice / this.state.product.spec * 500
    console.log(this.state.unitPrices)
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{marginBottom: pxToDp(114), flex: 1}}>
          <GoodsItem
            wmText={'当前外卖价'}
            name={this.state.product.name}
            wmPrice={this.state.product.waimai_product.price}
            image={this.state.product.listimg}
            newPrice={false}
            remark={'(含平台费，活动费，耗材费，运营费用等)'}
          />
          
          <InputPrice
            mode={this.state.mode}
            priceRatio={this.state.price_ratio}
            initPrice={String(this.state.product.store_product.supply_price)}
            onInput={(supplyPrice, wmPrice) => this.onInputNewPrice(supplyPrice, wmPrice)}
            showAutoOnline={this.state.product.store_product.status != Cts.STORE_PROD_ON_SALE}
            onAutoOnlineChange={(val) => this.onAutoOnlineChange(val)}
            spec={this.state.product.spec_mark === 'g' ? this.state.product.spec : null}
            rank={this.state.unitPrices.indexOf(unitWmPrice) + 1}
            rankMax={this.state.unitPrices.length}
          />
          
          <View style={{flex: 1}}>
            <View style={styles.tradeTitleRow}>
              <Text style={styles.trade_title}>同行状况(仅供参考)</Text>
              <If condition={this.state.trade_products.length > 0}>
                <ReportErrorDialog
                  storeId={this.state.store_id}
                  productId={this.state.product_id}
                  productImg={this.state.product.listimg}
                  productName={this.state.product.name}
                />
              </If>
            </View>
            <If condition={this.state.trade_products.length > 0}>
              <For each="item" index="idx" of={this.state.trade_products}>
                <TradeStoreItem
                  key={idx}
                  style={{marginBottom: pxToDp(10)}}
                  image={item.img}
                  name={item.original_name}
                  price={item.price}
                  monthSale={item.monthSale}
                  storeName={item.store_name}
                  record={item.month_sales}
                  unit_price={item.unit_price}
                  rank={this.state.unitPrices.indexOf(item.unit_price) + 1}
                  rankMax={this.state.unitPrices.length}
                />
              </For>
            </If>
            <If condition={this.state.trade_products.length == 0}>
              <View style={styles.no_prod_tip}>
                <Text style={styles.no_prod_tip_text}>暂无同行数据!</Text>
              </View>
            </If>
          </View>
        </ScrollView>
  
        {this.renderBtn()}
        
        <ResultDialog
          visible={this.state.resultDialog}
          type={this.state.resultDialogType}
          text={this.state.resultMsg}
          onPress={() => this.setState({resultDialog: false})}
        />
      
      
      </View>
    )
  }
}

const styles = StyleSheet.create({
  scroll_view: {
    marginBottom: pxToDp(110),
    flex: 1
  },
  tradeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: pxToDp(20),
    height: pxToDp(60)
  },
  trade_title: {
    fontSize: pxToDp(28),
    color: '#a3a3a3'
  },
  bottom_box: {
    height: pxToDp(114),
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#f3f3f3'
  },
  bottom_btn: {
    width: pxToDp(310),
    height: pxToDp(80),
    borderRadius: pxToDp(40),
    backgroundColor: '#59b26a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: colors.fontGray,
  },
  no_prod_tip: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  no_prod_tip_text: {
    fontSize: pxToDp(40),
    color: colors.main_color
  }
})

export default connect(mapStateToProps)(GoodsApplyPrice)