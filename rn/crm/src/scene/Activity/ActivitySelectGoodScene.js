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

import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Dialog} from "../../weui/index";
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

class ActivitySelectGoodScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '选择商品',
    }
  };

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setParams({toggle: this.toggle});
  }


  render() {
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView>
            <Cells style={style.cells}>
              <Cell customStyle={[style.cell, {paddingRight: pxToDp(10)}]}
                    onPress={() => {
                      this.setState({showDialog: true})
                    }}
              >
                <CellHeader>
                  <Text>已选商品</Text>
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
            <Cell>
              <TextInput
                  placeholder='输入商品名称模糊搜索'
                  underlineColorAndroid='transparent'
                  style={[styles.input_text]}
                  placeholderTextColor={"#7A7A7A"}
                  keyboardType='numeric'
                  value={this.state.price}
                  onChangeText={(text) => {
                    this.setState({price: text})
                  }}
              />
            </Cell>
          </ScrollView>
          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.showDialog}
                  title={'已选店铺'}
                  titleStyle={{textAlign: 'center', color: colors.fontBlack}}
                  headerStyle={{
                    backgroundColor: colors.main_back,
                    paddingTop: pxToDp(20),
                    justifyContent: 'center',
                    paddingBottom: pxToDp(20),
                  }}
                  buttons={[{
                    type: 'primary',
                    label: '确定',
                    onPress: () => {
                      this.setState({showDialog: false,});
                    }
                  }]}
                  footerStyle={{
                    borderTopWidth: pxToDp(1),
                    borderTopColor: colors.fontGray,
                  }}
                  bodyStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.fontGray,
                    marginLeft: pxToDp(15),
                    marginRight: pxToDp(15),
                    height: pxToDp(800),
                    marginTop: 0
                  }}
          >
            <ScrollView style={{height: pxToDp(700),}}>
              <Cell customStyle={[style.cell]}>
                <CellHeader>
                  <Text>回龙观店(微信)</Text>
                </CellHeader>
                <TouchableOpacity>
                  <Text style={{
                    fontSize: pxToDp(30),
                    color: colors.white,
                    height: pxToDp(60),
                    backgroundColor: colors.main_color,
                  }}>移除</Text>
                </TouchableOpacity>
              </Cell>
            </ScrollView>
          </Dialog>
        </View>
    )
  }
}

const styles={
  input_text:{

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectGoodScene)
