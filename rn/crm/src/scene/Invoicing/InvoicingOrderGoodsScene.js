import React, {PureComponent} from 'react';
import {ScrollView, Text, View, Image, TextInput} from 'react-native'
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
import CheckboxCells from "./CheckBoxCells"

import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchSupplyWaitOrder, loadAllSuppliers} from "../../reducers/invoicing/invoicingActions";
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

class InvoicingOrderGoodsScene extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      filterStatus: 0,
      listData: [],
      showDatePicker: false,
      consigneeDate: null,
      opVisible: false,
      editDialogVisible: false
    };
    this.reloadData = this.reloadData.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.loadAllSuppliers = this.loadAllSuppliers.bind(this)
    this.renderSupplyOrder = this.renderSupplyOrder.bind(this)
    this.renderGoodList = this.renderGoodList.bind(this)
    this.chooseConsigneeDateTime = this.chooseConsigneeDateTime.bind(this)
    this.changeTab = this.changeTab.bind(this)
  }

  tab() {
    let filterStatus = this.state.filterStatus;
    let leftStyle = [tabs.tabs_item, tabs.tabs_item_left_radius,];
    let middleStyle = [tabs.tabs_item,];
    let rightStyle = [tabs.tabs_item, tabs.tabs_item_right_radius];
    if (filterStatus == 0) {
      leftStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == 3) {
      middleStyle.push(tabs.tabs_item_active);
    }
    if (filterStatus == 4) {
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

  changeTab(val) {
    this.setState({
      filterStatus: val
    });
  }

  componentWillMount() {
    this.loadAllSuppliers();
    this.reloadData();
  }

  componentDidMount() {
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
    let _this = this;
    dispatch(fetchSupplyWaitOrder(currStoreId, token, function () {
      _this.setState({isRefreshing: false});
    }));
  }

  renderItems() {
    let {invoicing} = this.props;
    let {waitReceiveSupplyOrder, suppliers} = invoicing;
    let suppliersMap = {};
    _.forEach(suppliers, function (val) {
      let id = val['id'];
      suppliersMap[id] = val;
    })
    if (waitReceiveSupplyOrder.length == 0) {
      return <View style={{display: 'flex', justifyContent: 'center'}}><Text>暂无数据</Text></View>
    }
    let self = this;
    let itemsView = [];
    let filterStatus = this.state.filterStatus;
    _.forEach(waitReceiveSupplyOrder, function (val, idx) {
      itemsView.push(self.renderItem(val, idx, suppliersMap, filterStatus));
    });
    return itemsView;
  }

  handleEditOrderItem(text) {
    this.setState({
      opVisible: true
    });
  }

  renderGoodList(goodList) {
    let goodsView = [];
    let self = this;
    _.forEach(goodList, function (item, idx) {
      goodsView.push(<Cell key={idx} customStyle={list.good_cell} access={false}>
        <CellHeader style={list.flex}>
          <Text style={{width: pxToDp(150)}}
                onPress={() => self.handleEditOrderItem(item['name'])}>{item['name']}</Text>
        </CellHeader>
        <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Text style={list.good_item_field}>{item['total_req']}</Text>
          <Text style={list.good_item_field}>{item['req_amount']}{SkuUnitMap[item['unit_type']]}</Text>
          <Text style={list.good_item_field}>{item['unit_price']}</Text>
          <Text style={list.good_item_field}>{item['total_cost']}</Text>
        </CellBody>
        <CellFooter access={false}/>
      </Cell>);
    });
    return goodsView;
  }

  renderSupplyOrder(listData, suppliers, status) {
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
          <Cell customStyle={list.init_cell} access={false}>
            <CellHeader style={list.flex}>
              <Text style={[font.font30, font.fontBlack]}>商品</Text>
              <Text style={[font.font26, font.fontGray, {marginLeft: pxToDp(20)}]}>$32.5</Text>
            </CellHeader>
            <CellBody/>
            <CellFooter access={true}>
              <Text style={[font.font30, font.fontBlack]}>{val['req_items'].length}</Text>
            </CellFooter>
          </Cell>
          {/*商品*/}
          <View>
            <Cell customStyle={{...list.init_cell, borderBottomWidth: 0.8}}>
              <CellHeader style={list.flex}>
                <Text style={[font.font26, font.fontGray, {width: pxToDp(150)}]}>商品名</Text>
              </CellHeader>
              <CellBody style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>份数</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>总量</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>单价</Text>
                <Text style={[font.font26, font.fontGray, list.goods_title]}>总价</Text>
              </CellBody>
              <CellFooter access={false}>
              </CellFooter>
            </Cell>
            <Cells style={{borderTopWidth: 0, borderBottomWidth: 0}}>
              {self.renderGoodList(val['req_items'])}
            </Cells>
          </View>
          <Cell customStyle={list.init_cell}>
            <CellHeader>
              {status > 0 ? <View><Text style={[font.font26, font.fontOrange]}>朱春浩 确认收货</Text>
                <Text style={[font.font26, font.fontOrange]}>2018-03-09 09:30</Text></View> : null}
            </CellHeader>
            <CellBody/>
            <CellFooter>
              <MyBtn text='置为无效' style={list.danger_btn}/>
              <MyBtn text='修改' style={list.info_btn}/>
              <MyBtn text='确认收货' style={list.blue_btn}/>
            </CellFooter>
          </Cell>
        </View>
      );
    });
    return ordersView;
  }

  renderItem(data, key, suppliers, status) {
    return <View style={list.cell} key={key}>
      <View style={[styles.in_cell, list.item_header]}>
        <View>
          <Text style={[font.font30, font.fontBlack]}>
            {data['store_name']}
            <Text style={[font.font24, font.fontGray]}>{data['data'].length}个订单</Text>
          </Text>
          {status == 3 ? <Text style={[font.font24, font.fontRed]}>待结算金额: $95.75</Text> : null}
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
            <Image source={require('../../img/Order/pull_down.png')}
                   style={{
                     width: pxToDp(90),
                     height: pxToDp(72)
                   }}/>
          </View>
        </View>
      </View>
      {/*展开详情*/}
      {this.renderSupplyOrder(data['data'], suppliers, status)}
    </View>
  }

  render() {
    return (
      <View>
        <ScrollView>
          {this.tab()}
          {this.renderItems()}
        </ScrollView>

        <DateTimePicker
          date={initDate(this.state.consigneeDate)}
          mode='date'
          isVisible={this.state.showDatePicker}
          onConfirm={async (date) => {
            this.setState({showDatePicker: false});
          }}
          onCancel={() => {
            this.setState({showDatePicker: false});
          }}
        />

        <ActionSheet
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
              label: '移入其他供应商',
              onPress: () => {
                this.setState({opVisible: false, editDialogVisible: true});
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

        <Dialog
          visible={this.state.editDialogVisible}
          title="标题二"
          onRequestClose={() => {
          }}
          buttons={[
            {
              type: 'default',
              label: '取消',
              onPress: () => {
                this.state.editDialogVisible = false
              },
            }, {
              type: 'primary',
              label: '确定',
              onPress: () => {
                this.state.editDialogVisible = false
              },
            },
          ]}
        >
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
        </Dialog>
      </View>
    )
  }
}

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