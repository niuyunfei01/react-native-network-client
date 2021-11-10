import React, {PureComponent} from 'react'
import {
  Alert,
  Clipboard,
  Image,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Button, InputItem, List, Radio, TextareaItem} from '@ant-design/react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";
import * as wechat from 'react-native-wechat-lib'
import {showError, showModal, showSuccess, ToastLong} from "../../util/ToastUtils";
import Config from "../../config";
import Input from "@ant-design/react-native/es/input-item/Input";
import {QNEngine} from "../../util/QNEngine";
import {tool} from "../../common";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-crop-picker";
import {ActionSheet} from "../../weui";

const APP_ID = 'wx0ffb81c6dc194253';

const Brief = List.Item.Brief;
const RadioItem = Radio.RadioItem;

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const PAY_WECHAT_APP = 'wechat_app';
const PAID_OK = 1;
const PAID_FAIL = 2;
const PAID_WAIT = 0;

class SeparatedAccountFill extends PureComponent {

  navigationOptions = ({navigation}) => (navigation.setOptions({
    headerTitle: '帐户充值',
  }))

  constructor(props: Object) {
    super(props);
    this.state = {
      to_fill_yuan: '100',
      pay_by: PAY_WECHAT_APP,
      paid_done: PAID_WAIT,
      showHeader: true,
      headerType: 1,
      price: 0,
      img: '',
      content: '',
      showImgMenus: false,
    }
    this.navigationOptions(this.props)
  }

  componentDidMount(): void {
    console.log("to register ", APP_ID);
    const universalLink = Platform.select({ios: 'https://xxxx.com', android: undefined,});
    wechat.registerApp(APP_ID, universalLink).then(r => console.log("register done:", r));
    console.log("after register");

    let {navigation} = this.props;
    navigation.setParams({
      upLoad: this.upLoad,
      startScan: this.startScan,
    });

    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: (data) => {
        console.log('progress => ', data)
        this.setState({loadingPercent: Number(data.percent * 100) + '%'})
      },
      onComplete: (data) => {
        console.log('onComplete', data)
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          showSuccess('上传成功')
          const {newImageKey} = this.state;
          const uri = res + newImageKey
          this.setState({
            img: uri,
          });
        }, () => {
          showError("获取上传图片的地址失败");

        })
      },
      onError: (data) => {
        console.log("onError", data);
        switch (data.code) {
          case '-2':
            showError('任务已暂停')
            break;
          default:
            showError('错误：' + data.msg)
            break;
        }
      }
    })
  }

  onToExpense() {
    this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE);
  }

  copyReceiveSecretKey() {
    let text = '开户名称：北京家帮帮科技有限公司\n' +
      '开户银行：招商银行股份有限公司北京回龙观支行\n' +
      '开户账号：1109 1915 0410 101\n';
    Clipboard.setString(text)
    ToastLong('已复制到剪切板')
  }


  onPay() {
    console.log("start to :", this.state);
    if (this.state.to_fill_yuan < 1) {
      showError("充值金额不应少于1元");
      return;
    }
    const self = this;
    wechat.isWXAppInstalled()
      .then((isInstalled) => {
        console.log('isInstalled:', isInstalled);
        if (isInstalled) {
          const {accessToken} = self.props.global;
          const url = `api/gen_pay_app_order/${self.state.to_fill_yuan}?access_token=${accessToken}`;
          HttpUtils.post.bind(self.props)(url).then(res => {
            console.log("res", res);
            res = res.result;
            const params = {
              partnerId: res.partnerid,
              prepayId: res.prepayid,
              nonceStr: res.noncestr,
              timeStamp: res.timestamp,
              package: res.package,
              sign: res.sign,
            };
            wechat.pay(params).then((requestJson) => {
              console.log("----微信支付成功----", requestJson, params);
              if (requestJson.errCode === 0) {
                ToastLong('支付成功');
                self.setState({paid_done: PAID_OK}, () => {
                  if (self.props.route.params.onBack) {
                    self.props.route.params.onBack(true)
                    self.props.navigation.goBack()
                  }
                })
              }
            }).catch((err) => {
              console.log(err, "params", params);
              //FIXME: 用户取消支付时，需要显示一个错误
              ToastLong(`支付失败:${err}`);
              self.setState({paid_done: PAID_FAIL}, () => {
                if (self.props.route.params.onBack) {
                  self.props.route.params.onBack(false)
                  self.props.navigation.goBack()
                }
              });
            });
          });
        } else {
          Alert.alert('没有安装微信软件，请您安装微信之后再试');
        }
      });
  }

  pay_by_text() {
    return this.state.pay_by === PAY_WECHAT_APP ? '微信支付' : '';
  }

  renderWechat() {
    if (this.state.paid_done === PAID_WAIT && this.state.headerType === 1) {
      return (
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <ScrollView style={{flex: 1}} automaticallyAdjustContentInsets={false} showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}>
            <List renderHeader={'充值金额'}>
              <InputItem clear error={this.state.to_fill_yuan <= 0} type="number" value={this.state.to_fill_yuan}
                         onChange={to_fill_yuan => {
                           this.setState({to_fill_yuan,});
                         }}
                         extra="元"
                         placeholder="帐户充值金额">
              </InputItem>
            </List>
            <List renderHeader={'支付方式'}>
              <RadioItem checked={this.state.pay_by === PAY_WECHAT_APP}
                         thumb={'https://qiniu.cainiaoshicai.cn/wechat_pay_logo_in_wsb_app.png'}
                         onChange={event => {
                           if (event.target.checked) {
                             this.setState({pay_by: PAY_WECHAT_APP});
                           }
                         }}
                         extra={<Image style={style.wechat_thumb}
                                       source={require('../../img/wechat_pay_logo.png')}/>}>微信支付</RadioItem>
            </List>
          </ScrollView>
          <View style={{marginBottom: pxToDp(100)}}>
            <Button onPress={() => this.onPay()} type="primary"
                    disabled={!this.state.pay_by}
                    style={{
                      width: "90%",
                      marginLeft: "5%",
                      backgroundColor: colors.main_color,
                      borderWidth: 0
                    }}>{this.pay_by_text()}{this.state.to_fill_yuan || 0}元</Button>
          </View>
        </View>
      )
    } else {
      return null
    }

  }

  renderHeader() {
    if (this.state.showHeader) {
      return (
        <View style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: colors.fontColor,
        }}>
          <Text
            onPress={() => {
              this.setState({
                headerType: 1,
              })
            }}
            style={this.state.headerType === 1 ? [style.header_text, style.check_staus] : [style.header_text]}>微信充值</Text>
          <Text
            onPress={() => {
              this.setState({
                headerType: 2,
              })
            }}
            style={this.state.headerType !== 1 ? [style.header_text, style.check_staus] : [style.header_text]}>银行卡充值</Text>
        </View>
      )
    } else {
      return null
    }
  }


  componentWillUnmount() {

  }

  onHeaderRefresh() {

  }


  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }


  submit = () => {
    tool.debounces(() => {
      const navigation = this.props.navigation
      showModal('请求中')
      const {currStoreId, accessToken} = this.props.global;
      const {price, img, content} = this.state;
      let fromData = {
        price: price,
        img: img,
        content: content,
        store_id: currStoreId,
      }
      const api = `v1/new_api/WorkOrder/work_order_create?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then((res) => {
        this.setState({
          price: '',
          img: '',
          content: '',
        })
        showSuccess('提交成功');
      }, (res) => {
        showError('提交失败' + res);
        console.log('msg', res);
      })
    }, 1000)
  }

  renderUploadImg() {
    return <View style={[
      style.area_cell,
      {
        minHeight: pxToDp(215),
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: pxToDp(20),
        paddingTop: pxToDp(10),
        borderBottomWidth: 1,
        borderColor: colors.main_back
      }
    ]}>
      <View style={{
        height: pxToDp(170),
        width: pxToDp(170),
        flexDirection: "row",
        alignItems: "flex-end",
        borderWidth: pxToDp(3),
        borderColor: colors.fontGray,
        margin: pxToDp(10)
      }}>
        <TouchableOpacity
          style={{
            height: pxToDp(170),
            width: pxToDp(170),
            justifyContent: "center",
            paddingBottom: pxToDp(30),
          }}
          onPress={() => this.setState({showImgMenus: true})}>
          <Text style={{
            fontSize: pxToDp(200),
            color: "#bfbfbf",
            textAlign: "center"
          }}>+</Text>
        </TouchableOpacity>
      </View>

      {!!this.state.img &&
      <View style={{
        marginLeft: pxToDp(40),
        marginBottom: pxToDp(15),
        height: pxToDp(170),
        width: pxToDp(170),
        flexDirection: "row",
        alignItems: "flex-end"
      }}>
        <Image style={style.img_add} source={{uri: this.state.img}}/>
        <TouchableOpacity style={{position: "absolute", right: pxToDp(14), top: pxToDp(14)}} onPress={() => {
          this.setState({img: false});
        }}>
          <Icon name={"clear"} size={pxToDp(40)} style={{backgroundColor: "#fff"}} color={"#d81e06"} msg={false}/>
        </TouchableOpacity>
      </View>}

    </View>;
  }


  pickCameraImg() {
    this.setState({showImgMenus: false})
    ImagePicker.openCamera({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: false,
      includeExif: true
    }).then(image => {
      console.log("done upload image:", image)
      let image_path = image.path;
      let image_arr = image_path.split("/");
      let image_name = image_arr[image_arr.length - 1];
      this.startUploadImg(image_path, image_name);
    })
  }

  pickSingleImg() {
    this.setState({showImgMenus: false})
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: false,
      includeExif: true
    })
      .then(image => {

        console.log("done fetch image:", image)

        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[image_arr.length - 1];
        this.startUploadImg(image_path, image_name);
      })
      .catch(e => {
        console.log("error -> ", e);
      });
  }

  startUploadImg(imgPath, imgName) {
    showModal("图片上传中...")
    this.setState({newImageKey: tool.imageKey(imgName)})

    HttpUtils.get.bind(this.props)('/qiniu/getToken', {bucket: 'goods-image'}).then(res => {
      console.log(`upload done by token: ${imgPath}`)
      const params = {
        filePath: imgPath,
        upKey: this.state.newImageKey,
        upToken: res,
        zone: 1
      }
      QNEngine.setParams(params)
      QNEngine.startTask()
    }).catch(error => {
      Alert.alert('error', '图片上传失败！')
    })
  }

  renderBankCard() {
    if (this.state.headerType !== 1) {
      return (
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <ScrollView style={{flex: 1}} automaticallyAdjustContentInsets={false} showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}>
            <View style={{
              paddingLeft: pxToDp(30),
              paddingRight: pxToDp(30),
              marginTop: pxToDp(30),
              backgroundColor: colors.white
            }}>
              <View style={{
                flexDirection: 'row',
              }}>
                <Text style={[style.center]}>开户名称: </Text>
                <Text style={[style.center]}>北京家帮帮科技有限公司</Text>
              </View>
              <View style={{
                flexDirection: 'row',
              }}>
                <Text style={[style.center]}>开户银行: </Text>
                <Text style={[style.center]}>招商银行股份有限公司北京回龙观支行</Text>
              </View>
              <View style={{
                flexDirection: 'row',
              }}>
                <Text style={[style.center]}>开户账户: </Text>
                <Text style={[style.center, {flex: 1}]}>1109 1915 0410 101</Text>
                <Text onPress={() => {
                  this.copyReceiveSecretKey();
                }} style={[style.center, {color: colors.main_color}]}>一键复制</Text>
              </View>
              <Text style={[style.center, {color: colors.title_color, fontSize: pxToDp(35)}]}>温馨提示:</Text>
              <Text style={{flexDirection: 'row', marginBottom: pxToDp(30)}}>
                <Text style={[style.text]}>转账前请仔细检查</Text>
                <Text style={[style.text, {color: colors.warn_red}]}>银行信息</Text>
                <Text style={[style.text]}>,</Text>
                <Text style={[style.text, {color: colors.warn_red}]}>银行账号</Text>
                <Text style={[style.text]}>是否填写正确,确保可以实时到账,转账成功后</Text>
                <Text style={[style.text, {color: colors.warn_red}]}>请及时填写转账信息</Text>
                <Text style={[style.text]}>,外送帮将自动给运营创建工单,方便运营及时核对账单,及时充值。</Text>
              </Text>
            </View>

            <View style={{
              paddingLeft: pxToDp(30),
              paddingRight: pxToDp(30),
              marginTop: pxToDp(20),
              paddingTop: pxToDp(10),
              backgroundColor: colors.white
            }}>
              <View style={{flexDirection: 'row', width: "100%"}}>
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(12), color: colors.warn_red}}>*</Text>
                <Text style={[style.center, {fontSize: pxToDp(35), height: 40}]}>转账金额：</Text>
                <View style={{flex: 1}}></View>
                <View>
                  <Input onChangeText={(price) => this.setState({price})}
                         value={this.state.price}
                         style={{
                           width: pxToDp(400),
                           height: 40,
                           textAlign: 'right',
                         }}
                         keyboardType="numeric"
                         placeholder="请输入转账金额"
                         underlineColorAndroid='transparent' //取消安卓下划线
                  />
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>*</Text>
                <Text style={[style.center, {fontSize: pxToDp(35),}]}>转账凭证：</Text>
              </View>
              <View style={{
                margin: pxToDp(20),
                marginTop: pxToDp(1),
                borderWidth: pxToDp(3),
                borderColor: colors.fontGray
              }}>
                {this.renderUploadImg()}
              </View>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>*</Text>
                  <Text style={[style.center, {fontSize: pxToDp(35),}]}>备注信息：</Text>
                </View>
              </View>
              <TextareaItem style={{
                margin: pxToDp(20),
                marginTop: pxToDp(1),
                borderWidth: pxToDp(3),
                borderColor: colors.fontGray
              }} rows={4}
                            placeholder="转账备注" value={this.state.content}
                            onChange={(content) => this.setState({content})}
              />
            </View>
          </ScrollView>
          <View style={{marginBottom: pxToDp(20)}}>
            <Button onPress={() => this.submit()} type="primary"
                    style={{
                      width: "90%",
                      marginLeft: "5%",
                      backgroundColor: colors.main_color,
                      borderWidth: 0
                    }}>确定</Button>
          </View>
          <ActionSheet visible={this.state.showImgMenus} onRequestClose={() => {
            this.setState({showImgMenus: false})
          }}
                       menus={[{label: '拍照', onPress: this.pickCameraImg.bind(this)}, {
                         label: '从相册选择',
                         onPress: this.pickSingleImg.bind(this)
                       }]}
                       actions={[{label: '取消', onPress: () => this.setState({showImgMenus: false})}]}
          />
        </View>
      )
    } else {
      return null
    }

  }


  render() {
    return (<View style={{flex: 1}}>

        {this.renderHeader()}
        {this.renderWechat()}
        {this.renderBankCard()}
        {this.state.headerType === 1 && this.state.paid_done === PAID_OK &&
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>支付完成!</Text>
          </View>
          <Button onPress={() => this.onToExpense()} type="ghost">查看余额</Button>
        </View>}

        {this.state.headerType === 1 && this.state.paid_done === PAID_FAIL &&
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>支付失败!</Text>
          </View>
          <Button onPress={() => this.onToExpense()} type="warning">返回账单</Button>
        </View>}
      </View>
    );
  }
}

const style = StyleSheet.create({
  wechat_thumb: {
    width: pxToDp(60), height: pxToDp(60)
  },
  header_text: {
    height: 40,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 40,
      },
      android: {}
    }),
  },

  center: {
    height: 30,
    fontSize: pxToDp(30),
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.listTitleColor,
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 30,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color,
    // borderBottomWidth: pxToDp(6),
    // borderBottomColor: colors.main_color
  },

  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  text: {
    fontSize: pxToDp(25)
  },
  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    justifyContent: "space-around",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedAccountFill)
