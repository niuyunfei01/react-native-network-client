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
import {fetchListVendorTags, fetchListVendorGoods} from '../../reducers/product/productActions.js';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast} from "../../weui/index";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchListVendorTags,
      fetchListVendorGoods,
      ...globalActions
    }, dispatch)
  }
}

class ActivityScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '创建活动价格',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [{
        content: [
          {
            lower: 0,
            upper: 5,
            percent: 100
          }
        ]
      }]
    }
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>选择品牌</Text></CellHeader>
                <CellFooter>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>

            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>活动加价名称</Text></CellHeader>
                <CellFooter>
                  <Text style={style.cell_footer_text}>如满49减20</Text>
                </CellFooter>
              </Cell>
              <Cell customStyle={style.cell} first={false}>
                <TouchableOpacity>
                  <Text style={style.time}>开始时间</Text>
                </TouchableOpacity>

                <Text style={[style.time, {marginLeft: pxToDp(40)}]}>结束时间</Text>
              </Cell>
              <Cell customStyle={style.cell}>
                <CellHeader><Text style={style.cell_header_text}>选择店铺</Text></CellHeader>
                <CellFooter>
                  <Text style={style.cell_footer_text}>已选(0)</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
            </Cells>

            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>基础加价比例设置</Text></CellHeader>
                <CellFooter>
                  <Image style={{height: pxToDp(42), width: pxToDp(42)}}
                         source={require('../../img/Activity/bianji_.png')}/>
                </CellFooter>
              </Cell>
              <Percentage/>
              <Percentage/>
              <Percentage/>
              <Percentage/>
              <Percentage/>
            </Cells>

            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊分类加价规则</Text></CellHeader>
                <CellFooter>
                  <Image style={{height: pxToDp(42), width: pxToDp(42)}}
                         source={require('../../img/Activity/xinjian_.png')}/>
                </CellFooter>
              </Cell>
              <Cell customStyle={style.cell}>
                <CellHeader><Text style={style.cell_header_text}>选择已选分类</Text></CellHeader>
                <CellFooter>
                  <Text style={style.cell_footer_text}>已选(0)</Text>
                  <Image
                      style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                      source={require('../../img/Public/xiangxia_.png')}
                  />
                </CellFooter>
              </Cell>
              <Percentage/>
              <Percentage/>
              <Percentage/>
              <Percentage/>
              <Percentage/>
            </Cells>
            <Cells style={style.cells}>
              <Cell customStyle={style.cell} first={true}>
                <CellHeader><Text style={style.cell_header_text}>特殊分类加价规则</Text></CellHeader>
                <CellFooter>
                  <Image style={{height: pxToDp(42), width: pxToDp(42)}}
                         source={require('../../img/Activity/xinjian_.png')}/>
                </CellFooter>
              </Cell>
            </Cells>
          </ScrollView>
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
              borderRadius:pxToDp(5),
            }} first={true}
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
        </View>
    )
  }
}

class Percentage extends PureComponent {
  render() {
    return (
        <Cell customStyle={style.cell} first={false}>
          <CellHeader><Text style={style.cell_header_text}>0元--5元</Text></CellHeader>
          <CellFooter>
            <Image style={style.operation} source={require('../../img/Activity/jianshao_.png')}/>
            <Text style={style.percentage_text}>100%</Text>
            <Image style={style.operation} source={require('../../img/Activity/zengjia_.png')}/>
          </CellFooter>
        </Cell>
    )
  }
}

const style = {
  cell: {
    backgroundColor: colors.white,
    height: pxToDp(100),
    marginLeft: 0,
    paddingLeft: pxToDp(40),
    justifyContent: 'space-between',
    borderTopColor: colors.main_back
  },
  cells: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  cell_header_text: {
    fontSize: pxToDp(30),
    color: colors.fontBlack,
  },
  cell_footer_text: {
    fontSize: pxToDp(30),
    color: colors.fontGray,
  },
  time: {
    flex: 1,
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray,
    borderRadius: pxToDp(5),
    height: pxToDp(65),
    textAlignVertical: 'center',
    paddingLeft: pxToDp(16),
  },
  operation: {
    height: pxToDp(50),
    width: pxToDp(50),
  },
  percentage_text: {
    height: pxToDp(56),
    width: pxToDp(126),
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray,
    borderRadius: pxToDp(5),
    color: colors.fontBlack,
    textAlignVertical: 'center',
    textAlign: 'center',
    marginHorizontal: pxToDp(40),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityScene)
