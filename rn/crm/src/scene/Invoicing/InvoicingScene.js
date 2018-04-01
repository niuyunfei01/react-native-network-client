import React, {PureComponent} from 'react';
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import colors from "../../styles/colors";
import InvoicingGatherScene from './InvoicingGatherScene'
import InvoicingShippingScene from './InvoicingShippingScene'
import InvoicingOrderGoodsScene from './InvoicingOrderGoodsScene'
import InvoicingReceiptScene from './InvoicingReceiptScene'

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
        <InvoicingGatherScene tabLabel='采集中' navigate={(router, params) => {
          this.toDetail(router, params)
        }}/>
        <InvoicingShippingScene tabLabel='调货单' navigate={(router, params) => {
          this.toDetail(router, params)
        }}/>
        <InvoicingOrderGoodsScene tabLabel='订货单'/>
        <InvoicingReceiptScene tabLabel='已结算'/>
      </ScrollableTabView>
    )
  }
}

export default InvoicingScene