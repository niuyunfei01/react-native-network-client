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
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
// import InvoiceGather from 'InvoicingGatherScene'
class InvoicingScene extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: '进销存',
    headerTitleColor: colors.fontBlue
  });

  constructor(props) {
    super(props)
  }

  render() {
    return (
          <ScrollableTabView
              renderTabBar={() => <DefaultTabBar/>}>
            <Text tabLabel='Tab1'>Tab1</Text>
            <Text tabLabel='Tab2'>Tab2</Text>
          </ScrollableTabView>
    )
  }
}

export default InvoicingScene