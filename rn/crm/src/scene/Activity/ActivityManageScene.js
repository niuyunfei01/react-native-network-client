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
import ActivityDialog from './ActivityDialog'
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
import ImgBtn from "./imgBtn";

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

class ActivityManageScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage} = params;
    return {
      headerTitle: '活动加价管理',
      headerRight: (
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => params.toggle()}>
            <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Config.ROUTE_ACTIVITY_LIST)
                }}
            >
              <Image style={{width: pxToDp(42), height: pxToDp(42), marginHorizontal: pxToDp(30)}}
                     source={require('../../img/Activity/lishijilu_.png')}/>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Config.ROUTE_ACTIVITY_RULE)
                }}
            >
              <Image style={{width: pxToDp(42), height: pxToDp(42), marginHorizontal: pxToDp(30)}}
                     source={require('../../img/Activity/xinjian_.png')}/>
            </TouchableOpacity>
          </TouchableOpacity>
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      hide: false,
      vendorId: 0,
      showDialog: false,
      list: [{
        "price_rules": {
          "id": "1",
          "rule_name": "满49减20",
          "vendor_id": "1",
          "status": "1",
          "start_time": "2018-01-25 00:00:00",
          "end_time": "2018-01-26 00:00:00",
          "ext_store_id": [
            "1",
            "2",
            "3",
            "4",
            "5"
          ],
          "created": "2018-01-25 16:44:06",
          "updated": "2018-01-25 17:00:31"
        },
        "interval_rules": {
          "1": {
            "21": {
              "id": "21",
              "rule_id": "1",
              "type_id": "1",
              "status": "1",
              "categories": null,
              "min_price": "0",
              "max_price": "20",
              "percent": "120",
              "created": "2018-01-25 17:00:31",
              "updated": "2018-01-25 17:00:31"
            },
            "22": {
              "id": "22",
              "rule_id": "1",
              "type_id": "1",
              "status": "1",
              "categories": null,
              "min_price": "20",
              "max_price": "50",
              "percent": "130",
              "created": "2018-01-25 17:00:31",
              "updated": "2018-01-25 17:00:31"
            },
            "23": {
              "id": "23",
              "rule_id": "1",
              "type_id": "1",
              "status": "1",
              "categories": null,
              "min_price": "50",
              "max_price": "10000",
              "percent": "110",
              "created": "2018-01-25 17:00:31",
              "updated": "2018-01-25 17:00:31"
            }
          },
          "2": [{
            "categories": [
              "81898589",
              "81898625"
            ],
            "rules": {
              "24": {
                "id": "24",
                "rule_id": "1",
                "type_id": "2",
                "status": "1",
                "categories": "81898589,81898625",
                "min_price": "0",
                "max_price": "30",
                "percent": "123",
                "created": "2018-01-25 17:00:31",
                "updated": "2018-01-25 17:00:31"
              },
              "25": {
                "id": "25",
                "rule_id": "1",
                "type_id": "2",
                "status": "1",
                "categories": "81898589,81898625",
                "min_price": "30",
                "max_price": "10000",
                "percent": "111",
                "created": "2018-01-25 17:00:31",
                "updated": "2018-01-25 17:00:31"
              }
            }
          }]
        },
        "goods_rules": [{
          "id": "9",
          "rule_id": "1",
          "status": "1",
          "product_id": [
            "1121",
            "1122",
            "1123",
            "1124"
          ],
          "percent": "140",
          "created": "2018-01-25 17:00:31",
          "updated": "2018-01-25 17:00:31"
        }]
      }],
      title: '',
      operating: false,
      wait: false,
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

  renderOperatingList() {
    let {list} = this.state;
    return list.map((item, index) => {
      let {id} = item;
      return (
          <View style={manage.cells}>
            <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
              <CellHeader>
                <Text style={{fontSize: pxToDp(36), color: colors.main_color, fontWeight: '900'}}>满49减20</Text>
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
            <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]}
                  onPress={() => {
                    this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE)
                  }}
            >
              <Text style={manage.edit_btn}>修改</Text>
            </Cell>
            <View style={[manage.ball, manage.ball_left, manage.ball_main_color]}/>
            <View style={[manage.ball, manage.ball_right, manage.ball_main_color]}/>
            <View/>
          </View>
      )
    });

  }

  dialogToggle(title) {
    this.setState({
      showDialog: true,
      title: title
    })
  }

  render() {
    let {operating, wait} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView>
            <View style={{backgroundColor: '#a3d0ac', marginBottom: pxToDp(30)}}>
              <Cell customStyle={[style.cell, {backgroundColor: 'rgba(0,0,0,0)'}]} first={true}
                    onPress={() => {
                      this.setState({operating: !operating})
                    }}
              >
                <CellHeader style={{flexDirection: 'row'}}>
                  <Image source={require('../../img/Activity/yunxingzhong_.png')}
                         style={{height: pxToDp(40), width: pxToDp(40)}}/>
                  <Text style={style.cell_header_text_white}>运行中(2)</Text>
                </CellHeader>
                <Image style={operating ? [manage.down, {transform: [{rotate: '180deg'}]}] : [manage.down]}
                       source={require('../../img/Public/xiangxiabai_.png')}/>
              </Cell>
              {
                operating ?
                    <View style={manage.cells}>
                  <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
                    <CellHeader>
                      <Text style={{fontSize: pxToDp(36), color: colors.main_color, fontWeight: '900'}}>满49减20</Text>
                    </CellHeader>
                    <View>
                      <Text style={manage.cell_footer_text}>2017-01-18 <Text
                          style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                      <Text style={manage.cell_footer_text}>至2017-01-18 <Text
                          style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                    </View>
                  </Cell>
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('店铺(菜鸟食材)')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('通用加价规则')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('特殊分类规则')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('特殊商品规则')}>
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
                  <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]}
                        onPress={() => {
                          this.props.navigation.navigate(Config.ROUTE_ACTIVITY_RULE)
                        }}>
                    <Text style={manage.edit_btn}>修改</Text>
                  </Cell>
                  <View style={[manage.ball, manage.ball_left, manage.ball_main_color]}/>
                  <View style={[manage.ball, manage.ball_right, manage.ball_main_color]}/>
                  <View/>
                </View> : null
              }

            </View>

            <View style={{backgroundColor: '#f1c377', paddingBottom: pxToDp(30)}}>
              <Cell customStyle={[style.cell, {backgroundColor: 'rgba(0,0,0,0)'}]} first={true}
                    onPress={() => {
                      this.setState({wait: !wait})
                    }}
              >
                <CellHeader style={{flexDirection: 'row'}}>
                  <Image source={require('../../img/Activity/daizhixing_.png')}
                         style={{height: pxToDp(40), width: pxToDp(40)}}/>
                  <Text style={style.cell_header_text_white}>待执行(2)</Text>
                </CellHeader>
                <Image style={manage.down} source={require('../../img/Public/xiangxiabai_.png')}/>
              </Cell>
              {/**/}
              {
                wait ? <View style={manage.cells}>
                  <Cell customStyle={[style.cell, manage.cell, {height: pxToDp(120)}]} first={true}>
                    <CellHeader>
                      <Text style={{fontSize: pxToDp(36), color: colors.main_color, fontWeight: '900'}}>满49减20</Text>
                    </CellHeader>
                    <View>
                      <Text style={manage.cell_footer_text}>2017-01-18 <Text
                          style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                      <Text style={manage.cell_footer_text}>至2017-01-18 <Text
                          style={{paddingLeft: pxToDp(10)}}>06:00</Text></Text>
                    </View>
                  </Cell>
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('店铺(菜鸟食材)')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('通用加价规则')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('特殊分类规则')}>
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
                  <Cell customStyle={[style.cell, manage.cell]} onPress={() => this.dialogToggle('特殊商品规则')}>
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
                    <Text style={manage.edit_btn}>修改</Text>
                  </Cell>
                  <View style={[manage.ball, manage.ball_left, manage.ball_main_color]}/>
                  <View style={[manage.ball, manage.ball_right, manage.ball_main_color]}/>
                  <View/>
                </View> : null
              }
              {/**/}
            </View>
          </ScrollView>
          <ActivityDialog
              showDialog={this.state.showDialog}
              title={this.state.title}
              buttons={[{
                type: 'primary',
                label: '确定',
                onPress: () => {
                  this.setState({showDialog: false,});
                }
              }]}
          >
            <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
              <CellHeader>
                <Text>回龙观店(微信)</Text>
              </CellHeader>
            </Cell>
            <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}>
              <CellHeader>
                <Text>回龙观店(微信)</Text>
              </CellHeader>
            </Cell>
          </ActivityDialog>
        </View>
    )
  }
}

const manage = {
  cell_footer_text: {
    textAlign: 'right',
    color: colors.main_color,
  },
  cells: {
    marginHorizontal: pxToDp(30),
    position: 'relative',
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    marginBottom: pxToDp(20),
  },
  cell: {
    marginLeft: 0,
    paddingLeft: pxToDp(15),
    paddingRight: pxToDp(15),
    backgroundColor: 'rgba(0,0,0,0)'
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
    backgroundColor: '#a3d0ac',
  },
  ball_main_yellow: {
    backgroundColor: '#f1c377',
  },
  down: {
    height: pxToDp(22),
    width: pxToDp(40),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActivityManageScene)
