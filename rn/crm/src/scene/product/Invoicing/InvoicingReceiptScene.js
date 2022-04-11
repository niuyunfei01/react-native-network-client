import React, {PureComponent} from 'react';
import {Text, View} from 'react-native'
import colors from "../../../pubilc/styles/colors";
import OrderComponent from './OrderComponent'
import {connect} from "react-redux";
import * as globalActions from '../../../reducers/global/globalActions';
import ModalSelector from 'react-native-modal-selector'
import Loadmore from 'react-native-loadmore'
import FetchEx from "../../../pubilc/util/fetchEx";
import AppConfig from "../../../pubilc/common/config";

import pxToDp from "../../../pubilc/util/pxToDp";
import {bindActionCreators} from "redux";
import {fetchSupplyBalancedOrder, loadAllStores, loadAllSuppliers} from "../../../reducers/invoicing/invoicingActions";
import _ from 'lodash'
import EmptyListView from "./EmptyListView";
import Entypo from "react-native-vector-icons/Entypo";


function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchSupplyBalancedOrder,
      ...globalActions
    }, dispatch)
  }
}

class InvoicingReceiptScene extends PureComponent {

  constructor(props) {
    super(props);
    this.renderItems = this.renderItems.bind(this);
    this.chooseStore = this.chooseStore.bind(this);
    this.chooseSupplier = this.chooseSupplier.bind(this);
    this.state = {
      checkedStoreId: 0,
      checkedStoreName: '全部门店',
      checkedSupplierId: 0,
      checkedSupplierName: '全部供货商',
      dataSource: [],
      pageNum: 1,
      pageSize: 5,
      isLastPage: false
    };
  }

  componentDidMount() {
    this.loadAllSuppliers();
    this.loadAllStores();
    this.fetchData()
  }

  loadAllSuppliers() {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    dispatch(loadAllSuppliers(token));
  }

  loadAllStores() {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    dispatch(loadAllStores(token));
  }

  fetchData(options = {}) {
    let self = this
    const {global} = this.props
    const {pageNum, pageSize, dataSource, checkedStoreId, checkedSupplierId} = this.state
    let token = global['accessToken']
    let store_id = checkedStoreId ? checkedStoreId : global['currStoreId']
    const url = `InventoryApi/list_balance_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {
      store_id: store_id,
      supplier_ids: checkedSupplierId,
      page: options.pageNum ? options.pageNum : pageNum,
      page_size: pageSize
    })).then(resp => resp.json()).then(resp => {
      let {ok, reason, obj, error_code} = resp;
      if (ok) {
        let next_page = 0
        let isLastPage = false
        const data_list = obj.data
        let data = obj.currPage == 1 ? [] : dataSource
        if (obj.currPage !== obj.totalPage) {
          next_page = obj.currPage + 1;
        } else {
          isLastPage = true
        }
        if (data_list.length > 0) {
          data_list.forEach(item => {
            if (item.data.length > 0) {
              data = data.concat(item.data)
            }
          })
        }
        self.setState({pageNum: next_page, dataSource: data, isLastPage})
      }
    })
  }

  renderItems(suppliersMap) {
    let {dataSource} = this.state;
    let views = [];
    let counter = 0;
    let checkedSupplierId = this.state.checkedSupplierId
    dataSource.forEach(order => {
      let supplierId = order['supplier_id'];
      if (checkedSupplierId == 0 || supplierId == checkedSupplierId) {
        let supplier = suppliersMap[supplierId];
        views.push(
            <View style={{marginVertical: 5}} key={counter}>
              <OrderComponent data={order} idx={counter} supplier={supplier}/>
            </View>
        );
        counter += 1;
      }
    })
    return views.length > 0 ? views : <EmptyListView/>;
  }

  chooseStore(option) {
    this.setState({
      checkedStoreId: option.key,
      checkedStoreName: option.label,
    })
  }

  chooseSupplier(option) {
    this.setState({
      checkedSupplierId: option.key,
      checkedSupplierName: option.label
    })
  }

  render() {
    let {invoicing} = this.props;
    let {suppliers, stores} = invoicing;
    let suppliersMap = _.keyBy(suppliers, function (item) {
      return item['id'];
    });
    let storeLabels = _.map(stores, function (item) {
      return {key: item.id, label: item.name}
    });
    let supplierLabels = _.map(suppliers, function (item) {
      return {key: item.id, label: item.name}
    });
    storeLabels.unshift({key: 0, label: '全部门店'});
    supplierLabels.unshift({key: 0, label: '全部供货商'});
    return (
        <View>
          <View style={styles.select_box}>
            <ModalSelector
                cancelText={'取消'}
                data={storeLabels}
                keyExtractor={item => item.key}
                labelExtractor={item => item.label}
                onChange={(option) => this.chooseStore(option)}>
              <View style={styles.select_item}>
                <Text style={styles.select_text}>{this.state.checkedStoreName} </Text>

                <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5}}/>
              </View>
            </ModalSelector>
            <ModalSelector
                cancelText={'取消'}
                data={supplierLabels}
                keyExtractor={item => item.key}
                labelExtractor={item => item.label}
                onChange={(option) => this.chooseSupplier(option)}>
              <View style={styles.select_item}>
                <Text style={styles.select_text}>{this.state.checkedSupplierName} </Text>
                <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5}}/>
              </View>
            </ModalSelector>
          </View>

          <View style={{paddingBottom: 100}}>
            <Loadmore
                loadMoreType={'scroll'}
                renderList={this.renderItems(suppliersMap)}
                onLoadMore={() => {
                  this.fetchData()
                }}
                onRefresh={() => {
                  this.fetchData({pageNum: 1})
                }}
                isLastPage={false}
            />
          </View>
        </View>
    )
  }
}

const styles = {
  select_box: {
    flexDirection: 'row',
    width: '100%',
    height: pxToDp(100),
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: pxToDp(30),
    alignItems: 'center',

  },
  select_item: {
    backgroundColor: colors.main_back,
    width: pxToDp(300),
    height: pxToDp(70),
    borderRadius: pxToDp(6),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  select_text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: pxToDp(70)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingReceiptScene)
