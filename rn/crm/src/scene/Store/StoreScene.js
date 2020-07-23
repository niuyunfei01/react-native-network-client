//import liraries
import React, {PureComponent} from "react";
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {ActionSheet, Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchWorkers, getVendorStores} from "../../reducers/mine/mineActions";
import Config from "../../config";
import Button from "react-native-vector-icons/Entypo";
import * as tool from "../../common/tool";
import LoadingView from "../../widget/LoadingView";
import native from "../../common/native";

import ScrollableTabView, {ScrollableTabBar,} from 'react-native-scrollable-tab-view';
import NavigationItem from "../../widget/NavigationItem";

function mapStateToProps (state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        getVendorStores,
        fetchWorkers,
        ...globalActions
      },
      dispatch
    )
  };
}

// create a component
class StoreScene extends PureComponent {

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '店铺管理',
      headerLeft: (
          <NavigationItem
              icon={require('../../img/Public/back.png')}
              position={'left'}
              onPress={() =>{
                navigation.navigate('MineScene')
                tool.resetNavStack(navigation, Config.ROUTE_ALERT);
              }}
          />
      )
    }
  }
  constructor (props) {
    super(props);

    let {currVendorId, currVendorName} = tool.vendor(this.props.global);

    const {vendor_stores, user_list} = this.props.mine;
    let curr_user_list = tool.curr_vendor(user_list, currVendorId);

    this.state = {
      isRefreshing: false,
      showCallStore: false,
      storeTel: [],
      currVendorId: currVendorId,
      currVendorName: currVendorName,
      curr_user_list: curr_user_list,
      cityList: [],
      storeGroupByCity: []
    };

    this.getVendorStore = this.getVendorStore.bind(this);
    this.onSearchWorkers = this.onSearchWorkers.bind(this);
  }

  componentDidMount () {
    let {curr_user_list} = this.state;
    this.getVendorStore();
    if (tool.length(curr_user_list) === 0) {
      this.onSearchWorkers();
    }
  }

  getVendorStore () {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      getVendorStores(currVendorId, accessToken, resp => {
        if (resp.ok) {
          let stores = resp.obj;
          let storeGroupByCity = tool.storeListGroupByCity(stores)
          let cityList = Object.keys(storeGroupByCity)
          _this.setState({
            cityList,
            storeGroupByCity
          });
        }
        _this.setState({isRefreshing: false});
      })
    );
  }

  onSearchWorkers () {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      fetchWorkers(currVendorId, accessToken, resp => {
        if (resp.ok) {
          let {user_list} = resp.obj;
          _this.setState({
            curr_user_list: user_list
          });
        }
        _this.setState({isRefreshing: false});
      })
    );
  }

  onHeaderRefresh () {
    this.setState({isRefreshing: true});
    this.getVendorStore();
    this.onSearchWorkers();
  }

  onPress (route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  renderStores (stores) {
    let {curr_user_list, currVendorId} = this.state;
    if (tool.length(stores) === 0 || tool.length(curr_user_list) === 0) {
      return <LoadingView/>;
    }

    let _this = this;
    return stores.map(function (store, idx) {
      let {nickname} = curr_user_list[store.owner_id] || {};
      // let vice_mgr_name = store.vice_mgr > 0 ? (curr_user_list[store.vice_mgr] || {})['nickname'] : undefined;
      // let vice_mgr_tel = store.vice_mgr > 0 ? (curr_user_list[store.vice_mgr] || {})['mobilephone'] : undefined;

      let storeTel = [
        {tel: store.tel, desc: "门店"},
        {tel: store.mobile, desc: nickname}
      ];
      let vice_mgr_name = "";
      if (!!store.vice_mgr && store.vice_mgr !== "0") {
        for (let vice_mgr of store.vice_mgr.split(",")) {
          if (vice_mgr > 0) {
            let user_info = curr_user_list[vice_mgr] || {};
            if (!!user_info) {
              let mgr_name = user_info["name"] || user_info["nickname"];
              let mgr_tel = user_info["mobilephone"];
              if (vice_mgr_name !== "") {
                vice_mgr_name += ",";
              }
              storeTel.push({tel: mgr_tel, desc: mgr_name});
              vice_mgr_name += mgr_name;
            }
          }
        }
      }

      return (
        <Cells style={[styles.cells]} key={idx}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody style={styles.cell_body}>
              <View style={styles.store_city}><Text style={{fontSize: 12}}>{store.district}</Text></View>
              <Text style={[styles.store_name]}>{store.name}</Text>
              <Text style={[styles.open_time]}>
                {tool.storeTime(`2000-01-01 ${store.open_start}`)}-{tool.storeTime(
                `2000-01-01 ${store.open_end}`
              )}
              </Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                  _this.onPress(Config.ROUTE_STORE_ADD, {
                    btn_type: "edit",
                    currVendorId: currVendorId,
                    store_info: store,
                    actionBeforeBack: resp => {
                      console.log("edit resp =====> ", resp);
                      if (resp.shouldRefresh) {
                        console.log("edit getVendorStore");
                        _this.getVendorStore();
                      }
                    }
                  });
                }}
                style={styles.cell_right}
              >
                <Text style={styles.edit_text}>详情/修改</Text>
                <Button name="chevron-thin-right" style={styles.right_btn}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_content]}>
            <CellBody>
              <Text style={[styles.address]}>{store.dada_address}</Text>
              <View style={styles.store_footer}>
                <TouchableOpacity
                  onPress={() => {
                    /*let storeTel = [{tel: store.tel, desc: '门店'}, {tel: store.mobile, desc: nickname}];
                  if (!!vice_mgr_name && !!vice_mgr_tel) {
                    storeTel.push({tel: vice_mgr_tel, desc: vice_mgr_name});
                  }*/
                    _this.setState({
                      showCallStore: true,
                      storeTel: storeTel
                    });
                  }}
                >
                  <Image
                    style={[styles.call_img]}
                    source={require("../../img/Store/call_.png")}
                  />
                </TouchableOpacity>
                {!nickname ? null : (
                  <Text style={styles.owner_name}>店长: {nickname}</Text>
                )}
                {!vice_mgr_name ? null : (
                  <Text style={styles.owner_name} numberOfLines={1}>
                    店助: {vice_mgr_name}
                  </Text>
                )}
                <Text style={styles.remind_time}>
                  催单间隔: {store.call_not_print}分钟
                </Text>
              </View>
            </CellBody>
          </Cell>
        </Cells>
      );
    });
  }

  callStoreMenus () {
    return this.state.storeTel.map(store => {
      return {
        type: "default",
        label: store.desc + ": " + store.tel,
        onPress: () => {
          native.dialNumber(store.tel);
        }
      };
    });
  }

  renderScrollTabs () {
    let _this = this;
    const {cityList} = _this.state
    let {currVendorName, storeGroupByCity} = _this.state;
    return cityList.map(function (city, index) {
      const stores = storeGroupByCity[city]
      return (
        <ScrollView
          key={index} tabLabel={city}
          refreshControl={
            <RefreshControl
              refreshing={_this.state.isRefreshing}
              onRefresh={() => _this.onHeaderRefresh()}
              tintColor="gray"
            />
          }
        >
          <CellsTitle style={[styles.cell_title]}>新增门店</CellsTitle>
          <Cells style={[styles.cells]}>
            <Cell
              customStyle={[styles.cell_content, styles.cell_height]}
              onPress={() => {
                _this.onPress(Config.ROUTE_STORE_ADD, {
                  btn_type: "add",
                  actionBeforeBack: resp => {
                    if (resp.shouldRefresh) {
                      _this.getVendorStore();
                    }
                  }
                });
              }}
            >
              <CellHeader>
                <Image
                  style={[styles.add_img]}
                  source={require("../../img/Store/xinzeng_.png")}
                />
              </CellHeader>
              <CellBody>
                <TouchableOpacity
                  onPress={() => {
                    _this.onPress(Config.ROUTE_STORE_ADD, {
                      btn_type: "add",
                      actionBeforeBack: resp => {
                        if (resp.shouldRefresh) {
                          _this.getVendorStore();
                        }
                      }
                    });
                  }}
                >
                  <Text style={[styles.add_store]}>新增门店</Text>
                </TouchableOpacity>
              </CellBody>
              <CellFooter/>
            </Cell>
          </Cells>

          <CellsTitle style={[styles.cell_title]}>
            {currVendorName} 门店列表
          </CellsTitle>
          {_this.renderStores(stores)}

          <ActionSheet
            visible={_this.state.showCallStore}
            onRequestClose={() => {
              console.log("call_store_contacts action_sheet closed!");
            }}
            menus={_this.callStoreMenus()}
            actions={[
              {
                type: "default",
                label: "取消",
                onPress: () => {
                  _this.setState({showCallStore: false});
                }
              }
            ]}
          />
        </ScrollView>
      )
    })
  }

  render () {
    let _this = this;
    return (
      <ScrollableTabView
        locked={true}
        initialPage={0}
        tabBarUnderlineColor="#ee394b"
        tabBarActiveTextColor="#ee394b"
        tabBarInactiveTextColor={'#333333'}
        tabBarTextStyle={{paddingBottom: 0, fontSize: 13, marginTop: 0}}
        tabBarUnderlineStyle={{backgroundColor: '#ee394b', height: 1}}
        renderTabBar={() => <ScrollableTabBar
          tabPadding={18}
          underlineAlignText={false}
          tabsContainerStyle={styles.tabbarContainer}
          tabStyle={styles.tab}/>}
      >
        {_this.renderScrollTabs()}
      </ScrollableTabView>
    )
  }
}

// define your styles
const styles = StyleSheet.create({
  store_city: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  cell_title: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  },
  cells: {
    marginBottom: pxToDp(10),
    marginTop: 0,
    paddingLeft: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999
  },
  cell_body: {
    flexDirection: "row"
  },
  cell_height: {
    height: pxToDp(90)
  },
  cell_content: {
    justifyContent: "center",
    marginLeft: 0,
    paddingRight: 0

    // borderColor: 'green',
    // borderWidth: pxToDp(1),
  },
  add_img: {
    width: pxToDp(50),
    height: pxToDp(50),
    marginVertical: pxToDp(20)
  },
  add_store: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.color333
  },
  store_name: {
    fontSize: pxToDp(34),
    fontWeight: "bold",
    color: colors.color333
  },
  open_time: {
    marginLeft: pxToDp(12),
    fontSize: pxToDp(26),
    lineHeight: pxToDp(26),
    fontWeight: "bold",
    color: colors.color999,
    alignSelf: "center"
  },
  cell_right: {
    flexDirection: "row",
    justifyContent: "center"
  },
  edit_text: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    fontWeight: "bold",
    paddingTop: pxToDp(14)
  },
  right_btn: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    textAlign: "center",
    height: pxToDp(70),
    marginRight: pxToDp(30),
    marginLeft: pxToDp(5),
    paddingTop: pxToDp(20)
  },
  address: {
    marginTop: pxToDp(20),
    marginRight: pxToDp(30),
    fontSize: pxToDp(30),
    color: colors.color666,
    lineHeight: pxToDp(35)
  },
  store_footer: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(20),
    flexDirection: "row",
    marginRight: pxToDp(30)
  },
  call_img: {
    width: pxToDp(40),
    height: pxToDp(40)
  },
  owner_name: {
    marginHorizontal: pxToDp(15),
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.color333,
    alignSelf: "flex-end",
    maxWidth: pxToDp(220)
  },
  remind_time: {
    fontSize: pxToDp(26),
    color: colors.color999,
    position: "absolute",
    right: 0,
    bottom: 0
  },
  tabbarContainer: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#dddddd',
    backgroundColor: 'white',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 18,
    paddingRight: 18,
  }
});

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreScene);
