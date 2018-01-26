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

class ActivityListScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '活动加价历史'
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
      hide: false,
      vendorId: 0,
      platList: [
        Cts.WM_PLAT_ID_WX,
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,
      ],
      platId: Cts.WM_PLAT_ID_WX,
      showDialog: false,
      down: false
    }
  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setParams({toggle: this.toggle});
  }

  toggle = () => {
    let {hide} = this.state;
    this.setState({hide: !hide})
  };

  render() {
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <View style={manage.header}>
            <Cell customStyle={style.cell}>
              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65)}}
                  onPress={() => {
                    this.setState({dataPicker: true, timeKey: 'startTime'})
                  }}
              >
                <Text style={style.time}>开始时间</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={{flex: 1, height: pxToDp(65), marginLeft: pxToDp(20)}}
                  onPress={() => {
                    this.setState({dataPicker: true, timeKey: 'endTime'})
                  }}
              >
                <Text style={[style.time]}>结束时间</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={{
                    flex: 1,
                    height: pxToDp(65),
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: pxToDp(20),
                    justifyContent:'center',
                    borderWidth:pxToDp(1),
                    borderColor:colors.fontGray,
                    borderRadius: pxToDp(5),
                    backgroundColor:'#eee'
                  }}
              >
                <Text style={{borderWidth: 0,textAlign:'center'}}>菜鸟食材</Text>
                <Image style={[{width: pxToDp(28), height: pxToDp(18),marginLeft:pxToDp(8)}]}
                       source={this.state.down ? require('../../img/Public/xiangxialv_.png') : require('../../img/Public/xiangxialv_.png')}
                />
              </TouchableOpacity>
            </Cell>
          </View>
          <ScrollView>
            <View style={manage.cells}>
              <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
                <CellHeader>
                  <Text style={{fontSize: pxToDp(36), color: colors.fontBlack, fontWeight: '900'}}>满49减20</Text>
                </CellHeader>
                <View>
                  <Text style={manage.cell_footer_text}>2017-01-18 <Text
                      style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                  <Text style={manage.cell_footer_text}>至2017-01-18 <Text
                      style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                </View>
              </Cell>
              <Cell customStyle={[style.cell, manage.cell]}>
                <CellHeader>
                  <Text style={style.cell_header_text}>店铺(菜鸟食材)</Text>
                </CellHeader>
                <CellFooter>
                  <Text>美团回龙观等8家</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
              <Cell customStyle={[style.cell, manage.cell]}>
                <CellHeader>
                  <Text style={style.cell_header_text}>通用加价规则</Text>
                </CellHeader>
                <CellFooter>
                  <Text>0元-5元(160)等</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
              <Cell customStyle={[style.cell, manage.cell]}>
                <CellHeader>
                  <Text style={style.cell_header_text}>特殊分类规则</Text>
                </CellHeader>
                <CellFooter>
                  <Text>2组分类</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
              <Cell customStyle={[style.cell, manage.cell]}>
                <CellHeader>
                  <Text style={style.cell_header_text}>特殊商品规则</Text>
                </CellHeader>
                <CellFooter>
                  <Text>12组商品</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
              <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]}>
                <Text style={manage.edit_btn}>复制使用</Text>
              </Cell>
              <View/>
            </View>
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

const manage = {
  cell_footer_text: {
    textAlign: 'right',
  },
  cells: {
    position: 'relative',
    backgroundColor: colors.white,
    marginBottom: pxToDp(20),
  },
  cell: {
    marginLeft: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    paddingHorizontal: pxToDp(30),
  },
  edit_btn: {
    height: pxToDp(80),
    backgroundColor: colors.fontBlue,
    color: 'white',
    borderRadius: pxToDp(10),
    flex: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  ball: {
    height: pxToDp(22),
    width: pxToDp(22),
    position: 'absolute',
    borderRadius: pxToDp(11),
    top: pxToDp(109)
  },
  ball_left: {
    left: pxToDp(-9),
  },
  ball_right: {
    right: pxToDp(-11),
  },
  ball_main_color: {
    backgroundColor: colors.main_color,
  },
  ball_main_yellow: {
    backgroundColor: colors.fontOrange,
  },
  down: {
    height: pxToDp(22),
    width: pxToDp(40),
  },

}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityListScene)
