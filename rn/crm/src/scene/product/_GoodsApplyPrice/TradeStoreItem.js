import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {Image, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import tool from "../../../pubilc/common/tool";
import colors from "../../../pubilc/styles/colors"


export default class TradeStoreItem extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    storeName: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
  }

  renderProduct() {
    return (
        <View style={[styles.p_cell_box, this.props.style]}>
          <View style={styles.cell}>
            <If condition={this.props.image}>
              <Image style={[styles.goods_image]} source={{uri: this.props.image}}/>
            </If>
            <View style={[styles.item_right]}>
              <View style={styles.top}>
                <View style={{flex: 1}}>
                  <Text style={[styles.goods_name]} numberOfLines={2}>{this.props.name} </Text>
                </View>

                <If condition={this.props.rank}>
                  <Text style={styles.rank}>
                    TA的价格排名<Text style={styles.rankTip}>{this.props.rank} </Text>/{this.props.rankMax}
                  </Text>
                </If>
                <If condition={!this.props.rank}>
                  <Text style={styles.rank}>无法计算排名 </Text>
                </If>
              </View>
              <View style={styles.sku}>
                <Text style={[styles.goods_price]}>外卖价:￥{tool.toFixed(this.props.price, 'yuan')} </Text>
                <Text style={styles.unit_price}>约合：￥{tool.toFixed(this.props.unit_price, 'yuan')}/斤 </Text>
              </View>
            </View>
          </View>
        </View>
    )
  }

  render() {
    return (
        <View style={this.props.style}>
          <View style={[styles.cell_box]}>
            <View style={styles.text_box}>
              <Text style={styles.store_name}>{this.props.storeName}（{this.props.record}份）</Text>
            </View>
          </View>
          {this.renderProduct()}
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
  },
  p_cell_box: {
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
    fontSize: pxToDp(24),
    color: '#666666'
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
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  rank: {
    color: colors.fontGray,
    fontSize: pxToDp(24),
    width: pxToDp(250),
    textAlign: 'right'
  },
  rankTip: {
    color: colors.red
  },
  unit_price: {
    color: '#ff6600',
    fontSize: pxToDp(24)
  }
})
