import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import BaseItem from './BaseItem'

export default class GoodsListItem extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    wmPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    supplyPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showModifyPriceBtn: PropTypes.bool,
    onPressModifyPrice: PropTypes.func
  }

  static defaultProps = {
    showModifyPriceBtn: false
  }

  renderBtn(text, callback) {
    return (
      <TouchableOpacity>
        <View style={styles.btn_box}>
          <Text style={styles.btn_text}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={this.props.style}>
        <BaseItem
          style={{padding: pxToDp(20)}}
          image={this.props.image}
          name={this.props.name}
          wmPrice={this.props.wmPrice}
          supplyPrice={this.props.supplyPrice}/>
        <View style={styles.btns}>
          {this.renderBtn('调价')}
          {this.renderBtn('下架')}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  btn_box: {
    width: pxToDp(235),
    height: pxToDp(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#59b26a',
    borderRadius: pxToDp(30),
    borderWidth: pxToDp(1),
    borderStyle: 'solid'
  },
  btn_text: {
    color: '#59b26a',
    fontSize: pxToDp(30)
  },
  btns: {
    paddingHorizontal: pxToDp(20),
    paddingBottom: pxToDp(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff'
  }
})
