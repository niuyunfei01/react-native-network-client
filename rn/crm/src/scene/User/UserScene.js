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
  Button,
  ButtonArea,
  Toast,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {fetchUserCount, fetchWorkers, editWorkerStatus} from "../../reducers/mine/mineActions";
import {ToastShort} from "../../util/ToastUtils";
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from "../../config";
import Cts from "../../Cts";
import {tool} from "../../common";
import {NavigationActions} from 'react-navigation';
import {logout} from "../../reducers/global/globalActions";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      logout,
    }, dispatch)
  }
}

// create a component
class UserScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}, key} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>个人详情</Text>
        </View>
      ),
      headerRight: (params.type === 'mine' ? null : (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(Config.ROUTE_USER_ADD, {
                  type: 'edit',
                  user_id: params.currentUser,
                  user_name: params.user_name,
                  mobile: params.mobile,
                  user_status: params.user_status,
                  store_id: params.store_id,
                  worker_id: params.worker_id,
                  worker_nav_key: params.navigation_key,
                  user_info_key: key,
                });
              });
            }}
          >
            <Icon name='pencil-square-o' style={styles.btn_edit}/>
          </TouchableOpacity>
        </View>
      )),
    }
  };

  constructor(props: Object) {
    super(props);

    let {
      type,
      currentUser,//个人页的当前用户ID必须是传入进来的
      navigation_key,
      currVendorId,
    } = this.props.navigation.state.params || {};

    const {mine} = this.props;
    let {
      id, nickname, nameRemark, mobilephone, image, //user 表数据
      worker_id, vendor_id, user_id, status, name, mobile, //worker 表数据
    } = ((mine.user_list || {})[currVendorId] || {})[currentUser];
    this.state = {
      isRefreshing: false,
      onSubmitting: false,
      type: type,
      sign_count: mine.sign_count[currentUser] === undefined ? 0 : mine.sign_count[currentUser],
      bad_cases_of: mine.bad_cases_of[currentUser] === undefined ? 0 : mine.bad_cases_of[currentUser],
      mobile: mobilephone,
      cover_image: image,
      screen_name: name,
      currentUser: user_id,
      currVendorId: currVendorId,
      user_status: parseInt(status),
      worker_id: worker_id,

      last_nav_key: navigation_key,
    };

    if (mine.sign_count[currentUser] === undefined || mine.sign_count[currentUser] === undefined) {
      this.onGetUserCount();
    }

    this._onLogout = this._onLogout.bind(this)
  }

  componentWillMount() {
  }

  _onLogout() {
    logout();
    this.props.navigation.navigate(Config.ROUTE_LOGIN);
    tool.resetNavStack(this.props.navigation, Config.ROUTE_LOGIN)
  }

  onGetUserCount() {
    const {accessToken} = this.props.global;
    const {currentUser} = this.state;
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

  onHeaderRefresh() {
    this.setState({isRefreshing: true});

    this.onGetUserCount();
  }

  render() {
    let {type, user_status} = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.white}}
      >
        <View style={styles.user_box}>
          <Image style={[styles.user_img]}
                 source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/My/touxiang180x180_.png')}/>
          <Text style={[styles.user_name]}>{this.state.screen_name}</Text>
        </View>
        <Cells style={[styles.cells]}>
          <Cell style={[styles.tel_box]}>
            <CellBody>
              <Text style={[styles.user_tel]}>电话</Text>
            </CellBody>
            <CellFooter>
              <Text style={[styles.user_mobile]}>{this.state.mobile}</Text>
            </CellFooter>
          </Cell>
        </Cells>
        <View style={[styles.info_box]}>
          <View style={[styles.info_item, {borderRightWidth: pxToDp(1)}]}>
            <Text style={[styles.info_num]}>{this.state.sign_count}</Text>
            <Text style={[styles.info_name]}>当月出勤天数</Text>
          </View>
          <View style={[styles.info_item]}>
            <Text style={[styles.info_num]}>{this.state.bad_cases_of}</Text>
            <Text style={[styles.info_name]}>30天投诉</Text>
          </View>
        </View>
        {type === 'mine' ?
          (<Button type='warn' onPress={this._onLogout}
                   style={styles.btn_logout}>退出登录</Button>) :
          (user_status === Cts.WORKER_STATUS_OK ?
              <Button type='warn' onPress={() => this.onPress(Cts.WORKER_STATUS_DISABLED)}
                      style={styles.btn_logout}>禁用</Button> :
              <Button type='primary' onPress={() => this.onPress(Cts.WORKER_STATUS_OK)}
                      style={styles.btn_allow}>取消禁用</Button>
          )
        }

        <Toast
          icon="loading"
          show={this.state.onSubmitting}
          onRequestClose={() => {
          }}
        >提交中</Toast>
      </ScrollView>
    );
  }

  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {shouldRefresh, user_name, mobile, store_id} = (params || {});

    if (shouldRefresh === true) {
      console.log(' Refresh User list -> ', this.props.navigation.state);
      this.setState({
        screen_name: user_name,
        mobile: mobile,
        store_id: store_id,
      });
      const setParamsAction = NavigationActions.setParams({
        params: {shouldRefresh: false},
        key: key,
      });
      this.props.navigation.dispatch(setParamsAction);
    }
  }

  onPress(user_status) {
    if (this.state.onSubmitting) {
      return false;
    }
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId, worker_id, last_nav_key} = this.state;

    let data = {
      _v_id: currVendorId,
      worker_id: worker_id,
      user_status: user_status,
    };
    console.log('save_data -> ', data);
    let _this = this;
    this.setState({onSubmitting: true});

    InteractionManager.runAfterInteractions(() => {
      dispatch(editWorkerStatus(data, accessToken, (resp) => {
        console.log('save_status_resp -> ', resp);
        if (resp.ok) {
          let msg = '操作成功';
          ToastShort(msg);
          _this.setState({
            user_status: user_status,
            onSubmitting: false,
          });

          const setParamsAction = NavigationActions.setParams({
            params: {shouldRefresh: true},
            key: last_nav_key,
          });
          this.props.navigation.dispatch(setParamsAction);
          const setSelfParamsAction = NavigationActions.setParams({
            params: {user_status: user_status},
            key: this.props.navigation.state.key,
          });
          this.props.navigation.dispatch(setSelfParamsAction);
        } else {
          ToastShort(resp.desc);
          _this.setState({
            onSubmitting: false,
          });
        }
      }));
    });
  }
}

// define your styles
const styles = StyleSheet.create({
  user_box: {
    height: pxToDp(300),
    flex: 1,
    alignItems: 'center',
  },
  user_img: {
    width: pxToDp(180),
    height: pxToDp(180),
    borderRadius: 50,
    marginTop: pxToDp(30),
    marginBottom: pxToDp(25),
  },
  user_name: {
    fontSize: pxToDp(30),
    lineHeight: pxToDp(32),
    fontWeight: 'bold',
    color: colors.color333,
    textAlign: 'center',
  },

  cells: {
    marginTop: 0,
  },
  tel_box: {
    height: pxToDp(70),
    borderColor: colors.color999,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'center'
  },
  user_tel: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  user_mobile: {
    fontSize: pxToDp(32),
    color: colors.color999,
  },

  info_box: {
    flexDirection: 'row',
    height: pxToDp(110),
    borderColor: colors.color999,
    // borderTopWidth:pxToDp(1),
    borderBottomWidth: pxToDp(1),
    justifyContent: 'center'
  },
  info_item: {
    marginVertical: pxToDp(10),
    borderColor: colors.color999,
    width: '50%',
  },
  info_num: {
    fontSize: pxToDp(40),
    lineHeight: pxToDp(40),
    fontWeight: 'bold',
    color: colors.color333,
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: pxToDp(15),
  },
  info_name: {
    fontSize: pxToDp(24),
    lineHeight: pxToDp(25),
    fontWeight: 'bold',
    color: colors.color999,
    textAlign: 'center',
    alignItems: 'center',
  },
  btn_logout: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    backgroundColor: '#dc7b78',
  },
  btn_allow: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    backgroundColor: '#6db06f',
  },
  btn_edit: {
    fontSize: pxToDp(40),
    width: pxToDp(42),
    height: pxToDp(36),
    color: colors.color666,
    marginRight: pxToDp(30),
  },
});


//make this component available to the app
// export default UserScene;
export default connect(mapStateToProps, mapDispatchToProps)(UserScene)

