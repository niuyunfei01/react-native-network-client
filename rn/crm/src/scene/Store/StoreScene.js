//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {
  Cells,
  CellsTitle,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  ActionSheet,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchWorkers, getVendorStores} from "../../reducers/mine/mineActions";
import {ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import * as tool from "../../common/tool";
import LoadingView from "../../widget/LoadingView";
import CallBtn from "../Order/CallBtn";
import native from "../../common/native";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getVendorStores,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

// create a component
class StoreScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>店铺管理</Text>
        </View>
      ),
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    let {currVendorId, currVendorName} = tool.vendor(this.props.global);

    const {vendor_stores, user_list} = this.props.mine;
    let curr_stores = tool.curr_vendor(vendor_stores, currVendorId);
    let curr_user_list = tool.curr_vendor(user_list, currVendorId);

    this.state = {
      isRefreshing: false,
      showCallStore: false,
      storeTel: [],

      currVendorId: currVendorId,
      currVendorName: currVendorName,

      curr_stores: Object.values(curr_stores),
      curr_user_list: curr_user_list,
    };

    this.getVendorStore = this.getVendorStore.bind(this);
    this.onSearchWorkers = this.onSearchWorkers.bind(this);
  }

  componentDidMount() {
    let {curr_stores, curr_user_list} = this.state;
    if (tool.length(curr_stores) === 0 || tool.length(curr_user_list) === 0) {
      this.getVendorStore();
      this.onSearchWorkers();
    }
  }

  getVendorStore() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(getVendorStores(currVendorId, accessToken, (resp) => {
      console.log('store resp -> ', resp.ok, resp.desc);
      if (resp.ok) {
        let curr_stores = resp.obj;
        _this.setState({
          isRefreshing: false,
          curr_stores: Object.values(curr_stores),
        });
        if (_this.state.isRefreshing) {
          ToastShort('刷新门店列表完成');
        }
      }
    }));
  }

  onSearchWorkers() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(fetchWorkers(currVendorId, accessToken, (resp) => {
      console.log('user resp -> ', resp.ok, resp.desc);
      if (resp.ok) {
        let {user_list} = resp.obj;
        _this.setState({
          isRefreshing: false,
          curr_user_list: user_list,
        });
        if (_this.state.isRefreshing) {
          ToastShort('刷新员工完成');
        }
      }
    }));
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getVendorStore();
    this.onSearchWorkers();
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  renderStores() {
    let {curr_stores, curr_user_list, currVendorId} = this.state;
    if (tool.length(curr_stores) === 0 || tool.length(curr_user_list) === 0) {
      return <LoadingView/>;
    }

    let _this = this;
    console.log(curr_stores);
    return curr_stores.map(function (store, idx) {
      let {nickname} = (curr_user_list[store.owner_id] || {});
      let vice_mgr_name = store.vice_mgr > 0 ? (curr_user_list[store.vice_mgr] || {})['nickname'] : undefined;
      let vice_mgr_tel = store.vice_mgr > 0 ? (curr_user_list[store.vice_mgr] || {})['mobilephone'] : undefined;
      return (
        <Cells style={[styles.cells]} key={idx}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody style={styles.cell_body}>
              <Text style={[styles.store_name]}>{store.name}</Text>
              <Text style={[styles.open_time]}>{store.open_start}-{store.open_end}</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                  _this.onPress(Config.ROUTE_STORE_ADD, {
                    btn_type: 'edit',
                    currVendorId: currVendorId,
                    store_info: store,
                    actionBeforeBack: (resp) => {
                      console.log('edit resp =====> ', resp);
                      if (resp.shouldRefresh) {
                        console.log('edit getVendorStore');
                        _this.getVendorStore();
                      }
                    }
                  })
                }}
                style={styles.cell_right}
              >
                <Text style={styles.edit_text}>详情/修改</Text>
                <Button name='chevron-thin-right' style={styles.right_btn}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_content]}>
            <CellBody>
              <Text style={[styles.address]}>{store.dada_address}</Text>
              <View style={styles.store_footer}>
                <TouchableOpacity onPress={() => {
                  let storeTel = [{tel: store.tel, desc: '门店'}, {tel: store.mobile, desc: nickname}];
                  if (vice_mgr_name !== undefined && vice_mgr_tel !== undefined) {
                    storeTel.push({tel: vice_mgr_tel, desc: vice_mgr_name});
                  }
                  _this.setState({
                    showCallStore: true,
                    storeTel: storeTel,
                  })
                }}>
                  <Image
                    style={[styles.call_img]}
                    source={require('../../img/Store/call_.png')}
                  />
                </TouchableOpacity>
                {nickname === undefined ? null : <Text style={styles.owner_name}>店长: {nickname}</Text>}
                {vice_mgr_name === undefined ? null : <Text style={styles.owner_name}>店助: {vice_mgr_name}</Text>}
                <Text style={styles.remind_time}>催单间隔: {store.call_not_print}分钟</Text>
              </View>
            </CellBody>
          </Cell>
        </Cells>
      );
    });
  }

  callStoreMenus() {
    return (this.state.storeTel).map((store) => {
      return {
        type: 'default',
        label: store.desc + ': ' + store.tel,
        onPress: () => {
          native.dialNumber(store.tel)
        }
      }
    });
  }

  render() {
    let _this = this;
    let {currVendorName} = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        <CellsTitle style={[styles.cell_title]}>新增门店</CellsTitle>
        <Cells style={[styles.cells]}>
          <Cell
            customStyle={[styles.cell_content, styles.cell_height]}
            onPress={() => {
              this.onPress(Config.ROUTE_STORE_ADD, {
                btn_type: 'add',
                actionBeforeBack: (resp) => {
                  console.log('add resp =====> ', resp);
                  if (resp.shouldRefresh) {
                    console.log('add getVendorStore');
                    _this.getVendorStore();
                  }
                }
              })
            }}
          >
            <CellHeader>
              <Image
                style={[styles.add_img]}
                source={require('../../img/Store/xinzeng_.png')}
              />
            </CellHeader>
            <CellBody>
              <Text style={[styles.add_store]}>新增门店</Text>
            </CellBody>
            <CellFooter/>
          </Cell>
        </Cells>

        <CellsTitle style={[styles.cell_title]}>{currVendorName} 门店列表</CellsTitle>
        {this.renderStores()}

        <ActionSheet
          visible={this.state.showCallStore}
          onRequestClose={() => {
            console.log('call_store_contacts action_sheet closed!')
          }}
          menus={this.callStoreMenus()}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: () => {
                this.setState({showCallStore: false})
              },
            }
          ]}
        />
      </ScrollView>
    );
  }

}


// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cells: {
    marginBottom: pxToDp(10),
    marginTop: 0,
    paddingLeft: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_body: {
    flexDirection: 'row',
  },
  cell_height: {
    height: pxToDp(90),
  },
  cell_content: {
    justifyContent: 'center',
    marginLeft: 0,
    paddingRight: 0,

    // borderColor: 'green',
    // borderWidth: pxToDp(1),
  },
  add_img: {
    width: pxToDp(50),
    height: pxToDp(50),
    marginVertical: pxToDp(20),
  },
  add_store: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  store_name: {
    fontSize: pxToDp(34),
    fontWeight: 'bold',
    color: colors.color333,
  },
  open_time: {
    marginLeft: pxToDp(12),
    fontSize: pxToDp(26),
    lineHeight: pxToDp(26),
    fontWeight: 'bold',
    color: colors.color999,
    alignSelf: 'center',
  },
  cell_right: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  edit_text: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    paddingTop: pxToDp(14),
  },
  right_btn: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    textAlign: 'center',
    height: pxToDp(70),
    marginRight: pxToDp(30),
    marginLeft: pxToDp(5),
    paddingTop: pxToDp(20),
  },
  address: {
    marginTop: pxToDp(20),
    marginRight: pxToDp(30),
    fontSize: pxToDp(30),
    color: colors.color666,
    lineHeight: pxToDp(35),
  },
  store_footer: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(20),
    flexDirection: 'row',
    marginRight: pxToDp(30),
  },
  call_img: {
    width: pxToDp(40),
    height: pxToDp(40),
  },
  owner_name: {
    marginHorizontal: pxToDp(15),
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
    alignSelf: 'flex-end',
  },
  remind_time: {
    fontSize: pxToDp(26),
    color: colors.color999,
    position: 'absolute',
    right: 0,
    bottom: 0,

  },

});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreScene)
