//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';

import {NavigationActions} from "react-navigation";
import {color, NavigationItem} from '../../widget';

import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Icon
} from "../../weui/index";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '结算详情',
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            navigation.goBack();
          }}
      />),
      headerRight: (
          <View style={
            {
              flexDirection: 'row',
              paddingRight: pxToDp(30)
            }
          }>
            <TouchableOpacity
                onPress={() => {
                  params.upLoad();
                }}
            >
              {/* <Text style={{
                  fontSize: pxToDp(32),
                  color: '#59b26a'
                }}>保存</Text> */}
            </TouchableOpacity>
          </View>),
    }
  };

  constructor(props) {

    super(props)

  }


  render() {
    return (
        <View>
          <View style={header.box}>
            <View style = {header.title}>
              <Text style = {header.time}>2017-12-03</Text>

            </View>

          </View>

        </View>
    )
  }


}

const header = StyleSheet.create({
  box: {
    height: pxToDp(224),
    backgroundColor: '#fff',
  },
  title:{
    paddingVertical:pxToDp(30),
    alignItems:'center',
  },
  time: {
    fontSize:pxToDp(24),
    color:colors.fontGray
  }

})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
