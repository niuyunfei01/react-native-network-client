import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {batchPriceSave, fetchVendorProduct} from "../../../reducers/product/productActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import tool from '../../../pubilc/util/tool';
import Cts from '../../../pubilc/common/Cts';
import Icon from '../../../weui/Icon/Icon'
import {NavigationActions} from '@react-navigation/compat';
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      fetchVendorProduct,
      batchPriceSave,
      ...globalActions
    }, dispatch)
  }
}

class GoodsBatchPriceScene extends PureComponent {
  constructor(props) {
    super(props)
    let {fnProviding} = tool.vendor(this.props.global)
    this.navigationOptions(props)
    this.state = {
      selling_categories: [
        {
          label: '上架',
          key: Cts.STORE_PROD_ON_SALE
        }, {
          label: '下架',
          key: Cts.STORE_PROD_OFF_SALE
        }, {
          label: '缺货',
          key: Cts.STORE_PROD_SOLD_OUT
        }
      ],
      head_supplies: [
        {
          label: '是',
          key: Cts.STORE_COMMON_PROVIDED
        },
        {
          label: '否',
          key: Cts.STORE_SELF_PROVIDED
        },
      ],
      head_supply: -1,
      flag: 0,
      price_edits: {},
      productList: {},
      productListCopy: {},
      // uploading: false,
      batch_edit_supply: false,
      fnProviding: fnProviding,
    };
    this.getVendorProduct = this.getVendorProduct.bind(this);
    this.renderList = this.renderList.bind(this);
    this.getChange = this.getChange.bind(this);
    this.upload = this.upload.bind(this);
    this.setBeforeRefresh = this.setBeforeRefresh.bind(this)
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerLeft: () => (<TouchableOpacity
        style={{
          width: pxToDp(48),
          height: pxToDp(48),
          marginLeft: pxToDp(31),
          marginTop: pxToDp(20)
        }}
        onPress={navigation.goBack()}
      >
        <FontAwesome5 name={'arrow-left'} style={{fontSize: 25}}/>
      </TouchableOpacity>),
    })
  };

  UNSAFE_componentWillMount() {
    let {productId, store_product, batch_edit_supply} = (this.props.route.params || {});
    store_product = tool.deepClone(store_product);
    store_product = this.handleObj(store_product);
    let store_product_copy = tool.deepClone(store_product);
    this.productId = productId;
    this.store_product = store_product;
    this.store_product_copy = store_product_copy;
    this.setState({batch_edit_supply});
    this.getVendorProduct()
  }

  handleObj(store_product) {
    tool.objectMap(store_product, (item, index) => {
      item.price = item.price / 100;
      item.left_since_last_stat = parseInt(item.left_since_last_stat)
    });
    return store_product
  }

  _getEditInputInit(store_product) {
    let priceVal = {};
    tool.objectMap(store_product, function (s_product, store_id) {
      priceVal[store_id] = s_product.fn_price_controlled == 0 ? '' + s_product.price : '' + s_product.supply_price / 100;
    });
    return priceVal;
  }

  getVendorProduct() {
    let {currVendorId} = tool.vendor(this.props.global);
    let product_id = this.productId;
    let store_product = this.store_product;
    let store_product_copy = this.store_product_copy;
    // if (product_id) {
    //   this.setState({
    //     productList: store_product,
    //     productListCopy: store_product_copy,
    //     price_edits: this._getEditInputInit(store_product)
    //   });
    // } else {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchVendorProduct(currVendorId, product_id, accessToken, (resp) => {
      this.store_product = tool.deepClone(resp.obj.goods)
      this.store_product = this.handleObj(this.store_product)
      this.store_product_copy = tool.deepClone(resp.obj.goods)
      this.store_product_copy = this.handleObj(this.store_product_copy)
      this.setState({
        batch_edit_supply: resp.obj.batch_edit_supply_price,
        productList: tool.deepClone(resp.obj.goods),
        productListCopy: tool.deepClone(resp.obj.goods),
        price_edits: this._getEditInputInit(this.store_product)
      })

    }))
    // }
  }

  renderOperation(s_product, store_id) {
    let flag = this.getChange(s_product, store_id);
    if (flag) {
      return (<Icon
          name={'success_circle'}
          style={[styles.toastIcon]}
          size={pxToDp(50)}
          color={'#bfbfbf'}
          msg={false}/>)

    } else {
      return (
          <TouchableOpacity
              onPress={() => {
                this.upload(s_product)
              }}
          >
            <Text style={styles.save_btn}>保存</Text>
          </TouchableOpacity>
      )
    }
  }

  getChange(s_product, store_id) {
    let productListCopy = this.state.productListCopy[store_id]
    let flag = true;
    for (const key in productListCopy) {
      if (productListCopy.hasOwnProperty(key)) {
        if (s_product[key] != productListCopy[key]) {
          flag = false;
          return false
        }
      }
    }
    return flag
  }

  setBeforeRefresh() {
    const setRefreshAction = NavigationActions.setParams({
      params: {isRefreshing: true},
      nav_key: this.props.route.key
    });
    this.props.navigation.dispatch(setRefreshAction);
  }

  async upload(s_product) {
    const {store_id, product_id, price, status, self_provided, supply_price, left_since_last_stat} = s_product;
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let formData = {
      store_id: store_id,
      product_id: product_id,
      price: Math.ceil(price * 100),
      supply_price: supply_price,
      sale_status: status,
      provided: self_provided,
      stock: left_since_last_stat
    };
    let check_res = this.dataValidate(formData);
    let product = tool.deepClone(s_product);
    if (check_res) {
      showModal('提交中')
      // this.setState({uploading: true});
      dispatch(batchPriceSave(currVendorId, formData, accessToken, (ok, reason, obj) => {
        // this.setState({uploading: false});
        hideModal()
        if (ok) {
          this.setBeforeRefresh();
          let tempProductsList = this.state.productListCopy
          tempProductsList[store_id] = product
          this.setState({
            productListCopy: tempProductsList,
            productList: tempProductsList
          })
          // this.state.productListCopy[store_id] = product
          this.forceUpdate()
        } else {
          ToastLong(reason)
        }
      }))
    }
  }

  dataValidate(data) {
    let {price, sale_status, provided, stock} = data;
    if (price <= 0 || isNaN(price)) {
      return alert(false, '价格必须于0,请重新输入！')
    } else if (!((sale_status == Cts.STORE_PROD_ON_SALE) || (sale_status == Cts.STORE_PROD_OFF_SALE) || (sale_status == Cts.STORE_PROD_SOLD_OUT))) {
      return alert(false, '请重新选择状态！')
    } else if (!((provided == Cts.STORE_COMMON_PROVIDED) || (provided == Cts.STORE_SELF_PROVIDED))) {
      return alert(false, '请重新选择订货方式！')
    }
    // else if (stock < 0 || isNaN(stock) ) {
    //   return alert(false,'库存不能小于0')
    // }
    function alert(flag, msg) {
      ToastLong(msg);
      return flag
    }

    return true
  }

  renderList(store_product) {
    const _this = this;
    return tool.objectMap(store_product, function (s_product, store_id) {
      let productItem = _this.state.productList[store_id];
      const val = _this.state.price_edits[store_id] || '';
      const fn_pc = s_product.fn_price_controlled != 0;
      return (
          <View style={styles.item} key={store_id}>
            <View style={[styles.store_name]}>
              <Text style={styles.item_name}>{s_product.store_name} </Text>
            </View>
            <ModalSelector
                skin='customer'
                data={_this.state.selling_categories}
                onChange={(option) => {
                  productItem['status'] = option.key;
                  _this.forceUpdate()
                }}>
              <View style={[styles.title_item]}>
                <Text style={styles.item_font_style}>{tool.sellingStatus(s_product.status)} </Text>
              </View>
            </ModalSelector>
            <View style={[styles.price]}>
              <TextInput
                  underlineColorAndroid='transparent'
                  style={
                    !fn_pc ? [styles.item_font_style, {width: '100%', textAlign: 'center'}]
                        : [styles.item_font_style, {width: '100%', textAlign: 'center', color: '#ccc'}]
                  }
                  editable={fn_pc || _this.state.batch_edit_supply}
                  keyboardType='numeric'
                  value={val}
                  onChangeText={(text) => {

                    if (fn_pc) {
                      s_product.supply_price = Math.ceil(text * 100)
                    } else {
                      s_product.price = text;
                    }

                    _this.state.price_edits[store_id] = text;
                    _this.setState({price_edits: _this.state.price_edits});
                    _this.forceUpdate()
                  }}/>
            </View>

            {
              _this.state.fnProviding ? <ModalSelector
                  skin='customer'
                  data={_this.state.head_supplies}
                  onChange={(option) => {
                    productItem.self_provided = option.key;
                    _this.forceUpdate()

                  }}>
                <View style={[styles.header_supply]}>
                  <Text style={styles.item_font_style}>
                    {_this.headerSupply(productItem.self_provided)}
                  </Text>
                </View>
              </ModalSelector> : <View/>
            }

            <View style={styles.save}>
              {_this.renderOperation(s_product, store_id)
              }
            </View>
          </View>
      )
    })

  }

  headerSupply(mode) {
    let map = {};
    map[Cts.STORE_SELF_PROVIDED] = '否';
    map[Cts.STORE_COMMON_PROVIDED] = '是';
    return map[mode]
  }

  render() {
    return (
        <ScrollView>
          {/*<Toast*/}
          {/*    icon="loading"*/}
          {/*    show={this.state.uploading}*/}
          {/*    onRequestClose={() => {*/}
          {/*    }}*/}
          {/*>提交中</Toast>*/}
          <View style={styles.title}>
            <View style={styles.title_item}>
              <Text>门店名称
              </Text>
            </View>
            <View style={styles.title_item}>
              <Text>状态</Text>
            </View>
            <View style={styles.title_item}>
              <Text>价格</Text>
            </View>
            {
              this.state.fnProviding ?
                  <View style={[styles.header_supply, {marginRight: pxToDp(80)}]}>
                    <Text>总部订货</Text>
                  </View>
                  :
                  <Text style={{width: pxToDp(90)}}/>
            }
          </View>
          <View style={{
            backgroundColor: '#fff'
          }}>
            {this.renderList(this.state.productList)
            }
          </View>
        </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    height: pxToDp(90),
    alignItems: 'center',
    justifyContent: 'space-between'

  },
  title_item: {
    width: pxToDp(120),
    flexDirection: 'row',
    justifyContent: 'center',

  },
  header_supply: {
    width: pxToDp(120),
    alignItems: 'center'
  },
  store_name: {
    width: pxToDp(120)
  },
  price: {
    width: pxToDp(120),
    alignItems: 'center'
  },

  item: {
    height: pxToDp(120),
    borderBottomWidth: pxToDp(1),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pxToDp(30),
    borderBottomColor: '#EFEFEF',
    justifyContent: 'space-between'
  },
  item_font_style: {
    fontSize: pxToDp(30),
    color: '#32b16c',
    textAlign: 'center'
  },
  item_name: {
    fontSize: pxToDp(30),
    color: "#000000"
  },

  save: {
    width: pxToDp(80),
    alignItems: 'center',
    justifyContent: 'center'

  },
  save_btn: {
    backgroundColor: '#00A0E9',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: pxToDp(28),
    width: pxToDp(80),
    textAlign: 'center',
    marginRight: pxToDp(20),
    borderRadius: 5

  }
})
export default connect(mapStateToProps, mapDispatchToProps)(GoodsBatchPriceScene);
