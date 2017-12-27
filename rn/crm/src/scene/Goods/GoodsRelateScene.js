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
import {fetchProductDetail} from "../../reducers/product/productActions";
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
      msg: '加载中'
    }
  }

  doUpload() {
    this.setState({loading: true, msg: '关联中'})
  }

  componentWillMount() {
    let {productId, product_detail} = this.props.navigation.state.params || {};
    if (productId < 0 || product_detail) {
      this.getProductDetail(productId)
    }
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
            <View style={styles.item}>
              <Text style={[styles.name, {color: colors.color333}]}>名字</Text>
              <TouchableOpacity
                  onPress={() => {
                    this.doUpload();
                  }}
              >
                <Text style={[styles.btn, styles.order_price]}>关联</Text>
              </TouchableOpacity>
            </View>
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