import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  InteractionManager,
} from 'react-native';
import {NavigationActions} from "react-navigation";
import native from "../../common/native";
import pxToDp from "../../util/pxToDp";
export default class  GoodsScanSearchScene extends PureComponent{
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: (
          <View style={{
            flexDirection:'row',
            justifyContent:'center',
            width:pxToDp(600),
            height:'100%',
          }}>
            <TextInput style={{flex:1}}/>
            <TouchableOpacity>
              <Text>搜索</Text>
            </TouchableOpacity>
          </View>
      ),
    }
  };

  constructor(props){
    super(props)
  }
  render(){
return(
    <View>
      <Text>99999</Text>
    </View>
)
  }
}