import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, Cell, CellBody, CellFooter, Cells,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {editWorkerStatus, fetchUserCount, fetchWorkers, getUserWageData} from "../../reducers/mine/mineActions";
import {hideModal, showModal, showSuccess, ToastShort} from "../../util/ToastUtils";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Config from "../../config";
import Cts from "../../Cts";
import {native} from "../../common";
import {NavigationActions} from '@react-navigation/compat';
import {logout} from "../../reducers/global/globalActions";
import HttpUtils from "../../util/http";

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
      getUserWageData
    }, dispatch)
  }
}

// create a component
class UserScene extends PureComponent {
  constructor(props) {
    super(props);
    const {navigation} = props;
    const {params = {}, key} = this.props.route;
    navigation.setOptions(
      {
        headerTitle: '个人详情',
        headerRight: () => (params.type === 'mine' ? null : (
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
              <FontAwesome name='pencil-square-o' style={styles.btn_edit}/>
            </TouchableOpacity>
          </View>
        )),
      })
    let {
      type,
      currentUser,//个人页的当前用户ID必须是传入进来的
      navigation_key,
      currVendorId,
    } = this.props.route.params || {};

    const {mine} = this.props;

    this.state = {
      isRefreshing: false,
      onSubmitting: false,
      type: type,
      sign_count: mine.sign_count[currentUser] === undefined ? 0 : mine.sign_count[currentUser],
      bad_cases_of: mine.bad_cases_of[currentUser] === undefined ? 0 : mine.bad_cases_of[currentUser],
      exceptSupplement: 0,
      onGetWage: false,
      last_nav_key: navigation_key,
      currentUser: currentUser,
      currVendorId: currVendorId,
    };
    const {accessToken} = this.props.global;
    const url = `/api/get_worker_info/${currVendorId}/${currentUser}.json?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      let {
        id, mobilephone, cover_image, //user 表数据
        worker_id, user_id, status, name, mobile, //worker 表数据
      } = res;
      cover_image = !!cover_image ? Config.staticUrl(cover_image) : "";
      this.setState({
        mobile: mobilephone,
        cover_image: cover_image,
        screen_name: name,
        user_status: parseInt(status),
        worker_id: id,
      })
    }, (res) => {
      ToastShort("获取员工信息失败")
    })

    if (mine.sign_count[currentUser] === undefined || mine.sign_count[currentUser] === undefined) {
      this.onGetUserCount();
    }

    this._onLogout = this._onLogout.bind(this)
  }

  _onLogout() {
    const {dispatch, navigation} = this.props;
    dispatch(logout(() => {
      navigation.navigate(Config.ROUTE_LOGIN, {});
    }));
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

  // getExceptSupplement() {
  // 	const self = this
  // 	const {accessToken} = this.props.global;
  // 	const {dispatch} = this.props;
  // 	InteractionManager.runAfterInteractions(() => {
  // 		dispatch(getUserWageData(accessToken, 0, (ok, obj) => {
  // 			self.setState({onGetWage: false})
  // 			if (ok) {
  // 				self.setState({exceptSupplement: obj.expect_total_supplement})
  // 			}
  // 		}))
  // 	})
  // }

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
          <Image
            style={[styles.user_img]}
            source={!!this.state.cover_image ? {uri: this.state.cover_image} :
              require('../../img/My/touxiang180x180_.png')}
          />
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
          <TouchableWithoutFeedback onPress={() => {
            this.onRouteJump(Config.ROUTE_SUPPLEMENT_WAGE)
          }}>
            <View style={[styles.info_item]}>
              <Text style={[styles.info_num]}>{this.state.exceptSupplement}</Text>
              <Text style={[styles.info_name]}>本月预计提成</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {type === 'mine' ?
          (<Button type='warn' onPress={this._onLogout} style={styles.btn_logout}>退出登录</Button>) :
          (user_status === Cts.WORKER_STATUS_OK ?
              <Button type='warn' onPress={() => this.onPress(Cts.WORKER_STATUS_DISABLED)}
                      style={styles.btn_logout}>禁用</Button> :
              <Button type='primary' onPress={() => this.onPress(Cts.WORKER_STATUS_OK)}
                      style={styles.btn_allow}>取消禁用</Button>
          )
        }
        <Text onPress={() => {
          this.cancel()
        }} style={{marginLeft: 'auto', marginRight: 'auto', color: colors.fontGray, marginTop: '80%'}}>账户注销</Text>
      </ScrollView>
    );
  }

  cancel() {
    Alert.alert('警告', '确定要注销账户吗？', [
      {text: '取消'},
      {
        text: '确定', onPress: () => {
          Alert.alert('警告', '注销操作不可逆转，确定要继续吗？', [
            {text: '取消'},
            {
              text: '确定', onPress: () => {
                Alert.alert('警告', '此操作将不保留您的店铺及平台信息，是否继续？', [
                  {text: '取消'},
                  {
                    text: '确定', onPress: () => {
                      const {accessToken} = this.props.global;
                      let {currVendorId, worker_id} = this.state;
                      const url = `/v1/new_api/User/close_account/${currVendorId}/${worker_id}/0.json?access_token=${accessToken}`;
                      HttpUtils.get.bind(this.props)(url).then((res) => {
                          showSuccess('提交成功，预计在三个工作日内处理完成，请耐心等候');
                          setTimeout(() => {
                            this._onLogout()
                          }, 2000)
                        }
                      );
                    }
                  }
                ])
              }
            }
          ])
        }
      }
    ])
  }

  componentDidUpdate() {
    let {key, params} = this.props.route;
    let {shouldRefresh, user_name, mobile, store_id} = (params || {});
    if (shouldRefresh === true) {
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
    this.setState({onSubmitting: true});
    showModal('提交中')
    InteractionManager.runAfterInteractions(() => {
      dispatch(editWorkerStatus(data, accessToken, (resp) => {
        hideModal();
        if (resp.ok) {
          let msg = '操作成功';
          ToastShort(msg);
          this.setState({
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
            key: this.props.route.key,
          });
          this.props.navigation.dispatch(setSelfParamsAction);
        } else {
          ToastShort(resp.desc);
          this.setState({
            onSubmitting: false,
          });
        }
      }));
    });
  }

  onRouteJump(route, params = {}) {
    let _this = this;
    if (route === Config.ROUTE_GOODS_COMMENT) {
      native.toUserComments();
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
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

