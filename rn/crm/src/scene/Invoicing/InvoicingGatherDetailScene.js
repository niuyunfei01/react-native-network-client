import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TextInput,
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
import Styles from './InvoicingStyles'
import TextArea from "../../weui/Form/TextArea";
import MyBtn from '../../common/myBtn'
class InvoicingGatherDetail extends PureComponent {
  static navigationOptions = ({navigation}) => ({
    headerTitle: (<Text style={{color: colors.white}}>回龙观店</Text>),
    headerStyle: {
      backgroundColor: colors.fontBlue,
      color: colors.white
    },
  });

  constructor(props) {
    super(props)
  }

  render() {
    return (
        <View style={{flex:1}}>
          <ScrollView>
            <TextInput
                underlineColorAndroid='transparent'
                style={{backgroundColor: colors.white, height: pxToDp(200)}}
                placeholder='输入备注信息'
                placeholderTextColor='#ccc'
            />
            <Cell customStyle={{
              marginLeft: pxToDp(0),
              paddingHorizontal: pxToDp(30)
            }}>
              <CellHeader style={{width: pxToDp(300)}}>
                <Text>商品名</Text>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <Text style={{width: pxToDp(100), textAlign: 'center'}}>分数</Text>
                <Text style={{width: pxToDp(200), textAlign: 'center'}}>总量</Text>
              </CellFooter>
            </Cell>
            <Cells>
              <Cell customStyle={{
                marginLeft: pxToDp(0),
                paddingHorizontal: pxToDp(30),
                minHeight: pxToDp(100),
              }}>
                <CellHeader style={{width: pxToDp(300)}}>
                  <Text>身高多少较好的归属感是多少</Text>
                </CellHeader>
                <CellBody/>
                <CellFooter>
                  <Text style={{width: pxToDp(100), textAlign: 'center'}}>3</Text>
                  <View style={{
                    width: pxToDp(200),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={{
                          backgroundColor: colors.white,
                          height: pxToDp(70), width: pxToDp(110),
                        }}
                        placeholder='输入'
                        placeholderTextColor='#ccc'
                    />
                    <Text>斤</Text>
                  </View>
                </CellFooter>
              </Cell>
            </Cells>
          </ScrollView>
          <View style={{flexDirection: 'row',position:'absolute',width:'100%',bottom:0,left:0,backgroundColor:colors.white}}>
           <View style={{width:'100%',flexDirection:'row'}}>
             <MyBtn text = '打印'  style={{ width:'25%',justifyContent:"center"}} />
             <MyBtn text = '订货'  style={{ width:'25%',justifyContent:"center"}} />
             <MyBtn text = '提交'  style={{ width:'50%',justifyContent:"center"}} />
           </View>
          </View>
        </View>
    )
  }
}

export default InvoicingGatherDetail