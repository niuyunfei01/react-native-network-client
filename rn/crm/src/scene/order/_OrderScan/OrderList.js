import BaseComponent from "../../common/BaseComponent";
import React from "react";
import {Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import color from '../../../widget/color'
import {screen} from "../../../util";
import PropTypes from 'prop-types'
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import Swipeout from 'react-native-swipeout'

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

class OrderList extends BaseComponent {
  static propTypes = {
    onChgProdNum: PropTypes.func,
    styles: PropTypes.object
  }

  constructor(props) {
    super(props)
  }

  beforeProdNumVisible(product) {
    if (!product.scan_num || product.scan_num == 0) {
      ToastShort('请先扫入一个商品')
      return false
    }
    return true
  }

  onProductSwipeout(goodsItemIdx, product, direction) {
    if (direction == 'right' && product.scan_num < product.num) {
      Alert.alert('警告', `确定商品「${product.name}」${product.num}件 已经拣货完成？`, [
        {text: '取消'},
        {text: '确定', onPress: () => this.props.onChgProdNum(goodsItemIdx, product.num)}
      ])
    }
  }

  renderProduct(prod, goodsItemIdx) {
    const self = this
    return (
      <Swipeout
        key={`goodsItemIdx_${goodsItemIdx}`}
        onOpen={(sectionID, rowId, direction) => self.onProductSwipeout(goodsItemIdx, prod, direction)}
        right={[]}
        backgroundColor={'#fff'}
      >
        <View style={[styles.row]}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity>
              <Image
                style={styles.product_img}
                source={prod.product && prod.product.coverimg ? {uri: prod.product.coverimg} : require('../../../img/Order/zanwutupian_.png')}
              />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.product_name]}>{prod.name} </Text>
                {/*<JbbPrompt*/}
                {/*  onConfirm={(number) => this.props.onChgProdNum(goodsItemIdx, number)}*/}
                {/*  initValue={''}*/}
                {/*  keyboardType={'numeric'}*/}
                {/*>*/}
                <Text style={[styles.scanNum, Number(prod.scan_num) >= Number(prod.num) ? styles.scanNumFinish : null]}>
                  {prod.scan_num ? prod.scan_num : 0}
                </Text>
                {/*</JbbPrompt>*/}
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text>
                    {prod.store_prod && prod.store_prod.shelf_no ? `货架：${prod.store_prod.shelf_no}` : ''}
                    &nbsp;
                    {!prod.product.upc && prod.sku.material_code > 0 ? `秤签：${prod.sku.material_code}` : ''}
                  </Text>
                  <If condition={prod.can_scan}>
                    <Text style={
                      [styles.scanTip, Number(prod.scan_num) >= Number(prod.num) ? {backgroundColor: color.theme} : null]
                    }>
                      扫
                    </Text>
                  </If>
                </View>
                <Text style={styles.product_num}>X{prod.num} </Text>
              </View>
            </View>
          </View>

          {/*<If condition={Number(prod.scan_num) >= Number(prod.num)}>*/}
          {/*  <View style={styles.mask}>*/}
          {/*    <Text style={{color: colors.editStatusAdd, fontWeight: 'bold'}}>拣货完成！</Text>*/}
          {/*  </View>*/}
          {/*</If>*/}
        </View>
      </Swipeout>
    )
  }

  renderOrderItem(item) {
    const self = this
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle}>商品明细</Text>
          <Text style={styles.itemTitleTip}>{item.items_count}件商品</Text>
          <Text style={styles.itemTitleTip}>应扫{item.items_need_scan_num}件商品</Text>
          <Text style={styles.itemTitleScanTip}>
            已扫{this.props.scanCount}件商品
          </Text>
        </View>
        <View style={{paddingBottom: 30}}>
          {item.items.map((prod, index) => {
            return self.renderProduct.bind(self)(prod, index)
          })}
        </View>
      </View>
    )
  }

  render() {
    const {dataSource} = this.props
    return (
      <View style={[{flexDirection: 'row', flex: 1}, this.props.style]}>
        <View style={[styles.container]}>
          {this.renderOrderItem(dataSource)}
        </View>
      </View>
    )
  }
}

const rowHeight = pxToDp(120)
const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    flex: 1
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
    // backgroundColor: 'rgba(0,0,0,0.7)',
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
  },
  scanNumFinish: {
    backgroundColor: color.theme,
    color: '#fff',
    fontWeight: 'bold'
  },
  scanTip: {
    backgroundColor: '#999',
    color: '#fff',
    fontSize: 10,
    padding: 1,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
})

export default OrderList
