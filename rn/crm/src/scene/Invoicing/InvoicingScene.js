import React, {PureComponent} from 'react';
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import colors from "../../styles/colors";
import InvoiceGather from './InvoicingGatherScene'
import InvoicingShipping from './InvoicingShippingScene'
import InvoicingOrderGoods from './InvoicingOrderGoodsScene'
import InvoicingReceipt from'./InvoicingReceiptScene'
class InvoicingScene extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: '进销存系统',
    headerStyle: {
      backgroundColor: colors.fontBlue,
    },
  });
  constructor(props) {
    super(props)
  }
  toDetail(router, params = {}) {
    this.props.navigation.navigate(router, params)
  }
  render() {
    return (
      <ScrollableTabView
          renderTabBar={() => <DefaultTabBar/>}>
        <InvoiceGather tabLabel='采集中' navigate = {(router,params)=>{
          this.toDetail(router,params)
        }}/>
        <InvoicingShipping tabLabel='调货单' navigate = {(router,params)=>{
          this.toDetail(router,params)
        }}/>
        <InvoicingOrderGoods tabLabel='订货单'/>
        <InvoicingReceipt tabLabel='已结算'/>
      </ScrollableTabView>
    )
  }
}

export default InvoicingScene