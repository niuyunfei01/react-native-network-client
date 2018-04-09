import React, {PureComponent} from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native'
import Conf from '../../config'
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellText} from "../../weui/index";
import Styles from './InvoicingStyles'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUnlocked} from "../../reducers/invoicing/invoicingActions";

function mapStateToProps(state) {
  const {invoicing, global} = state;
  return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUnlocked,
      ...globalActions
    }, dispatch)
  }
}

class InvoicingGatherScene extends PureComponent {
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

  componentWillReceiveProps() {
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
    dispatch(fetchUnlocked(currStoreId, token, function () {
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
      this.props.navigate(Conf.ROUTE_INVOICING_GATHER_DETAIL, {req: data});
    }
  }

  render() {
    let {invoicing} = this.props;
    let {unlockedList} = invoicing;
    let reqList = [];
    let _self = this;
    if (unlockedList) {
      reqList = unlockedList.map(function (item, idx) {
        return <Cell access customStyle={Styles.in_cell} key={idx}
                     onPress={() => _self.toDetailView(item)}>
          <CellHeader>
            <Text>{item['store_name']}</Text>
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
            {reqList.length > 0 ? reqList : <Cell>
              <CellBody><CellText>暂无数据</CellText></CellBody>
              <CellFooter>刷新试试</CellFooter>
            </Cell>}
          </Cells>
        </ScrollView>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingGatherScene)