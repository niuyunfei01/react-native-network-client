import BaseComponent from "../../BaseComponent";
import React from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import color from '../../../widget/color'
import {screen,native, tool} from "../../../common";
import Config from '../../../config'
import Cts from '../../../Cts'
import {connect, bind} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from 'prop-types'
import {ToastShort} from "../../../util/ToastUtils";
import Swipeout from 'react-native-swipeout'
import CommonStyle from "../../../common/CommonStyles";
import HttpUtils from "../../../util/http";
import {Button, DatePicker, List, WhiteSpace, PickerView, Radio, InputItem, Modal, Portal, Toast} from 'antd-mobile-rn'
import Mapping from "../../../Mapping/index";
import product from "../../../Mapping/modules/product";
import moment from 'moment'

const RadioItem = Radio.RadioItem;
const Brief = List.Item.Brief;

const Dimensions = require('Dimensions');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

function mapStateToProps (state) {
  return {
    global: state.global,
    store: state.store,
  }                                                                  
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch, ...bindActionCreators({

    }, dispatch)
  }
}

class SendRedeemCoupon extends BaseComponent {
  static propTypes = {
    onChgProdNum: PropTypes.func,
    styles: PropTypes.object
  }

  static navigationOptions = ({navigation}) => {
    return {headerTitle: '发送兑换码'}
  };
  
  constructor (props) {
    super(props)

    const params = this.props.navigation.state.params;
    this.state = {
      orderId: params.orderId,
      storeId: params.storeId,
      accessToken: this.props.global.accessToken,
      coupon_type_list: [],
      selected_prod: {},
      selected_type: params.coupon_type,
      to_u_id: params.to_u_id,
      to_u_name: params.to_u_name,
      to_u_mobile: params.to_u_mobile,
      mobiles:[],
      valid_until: '',
      preview: {},
    };
  }
  
  componentDidMount () {
    this.fetchRedeemGoodCoupon()
  }

  fetchRedeemGoodCoupon () {
    const {accessToken, orderId} = this.state
    const self = this
    const params = {orderId};
    HttpUtils.get.bind(this.props)(`/api/redeem_good_coupon_type?access_token=${accessToken}`, params).then(res => {
      self.setState({coupon_type_list: res.type_list, mobiles: res.mobiles})
    })
  }

  fetchPreview () {
    const {accessToken, selected_type, selected_prod, to_u_id, to_u_mobile, valid_until} = this.state
    const self = this
    const params = {selected_type, product_id: selected_prod.product_id, to_u_id,
      valid_until:  moment(valid_until).format('YYYY-MM-DD'),
      to_u_mobile
    }
    HttpUtils.post.bind(this.props)(`/api/redeem_good_coupon_preview?access_token=${accessToken}`, params).then(res => {
      self.setState({preview: res})
    })
  }

  commitCoupon () {
    const {accessToken, selected_type, selected_prod, to_u_mobile, to_u_id, preview, valid_until} = this.state
    const self = this
    const params = {selected_type, product_id: selected_prod.product_id, to_u_id, code: preview.code,
      wm_id: this.state.orderId,
      valid_until:  moment(valid_until).format('YYYY-MM-DD'),
      to_u_mobile
    }

    if (preview.code) {
      HttpUtils.post.bind(this.props)(`/api/redeem_good_coupon_save?access_token=${accessToken}`, params).then(res => {
        self.setState({preview: res})
        Modal.alert("成功提示", "发放优惠券成功", [{text: 'OK'}])
      }, resp => {
        Modal.alert('错误提示', resp.reason, [
          {
            text: '取消',
            onPress: () => console.log('cancel'),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => console.log('ok')},
        ]);
      })
    } else {
      console.log("no sms code")
    }
  }

  onDateChanged(time) {
    this.setState({valid_until: time})
  }

  onMobileChange (m: any) {
    if (m) {
      this.setState({to_u_mobile: m});
    }
  }

  _on_prod_selection () {
    const self = this
    this.props.navigation.navigate(Config.ROUTE_SEARCH_GOODS, {
      limit_store: this.state.storeId,
      onBack: (name, prod) => {
        prod.name = name;
        console.log(prod);
        if (prod) {
          self.setState({selected_prod: prod})
        }
      },
      'type':'select_for_store',
      'prod_status': [Cts.STORE_PROD_ON_SALE, Cts.STORE_PROD_SOLD_OUT],
    })
  }

  renderCouponDispatch (item) {
    const self = this
    return (
      <View style={styles.itemContainer}>
        <ScrollView>
          <List renderHeader={() => '优惠详情'}>
            <List.Item
              arrow="horizontal"
              extra={self.state.selected_prod && (<View>
                <Text>{self.state.selected_prod.name}</Text>
                <Brief style={{ textAlign: 'right' }}>{(self.state.selected_prod.supply_price) ? '[保底]￥'+tool.toFixed(self.state.selected_prod.supply_price) : ''}</Brief>
              </View>)}
              onClick={() => this._on_prod_selection()}
              multipleLine
              wrap
            >兑换商品</List.Item>
            <DatePicker
              mode="date"
              extra={this.state.valid_until}
              value={this.state.valid_until}
              minDate = {new Date()}
              format={'YYYY-MM-DD'}
              onChange={t => this.onDateChanged(t)}>
              <List.Item arrow="horizontal" multipleLine>失效日期<Brief>至当日23:59分</Brief></List.Item>
            </DatePicker>
            {this.state.to_u_id && <List.Item multipleLine
              arrow="horizontal"
              extra={<View>
              <Brief style={{ textAlign: 'right' }}>{self.state.to_u_name}</Brief>
              <Brief style={{ textAlign: 'right' }}>{self.state.to_u_mobile}</Brief>
            </View>}
              onClick={() => {self.setState({show_mobiles: true}); console.log("show mobiles clicked!");}}
            >
              用户信息
              <Brief>优先使用正常号</Brief>
            </List.Item>}
            {this.state.show_mobiles && <PickerView
              onChange={this.onMobileChange}
              value={this.state.to_u_mobile}
              data={this.state.mobiles}
              cascade={false}
            >
            </PickerView> }
            <InputItem
              clear
              value={this.state.remark}
              onChange={value => {
                this.setState({remark: value});
              }}
              placeholder="备注信息"
            />
          </List>

          <If condition={this.state.preview.code}>
            <List renderHeader={() => '生成结果'}>
              <List.Item disabled extra={this.state.preview.code} onPress={() => {
              }}>
                优惠码
              </List.Item>
              <List.Item>
                短信预览
                <Brief>{this.state.preview.sms}</Brief>
              </List.Item>
            </List>
          </If>

          {!this.state.preview.sent_coupon_id &&
          <View style={[styles.printBtnBox,]}>
            <Button type={this.state.preview.code ? 'primary' : 'ghost'} size="small"
                    disalbed={!this.state.preview.code}
                    style={[this.state.preview.code ? styles.printBtn : styles.printBtnDisabled,]}
                    onClick={() => this.commitCoupon()}>{'发出兑换码'}</Button>
            <Button type={'ghost'} size="small" style={[styles.printBtn,]}
                    onClick={() => this.fetchPreview()}>{'试算兑换码'}</Button>
          </View>
          }
        </ScrollView>
      </View>
    )
  }
  
  render () {
    const {dataSource} = this.props
    return (
      <View style={[{flexDirection: 'row', flex: 1}, this.props.style]}>
        <View style={[styles.container]}>
          {this.renderCouponDispatch(dataSource)}
        </View>
      </View>
    )
  }
}

const rowHeight = pxToDp(120)
const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    flex: 1
  },
  itemContainer: {
    marginTop: pxToDp(15),
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(15),
    backgroundColor: '#fff',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 0,
    paddingTop: pxToDp(14),
    paddingBottom: pxToDp(14),
    borderBottomColor: colors.color999,
    borderBottomWidth: screen.onePixel,
    height: rowHeight
  },
  printBtnBox: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  printBtn: {
    // width: '40%'
  },
  printBtnDisabled: {
    // color: 'grey',
    borderColor: 'grey'
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SendRedeemCoupon)