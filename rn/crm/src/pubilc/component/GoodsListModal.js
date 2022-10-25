import React from 'react'
import PropTypes from 'prop-types'
import {Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import HttpUtils from "../util/http";
import tool from "../util/tool";
import {hideModal, showModal, ToastShort} from "../util/ToastUtils";
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
    currStoreId: PropTypes.string,
    setState: PropTypes.func,
    onPress: PropTypes.func,
    show_goods_list: PropTypes.bool,
    is_service_mgr: PropTypes.bool,
  }

  state = {
    goods_list: [],
    show_goods_list_modal: false,
    is_fn_price_controlled: false,
    is_fn_show_wm_price: false,
    count: false,
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {accessToken, order_id, show_goods_list} = nextProps;
    if (tool.length(order_id) <= 0 || Number(order_id) <= 0 || !show_goods_list) {
      return null;
    }
    tool.debounces(() => {
      this.getOrderGoodsList(accessToken, order_id)
    })
  }

  getOrderGoodsList = (accessToken, order_id) => {
    showModal('请求中...')
    const url = '/v4/wsb_order/order_items/' + order_id
    const params = {access_token: accessToken}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      if (tool.length(res?.list) <= 0) {
        ToastShort('暂无商品信息');
        return this.closeModal();
      }
      this.setState({
        goods_list: res?.list,
        is_fn_show_wm_price: res?.is_fn_show_wm_price,
        is_fn_price_controlled: res?.is_fn_price_controlled,
        count: res?.count,
        show_goods_list_modal: true
      }, hideModal)
    }, () => {
      hideModal()
    })
  }

  closeModal = () => {
    this.setState({
      show_goods_list_modal: false,
      goods_list: [],
    }, () => {
      this.props.setState({
        show_goods_list: false,
        order_id: 0,
      })
    })
  }


  render(): React.ReactNode {
    let {is_service_mgr, currStoreId, onPress} = this.props;
    let {show_goods_list_modal, goods_list, count, is_fn_show_wm_price, is_fn_price_controlled} = this.state;
    if (tool.length(goods_list) <= 0) {
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
                <SvgXml onPress={this.closeModal} xml={cross_icon()} width={18} height={18}/>
              </View>

              <ScrollView automaticallyAdjustContentInsets={false}
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          style={{paddingHorizontal: 12, maxHeight: 380}}>
                <For index='idx' of={goods_list} each='item'>
                  <TouchableOpacity onPress={() => {
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
                        (#{item.product_id}
                        <If condition={item.tag_code}>[{item.tag_code}]</If>)
                      </Text>

                      <View style={Styles.isMgrContent}>
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>

                          {/*管理员看到的*/}
                          <If condition={is_service_mgr || is_fn_show_wm_price}>
                            <Text style={Styles.priceMode}>保</Text>
                            <Text style={Styles.color44140}>{numeral(item.supply_price / 100).format('0.00')} </Text>
                            <View style={Styles.ml30}/>
                            <Text style={Styles.priceModes}>外</Text>
                            <Text style={Styles.color44140}>{numeral(item.price).format('0.00')} </Text>
                          </If>

                          {/*商户看到的*/}
                          <If condition={!is_service_mgr && (is_fn_price_controlled || is_fn_show_wm_price)}>
                            {/*保底模式*/}
                            <If condition={is_fn_price_controlled}>
                              <Text style={[Styles.priceMode]}>保</Text>
                              <Text style={Styles.color44140}>{numeral(item.supply_price / 100).format('0.00')} </Text>
                            </If>

                            {/*联营模式*/}
                            <If condition={is_fn_show_wm_price}>
                              <Text style={Styles.priceMode}>外</Text>
                              <Text style={Styles.color44140}>{numeral(item.price).format('0.00')} </Text>
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
  color44140: {color: colors.color333, fontSize: 12, marginLeft: 4},
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
