import React, {PureComponent} from 'react'
import {
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import Input from "@ant-design/react-native/es/input-item/Input";
import {Button} from "@ant-design/react-native";
import tool from "../../common/tool";
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

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
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
        console.log(res)
        if (res) {
          this.props.navigation.navigate(Config.ROUTE_WEB, {
            url: res
          })
        } else {
          ToastLong("品牌不支持绑定，请联系管理员");
        }
      })
      this.setState({shouldShowModal: false})
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
          } style={{backgroundColor: colors.main_back, padding: pxToDp(30), flexGrow: 1}}>
          <View style={{flexDirection: "row", flex: 1}}>
            <Text style={{
              flexGrow: 1,
              fontSize: pxToDp(30),
              lineHeight: pxToDp(70),
              justifyContent: 'center',
            }}>饿了么门店ID :</Text>
            <Input onChangeText={(shop_id) => this.setState({shop_id})}
                   value={this.state.shop_id}
                   style={[styles.input]}
              // placeholder="请输入打印机编码"
                   underlineColorAndroid='transparent' //取消安卓下划线
            />
          </View>
          <View style={{
            backgroundColor: '#F7F7F7',
            margin: 3,
            padding: pxToDp(20),
            marginTop: pxToDp(20)
          }}>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>店铺绑定引导：</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(20)}}>1.打开饿了么零售商家版App。</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>2.在“我的“页面点击“店铺设置”</Text>
            <TouchableOpacity onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg')}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg'}} style={styles.image}/>
            </TouchableOpacity>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(20)}}>3.点击复制您的店铺D。</Text>
            <Text style={{fontSize: pxToDp(30), marginTop: pxToDp(10)}}>4.在上方的输入框内粘贴您的D。</Text>

            <TouchableOpacity onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg')}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg'}} style={styles.image}/>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Button
          type={'primary'}
          style={tool.length(this.state.shop_id) > 0 ? styles.buts : styles.but}
          onPress={() => this.accreditEbStore()}>绑定</Button>
      </View>
    );
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
    width: '60%',
    backgroundColor: '#F7F7F7',
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


export default connect(mapStateToProps, mapDispatchToProps)(EbBindScene)
