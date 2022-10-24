import React, {PureComponent} from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import colors from "../../pubilc/styles/colors";
import ModalSelector from "../../pubilc/component/ModalSelector";
import AntDesign from "react-native-vector-icons/AntDesign";
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import {hideModal, showError, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

const styles = StyleSheet.create({
  storeWrap: {backgroundColor: colors.white, width: '100%'},
  storeName: {
    paddingLeft: 22,
    paddingTop: 19,
    fontSize: 16,
    fontWeight: '600',
    color: colors.color333,
    lineHeight: 22
  },
  changeStoreBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: 11,
    paddingRight: 17
  },
  changeStoreBtnText: {fontSize: 12, fontWeight: '400', color: colors.main_color, lineHeight: 17, textAlign: 'right'},
  specWrap: {
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 8
  },
  specTitleWrap: {
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  specTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 21,
    padding: 12,
  },
  specMiddleWrap: {
    flexDirection: 'row',
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  specMiddleLeftText: {fontSize: 16, fontWeight: '400', color: colors.color333, lineHeight: 22},
  specMiddleRightText: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 22},
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  priceWrap: {
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    padding: 12,
  },
  manualSetPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  manualSetPriceTip: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color999,
    lineHeight: 17,
    textAlign: 'right',
    paddingTop: 8,
  },
  manualSetPriceTextInput: {width: 120, borderRadius: 2, borderWidth: 1, borderColor: '#979797'},
  manualSetPriceUnit: {fontSize: 15, fontWeight: '400', color: colors.color999, lineHeight: 21, paddingRight: 11},
  bottomBtnWrap: {
    backgroundColor: colors.main_color,
    borderRadius: 2,
    margin: 10,
    justifyContent: 'flex-end',
  },
  bottomBtnText: {
    padding: 12,
    fontSize: 16,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 22,
    textAlign: 'center'
  }
})

const SET_PRICE = [
  {
    value: '1',
    label: '手动定价'
  },
  {
    value: '0',
    label: '单品定价'
  }
]

class RetailPriceScene extends PureComponent {

  constructor(props) {
    super(props);
    const takeOutShop = []
    const {route} = props
    const {ext_stores, selectedSpecArray} = route.params
    Object.keys(ext_stores).map(key => {
      takeOutShop.push({value: ext_stores[key].id, label: ext_stores[key].name})
    })
    this.state = {
      selectSetPriceItem: {
        value: '1',
        label: '手动定价'
      },
      selectStore: takeOutShop[0],
      selectSpec: selectedSpecArray[0],
      selectedSpecArray: selectedSpecArray,
      takeOutShop: takeOutShop,
      finalPrice: null,
      percentagePrice: 0
    }
  }


  componentDidMount() {

  }

  onChangeStore = (value) => {
    this.setState({selectStore: value})
  }
  renderChangeStore = () => {
    const {takeOutShop, selectStore} = this.state
    return (
      <View style={styles.storeWrap}>
        <Text style={styles.storeName}>
          {selectStore.label === '' ? takeOutShop[0]?.label : selectStore.label}
        </Text>
        <ModalSelector data={takeOutShop} skin="customer" defaultKey={-999}
                       onChange={value => this.onChangeStore(value)}>
          <View style={styles.changeStoreBtnWrap}>
            <Text style={styles.changeStoreBtnText}>
              更换外卖店
            </Text>
            <AntDesign name={'right'} size={12} color={colors.main_color}/>
          </View>
        </ModalSelector>
      </View>
    )
  }

  onChangeSpec = (value) => {
    this.setState({selectSpec: value})
  }
  renderSpec = () => {
    const {selectedSpecArray, selectSpec} = this.state
    const price = parseFloat(selectSpec.price / 100).toFixed(2)
    const label = selectSpec.label
    return (
      <View style={styles.specWrap}>
        <View style={styles.specTitleWrap}>
          <Text style={styles.specTitle}>
            {selectedSpecArray[0]?.goodsName}-规格
          </Text>
        </View>
        <View style={styles.specMiddleWrap}>
          <Text style={styles.specMiddleLeftText}>
            规格
          </Text>
          <ModalSelector data={selectedSpecArray} skin="customer" defaultKey={-999}
                         onChange={value => this.onChangeSpec(value)}>
            <View style={styles.rowCenter}>
              <Text style={styles.specMiddleRightText}>
                {label}
              </Text>
              <AntDesign name={'right'} size={12} color={colors.colorCCC}/>
            </View>
          </ModalSelector>
        </View>
        <View style={styles.specMiddleWrap}>
          <Text style={styles.specMiddleLeftText}>
            报价
          </Text>
          <Text style={styles.specMiddleRightText}>
            {price}元
          </Text>
        </View>
      </View>
    )
  }

  onChangeSetPrice = (selectSetPriceItem) => {
    this.setState({selectSetPriceItem: selectSetPriceItem})
  }
  renderPrice = () => {
    const {selectSetPriceItem, selectedSpecArray, finalPrice, percentagePrice} = this.state
    return (
      <View style={styles.specWrap}>
        <View style={styles.specTitleWrap}>
          <Text style={styles.specTitle}>
            {selectedSpecArray[0]?.goodsName}-定价方式
          </Text>
        </View>
        <View style={styles.priceWrap}>
          <View style={styles.manualSetPrice}>
            <Text style={styles.specMiddleLeftText}>
              零售价定价方式
            </Text>

            <ModalSelector skin={'customer'} data={SET_PRICE} defaultKey={'1'}
                           onChange={(selectSetPriceItem) => this.onChangeSetPrice(selectSetPriceItem)}>
              <View style={styles.rowCenter}>
                <Text style={styles.specMiddleRightText}>
                  {selectSetPriceItem.label}
                </Text>
                <AntDesign name={'right'} size={12} color={colors.colorCCC}/>
              </View>
            </ModalSelector>

          </View>
          <Text style={styles.manualSetPriceTip}>
            零售价单独设置，报价不能自动变化
          </Text>
        </View>

        <If condition={selectSetPriceItem.value === '0'}>
          <View style={styles.specMiddleWrap}>
            <Text style={styles.specMiddleLeftText}>
              提价规格
            </Text>
            <View style={styles.rowCenter}>
              <Text style={styles.specMiddleRightText}>
                提价
              </Text>
              <TextInput style={styles.manualSetPriceTextInput}
                         value={percentagePrice}
                         placeholder={'请输入提价百分比'}
                         placeholderTextColor={'#999999'}
                         keyboardType={'numeric'}
                         onChangeText={text => this.onChangePercentagePrice(text)}/>
              <Text style={styles.specMiddleRightText}>
                %
              </Text>
            </View>
          </View>
        </If>
        <View style={styles.specMiddleWrap}>
          <Text style={styles.specMiddleLeftText}>
            零售价
          </Text>
          <View style={styles.rowCenter}>
            <If condition={selectSetPriceItem.value === '1'}>
              <TextInput style={styles.manualSetPriceTextInput}
                         value={finalPrice}
                         keyboardType={'numeric'}
                         placeholder={'请输入零售价'}
                         placeholderTextColor={'#999999'}
                         onChangeText={text => this.onChangePrice(text)}/>
            </If>
            <If condition={selectSetPriceItem.value === '0'}>
              <Text>
                {finalPrice}
              </Text>
            </If>
            <Text>
              元
            </Text>
          </View>
        </View>
      </View>
    )
  }

  onChangePercentagePrice = (text) => {

    let num = parseInt(text)
    if (num < 0) {
      showError('请输入大于0的数字');
      return
    }
    if (isNaN(num))
      num = 0
    this.setState({percentagePrice: text})
    this.submit(0, 1, num)
  }

  onChangePrice = (text) => {
    this.setState({finalPrice: text})
  }

  submit = (type, op_type, percentagePrice) => {
    const {selectStore, selectSpec, finalPrice} = this.state
    const {accessToken} = this.props.global;
    const url = `/v1/new_api/waimai_goods/dest_wm_retail_price?access_token=${accessToken}`
    const params = {
      es_id: selectStore.value,
      pid: selectSpec.value,
      type: type,
      op_type: op_type,
      money: type === 1 ? finalPrice : 0,
      percent: type === 0 ? percentagePrice : 0
    }
    showModal('提交中')
    HttpUtils.post.bind(this.props)(url, params).then(res => {
      hideModal()
      if (0 === type) {
        this.setState({finalPrice: res.wm_price})
        return
      }
      showSuccess('修改成功')
    }, res => {
      hideModal()
      showError('修改失败，原因：' + res.reason)
    }).catch((error) => {
      hideModal()
      showError('修改失败，原因：' + error.reason)
    })
  }
  renderBottomBtn = () => {
    const {selectSetPriceItem, percentagePrice} = this.state
    return (
      <TouchableOpacity style={styles.bottomBtnWrap}
                        onPress={() => this.submit(parseInt(selectSetPriceItem.value), 2, percentagePrice)}>
        <Text style={styles.bottomBtnText}>
          提交
        </Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <>
        {this.renderChangeStore()}
        {this.renderSpec()}
        {this.renderPrice()}
        {this.renderBottomBtn()}
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(RetailPriceScene)
