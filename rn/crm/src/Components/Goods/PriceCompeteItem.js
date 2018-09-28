import React, {PureComponent} from 'react'
import {StyleSheet, Text, View} from "react-native";
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp";
import BaseItem from "./BaseItem";

export default class PriceCompeteItem extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    image: PropTypes.string,
    wmPrice: PropTypes.number,
    goods_name: PropTypes.string,
  }
  
  render () {
    console.log(this.props)
    return (
      <View style={[styles.container, this.props.style]}>
        <BaseItem
          image={this.props.image}
          name={this.props.goods_name}
          wmPrice={this.props.wmPrice}
          showModifyPriceBtn={true}
        />
        <View style={styles.trade_info_box}>
          <Text style={styles.trade_title}>同行情况(2)</Text>
          <View style={styles.trade_item}>
            <Text style={styles.trade_item_text}>菜老包沙河店(4.8分) - ¥10.5</Text>
          </View>
          <View style={styles.trade_item}>
            <Text style={styles.trade_item_text}>菜老包沙河店(4.8分) - ¥10.5</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  trade_info_box: {
    paddingHorizontal: pxToDp(30)
  },
  trade_title: {
    fontSize: pxToDp(28),
    color: '#a2a2a2'
  },
  trade_item: {
    paddingVertical: pxToDp(22),
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee'
  },
  trade_item_text: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  }
})