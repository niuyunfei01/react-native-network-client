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
  Switch,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchWmStore, setWmStoreStatus} from "../../reducers/mine/mineActions";
import * as tool from "../../common/tool";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Toast from "../../weui/Toast/Toast";
import CallBtn from "../Order/CallBtn";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchWmStore,
      setWmStoreStatus,
      ...globalActions
    }, dispatch)
  }
}

class TakeOutScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let set_val = !params.isOperating;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>外卖平台列表</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity
          style={[
            params.isOperating ?
              styles.cancel_btn :
              styles.right_btn,
          ]}
          onPress={() => {
            if(params.is_service_mgr){
              params.setOperating(set_val);
              navigation.setParams({
                isOperating: set_val,
              });
            } else {
              ToastLong('如需操作请联系服务经理');
            }
          }}
        >
          {params.isOperating ?
            <Text style={styles.cancel_text}>取消</Text> :
            <Text style={styles.right_text}>营业/置休</Text>}
        </TouchableOpacity>
      ),
    }
  };

  constructor(props: Object) {
    super(props);

    // let {currVendorId, currVendorName} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;
    const {wm_list} = this.props.mine;
    let curr_wm_list = wm_list[currStoreId];

    let server_info = tool.server_info(this.props);

    this.state = {
      isRefreshing: false,
      isOperating: false,
      isToggleSubmitting: false,
      wm_list: curr_wm_list === undefined ? {} : curr_wm_list,
      server_mobile: server_info.mobilephone,
    };
    this.setOperating = this.setOperating.bind(this);
    this.getWmStores = this.getWmStores.bind(this);
    this.setWmStoreStatus = this.setWmStoreStatus.bind(this);

    if (curr_wm_list === undefined) {
      this.getWmStores();
    }
  }

  componentDidMount() {
    let {is_service_mgr} = tool.vendor(this.props.global);

    this.props.navigation.setParams({
      is_service_mgr: is_service_mgr,
      isOperating: this.state.isOperating,
      setOperating: (isOperating) => this.setOperating(isOperating),
    });
  }

  setOperating(isOperating) {
    this.setState({
      isOperating: isOperating,
    });
  }

  getWmStores() {
    const {dispatch} = this.props;
    const {currStoreId, accessToken} = this.props.global;

    let _this = this;
    let cache = 0;//不使用缓存
    dispatch(fetchWmStore(currStoreId, cache, accessToken, (resp) => {
      console.log('store resp -> ', resp);
      if (resp.ok) {
        let wm_list = resp.obj;
        _this.setState({
          isRefreshing: false,
          wm_list: wm_list,
        });
      }
    }));
  }

  setWmStoreStatus(platform, wid, status) {
    console.log('data -> ', platform, wid, status);
    let {isToggleSubmitting} = this.state;
    if (isToggleSubmitting) {
      ToastShort('正在提交中...');
      return false;
    }
    let set_status = '';
    if (status === true) {
      set_status = 'open';
    } else if (status === false) {
      set_status = 'close';
    } else {
      ToastLong('错误的门店状态');
      return false;
    }

    this.setState({isToggleSubmitting: true});
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    console.log('params -> ', currVendorId, platform, wid, set_status);

    let _this = this;
    dispatch(setWmStoreStatus(currVendorId, platform, wid, set_status, accessToken, (resp) => {
      console.log('set_status resp -> ', resp);
      if (resp.ok) {
        ToastLong(resp.desc);
        _this.getWmStores();
      }
      _this.setState({isToggleSubmitting: false});
    }));
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getWmStores();
  }

  renderPlat(wm_list) {
    let _this = this;
    if (tool.length(wm_list) === 0) {
      return (
        <View style={styles.service}>
          <Text style={styles.service_text}>暂无已关联的外卖平台</Text>
        </View>
      );
    }

    return tool.objectMap(wm_list, function (store, platform) {
      return (
        <View key={platform}>
          <CellsTitle style={[styles.cell_title]}>外卖平台: {tool.get_platform_name(platform)}</CellsTitle>
          {_this.renderStore(store)}
        </View>
      );
    });
  }

  renderStore(store_list) {
    let {isOperating} = this.state;
    let _this = this;

    return tool.objectMap(store_list, function (store, store_id) {
      return (
        <Cells style={[styles.cells]} key={store_id}>
          <Cell customStyle={[styles.cell_content, styles.cell_height]}>
            <CellBody>
              <Text style={[styles.wm_store_name]}>{store.name}</Text>
            </CellBody>
            <CellFooter>
              {isOperating ? <Switch
                  style={styles.switch_right}
                  value={store.wm_status == '正在营业' ? true : false}
                  onValueChange={(val) => {
                    _this.setWmStoreStatus(store.platform, store.wid, val);
                  }}/> :
                <Text style={[styles.working_text, styles.is_working_on]}>{store.wm_status}</Text>}
            </CellFooter>
          </Cell>
        </Cells>
      );
    });
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
        {this.renderPlat(this.state.wm_list)}

        <Toast
          icon="loading"
          show={this.state.isToggleSubmitting}
          onRequestClose={() => {
          }}
        >提交中</Toast>

        <View style={styles.service}>
          <CallBtn style={styles.service_text} label='如需新增外卖店铺, 请联系服务经理' mobile={this.state.server_mobile}/>
        </View>
      </ScrollView>
    );
  }

}


// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginTop: pxToDp(30),
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
  cell_height: {
    height: pxToDp(70),
  },
  cell_content: {
    justifyContent: 'center',
    marginLeft: 0,
    paddingRight: 0,
  },
  wm_store_name: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color666,
  },
  working_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color999,
    marginRight: pxToDp(30),
  },
  is_working_on: {
    color: colors.main_color,
  },
  service: {
    flexDirection: 'row',
    marginTop: pxToDp(40),
    justifyContent: 'center',
  },
  service_text: {
    fontSize: pxToDp(26),
    color: colors.main_color,
  },
  switch_right: {
    marginRight: pxToDp(20),
  },
  right_btn: {
    width: pxToDp(120),
    height: pxToDp(52),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginRight: pxToDp(30),
    backgroundColor: colors.main_color,
  },
  right_text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: pxToDp(24),
    color: colors.white,
  },
  cancel_btn: {
    width: pxToDp(120),
    height: pxToDp(52),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginRight: pxToDp(30),
    backgroundColor: colors.color999,
  },
  cancel_text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.white,
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(TakeOutScene)
