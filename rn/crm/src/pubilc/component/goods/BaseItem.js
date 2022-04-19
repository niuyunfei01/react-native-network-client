import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";

export default class BaseItem extends PureComponent {
  static propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.any,
    wmPrice: PropTypes.any,
    supplyPrice: PropTypes.any,
    monthSale: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showModifyPriceBtn: PropTypes.bool,
    onPressModifyPrice: PropTypes.func,
    style: PropTypes.object,
    remark: PropTypes.string,
    wmText: PropTypes.string
  }

  static defaultProps = {
    showModifyPriceBtn: false,
    newPrice: 0,
    wmText: '外卖价'
  }

  render() {
    return (
      <View style={[styles.cell_box, this.props.style]}>
        <View style={styles.cell}>
          <If condition={this.props.image}>
            <Image style={[styles.goods_image]} source={{uri: this.props.image}}/>
          </If>
          <View style={[styles.item_right]}>
            <Text style={[styles.goods_name]}>{this.props.name} </Text>
            <View style={styles.sku}>
              <Text style={[styles.goods_price]}>
                {this.props.wmPrice || this.props.wmPrice === 0 ? `${this.props.wmText}:${this.props.wmPrice}` : null}
                {this.props.supplyPrice || this.props.supplyPrice === 0 ? `保底价:${this.props.supplyPrice}` : null}
              </Text>
              {this.props.price ? (<Text style={[styles.goods_price]}>¥:{this.props.price} </Text>) : null}
              {this.props.monthSale ? (
                <Text style={[styles.goods_month_sale]}>月销:{this.props.monthSale} </Text>) : null}
              <If condition={this.props.showModifyPriceBtn}>
                <TouchableOpacity>
                  <View>
                    <Text style={styles.btn}>调价</Text>
                  </View>
                </TouchableOpacity>
              </If>
            </View>
            <If condition={this.props.remark}>
              <Text style={styles.remark}>{this.props.remark} </Text>
            </If>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26),
    backgroundColor: '#ffffff'
  },
  cell: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee',
    flexDirection: 'row',
  },
  goods_image: {
    width: pxToDp(120),
    height: pxToDp(120)
  },
  item_right: {
    flex: 1,
    height: pxToDp(120),
    marginLeft: pxToDp(20),
    justifyContent: 'space-between',
  },
  goods_name: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  },
  goods_price: {
    fontSize: pxToDp(30),
    color: '#fd5b1b'
  },
  goods_month_sale: {
    fontSize: pxToDp(24),
    color: '#a4a4a4'
  },
  sku: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    width: pxToDp(100),
    height: pxToDp(32),
    borderRadius: pxToDp(16),
    fontSize: pxToDp(24),
    textAlign: 'center',
    lineHeight: pxToDp(32),
    backgroundColor: '#59b26a',
    color: '#fefffe'
  },
  remark: {
    fontSize: pxToDp(24)
  }
})
