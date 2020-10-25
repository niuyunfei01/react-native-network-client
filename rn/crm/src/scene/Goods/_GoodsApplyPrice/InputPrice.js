import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {StyleSheet, Text, TextInput, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import tool from "../../../common/tool";
import {Checkbox} from '@ant-design/react-native';
import color from '../../../widget/color'

const AgreeItem = Checkbox.AgreeItem;
export default class InputPrice extends PureComponent {
  static propTypes = {
    style: PropTypes.any,
    referPrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    priceRatio: PropTypes.object,
    onInput: PropTypes.func,
    initPrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  }
  
  constructor (props) {
    super(props)
    this.state = {
      wm_price: '计算中',
      supply_price: 0,
      supply_price_ratio: 0,
      input_value: 0,
      initPrice: '0'
    }
  }
  
  componentWillReceiveProps (nextProps) {
    if (nextProps.initPrice !== this.props.initPrice && Object.keys(nextProps.priceRatio).length) {
      this.onInputPrice(nextProps.initPrice, nextProps.priceRatio)
    }
  }
  
  onInputPrice (val, ratio) {
      this.onUpdateWmPrice(val, ratio)
  }
  
  onUpdateWmPrice (val, ratio) {
    console.log('ratio ?', ratio, 'priceRatio ?', this.props.priceRatio)
    ratio = ratio ? ratio : this.props.priceRatio
    let radd = 100
    if (typeof (ratio.radd) === 'object') {
      for (let i of ratio.radd) {
        if (Number(val) >= Number(i.min) && Number(val) < Number(i.max)) {
          radd = i.percent;
          break
        }
      }
    } else {
      if (!isNaN(ratio.radd)) {
        radd = parseInt(ratio.radd)
      }
    }
  
    let r = 1 / (1 - ratio.rs - ratio.ri - ratio.rp)
    let add = parseInt(radd) / 100
    let wm_price = (val * r * add).toFixed(2)
    let optimize_price = tool.priceOptimize(wm_price * 100) / 100
    console.log(r, add, wm_price, optimize_price)
    this.setState({wm_price: optimize_price})
    this.props.onInput && this.props.onInput(val, wm_price)
  }
  
  onUpdateSupplyPrice (val, ratio) {
    ratio = ratio ? ratio : this.props.priceRatio
    let radd = null
    if (typeof (ratio.radd) === 'object') {
      for (let i of ratio.radd) {
        if (val >= i.min && val < i.max) {
          radd = i.percent;
          break
        }
      }
    } else {
      radd = ratio.radd
    }
    let supply_price_ratio = (1 / (1 - ratio.rs - ratio.ri - ratio.rp) * parseInt(radd) / 100)
    let supply_price = (val / supply_price_ratio).toFixed(2)
    this.setState({input_value: val, supply_price, supply_price_ratio: supply_price_ratio.toFixed(1)})
    this.props.onInput && this.props.onInput(supply_price)
  }
  
  render () {
    return (
      <View style={[styles.cell_box]}>
        <View style={styles.top}>
          <View style={styles.input_box}>
            <Text style={styles.title}>请输入供货价</Text>
            <TextInput
              defaultValue={this.props.initPrice ? this.props.initPrice : '0'}
              keyboardType={'numeric'}
              underlineColorAndroid="transparent"
              style={styles.input}
              placeholder={'请输入价格'}
              onChangeText={(val) => this.onInputPrice(val ? parseFloat(val) : 0)}
            />
            <Text>元</Text>
          </View>
          
          <If condition={this.props.spec}>
            <Text style={styles.unit_price}>
              外卖价约{tool.toFixed(this.state.wm_price / this.props.spec * 500, 'yuan')}元/斤
            </Text>
          </If>
        </View>
        
        <View style={styles.bottom}>
          <AgreeItem
            style={styles.agreeItem}
            onChange={e => this.props.onAutoOnlineChange && this.props.onAutoOnlineChange(e)}
            defaultChecked={true}
          >
            <Text>价格生效后自动上架</Text>
          </AgreeItem>
  
          <If condition={this.props.rank}>
            <Text style={styles.rank}>
              您的价格排名<Text style={styles.rankTip}>{this.props.rank}</Text>/{this.props.rankMax}
            </Text>
          </If>
          <If condition={!this.props.rank}>
            <Text style={styles.rank}>无法计算排名</Text>
          </If>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26),
    backgroundColor: '#ffffff',
    marginTop: pxToDp(10)
  },
  top: {
    // marginTop: pxToDp(26),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: pxToDp(60),
    flex: 1
  },
  title: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  },
  input_box: {
    height: pxToDp(80),
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 0,
    width: pxToDp(120),
    paddingHorizontal: pxToDp(20)
  },
  agreeItem: {
    marginLeft: pxToDp(-30),
    width: pxToDp(400)
  },
  rank: {
    color: color.fontGray,
    fontSize: pxToDp(20)
  },
  rankTip: {
    color: color.red,
    fontSize: pxToDp(30)
  },
  unit_price: {
    color: '#ff6600',
    fontSize: pxToDp(24)
  }
})