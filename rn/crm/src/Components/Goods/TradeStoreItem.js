import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {Image, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";

export default class TradeStoreItem extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: [PropTypes.string, PropTypes.number],
    monthSale: [PropTypes.string, PropTypes.number],
    storeName: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
  }
  
  render () {
    return (
      <View style={this.props.style}>
        <View style={[styles.cell_box]}>
          <Text style={styles.store_name}>{this.props.storeName}（{this.props.record}份）</Text>
        </View>
        <BaseItem
          image={this.props.image}
          name={this.props.name}
          price={this.props.price}
          monthSale={this.props.monthSale}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26)
  },
  store_name: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  }
})