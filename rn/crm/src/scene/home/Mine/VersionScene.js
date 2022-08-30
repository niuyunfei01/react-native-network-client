import React, {PureComponent} from 'react'
import {Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import Config from "../../../pubilc/common/config";
import DeviceInfo from "react-native-device-info";
import {Button} from "react-native-elements";
import HttpUtils from "../../../pubilc/util/http";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
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
      is_newest_version: false,
      newest_version: 0,
      newest_version_name: '',
      curr_version: '未知',
      curr_version_name: '未知',
      version: '',
      build_number: ''
    };
  }

  componentDidMount() {
    this.fetchVersion()
    this._check_version();
  }

  fetchVersion = () => {
    let { accessToken } = this.props.global;
    const api = `/api/check_version?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        build_number: res?.build_number,
        version: res?.version
      })
    })
  }

  _check_version() {
    let {version, build_number} = this.state
    let platform = Platform.OS === 'ios' ? 'ios' : 'android';
    let plat_version = version

    let newest_version = build_number;
    let newest_version_name = plat_version ? plat_version['name-' + platform] : '';

    const version_name = DeviceInfo.getVersion();
    const version_code = DeviceInfo.getBuildNumber();

    let is_newest_version = false;
    if (parseInt(version_code) >= newest_version) {

      is_newest_version = true;
      newest_version = version_code;
      newest_version_name = version_name;
    }
    this.setState({
      newest_version: newest_version,
      newest_version_name: newest_version_name,
      is_newest_version: is_newest_version,
      curr_version: version_code,
      curr_version_name: version_name,
      isRefreshing: false
    });
  }

  render() {
    let {
      isRefreshing,
      is_newest_version,
      curr_version,
      curr_version_name,
      newest_version,
      newest_version_name,
    } = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}>
        {is_newest_version ? (
          <View style={[styles.version_view, {marginTop: pxToDp(330)}]}>
            <Text style={styles.curr_version}>当前版本: {newest_version_name}({newest_version})    </Text>
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
                title={'下载并安装'}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
              />
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
