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
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchWorkers} from "../../reducers/mine/mineActions";
import Config from "../../config";
import Button from "react-native-vector-icons/Entypo";
import * as tool from "../../common/tool";
import LoadingView from "../../widget/LoadingView";
import NavigationItem from "../../widget/NavigationItem";
import HttpUtils from "../../util/http";
import { Tabs } from '@ant-design/react-native';
function mapStateToProps (state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchWorkers,
        ...globalActions
      },
      dispatch
    )
  };
}

// create a component
class StoreScene extends PureComponent {
  constructor (props) {
    super(props);
    const {navigation}=props;
    navigation.setOptions(
        {
          headerTitle: '店铺管理',
        }
    );
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

  getVendorStore() {
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);

    const api = `api/get_vendor_store_list_by_city/${currVendorId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(stores_by_city => {
      this.setState({
        cityList: Object.keys(stores_by_city),
        storeGroupByCity: stores_by_city,
        isRefreshing: false
      })
    }, (res) => {
      console.log("获取失败:", res.reason)
      this.setState({
        isRefreshing: false
      })
    })
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
      return (
        <Cells style={[styles.cells]} key={idx}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody style={styles.cell_body}>
              <View style={styles.store_city}><Text style={{fontSize: 12}}>{store.district}</Text></View>
              <Text style={[styles.store_name]}>{store.name}</Text>
              <Text style={{fontSize: 12, color: colors.orange}}>{store.s}</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                  _this.onPress(Config.ROUTE_STORE_ADD, {
                    btn_type: "edit",
                    currVendorId: currVendorId,
                    editStoreId: store.id,
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
        </Cells>
      );
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
          key={index} tabLabel={city.substring(0,3)}
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
        </ScrollView>
      )
    })
  }

  render () {
    let _this = this;
    const {cityList} = _this.state
    let tabCityList=[];
     cityList.map(function (city, index) {
       tabCityList.push({title:city});
    })


    console.log(tabCityList)
    return (
        <Tabs tabs={tabCityList}>
          {_this.renderScrollTabs()}
        </Tabs>
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
    fontSize: pxToDp(30),
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
