import React, {PureComponent} from 'react';
//import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import colors from "../../styles/colors";
import InvoicingGatherScene from './InvoicingGatherScene'
import InvoicingShippingScene from './InvoicingShippingScene'
import InvoicingOrderGoodsScene from './InvoicingOrderGoodsScene'
import InvoicingReceiptScene from './InvoicingReceiptScene'
import {NavigationItem} from '../../widget'
import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import native from "../../common/native";



function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class InvoicingScene extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: '进销存系统',
    headerStyle: {
      backgroundColor: colors.fontBlue,
    },
    headerRight: (
      <NavigationItem
        iconStyle={{tintColor: colors.white,}}
        icon={require('../../img/Order/print_white.png')}
        position={'right'}
        onPress={() => {
          native.printSupplierSummaryOrder()
        }}
      />),
  });

  constructor(props) {
    super(props)
    this.state = {
      initPage: 0
    }
  }

  UNSAFE_componentWillMount() {
    const {navigation} = this.props;
    const {initPage} = (navigation.state.params || {});
    if(initPage){
      this.setState({initPage: initPage})
    }
  }

  toDetail(router, params = {}) {
    this.props.navigation.navigate(router, params)
  }

  render() {
    // return (
    //   // <ScrollableTabView locked={true}
    //   //   renderTabBar={() => <DefaultTabBar/>} initialPage={this.state.initPage} page={this.state.initPage}>
    //   //   <InvoicingGatherScene tabLabel='采集中' navigate={(router, params) => {
    //   //     this.toDetail(router, params)
    //   //   }}/>
    //   //   <InvoicingShippingScene tabLabel='调货单' navigate={(router, params) => {
    //   //     this.toDetail(router, params)
    //   //   }}/>
    //   //   <InvoicingOrderGoodsScene tabLabel='订货单'/>
    //   //   <InvoicingReceiptScene tabLabel='已结算'/>
    //   // </ScrollableTabView>
    // )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingScene)