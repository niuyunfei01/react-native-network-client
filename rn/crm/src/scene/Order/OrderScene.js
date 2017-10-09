/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { screen, system } from '../../common'
import {bindActionCreators} from "redux";
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'

/**
 * The actions we need
 */
import * as orderActions from '../../reducers/order/orderActions'
import * as globalActions from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, ButtonArea, Toast, Msg, Dialog} from "../../weui/index";
import {ToastShort} from "../../util/ToastUtils";
import {StatusBar} from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';

const numeral = require('numeral')

function mapStateToProps(state) {
  return {
    isFetching: state.isFetching,
    order: state.order,
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...orderActions, ...globalActions}, dispatch)
  }
}

const hasRemark = (order) => (!!order.user_remark) || (!!order.store_remark)

class OrderScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '订单详情',
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerTitleStyle: {color: '#111111',},
      headerRight: (<View style={{flexDirection: 'row'}}>
        <NavigationItem
          icon={require('../../img/Order/print.png')}
          onPress={() => {

          }}
        />
        <ModalDropdown
          options={['暂停提示', '强制关闭', '修改地址']}
          defaultValue={''}
          style={top_styles.drop_style}
          dropdownStyle={top_styles.drop_listStyle}
          dropdownTextStyle={top_styles.drop_textStyle}
          dropdownTextHighlightStyle={top_styles.drop_optionStyle}
          onSelect={(event) => this.onMenuOptionSelected(event, item.id, item.type)}>
          <Image style={[top_styles.icon_img_dropDown]}
                 source={require('../../img/Public/menu.png')}/>
        </ModalDropdown>
      </View>),
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      isFetching: false,
      isEditing: false,
      itemsHided: true,
      shipHided: true,
      gotoEditPoi: false,
      showOptionMenu: false,
      errorHints: ''
    }

    this.orderId = 0;

    this._onLogin = this._onLogin.bind(this)
    this.toMap = this.toMap.bind(this)
    this.goToSetMap = this.goToSetMap.bind(this)
    this.onHeaderRefresh = this.onHeaderRefresh.bind(this)
    this.onToggleMenuOption = this.onToggleMenuOption.bind(this)
  }

  componentDidMount() {
    this.props.navigation.setParams({onToggleMenuOption: this.onToggleMenuOption});
  }

  componentWillMount() {

    const orderId = (this.props.navigation.state.params || {}).orderId;
    this.orderId = orderId;
    console.log("componentWillMount: params orderId:", orderId)
    const order = this.props.order.order;
    if (!order || !order.id || order.id !== orderId) {
      this.onHeaderRefresh()
    }
  }

  onToggleMenuOption() {
    this.setState((prevState) => {
      return {showOptionMenu: !prevState.showOptionMenu}
    })
  }

  onMenuOptionSelected(key, id, type) {
    const {remind} = this.props;
    if (remind.doingUpdate) {
      ToastShort("操作太快了！");
      return false;
    }
    const {dispatch} = this.props;
    let token = this._getToken();
    if (parseInt(key) === 0) {
      //暂停提示
    } else {
      //强制关闭
      dispatch(updateRemind(id, type, Config.TASK_STATUS_DONE, token))
    }
  }

  onHeaderRefresh() {
    if (!this.state.isFetching) {
      this.setState({isFetching: true});
      this.props.actions.getOrder(this.props.global.accessToken, this.orderId, (ok, data) => {

        let state = {
          isFetching: false,
        };

        if (!ok)  {state.errorHints = data};

        this.setState(state)
      })
    }
  }

  _onLogin() {
    this.props.navigation.navigate(Config.ROUTE_LOGIN, {next: Config.ROUTE_ORDER, nextParams: {orderId: this.orderId}})
  }

  goToSetMap() {
    console.log('Nothing to do....')
    this.setState({gotoEditPoi: false})
  }

  toMap() {
    const {order} = this.props.order;
    const validPoi = order.gd_lng && order.gd_lat;
    if (validPoi) {
      const uri = `https://uri.amap.com/marker?position=${order.gd_lng},${order.gd_lat}`
      this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri})
    } else {
      //a page to set the location for this url!!
      this.setState({
        gotoEditPoi: true
      });
    }
  }

  render() {
    const {order} = this.props.order;

    console.log(this.state);

    let refreshControl = <RefreshControl
      refreshing={this.state.isFetching}
      onRefresh={this.onHeaderRefresh}
      tintColor='gray'
    />;

    return (!order || order.id !== this.orderId) ?
      <ScrollView
        contentContainerStyle={{alignItems: 'center', justifyContent: 'space-around', flex: 1, backgroundColor: '#fff'}}
        refreshControl={refreshControl}>
        { !!this.state.errorHints &&
        <Text style={{textAlign: 'center'}}>{this.state.errorHints}</Text>}
        <Text style={{textAlign: 'center'}}>{this.state.isFetching ? '正在加载' : '下拉刷新'}</Text></ScrollView>
      : (
        <View style={[styles.container, {flex: 1}]}>

          {this.state.showOptionMenu &&
          <TouchableOpacity style={[top_styles.icon_dropDown]}>
          </TouchableOpacity>}

          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.gotoEditPoi}
                  buttons={[
                    {
                      type: 'warn',
                      label: '去设置',
                      onPress: this.goToSetMap,
                    },
                    {
                      type: 'default',
                      label: '取消',
                      onPress: () => this.setState({gotoEditPoi: false}),
                    }
                  ]}
          ><Text>没有经纬度信息</Text></Dialog>
          <ScrollView
            refreshControl={refreshControl}>
            {this.renderHeader()}
          </ScrollView>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-around',
            paddingTop: pxToDp(10),
            paddingRight: pxToDp(10),
            paddingLeft: pxToDp(10),
            paddingBottom: pxToDp(10),
            backgroundColor: '#fff',
            marginLeft: pxToDp(20), marginRight: pxToDp(20),
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#ddd',
            shadowColor: '#000',
            shadowOffset: {width: 4, height: 4},
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}>
            <Button>联系配送</Button>
            <Button type={'primary'}>提醒送达</Button>
          </View>
        </View>
      );
  }

  renderHeader() {
    let info = {};
    const {order} = this.props.order;

    let onButtonPress = () => {
      this.props.actions.updateOrder(
        this.props.order.id,
        this.props.profile.form.fields.username,
        this.props.profile.form.fields.email,
        this.props.global.currentUser)
    }

    const validPoi = order.loc_lng && order.loc_lat;
    const navImgSource = validPoi ? require('../../img/Order/navi.png') : require('../../img/Order/navi_pressed.png')

    return (<View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.row, {height: pxToDp(40), alignItems: 'center'}]}>
            <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
            <ImageBtn source={require('../../img/Order/profile.png')}/>
            <View style={{flex: 1}}/>
            <Image style={styles.icon} source={require('../../img/Order/talk.png')}/>
          </View>
          <Text style={[styles.row, {
            fontSize: pxToDp(30),
            fontWeight: 'bold',
            color: colors.color666,
            marginTop: pxToDp(20),
            marginRight: pxToDp(114 + 20)
          }]}>
            {order.address}
          </Text>
          <View style={[styles.row, {paddingLeft: 0, marginBottom: pxToDp(14)}]}>
            <TouchableOpacity style={{
              width: pxToDp(96),
              height: pxToDp(42),
              backgroundColor: colors.main_color,
              borderRadius: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white}}>第{order.order_times}次</Text>
            </TouchableOpacity>
            <CallBtn label={order.mobile}/>
            <View style={{flex: 1}}/>
            <TouchableOpacity onPress={this.toMap}>
              <Image style={styles.icon} source={navImgSource}/>
            </TouchableOpacity>
          </View>
          {(order.user_remark && order.store_remark) &&
          <Separator style={{backgroundColor: colors.color999}}/>}

          {hasRemark(order) &&
          <View style={[styles.row, {marginBottom: pxToDp(14), flexDirection: 'column'}]}>
            {!!order.user_remark &&
            <Remark label="客户备注" remark={order.user_remark}/>}
            {!!order.store_remark &&
            <Remark label="商家备注" remark={order.store_remark}/>}
          </View>}

        </View>

        <OrderStatusCell order={order}/>

        <View style={{marginTop: pxToDp(20), backgroundColor: colors.white}}>
          <View style={[styles.row, {
            marginRight: 0,
            alignItems: 'center',
            borderBottomColor: colors.color999,
            borderBottomWidth: screen.onePixel,
            paddingBottom: pxToDp(16),
            paddingTop: pxToDp(16),
            marginTop: 0
          }]}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={{color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold'}}>商品明细</Text>
              <Text style={{
                color: colors.color999,
                fontSize: pxToDp(24),
                marginLeft: pxToDp(20)
              }}>{(order.items || {}).length}种商品</Text>
            </View>
            <View style={{flex: 1}}/>

            {this.state.isEditing ?
              <ImageBtn source={require('../../img/Order/items_edit.png')}/>
              : <ImageBtn source={require('../../img/Order/items_edit_disabled.png')}/>
            }

            {this.state.itemsHided ?
              <ImageBtn source={require('../../img/Order/pull_down.png')} onPress={
                () => {
                  this.setState({itemsHided: false});
                  console.log("after click pull_down", this.state)
                }
              } imageStyle={styles.pullImg}/>
              : <ImageBtn source={require('../../img/Order/pull_up.png')} imageStyle={styles.pullImg} onPress={() => {
                this.setState({itemsHided: true});
                console.log("after click pull_up", this.state)
              }}/>
            }
          </View>
          {!this.state.itemsHided && (order.items || {}).map((item, idx) => {
            return (<View key={idx} style={[styles.row, {
                marginTop: 0,
                paddingTop: pxToDp(14),
                paddingBottom: pxToDp(14),
                borderBottomColor: colors.color999,
                borderBottomWidth: screen.onePixel
              }]}>
                <View style={{flex: 1}}>
                  <Text style={{
                    fontSize: pxToDp(26),
                    color: colors.color333,
                    marginBottom: pxToDp(14)
                  }}>{item.product_name}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{color: '#f44140'}}>{item.price}</Text>
                    <Text style={{color: '#f9b5b2', marginLeft: 30}}>总价 {item.price * item.num}</Text>
                  </View>
                </View>
                <Text style={{alignSelf: 'flex-end', fontSize: pxToDp(26), color: colors.color666}}>X{item.num}</Text>
              </View>
            );
          })}

          <View style={[styles.row, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <View style={styles.moneyLeft}>
              <Text style={[styles.moneyListTitle, {flex: 1}]}>商品总额</Text>
              <Text style={[styles.moneyListNum, {textDecorationLine: 'line-through'}]}>
                {numeral(order.total_goods_price / 100).format('0.00')}
              </Text>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.total_goods_price / 100).format('0.00')}
            </Text>
          </View>
          <View style={[styles.row, styles.moneyRow]}>
            <Text style={[styles.moneyListTitle, {width: pxToDp(480)}]}>配送费</Text>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>{numeral(order.deliver_fee / 100).format('0.00')}</Text>
          </View>
          <View style={[styles.row, styles.moneyRow]}>
            <View style={styles.moneyLeft}>
              <Text style={styles.moneyListTitle}>优惠</Text>
              <TouchableOpacity><Icon name='question-circle-o'/></TouchableOpacity>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>{numeral(order.self_activity_fee / 100).format('0.00')}</Text>
          </View>
          <View style={[styles.row, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
              <Text style={styles.moneyListTitle}>用户已付</Text>
              <Text style={{fontSize: pxToDp(22), flex: 1}}>含平台扣费、优惠等</Text>
              <Text style={styles.moneyListSub}>微信支付</Text>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.orderMoney).format('0.00')}
            </Text>
          </View>
          {order.addition_to_pay !== 0 &&
          <View style={[styles.row, styles.moneyRow]}>
            <View style={styles.moneyLeft}>
              <Text style={[styles.moneyListTitle, {flex: 1}]}>需加收/退款</Text>
              {(order.additional_to_pay != 0) &&
              <Text style={styles.moneyListSub}>{order.additional_to_pay > 0 ? '加收' : '退款'}</Text>}
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.additional_to_pay / 100).format('+0.00')}
            </Text>
          </View>
          }
        </View>

        <View style={{marginTop: pxToDp(20), backgroundColor: colors.white,}}>
          <View style={[styles.row, {
            marginRight: 0, alignItems: 'center',
            paddingBottom: pxToDp(16), paddingTop: pxToDp(16), marginTop: 0, marginBottom: pxToDp(12)
          }]}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={{color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold'}}>运单记录</Text>
              <Text style={{color: colors.color999, fontSize: pxToDp(24), marginLeft: pxToDp(20)}}>运费金额</Text>
            </View>
            <Text>￥7.80</Text>
            <View style={{flex: 1}}/>

            {this.state.shipHided ?
              <ImageBtn source={require('../../img/Order/pull_down.png')} imageStyle={styles.pullImg} onPress={
                () => {
                  this.setState({shipHided: false});
                }
              }/>
              : <ImageBtn source={require('../../img/Order/pull_up.png')} imageStyle={styles.pullImg} onPress={() => {
                this.setState({shipHided: true});
              }}/>
            }
          </View>
        </View>
      </View>
    )
  }
}

class Remark extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    const {label, remark} = this.props;
    return (<View style={{flexDirection: 'row'}}>
      <Text style={styles.remarkText}>{label}:</Text>
      <Text style={[styles.remarkText, styles.remarkTextBody]}>{remark}</Text>
    </View>)
  }
}

class ImageBtn extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const {source, onPress, imageStyle} = this.props

    return <TouchableOpacity onPress={onPress}>
      <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
    </TouchableOpacity>
  }
}


const top_styles = StyleSheet.create({
  icon_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
    position: 'absolute',
    right: 0,
    // backgroundColor: 'green',
  },
  icon_img_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_style: {
    // width: pxToDp(88),
    // height: pxToDp(55),
    flex:1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drop_listStyle: {//下拉列表的样式
    width: pxToDp(150),
    height: pxToDp(141),
    backgroundColor: '#5f6660',
    marginTop: -StatusBar.currentHeight,
  },
  drop_textStyle: {//下拉选项文本的样式
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#fff',
    height: pxToDp(69),
    backgroundColor: '#5f6660',
    borderRadius: pxToDp(3),
    borderColor: '#5f6660',
    borderWidth: 1,
    shadowRadius: pxToDp(3),
  },
  drop_optionStyle: {//选项点击之后的文本样式
    color: '#4d4d4d',
    backgroundColor: '#939195',
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.back_color,
  },
  icon: {
    width: pxToDp(74),
    height: pxToDp(56),
    alignItems: 'flex-end'
  },
  btn4text: {
    width: pxToDp(152),
    height: pxToDp(40)
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
  banner: {
    width: screen.width,
    height: screen.width * 0.5
  },
  row: {
    flexDirection: 'row',
    marginLeft: pxToDp(30),
    marginRight: pxToDp(40),
    alignContent: 'center',
    marginTop: pxToDp(14)
  },
  remarkText: {
    color: '#808080',
    fontWeight: 'bold',
    fontSize: pxToDp(24),
  },
  remarkTextBody: {
    marginLeft: pxToDp(6), marginRight: pxToDp(140)
  },
  moneyLeft: {
    width: pxToDp(480),
    flexDirection: 'row',
  },
  moneyRow: {marginTop: 0, marginBottom: pxToDp(12), alignItems: 'center'},
  moneyListTitle: {
    fontSize: pxToDp(26),
    color: colors.color333,
  },
  moneyListSub: {
    fontSize: pxToDp(26),
    color: colors.main_color,
  },
  moneyListNum: {
    fontSize: pxToDp(22),
    color: colors.color777,
  },
  buyButton: {
    backgroundColor: '#fc9e28',
    width: 94,
    height: 36,
    borderRadius: 7,
  },
  tagContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },
  tipHeader: {
    height: 35,
    justifyContent: 'center',
    borderWidth: screen.onePixel,
    borderColor: color.border,
    paddingVertical: 8,
    paddingLeft: 20,
    backgroundColor: 'white'
  },

  stepCircle: {
    borderRadius: pxToDp(10),
    width: pxToDp(20),
    height: pxToDp(20),
    position: 'absolute',
    top: pxToDp(178),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderScene)