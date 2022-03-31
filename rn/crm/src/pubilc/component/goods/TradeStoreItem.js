import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {StyleSheet, Text, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import BaseItem from "./BaseItem";


export default class TradeStoreItem extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monthSale: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    storeName: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
  }

  render() {
    return (
      <View style={this.props.style}>
        <View style={[styles.cell_box]}>
          <View style={styles.text_box}>
            <Text style={styles.store_name}>{this.props.storeName}（{this.props.record}份）</Text>
          </View>
        </View>
        <BaseItem
          image={this.props.image}
          name={this.props.name}
          wmPrice={this.props.price}
          monthSale={this.props.monthSale}
          newPrice={false}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#ffffff'
  },
  store_name: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  },
  text_box: {
    borderBottomWidth: 1,
    borderColor: '#f3f3f3',
    height: pxToDp(72),
    justifyContent: 'center'
  }
})
