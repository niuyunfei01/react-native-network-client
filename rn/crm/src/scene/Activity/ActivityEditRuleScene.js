import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import DateTimePicker from 'react-native-modal-datetime-picker';

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast,Icon} from "../../weui/index";

function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class ActivityEditRuleScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '修改加价阶梯',
    };
  };

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <View style={style.edit_cell}>
              <Text style={style.start}>0元</Text>
              <Text style={style.zhi}>至</Text>
              <TextInput
                  style={style.style_input}
                  underlineColorAndroid='transparent'
                  value={'5'}

              />
              <Text style={[style.zhi,{width:pxToDp(70),textAlign:'center'}]}>元</Text>
              <View style={style.delete}>
                <Icon
                    name={'clear'}
                    size={pxToDp(40)}
                    style={{backgroundColor: '#fff'}}
                    color={'#d81e06'}
                    msg={false}
                />
              </View>
            </View>
          </ScrollView>
        </View>
    )
  }
}

const style = StyleSheet.create({
  edit_cell: {
    height: pxToDp(135),
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    flexDirection:'row',
    alignItems:'center',
    marginBottom:pxToDp(1),
  },
  start:{
    width:pxToDp(200),
    fontSize:pxToDp(32),
    color:colors.fontBlack,
  },
  zhi:{
    width:pxToDp(100),
  },
  style_input:{
    width:pxToDp(150),
    height:pxToDp(65),
    borderColor:colors.main_color,
    textAlign:'center',
    borderRadius:pxToDp(5),
    borderWidth:pxToDp(1),
  },
  delete:{
    width:pxToDp(140),
    alignItems:'center',
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(ActivityEditRuleScene)
