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
    this.state = {
      checked: []
    }
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
            <Cell customStyle={[style.cell,styles.cell]}>
                <Image style={styles.img} source={{uri:"https://www.cainiaoshicai.cn/files/201606/thumb_m/59b6a4a5de8_0623.jpg"}}/>
              <CellBody style={{paddingHorizontal:pxToDp(20)}}>
                <Text numberOfLines={2} style={style.default_text}>数控技术担惊受恐红色经典哈萨克 回家时候定价说的就是</Text>
                <Text style={style.default_text}>#1313</Text>
              </CellBody>
              <Text style={style.text_btn}>添加</Text>
            </Cell>
          </ScrollView>
          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.showDialog}
                  title={'已选商品'}
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
                  }}
                  bodyStyle={{
                    borderRadius: pxToDp(10),
                    marginLeft: pxToDp(15),
                    marginRight: pxToDp(15),
                    height: pxToDp(800),
                    marginTop: 0
                  }}
          >
            <ScrollView style={{height: pxToDp(700),}}>
              <Cell customStyle={[style.cell,styles.cell,{borderBottomColor:'#d4d4d4',}]}>
                <Image style={styles.img} source={{uri:"https://www.cainiaoshicai.cn/files/201606/thumb_m/59b6a4a5de8_0623.jpg"}}/>
                <CellBody style={{paddingHorizontal:pxToDp(20)}}>
                  <Text numberOfLines={2} style={style.default_text}>数控技术担惊受恐红色经典哈萨克 回家时候定价说的就是</Text>
                  <Text style={style.default_text}>#1313</Text>
                </CellBody>
                <Text style={style.text_btn}>移除</Text>
              </Cell>
            </ScrollView>
          </Dialog>
        </View>
    )
  }
}

const styles = {
  input_text: {
    borderWidth: pxToDp(2),
    borderColor: colors.main_color,
    marginVertical:pxToDp(30),
    marginHorizontal:pxToDp(30),
    borderRadius:pxToDp(5),
  },
  img:{
    height:pxToDp(90),
    width:pxToDp(90),
  },
  cell:{
    borderBottomWidth:pxToDp(1),
    height:pxToDp(150),
    backgroundColor:'transparent',
    borderBottomColor:'#999999',
    paddingLeft:0,
    paddingRight:0,
    marginHorizontal:pxToDp(30),
    marginLeft:pxToDp(30),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectGoodScene)
