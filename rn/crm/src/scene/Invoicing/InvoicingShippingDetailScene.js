import React, {Component} from 'react';
import {ScrollView, Switch, Text, View, TouchableOpacity, TextInput, Dimensions} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import font from './fontStyles'
import MyBtn from '../../common/MyBtn'
import Loader from '../../common/Loader'
import CheckboxCells from './CheckBoxCells'

import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import _ from "lodash"

import {lockProvideReq, setReqItemSupplier, createSupplyOrder} from "../../reducers/invoicing/invoicingActions";
import {ToastLong} from "../../util/ToastUtils";
import Conf from '../../config'

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      lockProvideReq,
      setReqItemSupplier,
      createSupplyOrder,
      ...globalActions
    }, dispatch)
  }
}

class InvoicingShippingDetailScene extends Component {
  static navigationOptions = ({navigation}) => {
    const {req} = (navigation.state.params || {});
    let storeName = req['store_name'];
    return {
      headerTitle: storeName,
    }
  };

  constructor(props) {
    super(props)
    this.state = {
      req: {},
      suppliers: [],
      checkedSupplierId: 1,
      trackRemark: true,
      loading: false,
      remark: {}
    }
    this.handleCheckSupplier = this.handleCheckSupplier.bind(this);
    this.handleCheckItem = this.handleCheckItem.bind(this);
    this.toggleTrackRemark = this.toggleTrackRemark.bind(this);
    this.saveSupplier = this.saveSupplier.bind(this);
    this.submitOrder = this.submitOrder.bind(this);
    this.setSupplierRemark = this.setSupplierRemark.bind(this);
  }

  componentWillMount() {
    const {req, suppliers} = (this.props.navigation.state.params || {});
    this.setState({req: req, suppliers: suppliers});
    let reqItems = req['req_items'];
    let checkCount = {};
    let orderRemark = {};
    _.forEach(suppliers, function (item) {
      let supplyId = item['id'];
      checkCount[supplyId] = 0;
      orderRemark[supplyId] = '';
    });
    let checkItems = reqItems.map(function (item, idx) {
      if (item['supplier_id'] > 0) {
        let supplierId = item['supplier_id'];
        checkCount[supplierId] = checkCount[supplierId] + 1;
      }
      return {label: item['name'], id: item['id'], sId: item['supplier_id']}
    });
    this.setState({checkItems: checkItems});
    let checkSuppliers = suppliers.map(function (item, idx) {
      return {id: item['id'], name: item['name']}
    });
    this.setState({checkSuppliers: checkSuppliers});
    this.setState({checkCount: checkCount})
    this.setState({remark: orderRemark})
  }

  saveSupplier(callback) {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let checkItems = this.state.checkItems;
    let reqId = this.state.req.id;
    let postData = [];
    _.forEach(checkItems, function (item) {
      postData.push({id: item['id'], supplier_id: item['sId']});
    });
    dispatch(setReqItemSupplier(postData, reqId, token, callback))
  }

  componentWillUnmount() {
    //merge data and save
    this.saveSupplier(function (ok, reason) {
      console.log("after set supplier")
    });
  }

  handleCheckSupplier(sId) {
    this.setState({checkedSupplierId: sId});
  }

  setCheckCount(sId, check) {
    let checkCount = this.state.checkCount;
    if (check) {
      checkCount[sId] = checkCount[sId] + 1;
    } else {
      checkCount[sId] = checkCount[sId] > 0 ? checkCount[sId] - 1 : checkCount[sId];
    }
    this.setState({checkCount: checkCount})
  }

  handleCheckItem(checked, itemId) {
    let checkItems = this.state.checkItems;
    let checkedSupplierId = this.state.checkedSupplierId;
    let copy = [];
    let self = this;
    _.forEach(checkItems, function (value) {
      let vId = value['id'];
      if (itemId == vId) {
        value['sId'] = checked ? checkedSupplierId : 0;
        self.setCheckCount(checkedSupplierId, checked);
      }
      copy.push(value);
    });
    this.setState({checkItems: copy});
  }

  renderSuppliers() {
    let suppliers = this.state.checkSuppliers;
    let checkCount = this.state.checkCount;
    let checkedSupplierId = this.state.checkedSupplierId;
    let self = this;
    let s = suppliers.map(function (item, idx) {
      let sId = item['id'];
      let sts = [styles.item_left];
      if (checkedSupplierId == sId) {
        sts.push(font.fontBlue)
      }
      return <TouchableOpacity onPress={() => self.handleCheckSupplier(sId)} key={idx}><Text
        style={sts}>{item['name']}{checkCount[sId] ? '(' + checkCount[sId] + ')' : ''}</Text></TouchableOpacity>;
    });
    return s;
  }

  toggleTrackRemark() {
    let track = this.state.trackRemark;
    this.setState({trackRemark: !track});
  }

  setSupplierRemark(text, supplierId) {
    let checkSupplierId = this.state.checkedSupplierId;
    if (supplierId != checkSupplierId) {
      return false;
    }
    let remark = this.state.remark;
    remark[checkSupplierId] = text;
    this.setState({remark: remark});
  }

  submitOrder() {
    let items = this.state.checkItems;
    let unSetSuppiler = _.find(items, function (item) {
      return item['sId'] == 0;
    });
    if (unSetSuppiler) {
      ToastLong("请选择供货商!");
      return false;
    }
    let self = this;
    this.setState({loading: true});
    const {dispatch, global, navigation} = this.props;
    let reqId = this.state.req.id;
    let token = global['accessToken'];
    let remark = this.state.remark;
    this.saveSupplier(function (ok, reason) {
      if (ok) {
        dispatch(createSupplyOrder(reqId, remark, token, function (ok, reason) {
          self.setState({loading: false});
          if (ok) {
            navigation.navigate(Conf.ROUTE_INVOICING, {refresh: true, initPage: 2});
          } else {
            ToastLong(reason);
          }
        }))
      } else {
        self.setState({loading: false});
        ToastLong("提交失败请重试！")
      }
    });
    return true;
  }

  render() {
    let req = this.state.req;
    let checkSupplierId = this.state.checkedSupplierId;
    let checkItems = _.filter(this.state.checkItems, function (o) {
      return o['sId'] == 0 || o['sId'] == checkSupplierId;
    });
    let cRemark = this.state.remark[checkSupplierId];
    return (
      <View style={{flex: 1}}>
        <TextInput
          style={styles.header_text}
          onChangeText={(text) => this.setSupplierRemark(text, checkSupplierId)}
          value={cRemark}
          placeholderTextColor={colors.fontGray}
          placeholder={'请输入对应供应商订货单备注'}
        />
        <View style={{flexDirection: 'row'}}>
          <ScrollView style={styles.left_list}>
            {this.renderSuppliers()}
          </ScrollView>
          <ScrollView style={styles.left_right}>
            <CheckboxCells
              options={checkItems}
              value={checkSupplierId}
              onChange={(checked, itemId) => {
                this.handleCheckItem(checked, itemId)
              }}
              style={{
                marginLeft: 0,
                paddingLeft: 0,
                backgroundColor: "#fff",
                marginTop: 0,
                borderTopWidth: 0.5
              }}
            />
          </ScrollView>
        </View>
        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: pxToDp(100),
          backgroundColor: '#fff'
        }}>
          <View style={styles.switch}>
            <Text>跟单备注</Text>
            <Switch onValueChange={() => this.toggleTrackRemark()} value={this.state.trackRemark}/>
          </View>
          <MyBtn text='下单' onPress={() => this.submitOrder()} style={{
            height: pxToDp(100),
            textAlignVertical: 'center',
            textAlign: 'center',
            width: pxToDp(360),
            backgroundColor: colors.fontBlue,
            color: colors.white
          }}/>
        </View>
        <Loader loading={this.state.loading}/>
      </View>
    )
  }
}

const styles = {
  header_text: {
    height: pxToDp(100),
    backgroundColor: colors.white,
    textAlignVertical: 'center',
    paddingHorizontal: pxToDp(30),
    borderBottomColor: colors.fontBlack,
    borderBottomWidth: 0,
  },
  left_list: {
    width: '30%',
    height: '100%',
  },
  left_right: {
    width: '70%',
    height: (Dimensions.get("window").height) * 0.67,
  },
  item_left: {
    textAlign: 'center',
    backgroundColor: colors.white,
    marginRight: pxToDp(10),
    height: pxToDp(100),
    marginBottom: pxToDp(4),
    fontSize: 12,
    textAlignVertical: 'center',
    color: colors.fontGray,
  },
  item_right: {
    backgroundColor: colors.white,
  },
  switch: {
    width: pxToDp(360),
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center"
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(InvoicingShippingDetailScene)