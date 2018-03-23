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
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
} from "../../weui/index";
import Styles  from './InvoicingStyles'
import  font from  './fontStyles'
import Config from '../../config'
class InvoicingShipping extends PureComponent {
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
                <Cell  access customStyle={Styles.in_h_cell} onPress={()=>{
                  this.props.navigate(Config.ROUTE_INVOICING_SHIPPING_DETAIL)
                }}>
                  <CellHeader style={{justifyContent:'center',height:pxToDp(180)}}>
                    <Text style={[font.font30,font.fontBlack]} >回龙观店</Text>
                    <Text style={[font.font24,font.fontGray,{marginTop:pxToDp(10)}]} >朱春浩 2018-03-09 19:30:31 提交</Text>
                    <Text style={[font.font24,font.fontRed,{marginTop:pxToDp(10)}]} >备注: 10000 个袋子</Text>
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

export default InvoicingShipping