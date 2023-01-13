import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {LineView, ShortLineView, Styles} from "../home/GoodsIncrementService/GoodsIncrementServiceStyle";
import AntDesign from "react-native-vector-icons/AntDesign";
import colors from "../../pubilc/styles/colors";
import CommonModal from "../../pubilc/component/goods/CommonModal";
import {Checkbox} from "@ant-design/react-native";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import {hideModal, showError, showModal, showSuccess} from "../../pubilc/util/ToastUtils";
import tool from "../../pubilc/util/tool";
import JbbAlert from "../../pubilc/component/JbbAlert";

const styles = StyleSheet.create({
  baseRowCenterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  baseRowLeftText: {
    paddingLeft: 12,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 16,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 22,
    width: 160
  },
  baseRowCenterText: {
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    flex: 1
  },
  baseRowRightText: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 7,
    color: colors.colorCCC,
    fontSize: 14
  },
  modalWrap: {
    minHeight: '40%', maxHeight: '90%', backgroundColor: colors.white
  },
  modalHeaderText: {
    paddingTop: 7,
    paddingBottom: 5,
    fontSize: 18,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 25
  },
  closeModal: {
    paddingTop: 8,
    paddingBottom: 5,
    paddingRight: 8,
    paddingLeft: 8,
    width: 40
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 22,
    paddingVertical: 13,
    textAlign: 'center'
  },
  cancelBtn: {
    paddingVertical: 10,//垂直
    paddingHorizontal: 13,
    fontSize: 12,
    fontWeight: '400',
    color: colors.color999,

    lineHeight: 17,
  },
  doneBtnText: {
    paddingVertical: 10,//垂直
    paddingHorizontal: 17,
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color,
    lineHeight: 17,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 22,
    paddingLeft: 22,
    paddingTop: 8
  },
  modalRowWrap: {
    marginLeft: 23,
    marginTop: 33,
    marginRight: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textInput: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 4,
    flex: 1,
    marginRight: 6,
  },

  baseText: {
    fontSize: 16, fontWeight: '400', color: colors.color333, lineHeight: 22
  },
  unifiedPricingText: {
    textAlign: 'right',
    flex: 1,
    padding: 4,
    marginRight: 6,
  },
  modalLeftWidth: {width: 80},
  modalRightWith: {width: 40},
  unifiedPricingTip: {
    fontSize: 12, fontWeight: '400', color: colors.red, lineHeight: 17, marginLeft: 23, marginTop: 11
  },
  checkBoxWrap: {flexDirection: 'row', alignItems: 'center'},
  pageWrap: {marginBottom: 12},
  modalBottom: {paddingBottom: 24},

  headerWrap: {padding: 12, flex: 1},
  headerText: {fontSize: 15, fontWeight: 'bold', color: colors.color333,},
  desc: {fontSize: 16, color: colors.color333, fontWeight: 'bold', marginVertical: 10},

  shanWrap: {backgroundColor: '#FFD225'},
  shanText: {color: colors.color333},
  eleWrap: {backgroundColor: '#0292FE',},
  jingDongWrap: {backgroundColor: colors.main_color},
  normalWrap: {
    backgroundColor: '#FF8309',
    borderRadius: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
  },
  normalText: {fontSize: 11, color: colors.white},

})

class NewRetailPriceScene extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      openModalFrom: '',
      productInfo: {
        p: {name: ''},
        sp: {supply_price: '', left_since_last_stat: ''}
      },
      skus: [],
      selectSku: {sku_name: '', es_alone_price: {}, es_unify_price: {}},
      editCostPrice: '',
      editStock: '',
      editPrice: '',
      editAlonePrice: '',
      selectExtStore: {},
      selectPriceType: 1
    }
  }

  componentDidMount() {
    GlobalUtil.setGoodsFresh(2)
    this.getProductDetail()
  }

  getProductDetail = (pid = '') => {
    const {productId} = this.props.route.params

    const {store_id, accessToken} = this.props.global
    showModal('加载中')
    const url = `api_products/get_prod_with_store_detail/${store_id}/${productId}?access_token=${accessToken}`
    HttpUtils.get(url).then(res => {
      hideModal()
      const {sp, p} = res
      let skus = [{
        product_id: sp.product_id,
        sku_name: p.sku_name ?? '',
        price: sp.price,
        es_alone_price: sp.es_alone_price,
        es_unify_price: sp.es_unify_price,
        left_since_last_stat: sp.left_since_last_stat,
        strict_providing: sp.strict_providing,
        supply_price: sp.supply_price
      }]
      if (Array.isArray(sp.skus))
        skus = skus.concat(sp.skus)
      const selectSku = pid !== '' ? skus.filter(item => item.product_id === pid)[0] : tool.length(skus) > 0 ? skus[0] : {
        sku_name: '',
        supply_price: '0',
        left_since_last_stat: '0'
      }
      this.setState({
        productInfo: res,
        skus: skus,
        editPrice: `${sp.price}`,
        selectSku: selectSku,
        editCostPrice: `${parseFloat(selectSku.supply_price / 100).toFixed(2)}`,
        editStock: selectSku.left_since_last_stat,
      })
    }).catch(error => showError(error.reason))
  }

  renderHeaderProductionName = () => {
    const {productInfo = {}, is_promotion = 1, act_plat_3 = 1, act_plat_7 = 1, act_plat_1 = 1} = this.state

    return (
      <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.headerText}>
        {productInfo.p?.name}
        <If condition={false}>
          <If condition={Platform.OS === 'ios'}>
            &nbsp;
          </If>
          <View style={styles.checkBoxWrap}>
            <If condition={act_plat_3}>
              <View style={[styles.normalWrap, styles.shanWrap]}>
                <Text style={[styles.normalText, styles.shanText]}>闪</Text>
              </View>
            </If>
            <If condition={act_plat_7}>
              <View style={[styles.normalWrap, styles.eleWrap]}>
                <Text style={styles.normalText}>饿</Text>
              </View>
            </If>
            <If condition={act_plat_1}>
              <View style={[styles.normalWrap, styles.jingDongWrap]}>
                <Text style={styles.normalText}>京</Text>
              </View>
            </If>
            <If condition={is_promotion}>
              <View style={styles.normalWrap}>
                <Text style={styles.normalText}>活</Text>
              </View>
            </If>
          </View>
        </If>

      </Text>
    )

  }
  getHeader = () => {
    const {
      skus = [], selectSku = {},
    } = this.state
    return (
      <View style={Styles.zoneWrap}>
        <View style={styles.headerWrap}>
          {this.renderHeaderProductionName()}
        </View>
        <LineView/>
        <TouchableOpacity style={styles.baseRowCenterWrap}
                          onPress={() => this.setState({modalVisible: true, openModalFrom: 'spec'})}>
          <Text style={styles.baseRowLeftText}>
            规格
          </Text>
          <Text style={styles.baseRowCenterText}>
            {tool.length(selectSku.sku_name) > 0 ? selectSku.sku_name : tool.length(skus) > 0 ? skus[0].sku_name : ''}
          </Text>
          <AntDesign name={'right'} style={styles.baseRowRightText}/>
        </TouchableOpacity>
        <ShortLineView/>
        <TouchableOpacity style={styles.baseRowCenterWrap}
                          onPress={() => this.setState({modalVisible: true, openModalFrom: 'cost_price'})}>
          <Text style={styles.baseRowLeftText}>
            成本价格
          </Text>
          <Text style={styles.baseRowCenterText}>
            ￥{parseFloat(selectSku.supply_price / 100).toFixed(2)}
          </Text>
          <Text style={styles.baseRowRightText}>
            修改<AntDesign name={'right'} style={styles.baseRowRightText}/>
          </Text>
        </TouchableOpacity>

        <If condition={selectSku.strict_providing === '1'}>
          <ShortLineView/>
          <TouchableOpacity style={styles.baseRowCenterWrap}
                            onPress={() => this.setState({modalVisible: true, openModalFrom: 'cost_price'})}>
            <Text style={styles.baseRowLeftText}>
              库存
            </Text>
            <Text style={styles.baseRowCenterText}>
              {selectSku.left_since_last_stat}
            </Text>
            <Text style={styles.baseRowRightText}>
              修改<AntDesign name={'right'} style={styles.baseRowRightText}/>
            </Text>
          </TouchableOpacity>
        </If>
      </View>
    )
  }

  selectExtStore = (item) => {
    this.setState({
      modalVisible: true,
      selectExtStore: item,
      openModalFrom: 'separatelyPriced',
      selectPriceType: 1,
      editAlonePrice: ''
    })
  }

  getPlatformPrice = () => {
    const {selectSku} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <View style={styles.baseRowCenterWrap}>
          <Text style={Styles.headerTitleText}>
            平台售价
          </Text>
          <Text style={[styles.baseRowRightText, {color: colors.main_color}]}
                onPress={() => this.setState({modalVisible: true, openModalFrom: 'unified_pricing'})}>
            统一定价
          </Text>
        </View>
        <LineView/>
        {
          selectSku.es_unify_price && Object.keys(selectSku.es_unify_price).map((keys, index) => {
            return (
              <View key={index}>
                <TouchableOpacity
                  style={styles.baseRowCenterWrap}
                  onPress={() => this.selectExtStore(selectSku.es_unify_price[keys])}>
                  <Text style={styles.baseRowLeftText}>
                    {selectSku.es_unify_price[keys].name}
                  </Text>
                  <Text style={styles.baseRowCenterText}>
                    ￥{selectSku.es_unify_price[keys].price}
                  </Text>
                  <Text style={styles.baseRowRightText}>
                    修改<AntDesign name={'right'} style={styles.baseRowRightText}/>
                  </Text>
                </TouchableOpacity>
                <ShortLineView/>
              </View>
            )
          })
        }
      </View>
    )
  }

  setAlonePrice = (item) => {

    this.setState({
      modalVisible: true,
      selectExtStore: item,
      openModalFrom: 'separatelyPriced',
      selectPriceType: 2,
      editAlonePrice: item.price
    })
  }

  getSinglePrice = () => {
    const {selectSku} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          单独定价
        </Text>
        <LineView/>
        {
          selectSku.es_alone_price && Object.keys(selectSku.es_alone_price).map((keys, index) => {

            return (
              <View key={index}>
                <TouchableOpacity style={styles.baseRowCenterWrap}
                                  onPress={() => this.setAlonePrice(selectSku.es_alone_price[keys])}>
                  <Text style={styles.baseRowLeftText}>
                    {selectSku.es_alone_price[keys].name}
                  </Text>
                  <Text style={styles.baseRowCenterText}>
                    ￥{selectSku.es_alone_price[keys].price}
                  </Text>
                  <Text style={styles.baseRowRightText}>
                    修改<AntDesign name={'right'} style={styles.baseRowRightText}/>
                  </Text>
                </TouchableOpacity>
                <ShortLineView/>
              </View>
            )
          })
        }

      </View>
    )
  }

  selectSku = (item) => {
    this.setState({
      selectSku: item,
      modalVisible: false,
      openModalFrom: '',
      editCostPrice: `${parseFloat(item.supply_price / 100).toFixed(2)}`,
      editStock: item.left_since_last_stat,
      editPrice: `${item.price}`
    })
  }

  renderItem = ({item}) => {
    const {sku_name = ''} = item
    return (
      <>
        <TouchableOpacity onPress={() => this.selectSku(item)}>
          <Text style={styles.listItemText}>
            {sku_name}
          </Text>
        </TouchableOpacity>
        <ShortLineView/>
      </>
    )
  }

  closeModal = () => {
    this.setState({modalVisible: false, openModalFrom: ''})
  }

  renderSelectSpec = () => {
    const {skus} = this.state
    return (
      <View style={styles.modalBottom}>
        <View style={styles.baseRowCenterWrap}>
          <View style={styles.closeModal}/>
          <Text style={styles.modalHeaderText}>
            更换规格
          </Text>
          <AntDesign name={'close'} size={24} style={styles.closeModal} onPress={this.closeModal}/>
        </View>
        <LineView/>
        <FlatList data={skus}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={this.renderItem}
                  keyExtractor={(item, index) => `${index}`}
                  initialNumToRender={5}
        />
      </View>
    )
  }

  onChangeCostPrice = (text) => {
    this.setState({
      editCostPrice: text
    })
  }

  onChangeStock = text => {
    this.setState({editStock: text})
  }
  onChangePrice = text => {
    this.setState({editPrice: text})
  }
  selectPriceType = type => {
    this.setState({selectPriceType: type})
  }

  showTip = (platformName = '') => {
    JbbAlert.show({
      title: `当前商品正在参加【${platformName}】平台活动，无法修改价格信息`,
      desc: '若需要修改价格，请先在平台处取消商品活动',
      actionText: '知道了',
      titleStyle: styles.desc,
      descStyle: styles.desc,
      onPress: () => JbbAlert.hide()
    })
  }

  submit = () => {
    const {
      openModalFrom,
      editCostPrice,
      editStock,
      editPrice,
      selectSku,
      selectExtStore,
      selectPriceType,
      editAlonePrice
    } = this.state
    const {store_id, accessToken} = this.props.global
    // if (false) {
    //   this.setState({modalVisible: false, openModalFrom: ''}, () => this.showTip('美团闪购'))
    //
    //   return
    // }
    let url = `new_api/store_product/set_store_price?access_token=${accessToken}`,
      params = {pid: selectSku.product_id, store_id: store_id, price: editPrice, type: 0, es_id: -1}
    switch (openModalFrom) {
      case 'cost_price':
        url = `/v1/new_api/store_product/save_supply_price?access_token=${accessToken}`
        params = {pid: selectSku.product_id, store_id: store_id, supply_price: editCostPrice}
        if (selectSku.strict_providing === '1')
          params.actualNum = editStock
        break

      case 'separatelyPriced':
        params.es_id = selectExtStore.id
        params.type = selectPriceType === 1 ? 0 : 1
        params.price = selectPriceType === 1 ? editPrice : editAlonePrice
        break
    }
    HttpUtils.post(url, params).then(() => {
      showSuccess('修改成功')
      this.getProductDetail(selectSku.product_id)
    }, res => {
      showError('修改失败：' + res.reason)
    })
      .catch(error => {
        showError('修改失败：' + error.reason)
      })
    this.setState({modalVisible: false, openModalFrom: ''})

  }


  renderPrice = () => {
    const {
      openModalFrom, productInfo, selectSku, editCostPrice, editStock, editPrice, selectExtStore, selectPriceType,
      editAlonePrice
    } = this.state
    return (
      <View style={styles.modalBottom}>
        <View style={styles.baseRowCenterWrap}>
          <Text onPress={this.closeModal} style={styles.cancelBtn}>
            取消
          </Text>
          <Text style={styles.doneBtnText} onPress={this.submit}>
            完成
          </Text>
        </View>
        <LineView/>
        <Text style={styles.modalTitle}>
          {productInfo.p.name}-{selectSku.sku_name}
        </Text>
        <If condition={openModalFrom === 'cost_price'}>
          <View style={styles.modalRowWrap}>
            <Text style={[styles.baseText, styles.modalLeftWidth]}>
              成本价
            </Text>

            <TextInput keyboardType={'numeric'}
                       onChangeText={text => this.onChangeCostPrice(text)}
                       value={editCostPrice}
                       autoFocus={true}
                       textAlign={'right'}
                       style={styles.textInput}
                       placeholderTextColor={colors.color999}
                       placeholder={'请输入成本价'}/>
            <Text style={[styles.baseText, styles.modalRightWith]}>
              元
            </Text>
          </View>
          <If condition={selectSku.strict_providing === '1'}>
            <View style={styles.modalRowWrap}>
              <Text style={[styles.baseText, styles.modalLeftWidth]}>
                库存
              </Text>
              <TextInput keyboardType={'numeric'}
                         onChangeText={text => this.onChangeStock(text)}
                         textAlign={'right'}
                         value={editStock}
                         style={styles.textInput}
                         placeholderTextColor={colors.color999}
                         placeholder={'请输入库存'}/>
              <View style={styles.modalRightWith}/>
            </View>
          </If>
        </If>
        <If condition={openModalFrom === 'unified_pricing'}>
          <View style={styles.modalRowWrap}>
            <Text style={[styles.baseText, styles.modalLeftWidth]}>
              统一定价
            </Text>
            <TextInput keyboardType={'numeric'}
                       onChangeText={text => this.onChangePrice(text)}
                       autoFocus={true}
                       value={editPrice}
                       textAlign={'right'}
                       style={styles.textInput}
                       placeholderTextColor={colors.color999}
                       placeholder={'请输入统一定价'}/>
            <Text style={styles.baseText}>
              元
            </Text>
          </View>
          <Text style={styles.unifiedPricingTip}>
            修改统一定价，使用统一定价的外卖店会改变价格
          </Text>

        </If>
        <If condition={openModalFrom === 'separatelyPriced'}>
          <Text style={styles.modalTitle}>
            修改平台售价：{selectExtStore.name}
          </Text>
          <View style={styles.modalRowWrap}>
            <TouchableOpacity style={styles.checkBoxWrap} onPress={() => this.selectPriceType(1)}>
              <Checkbox checked={selectPriceType === 1} onChange={() => this.selectPriceType(1)}/>
              <Text style={styles.baseText}>
                统一定价
              </Text>
            </TouchableOpacity>
            <Text style={[styles.unifiedPricingText, styles.baseText]}>
              ￥{editPrice}
            </Text>
            <Text style={styles.baseText}>元</Text>
          </View>
          <View style={styles.modalRowWrap}>
            <TouchableOpacity style={styles.checkBoxWrap} onPress={() => this.selectPriceType(2)}>
              <Checkbox checked={selectPriceType === 2} onChange={() => this.selectPriceType(2)}/>
              <Text style={[styles.baseText]}>
                单独定价
              </Text>
            </TouchableOpacity>

            <TextInput onChangeText={text => this.onChangeAlonePrice(text)}
                       autoFocus={true}
                       textAlign={'right'}
                       value={editAlonePrice}
                       placeholderTextColor={colors.color999}
                       style={styles.textInput}
                       placeholder={'请输入单独定价'}
                       keyboardType={'numeric'}/>

            <Text style={styles.baseText}>元</Text>
          </View>

        </If>
      </View>
    )
  }

  onChangeAlonePrice = text => {
    this.setState({editAlonePrice: text})
  }
  renderModal = () => {
    const {modalVisible, openModalFrom} = this.state
    return (
      <CommonModal visible={modalVisible} position={'flex-end'} onRequestClose={this.closeModal}>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.select({android: 'height', ios: 'padding'})}>
          <If condition={openModalFrom === 'spec'}>
            {this.renderSelectSpec()}
          </If>
          <If
            condition={openModalFrom === 'cost_price' || openModalFrom === 'unified_pricing' || openModalFrom === 'separatelyPriced'}>
            {this.renderPrice()}
          </If>
        </KeyboardAvoidingView>
      </CommonModal>
    )
  }

  render() {
    return (
      <>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.pageWrap}>
          {this.getHeader()}
          {this.getPlatformPrice()}
          {this.getSinglePrice()}
        </ScrollView>
        {this.renderModal()}
      </>
    )
  }
}

const mapStateToProps = ({global}) => {
  return {global: global}
}

export default connect(mapStateToProps)(NewRetailPriceScene)
