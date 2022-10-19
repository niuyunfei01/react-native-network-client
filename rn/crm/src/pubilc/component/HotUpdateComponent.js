import React, {PureComponent} from "react";
import {Modal, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import Cts from "../common/Cts";
import HttpUtils from "../util/http";
import {showError} from "../util/ToastUtils";
import RNRestart from "./react-native-restart";
import {bundleFilePath, calcFileHash, createDirectory, deleteFile, exists} from "../util/FileUtil";
import RNFetchBlob from "rn-fetch-blob";
import {unzip} from "./react-native-zip/RNZip";
import {MixpanelInstance} from "../util/analytics";
import {SvgXml} from "react-native-svg";
import {hotUpdateHeader} from "../../svg/svg";
import tool from "../util/tool";
import DeviceInfo from "react-native-device-info";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalHeaderWrap: {
    width: 274,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.white,
  },
  modalContentWrap: {
    width: 274,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12
  },
  center: {alignItems: 'center', justifyContent: 'center'},
  modalImgStyle: {width: 51.2, height: 51.2, marginTop: 12, borderRadius: 8},
  modalContentText: {
    fontSize: 14,
    color: colors.color333,
    paddingTop: 12,
    paddingBottom: 16,
    marginLeft: 20,
    marginRight: 20,
    lineHeight: 17
  },
  modalTitleText: {fontSize: 12, fontWeight: 'bold', paddingTop: 8, paddingBottom: 8, marginLeft: 20, lineHeight: 25},
  modalNoUpdateBtnWrap: {
    flex: 1,
    backgroundColor: colors.colorCCC,
    marginHorizontal: 5,
    borderRadius: 2
  },
  modalUpdateBtnWrap: {
    flex: 1,
    backgroundColor: colors.main_color,
    marginHorizontal: 5,
    borderRadius: 2
  },
  modalBtnText: {
    color: colors.white,
    lineHeight: 22,
    fontWeight: '400',
    fontSize: 16,
    paddingVertical: 7,
    textAlign: 'center'
  },
  newVersionTipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 22,
    position: 'absolute',
    zIndex: 11,
    left: 13,
    top: 13
  },
  newVersionTipCode: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 17,
    position: 'absolute',
    zIndex: 11,
    left: 13,
    top: 35
  },
  newVersionTip: {
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.color333,
    lineHeight: 20
  },
  progressWrap: {
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 10,
    height: 20,
    backgroundColor: colors.main_color,
    flexDirection: 'row'
  },
  progressLeftWrap: {
    borderRadius: 10,
  },
  progressRightWrap: {
    borderRadius: 10,
    backgroundColor: '#ACD9B4',
  },
  btnWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginRight: 12, marginTop: 21
  },
  progressTipText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 17,
    right: 0,
    position: 'absolute'
  },
  errorMessage: {
    marginLeft: 20,
    fontSize: 10,
    fontWeight: '400',
    color: '#FF2424',
    lineHeight: 14,
    marginBottom: 5
  }
})
const platform = Platform.OS === 'android' ? 'Android-Bundle' : 'IOS-Bundle'

const Progress = (downloadFileProgress = 0) => {
  return (
    <View style={styles.progressWrap}>
      <View style={[styles.progressLeftWrap, {width: `${downloadFileProgress}%`}]}/>
      <View style={[styles.progressRightWrap, {width: `${(100 - downloadFileProgress)}%`}]}/>
      <Text style={styles.progressTipText}>
        {downloadFileProgress}%
      </Text>
    </View>
  )
}

export default class HotUpdateComponent extends PureComponent {

  state = {
    showNewVersionVisible: false,
    newVersionInfo: {},
    downloadFileProgress: 0,
    downloadFileFinish: false,
    errorMsg: ''
  }

  static propTypes = {
    currStoreId: PropTypes.string,
    accessToken: PropTypes.string,
  }


  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
  }

  componentDidMount() {
    this.getNewVersionInfo()
  }

  getNewVersionInfo = () => {
    const url = '/v1/new_api/Version/getBundleUrl'
    let {accessToken, currStoreId} = this.props;
    const version  = Cts.BUNDLE_VERSION;
    const params = {
      store_id: currStoreId,
      accessToken: accessToken,
      platform: platform,
      version: version,
      hot_update_num: version,
      version_code: DeviceInfo.getBuildNumber()
    }
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      if (parseInt(res.android) > version)
        this.setState({newVersionInfo: res, showNewVersionVisible: true})
    })
  }

  closeNewVersionInfo = () => {
    this.setState({showNewVersionVisible: false})
  }

  updateBundle = () => {
    const {downloadFileFinish, newVersionInfo} = this.state
    if (downloadFileFinish) {
      this.mixpanel.track(Platform.OS === 'ios' ? 'iOS_立即体验' : 'Android_立即体验')
      RNRestart.Restart()
      return
    }
    this.mixpanel.track(Platform.OS === 'ios' ? 'iOS_立即更新' : 'Android_立即更新')
    const {md5, bundle_url} = newVersionInfo
    // let bundle_url = Platform.OS === 'ios' ? 'https://cnsc-pics.cainiaoshicai.cn/crm-bundle/ios/649.ios.zip' : 'https://cnsc-pics.cainiaoshicai.cn/crm-bundle/android/649.android.zip';
    // let md5 = Platform.OS === 'ios' ? 'd977947c46f89b1b976f40476e14b65a':'78673471bf4b71c7ab60801b9f78dd7d';
    const source = Platform.OS === 'ios' ? bundleFilePath + '/' + DeviceInfo.getBuildNumber() + '.ios.zip' : bundleFilePath + '/' + DeviceInfo.getBuildNumber() + '.android.zip';
    RNFetchBlob.config({path: source})
      .fetch('GET', bundle_url)
      .progress({count: 10, fileCache: true}, (received, total) => {
        const downloadFileProgress = parseInt((received / total) * 100)
        this.setState({downloadFileProgress: downloadFileProgress})
      })
      .then(async (res) => {
        const status = res.info().status;
        if (status === 200) {
          const target = Platform.OS === 'ios' ? bundleFilePath + '/last.ios/' : bundleFilePath + '/last.android/';
          if (!await exists(target))
            await createDirectory(target)
          const fileHash = await calcFileHash(source, 'md5')
          if (md5 === fileHash) {
            await unzip(source, target)
            this.setState({
              downloadFileProgress: 100,
              downloadFileFinish: true
            })
          } else {

            this.setState({
              downloadFileProgress: 0,
              errorMsg: '下载文件出错，请重新下载',
              downloadFileFinish: false
            })
          }
          await deleteFile(source)
        }
      }).catch(error => {
      showError(error.reason)
    })
  }

  render() {
    const {showNewVersionVisible, downloadFileFinish, newVersionInfo, downloadFileProgress, errorMsg} = this.state
    // console.log('downloadFileProgress', downloadFileProgress)
    return (
      <Modal visible={showNewVersionVisible} transparent={true} hardwareAccelerated={true}>
        <View style={styles.modalWrap}>
          <View style={styles.modalHeaderWrap}>
            <SvgXml xml={hotUpdateHeader()}/>
            <Text style={styles.newVersionTipText}>
              发现新版本
            </Text>
            <Text style={styles.newVersionTipCode}>
              {newVersionInfo['name-android']}
            </Text>
          </View>
          <View style={styles.modalContentWrap}>
            <Text style={styles.newVersionTip}>
              更新内容
            </Text>
            <Text style={styles.modalContentText}>
              {newVersionInfo.info}
            </Text>
            <If condition={tool.length(errorMsg) > 0}>
              <Text style={styles.errorMessage}>
                {errorMsg}
              </Text>
            </If>
            <If condition={downloadFileProgress > 0 && downloadFileProgress < 100}>
              {Progress(downloadFileProgress)}
            </If>
            <If condition={downloadFileProgress === 0 || downloadFileProgress === 100}>
              <View style={styles.btnWrap}>
                <If condition={newVersionInfo.force === 0}>
                  <TouchableOpacity style={styles.modalNoUpdateBtnWrap} onPress={this.closeNewVersionInfo}>
                    <Text style={styles.modalBtnText}>
                      暂不更新
                    </Text>
                  </TouchableOpacity>
                </If>
                <TouchableOpacity style={styles.modalUpdateBtnWrap} onPress={this.updateBundle}>
                  <Text style={styles.modalBtnText}>
                    {downloadFileFinish ? '立即体验' : '立即更新'}
                  </Text>
                </TouchableOpacity>
              </View>
            </If>
          </View>
        </View>
      </Modal>
    )
  }
}
