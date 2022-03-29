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
import {Button, InputItem, List, TextareaItem} from '@ant-design/react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import * as wechat from 'react-native-wechat-lib'
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import Config from "../../pubilc/common/config";
import Input from "@ant-design/react-native/es/input-item/Input";
import {QNEngine} from "../../util/QNEngine";
import {tool} from "../../common";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-crop-picker";
import {ActionSheet} from "../../weui";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Alipay from '@uiw/react-native-alipay';


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
const PAY_ALI_APP = 'alipay';
const PAID_OK = 1;
const PAID_FAIL = 2;
const PAID_WAIT = 0;

class SeparatedAccountFill extends PureComponent {

  constructor(props: Object) {
    super(props);
    this.state = {
      to_fill_yuan: '100',
      pay_by: PAY_ALI_APP,
      paid_done: PAID_WAIT,
      showHeader: true,
      headerType: 1,
      price: 0,
      img: '',
      content: '',
      showImgMenus: false,
    }
  }

  componentDidMount(): void {
    wechat.registerApp(Config.APP_ID, Config.universalLink).then(r => console.log("register done:", r));

    Alipay.setAlipayScheme("wsbpaycncainiaoshicaicrm");

    let {navigation} = this.props;
    navigation.setParams({
      upLoad: this.upLoad,
      startScan: this.startScan,
    });

    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: (data) => {
        this.setState({loadingPercent: Number(data.percent * 100) + '%'})
      },
      onComplete: (data) => {
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
    // let text = '开户名称：北京家帮帮科技有限公司\n' +
    //   '开户银行：招商银行股份有限公司北京回龙观支行\n' +
    //   '开户账号：1109 1915 0410 101\n';

    let text = '1109 1915 0410 101';
    Clipboard.setString(text)
    ToastLong('已复制到剪切板')
  }

  onPay() {
    if (this.state.to_fill_yuan < 1) {
      showError("充值金额不应少于1元");
      return;
    }
    if (this.state.pay_by === PAY_WECHAT_APP) {
      this.wechatPay()
    } else {
      this.aliPay()
    }

  }

  aliPay() {
    const {accessToken, currStoreId} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    showModal("支付跳转中...")
    const url = `/api/gen_pay_app_order/${this.state.to_fill_yuan}/alipay-app.json?access_token=${accessToken}&vendor_id={${currVendorId}}&store_id=${currStoreId}`;
    HttpUtils.post.bind(this.props)(url).then(async res => {
      hideModal();
      const resule = await Alipay.alipay(res.result);
      if (resule.resultStatus === '4000') {
        ToastLong("请先安装支付宝应用")
      } else if (resule.resultStatus === "9000") {
        ToastShort("支付成功")
        this.PayCallback(PAID_OK)
      } else {
        ToastLong(`支付失败`);
        this.PayCallback(PAID_FAIL)
      }
    }, () => {
      hideModal();
    })
  }

  PayCallback(code) {
    this.setState({paid_done: code}, () => {
      if (this.props.route.params.onBack) {
        this.props.route.params.onBack(true)
        this.props.navigation.goBack()
      }
    })
  }

  wechatPay() {
    const self = this;
    wechat.isWXAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          const {accessToken} = self.props.global;
          const url = `api/gen_pay_app_order/${self.state.to_fill_yuan}?access_token=${accessToken}`;
          HttpUtils.post.bind(self.props)(url).then(res => {
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
                self.PayCallback(PAID_OK)
              }
            }).catch((err) => {
              console.log(err, "params", params);
              ToastLong(`支付失败:${err}`);
              self.PayCallback(PAID_FAIL)

            });
          });
        } else {
          Alert.alert('没有安装微信软件，请您安装微信之后再试');
        }
      });
  }

  pay_by_text() {
    return this.state.pay_by === PAY_WECHAT_APP ? '微信支付' : '支付宝支付';
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
            <View style={{padding: pxToDp(20), marginTop: pxToDp(30)}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>请选择支付方式 </Text>

              <TouchableOpacity onPress={() => {
                this.setState({
                  pay_by: PAY_ALI_APP
                })
              }} style={{
                flexDirection: "row",
                borderRadius: pxToDp(15),
                padding: pxToDp(10),
                marginTop: pxToDp(20),
                backgroundColor: colors.white
              }}>
                <FontAwesome5 size={40} name={'alipay'}
                              style={{color: '#1777ff', margin: pxToDp(10)}}/>
                <View style={{marginVertical: pxToDp(10), marginLeft: pxToDp(20)}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontSize: 16}}>支付宝 </Text>
                    <View style={{
                      backgroundColor: "#ff6011",
                      paddingHorizontal: pxToDp(3),
                      padding: pxToDp(5),
                      borderRadius: pxToDp(8),
                    }}>
                      <Text style={{
                        fontSize: 14,
                        color: colors.white,
                        textAlign: 'center',
                        textAlignVertical: "center",
                      }}>推荐 </Text>
                    </View>
                  </View>
                  <Text style={{color: colors.fontColor, marginTop: pxToDp(5)}}>10亿人都在用，真安全，更放心  </Text>
                </View>
                <View style={{flex: 1}}></View>
                {this.state.pay_by === PAY_ALI_APP ?
                  <FontAwesome5 size={20} name={'check-circle'}
                                style={{
                                  color: colors.main_color,
                                  marginVertical: pxToDp(25),
                                  marginRight: pxToDp(10)
                                }}/>
                  : <FontAwesome5 size={20} name={'circle'}
                                  style={{
                                    color: colors.main_color,
                                    marginVertical: pxToDp(25),
                                    marginRight: pxToDp(10)
                                  }}/>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                this.setState({
                  pay_by: PAY_WECHAT_APP
                })
              }} style={{
                flexDirection: "row",
                borderRadius: pxToDp(15),
                padding: pxToDp(10),
                marginTop: pxToDp(20),
                backgroundColor: colors.white
              }}>
                <FontAwesome5 size={35} name={'weixin'}
                              style={{color: '#00c250', margin: pxToDp(10)}}/>
                <View style={{marginVertical: pxToDp(10), marginLeft: pxToDp(15)}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontSize: 16}}>微信支付 </Text>
                  </View>
                  <Text style={{color: colors.fontColor, marginTop: pxToDp(10)}}>打开微信进行支付 </Text>
                </View>
                <View style={{flex: 1}}></View>

                {this.state.pay_by === PAY_WECHAT_APP ?
                  <FontAwesome5 size={20} name={'check-circle'}
                                style={{
                                  color: colors.main_color,
                                  marginVertical: pxToDp(25),
                                  marginRight: pxToDp(10)
                                }}/>
                  : <FontAwesome5 size={20} name={'circle'}
                                  style={{
                                    color: colors.main_color,
                                    marginVertical: pxToDp(25),
                                    marginRight: pxToDp(10)
                                  }}/>
                }
              </TouchableOpacity>
            </View>

            {/*<List renderHeader={'支付方式'}>*/}
            {/*  <RadioItem checked={this.state.pay_by === PAY_WECHAT_APP}*/}
            {/*             thumb={'https://qiniu.cainiaoshicai.cn/wechat_pay_logo_in_wsb_app.png'}*/}
            {/*             onChange={event => {*/}
            {/*               if (event.target.checked) {*/}
            {/*                 this.setState({pay_by: PAY_WECHAT_APP});*/}
            {/*               }*/}
            {/*             }}*/}
            {/*             extra={<Image style={style.wechat_thumb}*/}
            {/*                           source={require('../../img/wechat_pay_logo.png')}/>}>微信支付</RadioItem>*/}
            {/*</List>*/}
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
    if (this.state.showHeader && this.state.paid_done === PAID_WAIT) {
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
            style={this.state.headerType === 1 ? [style.header_text] : [style.header_text, style.check_staus]}>微信/支付宝 </Text>
          <Text
            onPress={() => {
              this.setState({
                headerType: 2,
              })
            }}
            style={this.state.headerType === 2 ? [style.header_text] : [style.header_text, style.check_staus]}>手机银行转账 </Text>

        </View>
      )
    } else {
      return null
    }
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
            marginTop: pxToDp(30),
            fontSize: pxToDp(50),
            color: "#bfbfbf",
            textAlign: "center"
          }}>+ </Text>
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


  pickSingleImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: false,
        includeExif: true
      })
        .then(image => {
          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[image_arr.length - 1];
          this.startUploadImg(image_path, image_name);
        })
    }, 1000)

  }

  pickCameraImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: false,
        includeExif: true
      }).then(image => {
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[image_arr.length - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }


  startUploadImg(imgPath, imgName) {
    showModal("图片上传中...")
    this.setState({newImageKey: tool.imageKey(imgName)})

    HttpUtils.get.bind(this.props)('/qiniu/getToken', {bucket: 'goods-image'}).then(res => {
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
    if (this.state.headerType === 2) {
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
                <Text style={[style.center]}>开户名称:  </Text>
                <Text style={[style.center]}>北京家帮帮科技有限公司 </Text>
              </View>
              <View style={{
                flexDirection: 'row',
              }}>
                <Text style={[style.center]}>开户银行:  </Text>
                <Text style={[style.center]}>招商银行股份有限公司北京回龙观支行 </Text>
              </View>
              <View style={{
                flexDirection: 'row',
              }}>
                <Text style={[style.center]}>开户账户:  </Text>
                <Text style={[style.center, {flex: 1}]}>1109 1915 0410 101 </Text>
                <Text onPress={() => {
                  this.copyReceiveSecretKey();
                }} style={[style.center, {color: colors.main_color}]}>一键复制 </Text>
              </View>
              <Text style={[style.center, {color: colors.title_color, fontSize: pxToDp(35)}]}>温馨提示: </Text>
              <Text style={{flexDirection: 'row', marginBottom: pxToDp(30)}}>
                <Text style={[style.text]}>转账前请仔细检查 </Text>
                <Text style={[style.text, {color: colors.warn_red}]}>银行信息 </Text>
                <Text style={[style.text]}>, </Text>
                <Text style={[style.text, {color: colors.warn_red}]}>银行账号 </Text>
                <Text style={[style.text]}>是否填写正确,确保可以实时到账,转账成功后 </Text>
                <Text style={[style.text, {color: colors.warn_red}]}>请及时填写转账信息 </Text>
                <Text style={[style.text]}>,外送帮将自动给运营创建工单,方便运营及时核对账单,及时充值。 </Text>
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
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(12), color: colors.warn_red}}>* </Text>
                <Text style={[style.center, {fontSize: pxToDp(35), height: 40}]}>汇款金额： </Text>
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
                         placeholder="请输入汇款金额"
                         underlineColorAndroid='transparent' //取消安卓下划线
                  />
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>* </Text>
                <Text style={[style.center, {fontSize: pxToDp(35),}]}>汇款凭证： </Text>
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
                  <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>* </Text>
                  <Text style={[style.center, {fontSize: pxToDp(35),}]}>备注信息： </Text>
                </View>
              </View>
              <TextareaItem style={{
                margin: pxToDp(20),
                marginTop: pxToDp(1),
                borderWidth: pxToDp(3),
                borderColor: colors.fontGray
              }} rows={4}
                            placeholder="汇款备注" value={this.state.content}
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
            <Text>支付完成! </Text>
          </View>
          <Button onPress={() => this.onToExpense()} type="ghost">查看余额</Button>
        </View>}
        {this.state.headerType === 1 && this.state.paid_done === PAID_FAIL &&
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>支付失败! </Text>
          </View>
          <Button onPress={() => {
            if (this.props.route.params.onBack) {
              this.props.route.params.onBack(false)
            }
            this.props.navigation.goBack()
          }} type="warning">返回</Button>
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
    backgroundColor: colors.main_color,
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
