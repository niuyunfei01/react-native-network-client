import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import GoodsBaseItem from '../../Components/Goods/BaseItem'
import InputPrice from "../../Components/Goods/InputPrice";
import TradeStoreItem from "../../Components/Goods/TradeStoreItem";
import ResultDialog from "../../Components/Goods/ResultDialog";
import {connect} from "react-redux";
import AppConfig from "../../config";
import FetchEx from "../../util/fetchEx";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class GoodsPriceModifySupply extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "修改价格-保底模式",
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      product_id: this.props.navigation.state.params.pid,
      store_id: this.props.global.currStoreId,
      access_token: this.props.global.accessToken,
      resultDialog: false,
      product: {
        store_product: {}
      },
      trade_products: [],
      refer_price: 0,
      wm_proportion: 0
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const {store_id, product_id, access_token} = self.state
    const url = `api_products/trade_price_mode_supply/${store_id}/${product_id}.json?access_token=${access_token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        self.setState({
          product: resp.obj.product,
          trade_products: resp.obj.trade_products
        })
      })
  }
  
  onSave () {
    this.setState({resultDialog: true})
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.scroll_view}>
          <GoodsBaseItem
            name={this.state.product.name}
            supplyPrice={this.state.product.store_product.supply_price}
            image={this.state.product.listimg}
          />
          
          <InputPrice
            mode={2}
            style={{marginTop: pxToDp(10)}}
          />
          
          <If condition={this.state.trade_products.length > 0}>
            <View>
              <Text style={styles.trade_title}>同行状况(仅供参考)</Text>
              <For each="item" index="idx" of={this.state.trade_products}>
                <TradeStoreItem
                  key={idx}
                  style={{marginTop: pxToDp(10)}}
                  image={item.img}
                  name={item.original_name}
                  price={item.price}
                  monthSale={item.monthSale}
                  storeName={item.trade_store.storeName}
                  record={item.trade_store.rate}
                />
              </For>
            </View>
          </If>
        </ScrollView>
        
        <View style={styles.bottom_box}>
          <TouchableOpacity onPress={() => this.onSave()}>
            <View style={styles.bottom_btn}>
              <Text style={{color: '#ffffff'}}>保存</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <ResultDialog
          visible={this.state.resultDialog}
          type={'info'}
          text={'调价失败，请稍后重试'}
          onPress={() => this.setState({resultDialog: false})}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  scroll_view: {
    marginBottom: pxToDp(110)
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
  }
})

export default connect(mapStateToProps)(GoodsPriceModifySupply)