import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,

} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchVendorProduct, batchPriceSave} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import ModalSelector from "../../widget/ModalSelector/index";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import Icon from '../../weui/Icon/Icon'
import {Toast} from "../../weui/index";
import {NavigationActions} from "react-navigation";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

import {ToastLong} from "../../util/ToastUtils";

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
  static navigationOptions = ({navigation}) => {
    const {
      params = {}
    } = navigation.state;
    let {type} = params;
    return {
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => {
            navigation.goBack();
          }}/>), headerTitle: '批量改价'
    }
  };

  constructor(props) {
    super(props);
    let {fnProviding} = tool.vendor(this.props.global);

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
      productList: {},
      productListCopy: {},
      uploading: false,
      fnProviding:fnProviding
    };
    this.getVendorProduct = this.getVendorProduct.bind(this);
    this.renderList = this.renderList.bind(this);
    this.getChange = this.getChange.bind(this);
    this.upload = this.upload.bind(this);
    this.setBeforeRefresh = this.setBeforeRefresh.bind(this)
  }

  componentWillMount() {
    let {productId, store_product} = (this.props.navigation.state.params || {});
    store_product = tool.deepClone(store_product);
    store_product = this.handleObj(store_product);
    let store_product_copy = tool.deepClone(store_product);
    this.productId = productId;
    this.store_product = store_product;
    this.store_product_copy = store_product_copy;
    this.getVendorProduct()
  }

  handleObj(store_product) {
    tool.objectMap(store_product, (item, index) => {
      item.price = item.price / 100;
      item.left_since_last_stat = parseInt(item.left_since_last_stat)
    });
    return store_product
  }
  getVendorProduct() {
    let _this = this;
    let {currVendorId} = tool.vendor(this.props.global);
    let product_id = this.productId;
    let store_product = this.store_product;
    let store_product_copy = this.store_product_copy
    if (product_id) {
      _this.setState({productList: store_product, productListCopy: store_product_copy});
    } else {
      const {accessToken} = this.props.global;
      let _this = this;
      const {dispatch} = this.props;
      dispatch(fetchVendorProduct(currVendorId, product_id, accessToken, (resp) => {
        _this.setState({
          productList: tool.deepClone(resp.obj),
          productListCopy: tool.deepClone(resp.obj)
        })
      }))
    }
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
    let {state, dispatch} = this.props.navigation;
    const setRefreshAction = NavigationActions.setParams({
      params: {isRefreshing: true},
      key: state.params.detail_key
    });
    dispatch(setRefreshAction);
  }

  async upload(s_product) {
    const {store_id, product_id, price, status, self_provided, left_since_last_stat} = s_product;
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let formData = {
      store_id: store_id,
      product_id: product_id,
      price: Math.ceil(price* 100),
      sale_status: status,
      provided: self_provided,
      stock: left_since_last_stat
    };
    let check_res = this.dataValidate(formData);
    let product = tool.deepClone(s_product);
    if (check_res) {
      this.setState({uploading: true});
      dispatch(batchPriceSave(currVendorId, formData, accessToken, (ok, reason, obj) => {
        console.log('ok,reason,obj', ok, reason, obj);
        this.setState({uploading: false});
        if (ok) {
          this.setBeforeRefresh();
          this.state.productListCopy[store_id] = product;
          this.forceUpdate()
        } else {
          ToastLong(reason)
        }
      }))
    }
  }

  dataValidate(data) {
    let { price, sale_status, provided, stock} = data;
    if (price <= 0 || isNaN(price)) {
      return alert(false, '价格必须于0,请重新输入！')
    } else if (!((sale_status == Cts.STORE_PROD_ON_SALE) || (sale_status == Cts.STORE_PROD_OFF_SALE) || (sale_status == Cts.STORE_PROD_SOLD_OUT))) {
      return alert(false, '请重新选择状态！')
    } else if (!((provided == Cts.STORE_COMMON_PROVIDED) || (provided == Cts.STORE_SELF_PROVIDED))) {
      return alert(false, '请重新选择订货方式！')
    } else if (stock < 0 || isNaN(stock) ) {
      return alert(false,'库存不能小于0')
    }
    function alert(flag, msg) {
      ToastLong(msg);
      return flag
    }
    return true
  }
  renderList(store_product) {
    let _this = this;
    return tool.objectMap(store_product, function (s_product, store_id) {
      let productItem = _this.state.productList[store_id];
      return (
          <View style={styles.item} key={store_id}>
            <View style={[styles.store_name]}>
              <Text style={styles.item_name}>{s_product.store_name}</Text>
            </View>
            <ModalSelector
                skin='customer'
                data={_this.state.selling_categories}
                onChange={(option) => {
                  productItem['status'] = option.key;
                  _this.forceUpdate()
                }}>
              <View style={[styles.title_item]}>
                <Text style={styles.item_font_style}>{tool.sellingStatus(s_product.status)}</Text>
              </View>
            </ModalSelector>

            <View style={[styles.title_item]}>
              <TextInput
                  underlineColorAndroid='transparent'
                  style={[
                    styles.item_font_style, {
                      width: '100%'
                    },
                    styles.title_item
                  ]}
                  // 库存
                  keyboardType='numeric'
                  value={`${s_product.left_since_last_stat}`}
                  onChangeText={(text) => {
                    s_product.left_since_last_stat = text;
                    _this.forceUpdate()
                  }}/>
            </View>
            <View style={[styles.price]}>
              <TextInput
                  underlineColorAndroid='transparent'
                  style={[
                    styles.item_font_style, {
                      width: '100%',
                      textAlign: 'center'
                    }
                  ]}
                  keyboardType='numeric'
                  value={`${s_product.price}`}
                  onChangeText={(text) => {
                    s_product.price = text;
                    _this.forceUpdate()
                  }}/>
            </View>

            {
              _this.state.fnProviding ?  <ModalSelector
                skin='customer'
                data={_this.state.head_supplies}
                onChange={(option) => {
                  productItem.self_provided = option.key;
                  console.log(option.key)
                  _this.forceUpdate()

                }}>
              <View style={[styles.header_supply]}>
                <Text style={styles.item_font_style}>
                  {_this.headerSupply(productItem.self_provided)}
                </Text>
              </View>
            </ModalSelector>:<View/>
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
          <Toast
              icon="loading"
              show={this.state.uploading}
              onRequestClose={() => {
              }}
          >提交中</Toast>
          <View style={styles.title}>
            <View style={styles.title_item}>
              <Text>门店名称
              </Text>
            </View>
            <View style={styles.title_item}>
              <Text>状态</Text>
            </View>
            <View style={[styles.title_item]}>
              <Text>库存</Text>
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
    justifyContent:'space-between'

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
    justifyContent:'space-between'
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