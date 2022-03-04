import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import Styles from "../../themes/Styles";
import {CachedImage} from "react-native-img-cache";
import Config from "../../config";
import colors from "../../styles/colors";
import Cts from "../../Cts";
import pxToDp from "../../util/pxToDp";

class GoodListItem extends React.Component {
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

  supplyPriceInYuan(p) {
    return parseFloat((p.sp || {}).supply_price / 100).toFixed(2);
  }

  stock(p) {
    return (p.sp || {}).stock_str;
  }

  applyingPriceInYuan(p) {
    return parseFloat((p.sp || {}).applying_price / 100).toFixed(2);
  }

  render(): React.ReactNode {
    const {product, onPressImg, onPressRight, fnProviding} = this.props;

    const onSale = (product.sp || {}).status === `${Cts.STORE_PROD_ON_SALE}`;
    const bg = onSale ? '#fff' : colors.colorDDD;
    const offSaleTxtStyle = onSale ? {} : {color: colors.colorBBB}
    const offSaleImg = onSale ? {} : {opacity: 0.3}

    const right = <View style={[Styles.columnStart, {flex: 1, marginLeft: 5}]}>
      <Text numberOfLines={2} style={[Styles.n2b, offSaleTxtStyle]}>{product.name}</Text>
      <View style={{flexDirection: "row"}}>
        <Text style={[Styles.n2grey6, offSaleTxtStyle]}>报价：
        </Text>
        <Text
          style={[Styles.n2grey6, offSaleTxtStyle, {color: colors.warn_red}]}>{this.supplyPriceInYuan(product)}</Text>
        {product.sp && product.sp.is_fix_price === 1 ? <View
          style={{
            backgroundColor: colors.main_color,
            padding: pxToDp(3),
            borderRadius: 1,
            justifyContent: "center",
            marginLeft: pxToDp(10)
          }}>
          <Text style={{fontSize: 12, color: colors.white}}>固</Text>
        </View> :null}
      </View>

      <If condition={typeof product.sp.applying_price !== "undefined"}>
        <Text
          style={[Styles.n2grey6, {color: colors.orange}, offSaleTxtStyle]}>审核中：{this.applyingPriceInYuan(product)}</Text>
      </If>

      {fnProviding && <Text style={[Styles.n2grey6, offSaleTxtStyle]}>库存：{this.stock(product)}</Text>}
    </View>

    return <View style={[Styles.cowbetween, styles.productRow, {flex: 1, backgroundColor: bg}]}>
      <View style={{flexDirection: 'row', paddingBottom: 5}}>
        <TouchableOpacity onPress={onPressImg}>
          <CachedImage source={{uri: Config.staticUrl(product.coverimg)}} style={[Styles.listImageSize, offSaleImg]}/>
          {!onSale && <View style={[Styles.center, Styles.listImageSize, {position: 'absolute'}]}>
            <Text style={{color: colors.white}}>暂 停</Text>
            <Text style={{color: colors.white}}>售 卖</Text>
          </View>}
        </TouchableOpacity>
        {onPressRight ? <TouchableOpacity style={[Styles.columnStart, {flex: 1, marginLeft: 5}]}
                                          onPress={onPressRight}>{right}</TouchableOpacity> : right}
      </View>
      {this.props.opBar}
    </View>
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
  }
})
