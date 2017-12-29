import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  InteractionManager,
} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchProductDetail,getUnRelationGoodsStores,RelateToStore} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from '../../styles/colors'
import {ToastLong} from '../../util/ToastUtils';
import {Toast, Dialog,} from "../../weui/index";
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
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '商品管理',
    }
  };

  constructor(props) {
    super(props);
    let {product_detail} = this.props.navigation.state.params;
    console.log(this.props.navigation.state.params);
    this.state = {
      loading: false,
      product_detail: '',
      msg: '加载中',
      storesList:[]
    }
    this.setBeforeRefresh =  this.setBeforeRefresh.bind(this)
  }

  componentWillMount() {
    let {productId, product_detail} = this.props.navigation.state.params || {};
    if (productId < 0 || product_detail) {
      this.getProductDetail(productId)
    }
    this.getStoresList()
  }
  getProductDetail(productId) {
    const {accessToken} = this.props.global;
    let _this = this;
    const {dispatch} = this.props;
    this.setState({loading: true, msg: '加载中'});
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchProductDetail(productId, accessToken, (resp) => {
        _this.setState({loading: false});
        if (resp.ok) {
          let product_detail = resp.obj;
          _this.setState({
            product_detail: product_detail,
          });
        } else {
          ToastLong(resp.desc)
        }

      }));
    });
  }
  getStoresList(){
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {productId} = this.props.navigation.state.params || {};
    this.setState({loading: true, msg: '加载中'});
    dispatch(getUnRelationGoodsStores(productId, accessToken, (resp) => {
      console.log(resp);
      this.setState({loading: false,storesList:resp.obj});
      if (resp.ok) {
        this.setState({storesList:resp.obj});
      } else {
        ToastLong(resp.desc)
      }
    }))
  }
  deleteFromArr(id){
    this.state.storesList.forEach((item,index)=>{
      if(item.store_id == id){
        this.state.storesList.splice(index,1);
        this.forceUpdate()
      }
    })

  }

  setBeforeRefresh() {
    this.props.navigation.state.params.refreshStoreList()
  }
  productToStore(storeId,productId){
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    if (this.state.loading) {
      return false;
    }

    this.setState({loading: true, msg: '正在关联..'});
    let data = {
      store_id:storeId,
      product_id:productId
    };
    console.log(data);
    dispatch(RelateToStore(data, accessToken, (ok,reason,obj) => {
      this.setState({loading: false});
      if (ok) {
        ToastLong('关联成功');
        this.setBeforeRefresh();
        this.deleteFromArr(storeId);
      } else {
        ToastLong(reason)
      }
    }))
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
              <Text style={styles.name}
              >
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
          <ScrollView style={{backgroundColor: '#fff'}}>
            {
              this.state.storesList.map((item,index) => {
                return (
                    <View style={styles.item} key = {index}>
                      <Text style={[styles.name, {color: colors.color333}]}>{item.name}</Text>
                      <TouchableOpacity
                          onPress={() => {
                            this.productToStore(item.store_id,id);
                          }}
                      >
                        <Text style={[styles.btn, styles.order_price]}>关联</Text>
                      </TouchableOpacity>
                    </View>
                )
              })
            }
          </ScrollView>
          <Toast
              icon="loading"
              show={this.state.loading}
              onRequestClose={() => {
              }}
          >{this.state.msg}</Toast>
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