import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {Image, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";

export default class BaseItem extends PureComponent {
  static propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: [PropTypes.string, PropTypes.number],
    wmPrice: [PropTypes.string, PropTypes.number],
    supplyPrice: [PropTypes.string, PropTypes.number],
    monthSale: [PropTypes.string, PropTypes.number]
  }
  
  render () {
    return (
      <View style={[styles.cell_box]}>
        <Image style={[styles.goods_image]}/>
        <View style={[styles.item_right]}>
          <Text style={[styles.goods_name]}>{this.props.name}</Text>
          <View>
            {this.props.wmPrice ? (<Text style={[styles.goods_price]}>外卖价:{this.props.wmPrice}</Text>) : null}
            {this.props.monthSale ? (<Text style={[styles.goods_month_sale]}>月销:{this.props.monthSale}</Text>) : null}
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26)
  },
  goods_image: {
    width: pxToDp(120),
    height: pxToDp(120)
  },
  item_right: {
    marginLeft: pxToDp(20),
    justifyContent: 'space-between'
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
  }
})