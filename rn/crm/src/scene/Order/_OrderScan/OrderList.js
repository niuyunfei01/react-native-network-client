import BaseComponent from "../../BaseComponent";
import React from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import swipeable from "../../../widget/react-native-gesture-recognizers/swipeable";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import {screen} from "../../../common";
import JbbButton from "../../component/JbbButton";

var Dimensions = require('Dimensions');
var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

@swipeable({
  horizontal: true,
  vertical: false,
  continuous: false,
  initialVelocityThreshold: 0.7
})
class OrderList extends BaseComponent {
  constructor (props) {
    super(props)
  }
  
  renderOrderInfo (item) {
    return (
      <View style={styles.headerContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={styles.platDayId}>{item.plat_name}：#{item.platform_dayId}</Text>
            <Text style={styles.dayId}>(总单：#{item.dayId})</Text>
          </View>
          <View>
            <Text>期望送达：{item.expectTime}</Text>
          </View>
        </View>
        <View>
          <Text style={{fontSize: 16}}>客户备注：{item.remark}</Text>
        </View>
      </View>
    )
  }
  
  renderOrderItem (item) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle}>商品明细</Text>
          <Text style={styles.itemTitleTip}>{item.items_count}件商品</Text>
          <Text style={styles.itemTitleScanTip}>已扫{item.scan_count}件商品</Text>
        </View>
        <View style={{marginBottom: this.props.footerHeight * 2}}>
          <ScrollView>
            <For of={item.items} each="prod" index="goodsItemIdx">
              <View key={`goodsItemIdx_${goodsItemIdx}`} style={[styles.row]}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity>
                    <Image
                      style={styles.product_img}
                      source={prod.product && prod.product.coverimg ? {uri: prod.product.coverimg} : require('../../../img/Order/zanwutupian_.png')}
                    />
                  </TouchableOpacity>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.product_name, {
                        textDecorationLine: prod.scan_num >= prod.num ? 'line-through' : 'none'
                      }]}
                    >{prod.name}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={{textDecorationLine: prod.scan_num >= prod.num ? 'line-through' : 'none'}}>
                        {prod.store_prod && prod.store_prod.shelf_no ? `货架：${prod.store_prod.shelf_no}` : ''}
                        &nbsp;
                        {!prod.product.upc && prod.sku.material_code ? `秤签：${prod.sku.material_code}` : ''}
                      </Text>
                      <Text style={styles.product_num}>X{prod.num}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={{marginLeft: 10, justifyContent: 'center', alignItems: 'center'}}>
                  <JbbButton text={prod.scan_num ? String(prod.scan_num) : '0'}/>
                </View>
              </View>
            </For>
          </ScrollView>
        </View>
      </View>
    )
  }
  
  render () {
    return (
      <View style={{flexDirection: 'row'}}>
        <For of={this.props.dataSource} each="item" index="idx">
          <View
            style={[styles.container, {
              height: screenHeight - this.props.footerHeight
            }]}
            key={idx}
          >
            {this.renderOrderInfo(item)}
            {this.renderOrderItem(item)}
          </View>
        </For>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth
  },
  headerContainer: {
    backgroundColor: '#f0f9ef',
    padding: pxToDp(20)
  },
  platDayId: {
    fontWeight: 'bold'
  },
  dayId: {
    fontSize: 10
  },
  itemContainer: {
    marginTop: pxToDp(15),
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(15),
    backgroundColor: '#fff',
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'flex-end',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.color333
  },
  itemTitle: {
    color: colors.title_color,
    fontSize: pxToDp(30),
    fontWeight: 'bold'
  },
  itemTitleTip: {
    color: colors.color999,
    fontSize: pxToDp(24),
    marginLeft: pxToDp(20)
  },
  itemTitleScanTip: {
    color: colors.editStatusAdd,
    fontSize: pxToDp(24),
    marginLeft: pxToDp(20)
  },
  row: {
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 0,
    paddingTop: pxToDp(14),
    paddingBottom: pxToDp(14),
    borderBottomColor: colors.color999,
    borderBottomWidth: screen.onePixel,
  },
  product_img: {
    height: pxToDp(90),
    width: pxToDp(90),
    marginRight: pxToDp(15),
    borderRadius: 10,
    borderWidth: pxToDp(1),
    borderColor: '#999'
  },
  product_name: {
    fontSize: pxToDp(26),
    color: colors.color333,
    marginBottom: pxToDp(14),
  },
  product_num: {
    alignSelf: 'flex-end',
    fontSize: pxToDp(26),
    color: '#f44140'
  }
})

export default OrderList