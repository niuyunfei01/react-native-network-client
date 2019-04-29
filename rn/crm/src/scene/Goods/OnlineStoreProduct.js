import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import GoodsBaseItem from '../../Components/Goods/BaseItem'
import InputPrice from "../../Components/Goods/InputPrice";
import TradeStoreItem from "../../Components/Goods/TradeStoreItem";
import ResultDialog from "../../Components/Goods/ResultDialog";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import colors from "../../styles/colors";


function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class OnlineStoreProduct extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: `上架商品`
    }
  }
  
  constructor (props) {
    super(props);
    
    this.state = {
      product_id: this.props.navigation.state.params.product_id,
      store_id: this.props.navigation.state.params.store_id,
      mode: this.props.navigation.state.params.mode,
      onlineType: this.props.navigation.state.params.onlineType,
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
      supply_price: 0,
      wmPrice: 0
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const {store_id, product_id, access_token} = self.state
    const navigation = this.props.navigation
    const url = `api_products/trade_product_price/${store_id}/${product_id}.json?access_token=${access_token}`;
    HttpUtils.post.bind(this.props)(url, {}, navigation).then(res => {
      self.setState({
        product: res.product,
        trade_products: res.trade_products,
        refer_price: res.refer_price,
        price_ratio: res.price_ratio
      })
    })
  }
  
  onApplyStorePrice () {
    const self = this
    const {store_id, product_id, access_token, supply_price} = self.state
    HttpUtils.post.bind(this.props)(`api/online_store_product?access_token=${access_token}`, {
      store_id: store_id,
      product_id: product_id,
      price: supply_price * 100,
      onlineType: this.state.onlineType
    }).then(res => {
      self.props.navigation.state.params.onBack()
      self.props.navigation.goBack()
    })
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        <GoodsBaseItem
          name={this.state.product.name}
          wmPrice={this.state.product.waimai_product.price}
          image={this.state.product.listimg}
          showWmTip={true}
          newPrice={this.state.wmPrice}
          remark={'（含平台费，活动费，耗材费，运营费用等）'}
        />
        
        <InputPrice
          mode={this.state.mode}
          showModeName={false}
          referPrice={this.state.refer_price}
          priceRatio={this.state.price_ratio}
          style={{marginTop: pxToDp(10)}}
          onInput={(val, wmPrice) => this.setState({supply_price: val, wmPrice})}
        />
        
        <View style={{flex: 1}}>
          <View>
            <Text style={styles.trade_title}>同行状况(仅供参考)</Text>
          </View>
          <If condition={this.state.trade_products.length > 0}>
            <ScrollView style={styles.scroll_view}>
              <For each="item" index="idx" of={this.state.trade_products}>
                <TradeStoreItem
                  key={idx}
                  style={{marginTop: pxToDp(10)}}
                  image={item.img}
                  name={item.original_name}
                  price={item.price}
                  monthSale={item.monthSale}
                  storeName={item.store_name}
                  record={item.month_sales}
                />
              </For>
            </ScrollView>
          </If>
          <If condition={this.state.trade_products.length == 0}>
            <View style={styles.no_prod_tip}>
              <Text style={styles.no_prod_tip_text}>暂无同行数据!</Text>
            </View>
          </If>
        </View>
        
        <View style={[styles.bottom_box]}>
          <TouchableOpacity onPress={() => this.onApplyStorePrice()}>
            <View style={styles.bottom_btn}>
              <Text style={{color: '#ffffff'}}>上架</Text>
            </View>
          </TouchableOpacity>
        </View>
        
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
  trade_title: {
    marginLeft: pxToDp(10),
    marginTop: pxToDp(10),
    fontSize: pxToDp(28),
    color: '#a3a3a3'
  },
  bottom_box: {
    height: pxToDp(114),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#f3f3f3'
  },
  bottom_btn: {
    width: pxToDp(620),
    height: pxToDp(80),
    borderRadius: pxToDp(40),
    backgroundColor: '#59b26a',
    justifyContent: 'center',
    alignItems: 'center',
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

export default connect(mapStateToProps)(OnlineStoreProduct)