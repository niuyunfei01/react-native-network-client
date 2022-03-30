import {Image, InteractionManager, Text, TouchableOpacity, View} from 'react-native'
import React from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import * as globalActions from "../../../reducers/global/globalActions"
import HttpUtils from "../../../pubilc/util/http"
import {keySort, makeObjToString} from "../../../util/common"
import {Button, Provider} from '@ant-design/react-native'
import PropType from 'prop-types'
import sha1 from 'js-sha1'
import Config from "../../../pubilc/common/config";
import tool from "../../../pubilc/common/tool";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import native from "../../../util/native";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

function Fetch({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class PlatformBind extends React.Component {
  static propTypes = {
    platformsList: PropType.array,
    mtDeveloperId: PropType.string,
    businessId: PropType.string,
    ePoiId: PropType.string,
    sign: PropType.string,
    ePoiName: PropType.string,
    timestamp: PropType.string,
    mtSignKey: PropType.string,
    eleClientId: PropType.string,
    eleRedirectUri: PropType.string,
    vendorId: PropType.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      platformsList: [
        {
          name: '美团',
          alias: 'mt',
          avatar_url: `https://cnsc-pics.cainiaoshicai.cn/platformLogo/2.png`,
          subtitle: '',
          enable: true,
        },
        {
          name: '饿了么',
          alias: 'ele',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platformLogo/1.png',
          subtitle: '建议餐饮、甜品、蛋糕类客户选择',
          enable: true,
        },
        {
          name: '美团闪购',
          alias: 'sg',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platformLogo/3.png',
          subtitle: '建议有管理商品需求的零售类客户选择',
          enable: false,
        },
        {
          name: '饿了么零售',
          alias: 'ele-open',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platformLogo/1.png',
          subtitle: '建议饿了么零售客户选择',
          enable: true,
        },
        {
          name: '京东',
          alias: 'jd',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platformLogo/4.png',
          subtitle: '暂不自主绑定，请联系客服',
          enable: true,
        }
      ],
      mtDeveloperId: '',
      businessId: 2,
      ePoiId: this.props.global.currStoreId,
      ePoiIds: this.props.global.currStoreId,
      sign: '',
      ePoiName: '',
      timestamp: '',
      mtSignKey: '',
      eleClientId: '',
      eleRedirectUri: '',
      vendorId: 68,
      accessToken: this.props.global.accessToken,
      shouldShowModal: false,
      shopId: 0,
    }
  }

  componentDidMount() {
    this.fetchDevData()
  }

  fetchDevData() {
    HttpUtils.get.bind(this.props)(`/api/get_dev_data?offline_store_id=${this.state.ePoiId}&access_token=${this.state.accessToken}`)
      .then(res => {
        this.setState({
          mtDeveloperId: res.mtDeveloperId,
          mtSignKey: res.mtSignKey,
          eleClientId: res.eleClientId,
          eleRedirectUri: res.eleRedirectUri,
          vendorId: res.vendorId,
          ePoiName: res.ePoiName,
          ePoiIds: res.bindId
        })
      })
  }

  makeMtUrl() {
    let tempStr = ''
    let timestamp = Math.floor(new Date().getTime() / 1000)
    let tempObj = {
      'developerId': this.state.mtDeveloperId,
      'ePoiId': 'mt' + this.state.ePoiIds,
      'businessId': this.state.businessId,
      'ePoiName': this.state.ePoiName,
      'timestamp': timestamp
    }
    tempObj = keySort(tempObj)
    tempStr = makeObjToString(tempObj)
    let sign = sha1(this.state.mtSignKey + tempStr)
    let dest = encodeURIComponent(`https://open-erp.meituan.com/storemap?developerId=${tempObj.developerId}&businessId=${tempObj.businessId}&ePoiId=${tempObj.ePoiId}&ePoiName=${tempObj.ePoiName}&timestamp=${tempObj.timestamp}&sign=${sign}`);
    return Config.serverUrl(`/bind_mt.php?destUrl=${dest}`)
  }

  makeEleUrl() {
    let state = 'cainiaoshicai-' + this.state.eleClientId + '-' + this.state.vendorId + '-' + this.state.ePoiIds + '-' + '1'
    let dest = encodeURIComponent(`https://open-api.shop.ele.me/authorize?response_type=code&client_id=${this.state.eleClientId}&redirect_uri=${this.state.eleRedirectUri}&state=${state}&scope=all`);
    return Config.serverUrl(`/bind_mt.php?destUrl=${dest}`)
  }


  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }


  renderItemWithImg = () => {
    return (
      <For index="i" each='item' of={this.state.platformsList}>
        <TouchableOpacity
          style={{
            padding: pxToDp(20),
            borderRadius: 8,
            backgroundColor: colors.white,
            flexDirection: 'row',
            marginTop: pxToDp(20)
          }}
          onPress={() => {
            if (item.enable && item.alias === 'mt') {
              this.props.navigation.navigate(Config.ROUTE_BIND_MEITUAN)
            } else if (item.enable && item.alias === 'ele') {
              this.props.navigation.navigate(Config.ROUTE_WEB, {
                url: this.makeEleUrl(), title: '饿了么绑定'
              })
            } else if (item.enable && item.alias === 'ele-open') {
              this.onPress(Config.ROUTE_EBBIND)
            } else {
              this.onPress(Config.ROUTE_SGBIND)
            }
          }}>
          <View style={{marginRight: 12}}>
            <Image style={{
              width: 48,
              height: 48,
              marginTop: item.alias === 'jd' ? 5 : 0
            }} source={{uri: item.avatar_url}}/>
          </View>
          <View style={{flex: 1}}>
            <Text style={{
              fontSize: 18,
              padding: pxToDp(3),
              marginTop: item.subtitle.length > 0 ? 4 : 14
            }}>{item.name} </Text>
            <If condition={item.subtitle.length > 0}>
              <Text style={{flexDirection: 'row', fontSize: 12, marginTop: 3}}>
                {item.subtitle}
                <If condition={item.alias === 'jd'}>
                  <Text style={{color: colors.main_color, fontSize: 12}} onPress={() => {
                    native.dialNumber(13241729048);
                  }}>
                    132-4172-9048
                  </Text>
                </If>
              </Text>
            </If>
          </View>
          <View style={{
            backgroundColor: colors.main_color,
            borderRadius: 2,
            alignItems: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
            justifyContent: 'center',
            height: pxToDp(60)
          }}>
            <Text style={{
              fontSize: 12,
              padding: pxToDp(20),
              color: colors.f7
            }}>去授权</Text>
          </View>
        </TouchableOpacity>
      </For>
    )
  }


  render() {
    return (
      <Provider>
        <View style={{flex: 1}}>
          <View style={{flexGrow: 1, padding: pxToDp(20), paddingTop: 0}}>
            <Fetch navigation={this.props.navigation} onRefresh={this.fetchDevData.bind(this)}/>
            <View>
              {this.renderItemWithImg()}
            </View>

          </View>

          <Button
            type={'primary'}
            style={{
              width: '90%',
              backgroundColor: colors.main_color,
              marginLeft: 'auto',
              marginRight: 'auto',
              // marginHorizontal: pxToDp(30),
              borderWidth: pxToDp(0),
              borderRadius: pxToDp(20),
              textAlign: 'center',
              marginBottom: pxToDp(70),
            }} onPress={() => {
            let {currVendorId} = tool.vendor(this.props.global)
            let data = {
              v: currVendorId,
              s: this.props.global.currStoreId,
              u: this.props.global.currentUser,
              m: this.props.global.currentUserProfile.mobilephone,
              place: 'bind'
            }
            JumpMiniProgram("/pages/service/index", data);
          }}>联系客服</Button>
        </View>
      </Provider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformBind)
