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
  Switch
} from "../../weui/index";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchWorkers, getVendorStores} from "../../reducers/mine/mineActions";
import {ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import Button from 'react-native-vector-icons/Entypo';

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
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    const {
      currStoreId,
      canReadStores,
    } = this.props.global;
    let currVendorId = canReadStores[currStoreId]['vendor_id'];
    let currVendorName = canReadStores[currStoreId]['vendor'];

    // const {currentUser} = (this.props.navigation.state.params || {});

    const {mine} = this.props;
    let vendor_stores = Object.values(mine.vendor_stores[currVendorId]);
    let user_list = mine.user_list[currVendorId];

    this.state = {
      isRefreshing: false,

      currVendorId: currVendorId,
      currVendorName: currVendorName,
      vendor_stores: vendor_stores,
      user_list: user_list,
    };

    this.getVendorStore = this.getVendorStore.bind(this);
    this.onSearchWorkers = this.onSearchWorkers.bind(this);
    if (Array.from(vendor_stores).length === 0 || vendor_stores === undefined) {
      this.getVendorStore();
    }
    if (user_list === undefined || Array.from(Object.values(user_list)) === 0 || user_list === undefined) {
      this.onSearchWorkers();
    }
  }

  getVendorStore() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      dispatch(getVendorStores(vendor_id, accessToken, (resp) => {
        console.log('store resp -> ', resp);
        if (resp.ok) {
          let vendor_stores = Object.values(resp.obj);
          _this.setState({vendor_stores: vendor_stores});
          if (_this.state.isRefreshing) {
            ToastShort('刷新门店列表完成');
          }
        }
        _this.setState({isRefreshing: false});
      }));
    });
  }

  onSearchWorkers() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchWorkers(vendor_id, accessToken, (resp) => {
        if (resp.ok) {
          let {user_list} = resp.obj;
          _this.setState({user_list});
          if (_this.state.isRefreshing) {
            ToastShort('刷新员工完成');
          }
        }
        _this.setState({isRefreshing: false});
      }));
    });
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
    let {vendor_stores, user_list, currVendorId} = this.state;
    if(vendor_stores.length === 0 || Object.values(user_list).length === 0){
      return null;
    }

    let _this = this;
    return vendor_stores.map(function (store, idx) {
      let {nickname, mobilephone} = user_list[store.owner_id];
      let vice_mgr_name = store.vice_mgr > 0 ? user_list[store.vice_mgr]['nickname'] : undefined;
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
                    type: 'edit',
                    currVendorId: currVendorId,
                    store_info: store,
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
                <Image
                  style={[styles.call_img]}
                  source={require('../../img/Store/call_.png')}
                />
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

  render() {
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
                type: 'add',
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


        {/*<Cells style={[styles.cells]}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody style={styles.cell_body}>
              <Text style={[styles.store_name]}>回龙观店</Text>
              <Text style={[styles.open_time]}>09:00-19:00</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                  this.onPress(Config.ROUTE_STORE_ADD, {
                    type: 'edit',
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
              <Text style={[styles.address]}>中华人民共和国北京市昌平区文华西路回龙观文华市场56号</Text>
              <View style={styles.store_footer}>
                <Image
                  style={[styles.call_img]}
                  source={require('../../img/Store/call_.png')}
                />
                <Text style={styles.owner_name}>店长: 阿凡达</Text>
                <Text style={styles.owner_name}>店助: 蜘蛛侠</Text>
                <Text style={styles.remind_time}>催单间隔: 5分钟</Text>
              </View>
            </CellBody>
          </Cell>
        </Cells>
        <Cells style={[styles.cells]}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody style={styles.cell_body}>
              <Text style={[styles.store_name]}>亚运村</Text>
              <Text style={[styles.open_time]}>09:00-19:00</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity
                onPress={() => {
                  this.onPress(Config.ROUTE_STORE_ADD, {
                    type: 'edit',
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
              <Text style={[styles.address]}>回龙观文化街56号</Text>
              <View style={styles.store_footer}>
                <Image
                  style={[styles.call_img]}
                  source={require('../../img/Store/call_.png')}
                />
                <Text style={styles.owner_name}>店长: 海绵宝宝</Text>
                <Text style={styles.owner_name}>店助: 钢铁侠</Text>
                <Text style={styles.remind_time}>催单间隔: 5分钟</Text>
              </View>
            </CellBody>
          </Cell>
        </Cells>*/}
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
