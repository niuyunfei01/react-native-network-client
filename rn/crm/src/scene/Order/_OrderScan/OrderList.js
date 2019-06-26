import BaseComponent from "../../BaseComponent";
import React from "react";
import {Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import color from '../../../widget/color'
import {screen} from "../../../common";
import PropTypes from 'prop-types'
import {ToastShort} from "../../../util/ToastUtils";
import JbbPrompt from "../../component/JbbPrompt";

var Dimensions = require('Dimensions');
var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

class OrderList extends BaseComponent {
  static propTypes = {
    onChgProdNum: PropTypes.func,
    styles: PropTypes.object
  }
  
  constructor (props) {
    super(props)
  }
  
  beforeProdNumVisible (product) {
    if (!product.scan_num || product.scan_num == 0) {
      ToastShort('请先扫入一个商品')
      return false
    }
    return true
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
        <If condition={item.store_remark}>
          <View>
            <Text style={{fontSize: 16}}>商家备注：{item.store_remark}</Text>
          </View>
        </If>
      </View>
    )
  }
  
  renderProduct (prod, goodsItemIdx) {
    console.log(prod)
    return (
      <View key={`goodsItemIdx_${goodsItemIdx}`} style={[styles.row]}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => console.log('click product image')}>
            <Image
              style={styles.product_img}
              source={prod.product && prod.product.coverimg ? {uri: prod.product.coverimg} : require('../../../img/Order/zanwutupian_.png')}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={[styles.product_name]}>{prod.name}</Text>
              <JbbPrompt
                beforeVisible={() => this.beforeProdNumVisible(prod)}
                onConfirm={(number) => this.props.onChgProdNum(goodsItemIdx, number)}
                initValue={prod.scan_num ? prod.scan_num : 0}
                keyboardType={'numeric'}
              >
                <Text style={styles.scanNum}>{prod.scan_num ? prod.scan_num : 0}</Text>
              </JbbPrompt>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>
                {prod.store_prod && prod.store_prod.shelf_no ? `货架：${prod.store_prod.shelf_no}` : ''}
                &nbsp;
                {!prod.product.upc && prod.sku.material_code ? `秤签：${prod.sku.material_code}` : ''}
              </Text>
              <Text style={styles.product_num}>X{prod.num}</Text>
            </View>
          </View>
        </View>
        
        <If condition={Number(prod.scan_num) >= Number(prod.num)}>
          <View style={styles.mask}>
            <Text style={{color: colors.editStatusAdd, fontWeight: 'bold'}}>拣货完成！</Text>
          </View>
        </If>
      </View>
    )
  }
  
  renderOrderItem (item) {
    const self = this
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle}>商品明细</Text>
          <Text style={styles.itemTitleTip}>{item.items_count}件商品</Text>
          <Text style={styles.itemTitleScanTip} onPress={() => console.log('click scan num')}>
            已扫{item.scan_count}件商品
          </Text>
        </View>
        <View style={{marginBottom: this.props.footerHeight * 2}}>
          <ScrollView refreshControl={
            <RefreshControl
              refreshing={this.props.isLoading}
              onRefresh={() => this.props.onRefresh()}
            />
          }>
            {item.items.map((prod, index) => {
              return self.renderProduct.bind(self)(prod, index)
            })}
          </ScrollView>
        </View>
      </View>
    )
  }
  
  render () {
    const containerStyle = {
      height: screenHeight - this.props.footerHeight
    }
    const {dataSource} = this.props
    return (
      <View style={[{flexDirection: 'row'}, this.props.style]}>
        <View style={[styles.container, containerStyle]}>
          {this.renderOrderInfo(dataSource)}
          {this.renderOrderItem(dataSource)}
          </View>
      </View>
    )
  }
}

const rowHeight = pxToDp(120)
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
    height: rowHeight
  },
  mask: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: rowHeight,
    paddingVertical: pxToDp(14)
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
  },
  scanNum: {
    marginLeft: pxToDp(10),
    borderColor: color.theme,
    borderWidth: pxToDp(1),
    paddingVertical: pxToDp(10),
    paddingHorizontal: pxToDp(15),
    color: color.theme,
    fontSize: pxToDp(26)
  }
})

export default OrderList