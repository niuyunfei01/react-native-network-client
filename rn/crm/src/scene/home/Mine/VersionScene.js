import React, {PureComponent} from 'react'
import {
  DeviceEventEmitter,
  InteractionManager,
  Linking,
  NativeModules,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {getCommonConfig} from '../../../reducers/global/globalActions';
import native from "../../../pubilc/util/native";
import {Button} from "../../../weui";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import DeviceInfo from "react-native-device-info";


function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class VersionScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      platform: '',
      newest_version: 0,
      newest_version_name: '',
      curr_version: '未知',
      curr_version_name: '未知',
      onDownloading: false,
      dlProgress: 0,
    };
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    ToastLong('加载中...')
    this._update_cfg_and_check_again();
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  UNSAFE_componentWillMount() {
    ToastLong('加载中...')
    this._check_version();
  }

  _update_cfg_and_check_again() {
    const {accessToken, currStoreId} = this.props.global;
    const {dispatch,} = this.props;
    dispatch(getCommonConfig(accessToken, currStoreId, (ok) => {
      if (ok) {
        this._check_version();
      } else {
        this.setState({isRefreshing: false});
        return '获取服务器端版本信息失败';
      }
    }));
  }

  _check_version() {
    let platform = Platform.OS === 'ios' ? 'ios' : 'android';
    let plat_version = this.props.global.config.v_b;
    let newest_version = plat_version ? plat_version[platform] : '';
    let newest_version_name = plat_version ? plat_version['name-' + platform] : '';

    const callback = (version_code, version_name) => {
      let is_newest_version = false;
      if (version_code === newest_version) {
        is_newest_version = true;
      }
      if (version_code > newest_version) {
        is_newest_version = true;
        newest_version = version_code;
        newest_version_name = version_name;
      }
      this.setState({
        newest_version: newest_version,
        newest_version_name: newest_version_name,
        platform: platform,
        is_newest_version: is_newest_version,
        curr_version: version_code,
        curr_version_name: version_name,
        isRefreshing: false
      });
    }

    if (Platform.OS === 'ios') {
      const version_name = DeviceInfo.getVersion();
      const version_code = DeviceInfo.getBuildNumber();
      callback(version_code, version_name);
    } else {
      native.currentVersion((resp) => {
        resp = JSON.parse(resp);
        let {version_name, version_code} = resp;
        callback(version_code, version_name);
      });
    }
  }

  render() {
    let {
      is_newest_version,
      curr_version,
      curr_version_name,
      newest_version,
      newest_version_name
    } = this.state;

    const {update} = this.props.route.params
    if (update) {
      NativeModules.upgrade.upgrade(update.download_url)
      this.setState({dlProgress: 0, onDownloading: true})
      showModal('正在下载')
      DeviceEventEmitter.addListener('LOAD_PROGRESS', (pro) => {
        hideModal()
        this.setState({dlProgress: pro})
      })
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}>
        {is_newest_version ? (
          <View style={[styles.version_view, {marginTop: pxToDp(330)}]}>
            <Text style={styles.curr_version}>当前版本: {newest_version_name}({newest_version}) </Text>
            <Text style={styles.newest_version}>已是最新版本</Text>
          </View>
        ) : (
          <View style={[styles.version_view, {marginTop: pxToDp(200)}]}>
            <Text style={styles.curr_version}>当前版本: {curr_version_name}({curr_version}) </Text>
            <Text style={styles.newest_version}>最新版本: {newest_version_name}({newest_version}) </Text>

            <If condition={Platform.OS !== 'ios' && DeviceInfo.getBrand() !== 'HUAWEI'}>
              <Button
                onPress={() => {
                  Linking.openURL(Config.DownloadUrl).catch(err => console.error('更新失败, 请联系服务经理解决', err));
                }}
                type='primary'
                style={styles.btn_update}
              >下载并安装</Button>
            </If>
          </View>
        )}

        <If condition={Platform.OS !== 'ios' && DeviceInfo.getBrand() !== 'HUAWEI'}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(Config.DownloadUrl).catch(err => console.error('更新失败, 请联系服务经理解决', err));
            }}
            style={styles.apk_link}>
            <Text style={styles.apk_text}>下载链接</Text>
          </TouchableOpacity>
        </If>
      </ScrollView>
    );
  }

}


const styles = StyleSheet.create({
  version_view: {
    alignItems: 'center',
  },
  curr_version: {
    fontSize: pxToDp(26),
  },
  newest_version: {
    marginTop: pxToDp(30),
    fontSize: pxToDp(30),
  },
  btn_update: {
    marginTop: pxToDp(40),
    width: '90%',
  },
  apk_link: {
    marginTop: pxToDp(100),
  },
  apk_text: {
    width: '100%',
    textAlign: 'center',
    color: '#cfcfcf',
    fontSize: pxToDp(18),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(VersionScene)