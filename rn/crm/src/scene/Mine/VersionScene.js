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
  InteractionManager,
  Linking, Alert, NativeModules, DeviceEventEmitter,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import native from "../../common/native";
import {Platform} from 'react-native';
import LoadingView from "../../widget/LoadingView";
import {Button} from "../../weui/index";
import Config from "../../config";
import {getCommonConfig} from "../../reducers/global/globalActions";
import Toast from "../../weui/Toast/Toast";


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
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '版本信息',
      headerRight: '',
    })
  };

  constructor(props) {
    super(props);

    this.navigationOptions(this.props)

    this.state = {
      isRefreshing: false,
      isSearchingVersion: true,
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
    this._update_cfg_and_check_again();
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  UNSAFE_componentWillMount(){
    this._check_version();
  }

  _update_cfg_and_check_again() {
    const {accessToken, currStoreId} = this.props.global;
    const {dispatch, } = this.props;
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
    let newest_version = plat_version[platform];
    let newest_version_name = plat_version['name-'+platform];

    native.currentVersion((resp) => {
      //{"version_name":"2.3.1-debug","version_code":"280"}
      resp = JSON.parse(resp);
      let {version_name, version_code} = resp;
      let is_newest_version = false;
      if (version_code === newest_version) {
        is_newest_version = true;
      }
      this.setState({
        isSearchingVersion: false,
        newest_version: newest_version,
        newest_version_name: newest_version_name,
        platform: platform,
        is_newest_version: is_newest_version,
        curr_version: version_code,
        curr_version_name: version_name,
        isRefreshing: false
      });
    });
  }

  render() {
    let {is_newest_version, curr_version, curr_version_name, newest_version, newest_version_name, isSearchingVersion} = this.state;
    if(isSearchingVersion){
      return <LoadingView/>;
    }

    const {update} = this.props.route.params
    if (update) {
      NativeModules.upgrade.upgrade(update.download_url)
      this.setState({dlProgress: 0, onDownloading: true})
      DeviceEventEmitter.addListener('LOAD_PROGRESS', (pro) => {
        console.log("progress", pro)
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
            <Text style={styles.curr_version}>当前版本: {newest_version_name}({newest_version})</Text>
            <Text style={styles.newest_version}>已是最新版本</Text>
          </View>
        ) : (
          <View style={[styles.version_view, {marginTop: pxToDp(200)}]}>
            <Text style={styles.curr_version}>当前版本: {curr_version_name}({curr_version})</Text>
            <Text style={styles.newest_version}>最新版本: {newest_version_name}({newest_version})</Text>
            <Button
              onPress={() => {
                Linking.openURL(Config.DownloadUrl).catch(err => console.error('更新失败, 请联系服务经理解决', err));
              }}
              type='primary'
              style={styles.btn_update}
            >下载并安装</Button>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(Config.DownloadUrl).catch(err => console.error('更新失败, 请联系服务经理解决', err));
          }}
          style={styles.apk_link}>
          <Text style={styles.apk_text}>下载链接</Text>
        </TouchableOpacity>
        <Toast icon="loading" show={this.state.onDownloading} onRequestClose={() => { this.onDownloading = false }} > {`正在下载...${this.state.dlProgress}%`} </Toast>
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
