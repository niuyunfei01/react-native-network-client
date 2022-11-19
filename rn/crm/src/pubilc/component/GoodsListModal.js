import React from 'react'
import PropTypes from 'prop-types'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import colors from "../styles/colors";
import HttpUtils from "../util/http";
import tool from "../util/tool";
import {ToastShort} from "../util/ToastUtils";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import numeral from "numeral";
import Config from "../common/config";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

let {height, width} = Dimensions.get("window");

class GoodsListModal extends React.Component {
  static propTypes = {
    accessToken: PropTypes.string,
    order_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    currStoreId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    setState: PropTypes.func,
    onPress: PropTypes.func,
    show_goods_list: PropTypes.bool
  }

  state = {
    goods_list: [],
    show_goods_list_modal: false,
    is_fn_price_controlled: false,
    is_fn_show_wm_price: false,
    is_fn_total_price: false,
    is_loading: false,
    count: '',
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {accessToken, order_id, show_goods_list} = nextProps;
    if (tool.length(order_id) <= 0 || Number(order_id) <= 0 || !show_goods_list || this.state.show_goods_list_modal) {
      return null;
    }
    this.state.show_goods_list_modal = true
    this.getOrderGoodsList(accessToken, order_id)
  }

  getOrderGoodsList = (accessToken, order_id) => {
    this.setState({
      is_loading: true
    })
    const url = '/v4/wsb_order/order_items/' + order_id
    const params = {access_token: accessToken}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      if (tool.length(res?.list) <= 0) {
        ToastShort('暂无商品信息');
        return this.closeModal();
      }
      this.setState({
        is_loading: false,
        goods_list: res?.list,
        is_fn_show_wm_price: res?.is_fn_show_wm_price,
        is_fn_price_controlled: res?.is_fn_price_controlled,
        is_fn_total_price: res?.is_fn_total_price,
        count: res?.count,
      })
    }, () => {
      this.closeModal()
    }).catch(() => {
      this.closeModal()
    })
  }

  closeModal = () => {
    this.setState({
      is_loading: false,
      show_goods_list_modal: false,
      goods_list: [],
      count: '',
    }, () => {
      this.props.setState({
        show_goods_list: false,
        order_id: 0,
      })
    })
  }


  render(): React.ReactNode {
    let {currStoreId, onPress} = this.props;
    let {
      show_goods_list_modal,
      goods_list,
      count,
      is_fn_show_wm_price,
      is_fn_price_controlled,
      is_fn_total_price,
      is_loading
    } = this.state;
    if (!show_goods_list_modal) {
      return null
    }
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.closeModal}
             maskClosable transparent={true}
             animationType="fade"
             visible={show_goods_list_modal}>
        <View style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flex: 1
        }]}>
          <TouchableOpacity onPress={this.closeModal} style={{flexGrow: 1}}/>
          <View style={[{
            backgroundColor: colors.white,
            maxHeight: height * 0.8,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }]}>

            <If condition={is_loading}>
              <View style={{
                height: 200,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator color={colors.color666} size={60}/>
              </View>
            </If>
            <If condition={!is_loading}>
              <View>
                <View style={{
                  flexDirection: 'row',
                  padding: 12,
                  paddingBottom: 5,
                  justifyContent: 'space-between',
                }}>
                  <Text style={{fontWeight: 'bold', fontSize: 15, lineHeight: 30}}>
                    商品{count}件
                  </Text>
                  <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
                </View>

                <ScrollView automaticallyAdjustContentInsets={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={{paddingHorizontal: 12, maxHeight: 380}}>
                  <For index='idx' of={goods_list} each='item'>
                    <TouchableOpacity key={idx} onPress={() => {
                      this.closeModal()
                      onPress(Config.ROUTE_GOOD_STORE_DETAIL, {pid: item?.product_id, storeId: currStoreId, item: item})
                    }} style={Styles.ItemRowContent}>
                      {tool.length(item.product_img) > 0 ?
                        <Image
                          style={{
                            width: 60,
                            height: 60,
                            marginRight: 9,
                            borderRadius: 5
                          }}
                          source={{uri: item.product_img}}
                        /> :
                        <FontAwesome5 name={'file-image'} style={Styles.fileImg}/>
                      }
                      <View style={{height: 60, flex: 1}}>
                        <Text style={Styles.ContentText}>
                          <If condition={item.shelf_no}>{item.shelf_no} </If>
                          {tool.jbbsubstr(item.name, 21)}
                        </Text>
                        <Text style={Styles.productIdText}>
                          #{item.product_id}
                        </Text>

                        <View style={Styles.isMgrContent}>
                          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            <If condition={is_fn_price_controlled}>
                              <Text style={Styles.priceMode}>保</Text>
                              <Text style={Styles.color44140}>
                                {numeral(item?.supply_price / 100).format('0.00')}元
                              </Text>
                              <If condition={is_fn_total_price}>
                                <View style={Styles.ml30}/>
                                <Text style={Styles.color44140}>
                                  总价 {numeral(item?.supply_price * item?.num / 100).format('0.00')}元
                                </Text>
                              </If>
                            </If>
                            <If condition={is_fn_show_wm_price}>
                              <Text style={Styles.priceModes}>外</Text>
                              <Text style={Styles.color44140}>{numeral(item?.price).format('0.00')}元 </Text>
                              <If condition={is_fn_total_price}>
                                <View style={Styles.ml30}/>
                                <Text style={Styles.color44140}>
                                  总价 {numeral(item?.price * item?.num).format('0.00')}元
                                </Text>
                              </If>
                            </If>
                          </View>
                          <Text style={{
                            fontSize: 12,
                            color: colors.color666
                          }}>{item.num > 1 ? `[x${item.num}]` : `x${item.num}`} </Text>
                        </View>
                      </View>

                    </TouchableOpacity>
                  </For>
                </ScrollView>
              </View>
            </If>
          </View>
        </View>
      </Modal>
    )
  }
}

const Styles = StyleSheet.create({
  ItemRowContent: {
    height: 60,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileImg: {
    width: 60,
    height: 60,
    fontSize: 60,
    color: colors.color666,
    marginRight: 9,
    borderRadius: 5
  },
  ContentText: {
    fontSize: 12,
    color: colors.color333,
  },
  productIdText: {fontSize: 12, color: colors.color999},
  isMgrContent: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  color44140: {color: colors.color333, fontSize: 12, marginLeft: 4, marginRight: 20},
  ml30: {marginLeft: 30},
  priceMode: {
    borderWidth: 0.5,
    borderRadius: 2,
    borderColor: '#ff6600',
    color: '#ff6600',
    height: 15,
    width: 15,
    fontSize: 11,
    textAlign: 'center'
  },
  priceModes: {
    borderWidth: 0.5,
    borderRadius: 2,
    borderColor: colors.main_color,
    color: colors.main_color,
    height: 15,
    width: 15,
    fontSize: 11,
    textAlign: 'center'
  },
})

export default GoodsListModal
