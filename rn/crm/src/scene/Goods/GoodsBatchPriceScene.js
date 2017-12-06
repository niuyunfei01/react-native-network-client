import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  ActivityIndicatorIOS,
  InteractionManager
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {productSave, fetchVendorProduct} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import Icon from '../../weui/Icon/Icon'

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      fetchVendorProduct,
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
    return {headerLeft: (<NavigationItem
      icon={require('../../img/Register/back_.png')}
      iconStyle={{
      width: pxToDp(48),
      height: pxToDp(48),
      marginLeft: pxToDp(31),
      marginTop: pxToDp(20)
    }}
      onPress={() => {
      navigation.goBack();
    }}/>), headerTitle: '批量改价'}
  };

  constructor(props) {
    super(props);
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
      sell_status: 1,
      head_supplies: [
        {
          label: '是',
          key: Cts.STORE_SELF_PROVIDED
        }, {
          label: '否',
          key: Cts.STORE_COMMON_PROVIDED
        }
      ],
      head_supply: -1,
      flag: 0,
      productList: {},
      productListCopy: {}
    }
    this.getVendorProduct = this
      .getVendorProduct
      .bind(this);
    this.renderList = this
      .renderList
      .bind(this);
    this.renLoading = this
      .renLoading
      .bind(this);
    this.getChange = this
      .getChange
      .bind(this);
  }

  componentWillMount() {
    let {productId, store_product} = (this.props.navigation.state.params || {})
    store_product = tool.deepClone(store_product);
    let store_product_copy = tool.deepClone(store_product);
    this.productId = productId;
    this.store_product = store_product;
    this.store_product_copy = store_product_copy
    this.getVendorProduct()
  }

  getVendorProduct() {
    let _this = this;
    let {currVendorId} = tool.vendor(this.props.global);
    let product_id = this.productId;
    let store_product = this.store_product;
    let store_product_copy = this.store_product_copy
    if (product_id) {
      _this.setState({productList: store_product, productListCopy: store_product_copy});
      console.log('have product_id')
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

  renLoading(color = "#ccc") {
    if (Platform.OS === 'ios') {
      return <ActivityIndicatorIOS
        color={color}
        size="large"
        style={{
        height: pxToDp(32),
        width: pxToDp(32)
      }}/>
    }
    return <ActivityIndicator
      color={color}
      size={pxToDp(50)}
      style={{
      height: pxToDp(80),
      width: pxToDp(80)
    }}/>
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
          onPress={() =>{

            this.upload(s_product)

          }}
        >
          <Text style={styles.save_btn}>保存</Text>
        </TouchableOpacity>
      )
    }

    // {this.renLoading()}
  }

  getChange(s_product, store_id) {
    let productListCopy = this.state.productListCopy[store_id]
    let flag = true;
    for (const key in productListCopy) {
      if (productListCopy.hasOwnProperty(key)) {
        if (s_product[key] != productListCopy[key]) {
          return false;
        }
      }
    }
    return flag
  }

  upload(s_product) {

    console.log(s_product);
    

  }

  renderList(store_product) {
    let _this = this
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
                width: '90%'
              }
            ]}
              keyboardType='numeric'
              value={`${s_product.left_since_last_stat}`}
              onChangeText={(text) => {
              productItem.left_since_last_stat = text;
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
              value={`${s_product.price / 100}`}
              onChangeText={(text) => {
              productItem.price = text * 100;
              _this.forceUpdate()
            }}/>
          </View>

          <ModalSelector
            skin='customer'
            data={_this.state.head_supplies}
            onChange={(option) => {  this.setState({head_supply: option.key}) }}>
            <View style={[styles.header_supply]}>
              <Text style={styles.item_font_style}>
                {/*{tool.headerSupply(this.state.head_supply)}*/}
                是
              </Text>
            </View>
          </ModalSelector>
          <View style={styles.save}>
            {_this.renderOperation(s_product, store_id)
}
          </View>
        </View>
      )
    })

  }

  render() {
    return (
      <ScrollView>
        <View style={styles.title}>
          <View style={styles.store_name}>
            <Text>门店名称
            </Text>
          </View>
          <View style={styles.title_item}>
            <Text>状态</Text>
          </View>
          <View style={[styles.title_item, {}]}>
            <Text>库存</Text>
          </View>
          <View style={styles.price}>
            <Text>价格</Text>
          </View>
          <View style={styles.header_supply}>
            <Text>总部订货</Text>
          </View>

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
    alignItems: 'center'
  },
  title_item: {
    width: pxToDp(120),
    flexDirection: 'row',
    justifyContent: 'center'

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
    borderBottomColor: '#EFEFEF'
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
    fontSize: pxToDp(30),
    borderRadius: pxToDp(5),
    flexDirection: 'row',
    paddingVertical: pxToDp(5),
    paddingHorizontal: pxToDp(10)
  }
})
export default connect(mapStateToProps, mapDispatchToProps)(GoodsBatchPriceScene);