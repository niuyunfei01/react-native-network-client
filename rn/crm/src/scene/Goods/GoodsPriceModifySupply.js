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
import {Modal, Toast} from 'antd-mobile-rn'
import HttpUtils from "../../util/http";


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
      // product_id: this.props.navigation.state.params.pid,
      // store_id: this.props.global.currStoreId,
      product_id: 62093,
      store_id: 928,
      access_token: this.props.global.accessToken,
      resultDialog: false,
      resultMsg: '',
      resultDialogType: 'info',
      product: {
        name: '',
        listimg: '',
        waimai_product: {
          price: 0
        }
      },
      trade_products: [],
      refer_price: 0,
      price_ratio: {},
      supply_price: 0
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    const {store_id, product_id, access_token} = self.state
    const url = `api_products/trade_product_price/${store_id}/${product_id}/2.json?access_token=${access_token}`;
    HttpUtils.post(url).then(res => {
      self.setState({
        product: res.product,
        trade_products: res.trade_products,
        refer_price: res.refer_price,
        price_ratio: res.price_ratio
      })
    })
  }
  
  onSave () {
    if (this.state.supply_price) {
      Modal.prompt('原因', '请输入调价原因', [
        {
          text: '关闭',
        },
        {
          text: '确认',
          onPress: (val) => this.onApplyStorePrice(val)
        }
      ])
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
        auto_on_sale: 0
      }))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          self.setState({resultDialog: true, resultMsg: '修改价格成功', resultDialogType: 'success'})
        } else {
          self.setState({resultDialog: true, resultMsg: '调价失败，请稍后重试', resultDialogType: 'info'})
        }
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
        />
        
        <InputPrice
          mode={2}
          referPrice={this.state.refer_price}
          priceRatio={this.state.price_ratio}
          style={{marginTop: pxToDp(10)}}
          onInput={(val) => this.setState({supply_price: val})}
        />
        <If condition={this.state.trade_products.length > 0}>
          <View>
            <Text style={styles.trade_title}>同行状况(仅供参考)</Text>
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
          </View>
        </If>
        
        
        <View style={styles.bottom_box}>
          <TouchableOpacity onPress={() => this.onSave()}>
            <View style={styles.bottom_btn}>
              <Text style={{color: '#ffffff'}}>保存</Text>
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