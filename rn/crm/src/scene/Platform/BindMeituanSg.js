import React, {PureComponent} from 'react'
import {Image, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import Input from "@ant-design/react-native/es/input-item/Input";
import tool from "../../common/tool";
import {Button} from "react-native-elements";
import HttpUtils from "../../util/http";
import Config from "../../config";
import {ToastLong} from "../../util/ToastUtils";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}


class BindMeituanSg extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      full_screen: false,
      shop_id: '',
      showImg: ''
    }
  }

  renderImg(showImg) {
    return (
      <TouchableHighlight
        style={styles.wrapper}
        onPress={() => this.onToggleFullScreen('')}
      >
        <Image
          style={[styles.img]}
          source={{uri: showImg}}
        />
      </TouchableHighlight>
    );
  }


  accreditSgStore() {
    let {accessToken, currStoreId} = this.props.global
    if (this.state.shop_id) {
      HttpUtils.get.bind(this.props)(`/api/sg_accredit_url/${this.state.shop_id}/${currStoreId}?access_token=${accessToken}`).then(res => {
        if (res) {
          this.props.navigation.navigate(Config.ROUTE_WEB, {
            url: Config.serverUrl(res)
          })
        } else {
          ToastLong("品牌不支持绑定，请联系管理员");
        }
      })
    } else {
      ToastLong("请填写门店id");
    }
  }

  onToggleFullScreen(showImg = '') {
    let {full_screen} = this.state;
    this.setState({
      full_screen: !full_screen,
      showImg: showImg,
    });
  }


  render() {
    if (this.state.full_screen) {
      return this.renderImg(this.state.showImg);
    }
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{backgroundColor: colors.main_back, flexGrow: 1}}>
          <View style={{
            flexDirection: "row",
            flex: 1,
            backgroundColor: colors.white,
            padding: pxToDp(20),
            marginBottom: 4,
          }}>
            <Text style={{
              flexGrow: 1,
              fontSize: pxToDp(30),
              lineHeight: pxToDp(70),
              justifyContent: 'center',
            }}>闪购门店ID :</Text>
            <Input onChangeText={(shop_id) => this.setState({shop_id})}
                   value={this.state.shop_id}
                   style={[styles.input]}
                   underlineColorAndroid='transparent' //取消安卓下划线
            />
          </View>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 6,
            margin: 10,
          }}>
            <Text style={{fontSize: 16, fontWeight: "bold"}}> 如何授权美团闪购 </Text>
            <View style={{marginVertical: 8, marginHorizontal: 4}}>
              <Text style={{fontSize: 14,}}>1、查询美团店铺门店id </Text>
              <View style={{marginVertical: 4}}>
                <Text style={{fontSize: 12}}>下载“美团外卖商家”版，切换到我的->商家服务中心，咨询客服，输入查询门店id，并复制 </Text>
              </View>
              <View style={{flexDirection: 'row', marginVertical: 16}}>
                <TouchableOpacity
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/1.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/1.png'}} style={{
                    width: 161,
                    height: 340,
                  }}/>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginLeft: 5}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/2.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/2.png'}} style={{
                    width: 161,
                    height: 340,
                  }}/>
                </TouchableOpacity>
              </View>

              <Text style={{fontSize: 14, marginTop: 3}}>2、输入平台门店id，进行授权绑定 </Text>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/3.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/3.png'}} style={{
                  width: 161,
                  height: 340,
                }}/>
              </TouchableOpacity>


              <Text style={{fontSize: 14, marginTop: 3}}>3、登录美团闪购开放平台 </Text>
              <View style={{marginVertical: 4}}>
                <Text style={{fontSize: 12}}>【登录商家账号】该页面为商家账号（单店账号或连锁账号）的登录页面，需要输入商家账号绑定的手机号且以短信验证码的方式登录 </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/4.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/4.png'}} style={{
                  width: 320,
                  height: 139,
                }}/>
              </TouchableOpacity>

              <Text style={{fontSize: 14, marginTop: 3}}>4、手机号查看路径 </Text>
              <View style={{marginVertical: 4}}>
                <Text
                  style={{fontSize: 12}}>美团商家中心->登录商家账号->店铺设置->账号设置->绑定手机号。若尚未绑定手机号，或绑定的手机号不是当前可用的，则请绑定/换绑手机号后再操作 </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/5.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/5.png'}} style={{
                  width: 320,
                  height: 171,
                }}/>
              </TouchableOpacity>

              <View style={{marginVertical: 4}}>
                <Text
                  style={{fontSize: 12}}>下载“美团外卖商家版”，切换到我的，查看“当前账号”信息，查看已绑定的手机号 </Text>
              </View>
              <View style={{flexDirection: 'row', marginVertical: 16}}>
                <TouchableOpacity
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/6.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/6.png'}} style={{
                    width: 161,
                    height: 340,
                  }}/>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginLeft: 5}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/7.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/7.png'}} style={{
                    width: 161,
                    height: 340,
                  }}/>
                </TouchableOpacity>
              </View>

              <View style={{marginVertical: 4}}>
                <Text
                  style={{fontSize: 12}}>输入手机号，获取验证码，确认登录 </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/8.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/8.png'}} style={{
                  width: 320,
                  height: 184,
                }}/>
              </TouchableOpacity>

              <Text style={{fontSize: 14, marginTop: 3}}>5、授权店铺给外送帮 </Text>

              <View style={{marginVertical: 4}}>
                <Text
                  style={{fontSize: 12}}>选择未绑定，输入美团平台门店，选择授权绑定，美团APP_POI_CODE留空，不需要填写 </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/9.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/9.png'}} style={{
                  width: 320,
                  height: 172,
                }}/>
              </TouchableOpacity>


              <View style={{marginVertical: 4}}>
                <Text
                  style={{fontSize: 12}}>勾选阅读并同意，点击确认绑定按钮，授权成功会显示绑定成功。 </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/10.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/10.png'}} style={{
                  width: 320,
                  height: 172,
                }}/>
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/11.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindMeituanSg/11.png'}} style={{
                  width: 320,
                  height: 155,
                }}/>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
        {this.rendenBtn()}
      </View>
    );
  }


  rendenBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'绑 定'}
                onPress={() => {
                  this.accreditSgStore()
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: tool.length(this.state.shop_id) > 0 ? colors.main_color : colors.fontColor,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }
}


const styles = StyleSheet.create({

  but: {
    backgroundColor: '#CCCCCC',
    borderWidth: 0,
    marginHorizontal: pxToDp(30),
    textAlign: 'center',
    marginBottom: pxToDp(60),
  },
  buts: {
    backgroundColor: '#59B26A',
    borderWidth: 0,
    marginHorizontal: pxToDp(30),
    textAlign: 'center',
    marginBottom: pxToDp(60),
  },
  wrapper: {
    flex: 1,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#999',
  },
  input: {
    width: '70%',
    borderWidth: pxToDp(1),
    textAlign: 'center',
    height: pxToDp(70),
    justifyContent: 'center',
  },
  image: {
    width: pxToDp(150),
    margin: pxToDp(10),
    height: pxToDp(355),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(BindMeituanSg)
