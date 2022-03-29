//import liraries
import React, {PureComponent} from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, CellsTitle, Icon, Input, Label,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {hideModal, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import {getVendorStores, saveVendorUser} from "../../reducers/mine/mineActions";
import Config from "../../pubilc/common/config";
import Cts from "../../Cts";
import {NavigationActions} from '@react-navigation/compat';
import * as tool from "../../pubilc/common/tool";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

// create a component
class UserAddScene extends PureComponent {
  constructor(props) {
    super(props);

    let {currVendorId, currVendorName} = tool.vendor(this.props.global);

    const {mine} = this.props;
    let vendor_stores = (mine === undefined || mine.vendor_stores[currVendorId] === undefined) ? [] : Object.values(mine.vendor_stores[currVendorId]);

    let stores = [{name: '访问所有门店', value: 0}];
    let v_store = vendor_stores.map((store) => {
      return {name: store.name, value: parseInt(store.id)};
    });

    const {
      type,
      user_id,
      mobile,
      user_name,
      user_status,
      store_id,
      worker_nav_key,
      user_info_key,
      worker_id
    } = (this.props.route.params || {});
    let route_back = Config.ROUTE_WORKER;

    let {pageFrom, storeData} = this.props.route.params;
    let showChooseStore = true;
    if (pageFrom == 'storeAdd') {
      showChooseStore = false;
    }

    this.state = {
      type: type,
      isRefreshing: false,
      onSubmitting: false,
      currVendorId: currVendorId,
      currVendorName: currVendorName,
      stores: stores.concat(v_store),
      route_back: route_back,
      worker_nav_key: worker_nav_key,
      user_info_key: user_info_key,
      user_id: user_id === undefined ? 0 : user_id,
      mobile: mobile === undefined ? '' : mobile,
      user_name: user_name === undefined ? '' : user_name,
      user_status: user_status === undefined ? Cts.WORKER_STATUS_OK : user_status,
      store_id: store_id === undefined ? -1 : store_id,
      worker_id: worker_id,
      pageFrom: pageFrom,
      storeData: storeData,
      showChooseStore: showChooseStore
    };
    this.onUserAdd = this.onUserAdd.bind(this);
    if (showChooseStore) {
      this.getVendorStore();
    }

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    const page_type = (params || {}).type;
    let pageTitle = page_type === 'edit' ? '修改信息' : '新增员工';
    navigation.setOptions({
      headerTitle: pageTitle,
    })
  };

  getVendorStore() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let vendor_id = this.state.currVendorId;
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      dispatch(getVendorStores(vendor_id, accessToken, (resp) => {
        if (resp.ok) {
          let vendor_stores = Object.values(resp.obj);
          let stores = [{name: '访问所有门店', value: 0}];
          let v_store = vendor_stores.map((store) => {
            return {name: store.name, value: parseInt(store.id)};
          });
          _this.setState({
            stores: stores.concat(v_store),
          });
        }
        _this.setState({isRefreshing: false});
      }));
    });
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getVendorStore();
  }

  render() {
    let update = this.state.type === 'edit';
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
        <CellsTitle style={styles.cell_title}>基本信息</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>姓名</Label>
            </CellHeader>
            <CellBody>
              <Input onChangeText={(user_name) => this.setState({user_name})}
                     value={this.state.user_name}
                     style={[styles.cell_input]}
                     placeholder="请输入姓名"
                     underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>手机号</Label>
            </CellHeader>
            <CellBody>
              <Input
                editable={!update}
                onChangeText={(mobile) => this.setState({mobile})}
                value={this.state.mobile}
                style={[styles.cell_input]}
                placeholder="请输入手机号"
                maxLength={11} // 可输入的最大长度
                keyboardType='numeric' //默认弹出的键盘
                underlineColorAndroid='transparent' //取消安卓下划线
              />
            </CellBody>
          </Cell>
        </Cells>
        {this.state.showChooseStore ? (<View>
          <CellsTitle style={styles.cell_title}>限制只能访问某门店</CellsTitle>
          <Cells style={[styles.cell_box]}>
            {this.state.stores.map((option, idx) =>
              <Cell
                key={idx}
                onPress={() => this.onChooseStore(option.value)}
                // customStyle = {{paddingTop: 7, paddingBottom: 7}}
                customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={styles.cell_body}>{option.name || option.value} </Text>
                </CellBody>
                <CellFooter>
                  {this.state.store_id === option.value ? (
                    <Icon name="success_no_circle" style={{fontSize: 16,}}/>
                  ) : null}
                </CellFooter>
              </Cell>
            )}
          </Cells>
        </View>) : null}

        <Button
          onPress={() => this.onUserAdd()} type='primary'
          style={styles.btn_submit}>{this.state.type === 'edit' ? '确认修改' : '保存'}
        </Button>
        {/*<Toast*/}
        {/*  icon="loading"*/}
        {/*  show={this.state.onSubmitting}*/}
        {/*  onRequestClose={() => {*/}
        {/*  }}*/}
        {/*>提交中</Toast>*/}
      </ScrollView>
    );
  }

  onChooseStore(store_id) {
    this.setState({store_id});
  }

  onUserAdd() {
    if (this.state.onSubmitting) {
      ToastShort("正在提交请稍后！");
      return false;
    }
    const {dispatch} = this.props;
    let {
      type,
      currVendorId,
      user_id,
      mobile,
      user_name,
      store_id,
      user_status,
      worker_nav_key,
      user_info_key,
      worker_id
    } = this.state;
    if (isNaN(mobile) || mobile.length !== 11) {
      ToastShort('手机号码格式有误');
      return false;
    } else if (user_name === '') {
      ToastShort('请输入用户名');
      return false;
    } else if (!(store_id >= 0)) {
      ToastShort('请选择可访问门店');
      return false;
    }

    const {accessToken} = this.props.global;
    let data = {
      _v_id: currVendorId,
      worker_id: worker_id,
      user_name: user_name,
      mobile: mobile,
      limit_store: store_id,
      user_id: user_id,
      user_status: user_status,
    };
    let _this = this;
    showModal('提交中')
    this.setState({onSubmitting: true});
    InteractionManager.runAfterInteractions(() => {
      dispatch(saveVendorUser(data, accessToken, (resp) => {
        hideModal();
        _this.setState({onSubmitting: false});
        if (resp.ok) {
          let msg = type === 'add' ? '添加员工成功' : '操作成功';
          ToastShort(msg);
          let userData = resp.obj;
          const setWorkerAction = NavigationActions.setParams({
            params: {shouldRefresh: true},
            key: worker_nav_key,
          });
          this.props.navigation.dispatch(setWorkerAction);
          const setUserAction = NavigationActions.setParams({
            params: {
              shouldRefresh: true,
              user_name: user_name,
              mobile: mobile,
              store_id: store_id,
            },
            key: user_info_key,
          });
          this.props.navigation.dispatch(setUserAction);
          if (this.state.pageFrom == 'storeAdd' && _this.props.route.params.onBack) {
            _this.props.route.params.onBack(userData.user_id, mobile, user_name);
            _this.props.navigation.goBack();
          } else {
            const setSelfParamsAction = NavigationActions.back();
            this.props.navigation.dispatch(setSelfParamsAction);
          }
        } else {
          ToastShort(resp.desc);
        }
      }));
    });
  }
}

// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
  },
  cell_input: {
    //需要覆盖完整这4个元素
    fontSize: 15,
    height: 45,
    marginTop: 2,
    marginBottom: 2,
  },
  cell_label: {
    width: pxToDp(170),
    fontSize: pxToDp(30),
    height: pxToDp(32),
    fontWeight: 'bold',
    color: colors.color333,
  },
  cell_body: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  btn_submit: {
    margin: pxToDp(30),
    backgroundColor: '#6db06f',
  },
  border_bottom_line: {
    borderColor: colors.color999,
    borderBottomWidth: pxToDp(1),
  },
});


//make this component available to the app
// export default UserScene;
export default connect(mapStateToProps, mapDispatchToProps)(UserAddScene)

