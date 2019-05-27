import React, {PureComponent} from 'react';
import {ScrollView, Text, View, RefreshControl} from 'react-native'
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellText} from "../../weui/index";
import Styles from './InvoicingStyles'
import font from './fontStyles'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchLocked, loadAllSuppliers, loadEnableSuppliers} from "../../reducers/invoicing/invoicingActions";
import Conf from '../../config';
import EmptyListView from "./EmptyListView";

function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchLocked,
      ...globalActions
    }, dispatch)
  }
}

class InvoicingShippingScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '调货单',
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      tapDisabled: false,
    }
  }

  componentWillMount() {
    this.reloadData();
    this.loadAllSuppliers();
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.reloadData();
  }

  loadAllSuppliers() {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    dispatch(loadAllSuppliers(token));
    dispatch(loadEnableSuppliers(token));
  }

  reloadData() {
    const {dispatch, global} = this.props;
    let token = global['accessToken'];
    let currStoreId = global['currStoreId'];
    let _this = this;
    dispatch(fetchLocked(currStoreId, token, function (ok, reason) {
      _this.setState({isRefreshing: false});
    }));
  }

  toDetailView(data) {
    let tapDisable = this.state.tapDisabled;
    if (!tapDisable) {
      this.setState({
        tapDisabled: true,
      });
      setTimeout(() => {
        this.setState({
          tapDisabled: false,
        });
      }, 3000);
      let {invoicing} = this.props;
      let {suppliers, enableSuppliers} = invoicing;
      this.props.navigate(Conf.ROUTE_INVOICING_SHIPPING_DETAIL, {req: data, suppliers: suppliers, enableSuppliers: enableSuppliers});
    }
  }

  render() {
    let {invoicing} = this.props;
    let {lockedList} = invoicing;
    let reqList = [];
    let _self = this;
    if (lockedList) {
      reqList = lockedList.map(function (item, idx) {
        return <Cell access customStyle={Styles.in_h_cell} onPress={() => {
          _self.toDetailView(item)
        }} key={idx}>
          <CellHeader style={{justifyContent: 'center', minHeight: pxToDp(180)}}>
            <Text style={[font.font30, font.fontBlack]}>{item['store_name']}</Text>
            <Text style={[font.font24, font.fontGray, {marginTop: pxToDp(10)}]}>{item['uid_confirm_name']} {item['time_confirm']} 提交</Text>
            {!!item['remark'] ? <View style={{flexDirection: 'row', flexWrap:'nowrap', width:pxToDp(350)}}>
                <View><Text style={[font.font24, font.fontBlack, {marginTop: pxToDp(10)}]}>备注:</Text></View>
                <View><Text style={[font.font24, font.fontRed, {marginTop: pxToDp(11), flexWrap: 'wrap'}]}> {item['remark'].replace(/\s/g, ",")}</Text></View>
                </View> :
              <Text style={[font.font24, {marginTop: pxToDp(10)}]}>无备注</Text>}
          </CellHeader>
          <CellBody/>
          <CellFooter>
            {item['req_count']} 种商品
          </CellFooter>
        </Cell>
      });
    }

    return (
      <View>
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }>
          {reqList.length > 0 ? <Cells>{reqList}</Cells> : <EmptyListView/>}
        </ScrollView>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingShippingScene)