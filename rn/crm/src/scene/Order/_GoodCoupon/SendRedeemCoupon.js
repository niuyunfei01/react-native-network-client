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
import {Button, DatePicker, List, WhiteSpace, Radio, InputItem, Modal, Portal, Toast} from 'antd-mobile-rn'
import Mapping from "../../../Mapping/index";
import product from "../../../Mapping/modules/product";

const RadioItem = Radio.RadioItem;
const Brief = List.Item.Brief;

var Dimensions = require('Dimensions');
var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

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
    return {headerTitle: '置为无效'}
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
      preview: {},
    };
  }
  
  componentDidMount () {
    this.fetchRedeemGoodCoupon()
  }

  fetchRedeemGoodCoupon () {
    const {accessToken, order_id} = this.state
    const self = this
    HttpUtils.get.bind(this.props)(`/api/redeem_good_coupon_type?access_token=${accessToken}`, {order_id}).then(res => {
      self.setState({coupon_type_list: res})
    })
  }

  fetchPreview () {
    const {accessToken, selected_type, selected_prod, to_u_id} = this.state
    const self = this
    const params = {selected_type, product_id: selected_prod.product_id, to_u_id}
    HttpUtils.post.bind(this.props)(`/api/redeem_good_coupon_preview?access_token=${accessToken}`, params).then(res => {
      self.setState({preview: res})
    })
  }

  commitCoupon () {
    const {accessToken, selected_type, selected_prod, to_u_id, preview} = this.state
    const self = this
    const params = {selected_type, product_id: selected_prod.product_id, to_u_id, code: preview.code}
    HttpUtils.get.bind(this.props)(`/api/redeem_good_coupon_save?access_token=${accessToken}`, params).then(res => {
      self.setState({preview: res})
    }, resp => {
      Modal.alert('错误提示', resp.reason, [
        {
          text: '取消',
          onPress: () => console.log('cancel'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('ok') },
      ]);
    })
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

  _on_type_selected (selected_type) {
    this.setState({selected_type})
  }

  renderCouponTypes () {
    const {coupon_type_list, selected_type} = this.state
    console.log(coupon_type_list)
    return (
      <List renderHeader={() => '优惠类型'}>
        {coupon_type_list.map(t => (
          <RadioItem
            key={t.type}
            onChange={() => this._on_type_selected(t.type)}
            checked={selected_type === t.type}
          >
            {t.name}
            {/*<List.Item.Brief>{t.desc}</List.Item.Brief>*/}
          </RadioItem>
        ))}
      </List>
    )
  }
  
  renderCouponDispath (item) {
    const self = this
    return (
      <View style={styles.itemContainer}>
        <ScrollView>
          {this.renderCouponTypes()}
          <WhiteSpace/>
          <List renderHeader={() => '优惠详情'}>
            <List.Item
              arrow="horizontal"
              extra={self.state.selected_prod && (<View>
                {self.state.selected_prod.name}
                <Brief style={{ textAlign: 'right' }}>[保底]￥{tool.toFixed(self.state.selected_prod.supply_price)}</Brief>
              </View>)}
              onClick={() => this._on_prod_selection()}
              multipleLine
              wrap
            >兑换商品</List.Item>
            <DatePicker
              mode="date"
              extra={this.state.start}
              value={this.state.start}
              minDate = {new Date()}
              onChange={time => this.setState({start: time})}>
              <List.Item arrow="horizontal" multipleLine>失效日期<Brief>至当日23:59分</Brief></List.Item>
            </DatePicker>
            {this.state.to_u_id && <List.Item multipleLine>
              extra={<View>
              {this.state.to_u_name}
              <Brief style={{ textAlign: 'right' }}>{this.state.to_u_mobile}</Brief>
            </View>}
            </List.Item>}
            <InputItem
              clear
              value={this.state.remark}
              onChange={value => {
                this.setState({remark: value});
              }}
              placeholder="备注信息"
            />
          </List>

          <If condition={this.state.preview}>
            <Text>{preview.code}</Text>
            <WhiteSpace/>
            <Text>短信预览</Text>
            <Text>{preview.sms}</Text>
          </If>

          <View style={[styles.printBtnBox,]}>
            <Button type={'ghost'} style={[styles.printBtn,]} onClick={() => this.commitCoupon()}>{'发出兑换码'}</Button>
            {!this.state.preview.sent_coupon_id && <Button type={'primary'} style={[styles.printBtn,]} onClick={() => this.fetchPreview()}>{'试算兑换码'}</Button>}
          </View>
        </ScrollView>
      </View>
    )
  }
  
  render () {
    const {dataSource} = this.props
    return (
      <View style={[{flexDirection: 'row', flex: 1}, this.props.style]}>
        <View style={[styles.container]}>
          {this.renderCouponDispath(dataSource)}
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
  itemTitleRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'flex-end',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.color333
  },
  itemTitle: {
    color: colors.title_color,
    fontSize: pxToDp(30),
    fontWeight: 'bold'
  },
  itemTitleTip: {
    color: colors.color999,
    fontSize: pxToDp(24),
    marginLeft: pxToDp(20)
  },
  itemTitleScanTip: {
    color: colors.editStatusAdd,
    fontSize: pxToDp(24),
    marginLeft: pxToDp(20)
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
  mask: {
    // backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: rowHeight,
    paddingVertical: pxToDp(14)
  },
  product_img: {
    height: pxToDp(90),
    width: pxToDp(90),
    marginRight: pxToDp(15),
    borderRadius: 10,
    borderWidth: pxToDp(1),
    borderColor: '#999'
  },
  product_name: {
    fontSize: pxToDp(26),
    color: colors.color333,
    marginBottom: pxToDp(14),
  },
  product_num: {
    alignSelf: 'flex-end',
    fontSize: pxToDp(26),
    color: '#f44140'
  },
  scanNum: {
    marginLeft: pxToDp(10),
    borderColor: color.theme,
    borderWidth: pxToDp(1),
    paddingVertical: pxToDp(10),
    paddingHorizontal: pxToDp(15),
    color: color.theme,
    fontSize: pxToDp(26)
  },
  scanNumFinish: {
    backgroundColor: color.theme,
    color: '#fff',
    fontWeight: 'bold'
  },
  scanTip: {
    backgroundColor: '#999',
    color: '#fff',
    fontSize: 10,
    padding: 1,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SendRedeemCoupon)