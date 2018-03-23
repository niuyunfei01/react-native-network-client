import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Conf from '../../config'
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import Styles  from './InvoicingStyles'
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
            <ScrollView>
              <Cells>
                <Cell  access customStyle={Styles.in_cell}
                       onPress = {()=>{

                         this.props.navigate(Conf.ROUTE_INVOICING_GATHER_DETAIL,{})
                       }}>
                  <CellHeader>
                    <Text>回龙观店</Text>
                  </CellHeader>
                  <CellBody/>
                  <CellFooter>
                    26种商品
                  </CellFooter>
                </Cell>
              </Cells>
            </ScrollView>
          </View>
    )
  }
}

export default InvoicingScene