import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {NavigationItem} from '../../widget';
import colors from "../../styles/colors";
import Config from '../../config'
import native from "../../common/native";
import pxToDp from "../../util/pxToDp";
import MyBtn from '../../common/myBtn'
export default class GoodsScanSearchScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: pxToDp(600),
            height: '100%',
            alignItems: 'center'
          }}>
            <TextInput
                underlineColorAndroid='transparent'
                onSubmitEditing={() => console.warn(6666666)}
                style={{
                  flex: 1,
                  borderRadius: pxToDp(90),
                  borderWidth: 0.7,
                  height: pxToDp(60),
                  borderColor: colors.main_color,
                }}

            />
            <TouchableOpacity onPress={() => console.log(6666)}>
              <Text style={{
                height: '100%',
                width: pxToDp(120),
                textAlign: 'center',
                textAlignVertical: 'center',
                color: colors.main_color,
              }}>搜索</Text>
            </TouchableOpacity>
          </View>
      ),
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            if (!!backPage) {
              native.nativeBack();
            } else {
              navigation.goBack();
            }
          }}
      />)
    }
  };

  constructor(props) {
    super(props)
  }

  render() {
    return (
        <View style={{flex: 1,backgroundColor:colors.main_back}}>
          <ScrollView style={{}}>
            <View style={{
              flexDirection:'row',
              paddingVertical:pxToDp(30),
              paddingHorizontal:pxToDp(30),
              backgroundColor:colors.white
            }}>
              <View
                  style={{
                    height:pxToDp(100),
                    backgroundColor:'#ccc',
                    width:pxToDp(100)
                  }}
              />
              <View style={{paddingLeft:pxToDp(10),justifyContent:'space-between'}}>
                <Text numberOfLines={2}  style={{height:pxToDp(70),fontSize:pxToDp(26)}}>商品好好说电话是多少啥都好说</Text>
                <Text style={{fontSize:pxToDp(20),color:colors.fontGray}}>UPC:73847398739737938</Text>
              </View>
            </View>
          </ScrollView>

          <MyBtn
              onPress = {()=>{
                this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT,{})
              }}
              style={[styles.btn,{backgroundColor:colors.main_color,color:colors.white}]}
              text={'直接上新'}/>
          <MyBtn
              onPress={()=>{
               this.props.navigation.goBack()
              }}
              style={[styles.btn,{color:colors.fontBlack,borderColor:colors.fontGray}]}
                  text={'重新扫码'}/>
        </View>
    )
  }
}

const styles = {
  btn:{
    height:pxToDp(90),
    width:'auto',
    textAlign:'center',
    textAlignVertical:'center',
    marginBottom:pxToDp(50),
    borderWidth:0.6,
    borderColor:colors.main_color,
    marginHorizontal:pxToDp(30),
    borderRadius:pxToDp(45)
  }
}