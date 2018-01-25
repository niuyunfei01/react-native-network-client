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
  CheckboxCells,
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
import {Toast, Icon} from "../../weui/index";
import native from "../../common/native";
import style from './commonStyle'
import SelectBox from './SelectBox'

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

class ActivitySelectStoreScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '选择店铺',
      headerRight: (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: pxToDp(30), color: colors.main_color}}>微信</Text>
            <Image style={{width: pxToDp(80), height: pxToDp(80)}} source={require('../../img/Order/pull_down.png')}/>
          </View>
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      storeList: [
        {value: 1, label: '大娃哈哈哈'},
        {value: 2, label: '二娃哈哈哈'},
        {value: 3, label: '三娃娃哈哈哈'},
        {value: 4, label: '四娃哈哈哈'},
        {value: 5, label: '五娃哈哈哈'},

      ],
      checked: [],
      hide: true,
      vendorId:0
    }
  }

  renderSelectBox() {
    let {hide,vendorId} = this.state;
    if(hide){
      return <SelectBox/>
    }else {}
    return null;
  }

  render() {
    return (
        <View style={{flex: 1,position:'relative'}}>
          <ScrollView>
            <Cells style={style.cells}>
              <Cell customStyle={[style.cell, {paddingRight: pxToDp(10)}]}>
                <CellHeader>
                  <Text>已选店铺</Text>
                </CellHeader>
                <CellFooter>
                  <Text> {this.state.checked.length}</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>
            <CheckboxCells
                options={this.state.storeList}
                value={this.state.checked}
                onChange={(checked) => {
                  console.log(checked);
                  this.setState({checked: checked})
                }}
                style={{marginLeft: 0, paddingLeft: 0, backgroundColor: "#fff"}}
            />
          </ScrollView>
          {
            this.renderSelectBox()
          }
        </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectStoreScene)
