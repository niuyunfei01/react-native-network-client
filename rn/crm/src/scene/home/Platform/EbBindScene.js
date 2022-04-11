import React, {PureComponent} from 'react'
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import tool from "../../../pubilc/util/tool";
import HttpUtils from "../../../pubilc/util/http";
import {Button, Input} from "react-native-elements";
import Config from "../../../pubilc/common/config";
import {ToastLong} from "../../../pubilc/util/ToastUtils";

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


class EbBindScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      full_screen: false,
      shop_id: '',
      showImg: 'https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg'
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


  accreditEbStore() {
    let {accessToken, currStoreId} = this.props.global
    if (this.state.shop_id) {
      HttpUtils.get.bind(this.props)(`/api/eb_accredit_url/${this.state.shop_id}/${currStoreId}?access_token=${accessToken}`).then(res => {
        if (res) {
          this.props.navigation.navigate(Config.ROUTE_WEB, {
            url: res
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
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              tintColor='gray'
            />
          } style={{backgroundColor: colors.main_back, flexGrow: 1}}>

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
            }}>饿百门店ID :</Text>
            <Input onChangeText={(shop_id) => this.setState({shop_id})}
                   value={this.state.shop_id}
                   containerStyle={[styles.input]}
              // underlineColorAndroid='transparent'
              // underlineColorAndroid='transparent' //取消安卓下划线
            />
          </View>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 6,
            margin: 10,
            padding: pxToDp(20),

          }}>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>店铺绑定引导：</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(20)}}>1.打开饿了么零售商家版App。</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>2.在“我的“页面点击“店铺设置”</Text>
            <TouchableOpacity
              onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg')}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg'}} style={styles.image}/>
            </TouchableOpacity>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(20)}}>3.点击复制您的店铺D。</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>4.在上方的输入框内粘贴您的D。</Text>

            <TouchableOpacity
              onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg')}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg'}} style={styles.image}/>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {this.rendenBtn()}
      </View>
    );
  }

  rendenBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'绑定'}
                onPress={() => {
                  this.accreditEbStore()
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
    // justifyContent: 'center',
  },
  image: {
    width: pxToDp(150),
    margin: pxToDp(10),
    height: pxToDp(355),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(EbBindScene)
