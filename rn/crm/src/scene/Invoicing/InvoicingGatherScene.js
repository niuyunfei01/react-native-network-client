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
class InvoicingScene extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: '进销存',
  });

  constructor(props) {
    super(props)
  }

  render() {
    return (
          <View>
            <Text>进销存</Text>
          </View>
    )
  }
}

export default InvoicingScene