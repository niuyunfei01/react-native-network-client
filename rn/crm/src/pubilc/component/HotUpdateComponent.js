import React, {PureComponent} from "react";
import {Modal, Platform, Text, TouchableOpacity, View, StyleSheet} from 'react-native'
import AntDesign from "react-native-vector-icons/AntDesign";
import {Image} from "react-native-elements";
import colors from "../styles/colors";
import Cts from "../common/Cts";
import HttpUtils from "../util/http";
import {showError} from "../util/ToastUtils";
import RNRestart from "./react-native-restart";
import {bundleFilePath, createDirectory, deleteFile, exists, calcFileHash} from "../util/FileUtil";
import RNFetchBlob from "rn-fetch-blob";
import {unzip} from "./react-native-zip/RNZip";
import {MixpanelInstance} from "../util/analytics";

const styles = StyleSheet.create({
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalContentWrap: {
    width: '80%',
    backgroundColor: colors.colorEEE,
    borderRadius: 8,
    padding: 12,
  },
  closeNewVersionModal: {fontSize: 20, textAlign: 'right'},
  center: {alignItems: 'center', justifyContent: 'center'},
  modalImgStyle: {width: 51.2, height: 51.2, marginTop: 12, borderRadius: 8},
  modalContentText: {paddingTop: 12, paddingBottom: 16, marginLeft: 20, marginRight: 20, lineHeight: 25},
  modalTitleText: {fontSize: 12, fontWeight: 'bold', paddingTop: 8, paddingBottom: 8, marginLeft: 20, lineHeight: 25},
  modalBtnWrap: {
    backgroundColor: colors.main_color,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 8
  },
  modalBtnText: {color: colors.white, fontSize: 20, padding: 12, textAlign: 'center'},
})
const platform = Platform.OS === 'android' ? 'Android-Bundle' : 'IOS-Bundle'

export class HotUpdateComponent extends PureComponent {

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
  }

  state = {
    showNewVersionVisible: false,
    newVersionInfo: {},
    downloadFileProgress: '',
    downloadFileFinish: false,
  }

  componentDidMount() {
    this.getNewVersionInfo()
  }

  getNewVersionInfo = () => {
    const url = '/v1/new_api/Version/getBundleUrl'
    const version = __DEV__ ? '5' : Cts.BUNDLE_VERSION;
    const params = {platform: platform, version: version}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      if (parseInt(res.android) > version)
        this.setState({newVersionInfo: res, showNewVersionVisible: true})
    }).catch(error => {
      showError(error)
    })
  }
  closeNewVersionInfo = () => {
    this.setState({showNewVersionVisible: false})
  }

  updateBundle = (newVersionInfo) => {
    const {downloadFileFinish} = this.state
    if (downloadFileFinish) {
      this.mixpanel.track(Platform.OS === 'ios' ? 'iOS_立即体验' : 'Android_立即体验')
      RNRestart.Restart()
      return
    }
    this.mixpanel.track(Platform.OS === 'ios' ? 'iOS_立即更新' : 'Android_立即更新')
    const {md5, bundle_url} = newVersionInfo
    const source = Platform.OS === 'ios' ? bundleFilePath + '/last.ios.zip' : bundleFilePath + '/last.android.zip';
    RNFetchBlob.config({path: source})
      .fetch('GET', bundle_url)
      .progress({count: 10, fileCache: true}, (received, total) => {
        const downloadFileProgress = parseInt(`${(received / total) * 100}`)
        this.setState({downloadFileProgress: `${downloadFileProgress}%`})
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
              downloadFileProgress: '下载完成，立即体验新版本吧',
              downloadFileFinish: true
            })
          } else {

            this.setState({
              downloadFileProgress: '下载文件出错，请重新下载',
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
    const {showNewVersionVisible, downloadFileFinish, newVersionInfo, downloadFileProgress} = this.state
    return (
      <Modal visible={showNewVersionVisible} transparent={true} hardwareAccelerated={true}>
        <View style={styles.modalWrap}>
          <View style={styles.modalContentWrap}>
            <If condition={newVersionInfo.force === 0}>
              <AntDesign name={'close'} style={styles.closeNewVersionModal} allowFontScaling={false}
                         onPress={this.closeNewVersionInfo}/>
            </If>
            <View style={styles.center}>
              <Image source={require('../../img/Login/ic_launcher.png')} style={styles.modalImgStyle}/>
            </View>
            <Text style={styles.modalContentText}>
              {newVersionInfo.info}
            </Text>
            <If condition={downloadFileProgress !== ''}>
              <Text style={styles.modalTitleText}>
                下载进度：{downloadFileProgress}
              </Text>
            </If>
            <TouchableOpacity style={styles.modalBtnWrap} onPress={() => this.updateBundle(newVersionInfo)}>
              <Text style={styles.modalBtnText}>
                {downloadFileFinish ? '立即体验' : '立即更新'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
}
