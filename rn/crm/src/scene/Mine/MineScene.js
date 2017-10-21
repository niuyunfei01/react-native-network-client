//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import colors from "../../styles/colors";
import selector from "../../styles/selector";
import pxToDp from "../../util/pxToDp";
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-vector-icons/Entypo';
import Config from '../../config';
import Cts from '../../Cts';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import native from "../../common/native";
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import {fetchWorkers, fetchUserCount} from "../../reducers/mine/mineActions";
import {setCurrentStore} from "../../reducers/global/globalActions";
import ModalSelector from 'react-native-modal-selector';

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

// create a component
class MineScene extends PureComponent {
  static navigationOptions = {title: 'Mine', header: null};

  constructor(props: Object) {
    super(props);
    const {
      currentUser,
      currStoreId,
      currentUserProfile,
      canReadStores,
      canReadVendors,
    } = this.props.global;

    let storeActionSheet = [];
    let sortStores = Object.values(canReadStores).sort(function (a, b) {
      return (parseInt(a.vendor_id) - parseInt(b.vendor_id) )
    });
    storeActionSheet.push({key: -999, section: true, label: '选择门店'},);
    for (let store of sortStores) {
      let item = {
        key: store.id,
        label: store.vendor === null ? store.name : (store.vendor + ':' + store.name),
      };
      storeActionSheet.push(item);
    }

    let prefer_store = '';
    let screen_name = '';
    let mobilephone = '';
    let cover_image = '';
    if (currentUserProfile !== null) {
      prefer_store = currentUserProfile.prefer_store;
      screen_name = currentUserProfile.screen_name;
      mobilephone = currentUserProfile.mobilephone;
      cover_image = currentUserProfile.cover_image;
    }

    const {mine} = this.props;
    this.state = {
      isRefreshing: false,
      onNavigating: false,
      storeActionSheet: storeActionSheet,
      sign_count: mine.sign_count[currentUser],
      bad_cases_of: mine.bad_cases_of[currentUser],

      currentUser: currentUser,
      canReadStores: canReadStores,
      prefer_store: prefer_store,
      screen_name: screen_name,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currStoreName: canReadStores[currStoreId]['name'],
      currVendorId: canReadStores[currStoreId]['vendor_id'],
      currVendorName: canReadStores[currStoreId]['vendor'],
      cover_image: cover_image !== '' ? Config.ServiceUrl + cover_image : '',
      canReadVendors: canReadVendors,
    };

    this._doChangeStore = this._doChangeStore.bind(this);
    this._goToOldRemind = this._goToOldRemind.bind(this);

    if (this.state.sign_count === undefined || this.state.bad_cases_of === undefined) {
      this.onGetUserCount();
    }
  }

  componentWillMount() {
  }

  onGetUserCount() {
    const {
      currentUser,
      accessToken,
    } = this.props.global;
    let _this = this;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchUserCount(currentUser, accessToken, (resp) => {
        if (resp.ok) {
          let {sign_count, bad_cases_of} = resp.obj;
          _this.setState({
            sign_count: sign_count,
            bad_cases_of: bad_cases_of,
          });
          if (_this.state.isRefreshing) {
            ToastShort('刷新完成');
          }
        }
        _this.setState({isRefreshing: false});
      }));
    });
  }

  componentWillReceiveProps() {
    const {
      currentUser,
      currStoreId,
      currentUserProfile,
      canReadStores,
    } = this.props.global;

    const {
      prefer_store,
      screen_name,
      mobilephone,
      cover_image,
    } = currentUserProfile;

    const {mine} = this.props;
    this.setState({
      sign_count: mine.sign_count[currentUser],
      bad_cases_of: mine.bad_cases_of[currentUser],
      currentUser: currentUser,
      canReadStores: canReadStores,
      prefer_store: prefer_store,
      screen_name: screen_name,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currStoreName: canReadStores[currStoreId]['name'],
      currVendorId: canReadStores[currStoreId]['vendor_id'],
      currVendorName: canReadStores[currStoreId]['vendor'],
      cover_image: cover_image !== '' ? Config.ServiceUrl + cover_image : '',
    });
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});

    this.onGetUserCount();
  }

  _doChangeStore(store_id) {
    let {canReadStores} = this.state;
    const {dispatch} = this.props;
    let _this = this;
    native.setCurrStoreId(store_id, function (ok, msg) {
      console.log('setCurrStoreId => ', store_id, ok, msg);
      if (ok) {
        dispatch(setCurrentStore(store_id));
        _this.setState({
          currStoreId: store_id,
          currStoreName: canReadStores[store_id]['name'],
          currVendorId: canReadStores[store_id]['vendor_id'],
          currVendorName: canReadStores[store_id]['vendor'],
        });
      } else {
        ToastShort(msg);
      }
    });
  }

  _goToOldRemind() {
    const url = `${Config.ServiceUrl}stores/quick_task_list.html?access_token=${this.props.global.accessToken}`;
    this.props.navigation.navigate(Config.ROUTE_WEB, {url: url});
  }

  renderHeader() {
    return (
      <View style={header_styles.container}>
        <View style={[header_styles.main_box]}>
          <Text style={header_styles.shop_name}>{this.state.currStoreName}</Text>
          <ModalSelector
            onChange={(option) => {
              this._doChangeStore(option.key)
            }}
            data={this.state.storeActionSheet}
            //initValue="切换门店"
            cancelText="取消"
            selectStyle={selector.selectStyle}
            selectTextStyle={selector.selectTextStyle}
            overlayStyle={selector.overlayStyle}
            sectionStyle={selector.sectionStyle}
            sectionTextStyle={selector.sectionTextStyle}
            optionContainerStyle={selector.optionContainerStyle}
            optionStyle={selector.optionStyle}
            optionTextStyle={selector.optionTextStyle}
            cancelStyle={selector.cancelStyle}
            cancelTextStyle={selector.cancelTextStyle}
          >
            <View style={{flexDirection: 'row'}}>
              <Icon name='exchange' style={header_styles.change_shop}/>
              <Text style={header_styles.change_shop}> 切换门店</Text>
            </View>
          </ModalSelector>
        </View>
        <View style={[header_styles.icon_box]}>
          <Image style={[header_styles.icon_open]} source={require('../../img/My/open_.png')}/>
          <Text style={header_styles.open_text}>营业中</Text>
        </View>
      </View>
    )
  }

  /*renderWorker() {
      return (
          <View style={worker_styles.container}>
              <View>
                  <Image style={[worker_styles.icon_head]} source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/Mine/avatar.png')} />
              </View>
              <View style={[worker_styles.worker_box]}>
                  <Text style={worker_styles.worker_name}>{this.state.screen_name.substring(0,4)}</Text>
              </View>
              <View style={[worker_styles.sales_box]}>
                  <Text style={[worker_styles.sale_text]}>今日订单: 500</Text>
                  <Text style={[worker_styles.sales_money, worker_styles.sale_text]}>营业额: ¥3800.00</Text>
              </View>
              <TouchableOpacity style={[worker_styles.chevron_right]}>
                  <Button name='chevron-thin-right' style={worker_styles.right_btn} />
              </TouchableOpacity>
          </View>
      )
  }*/
  renderWorker() {
    return (
      <View
        style={worker_styles.container}
      >
        <View>
          <Image style={[worker_styles.icon_head]}
                 source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/My/touxiang180x180_.png')}/>
        </View>
        <View style={[worker_styles.worker_box]}>
          <Text style={worker_styles.worker_name}>{this.state.screen_name.substring(0, 4)}</Text>
        </View>
        <View style={[worker_styles.order_box]}>
          <Text style={worker_styles.order_num}>{this.state.sign_count}</Text>
          <Text style={[worker_styles.tips_text]}>出勤天数</Text>
        </View>
        <View style={[worker_styles.question_box]}>
          <Text style={worker_styles.order_num}>{this.state.bad_cases_of}</Text>
          <Text style={[worker_styles.tips_text]}>30天投诉</Text>
        </View>
        <TouchableOpacity
          style={[worker_styles.chevron_right]}
          onPress={() => this.onPress(Config.ROUTE_USER, {
            type: 'mine',
            currentUser: this.state.currentUser,
            currVendorId: this.state.currVendorId,
            // mobile: this.state.mobile_phone,
            // screen_name: this.state.screen_name,
            // cover_image: this.state.cover_image,
            // user_status: Cts.WORKER_STATUS_OK,
          })}
        >
          <Button name='chevron-thin-right' style={[worker_styles.right_btn]}/>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
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
        {this.renderHeader()}
        {this.renderWorker()}
        {this.renderStoreBlock()}
        {this.renderVersionBlock()}
        {this.renderDirectBlock()}
      </ScrollView>
    );
  }

  onPress(route, params = {}) {
    // let {onNavigating} = this.state;
    // console.log('onNavigating -> ', onNavigating);
    // if (onNavigating === true) {
    //   return false;
    // }
    // _this.setState({onNavigating: true});

    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  renderStoreBlock() {
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/yeji_.png')}/>
          <Text style={[block_styles.block_name]}>业绩</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/pingjia_.png')}/>
          <Text style={[block_styles.block_name]}>评价</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/dianpu_.png')}/>
          <Text style={[block_styles.block_name]}>店铺管理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/xiaoshou_.png')}/>
          <Text style={[block_styles.block_name]}>销售分析</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/kaoqin_.png')}/>
          <Text style={[block_styles.block_name]}>考勤记录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_WORKER, {
            type: 'worker',
            currentUser: this.state.currentUser,
            currVendorId: this.state.currVendorId,
            currVendorName: this.state.currVendorName,
          })}
        >
          <Image style={[block_styles.block_img]} source={require('../../img/My/yuangong_.png')}/>
          <Text style={[block_styles.block_name]}>员工管理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/kehu_.png')}/>
          <Text style={[block_styles.block_name]}>客户管理</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_SETTING)}
        >
          <Image style={[block_styles.block_img]} source={require('../../img/My/shezhi_.png')}/>
          <Text style={[block_styles.block_name]}>设置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]} onPress={this._goToOldRemind}>
          <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')}/>
          <Text style={[block_styles.block_name]}>老的提醒</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderVersionBlock() {
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/huiyuan_.png')}/>
          <Text style={[block_styles.block_name]}>会员信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/help_.png')}/>
          <Text style={[block_styles.block_name]}>帮助</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/fuwu_.png')}/>
          <Text style={[block_styles.block_name]}>联系服务经理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/banben_.png')}/>
          <Text style={[block_styles.block_name]}>版本信息</Text>
        </TouchableOpacity>
        <View style={[block_styles.empty_box]}/>
      </View>
    )
  }

  renderDirectBlock() {
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/diaohuo_.png')}/>
          <Text style={[block_styles.block_name]}>调货单</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/baosun_.png')}/>
          <Text style={[block_styles.block_name]}>报损</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/caigou_.png')}/>
          <Text style={[block_styles.block_name]}>门店采购</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[block_styles.block_box]}>
          <Image style={[block_styles.block_img]} source={require('../../img/My/baoxiao_.png')}/>
          <Text style={[block_styles.block_name]}>报销</Text>
        </TouchableOpacity>
        <View style={[block_styles.empty_box]}/>
      </View>
    )
  }

}

// define your styles
const header_styles = StyleSheet.create({
  container: {
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
    paddingLeft: pxToDp(30),
    backgroundColor: colors.white,
    marginBottom: pxToDp(14),
  },
  main_box: {
    marginRight: pxToDp(134),
    height: pxToDp(170),
  },
  shop_name: {
    color: colors.title_color,
    fontSize: pxToDp(36),
    fontWeight: 'bold',
    marginVertical: pxToDp(30),
    lineHeight: pxToDp(36),
  },
  change_shop: {
    color: colors.main_color,
    fontSize: pxToDp(34),
    fontWeight: 'bold',
    lineHeight: pxToDp(35),
  },
  icon_box: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  icon_open: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(35),
    marginBottom: pxToDp(5),
    width: pxToDp(80),
    height: pxToDp(74),
  },
  open_text: {
    color: colors.main_color,
    fontSize: pxToDp(20),
    textAlign: 'center',
  },
  close_text: {
    color: '#999',
  },
});

const worker_styles = StyleSheet.create({
  container: {
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
    backgroundColor: colors.white,
    height: pxToDp(140),
    flexDirection: 'row',
    marginBottom: pxToDp(22),
  },
  icon_head: {
    marginHorizontal: pxToDp(30),
    marginVertical: pxToDp(25),
    width: pxToDp(90),
    height: pxToDp(90),
    borderRadius: pxToDp(50),
  },
  worker_box: {
    width: pxToDp(130),
    justifyContent: 'center',
  },
  worker_name: {
    color: colors.title_color,
    fontSize: pxToDp(30),
    fontWeight: 'bold',
  },
  order_box: {
    marginLeft: pxToDp(35),
    justifyContent: 'center',
  },
  question_box: {
    marginLeft: pxToDp(60),
    justifyContent: 'center',
  },
  order_num: {
    color: colors.title_color,
    fontSize: pxToDp(40),
    lineHeight: pxToDp(40),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tips_text: {
    color: colors.color999,
    fontSize: pxToDp(24),
    lineHeight: pxToDp(24),
    textAlign: 'center',
    marginTop: pxToDp(16),
  },
  chevron_right: {
    position: 'absolute',
    // right: pxToDp(30),
    // top: pxToDp(50),
    right: pxToDp(0),
    justifyContent: 'center',
    width: pxToDp(90),
    height: pxToDp(140),
  },
  right_btn: {
    fontSize: pxToDp(40),
    textAlign: 'center',
    color: colors.main_color,
  },
  sales_box: {
    marginLeft: pxToDp(35),
    marginTop: pxToDp(30),
  },
  sale_text: {
    fontSize: pxToDp(30),
    lineHeight: pxToDp(30),
    color: '#555',
  },
  sales_money: {
    marginTop: pxToDp(24),
  },
});

const block_styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(22),
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
  },
  block_box: {//剩1个格子用正常样式占位
    width: pxToDp(239),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.main_back,
    borderWidth: pxToDp(1),
    alignItems: 'center',
  },
  empty_box: {//剩2个格子用这个样式占位
    width: pxToDp(478),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.main_back,
    borderWidth: pxToDp(1),
    alignItems: 'center',
  },
  block_img: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(16),
    width: pxToDp(100),
    height: pxToDp(100),
  },
  block_name: {
    color: colors.color666,
    fontSize: pxToDp(26),
    lineHeight: pxToDp(26),
    textAlign: 'center',
  },

});


//make this component available to the app
// export default MineScene;
export default connect(mapStateToProps, mapDispatchToProps)(MineScene)
