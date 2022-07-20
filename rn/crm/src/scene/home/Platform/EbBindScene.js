import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {Button} from "react-native-elements";
import Config from "../../../pubilc/common/config";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import BigImage from "../../common/component/BigImage";
import Entypo from "react-native-vector-icons/Entypo";
import ModalSelector from "../../../pubilc/component/ModalSelector";

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
      showImg: 'https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg',
      applicationType: 0,
      applicationTypeLabel: '请选择应用类型'
    }
  }

  accreditEbStore() {
    const notify = '1.通过非主应用绑定外卖店铺不可以创建和修改门店。2.一个门店最多可以绑定20个非主应用。'
    if (this.state.shop_id && this.state.applicationType > 0) {
      if (this.state.applicationType == 2) {
        Alert.alert('提示', `${notify}`, [{
          text: '确认',
          onPress: () => this.ebAccreditUrl()
        }, {text: '取消'}])
      } else {
        this.ebAccreditUrl()
      }
    } else {
      Alert.alert('提示', '请完善门店id与应用类型', [{text: '确认'}])
    }
  }

  ebAccreditUrl = () => {
    let {accessToken, currStoreId} = this.props.global
    HttpUtils.get.bind(this.props)(`/api/eb_accredit_url/${this.state.shop_id}/${currStoreId}/${this.state.applicationType}?access_token=${accessToken}`).then(res => {
      if (res) {
        this.props.navigation.navigate(Config.ROUTE_WEB, {
          url: res
        })
      } else {
        ToastLong("品牌不支持绑定，请联系管理员");
      }
    })
  }

  onToggleFullScreen(showImg = '') {
    let {full_screen} = this.state;
    this.setState({
      full_screen: !full_screen,
      showImg: showImg,
    });
  }


  render() {
    const applicationTypes = [
      {label: '主应用', type: 1},
      {label: '非主应用', type: 2}
    ]
    return (
      <View style={{flex: 1}}>

        <BigImage
          visible={this.state.full_screen}
          urls={[{url: this.state.showImg}]}
          onClickModal={() => this.onToggleFullScreen()}
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              tintColor='gray'
            />
          } style={{backgroundColor: colors.main_back, flexGrow: 1}}>

          <View style={styles.headerBox}>
            <View style={{flexDirection: "row", flex: 1}}>
              <Text style={styles.headerBoxLabel}>饿百门店ID :</Text>
              <TextInput placeholder="请输入饿百门店ID"
                         underlineColorAndroid="transparent"
                         style={styles.input}
                         placeholderTextColor={'#999'}
                         value={this.state.shop_id}
                         onChangeText={(shop_id) => this.setState({shop_id})}
              />
            </View>
            <View style={styles.typeBox}>
              <Text style={[styles.labelLine, {marginBottom: pxToDp(10)}]}>应用类型：</Text>
              <ModalSelector
                  onChange={option => {
                    this.setState({
                      applicationTypeLabel: option.label,
                      applicationType: option.type
                    })
                  }}
                  data={applicationTypes}
                  skin="customer"
                  defaultKey={-999}
              >
                <View style={styles.body_text}>
                  <Text style={styles.selectLabelLine}>{this.state.applicationTypeLabel || '点击选择应用类型'}</Text>
                  <Entypo name="chevron-right" style={styles.right_icon}/>
                </View>
              </ModalSelector>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.labelLine, {marginBottom: pxToDp(10)}]}>店铺绑定引导：</Text>
            <Text style={styles.labelLine}>1.打开饿了么零售商家版App。</Text>
            <Text style={styles.labelLine}>2.在“我的“页面点击“店铺设置”</Text>
            <TouchableOpacity
              onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg')}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind1.jpg'}} style={styles.image}/>
            </TouchableOpacity>
            <Text style={styles.labelLine}>3.点击复制您的店铺D。</Text>
            <Text style={styles.labelLine}>4.在上方的输入框内粘贴您的D。</Text>

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

  rendenBtn = () => {
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
    height: pxToDp(70)
  },
  image: {
    width: pxToDp(150),
    margin: pxToDp(10),
    height: pxToDp(355),
  },
  infoBox: {
    backgroundColor: colors.white,
    borderRadius: 6,
    margin: 10,
    padding: pxToDp(20)
  },
  labelLine: {fontSize: pxToDp(30), marginTop: pxToDp(10)},
  headerBox: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: colors.white,
    padding: pxToDp(20),
    marginBottom: 4,
  },
  headerBoxLabel: {flexGrow: 1, fontSize: pxToDp(30), lineHeight: pxToDp(70), justifyContent: 'center'},
  typeBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: pxToDp(20)
  },
  body_text: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  right_icon: {
    fontSize: pxToDp(40),
    color: colors.color666
  },
  selectLabelLine: {
    fontSize: pxToDp(26),
    color: colors.color666,
    marginLeft: 10
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(EbBindScene)
