import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import FastImage from 'react-native-fast-image'
import Config from "../../common/config";
import colors from "../../styles/colors";
import Cts from "../../common/Cts";
import pxToDp from "../../util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../util/tool";

class GoodListItem extends React.PureComponent {
  static propTypes = {
    product: PropTypes.object.isRequired,
    opBar: PropTypes.object,
    onPressImg: PropTypes.func.isRequired,
    onPressRight: PropTypes.func,
    fnProviding: PropTypes.bool.isRequired
  }

  static defaultProps = {
    visible: true
  }

  state = {
    showMore: false
  }

  supplyPriceInYuan(p) {
    return parseFloat((p.sp || {}).supply_price / 100).toFixed(2);
  }

  stock(p) {
    return (p.sp || {}).stock_str;
  }

  applyingPriceInYuan(p) {
    return parseFloat((p.sp || {}).applying_price / 100).toFixed(2);
  }

  right = () => {
    const {product, fnProviding} = this.props;
    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const offSaleTxtStyle = onSale ? {} : {color: colors.colorBBB}
    let skus = product.skus || []
    const {price_type} = this.props
    return (
      <ScrollView style={{flex: 1, marginLeft: 5, flexDirection: "column"}}>
        <Text numberOfLines={2} style={[styles.n2b, offSaleTxtStyle]}>
          {product.name}{product.sku_name && `[${product.sku_name}]`}
        </Text>
        <View style={{flexDirection: "row"}}>
          <Text style={[styles.n2grey6, offSaleTxtStyle]}>{product.price_type === 1 ? '零售价格' : '报价'}：</Text>
          <Text style={[styles.n2grey6, offSaleTxtStyle, {color: colors.warn_red}]}>
            ￥{product.price_type === 1 ? product?.sp?.show_price : parseFloat(product.sp.supply_price / 100).toFixed(2)}
          </Text>
          <If condition={product.sp && product.sp.is_fix_price === 1}>
            <View style={{
              backgroundColor: colors.main_color,
              padding: pxToDp(3),
              borderRadius: 1,
              justifyContent: "center",
              marginLeft: pxToDp(10)
            }}>
              <Text style={{fontSize: 12, color: colors.white}}>固</Text>
            </View>
          </If>
        </View>

        <If condition={typeof product.sp.applying_price !== "undefined"}>
          <Text style={[styles.n2grey6, {color: colors.orange}, offSaleTxtStyle]}>
            审核中：{this.applyingPriceInYuan(product)}
          </Text>
        </If>
        <If condition={fnProviding}>
          <Text style={[styles.n2grey6, offSaleTxtStyle]}>库存：{this.stock(product)} </Text>
        </If>

        <If condition={tool.length(skus) > 0}>
          <TouchableOpacity onPress={() => {
            this.setState({
              showMore: !this.state.showMore
            })
          }}>
            {
              this.state.showMore ?
                <View style={{flexDirection: "row"}}>
                  <Text style={{color: colors.main_color, fontSize: 12, fontWeight: "bold"}}>点击收起多规格信息 </Text>
                  <Entypo name='chevron-thin-up' style={{fontSize: 14, marginLeft: 5, color: colors.main_color}}/>
                </View>
                : <View style={{flexDirection: "row"}}>
                  <Text style={{color: colors.main_color, fontSize: 12, fontWeight: "bold"}}>点击展示多规格信息 </Text>
                  <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5, color: colors.main_color}}/>
                </View>
            }
          </TouchableOpacity>
        </If>

        <If condition={tool.length(skus) > 0 && this.state.showMore}>
          <For each="item" index="idx" of={skus}>
            <View style={{flexDirection: "column"}} key={idx}>
              <Text numberOfLines={2} style={[styles.n2b, offSaleTxtStyle]}>{product.name}[{item.sku_name}] </Text>
              <View style={{flexDirection: "row"}}>
                <Text style={[styles.n2grey6, offSaleTxtStyle]}>
                  {price_type === 1 ? '零售价格' : '报价'}：
                </Text>
                <Text style={[styles.n2grey6, offSaleTxtStyle, {color: colors.warn_red}]}>
                  ￥{price_type === 1 ? item.show_price : parseFloat(item.supply_price / 100).toFixed(2)}
                </Text>
              </View>

              <If condition={typeof item.applying_price !== "undefined"}>
                <Text style={[styles.n2grey6, {color: colors.orange}, offSaleTxtStyle]}>
                  审核中：{parseFloat(item.applying_price / 100).toFixed(2)}
                </Text>
              </If>
              <If condition={fnProviding}>
                <Text style={[styles.n2grey6, offSaleTxtStyle]}>
                  库存：{item.left_since_last_stat ? item.left_since_last_stat : 0} 件
                </Text>
              </If>
            </View>
          </For>
        </If>
      </ScrollView>
    )
  }

  render() {
    const {product, onPressImg, onPressRight} = this.props;
    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const bg = onSale ? colors.white : colors.colorDDD;
    const offSaleImg = onSale ? {} : {opacity: 0.3}

    return <TouchableOpacity style={[styles.cowbetween, styles.productRow, {flex: 1, backgroundColor: bg}]}
                             onPress={onPressImg}>
      <View style={{flexDirection: 'row', paddingBottom: 5}}>
        <View>
          <FastImage source={{uri: Config.staticUrl(product.coverimg)}}
                     style={[styles.listImageSize, offSaleImg]}
                     resizeMode={FastImage.resizeMode.contain}/>

          <If condition={!onSale}>
            <View style={[styles.center, styles.listImageSize, {position: 'absolute'}]}>
              <Text style={{color: colors.white}}>暂 停</Text>
              <Text style={{color: colors.white}}>售 卖</Text>
            </View>
          </If>
        </View>
        <If condition={onPressRight}>
          <TouchableOpacity style={{flex: 1, marginLeft: 5, flexDirection: "column"}} onPress={onPressRight}>
            {this.right()}
          </TouchableOpacity>
        </If>
        <If condition={!onPressRight}>
          {this.right()}
        </If>
      </View>
      {this.props.opBar}
    </TouchableOpacity>
  }
}

export default GoodListItem

const styles = StyleSheet.create({
  productRow: {
    padding: 5,
    paddingLeft: 0,
    marginLeft: 2,
    marginBottom: 3,
    backgroundColor: '#fff',
  },
  listImageSize: {
    width: pxToDp(150),
    height: pxToDp(150)
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  cowbetween: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  },
  n2grey6: {
    color: colors.color666,
    fontSize: 12
  },
  n2b: {
    color: colors.color333,
    fontSize: 12,
    fontWeight: "bold"
  },
})
