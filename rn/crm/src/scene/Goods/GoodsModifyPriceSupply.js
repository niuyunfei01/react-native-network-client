import React, {Component} from "react";
import {ScrollView, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import GoodsBaseItem from '../../Components/Goods/BaseItem'
import InputPrice from "../../Components/Goods/InputPrice";
import TradeStoreItem from "../../Components/Goods/TradeStoreItem";

export default class GoodsModifyPriceSupply extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "修改价格-保底模式",
    }
  }
  
  constructor (props) {
    super(props)
  }
  
  render () {
    return (
      <View>
        <GoodsBaseItem
          name={'北京稻香村玫瑰细沙月饼110g/个'}
          wmPrice={'16.50'}
          image={'http://www.cainiaoshicai.cn/files/201709/thumb_m/fceebab66ca_0905.jpg'}
        />
        
        <InputPrice
          suggestMaxPrice={14}
          suggestMinPrice={12}
          mode={2}
          style={{marginTop: pxToDp(10)}}
        />
        
        <View>
          <Text>同行状况(仅供参考)</Text>
          <ScrollView>
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
          </ScrollView>
        </View>
      </View>
    )
  }
}