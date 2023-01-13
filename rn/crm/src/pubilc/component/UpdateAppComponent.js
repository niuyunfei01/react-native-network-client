import React, {PureComponent} from "react";
import {
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CommonModal from "./goods/CommonModal";
import {downloadApk} from "rn-app-upgrade";
import UpdateAppProcessComponent from "./UpdateAppProcessComponent";

const appid = '1587325388'
const appUrl = `https://itunes.apple.com/cn/app/id${appid}?ls=1&mt=8`
const {height} = Dimensions.get('window')
export default class UpdateAppComponent extends PureComponent {

  updateAPP = async () => {
    const {download_url, setModalStatus} = this.props
    UpdateAppProcessComponent.setShowStatus()
    switch (Platform.OS) {
      case "android":
        setModalStatus && setModalStatus()
        await downloadApk({
          interval: 250,
          apkUrl: download_url,
          downloadInstall: true,
          callback: {
            onProgress: (received, total, percent) => {
              if (UpdateAppProcessComponent.getShowStatus())
                UpdateAppProcessComponent.show({process: percent, title: '版本更新中，请耐心等待'})
            },
            onFailure: (errorMessage) => {
              UpdateAppProcessComponent.show({title: errorMessage})
            },
            onComplete() {
              UpdateAppProcessComponent.hide()
            }
          }
        })
        break
      case "ios":
        setModalStatus && setModalStatus()

        await Linking.openURL(appUrl)
        break
    }


  }

  render() {
    const {visible, setModalStatus, desc} = this.props
    return (
      <CommonModal visible={visible} position={'center'} onRequestClose={setModalStatus && setModalStatus}>
        <>
          <ImageBackground style={styles.image} source={new_version_background_url}>
            <Text style={styles.headerText}>
              新版本提示
            </Text>
          </ImageBackground>
          <View style={styles.content}>
            <ScrollView style={{maxHeight: 0.2 * height}}>
              <Text style={styles.updateContentText}>
                {desc}
              </Text>
            </ScrollView>
            <View style={styles.btnWrap}>
              <TouchableOpacity style={styles.cancelWrap} onPress={() => setModalStatus && setModalStatus(false)}>
                <Text style={styles.cancelText}>
                  暂不更新
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateWrap} onPress={this.updateAPP}>
                <Text style={styles.updateText}>
                  立即更新
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      </CommonModal>
    )
  }
}


const new_version_background_url = {uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/new_version_background%403x.png'}

const styles = StyleSheet.create({
  content: {borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginHorizontal: 27, backgroundColor: 'white'},
  image: {height: 148, marginHorizontal: 27, alignItems: 'center', justifyContent: 'center'},
  updateContentText: {fontSize: 14, color: '#333', lineHeight: 20, paddingHorizontal: 20, paddingTop: 10},
  headerText: {fontWeight: 'bold', color: 'white', lineHeight: 30, fontSize: 22},
  btnWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20},
  cancelWrap: {backgroundColor: '#f5f5f5', borderRadius: 20},
  cancelText: {fontSize: 16, fontWeight: 'bold', paddingHorizontal: 36, paddingVertical: 9, color: '#666'},
  updateWrap: {backgroundColor: '#26B942', borderRadius: 20, marginLeft: 10},
  updateText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 36,
    paddingVertical: 9,
    color: 'white'
  }

})
