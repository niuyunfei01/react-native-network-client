import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import {StyleSheet, Text, TextInput, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import tool from "../../common/tool";
import {Checkbox} from '@ant-design/react-native';

const AgreeItem = Checkbox.AgreeItem;
export default class InputPrice extends PureComponent {
  static propTypes = {
    mode: PropTypes.oneOf([1, 2]),// 1抽佣模式 2保底模式
    style: PropTypes.any,
    referPrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    showNotice: PropTypes.bool,
    priceRatio: PropTypes.object,
    onInput: PropTypes.func,
    initPrice: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    showModeName: PropTypes.bool,
    showRemark: PropTypes.bool,
    showAutoOnline: PropTypes.bool,
    onAutoOnlineChange: PropTypes.func
  }
  
  static defaultProps = {
    showNotice: false,
    showModeName: false,
    showRemark: false,
    showAutoOnline: false
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
    if (this.props.mode === 1) {
      this.onUpdateSupplyPrice(val, ratio)
    }
    if (this.props.mode === 2) {
      this.onUpdateWmPrice(val, ratio)
    }
  }
  
  onUpdateWmPrice (val, ratio) {
    ratio = ratio ? ratio : this.props.priceRatio
    let radd = 100
    if (typeof(ratio.radd) === 'object') {
      for (let i of ratio.radd) {
        if (Number(val) >= Number(i.min) && Number(val) < Number(i.max)) {
          radd = i.percent;
          break
        }
      }
    } else {
      if (!isNaN(ratio.add)) {
        radd = parseInt(ratio.add)
      }
    }
    console.log('apply price  val ===> ', val)
    console.log('apply price  ratio ===> ',ratio)
    let wm_price = (val * (1 / (1 - ratio.rs - ratio.ri - ratio.rp)) * (parseInt(radd) / 100)).toFixed(2)
    wm_price = tool.priceOptimize(wm_price * 100) / 100
    this.setState({wm_price})
    this.props.onInput && this.props.onInput(val, wm_price)
  }
  
  onUpdateSupplyPrice (val, ratio) {
    ratio = ratio ? ratio : this.props.priceRatio
    let radd = null
    if (typeof(ratio.radd) === 'object') {
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
    const {input_value, supply_price, supply_price_ratio, wm_price} = this.state
    return (
      <View style={[styles.cell_box, this.props.style]}>
        <View style={styles.top}>
          <Text style={styles.title}>
            <If condition={this.props.mode === 1}>
              请输入外卖价格
            </If>
            <If condition={this.props.mode !== 1}>
              请输入您期望应得
            </If>
            <If condition={this.props.referPrice}>
              (建议价格{this.props.referPrice})
            </If>
          </Text>
          <If condition={this.props.showModeName}>
            <View style={styles.tag}>
              <Text style={styles.tag_text}>{this.props.mode === 1 ? '抽佣模式' : `保底模式`}</Text>
            </View>
          </If>
        </View>
        <View style={styles.input_box}>
          <TextInput
            defaultValue={this.props.initPrice ? this.props.initPrice : '0'}
            keyboardType={'numeric'}
            underlineColorAndroid="transparent"
            style={{flex: 1, padding: 0}}
            placeholder={'请输入价格'}
            onChangeText={(val) => this.onInputPrice(val ? parseFloat(val) : 0)}
          />
          <If condition={this.props.showNotice}>
            <Text style={[styles.notice]}>价格很有竞争力，指数增加0.1</Text>
          </If>
        </View>
        <If condition={this.props.showAutoOnline}>
          <View style={{marginTop: pxToDp(30), marginLeft: pxToDp(-30)}}>
            <AgreeItem
              onChange={e => this.props.onAutoOnlineChange && this.props.onAutoOnlineChange(e)}
              defaultChecked={true}
            >
              价格生效后自动上架
            </AgreeItem>
          </View>
        </If>
        <If condition={this.props.showRemark}>
          <View style={styles.remark_box}>
            {this.props.mode === 1 ? (
              <View>
                <Text style={styles.remark}>
                  商户应得：
                  {input_value} ÷ {supply_price_ratio} ≈ <Text style={{color: '#fd5b1b'}}>{supply_price}</Text>
                  元/份（保底收入）
                </Text>
              </View>
            ) : (
              <Text style={styles.remark}>
                根据您修改的保底价，改价成功后，对应的外卖(美团)价格约为：#
                <Text style={{color: '#fd5b1b'}}>{wm_price}</Text>
                元#
              </Text>
            )}
            <Text style={styles.remark}>运营费用：含平台费、常规活动费、耗材支出、运营费用、商户特别补贴等</Text>
          </View>
        </If>
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
  top: {
    // marginTop: pxToDp(26),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: pxToDp(28),
    color: '#4a4a4a'
  },
  tag: {
    backgroundColor: '#eeeeee',
    width: pxToDp(140),
    height: pxToDp(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: pxToDp(20)
  },
  tag_text: {
    fontSize: pxToDp(24),
    color: '#a4a4a4',
  },
  input_box: {
    marginTop: pxToDp(26),
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderStyle: 'solid',
    height: pxToDp(80),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: pxToDp(10)
  },
  notice: {
    height: pxToDp(60),
    color: '#ffffff',
    backgroundColor: '#59b26a',
    fontSize: pxToDp(24),
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: pxToDp(10),
    paddingVertical: pxToDp(16)
  },
  remark_box: {
    marginTop: pxToDp(22)
  },
  remark: {
    fontSize: pxToDp(24),
    color: '#a4a4a4'
  }
})