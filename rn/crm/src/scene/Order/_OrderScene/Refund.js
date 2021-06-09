import React from 'react'
import {Text, View} from "react-native";
import AccordionItem from "../../component/AccordionItem";
import {connect} from "react-redux";
import HttpUtils from "../../../util/http";
import PropTypes from 'prop-types'
import tool from "../../../common/tool";
import pxToDp from "../../../util/pxToDp";
import styles from "../OrderStyles";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class Refund extends React.Component {
  static propTypes = {
    orderId: PropTypes.any.isRequired,
    platform: PropTypes.any.isRequired,
    isFnPriceControl: PropTypes.bool.isRequired,
    isServiceMgr: PropTypes.bool.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      accessToken: this.props.global.accessToken,
      orderId: this.props.orderId,
      platform: this.props.platform,
      refunds: []
    }
  }

  componentDidMount () {
    this.fetchRefundData()
  }

  fetchRefundData () {
    const {accessToken, orderId, platform} = this.state
    const self = this
    HttpUtils.get.bind(this.props)(`/api/order_refund/${orderId}?access_token=${accessToken}`, {platform}).then(res => {
      self.setState({refunds: res})
    })
  }

  renderProducts (products) {
    return (
      <For each="product" index="idx" of={products}>
        <View key={`prod_${idx}`} style={{flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
            <Text>{product.product_name}</Text>
            <Text>x{product.num}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <If condition={this.props.isFnPriceControl || this.props.isServiceMgr}>
              <Text style={styles.priceMode}>{'保'}</Text>
              <Text>{tool.toFixed(product.supply_price)}</Text>
            </If>
            <If condition={this.props.isServiceMgr}>
              <Text style={{marginLeft: pxToDp(10)}}>退款总额：{tool.toFixed(product.supply_price * product.num)}</Text>
            </If>
          </View>
        </View>
      </For>
    )
  }

  renderItem () {
    return (
      <For each="item" index="idx" of={this.state.refunds}>
        <View key={idx} style={{flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>退款商品：</Text>
            <View style={{flex: 1}}>
              {this.renderProducts(item.products)}
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: pxToDp(10)}}>
            <Text>退款原因：</Text>
            <View>
              <Text>{item.remark}</Text>
            </View>
          </View>
        </View>
      </For>
    )
  }

  render () {
    return this.state.refunds.length > 0 && <AccordionItem title={'退款信息'}> {this.renderItem()} </AccordionItem>
  }
}

export default connect(mapStateToProps)(Refund)