import React, {PureComponent} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import OrderComponent from './OrderComponent'

class InvoicingReceiptScene extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    return (
        <ScrollView>
          <View style={styles.select_box}>
            <View style={styles.select_item}>
              <Text style={styles.select_text}>选择门店</Text>
              <Image
                  style ={{alignItems:'center',transform:[{scale:0.7}]}}
                  source = {require('../../img/Public/xiangxia_.png')}
              />
            </View>
            <View style={styles.select_item}>
              <Text style={styles.select_text}>选择供应商</Text>
              <Image
                  style ={{alignItems:'center',transform:[{scale:0.7}]}}
                  source = {require('../../img/Public/xiangxia_.png')}
              />
            </View>
          </View>
          <View style={{marginTop:pxToDp(10)}}>
            <OrderComponent />
          </View>
        </ScrollView>
    )
  }
}

const styles = {
  select_box: {
    flexDirection: 'row',
    width:'100%',
    height:pxToDp(100),
    justifyContent:'space-between',
    backgroundColor:'#fff',
    paddingHorizontal:pxToDp(30),
    alignItems:'center',

  },
  select_item: {
    backgroundColor:colors.main_back,
    width:pxToDp(300),
    height:pxToDp(70),
    borderRadius:pxToDp(6),
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
  },
  select_text:{
    textAlign:'center',
    textAlignVertical:'center',
    height:pxToDp(70)
  }
}

export default InvoicingReceiptScene