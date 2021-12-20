import React, {PureComponent} from 'react';
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchProductDetail, getUnRelationGoodsStores, RelateToStore} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from '../../styles/colors'
import {hideModal, showModal, ToastLong} from '../../util/ToastUtils';
import * as tool from "../../common/tool";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      fetchProductDetail,
      getUnRelationGoodsStores,
      RelateToStore,
      ...globalActions
    }, dispatch)
  }
}

class GoodsRelatedScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      product_detail: {},
      msg: '加载中',
      isRefreshing: false,
      storesList: []
    }
    this.setBeforeRefresh = this.setBeforeRefresh.bind(this)
  }

  UNSAFE_componentWillMount() {
    let {productId, product_detail} = this.props.route.params || {};
    if (!(productId < 0 || product_detail)) {
      this.getProductDetail(productId)
    } else {
      this.setState({product_detail: product_detail})
    }
    this.getStoresList()
  }

  getProductDetail(productId) {
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    const {dispatch} = this.props;
    showModal('加载中')
    this.setState({loading: true, msg: '加载中'});
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchProductDetail(productId, currVendorId, accessToken, (resp) => {
        _this.setState({loading: false});
        hideModal()
        if (resp.ok) {
          let product_detail = resp.obj;
          _this.setState({
            product_detail: product_detail,
          });
        } else {
          ToastLong('' + resp.desc)
        }

      }));
    });
  }

  getStoresList() {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {productId} = this.props.route.params || {};
    showModal('加载中')
    this.setState({loading: true, msg: '加载中'});
    dispatch(getUnRelationGoodsStores(productId, accessToken, (resp) => {
      hideModal()
      this.setState({
        loading: false,
        storesList: resp.obj,
        isRefreshing: false
      });
      if (resp.ok) {
        this.setState({storesList: resp.obj});
      } else {
        ToastLong(resp.desc)
      }
    }))
  }

  deleteFromArr(id) {
    this.state.storesList.forEach((item, index) => {
      if (item && item.store_id == id) {
        this.state.storesList.splice(index, 1);
        this.forceUpdate()
      }
    })
  }

  setBeforeRefresh() {
    this.props.route.params.refreshStoreList()
  }

  productToStore(storeId, productId) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    if (this.state.loading) {
      return false;
    }

    this.setState({loading: true, msg: '正在关联..'});
    showModal('正在关联..')
    let data = {
      store_id: storeId,
      product_id: productId
    };
    console.log(data);
    dispatch(RelateToStore(data, accessToken, (ok, reason, obj) => {
      this.setState({loading: false});
      hideModal()
      if (ok) {
        ToastLong('关联成功');
        this.setBeforeRefresh();
        this.deleteFromArr(storeId);
      } else {
        ToastLong(reason)
      }
    }))
  }

  renderEmpty() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
        <Image style={{width: pxToDp(100), height: pxToDp(135)}}
               source={require('../../img/Goods/zannwujilu.png')}/>
        <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>
          当前品牌下没有可关联的店铺
        </Text>
      </View>
    )

  }

  render() {
    let {name, id, price, source_img} = this.state.product_detail
    return (
      <View style={{flex: 1}}>
        <View style={styles.header}>
          <Image
            style={styles.img}
            source={!!source_img ? {uri: source_img} : require('../../img/Order/zanwutupian_.png')}
          />
          <View style={{flex: 1, height: pxToDp(110)}}>
            <Text style={styles.name}>
              {name}
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={[styles.order_price, styles.p_id]}>#{id}</Text>
              <Text style={styles.order_price}>￥{price}</Text>
            </View>
          </View>
        </View>
        <View style={{height: pxToDp(70), justifyContent: 'center', paddingHorizontal: pxToDp(30)}}>
          <Text>关联店铺</Text>
        </View>
        <ScrollView style={{backgroundColor: '#fff', flex: 1}}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => {
                          this.setState({isRefreshing: true});
                          this.getStoresList()
                        }}
                        tintColor='gray'
                      />
                    }>
          {
            this.state.storesList.length > 0 ? this.state.storesList.map((item, index) => {
              return (
                <View style={styles.item} key={index}>
                  <Text style={[styles.name, {color: colors.color333}]}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.productToStore(item.store_id, id);
                    }}
                  >
                    <Text style={[styles.btn, styles.order_price]}>关联</Text>
                  </TouchableOpacity>
                </View>
              )
            }) : this.renderEmpty()
          }
        </ScrollView>
        {/*<Toast*/}
        {/*    icon="loading"*/}
        {/*    show={this.state.loading}*/}
        {/*    onRequestClose={() => {*/}
        {/*    }}*/}
        {/*>{this.state.msg}</Toast>*/}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: pxToDp(170),
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.main_color,
  },
  img: {
    width: pxToDp(110),
    height: pxToDp(110),
    borderWidth: pxToDp(1),
    marginRight: pxToDp(10)
  },
  name: {
    fontSize: pxToDp(28),
    color: '#fff',
    flex: 1
  },
  order_price: {
    color: '#fff'
  },
  p_id: {
    borderWidth: pxToDp(1),
    borderColor: '#fff',
    borderRadius: pxToDp(20),
    fontSize: pxToDp(26),
    paddingHorizontal: pxToDp(10)
  },
  item: {
    height: pxToDp(100),
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.new_back,
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  btn: {
    width: pxToDp(120),
    backgroundColor: colors.main_color,
    color: '#fff',
    textAlign: 'center',
    borderRadius: pxToDp(10),
    paddingVertical: pxToDp(8)
  }

});
export default connect(mapStateToProps, mapDispatchToProps)(GoodsRelatedScene);
