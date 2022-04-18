import React, {Component} from 'react';
import {Alert, Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import font from './fontStyles'
import styles from './InvoicingStyles'
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import Cell from "../../../weui/Cell/Cell";
import CellHeader from "../../../weui/Cell/CellHeader";
import CellBody from "../../../weui/Cell/CellBody";
import Cells from "../../../weui/Cell/Cells"
import MyBtn from '../../../pubilc/util/MyBtn'
import CellFooter from "../../../weui/Cell/CellFooter";
import ActionSheet from "../../../weui/ActionSheet/ActionSheet"
import Dialog from "../../../weui/Dialog/Dialog"
import CellsTitle from "../../../weui/Cell/CellsTitle"
import CheckboxCells from "./CheckBoxCells"
import RadioCells from "../../../weui/Form/RadioCells"
import Label from "../../../weui/Form/Label"
import Input from "../../../weui/Form/Input"
import CallBtn from "./CallBtn"
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {padNum} from "../../../pubilc/util/common"
import * as globalActions from '../../../reducers/global/globalActions';
import {
  appendSupplyOrder,
  balanceSupplyOrder,
  deleteSupplyOrderItem,
  fetchSupplyArrivedOrder,
  fetchSupplyWaitBalanceOrder,
  fetchSupplyWaitOrder,
  loadAllSuppliers,
  receivedSupplyOrder,
  reviewSupplyOrder,
  transferSupplier,
  trashSupplyOrder,
  updateSupplyOrder,
  updateSupplyOrderItem,
} from "../../../reducers/invoicing/invoicingActions";


import _ from 'lodash'
import EmptyListView from "./EmptyListView";

import Constant from "../../../pubilc/common/Constat"
import {ToastLong} from "../../../pubilc/util/ToastUtils";

import numeral from "numeral";
import native from "../../../pubilc/util/native";
import dayjs from "dayjs";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchSupplyWaitOrder,
      loadAllSuppliers,
      fetchSupplyArrivedOrder,
      fetchSupplyWaitBalanceOrder,
      updateSupplyOrder,
      updateSupplyOrderItem,
      deleteSupplyOrderItem,
      appendSupplyOrder,
      transferSupplier,
      trashSupplyOrder,
      receivedSupplyOrder,
      reviewSupplyOrder,
      balanceSupplyOrder,
      ...globalActions
    })
  }
}

function initDate(date) {
  if (date) {
    return new Date(date.replace(/-/g, "/"))
  } else {
    return new Date()
  }
}

function getGoodItemTextStyle(highlight = false) {
  if (highlight) {
    return [font.font26, font.fontBlue, list.goods_title];
  }
  return [font.font26, font.fontGray, list.goods_title];
}

class InvoicingOrderGoodsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      filterStatus: Constant.INVOICING.STATUS_CREATED,
      showDatePicker: true,
      consigneeDate: null,
      opVisible: false,
      editDialogVisible: false,
      moveSupplierDialogVisible: false,
      orderCtrlStatus: {},
      storeCtrlStatus: {},
      currentEditItem: {},
      currentEditOrderId: 0,
      currentEditStoreId: 0,
      currentCheckedSupplier: 0,
      currentMovedSupplierOptions: []
    };
    this.reloadData = this.reloadData.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.loadAllSuppliers = this.loadAllSuppliers.bind(this)
    this.renderSupplyOrder = this.renderSupplyOrder.bind(this)
    this.renderGoodList = this.renderGoodList.bind(this)
    this.chooseConsigneeDateTime = this.chooseConsigneeDateTime.bind(this)
    this.changeTab = this.changeTab.bind(this)
    this.initCtrlStatus = this.initCtrlStatus.bind(this)
    this.confirmOp = this.confirmOp.bind(this)
    this.toggleStore = this.toggleStore.bind(this)
    this.toggleGoods = this.toggleGoods.bind(this)
    this.toggleGoodEditStatus = this.toggleGoodEditStatus.bind(this)
    this.orderEditAble = this.orderEditAble.bind(this)
    this.getListDataByStatus = this.getListDataByStatus.bind(this)
    this.renderActionSheet = this.renderActionSheet.bind(this)
    // this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
    this.renderMoveSupplierDialog = this.renderMoveSupplierDialog.bind(this)
    this.renderEditDialog = this.renderEditDialog.bind(this)
    this.setMoveSuppliersOption = this.setMoveSuppliersOption.bind(this)
    this.updateOrderGoodItem = this.updateOrderGoodItem.bind(this)
    this.deleteOrderGoodItem = this.deleteOrderGoodItem.bind(this)
    this.setMoveCurrentCheckedVal = this.setMoveCurrentCheckedVal.bind(this)
    this.updateOrderGoodItemSupplier = this.updateOrderGoodItemSupplier.bind(this)
    this.trashSupplyOrder = this.trashSupplyOrder.bind(this)
    this.confirmReceivedOrder = this.confirmReceivedOrder.bind(this)
    this.getGoodsTotalFee = this.getGoodsTotalFee.bind(this)
    this.getStoreTotalFee = this.getStoreTotalFee.bind(this)
    this.reviewOrder = this.reviewOrder.bind(this)
    this.balanceOrder = this.balanceOrder.bind(this)
    this.commonHandleProxy = this.commonHandleProxy.bind(this)
  }

  tab() {
    let filterStatus = this.state.filterStatus;
    let leftStyle = [tabs.tabs_item, tabs.tabs_item_left_radius,];
    let middleStyle = [tabs.tabs_item,];
    let rightStyle = [tabs.tabs_item, tabs.tabs_item_right_radius];
    if (filterStatus == Constant.INVOICING.STATUS_CREATED) {
      leftStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == Constant.INVOICING.STATUS_ARRIVED) {
      middleStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == Constant.INVOICING.STATUS_CONFIRMED) {
      rightStyle.push(tabs.tabs_item_active);
    }
    return (
      <View style={[styles.in_cell, {
        backgroundColor: colors.white,
        marginBottom: pxToDp(10),
      }]}>
        <View style={tabs.tabs}>
          <Text style={leftStyle} onPress={() => this.changeTab(Constant.INVOICING.STATUS_CREATED)}>待收货 </Text>
          <Text style={middleStyle} onPress={() => this.changeTab(Constant.INVOICING.STATUS_ARRIVED)}>待审核 </Text>
          <Text style={rightStyle} onPress={() => this.changeTab(Constant.INVOICING.STATUS_CONFIRMED)}>待结算 </Text>
        </View>
      </View>
    )
  }

  toggleStore(storeId) {
    let storeCtrlStatus = this.state.storeCtrlStatus;
    if (storeCtrlStatus.hasOwnProperty(storeId)) {
      storeCtrlStatus[storeId]['expandSupplier'] = !storeCtrlStatus[storeId]['expandSupplier'];
    }
    this.setState({
      storeCtrlStatus: storeCtrlStatus
    });
  }

  toggleGoods(supplierOrderId) {
    let orderCtrlStatus = this.state.orderCtrlStatus;
    if (orderCtrlStatus.hasOwnProperty(supplierOrderId)) {
      orderCtrlStatus[supplierOrderId]['expandGoods'] = !orderCtrlStatus[supplierOrderId]['expandGoods'];
    }
    this.setState({
      orderCtrlStatus: orderCtrlStatus
    })
  }

  toggleGoodEditStatus(supplierOrderId) {
    let orderCtrlStatus = this.state.orderCtrlStatus;
    if (orderCtrlStatus.hasOwnProperty(supplierOrderId)) {
      orderCtrlStatus[supplierOrderId]['editAble'] = !orderCtrlStatus[supplierOrderId]['editAble'];
    }
    this.setState({
      orderCtrlStatus: orderCtrlStatus
    })
  }

  changeTab(val) {
    let currentStatus = this.state.filterStatus;
    if (currentStatus !== val) {
      this.setState({
        filterStatus: val
      });
      this.reloadData()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    //优化性能
    return true;
  }

  UNSAFE_componentWillMount() {
  }

  componentDidMount() {
    this.loadAllSuppliers();
    this.reloadData();
  }

  chooseConsigneeDateTime(old, orderId, storeId) {
    this.setState({
      consigneeDate: old,
      showDatePicker: true,
      currentEditOrderId: orderId,
      currentEditStoreId: storeId
    });
  }

  loadAllSuppliers() {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    dispatch(loadAllSuppliers(token));
  }

  reloadData() {
    this.setState({isRefreshing: true});
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let currStoreId = global['currStoreId'];
    let filterStatus = this.state.filterStatus;
    let _this = this;

    function callBack() {
      _this.setState({isRefreshing: false});
      _this.initCtrlStatus();
    }

    switch (filterStatus) {
      case Constant.INVOICING.STATUS_CREATED:
        dispatch(fetchSupplyWaitOrder(currStoreId, token, callBack));
        break;
      case Constant.INVOICING.STATUS_ARRIVED:
        dispatch(fetchSupplyArrivedOrder(currStoreId, token, callBack));
        break;
      case Constant.INVOICING.STATUS_CONFIRMED:
        dispatch(fetchSupplyWaitBalanceOrder(currStoreId, token, callBack));
        break;
    }
  }

  updateOrderConsigneeDatetime(datetime) {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let status = this.state.filterStatus;
    let id = this.state.currentEditOrderId;
    let storeId = this.state.currentEditStoreId;
    let dateTime = dayjs(datetime).format("YYYY-MM-DD HH:mm:ss");
    dispatch(updateSupplyOrder(token, status, storeId, {
      id: id,
      consignee_date: dateTime
    }, function (ok, reason) {
      if (ok) {
        ToastLong("更新成功!")
      } else {
        ToastLong("更新失败!")
      }
    }, function () {
    }));
    this.setState({showDatePicker: false, consigneeDate: null, currentEditOrderId: 0});
  }

  updateOrderGoodItem() {
    let postData = this.state.currentEditItem;
    let status = this.state.filterStatus;
    let storeId = this.state.currentEditStoreId;
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let self = this;
    dispatch(updateSupplyOrderItem(token, status, storeId, postData, function (ok, reason) {
      if (ok) {
        ToastLong("保存成功")
      } else {
        ToastLong("保存失败，请重试！")
      }
      self.setState({
        editDialogVisible: false,
        currentEditStoreId: 0,
        currentEditItem: {}
      });
    }));
  }

  deleteOrderGoodItem() {
    let currentEditItem = this.state.currentEditItem;
    let status = this.state.filterStatus;
    let storeId = this.state.currentEditStoreId;
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let title = currentEditItem['name'];
    let self = this;

    function cleanCtx() {
      self.setState({
        opVisible: false,
        currentEditStoreId: 0,
        currentEditItem: {}
      });
    }

    let postData = {id: currentEditItem['id'], deleted: 1, 'supply_order_id': currentEditItem['supply_order_id']};

    function okFunc() {
      dispatch(deleteSupplyOrderItem(token, status, storeId, postData, function (ok, reason) {
        cleanCtx();
      }))
    }

    this.confirmOp(title, "确认要删除？", cleanCtx, okFunc)
  }

  updateOrderGoodItemSupplier() {
    let currentEditItem = this.state.currentEditItem;
    let status = this.state.filterStatus;
    let storeId = this.state.currentEditStoreId;
    const {dispatch, global} = this.props;
    let checkSupplierId = this.state.currentCheckedSupplier;
    let currentStoreOptions = this.state.currentMovedSupplierOptions;

    let token = global['accessToken'];

    let append = false;
    let supplyOrderId = 0;

    let self = this;

    _.forEach(currentStoreOptions, function (value) {
      let sId = value['sId'];
      if (sId == checkSupplierId) {
        if (value['isNew']) {
          append = true;
        } else {
          supplyOrderId = value['orderId'];
          append = false;
        }
        return false;
      }
    });

    if (append) {
      let postData = {itemId: currentEditItem['id'], supplierId: checkSupplierId, storeId: storeId};
      dispatch(appendSupplyOrder(token, status, storeId, postData, function (ok, reason) {
        if (ok) {
          self.reloadData();
        } else {
          ToastLong("保存失败")
        }
        self.setState({
          moveSupplierDialogVisible: false,
          currentEditStoreId: 0,
          currentEditItem: {}
        });
      }));
    } else {
      let postData = {itemId: currentEditItem['id'], orderId: supplyOrderId};
      dispatch(transferSupplier(token, status, storeId, postData, function (ok, reason) {
        if (ok) {
          self.reloadData();
        } else {
          ToastLong("保存失败")
        }
        self.setState({
          moveSupplierDialogVisible: false,
          currentEditStoreId: 0,
          currentEditItem: {}
        });
      }));
    }
  }

  trashSupplyOrder(id, storeId) {
    Alert.alert(
      '确认置为无效？',
      '订货单已无效',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确认', onPress: () => this.commonHandleProxy(id, storeId, trashSupplyOrder)},
      ],
      {cancelable: false}
    );
  }

  confirmReceivedOrder(id, storeId) {
    Alert.alert(
      '确认收货？',
      '订货单已经收货',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确认', onPress: () => this.commonHandleProxy(id, storeId, receivedSupplyOrder)},
      ],
      {cancelable: false}
    );
  }

  reviewOrder(id, storeId) {
    Alert.alert(
      '确认审核？',
      '订货单已经审核',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确认', onPress: () => this.commonHandleProxy(id, storeId, reviewSupplyOrder)},
      ],
      {cancelable: false}
    );
  }

  balanceOrder(id, storeId) {
    Alert.alert(
      '确认结算？',
      '订货单已经结算',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '确认', onPress: () => this.commonHandleProxy(id, storeId, balanceSupplyOrder)},
      ],
      {cancelable: false}
    );
  }

  printOrder(order, storeName, storeId) {
    const {invoicing} = this.props;
    let {suppliers} = invoicing;
    let suppliersMap = {};
    _.forEach(suppliers, function (val) {
      let id = val['id'];
      suppliersMap[id] = val;
    });

    let data = {
      'id': order.id,
      'storeName': storeName,
      'storeId': storeId,
      'supplierId': order.supplier_id,
      'supplierName': suppliersMap[order.supplier_id]['name'],
      'date': order.consignee_date,
      'createName': order.create_name,
      'items': order.req_items
    };
    native.printInventoryOrder(data)
  }

  commonHandleProxy(id, storeId, handle) {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let status = this.state.filterStatus;
    dispatch(handle(token, status, storeId, {id: id}, function (ok, reason) {
      if (ok) {
        ToastLong("操作成功")
      }
    }))
  }

  setMoveSuppliersOption() {
    const {invoicing} = this.props;
    let {waitReceiveSupplyOrder, suppliers} = invoicing;
    let storeId = this.state.currentEditStoreId;
    let storeData = {};
    _.forEach(waitReceiveSupplyOrder, function (val, id) {
      if (val['store_id'] == storeId) {
        storeData = val;
        return false;
      }
    });
    let tmp = {};
    _.forEach(suppliers, function (val, idx) {
      tmp[val['id']] = {id: val['id'], label: val['name'], count: 0, isNew: true}
    });
    let storeOrderData = storeData['data'];
    _.forEach(storeOrderData, function (item, val) {
      let supplierId = item['supplier_id'];
      tmp[supplierId]['isNew'] = false;
      tmp[supplierId]['count'] = item['req_items'].length;
      tmp[supplierId]['orderId'] = item['id'];
    });
    let r = [];
    _.mapValues(tmp, function (o) {
      let label = o['label'] + '(' + (o['isNew'] ? '新建' : o['count']) + ')';
      r.push({
        sId: o['id'],
        label: label,
        id: o['id'],
        isNew: o['isNew'],
        orderId: o['orderId']
      });
    });
    this.setState({currentMovedSupplierOptions: r})
  }

  setMoveCurrentCheckedVal(val) {
    if (!val) {
      let currentEditItem = this.state.currentEditItem;
      val = currentEditItem['supplier_id'];
    }
    this.setState({
      currentCheckedSupplier: val
    });
  }


  confirmOp(title, msg, cancelFunc, okFunc) {
    Alert.alert(
      title,
      msg,
      [
        {text: '取消', onPress: () => cancelFunc(), style: 'cancel'},
        {text: '确认', onPress: () => okFunc()},
      ]
    );
  }

  orderEditAble(orderId) {
    let orderCtrlStatus = this.state.orderCtrlStatus;
    return orderCtrlStatus[orderId] && orderCtrlStatus[orderId]['editAble'];
  }

  getGoodsTotalFee(items) {
    let totalFee = 0;
    _.forEach(items, function (item) {
      totalFee += item['req_amount'] * item['unit_price']
    });
    return numeral(totalFee).format('0.00')
  }

  getStoreTotalFee(storeId) {
    let totalFee = 0;
    const {invoicing} = this.props;
    let {confirmedSupplyOrder} = invoicing;
    _.forEach(confirmedSupplyOrder, function (item) {
      let sId = item['store_id'];
      if (sId == storeId) {
        let orders = item['data'];
        _.forEach(orders, function (item) {
          let reqItems = item['req_items'];
          _.forEach(reqItems, function (reqItem) {
            totalFee += reqItem['req_amount'] * reqItem['unit_price'];
          })
        });
        return false;
      }
    });
    return numeral(totalFee).format('0.00');
  }

  /**
   * 控制状态的显示与否
   **/
  initCtrlStatus() {
    const listData = this.getListDataByStatus();
    let orderCtrlStatus = {};
    let storeCtrlStatus = {};
    _.forEach(listData, function (val) {
      let storeId = val['store_id'];
      storeCtrlStatus[storeId] = {expandSupplier: false};
      _.forEach(val['data'], function (o) {
        let oId = o['id'];
        orderCtrlStatus[oId] = {editAble: false, expandGoods: false}
      })
    });
    this.setState({orderCtrlStatus: orderCtrlStatus, storeCtrlStatus: storeCtrlStatus})
  }

  getListDataByStatus() {
    let status = this.state.filterStatus;
    let {invoicing} = this.props;
    let {waitReceiveSupplyOrder, receivedSupplyOrder, confirmedSupplyOrder} = invoicing;
    switch (status) {
      case Constant.INVOICING.STATUS_CREATED:
        return waitReceiveSupplyOrder;
      case Constant.INVOICING.STATUS_ARRIVED:
        return receivedSupplyOrder;
      case Constant.INVOICING.STATUS_CONFIRMED:
        return confirmedSupplyOrder;
    }
  }

  renderItems() {
    let {invoicing} = this.props;
    const orderCtrlStatus = this.state.orderCtrlStatus;
    const storeCtrlStatus = this.state.storeCtrlStatus;
    const listData = this.getListDataByStatus();
    let {suppliers} = invoicing;
    let suppliersMap = {};
    _.forEach(suppliers, function (val) {
      let id = val['id'];
      suppliersMap[id] = val;
    });
    if (listData.length == 0) {
      return <EmptyListView/>
    }
    let self = this;
    let itemsView = [];
    let filterStatus = this.state.filterStatus;
    _.forEach(listData, function (val, idx) {
      itemsView.push(self.renderItem(val, idx, suppliersMap, filterStatus, orderCtrlStatus, storeCtrlStatus));
    });
    return itemsView;
  }

  handleEditOrderItem(itemData, storeId) {
    this.setState({
      opVisible: true,
      currentEditItem: _.clone(itemData),
      currentEditStoreId: storeId
    });
  }

  renderGoodList(goodList, editAble, storeId) {
    let goodsView = [];
    let self = this;
    _.forEach(goodList, function (item, idx) {
      goodsView.push(<Cell key={idx} customStyle={list.good_cell} access={false}
                           onPress={() => editAble ? self.handleEditOrderItem(item, storeId) : false}>
        <CellHeader style={list.flex}>
          <Text style={editAble ? {width: pxToDp(150), ...font.fontBlue} : {width: pxToDp(150)}}>{item['name']} </Text>
        </CellHeader>
        <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {/*<Text style={getGoodItemTextStyle(editAble)}>{item['total_req']} </Text>*/}
          <Text
            style={getGoodItemTextStyle(editAble)}>{item['req_amount']}{Constant.INVOICING.SkuUnitMap[item['unit_type']]} </Text>
          <Text style={getGoodItemTextStyle()}>{item['unit_price']} </Text>
          <Text style={getGoodItemTextStyle()}>{item['total_cost']} </Text>
        </CellBody>
        <CellFooter access={false}/>
      </Cell>);
    });
    return goodsView;
  }

  renderSupplyOrder(listData, suppliers, status, orderCtrlStatus, storeName = '', storeId = 0) {
    let ordersView = [];
    let self = this;
    _.forEach(listData, function (val, idx) {
      let opBtns = [];
      if (status == Constant.INVOICING.STATUS_CREATED) {
        opBtns = [<MyBtn key={1} text='置为无效' style={list.danger_btn}
                         onPress={() => self.trashSupplyOrder(val['id'], val['consignee_store_id'])}/>,
          <MyBtn key={2} text={self.orderEditAble(val['id']) ? '保存' : '修改'} style={list.info_btn}
                 onPress={() => self.toggleGoodEditStatus(val['id'])}/>,
          <MyBtn key={3} text='确认收货' style={list.blue_btn}
                 onPress={() => self.confirmReceivedOrder(val['id'], val['consignee_store_id'])}/>]
      }
      if (status == Constant.INVOICING.STATUS_ARRIVED) {
        opBtns = [<MyBtn key={1} text={self.orderEditAble(val['id']) ? '保存' : '修改'} style={list.info_btn}
                         onPress={() => self.toggleGoodEditStatus(val['id'])}/>,
          <MyBtn key={2} text='确认审核' style={list.blue_btn}
                 onPress={() => self.reviewOrder(val['id'], val['consignee_store_id'])}/>];
      }
      if (status == Constant.INVOICING.STATUS_CONFIRMED) {
        opBtns = [<MyBtn key={1} text={self.orderEditAble(val['id']) ? '保存' : '修改'} style={list.info_btn}
                         onPress={() => self.toggleGoodEditStatus(val['id'])}/>,
          <MyBtn key={3} text='确认结算' style={list.blue_btn}
                 onPress={() => self.balanceOrder(val['id'], val['consignee_store_id'])}/>];
      }

      opBtns.push(<MyBtn key={1} text='打印' style={list.warn_btn}
                         onPress={() => self.printOrder(val, storeName, storeId)}/>);

      ordersView.push(
        <View key={val['id']}>
          <Cell customStyle={list.init_cell} first>
            <CellHeader style={list.flex}>
              <Text style={[font.font38, font.fontRed, font.fontWeight]}>#{padNum(idx + 1, 2)} </Text>
              <Text style={[font.font30]}>{suppliers[val['supplier_id']]['name']}
                ({suppliers[val['supplier_id']]['mobile']}) </Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <CallBtn label={'呼叫'} mobile={suppliers[val['supplier_id']]['mobile']}/>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} access={true} onPress={() => {
            if (status == Constant.INVOICING.STATUS_CREATED) {
              self.chooseConsigneeDateTime(val['consignee_date'], val['id'], val['consignee_store_id'])
            } else {
              return false;
            }
          }}>
            <CellHeader>
              <Text style={[font.font30, font.fontBlack]}>送货时间 </Text>
            </CellHeader>
            <CellBody/>
            <CellFooter access={true}>
              <Text style={[font.font28, font.fontBlack]}>{val['consignee_date']} </Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} onPress={() => self.toggleGoods(val['id'])}>
            <CellHeader style={list.flex}>
              <Text style={[font.font30, font.fontBlack]}>商品 </Text>
              <Text
                style={[font.font26, font.fontGray, {marginLeft: pxToDp(20)}]}>￥{self.getGoodsTotalFee(val['req_items'])} </Text>
            </CellHeader>
            <CellBody/>
            <CellFooter access={true}>
              <Text style={[font.font30, font.fontBlack]}>{val['req_items'].length} </Text>
            </CellFooter>
          </Cell>
          {/*商品*/}
          {orderCtrlStatus[val['id']] && orderCtrlStatus[val['id']]['expandGoods'] && <View>
            <Cell customStyle={{...list.init_cell, borderBottomWidth: 0.5, minHeight: pxToDp(80)}}>
              <CellHeader style={list.flex}>
                <Text style={[font.font26, font.fontGray, {width: pxToDp(150)}]}>商品名 </Text>
              </CellHeader>
              <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                {/*<Text style={getGoodItemTextStyle()}>份数 </Text>*/}
                <Text style={getGoodItemTextStyle()}>总量 </Text>
                <Text style={getGoodItemTextStyle()}>单价 </Text>
                <Text style={getGoodItemTextStyle()}>总价 </Text>
              </CellBody>
              <CellFooter access={false}>
              </CellFooter>
            </Cell>

            <Cells style={{borderTopWidth: 0, borderBottomWidth: 0}}>
              {self.renderGoodList(val['req_items'], orderCtrlStatus[val['id']] && orderCtrlStatus[val['id']]['editAble'], val['consignee_store_id'])}
            </Cells>

          </View>}
          <Cell customStyle={list.init_cell}>
            <CellHeader>
              {status > Constant.INVOICING.STATUS_CREATED ?
                <View><Text style={[font.font26, font.fontOrange]}>{val['consignee_name']} 确认收货 </Text>
                  <Text style={[font.font26, font.fontOrange]}>{val['consignee_date']} </Text></View> : null}
            </CellHeader>
            <CellBody/>
            <CellFooter>
              {opBtns}
            </CellFooter>
          </Cell>
        </View>
      );
    });
    return ordersView;
  }

  renderItem(data, key, suppliers, status, orderCtrlStatus, storeCtrlStatus) {
    return <View style={list.cell} key={key}>
      <View style={[styles.in_cell, list.item_header]}>
        <View style={{width: Dimensions.get("window").width - 90}}>
          <Text style={[font.font30, font.fontBlack]}>
            {data['store_name']}
            <Text style={[font.font24, font.fontGray]}>{data['data'].length}个订单 </Text>
          </Text>
          {status == Constant.INVOICING.STATUS_CREATED && !!data['remark'] ?
            <View style={{flexDirection: 'row', flexWrap: 'nowrap'}}><Text
              style={[font.font24, font.fontBlack, {marginTop: pxToDp(10)}]}>备注: </Text><Text
              style={[font.font24, font.fontRed, {marginTop: pxToDp(11), flexWrap: 'wrap'}]}
              ellipsizeMode={'tail'}> {data['remark'].replace(/\s/g, ",")} </Text></View> : null}
          {status == Constant.INVOICING.STATUS_CONFIRMED ?
            <Text style={[font.font24, font.fontRed]}>待结算金额:
              ￥{this.getStoreTotalFee(data['store_id'])} </Text> : null}
        </View>
        <View style={{flexDirection: 'row', width: pxToDp(90), alignItems: 'center'}}>
          {/*{status == Constant.INVOICING.STATUS_CONFIRMED ? <View style={{*/}
          {/*borderWidth: 1,*/}
          {/*borderColor: colors.fontBlue,*/}
          {/*width: pxToDp(160),*/}
          {/*borderRadius: pxToDp(5),*/}
          {/*}}>*/}
          {/*<Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>计算本店</Text>*/}
          {/*<Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>所有订单</Text>*/}
          {/*</View> : <View style={{width: pxToDp(160),}}/>}*/}
          <View style={{width: pxToDp(90),}}>
            <TouchableOpacity onPress={() => this.toggleStore(data['store_id'])}>
              {
                storeCtrlStatus[data['store_id']] && storeCtrlStatus[data['store_id']]['expandSupplier'] ?
                  <Entypo name={"chevron-thin-up"} style={{fontSize: pxToDp(40), color: colors.main_color}}/> :
                  <Entypo name={"chevron-thin-down"} style={{fontSize: pxToDp(40), color: colors.main_color}}/>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/*展开详情*/}
      {storeCtrlStatus[data['store_id']] && storeCtrlStatus[data['store_id']]['expandSupplier'] && this.renderSupplyOrder(data['data'], suppliers, status, orderCtrlStatus, data['store_name'], data['store_id'])}
    </View>
  }

  render() {
    return (
      <View>
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.reloadData()}
            tintColor='gray'
          />
        }>
          {this.tab()}
          {this.renderItems()}
        </ScrollView>
        {this.renderActionSheet()}
        {/*{this.renderDateTimePicker()}*/}
        {this.renderMoveSupplierDialog()}
        {this.renderEditDialog()}
      </View>
    )
  }

  renderActionSheet() {
    let currentEditItem = this.state.currentEditItem;
    return <ActionSheet
      visible={this.state.opVisible}
      onRequestClose={() => {
      }}
      menus={[
        {
          type: 'default',
          label: currentEditItem['name'],
          onPress: () => {
            return false;
          },
        }, {
          type: 'warn',
          label: '删除',
          onPress: () => this.deleteOrderGoodItem(),
        }, {
          type: 'primary',
          label: '编辑',
          onPress: () => {
            this.setState({opVisible: false, editDialogVisible: true});
          },
        },
        {
          type: 'primary',
          label: '移入其他供应商',
          onPress: () => {
            this.setState({opVisible: false, moveSupplierDialogVisible: true});
            this.setMoveCurrentCheckedVal(false);
            this.setMoveSuppliersOption();
          },
        }
      ]}
      actions={[
        {
          type: 'default',
          label: '取消',
          onPress: () => {
            this.setState({opVisible: false});
          },
        }
      ]}
    />
  }

  // renderDateTimePicker() {
  //   let self = this;
  //   return <DateTimePicker
  //     date={initDate(self.state.consigneeDate)}
  //     mode='datetime'
  //     isVisible={self.state.showDatePicker}
  //     onConfirm={async (datetime) => {
  //       self.updateOrderConsigneeDatetime(datetime);
  //     }}
  //     onCancel={() => {
  //       self.setState({showDatePicker: false, consigneeDate: null, currentEditOrderId: 0});
  //     }}
  //   />;
  // }

  renderMoveSupplierDialog() {
    let self = this;
    let currentEditItem = this.state.currentEditItem;
    const title = currentEditItem['name']
    return <Dialog
      visible={this.state.moveSupplierDialogVisible}
      title={title}
      onRequestClose={() => {
      }}
      buttons={[
        {
          type: 'default',
          label: '取消',
          onPress: () => {
            self.setState({
              moveSupplierDialogVisible: false
            });
          },
        }, {
          type: 'primary',
          label: '确定',
          onPress: () => {
            self.updateOrderGoodItemSupplier();
          },
        },
      ]}>
      <CellsTitle>转移供应商</CellsTitle>
      <CheckboxCells
        options={self.state.currentMovedSupplierOptions}
        value={self.state.currentCheckedSupplier}
        onChange={(checked, val) => {
          self.setMoveCurrentCheckedVal(val)
        }}
        style={{
          marginLeft: 0,
          paddingLeft: 0,
          backgroundColor: "#fff",
          marginTop: 0
        }}
      />
    </Dialog>;
  }

  renderEditDialog() {
    let self = this;
    let currentEditItem = this.state.currentEditItem;
    return <Dialog
      visible={self.state.editDialogVisible}
      onRequestClose={() => {
      }}
      title={currentEditItem['name']}
      buttons={[
        {
          type: 'default',
          label: '取消',
          onPress: () => {
            self.setState({
              editDialogVisible: false
            });
          },
        }, {
          type: 'primary',
          label: '确定',
          onPress: () => self.updateOrderGoodItem(),
        },
      ]}>
      <Cell style={customStyles.formCellStyle}>
        <CellHeader><Label style={font.font24}>总量</Label></CellHeader>
        <CellBody>
          <Input
            style={font.font24}
            keyboardType={'numeric'}
            placeholder="订货总量"
            value={currentEditItem['req_amount']}
            onChangeText={(val) => {
              let currentEditItem = self.state.currentEditItem;
              currentEditItem['req_amount'] = val;
              this.setState({currentEditItem: currentEditItem});
            }}
          />
        </CellBody>
      </Cell>
      <Cell style={customStyles.formCellStyle}>
        <CellHeader><Label style={font.font24}>单价</Label></CellHeader>
        <CellBody>
          <Input
            style={font.font24}
            keyboardType={'numeric'}
            placeholder="订货单价"
            value={currentEditItem['unit_price']}
            onChangeText={(val) => {
              let currentEditItem = self.state.currentEditItem;
              currentEditItem['unit_price'] = val;
              this.setState({currentEditItem: currentEditItem});
            }}
          />
        </CellBody>
      </Cell>
      <Cell style={customStyles.formCellStyle}>
        <CellHeader><Label style={font.font24}>总价</Label></CellHeader>
        <CellBody>
          <Input
            style={font.font24}
            keyboardType={'numeric'}
            placeholder="采购总价"
            value={currentEditItem['total_cost']}
            onChangeText={(val) => {
              let currentEditItem = self.state.currentEditItem;
              currentEditItem['total_cost'] = val;
              this.setState({currentEditItem: currentEditItem});
            }}
          />
        </CellBody>
      </Cell>
      <CellsTitle>订货单位</CellsTitle>
      <RadioCells
        cellStyle={customStyles.radioCellsStyle}
        cellTextStyle={font.font24}
        options={Constant.INVOICING.SkuUnitSelect}
        onChange={(val) => {
          let currentEditItem = self.state.currentEditItem;
          currentEditItem['unit_type'] = val;
          this.setState({currentEditItem: currentEditItem});
        }}
        value={currentEditItem['unit_type']}
      />
    </Dialog>;
  }

}

const customStyles = {
  wrapper: {
    flex: 1,
    marginTop: 64,
    backgroundColor: '#fbf9fe',
  },
  formCellStyle: {
    paddingRight: pxToDp(0),
    marginHorizontal: pxToDp(30),
    maxHeight: pxToDp(100),
    alignItems: 'center'
  },
  radioCellsStyle: {
    marginLeft: pxToDp(30),
    maxHeight: pxToDp(80)
  },
  radioCellsTextStyle: {},
  formCellsStyle: {},
  hideStyle: {
    height: 0
  }
};

const tabs = {
  tabs: {
    height: pxToDp(70),
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: pxToDp(35),
    backgroundColor: colors.fontBlue
  },
  tabs_item: {
    height: pxToDp(70),
    textAlignVertical: 'center',
    width: pxToDp(130),
    textAlign: 'center',
    color: 'black',
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.fontBlue,
  },
  tabs_item_active: {
    backgroundColor: colors.fontBlue,
    color: colors.white
  },
  tabs_item_left_radius: {
    borderTopLeftRadius: pxToDp(35),
    borderBottomLeftRadius: pxToDp(35)
  },
  tabs_item_right_radius: {
    borderTopRightRadius: pxToDp(35),
    borderBottomRightRadius: pxToDp(35)
  }
}
const list = {
  cell: {
    backgroundColor: colors.white,
  },
  item_header: {
    borderColor: colors.main_back,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(30),
  },
  init_cell: {
    marginLeft: pxToDp(30),
    paddingRight: pxToDp(0),
    marginHorizontal: pxToDp(30),
    minHeight: pxToDp(100),
    alignItems: 'center'
  },
  good_cell: {
    marginLeft: pxToDp(30),
    paddingRight: pxToDp(0),
    marginHorizontal: pxToDp(30),
    minHeight: pxToDp(80),
    alignItems: 'center'
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goods_title: {
    flex: 1,
    textAlign: 'center',
  },
  blue_btn: {
    width: pxToDp(130),
    height: pxToDp(70),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    backgroundColor: colors.fontBlue,
    color: colors.white,
    fontSize: 13,
  },
  info_btn: {
    width: pxToDp(130),
    height: pxToDp(70),
    marginRight: pxToDp(5),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    color: colors.fontBlue,
    borderWidth: 0.5,
    borderColor: colors.fontBlue,
    fontSize: 13,
  },
  warn_btn: {
    width: pxToDp(130),
    height: pxToDp(70),
    marginLeft: pxToDp(5),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    color: colors.orange,
    borderWidth: 0.5,
    borderColor: colors.orange,
    fontSize: 13,
  },
  danger_btn: {
    width: pxToDp(130),
    height: pxToDp(70),
    marginRight: pxToDp(5),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: pxToDp(5),
    color: colors.editStatusAdd,
    borderWidth: 0.5,
    borderColor: colors.editStatusAdd,
    fontSize: 13,
  },
  good_item_field: {
    flex: 1,
    textAlign: 'center',
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingOrderGoodsScene)
