import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import tool from "../../common/tool";

const BottomBtn = (props)=>{
 return(
     <View style={{
       height: pxToDp(120),
       paddingHorizontal: pxToDp(30),
       alignItems: 'center',
       justifyContent: 'center'
     }}>
       <Cell customStyle={{
         marginLeft: 0,
         justifyContent: 'center',
         backgroundColor: colors.main_color,
         alignItems: 'center',
         borderRadius: pxToDp(5),
       }} first={true}
             onPress={()=>{
               props.onPress()
             }}
       >
         <Text style={{
           fontSize: pxToDp(32),
           color: colors.white,
           textAlign: 'center',
           width: '100%',
           textAlignVertical: 'center',
           height: pxToDp(80),
         }}>保存</Text>
       </Cell>
     </View>
 )
  }

  export default BottomBtn
