import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
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
import Styles from './InvoicingStyles'
import font from './fontStyles'
import MyBtn from '../../common/MyBtn'
import tool from "../../common/tool";
import CheckboxCells from './check_box'

class InvoicingShippingDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: ('回龙观店'),
  });

  constructor(props) {
    super(props)
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <Text style={styles.header_text}>砂糖橘给我好的,你个坑比</Text>
          <View style={{flexDirection: 'row'}}>
            <ScrollView style={styles.left_list}>
              <Text style={styles.item_left}>总部(6)</Text>
              <Text style={[styles.item_left, font.fontBlue]}>总部(6)</Text>
            </ScrollView>
            <ScrollView style={styles.left_right}>
              <CheckboxCells
                  options={[
                    {label: 1, id: 1},
                    {label: 2, id: 2},
                    {label: 3, id: 3},
                    {label: 4, id: 4},
                    {label: 5, id: 5},
                    {label: 6, id: 6},
                  ]}
                  value={[{label: 2, id: 2}]}
                  onChange={(checked) => {
                  }}
                  style={{
                    marginLeft: 0,
                    paddingLeft: 0,
                    backgroundColor: "#fff",
                    marginTop: 0
                  }}
              />
            </ScrollView>
          </View>
          <View style={{
            flexDirection: 'row',
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: pxToDp(100),
            backgroundColor:'#fff'
          }}>
            <View style={styles.switch}>
              <Text>跟单备注</Text>
              <Switch/>
            </View>
            <MyBtn text='下单' style={{
              height:pxToDp(100),
              textAlignVertical:'center',
              textAlign:'center',
              width:pxToDp(360),
              backgroundColor:colors.fontBlue,
              color:colors.white
            }}/>
          </View>
        </View>
    )
  }
}

const styles = {
  header_text: {
    height: pxToDp(100),
    backgroundColor: colors.white,
    textAlignVertical: 'center',
    paddingHorizontal: pxToDp(30),
    borderBottomColor: colors.fontBlack,
    borderBottomWidth: pxToDp(1),
  },
  left_list: {
    width: '30%',
    height: '100%',
  },
  left_right: {
    width: '70%',
    height: '100%',
  },
  item_left: {
    textAlign: 'center',
    backgroundColor: colors.white,
    marginRight: pxToDp(10),
    height: pxToDp(100),
    marginBottom: pxToDp(4),
    textAlignVertical: 'center',
    color: colors.fontGray,
  },
  item_right: {
    backgroundColor: colors.white,
  },
  switch: {
    width: pxToDp(360),
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center"
  }
};


export default InvoicingShippingDetailScene