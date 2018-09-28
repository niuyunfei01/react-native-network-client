import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import GoodsBaseItem from '../../Components/Goods/BaseItem'
import InputPrice from "../../Components/Goods/InputPrice";
import TradeStoreItem from "../../Components/Goods/TradeStoreItem";
import ResultDialog from "../../Components/Goods/ResultDialog";

export default class GoodsPriceModifySupply extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "修改价格-保底模式",
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      resultDialog: true
    }
  }
  
  fetchData(){
    
  }
  
  onSave () {
    this.setState({resultDialog: true})
  }
  
  render () {
    return (
      <View>
        <ScrollView style={styles.scroll_view}>
          <GoodsBaseItem
            name={'北京稻香村玫瑰细沙月饼110g/个'}
            supplyPrice={'16.50'}
            image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
          />
          
          <InputPrice
            suggestMaxPrice={14}
            suggestMinPrice={12}
            mode={2}
            style={{marginTop: pxToDp(10)}}
          />
          
          <View>
            <Text style={styles.trade_title}>同行状况(仅供参考)</Text>
            <TradeStoreItem
              style={{marginTop: pxToDp(10)}}
              image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
              name={'北京稻香村玫瑰细沙月饼110g/个'}
              price={12.50}
              monthSale={259}
              storeName={'菜老包沙河店'}
              record={'4.8'}
            />
            <TradeStoreItem
              style={{marginTop: pxToDp(10)}}
              image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
              name={'北京稻香村玫瑰细沙月饼110g/个'}
              price={12.50}
              monthSale={259}
              storeName={'菜老包沙河店'}
              record={'4.8'}
            />
            <TradeStoreItem
              style={{marginTop: pxToDp(10)}}
              image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
              name={'北京稻香村玫瑰细沙月饼110g/个'}
              price={12.50}
              monthSale={259}
              storeName={'菜老包沙河店'}
              record={'4.8'}
            />
          </View>
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