//import liraries
import React, {Component} from "react";
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DatePicker, List, Modal, TextareaItem} from '@ant-design/react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchWmStore, setWmStoreStatus} from "../../reducers/mine/mineActions";
import * as tool from "../../common/tool";
import {hideModal, showModal, ToastLong, ToastShort} from "../../util/ToastUtils";
import CallBtn from "../Order/CallBtn";
import Moment from "moment/moment";
import pxToEm from "../../util/pxToEm";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchWmStore,
        setWmStoreStatus,
        ...globalActions
      },
      dispatch
    )
  };
}

class TakeOutScene extends Component {
  constructor(props) {
    super(props);

    let {currStoreId} = this.props.global;
    const {wm_list} = this.props.mine;
    let curr_wm_list = wm_list[currStoreId];

    let server_info = tool.server_info(this.props);
    this.state = {
      isSearching: false,
      isRefreshing: false,
      isOperating: false,
      isToggleSubmitting: false,
      time: undefined,
      timeStr: '',
      wm_list: curr_wm_list === undefined ? {} : curr_wm_list,
      server_mobile: server_info.mobilephone,
      confirmModalVisible: false, // 确认框
      remark: ''
    };

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    let set_val = !params.isOperating;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={[params.isOperating ? styles.cancel_btn : styles.right_btn]}
          onPress={() => {
            if (params.is_service_mgr || params.is_helper) {
              this.setOperating(set_val);
              navigation.setParams({
                isOperating: set_val
              });
            } else {
              ToastLong("如需操作请联系服务经理");
            }
          }}
        >
          {params.isOperating ? (
            <Text style={styles.cancel_text}>取消</Text>
          ) : (
            <Text style={styles.right_text}>营业/置休</Text>
          )}
        </TouchableOpacity>
      )
    })
  };

  UNSAFE_componentWillMount() {
    let {currStoreId} = this.props.global;
    const {wm_list} = this.props.mine;
    let curr_wm_list = wm_list[currStoreId];
    if (curr_wm_list === undefined) {
      this.getWmStores();
    }
  }

  componentDidMount() {
    let {is_service_mgr, is_helper} = tool.vendor(this.props.global);

    this.props.navigation.setParams({
      is_service_mgr: is_service_mgr,
      is_helper: is_helper,
      isOperating: this.state.isOperating,
    });
  }

  setOperating = isOperating => {
    this.setState({
      isOperating: isOperating
    });
  };

  getWmStores = () => {
    if (this.state.isSearching) {
      return;
    }
    showModal('查询中外卖店铺中...')
    this.setState({isSearching: true});
    const {dispatch} = this.props;
    const {currStoreId, accessToken} = this.props.global;
    let _this = this;
    let cache = 0; //不使用缓存
    dispatch(
      fetchWmStore(currStoreId, cache, accessToken, resp => {
        if (resp.ok) {
          let wm_list = resp.obj;
          _this.setState({
            wm_list: wm_list
          });
        }
        hideModal()
        _this.setState({isRefreshing: false, isSearching: false});
      })
    );
  };

  setWmStoreStatus = (platform, wid, status) => {
    let {isToggleSubmitting} = this.state;
    if (isToggleSubmitting) {
      ToastShort("正在提交中...");
      return false;
    }
    let set_status = "";
    if (status === true) {
      set_status = "open";
      this.submit(platform, set_status, wid);
    } else if (status === false) {
      this.setState({confirmModalVisible: true});
    } else {
      ToastLong("错误的门店状态");
      return false;
    }
  };

  submit = (platform, set_status, wid, openTime, remark) => {
    this.setState({isToggleSubmitting: true});
    showModal('提交中')
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      setWmStoreStatus(
        currVendorId,
        platform,
        wid,
        set_status,
        accessToken,
        openTime ? openTime : 0,
        remark ? remark : '',
        resp => {
          if (resp.ok) {
            ToastLong(resp.desc);
            _this.getWmStores();
          }
          hideModal()
          _this.setState({isToggleSubmitting: false, time: '', remark: ''});
        }
      )
    );
  };

  onHeaderRefresh = () => {
    this.setState({isRefreshing: true});
    this.getWmStores();
  };

  renderPlat = wm_list => {
    if (tool.length(wm_list) === 0) {
      return (
        <View style={styles.service}>
          <Text style={styles.service_text}>
            {this.state.isSearching
              ? "查询中外卖店铺中..."
              : "暂无已关联的外卖平台"}
          </Text>
        </View>
      );
    }

    return tool.objectMap(wm_list, (store, platform) => {
      return (
        <View key={platform}>
          <CellsTitle style={[styles.cell_title]}>
            外卖平台: {tool.get_platform_name(platform)}
          </CellsTitle>
          {this.renderStore(store)}
        </View>
      );
    });
  };

  renderStore = store_list => {
    let {isOperating} = this.state;
    return tool.objectMap(store_list, (store, store_id) => {
      return (
        <Cells style={[styles.cells]} key={store_id}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody>
              <Text style={[styles.wm_store_name]}>{store.name}</Text>
            </CellBody>
            <CellFooter>
              {isOperating ? (
                <Switch
                  style={styles.switch_right}
                  value={store.wm_status === "正在营业" ? true : false}
                  onValueChange={val => {
                    this.platform = store.platform;
                    this.wid = store.wid;
                    this.store = store;
                    this.store_id = store_id;
                    this.setWmStoreStatus(store.platform, store.wid, val);
                  }}
                />
              ) : store.wm_status === "休息中" ? (
                <TouchableOpacity
                  onPress={() => {
                    this.platform = store.platform;
                    this.wid = store.wid;
                    this.store = store;
                    this.store_id = store_id;

                    this.setState({confirmModalVisible: true});
                  }}
                >
                  <Text style={[styles.working_text, styles.is_working_on]}>
                    {store.next_open_time || store.wm_status}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.working_text, styles.is_working_on]}>
                  {store.wm_status}
                </Text>
              )}
            </CellFooter>
          </Cell>
        </Cells>
      );
    });
  };

  renderConfirmModal = () => {
    return (
      <Modal
        visible={this.state.confirmModalVisible}
        transparent
        maskClosable={false}
        footer={[
          {text: '取消', onPress: () => this.setState({confirmModalVisible: false, time: '', remark: ''})},
          {
            text: '确定', onPress: () => {
              this.setState({confirmModalVisible: false, isOperating: false}, () => {
                this.submit(this.platform, "close", this.wid, this.state.timeStr, this.state.remark)
              })
            }
          }
        ]}
      >
        <List>
          <DatePicker
            value={this.state.time ? this.state.time : undefined}
            mode="datetime"
            minDate={new Date()}
            onChange={time => {
              let timeStr = Moment(time).format('YYYY-MM-DD HH:mm:ss')
              this.setState({time: time, timeStr: timeStr})
            }}
            format="YYYY-MM-DD HH:mm:ss"
          >
            <List.Item wrap={true}>时间</List.Item>
          </DatePicker>
          <TextareaItem placeholder="请输入关店理由" rows={5} clear onChange={remark => this.setState({remark})}/>
        </List>
      </Modal>
    )
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor="gray"
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        {this.renderPlat(this.state.wm_list)}

        {this.renderConfirmModal()}

        {/*<Toast*/}
        {/*	icon="loading"*/}
        {/*	show={this.state.isToggleSubmitting}*/}
        {/*	onRequestClose={() => {*/}
        {/*	}}*/}
        {/*>*/}
        {/*	提交中*/}
        {/*</Toast>*/}

        {/*<Toast*/}
        {/*	icon="loading"*/}
        {/*	show={this.state.isSearching}*/}
        {/*	onRequestClose={() => {*/}
        {/*	}}*/}
        {/*>*/}
        {/*	查询中外卖店铺中...*/}
        {/*</Toast>*/}

        <View style={styles.service}>
          <CallBtn
            style={styles.service_text}
            label="如需新增外卖店铺, 请联系服务经理"
            mobile={this.state.server_mobile}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(10),
    fontSize: pxToEm(26),
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
  cell_height: {
    height: pxToDp(70)
  },
  cell_content: {
    justifyContent: "center",
    marginLeft: 0,
    paddingRight: 0
  },
  wm_store_name: {
    fontSize: pxToEm(30),
    fontWeight: "bold",
    color: colors.color666
  },
  working_text: {
    fontSize: pxToEm(30),
    fontWeight: "bold",
    color: colors.color999,
    marginRight: pxToDp(30)
  },
  is_working_on: {
    color: colors.main_color
  },
  service: {
    flexDirection: "row",
    marginTop: pxToDp(40),
    justifyContent: "center"
  },
  service_text: {
    fontSize: pxToEm(26),
    color: colors.main_color
  },
  switch_right: {
    marginRight: pxToDp(20)
  },
  right_btn: {
    width: pxToDp(120),
    height: pxToDp(52),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    marginRight: pxToDp(30),
    backgroundColor: colors.main_color
  },
  right_text: {
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: pxToEm(24),
    color: colors.white
  },
  cancel_btn: {
    width: pxToDp(120),
    height: pxToDp(52),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    marginRight: pxToDp(30),
    backgroundColor: colors.color999
  },
  cancel_text: {
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: pxToEm(24),
    fontWeight: "bold",
    color: colors.white
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(TakeOutScene);
