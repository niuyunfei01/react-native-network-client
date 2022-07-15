import React, {PureComponent} from "react";
import {View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView} from "react-native";
import colors from "../../../pubilc/styles/colors";
import {Styles} from "./GoodsIncrementServiceStyle";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";

const styles = StyleSheet.create({

  description: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 21,
    paddingTop: 11,
    paddingLeft: 12,
    paddingBottom: 10
  },
  text: {fontSize: 12, fontWeight: '400', color: colors.color999, lineHeight: 17,},
  rightText: {fontSize: 12, fontWeight: '400', color: colors.color999, lineHeight: 17, paddingRight: 9},
  textInput: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#979797',
    width: 40,
    height: 17,
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tipText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.red,
    lineHeight: 21,
    paddingLeft: 12,
    paddingBottom: 10
  },
  rowWrap: {backgroundColor: colors.white, marginTop: 12, marginLeft: 10, marginRight: 10, borderRadius: 8,},
  rowContentWrap: {justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}
})

class AutomaticPackagingScene extends PureComponent {

  constructor(props) {
    super(props);
    this.getSetting(props.global)
  }

  getSetting = (global) => {
    const {accessToken, currStoreId} = global
    const api = `/v1/new_api/added/auto_pack_info/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get(api).then(res => {

      this.setState({packageTime: `${res.pack_time}`, packageStatus: res.auto_pack})
    }).catch(error => showError('出错：' + error.reason))
  }

  state = {
    packageTime: '0',
    packageStatus: 'off'
  }
  onChangeText = (text) => {
    this.setState({packageTime: text})
  }

  onValueChange = (value) => {
    this.setState({
      packageStatus: value ? 'on' : 'off'
    })
  }

  saveSetting = () => {
    const {global} = this.props
    const {accessToken, currStoreId} = global
    const {packageTime, packageStatus} = this.state
    const api = `/v1/new_api/added/auto_pack?access_token=${accessToken}`
    const params = {
      store_id: currStoreId,
      auto_pack: packageStatus,
      pack_time: packageTime
    }
    HttpUtils.post(api, params).then(() => {
      showSuccess('保存成功')
    }).catch(error => showError('保存失败，原因：' + error.reason))
  }

  render() {
    const {packageTime, packageStatus} = this.state
    return (
      <>
        <ScrollView>
          <View style={Styles.rowWrap}>
            <Text style={styles.description}>
              自动打包
            </Text>
            <Switch value={packageStatus === 'on'} onValueChange={value => this.onValueChange(value)}/>
          </View>
          <If condition={packageStatus === 'on'}>
            <View style={styles.rowWrap}>
              <View style={styles.rowContentWrap}>
                <Text style={styles.description}>
                  订单
                </Text>
                <View style={styles.contentWrap}>
                  <Text style={styles.text}>
                    来单后
                  </Text>
                  <TextInput style={styles.textInput}
                             value={packageTime}
                             keyboardType={'numeric'}
                             onChangeText={text => this.onChangeText(text)}
                             allowFontScaling={false}/>
                  <Text style={styles.rightText}>
                    分钟后自动打包
                  </Text>
                </View>
              </View>
              <Text style={styles.tipText}>
                支持所有平台自动打包
              </Text>
            </View>

          </If>
        </ScrollView>
        <View style={Styles.saveZoneWrap}>
          <TouchableOpacity style={Styles.saveWrap} onPress={this.saveSetting}>
            <Text style={Styles.saveText}>
              保存
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(AutomaticPackagingScene)
