import React, {Component} from 'react';
import {ScrollView, Text, View, Image, TextInput, Alert, TouchableOpacity} from 'react-native'
import font from './fontStyles'
import styles from './InvoicingStyles'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Cell from "../../weui/Cell/Cell";
import CellHeader from "../../weui/Cell/CellHeader";
import CellBody from "../../weui/Cell/CellBody";
import Cells from "../../weui/Cell/Cells"
import MyBtn from '../../common/MyBtn'
import CellFooter from "../../weui/Cell/CellFooter";
import ActionSheet from "../../weui/ActionSheet/ActionSheet"
import Dialog from "../../weui/Dialog/Dialog"
import CellsTitle from "../../weui/Cell/CellsTitle"
import CheckboxCells from "./CheckBoxCells"
import RadioCells from "../../weui/Form/RadioCells"
import Label from "../../weui/Form/Label"
import Input from "../../weui/Form/Input"

import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {
  fetchSupplyWaitOrder,
  loadAllSuppliers,
  fetchSupplyArrivedOrder,
  fetchSupplyWaitBalanceOrder
} from "../../reducers/invoicing/invoicingActions";
import DateTimePicker from 'react-native-modal-datetime-picker';

import _ from 'lodash'

function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchSupplyWaitOrder,
      loadAllSuppliers,
      ...globalActions
    })
  }
}

const SkuUnitSelect = [
  {txt: '斤', id: '0'},
  {txt: '份', id: '1'},
];

const SkuUnitMap = {
  '0': '斤',
  '1': '份'
};

function padNum(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
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

const STATUS_TRASHED = -1;
const STATUS_CREATED = 0;
const STATUS_LOCKED = 1;
const STATUS_SHIPPED = 2;
const STATUS_ARRIVED = 3;
const STATUS_CONFIRMED = 4;
const STATUS_COMPLETE = 5;

class InvoicingOrderGoodsScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      filterStatus: 0,
      showDatePicker: false,
      consigneeDate: null,
      opVisible: false,
      editDialogVisible: false,
      moveSupplierDialogVisible: false,
      orderCtrlStatus: {},
      storeCtrlStatus: {}
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
    this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
    this.renderMoveSupplierDialog = this.renderMoveSupplierDialog.bind(this)
    this.renderEditDialog = this.renderEditDialog.bind(this)
  }

  tab() {
    let filterStatus = this.state.filterStatus;
    let leftStyle = [tabs.tabs_item, tabs.tabs_item_left_radius,];
    let middleStyle = [tabs.tabs_item,];
    let rightStyle = [tabs.tabs_item, tabs.tabs_item_right_radius];
    if (filterStatus == STATUS_CREATED) {
      leftStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == STATUS_ARRIVED) {
      middleStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == STATUS_CONFIRMED) {
      rightStyle.push(tabs.tabs_item_active);
    }
    return (
      <View style={[styles.in_cell, {
        backgroundColor: colors.white,
        marginBottom: pxToDp(10),
      }]}>
        <View style={tabs.tabs}>
          <Text style={leftStyle}
                onPress={() => this.changeTab(0)}>待收货</Text>
          <Text style={middleStyle} onPress={() => this.changeTab(3)}>待审核</Text>
          <Text style={rightStyle} onPress={() => this.changeTab(4)}>待结算</Text>
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
    this.setState({
      filterStatus: val
    });
    this.reloadData()
  }

  shouldComponentUpdate(nextProps, nextState) {
    //优化性能
    return true;
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.loadAllSuppliers();
    this.reloadData();
  }

  chooseConsigneeDateTime(old) {
    this.setState({
      consigneeDate: old,
      showDatePicker: true
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
      case STATUS_CREATED:
        dispatch(fetchSupplyWaitOrder(currStoreId, token, callBack));
        break;
      case STATUS_ARRIVED:
        dispatch(fetchSupplyArrivedOrder(currStoreId, token, callBack));
        break;
      case STATUS_CONFIRMED:
        dispatch(fetchSupplyWaitBalanceOrder(currStoreId, token, callBack));
        break;
    }

  }

  /**
   * 确认操作
   */
  confirmOp(title, msg, cancelFunc, okFunc) {
    Alert.alert(
      title,
      msg,
      [
        {text: '取消', onPress: cancelFunc, style: 'cancel'},
        {text: '确认', okFunc},
      ]
    );
  }

  orderEditAble(orderId) {
    let orderCtrlStatus = this.state.orderCtrlStatus;
    return orderCtrlStatus[orderId] && orderCtrlStatus[orderId]['editAble'];
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
      storeCtrlStatus[storeId] = {expandSupplier: true};
      _.forEach(val['data'], function (o) {
        let oId = o['id'];
        orderCtrlStatus[oId] = {editAble: false, expandGoods: true}
      })
    });
    this.setState({orderCtrlStatus: orderCtrlStatus, storeCtrlStatus: storeCtrlStatus})
  }

  getListDataByStatus() {
    let status = this.state.filterStatus;
    let {invoicing} = this.props;
    let {waitReceiveSupplyOrder, receivedSupplyOrder, confirmedSupplyOrder} = invoicing;
    switch (status) {
      case STATUS_CREATED:
        return waitReceiveSupplyOrder;
      case STATUS_ARRIVED:
        return receivedSupplyOrder;
      case STATUS_CONFIRMED:
        return confirmedSupplyOrder;
    }
  }

  renderItems() {
    let {invoicing} = this.props;
    let {suppliers} = invoicing;
    let suppliersMap = {};
    const orderCtrlStatus = this.state.orderCtrlStatus;
    const storeCtrlStatus = this.state.storeCtrlStatus;
    const listData = this.getListDataByStatus();
    _.forEach(suppliers, function (val) {
      let id = val['id'];
      suppliersMap[id] = val;
    });
    if (listData.length == 0) {
      return <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Text style={{flex: 1}}>暂无数据</Text></View>
    }
    let self = this;
    let itemsView = [];
    let filterStatus = this.state.filterStatus;
    _.forEach(listData, function (val, idx) {
      itemsView.push(self.renderItem(val, idx, suppliersMap, filterStatus, orderCtrlStatus, storeCtrlStatus));
    });
    return itemsView;
  }

  handleEditOrderItem(text) {
    this.setState({
      opVisible: true
    });
  }

  renderGoodList(goodList, editAble) {
    let goodsView = [];
    let self = this;
    _.forEach(goodList, function (item, idx) {
      goodsView.push(<Cell key={idx} customStyle={list.good_cell} access={false}>
        <CellHeader style={list.flex}>
          <Text style={editAble ? {width: pxToDp(150), ...font.fontBlue} : {width: pxToDp(150)}}
                onPress={() => editAble ? self.handleEditOrderItem(item['name']) : false}>{item['name']}</Text>
        </CellHeader>
        <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Text style={getGoodItemTextStyle(editAble)}>{item['total_req']}</Text>
          <Text style={getGoodItemTextStyle(editAble)}>{item['req_amount']}{SkuUnitMap[item['unit_type']]}</Text>
          <Text style={getGoodItemTextStyle()}>{item['unit_price']}</Text>
          <Text style={getGoodItemTextStyle()}>{item['total_cost']}</Text>
        </CellBody>
        <CellFooter access={false}/>
      </Cell>);
    });
    return goodsView;
  }

  renderSupplyOrder(listData, suppliers, status, orderCtrlStatus) {
    let ordersView = [];
    let self = this;
    _.forEach(listData, function (val, idx) {
      ordersView.push(
        <View key={val['id']}>
          <Cell customStyle={list.init_cell} first>
            <CellHeader style={list.flex}>
              <Text style={[font.font38, font.fontRed, font.fontWeight]}>#{padNum(idx, 2)}</Text>
              <Text style={[font.font30]}>{suppliers[val['supplier_id']]['name']}
                ({suppliers[val['supplier_id']]['mobile']})</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Image source={require('../../img/Invoicing/dianhua.png')}
                     style={{width: pxToDp(38), height: pxToDp(38), marginRight: pxToDp(10)}}/>
              <Text style={[font.fontBlue]}>呼叫</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} access={true}
                onPress={() => self.chooseConsigneeDateTime(val['consignee_date'])}>
            <CellHeader>
              <Text style={[font.font30, font.fontBlack]}>送货时间</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <Text style={[font.font28, font.fontBlack]}>{val['consignee_date']}</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={list.init_cell} onPress={() => self.toggleGoods(val['id'])}>
            <CellHeader style={list.flex}>
              <Text style={[font.font30, font.fontBlack]}>商品</Text>
              <Text style={[font.font26, font.fontGray, {marginLeft: pxToDp(20)}]}>￥32.5</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter access={true}>
              <Text style={[font.font30, font.fontBlack]}>{val['req_items'].length}</Text>
            </CellFooter>
          </Cell>
          {/*商品*/}
          {orderCtrlStatus[val['id']] && orderCtrlStatus[val['id']]['expandGoods'] && <View>
            <Cell customStyle={{...list.init_cell, borderBottomWidth: 0.8}}>
              <CellHeader style={list.flex}>
                <Text style={[font.font26, font.fontGray, {width: pxToDp(150)}]}>商品名</Text>
              </CellHeader>
              <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={getGoodItemTextStyle()}>份数</Text>
                <Text style={getGoodItemTextStyle()}>总量</Text>
                <Text style={getGoodItemTextStyle()}>单价</Text>
                <Text style={getGoodItemTextStyle()}>总价</Text>
              </CellBody>
              <CellFooter access={false}>
              </CellFooter>
            </Cell>

            <Cells style={{borderTopWidth: 0, borderBottomWidth: 0}}>
              {self.renderGoodList(val['req_items'], orderCtrlStatus[val['id']] && orderCtrlStatus[val['id']]['editAble'])}
            </Cells>
          </View>}
          <Cell customStyle={list.init_cell}>
            <CellHeader>
              {status > 0 ? <View><Text style={[font.font26, font.fontOrange]}>朱春浩 确认收货</Text>
                <Text style={[font.font26, font.fontOrange]}>2018-03-09 09:30</Text></View> : null}
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <MyBtn text='置为无效' style={list.danger_btn}/>
              <MyBtn text={self.orderEditAble(val['id']) ? '保存' : '修改'} style={list.info_btn}
                     onPress={() => self.toggleGoodEditStatus(val['id'])}/>
              <MyBtn text='确认收货' style={list.blue_btn}/>
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
        <View>
          <Text style={[font.font30, font.fontBlack]}>
            {data['store_name']}
            <Text style={[font.font24, font.fontGray]}>{data['data'].length}个订单</Text>
          </Text>
          {status == 3 ? <Text style={[font.font24, font.fontRed]}>待结算金额: ￥95.75</Text> : null}
        </View>
        <View style={{flexDirection: 'row', width: pxToDp(220), alignItems: 'center'}}>
          {status == 3 ? <View style={{
            borderWidth: 1,
            borderColor: colors.fontBlue,
            width: pxToDp(160),
            borderRadius: pxToDp(5),
          }}>
            <Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>计算本店</Text>
            <Text style={[font.font24, font.fontBlue, {textAlign: 'center'}]}>所有订单</Text>
          </View> : <View style={{width: pxToDp(160),}}/>}
          <View style={{width: pxToDp(90),}}>
            <TouchableOpacity onPress={() => this.toggleStore(data['store_id'])}>
              <Image
                source={storeCtrlStatus[data['store_id']] && storeCtrlStatus[data['store_id']]['expandSupplier'] ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                style={{
                  width: pxToDp(90),
                  height: pxToDp(72)
                }}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/*展开详情*/}
      {storeCtrlStatus[data['store_id']] && storeCtrlStatus[data['store_id']]['expandSupplier'] && this.renderSupplyOrder(data['data'], suppliers, status, orderCtrlStatus)}
    </View>
  }

  render() {
    return (
      <View>
        <ScrollView>
          {this.tab()}
          {this.renderItems()}
        </ScrollView>
        {this.renderActionSheet()}
        {this.renderDateTimePicker()}
        {this.renderMoveSupplierDialog()}
        {this.renderEditDialog()}
      </View>
    )
  }

  renderActionSheet() {
    return <ActionSheet
      visible={this.state.opVisible}
      onRequestClose={() => {
      }}
      menus={[
        {
          type: 'default',
          label: '操作一',
          onPress: () => {
          },
        }, {
          type: 'warn',
          label: '删除',
          onPress: () => {
          },
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

  renderDateTimePicker() {
    return <DateTimePicker
      date={initDate(this.state.consigneeDate)}
      mode='date'
      isVisible={this.state.showDatePicker}
      onConfirm={async (date) => {
        this.setState({showDatePicker: false});
      }}
      onCancel={() => {
        this.setState({showDatePicker: false});
      }}
    />;
  }

  renderMoveSupplierDialog() {
    let self = this;
    return <Dialog
      visible={this.state.moveSupplierDialogVisible}
      title="转移供应商"
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
            self.setState({
              moveSupplierDialogVisible: false
            });
          },
        },
      ]}>
      <CellsTitle>表单</CellsTitle>
      <CheckboxCells
        options={[
          {label: 1, id: 1},
          {label: 2, id: 2},
          {label: 3, id: 3},
          {label: 4, id: 4},
          {label: 5, id: 5},
          {label: 6, id: 6},
        ]}
        value={[{label: 2, id: 2}]}
        onChange={(checked) => {
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
    return <Dialog
      visible={self.state.editDialogVisible}
      onRequestClose={() => {
      }}
      title="编辑"
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
          onPress: () => {
            self.setState({
              editDialogVisible: false
            });
          },
        },
      ]}>
      <Cell style={customStyles.formCellStyle}>
        <CellHeader><Label style={font.font24}>份数</Label></CellHeader>
        <CellBody>
          <Input
            placeholder=""
            value={'100'}
            onChangeText={() => {
            }}
          />
        </CellBody>
      </Cell>
      <Cell style={customStyles.formCellStyle}>
        <CellHeader><Label style={font.font24}>总量</Label></CellHeader>
        <CellBody>
          <Input
            placeholder=""
            value={'100'}
            onChangeText={() => {
            }}
          />
        </CellBody>
      </Cell>
      <CellsTitle>订货单位</CellsTitle>
      <RadioCells
        cellStyle={customStyles.radioCellsStyle}
        cellTextStyle={font.font24}
        options={[
          {
            label: '选项一',
            value: 1
          }, {
            label: '选项二',
            value: 2
          }
        ]}
        onChange={() => {
        }}
        value={1}
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
  radioCellsTextStyle: {

  },
  formCellsStyle: {

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