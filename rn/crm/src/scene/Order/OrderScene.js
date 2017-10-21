/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, { PureComponent, Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import InputNumber from 'rc-input-number';
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'
import CommonStyle from '../../common/CommonStyles'

/**
 * The actions we need
 */
import {getOrder, printInCloud, getRemindForOrderPage} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, ActionSheet, ButtonArea, Toast, Msg, Dialog} from "../../weui/index";
import {ToastShort} from "../../util/ToastUtils";
import {StatusBar} from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';
import Cts from '../../Cts'
import inputNumberStyles from './inputNumberStyles';

const numeral = require('numeral')

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({getContacts, getOrder, printInCloud, getRemindForOrderPage}, dispatch)}
}


const hasRemarkOrTax = (order) => (!!order.user_remark) || (!!order.store_remark) || (!!order.taxer_id) || (!!order.invoice)
const supportEditGoods = (orderStatus) => {
  orderStatus = parseInt(orderStatus)
  return orderStatus === Cts.ORDER_STATUS_TO_SHIP ||
    orderStatus === Cts.ORDER_STATUS_TO_READY ||
    orderStatus === Cts.ORDER_STATUS_SHIPPING
}


class OrderScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '订单详情',
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
      headerRight: (<View style={{flexDirection: 'row'}}>
        <NavigationItem
          iconStyle={{width: pxToDp(66), height: pxToDp(54)}}
          icon={require('../../img/Order/print_.png')}
          onPress={() => {params.onPrint()}}
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
      showCallStore: false,
      errorHints: '',
      itemsAdded: {},
      itemsEdited: {},
      reminds: {},
    };

    this.orderId = 0;
    this.store_contacts = [];

    this._onLogin = this._onLogin.bind(this);
    this.toMap = this.toMap.bind(this);
    this.goToSetMap = this.goToSetMap.bind(this);
    this.onHeaderRefresh = this.onHeaderRefresh.bind(this);
    this.onToggleMenuOption = this.onToggleMenuOption.bind(this);
    this.onPrint = this.onPrint.bind(this);
    this._onShowStoreCall = this._onShowStoreCall.bind(this);
    this._doSaveItemsCancel = this._doSaveItemsCancel.bind(this);
    this._doSaveItemsEdit = this._doSaveItemsEdit.bind(this);
    this._onItemRowNumberChanged = this._onItemRowNumberChanged.bind(this)
  }

  componentDidMount() {
    this.props.navigation.setParams({onToggleMenuOption: this.onToggleMenuOption, onPrint: this.onPrint});
  }

  componentWillMount() {

    const orderId = (this.props.navigation.state.params || {}).orderId;
    this.orderId = orderId;
    console.log("componentWillMount: params orderId:", orderId);
    const { order } = this.props.order;
    if (!order || !order.id || order.id !== orderId) {
      this.onHeaderRefresh()
    } else {
      if (order) {
        this.store_contacts = this.props.store.contacts[order.store_id];
      }
    }
  }

  onPrint() {

    const stores = this.props.global.canReadStores;
    const order = this.props.order.order;

    const store = stores[order.store_id];

    if (store && store.cloudPrinter) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
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

  _onShowStoreCall() {

    const store_id = this.props.order.order.store_id;
    if (!this.store_contacts) {
      this.setState({showContactsLoading: true})

      const {dispatch} = this.props;

      dispatch(getContacts(this.props.global.accessToken, store_id, (ok, msg, contacts) => {
        console.log("getContacts: ok=", ok, "msg", msg);
        this.store_contacts = contacts;
        this.setState({showContactsLoading: false, showCallStore: true})
      }));
    } else {
      this.setState({showCallStore: true})
    }
  }

  _contacts2menus() {
    // ['desc' => $desc, 'mobile' => $mobile, 'sign' => $on_working, 'id' => $uid]
    return (this.store_contacts||[]).map((contact, idx) => {
      console.log(contact, idx)
      const {sign, mobile, desc,  id} = contact;
      return {
        type: 'default',
        label:  desc + (sign ? '[上班] ' : ''),
        onPress: () => {
          native.dialNumber(mobile)
        }
      }
    });
  }

  _hideCallStore() {
    this.setState({showCallStore: false});
  }

  onHeaderRefresh() {

    const sessionToken = this.props.global.accessToken;
    const {dispatch} = this.props;

    dispatch(getRemindForOrderPage(sessionToken, this.orderId, (ok, data) => {
      if (ok) {
        this.setState({reminds: data})
        console.log(data)
      } else {
        this.setState({errorHints: '获取提醒列表失败'})
      }
    }));

    if (!this.state.isFetching) {
      this.setState({isFetching: true});

      dispatch(getOrder(sessionToken, this.orderId, (ok, data) => {

        let state = {
          isFetching: false,
        };

        if (!ok) {
          state.errorHints = data
        }
        this.setState(state)
      }))
    }
  }

  _hidePrinterChooser () {
    console.log('_hidePrinterChooser');
    this.setState({showPrinterChooser: false})
  }
  
  _cloudPrinterSN () {
    const stores = this.props.global.canReadStores;
    const order = this.props.order.order;

    const store = stores[order.id];
    const printerName = (store && store.cloudPrinter) ? store.cloudPrinter : '未知';
    return `云打印(${printerName})`;
  }

  _doCloudPrint() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    dispatch(printInCloud(accessToken, this.orderId, (ok, msg, data) => {
      console.log('print done:', ok, msg, data)
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        this.setState({errorHints: '打印失败：' + msg})
      }
      this._hidePrinterChooser();
    }))
  }

  _doBluetoothPrint() {
    console.log('_doBluetoothPrint')
    const order = this.props.order.order;
    native.printBtPrinter(order, (ok, msg) => {
      console.log("printer result:", ok, msg)
    })
    this._hidePrinterChooser();
  }

  _onLogin() {
    this.props.navigation.navigate(Config.ROUTE_LOGIN, {next: Config.ROUTE_ORDER, nextParams: {orderId: this.orderId}})
  }

  _doSaveItemsEdit () {
    console.log("doSaveItemsEdit")
  }

  _doSaveItemsCancel () {
    this.setState({isEditing: false})
  }

  _doAddItem(item) {
    console.log('doAddItem', item)
    if (item.product_id && this.state.itemsAdded[item.product_id]) {
      let msg;
      if (item.num > 0) {
        msg = `商品[${item['product_name']}]已更新`;
      } else {
        msg = `商品[${item['product_name']}]已撤销`
      }
      ToastShort(msg)
    } 
    this._recordEdition(item)
  }

  _onItemRowNumberChanged (item, newNum) {

    console.log('accept a item:', item, 'to new', newNum)
    this._recordEdition({...item, num: newNum});
  }

  _recordEdition(item) {
    if (item.id) {
      this.setState({itemsEdited: {...this.state.itemsEdited, [item.id]: item}});
    } else {
      this.setState({itemsAdded: {...this.state.itemsAdded, [item.product_id]: item}});
    }
  }

  _totalEditCents() {
    const {order} = this.props.order;
    const totalAdd = tool.objectReduce(this.state.itemsAdded, (item1, item2) => item1.num * item1.normal_price + item2.num * item2.normal_price)
    tool.objectMap(this.state.itemsEdited, (item, idx) => {
      const base = order.items[item.id].num;
      if (item.num >= base) {
        return (item.num - base) * item.normal_price;
      } else {
        //退款金额： [(退款菜品现价 + 餐盒费)/(全部菜品现价总和 + 餐盒费)] * (最终支付价格 - 配送费)
        //退款规则：
        return (item.num - base) * item.normal_price;
      }
    })
    const totalEdit = tool.objectReduce(this.state.itemsEdited, (item1, item2) => {
      
      return item1.num * item1.normal_price + item2.num * item2.normal_price
    })
  }

  goToSetMap() {
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
        <View>
        { !!this.state.errorHints &&
        <Text style={{textAlign: 'center'}}>{this.state.errorHints}</Text>}
        <Text style={{textAlign: 'center'}}>{this.state.isFetching ? '正在加载' : '下拉刷新'}</Text>
        </View>
      </ScrollView>
      : (
        <View style={[styles.container, {flex: 1}]}>

          {this.state.showOptionMenu &&
          <TouchableOpacity style={[top_styles.icon_dropDown]}>
          </TouchableOpacity>}
          <ActionSheet
            visible={this.state.showPrinterChooser}
            onRequestClose={() => this._hidePrinterChooser()}
            menus={[
              {
                type: 'default',
                label: this._cloudPrinterSN(),
                onPress: this._doCloudPrint.bind(this),
              }, {
                type: 'default',
                label: '蓝牙打印',
                onPress: this._doBluetoothPrint.bind(this),
              }
            ]}
            actions={[
              {
                type: 'default',
                label: '取消',
                onPress: this._hidePrinterChooser.bind(this),
              }
            ]}
          />

          <ActionSheet
            visible={this.state.showCallStore}
            onRequestClose={()=>{console.log('call_store_contacts action_sheet closed!')}}
            menus={this._contacts2menus()}
            actions={[
              {
                type: 'default',
                label: '取消',
                onPress: this._hideCallStore.bind(this),
              }
            ]}
          />

          { !!this.state.errorHints &&
          <Dialog onRequestClose={()=>{}}
            visible={!!this.state.errorHints}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {this.setState({errorHints: ''})}
            }]}      
          ><Text>打印失败: {this.state.errorHints}</Text></Dialog>
          }

          <Dialog onRequestClose={() => {}}
                  visible={this.state.gotoEditPoi}
                  buttons={[{
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

            shadowOffset: {width: -4, height: -4},
            shadowOpacity: 0.75,
            shadowRadius: 4,
          }}>
            <Button style={[styles.bottomBtn, {marginRight: pxToDp(5),}]} type={'primary'}>联系配送</Button>
            <Button style={[styles.bottomBtn, {marginLeft: pxToDp(5),}]} type={'primary'}>提醒送达</Button>
          </View>
        </View>
      );
  }

  renderHeader() {
    const {order} = this.props.order;

    // let onButtonPress = () => {
    //   this.props.actions.updateOrder(
    //     this.props.order.id,
    //     this.props.profile.form.fields.username,
    //     this.props.profile.form.fields.email,
    //     this.props.global.currentUser)
    // }

    const validPoi = order.loc_lng && order.loc_lat;
    const navImgSource = validPoi ? require('../../img/Order/dizhi_.png') : require('../../img/Order/dizhi_pre_.png');

    const totalMoneyEdit = -10; //this._totalEditCents();

    const _items = order.items || {};
    return (<View>
        <View style={[CommonStyle.topBottomLine, {backgroundColor: '#fff'}]}>
          <View style={[styles.row, {height: pxToDp(40), alignItems: 'center'}]}>
            <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
            <ImageBtn source={require('../../img/Order/profile.png')}/>
            <View style={{flex: 1}}/>
            <Image style={[styles.icon, {width: pxToDp(44), height: pxToDp(42)}]} source={require('../../img/Order/message_.png')}/>
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
            }} onPress={() => {native.ordersByMobileTimes(order.mobile, order.order_times)}}>
              <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white}}>第{order.order_times}次</Text>
            </TouchableOpacity>
            <CallBtn mobile={order.mobile}/>
            <View style={{flex: 1}}/>
            <TouchableOpacity onPress={this.toMap}>
              <Image style={[styles.icon, {width: pxToDp(40), height: pxToDp(48)}]} source={navImgSource}/>
            </TouchableOpacity>
          </View>

          {hasRemarkOrTax(order) &&
          <View style={[styles.row, {marginBottom: pxToDp(14), marginTop: 0, flexDirection: 'column'}]}>
            <Separator style={{backgroundColor: colors.color999, marginBottom: pxToDp(14)}}/>
            {!!order.user_remark &&
            <Remark label="客户备注" remark={order.user_remark}/>}
            {!!order.store_remark &&
            <Remark label="商家备注" remark={order.store_remark}/>}
            {!!order.invoice &&
            <Remark label="发票抬头" remark={order.invoice}/>}
            {!!order.taxer_id &&
            <Remark label="税号" remark={order.taxer_id}/>}
          </View>}

        </View>

        <OrderStatusCell order={order} onPressCall={this._onShowStoreCall}/>

        <View style={[CommonStyle.topBottomLine, styles.block]}>
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
              }}>{_items.length}种商品</Text>
            </View>
            <View style={{flex: 1}}/>

            {this.state.isEditing &&
            <ImageBtn source={require('../../img/Order/edit_add_item.png')} onPress={ () => {this.props.navigation.navigate('ProductAutocomplete')} } />
              && 
            <ImageBtn source={require('../../img/Order/save_edit.png')} onPress={this._doSaveItemsEdit} />
              &&
              <Icon.Button name="close" onPress={this._doSaveItemsCancel}>
                <Text>取消</Text>
              </Icon.Button>
            }

            {!this.state.isEditing && (
              supportEditGoods(order.orderStatus) ?
              <ImageBtn source={require('../../img/Order/items_edit.png')} onPress={()=> {this.setState({isEditing: true, itemsHided: false})}}/>
              : <ImageBtn source={require('../../img/Order/items_edit_disabled.png')}/>)
            }

            {!this.state.isEditing && (this.state.itemsHided ?
              <ImageBtn source={require('../../img/Order/pull_down.png')} onPress={
                () => {
                  this.setState({itemsHided: false});
                  console.log("after click pull_down", this.state)
                }
              } imageStyle={styles.pullImg}/>
              : <ImageBtn source={require('../../img/Order/pull_up.png')} imageStyle={styles.pullImg} onPress={() => {
                this.setState({itemsHided: true});
                console.log("after click pull_up", this.state)
              }}/>)
            }
          </View>
          {!this.state.itemsHided && tool.objectMap(_items, (item, idx) => {
            return (<ItemRow key={idx} item={item} edited={this.state.itemsEdited[item.id]} idx={idx} isEditing={this.state.isEditing} onInputNumberChange={this._onItemRowNumberChanged}/>);
          })}
          {!this.state.itemsHided && tool.objectMap(this.state.itemsAdded, (item, idx) => {
            return (<ItemRow key={idx} item={item} isAdd={true} idx={idx} isEditing={this.state.isEditing} onInputNumberChange={this._onItemRowNumberChanged}/>);
          })}

          <View style={[styles.row, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <View style={styles.moneyLeft}>
              <Text style={[styles.moneyListTitle, {flex: 1}]}>商品总额</Text>

              {totalMoneyEdit !== 0 &&
              <View><Text
                style={[styles.editStatus, {backgroundColor: totalMoneyEdit > 0 ? colors.editStatusAdd : colors.editStatusDeduct}]}>
                {totalMoneyEdit > 0 ? '需加收' : '需退款'}{numeral(totalMoneyEdit / 100).format('0.00')}元
              </Text>
                <Text style={[styles.moneyListNum, {textDecorationLine: 'line-through'}]}>
                  {numeral(order.total_goods_price / 100).format('0.00')}
                </Text></View>}
              
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
            <View style={[styles.moneyLeft,{alignItems: 'center'}]}>
              <Text style={styles.moneyListTitle}>优惠</Text>
              <TouchableOpacity style={{marginLeft: 5}}><Icon name='question-circle-o'/></TouchableOpacity>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>{numeral(order.self_activity_fee / 100).format('0.00')}</Text>
          </View>
          <View style={[styles.row, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
              <Text style={styles.moneyListTitle}>用户已付</Text>
              <Text style={{fontSize: pxToDp(20), flex: 1}}>含平台扣费、优惠等</Text>
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
              <TouchableOpacity style={[{marginLeft: pxToDp(20), alignItems: 'center', justifyContent:'center'}]}>
                <Text style={{color: colors.main_color, fontWeight: 'bold', flexDirection: 'row'}}>
                <Text>收款码</Text>
                <Icon name='qrcode'/>
                </Text>
              </TouchableOpacity>
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

        <View style={[CommonStyle.topBottomLine, styles.block]}>
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

class ItemRow extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      idx, item, isAdd, edited, onInputNumberChange = () => {}, isEditing = false
    } = this.props;

    const showEditAdded = isEditing && !isAdd && edited && edited.num > item.num;
    return <View key={idx} style={[styles.row, {
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
          <Text style={{color: '#f44140'}}>{numeral(item.price).format('0.00')}</Text>
          <Text style={{color: '#f9b5b2', marginLeft: 30}}>总价 {numeral(item.price * item.num).format('0.00')}</Text>
        </View>
      </View>
      {showEditAdded &&
      <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd}]}>已加{edited.num - item.num}</Text>}
      {isEditing && !isAdd && edited && edited.num < item.num &&
      <Text style={[styles.editStatus, {backgroundColor: colors.editStatusDeduct}]}>已减{item.num - edited.num}</Text>}
      {isEditing && isAdd && <Text>加货</Text>}
      {!isEditing &&
      <Text style={{alignSelf: 'flex-end', fontSize: pxToDp(26), color: colors.color666}}>X{item.num}</Text>}
      {isEditing &&
        <View style={[top_styles.stepper, {marginLeft: 10}]}>
          <InputNumber
            styles={inputNumberStyles}
            min={0}
            defaultValue={parseInt(item.num)}
            style={{ backgroundColor: 'white', width: 86 }}
            onChange={(v)=>{console.log("editedNum", v); onInputNumberChange(item, v)}}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          />
        </View>}
    </View>
  }
}

ItemRow.PropTypes = {
  item: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  isEditing: PropTypes.bool,
  isAdd: PropTypes.bool,
  edits: PropTypes.object,
  onInputNumberChange: PropTypes.func,
};

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

    const {source, onPress, imageStyle} = this.props;

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
    backgroundColor: 'transparent',
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
    fontSize: pxToDp(26),
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
  bottomBtn: {
    height: pxToDp(70), flex: 1, alignItems: 'center', justifyContent: 'center'
  },
  block: {
    marginTop: pxToDp(10),
    backgroundColor: colors.white,
  },
  stepper: {
    // height: 44,
    // marginTop: 100,
  },
  editStatus: {
    color: colors.white,
    fontSize: pxToDp(22),
    borderRadius: pxToDp(5),
    alignSelf: 'center',
    paddingLeft:5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderScene)