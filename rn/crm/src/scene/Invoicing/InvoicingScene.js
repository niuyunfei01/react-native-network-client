import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import colors from "../../styles/colors";
import InvoiceGather from './InvoicingGatherScene'
import InvoicingShipping from './InvoicingShippingScene'
import InvoicingOrderGoods from './InvoicingOrderGoodsScene'
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

  render() {
    return (
          <ScrollableTabView
              renderTabBar={() => <DefaultTabBar/>}>
            <InvoiceGather tabLabel='采集中'/>
            <InvoicingShipping tabLabel='调货单'/>
            <InvoicingOrderGoods tabLabel='订货单'/>
            <Text tabLabel='收货单'>Tab2</Text>
          </ScrollableTabView>
    )
  }
}


export default InvoicingScene