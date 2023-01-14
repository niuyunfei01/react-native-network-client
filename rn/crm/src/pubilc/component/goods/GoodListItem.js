import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import FastImage from 'react-native-fast-image'
import Config from "../../common/config";
import colors from "../../styles/colors";
import Cts from "../../common/Cts";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../util/tool";
import {SvgXml} from "react-native-svg";
import {noImage} from "../../../svg/svg";

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
    const {product, fnProviding, price_type} = this.props;
    let {skus = [], sp = {}} = product
    const onSale = sp.status === `${Cts.STORE_PROD_ON_SALE}`;
    const offSaleTxtStyle = onSale ? {} : {color: colors.colorBBB}

    const {showMore} = this.state
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{flex: 1, marginLeft: 5, flexDirection: "column"}}>
        <Text numberOfLines={2} style={[styles.n2b, offSaleTxtStyle]}>
          {product.name}{product.sku_name && `[${product.sku_name}]`}
        </Text>
        <If condition={false}>
          <View style={styles.priceWrap}>
            <View style={[styles.huoWrap, styles.shanWrap]}>
              <Text style={[styles.huo, styles.shan]}>闪</Text>
            </View>
            <View style={[styles.huoWrap, styles.eleWrap]}>
              <Text style={[styles.huo]}>饿</Text>
            </View>
            <View style={[styles.huoWrap, styles.jingDongWrap]}>
              <Text style={[styles.huo]}>京</Text>
            </View>
            <View style={[styles.huoWrap]}>
              <Text style={[styles.huo]}>活</Text>
            </View>
          </View>
        </If>
        <If condition={sp.applying_price}>
          <Text style={[styles.n2grey6, {color: colors.orange}, offSaleTxtStyle]}>
            审核中：{this.applyingPriceInYuan(product)}
          </Text>
        </If>
        <If condition={fnProviding}>
          <Text style={[styles.n2grey6, offSaleTxtStyle]}>库存：{this.stock(product)} </Text>
        </If>
        <View style={{flexDirection: "row", alignItems: 'center'}}>
          <Text style={[styles.priceTextFlag, offSaleTxtStyle]}>
            {price_type ? '零售价' : '报价'}：
          </Text>
          <Text style={[styles.priceText, offSaleTxtStyle]}>
            ￥{price_type ? sp?.show_price : parseFloat(sp?.supply_price / 100).toFixed(2)}
          </Text>
        </View>
        <If condition={tool.length(skus) > 0}>
          <TouchableOpacity onPress={() => this.setState({showMore: !showMore})}>
            {
              showMore ?
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

        <If condition={tool.length(skus) > 0 && showMore}>
          {
            skus.map((item, index) => {
              const {
                sku_name = '', applying_price = 0, left_since_last_stat = 0, show_price, supply_price = '0'
              } = item
              return (
                <View style={{flexDirection: "column"}} key={index}>
                  <Text numberOfLines={2} style={[styles.multiSpecName, offSaleTxtStyle]}>[{sku_name}] </Text>
                  <If condition={applying_price}>
                    <Text style={[styles.n2grey6, {color: colors.orange}, offSaleTxtStyle]}>
                      审核中：{parseFloat(applying_price / 100).toFixed(2)}
                    </Text>
                  </If>
                  <If condition={fnProviding}>
                    <Text style={[styles.n2grey6, offSaleTxtStyle]}>
                      库存：{left_since_last_stat} 件
                    </Text>
                  </If>
                  <View style={styles.priceWrap}>
                    <Text style={[styles.priceTextFlag, offSaleTxtStyle]}>
                      {price_type ? '零售价' : '报价'}：
                    </Text>
                    <Text style={[styles.priceText, offSaleTxtStyle, {color: '#FF2200'}]}>
                      ￥{price_type ? show_price : parseFloat(supply_price / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )
            })
          }
        </If>
      </ScrollView>
    )
  }

  render() {
    const {product, onPressImg, onPressRight, opBar} = this.props;
    let {sp = {}, audit_status = '', coverimg = ''} = product
    const onSale = sp.status === `${Cts.STORE_PROD_ON_SALE}`;
    const bg = onSale ? colors.white : colors.colorDDD;
    const offSaleImg = onSale ? {} : {opacity: 0.3}

    return <TouchableOpacity style={[styles.cowbetween, styles.productRow, {flex: 1, backgroundColor: bg}]}
                             onPress={onPressImg}>
      <View style={{flexDirection: 'row', paddingBottom: 5}}>
        <View>
          <If condition={coverimg}>
            <FastImage source={{uri: Config.staticUrl(coverimg)}}
                       style={[styles.listImageSize, offSaleImg]}
                       resizeMode={FastImage.resizeMode.contain}/>
            <If condition={audit_status}>
              <View style={[styles.center, styles.listImageSize, styles.goodsStatus, {position: 'absolute'}]}>
                <Text style={{fontSize: 14, color: colors.white, opacity: 1}}>
                  {audit_status}
                </Text>
              </View>
            </If>
          </If>
          <If condition={!coverimg}>
            <SvgXml xml={noImage()} style={[styles.listImageSize, offSaleImg]}/>
          </If>

          <If condition={!onSale && !audit_status}>
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
      {opBar}
    </TouchableOpacity>
  }
}

export default GoodListItem

const styles = StyleSheet.create({
  shanWrap: {backgroundColor: '#ffd225',},
  shan: {color: colors.color333},
  eleWrap: {backgroundColor: '#0292FE',},
  jingDongWrap: {backgroundColor: colors.main_color},
  huoWrap: {
    backgroundColor: '#FF8309',
    marginRight: 4,
    borderRadius: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  huo: {fontSize: 11, color: colors.white},
  multiSpecName: {fontSize: 14, fontWeight: 'bold', color: colors.color333, paddingTop: 10},
  priceWrap: {flexDirection: "row", alignItems: 'center', paddingTop: 2},
  priceTextFlag: {fontSize: 12, color: colors.color666},
  priceText: {
    fontSize: 14,
    color: '#EE2626',
    fontWeight: 'bold',
    lineHeight: 22
  },
  productRow: {
    padding: 5,
    paddingLeft: 0,
    marginLeft: 2,
    marginBottom: 3,
    backgroundColor: colors.white,
  },
  listImageSize: {
    width: 80,
    height: 80,
    borderRadius: 4
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
    color: colors.color999,
    fontSize: 12,
    paddingTop: 4
  },
  n2b: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: "bold"
  },
  goodsStatus: {
    backgroundColor: colors.color000, opacity: 0.5
  }
})
