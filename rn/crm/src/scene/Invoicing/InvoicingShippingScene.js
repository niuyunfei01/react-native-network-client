import React, {PureComponent} from 'react';
import {ScrollView, Text, View, RefreshControl} from 'react-native'
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, CellHeader, Cells,} from "../../weui/index";
import Styles from './InvoicingStyles'
import font from './fontStyles'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchLocked} from "../../reducers/invoicing/invoicingActions";
import Conf from '../../config';

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
  static navigationOptions = ({navigation}) => ({
    headerTitle: '进销存',
  });

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      tapDisabled: false,
    }
  }

  componentWillMount() {
    this.reloadData()
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.reloadData();
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
      this.props.navigate(Conf.ROUTE_INVOICING_SHIPPING_DETAIL, {req: data});
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
          <CellHeader style={{justifyContent: 'center', height: pxToDp(180)}}>
            <Text style={[font.font30, font.fontBlack]}>{item['store_name']}</Text>
            <Text
              style={[font.font24, font.fontGray, {marginTop: pxToDp(10)}]}>{item['uid_confirm_name']} {item['time_confirm']}
              提交</Text>
            {item['remark'] ?
              <Text style={[font.font24, font.fontRed, {marginTop: pxToDp(10)}]}>备注: {item['remark']}</Text> : null}
          </CellHeader>
          <CellBody/>
          <CellFooter>
            {item['req_count']}种商品
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
          <Cells>
            {reqList}
          </Cells>
        </ScrollView>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingShippingScene)