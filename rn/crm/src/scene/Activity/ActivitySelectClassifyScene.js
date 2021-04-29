import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellFooter,
} from "../../weui/index";
import CheckboxCells from './myChecks'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Dialog} from "../../weui/index";
import style from './commonStyle'
import {fetchListVendorTags} from "../../reducers/product/productActions";
import BottomBtn from './ActivityBottomBtn';
import {NavigationItem} from '../../widget';
import RenderEmpty from '../OperateProfit/RenderEmpty'
import ActivityAlert from './ActivityAlert'

function mapStateToProps(state) {
  const {mine, global, product} = state;
  return {mine: mine, global: global, product: product}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchListVendorTags,
      ...globalActions
    }, dispatch)
  }
}

class ActivitySelectClassifyScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    navigation.setOptions({
      headerTitle: '选择分类',
      headerLeft: () => (
          <NavigationItem
              icon={require('../../img/Register/back_.png')}
              iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
              onPress={() => {
                this.confimBack()
              }}
          />
      ),
    })
  };
  constructor(props) {
    super(props);
    this.state = {
      list: [],
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
      listJson: {},
      query: true,
      beforeList: [],
      confimBack: false,
    }
  }

  UNSAFE_componentWillMount() {
    let {categories, vendorId} = this.props.route.params;
    let {vendorTags} = this.props.product;
    if (tool.length(vendorTags[vendorId])>0) {
      this.setState({
        list: this.dataToCheck(vendorTags[vendorId]),
        query: false});
    }else {
      this.getListVendorTags()
    }
    this.setState({
      checked: categories,
      beforeList:categories,
    });
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
  }

  confimBack = ()=>{
    this.identical()?this.props.navigation.goBack():this.setState({confimBack:true})
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }
  onBackAndroid = () => {
    !this.identical() ? ToastLong('尚未保存数据') : '';
    return !this.identical()
  };
  identical() {
    let {beforeList, checked} = this.state;
    console.log(beforeList, checked);
    return beforeList.sort().toString() == checked.sort().toString()?true:false
  }
  async getListVendorTags() {
    const {vendorId} = this.props.route.params;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    this.setState({query: true});
    dispatch(fetchListVendorTags(vendorId, accessToken, (ok, desc, obj) => {
      if (ok) {
        this.setState({list: this.dataToCheck(obj), query: false});
      } else {
        ToastLong(desc);
      }
    }));
  }

  dataToCheck(obj) {
    obj.forEach((item, index) => {
      if (item.id == Cts.GOODS_CLASSIFY_ALL || item.id == Cts.GOODS_CLASSIFY_UNCLASSIFIED) {
        obj.splice(index, 1)
      }
    });
    return obj;
  }

  getClassName(key) {
    let {list} = this.state;
    let name = '';
    list.forEach((item) => {
      if (item.id == key) {
        name = item.name
      }
    });
    return name;
  }

  render() {
    let {checked, listJson} = this.state;
    return (
        <View style={{flex: 1, position: 'relative'}}>
          <ScrollView
              refreshControl={
                <RefreshControl
                    refreshing={this.state.query}
                    onRefresh={() => {
                      this.setState({query:true})
                      this.getListVendorTags()
                    }}
                    tintColor='gray'
                />
              }
          >
            <Cells style={style.cells}>
              <Cell customStyle={[style.cell, {paddingRight: pxToDp(10)}]}
                    onPress={() => {
                      this.setState({showDialog: true})
                    }}
              >
                <CellHeader>
                  <Text>已选分类</Text>
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
                options={this.state.list}
                values={this.state.checked}
                label={'name'}
                value={'id'}
                onChange={(checked) => {
                  this.setState({checked: checked})
                }}
                style={{marginLeft: 0, paddingLeft: 0, backgroundColor: "#fff"}}
            />
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
                    marginLeft: pxToDp(15),
                    marginRight: pxToDp(15),
                    height: pxToDp(800),
                    marginTop: 0
                  }}
          >
            <ScrollView style={{height: pxToDp(700),}}>
              {
                checked.map((item, index) => {
                  return (
                      <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}
                            first={index == 0}
                            key={index}
                      >
                        <CellHeader>
                          <Text>
                            {
                              this.getClassName(item)
                            }
                          </Text>
                        </CellHeader>
                        <TouchableOpacity
                            onPress={() => {
                              checked.splice(index, 1)
                              this.forceUpdate();
                            }}
                        >
                          <Text style={{
                            fontSize: pxToDp(30),
                            color: colors.white,
                            height: pxToDp(60),
                            backgroundColor: colors.main_color,
                            width: pxToDp(130),
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            borderRadius: pxToDp(5),
                          }}>移除</Text>
                        </TouchableOpacity>
                      </Cell>
                  )
                })
              }
            </ScrollView>
          </Dialog>
          <BottomBtn onPress={() => {
            let {specialRuleList, index} = this.props.route.params;
            specialRuleList[index].forEach((item) => {
              item.categories = this.state.checked;
            });
            this.props.route.params.nextSetBeforeCategories(specialRuleList);
            this.props.navigation.goBack();
          }}/>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
          <ActivityAlert
              showDialog={this.state.confimBack}
              buttons={[
                {
                  type: 'default',
                  label: '确认离开',
                  onPress: () => {
                    this.setState({confimBack: false,});
                    this.props.navigation.goBack()
                  }
                },
                {
                  type: 'primary',
                  label: '继续编辑',
                  onPress: () => {
                    this.setState({confimBack: false,});
                  }
                }
              ]}
          >
            <Text style={{marginTop: pxToDp(60), paddingHorizontal: pxToDp(30)}}>离开后,操作的内容不会被保存,确认要离开吗?</Text>
          </ActivityAlert>
        </View>
    )
  }
}

const select = StyleSheet.create({
  box: {
    flex: 1,
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,.4)',
    height: '100%',
  },
  items_box: {
    minHeight: pxToDp(60),
    backgroundColor: "#fff",
    paddingHorizontal: pxToDp(45),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: pxToDp(50),
    justifyContent: 'space-between',
    borderTopWidth: pxToDp(1)
  },
  select_item: {
    width: pxToDp(172),
    marginTop: pxToDp(48),
    height: pxToDp(55),
    textAlign: 'center',
    borderRadius: pxToDp(25),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    marginBottom: pxToDp(2)
  },
  select_item_active: {
    backgroundColor: colors.main_color,
    color: colors.white,
  },
  select_item_cancel: {
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectClassifyScene)
