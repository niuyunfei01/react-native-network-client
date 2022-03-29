import React, {PureComponent} from 'react'
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {Button} from "react-native-elements";
import config from "../../pubilc/common/config";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}


class MeituanPaotui extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      url: this.props.route.params.url,
      full_screen: false,
      showImg: "",
    }
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  onToggleFullScreen(showImg = '') {
    let {full_screen} = this.state;
    this.setState({
      full_screen: !full_screen,
      showImg: showImg,
    });
  }


  renderImg(showImg) {
    return (
      <TouchableHighlight
        style={{flex: 1,}}
        onPress={() => this.onToggleFullScreen('')}
      >
        <Image
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#999',
          }}
          source={{uri: showImg}}
        />
      </TouchableHighlight>
    );
  }


  render() {
    if (this.state.full_screen) {
      return this.renderImg(this.state.showImg);
    }
    return (
      <View style={{flexGrow: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          } style={{flex: 1, backgroundColor: colors.main_back, padding: 14,}}>
          <View style={{
            backgroundColor: colors.white,
            height: 134,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16
          }}>
            <Text style={{color: colors.color333, fontSize: 16, fontWeight: "bold"}}>什么是美团配送App</Text>
            <View style={{flexDirection: 'row', marginTop: 12}}>
              <Text style={{
                fontSize: 12,
                fontWeight: "bold",
                width: "76%",
                color: colors.color333,
              }}>&emsp;美团配送App可支持其非美团外卖商家的用户使用美团配送的运力，不仅可接入美团的订单，还可接入其他多个平台的订单，并支持添加多个发货地址。</Text>
              <TouchableOpacity
                style={{marginLeft: 10}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/1.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/1.png'}} style={{
                  width: 60,
                  height: 60,
                }}/>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginTop: 12,
          }}>
            <Text style={{color: colors.color333, fontSize: 16, fontWeight: "bold"}}>如何在外送帮上使用</Text>
            <View style={{marginVertical: 8, marginHorizontal: 4}}>
              <Text style={{color: colors.color333, fontSize: 14,}}> 1.点击下方【去授权】 </Text>
              <Text style={{color: colors.color333, fontSize: 14, marginTop: 3}}> 2.选择您的账户类型： </Text>
              <View style={{flexDirection: 'row', marginHorizontal: 8, marginVertical: 4}}>
                <Text style={{color: colors.color333, fontSize: 12,}}>(1) </Text>
                <View style={{marginLeft: 6}}>
                  <Text style={{color: colors.color333, fontSize: 12,}}>美团商户账号：适用于美团外卖商家和有开店宝账号的商家。</Text>
                  <TouchableOpacity
                    style={{marginVertical: 16}}
                    onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/2.png')}>
                    <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/2.png'}} style={{
                      width: 244,
                      height: 77,
                    }}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{flexDirection: 'row', marginHorizontal: 8, marginVertical: 4}}>
                <Text style={{color: colors.color333, fontSize: 12,}}>(2) </Text>
                <View style={{marginLeft: 6}}>
                  <Text style={{color: colors.color333, fontSize: 12,}}>（2）美团个人账号：适用于</Text>
                  <Text style={{color: colors.color333, fontSize: 12,}}>· 非美团外卖商家但有美团个人账号的用户。</Text>
                  <Text style={{color: colors.color333, fontSize: 12,}}>· 非美团外卖商家且无美团配送App账号的用户。</Text>
                  <TouchableOpacity
                    style={{marginVertical: 16}}
                    onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/3.png')}>
                    <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/3.png'}} style={{
                      width: 242,
                      height: 133,
                    }}/>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{color: colors.color333, fontSize: 14, marginTop: 3}}> 3.登录账号 </Text>

              <TouchableOpacity
                style={{marginVertical: 16, justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/4.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/4.png'}} style={{
                  width: 167,
                  height: 137,
                }}/>
              </TouchableOpacity>

              <Text style={{color: colors.color333, fontSize: 14, marginTop: 3}}> 4.根据页面提示完成操作，即可授权外送帮 </Text>

              <TouchableOpacity
                style={{marginVertical: 16, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/5.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/5.png'}} style={{
                  width: 193,
                  height: 161,
                }}/>
              </TouchableOpacity>
              <Text
                style={{color: colors.color333, width: '100%', textAlign: 'center', fontSize: 12}}>*建议您选择永久授权 </Text>
              <Text style={{
                color: colors.color333,
                width: '100%',
                textAlign: 'center',
                fontSize: 12,
                marginTop: 3
              }}>防止您因忘记授权截止时间而不能发单</Text>

              <TouchableOpacity
                style={{marginVertical: 16, width: '100%', justifyContent: 'center', alignItems: 'center'}}
                onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/6.png')}>
                <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui/6.png'}} style={{
                  width: 193,
                  height: 270,
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
        <Button title={'去授权'}
                onPress={() => {
                  this.onPress(config.ROUTE_WEB, {url: this.state.url})
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
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

export default connect(mapStateToProps)(MeituanPaotui)
