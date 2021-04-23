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
  CheckboxCells,
  CellFooter,
} from "../../weui/index";
import {NavigationItem} from '../../widget';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchWmStores, saveExtStoreId} from '../../reducers/activity/activityAction';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Icon, Dialog} from "../../weui/index";
import style from './commonStyle'
import SelectBox from './SelectBox'
import BottomBtn from './ActivityBottomBtn'
import RenderEmpty from '../OperateProfit/RenderEmpty'
import ActivityAlert from './ActivityAlert'

function mapStateToProps(state) {
  const {mine, global, activity} = state;
  return {mine: mine, global: global, activity: activity}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchWmStores,
      saveExtStoreId,
      ...globalActions
    }, dispatch)
  }
}

class ActivitySelectStoreScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: '选择店铺',
      headerLeft: (
        <NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            params.confimBack()
          }}
        />
      ),
      headerRight: (
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => params.toggle()}>
          <Text style={{fontSize: pxToDp(30), color: colors.main_color}}>品牌</Text>
          <Image style={{width: pxToDp(80), height: pxToDp(80)}} source={require('../../img/Order/pull_down.png')}/>
        </TouchableOpacity>
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      storeList: [],
      checked: [],
      hide: false,
      vendorId: 0,
      platList: [
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,
      ],
      platId: [
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,],
      showDialog: false,
      ext_store_id: [],
      checkList: [],
      beforeList: [],
      listJson: {},
      query: true,
      confimBack: false,
    };
    this.identical = this.identical.bind(this);
  }

  async UNSAFE_componentWillMount() {
    let {platId} = this.state;
    let {navigation} = this.props;
    let {vendorId, ext_store_id} = navigation.state.params;
    await this.setState({
      vendorId: vendorId,
      ext_store_id: ext_store_id,
      beforeList: ext_store_id
    });
    let {storesList} = this.props.activity;
    if (tool.length(storesList[vendorId]) > 0) {
      this.setState({
        storeList: this.dataToCheck(storesList[vendorId]),
        checkList: this.getRenderArr(platId, storesList[vendorId], 0),
        listJson: this.getRenderArr(platId, storesList[vendorId], 1),
        query: false,
      });
    } else {
      this.getStoreList();
    }
    navigation.setParams({toggle: this.toggle});
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      confimBack: () => {
        this.identical() ? this.props.navigation.goBack() : this.setState({confimBack: true})
      }
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }

  onBackAndroid = () => {
    !this.identical() ? ToastLong('尚未保存数据') : '';
    return !this.identical()
  };
  toggle = () => {
    let {hide} = this.state;
    this.setState({hide: !hide})
  };

  identical() {
    let {beforeList, ext_store_id} = this.state;
    if (beforeList.sort().toString() == ext_store_id.sort().toString()) {
      return true
    } else {
      return false
    }
  }

  getStoreList() {
    const {vendorId, platId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchWmStores(vendorId, accessToken, (ok, desc, obj) => {
      if (ok) {
        this.setState({
          query: false,
          storeList: this.dataToCheck(obj),
          checkList: this.getRenderArr(platId, obj, 0),
          listJson: this.getRenderArr(platId, obj, 1),
        });
      } else {
        ToastLong(desc);
      }
    }, 1));
  }

  dataToCheck(arr) {
    arr.forEach((item) => {
      item.value = item.id;
      item.label = item.name;
    });
    return arr;
  }

  getRenderArr(platId = [], arr, type) {
    let json = {};
    let list = [];
    if (type) {
      arr.forEach((item) => {
        json[item.id] = `${item.name}(${item.price_ratio})`
      });
      return json;
    } else {
      arr.forEach((item) => {
        if (platId.indexOf(parseInt(item.platform)) >= 0) {
          item.label = `${item.name}(${item.price_ratio})`;
          list.push(item)
        }
      });
      console.log('list>>>', list)
      return list.sort((a, b) => {
        return a.platform - b.platform
      });
    }
  }

  getStoreIds() {
    let {ext_store_id, storeList} = this.state;
    let arr = [];
    try {
      ext_store_id.forEach((item) => {
        storeList.forEach((ite) => {
          if (item == ite.id && (ite && ite.store_id && arr.indexOf(ite.store_id) < 0)) {
            arr.push(ite.store_id)
          }
        })
      })
    } catch (e) {
      console.log(e)
    }
    return arr;
  }

  renderSelectBox() {
    let {hide, vendorId, platList, platId, storeList} = this.state;
    if (hide) {
      return (
        <SelectBox toggle={() => this.toggle()}>
          {
            platList.map((item, key) => {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={async () => {
                    if (platId.indexOf(item) < 0) {
                      this.setState({
                        platId: [item, ...platId],
                        checkList: this.getRenderArr([item, ...platId], storeList, 0)
                      })
                    } else {
                      platId.splice(platId.indexOf(item), 1);
                      await  this.setState({
                        checkList: this.getRenderArr(platId, storeList, 0)
                      });
                      this.forceUpdate()
                    }
                  }}
                >
                  <Text
                    style={platId.indexOf(item) >= 0 ? [select.select_item, select.select_item_active] : [select.select_item, select.select_item_cancel]}>
                    {tool.get_platform_name(item)}
                  </Text>
                </TouchableOpacity>
              )
            })
          }
          {
            platList.length % 3 === 2 ? <Text style={{width: pxToDp(172),}}/> : null
          }
        </SelectBox>
      )
    } else {
    }
    return null;
  }

  render() {
    let {checkList, ext_store_id, listJson} = this.state;
    return (
      <View style={{flex: 1, position: 'relative'}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                this.setState({query: true})
                this.getStoreList()
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
                <Text>已选店铺</Text>
              </CellHeader>
              <CellFooter>
                <Text> {this.state.ext_store_id.length}</Text>
                <Image
                  style={{alignItems: 'center', transform: [{scale: 0.6}, {rotate: '-90deg'}]}}
                  source={require('../../img/Public/xiangxia_.png')}
                />
              </CellFooter>
            </Cell>
          </Cells>
          {
            tool.length(checkList) ?
              <CheckboxCells
                options={checkList}
                value={this.state.ext_store_id}
                onChange={async (checked) => {
                  await this.setState({
                    ext_store_id: checked
                  });
                  this.identical()
                }}
                style={{marginLeft: 0, paddingLeft: 0, backgroundColor: "#fff"}}
              /> : <RenderEmpty/>
          }
        </ScrollView>
        {
          this.renderSelectBox()
        }
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
              ext_store_id.map((item, index) => {
                return (
                  <Cell customStyle={[style.cell, {paddingLeft: pxToDp(15), paddingRight: pxToDp(15)}]}
                        first={index == 0}
                        key={index}
                  >
                    <CellHeader>
                      <Text>{listJson[item]}</Text>
                    </CellHeader>
                    <TouchableOpacity
                      onPress={() => {
                        ext_store_id.splice(index, 1);
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
        <View>
          <BottomBtn onPress={() => {
            let {ext_store_id,} = this.state;
            let {nextSetBefore} = this.props.route.params;
            nextSetBefore('ext_store_id', ext_store_id);
            nextSetBefore('store_id', this.getStoreIds());
            nextSetBefore('goods_data', []);
            this.props.navigation.goBack();
          }}/>
        </View>
        <Toast
          icon="loading"
          show={this.state.query}
          onRequestClose={() => {
          }}
        >加载中</Toast>

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

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySelectStoreScene)
