import React, {PureComponent} from 'react'
import {
  Alert,
  Dimensions,
  Image,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {InputItem, TextareaItem} from '@ant-design/react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import * as wechat from 'react-native-wechat-lib'
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import Input from "@ant-design/react-native/es/input-item/Input";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import tool from "../../../pubilc/util/tool";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-crop-picker";
import {ActionSheet} from "../../../weui";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Alipay from '@uiw/react-native-alipay';
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import {Button} from "react-native-elements";
import {imageKey} from "../../../pubilc/util/md5";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
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
const width = Dimensions.get("window").width;

class SeparatedAccountFill extends PureComponent {

  constructor(props: Object) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('三方支付')
    this.state = {
      to_fill_yuan: '',
      pay_by: PAY_ALI_APP,
      paid_done: PAID_WAIT,
      showHeader: true,
      headerType: 1,
      price: 0,
      img: '',
      content: '',
      showImgMenus: false,
      showAmountInput: false,
      recharge_amount: [
        {label: '100元', value: '100'},
        {label: '200元', value: '200'},
        {label: '500元', value: '500'},
        {label: '1000元', value: '1000'},
        {label: '2000元', value: '2000'},
        {label: '其他金额', value: '0'}
      ]
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

  onToExpense = () => {
    this.onPress(Config.ROUTE_SEP_EXPENSE);
  }

  copyReceiveSecretKey() {
    // let text = '开户名称：北京家帮帮科技有限公司\n' +
    //   '开户银行：招商银行股份有限公司北京回龙观支行\n' +
    //   '开户账号：1109 1915 0410 101\n';

    let text = '1109 1915 0410 101';
    Clipboard.setString(text)
    ToastLong('已复制到剪切板')
  }

  onPay = () => {
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

  aliPay = () => {
    const {accessToken, currStoreId} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    showModal("支付跳转中...")
    const url = `/api/gen_pay_app_order/${this.state.to_fill_yuan}/alipay-app.json?access_token=${accessToken}&vendor_id=${currVendorId}&store_id=${currStoreId}`;
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

  PayCallback = (code) => {
    this.setState({paid_done: code}, () => {
      if (this.props.route.params.onBack) {
        this.props.route.params.onBack(true)
        this.props.navigation.goBack()
      }
    })
  }

  wechatPay = () => {
    wechat.isWXAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          const {accessToken} = this.props.global;
          const url = `api/gen_pay_app_order/${this.state.to_fill_yuan}?access_token=${accessToken}`;
          HttpUtils.post.bind(this.props)(url).then(res => {
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
              if (requestJson.errCode === 0) {
                ToastLong('支付成功');
                this.PayCallback(PAID_OK)
              }
            }).catch((err) => {
              ToastLong(`支付失败:${err}`);
              this.PayCallback(PAID_FAIL)

            });
          });
        } else {
          Alert.alert('没有安装微信软件，请您安装微信之后再试');
        }
      });
  }

  pay_by_text = () => {
    return this.state.pay_by === PAY_WECHAT_APP ? '微信支付' : '支付宝支付';
  }

  selectAliPay = () => {
    this.mixpanel.track('使用支付宝充值')
    this.setState({
      pay_by: PAY_ALI_APP
    })
  }

  selectWechat = () => {
    this.mixpanel.track('使用微信充值')
    this.setState({
      pay_by: PAY_WECHAT_APP
    })
  }

  fallInAmount = (val, idx) => {
    this.setState({
      showAmountInput: false
    })
    let amountArrCopy = [...this.state.recharge_amount]
    amountArrCopy.forEach(item => {
      item.bgc = '#ffffff'
      item.titleColor = '#333'
    })
    amountArrCopy[idx].bgc = '#59B26A'
    amountArrCopy[idx].titleColor = '#fff'
    this.setState({
      recharge_amount: amountArrCopy,
      to_fill_yuan: val
    })
    if (val === '0') {
      this.setState({
        showAmountInput: true,
        to_fill_yuan: ''
      })
    }
  }

  renderWechat() {
    let {showAmountInput, recharge_amount} = this.state
    if (this.state.paid_done === PAID_WAIT && this.state.headerType === 1) {
      return (
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <KeyboardAwareScrollView enableOnAndroid={false} style={{flex: 1}} automaticallyAdjustContentInsets={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}>
            <View style={style.item_body}>
              <View style={style.item_head}>
                <Text style={style.item_title}> 支付方式 </Text>
              </View>
              <TouchableOpacity onPress={() => this.selectAliPay()} style={style.alipay}>
                <FontAwesome5 size={40} name={'alipay'} style={style.alipayIcon}/>
                <View style={style.alipayContent}>
                  <View style={style.flexRow}>
                    <Text style={{fontSize: 16}}>支付宝 </Text>
                    <View style={style.recommend}>
                      <Text style={style.recommendText}>推荐 </Text>
                    </View>
                  </View>
                  <Text style={style.recommendDesc}>10亿人都在用，真安全，更放心 </Text>
                </View>
                <View style={{flex: 1}}/>
                {this.state.pay_by === PAY_ALI_APP ?
                  <FontAwesome5 size={20} name={'check-circle'} style={style.circle}/> :
                  <FontAwesome5 size={20} name={'circle'} style={style.circle}/>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.selectWechat()} style={style.alipay}>
                <FontAwesome5 size={35} name={'weixin'}
                              style={style.wechatIcon}/>
                <View style={{marginVertical: pxToDp(10), marginLeft: pxToDp(15)}}>
                  <View style={style.flexRow}>
                    <Text style={{fontSize: 16}}>微信支付 </Text>
                  </View>
                  <Text style={style.recommendDesc}>打开微信进行支付 </Text>
                </View>
                <View style={{flex: 1}}/>

                {this.state.pay_by === PAY_WECHAT_APP ?
                  <FontAwesome5 size={20} name={'check-circle'}
                                style={style.circle}/>
                  : <FontAwesome5 size={20} name={'circle'}
                                  style={style.circle}/>
                }
              </TouchableOpacity>
            </View>
            <View style={style.item_body}>
              <View style={style.item_head}>
                <Text style={style.item_title}> 充值金额 </Text>
              </View>

              <View style={style.btnList}>
                <For each="item" index="idx" of={recharge_amount}>
                  <Button title={item.label} key={idx}
                          onPress={() => this.fallInAmount(item.value, idx)}
                          buttonStyle={[style.modalBtn, {backgroundColor: item.bgc ? item.bgc : colors.white}]}
                          titleStyle={{
                            color: item.titleColor ? item.titleColor : colors.color333,
                            fontSize: 16
                          }}
                  />
                </For>
              </View>
              <If condition={showAmountInput}>
                <View style={{marginTop: 5}}>
                  <InputItem clear error={this.state.to_fill_yuan <= 0} type="number" value={this.state.to_fill_yuan}
                             onChange={to_fill_yuan => {
                               this.setState({to_fill_yuan});
                             }}
                             style={{
                               width: width * 0.5,
                               borderBottomWidth: 1,
                               borderColor: colors.color999,
                               borderRadius: 2
                             }}
                             extra="元"
                             placeholder=" 其他金额">
                  </InputItem>
                </View>
              </If>
            </View>

          </KeyboardAwareScrollView>
          <View style={{marginBottom: pxToDp(100)}}>
            <Button onPress={() => this.onPay()}
                    disabled={!this.state.pay_by}
                    title={`${this.pay_by_text()}${this.state.to_fill_yuan || 0}元`}
                    titleStyle={{fontSize: 16, color: colors.white}}
                    buttonStyle={style.payBtn}/>
          </View>
        </View>
      )
    } else {
      return null
    }

  }

  wechatAndAliPay = () => {
    this.setState({
      headerType: 1,
    })
    this.mixpanel.track('三方支付')
  }

  mobileBank = () => {
    this.setState({
      headerType: 2,
    })
    this.mixpanel.track('手机银行支付')
  }

  renderHeader = () => {
    if (this.state.showHeader && this.state.paid_done === PAID_WAIT) {
      return (
        <View style={style.headerContent}>
          <Text onPress={() => this.wechatAndAliPay()}
                style={this.state.headerType === 1 ? [style.header_text] : [style.header_text, style.check_staus]}>
            微信/支付宝
          </Text>
          <Text onPress={() => this.mobileBank()}
                style={this.state.headerType === 2 ? [style.header_text] : [style.header_text, style.check_staus]}>
            手机银行转账
          </Text>

        </View>
      )
    } else {
      return null
    }
  }

  onPress = (route, params = {}, callback = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  submit = () => {
    tool.debounces(() => {
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
        showError('提交失败' + res.reason);
      })
    }, 1000)
  }

  renderUploadImg = () => {
    return <View style={[style.area_cell, style.uploadImg]}>
      <View style={style.uploadInfo}>
        <TouchableOpacity
          style={style.showImgMenus}
          onPress={() => this.setState({showImgMenus: true})}>
          <Text style={style.uploadIcon}>+ </Text>
        </TouchableOpacity>
      </View>

      <If condition={!!this.state.img}>
        <View style={style.upload_img}>
          <Image style={style.img_add} source={{uri: this.state.img}}/>
          <TouchableOpacity style={{position: "absolute", right: pxToDp(14), top: pxToDp(14)}} onPress={() => {
            this.setState({img: false});
          }}>
            <Icon name={"clear"} size={pxToDp(40)} style={{backgroundColor: "#fff"}} color={"#d81e06"} msg={false}/>
          </TouchableOpacity>
        </View>
      </If>

    </View>;
  }

  imgMenusFlag = (flag) => {
    this.setState({
      showImgMenus: flag
    })
  }

  pickSingleImg = () => {
    this.imgMenusFlag(false)
    setTimeout(() => {
      ImagePicker.openPicker(tool.pickImageOptions(true))
        .then(image => {
          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[tool.length(image_arr) - 1];
          this.startUploadImg(image_path, image_name);
        })
    }, 1000)

  }

  pickCameraImg = () => {
    this.imgMenusFlag(false)
    setTimeout(() => {
      ImagePicker.openCamera(tool.pickImageOptions(true)).then(image => {
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[tool.length(image_arr) - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }


  startUploadImg = (imgPath, imgName) => {
    showModal("图片上传中...")
    this.setState({newImageKey: imageKey(imgName)})

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

  renderBankCard = () => {
    if (this.state.headerType === 2) {
      return (
        <View style={{flex: 1}}>
          <KeyboardAwareScrollView enableOnAndroid={false}
                                   automaticallyAdjustContentInsets={false}
                                   showsHorizontalScrollIndicator={false}
                                   showsVerticalScrollIndicator={false}>
            <View style={style.bankCard}>
              <View style={style.flexRow}>
                <Text style={[style.center]}>开户名称: </Text>
                <Text style={[style.center]}>北京家帮帮科技有限公司 </Text>
              </View>
              <View style={{flexDirection: 'row',}}>
                <Text style={[style.center]}>开户银行: </Text>
                <Text style={[style.center]}>招商银行股份有限公司北京回龙观支行 </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={[style.center]}>开户账户: </Text>
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

            <View style={style.priceCard}>
              <View style={{flexDirection: 'row', width: "100%"}}>
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(12), color: colors.warn_red}}>* </Text>
                <Text style={[style.center, {fontSize: pxToDp(35), height: 40}]}>汇款金额： </Text>
                <View style={{flex: 1}}/>
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
              <View style={style.flexRow}>
                <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>* </Text>
                <Text style={[style.center, {fontSize: pxToDp(35),}]}>汇款凭证： </Text>
              </View>
              <View style={style.uploadCard}>
                {this.renderUploadImg()}
              </View>
              <View>
                <View style={style.flexRow}>
                  <Text style={{fontSize: pxToDp(50), paddingTop: pxToDp(5), color: colors.warn_red}}>* </Text>
                  <Text style={[style.center, {fontSize: pxToDp(35),}]}>备注信息： </Text>
                </View>
              </View>
              <TextareaItem style={style.textarea} rows={4}
                            placeholder="汇款备注" value={this.state.content}
                            onChange={(content) => this.setState({content})}
              />
            </View>
          </KeyboardAwareScrollView>
          <View style={{marginBottom: pxToDp(20)}}>
            <Button onPress={() => this.submit()}
                    disabled={!this.state.pay_by}
                    title={"确定"}
                    titleStyle={{fontSize: 16, color: colors.white}}
                    buttonStyle={style.btnSure}/>
          </View>
          <ActionSheet visible={this.state.showImgMenus} onRequestClose={() => this.imgMenusFlag(false)}
                       menus={[{label: '拍照', onPress: this.pickCameraImg.bind(this)}, {
                         label: '从相册选择',
                         onPress: this.pickSingleImg.bind(this)
                       }]}
                       actions={[{label: '取消', onPress: () => this.imgMenusFlag(false)}]}
          />
        </View>
      )
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
            <Text style={{color: colors.color333}}>支付完成! </Text>
          </View>
          <Button onPress={() => this.onToExpense()}
                  title={"查看余额"}
                  titleStyle={{fontSize: 16, color: colors.white}}
                  buttonStyle={style.payBtn}/>
        </View>}
        {this.state.headerType === 1 && this.state.paid_done === PAID_FAIL &&
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: colors.color333}}>支付失败! </Text>
          </View>
          <Button onPress={() => {
            if (this.props.route.params.onBack) {
              this.props.route.params.onBack(false)
            }
            this.props.navigation.goBack()
          }}
                  title={"返回"}
                  titleStyle={{fontSize: 16, color: colors.white}}
                  buttonStyle={{
                    backgroundColor: colors.warn_color,
                    borderWidth: 0
                  }}/>
        </View>}
      </View>
    );
  }
}

const style = StyleSheet.create({
  flexRow: {
    flexDirection: "row"
  },
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
  item_body: {
    backgroundColor: colors.white,
    width: width * 0.96,
    marginLeft: width * 0.02,
    marginTop: width * 0.04,
    borderRadius: 8,
    marginBottom: 10,
  },
  item_head: {
    borderBottomWidth: 1,
    paddingBottom: 2,
    borderColor: colors.colorEEE
  },
  item_title: {
    color: colors.color333,
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
  },
  alipay: {
    flexDirection: "row",
    borderRadius: pxToDp(15),
    padding: pxToDp(10),
    marginTop: pxToDp(20),
    backgroundColor: colors.white
  },
  alipayIcon: {color: '#1777ff', margin: pxToDp(10)},
  wechatIcon: {color: '#00c250', margin: pxToDp(10)},
  alipayContent: {marginVertical: pxToDp(10), marginLeft: pxToDp(20)},
  recommend: {
    backgroundColor: "#ff6011",
    paddingHorizontal: pxToDp(3),
    padding: pxToDp(5),
    borderRadius: pxToDp(8),
  },
  recommendText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    textAlignVertical: "center",
  },
  recommendDesc: {color: colors.fontColor, marginTop: pxToDp(5)},
  circle: {
    color: colors.main_color,
    marginVertical: pxToDp(25),
    marginRight: pxToDp(10)
  },
  btnList: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    flex: 1,
    alignItems: 'center',
    flexWrap: "wrap",
  },
  modalBtn: {
    width: width * 0.25,
    marginTop: 8,
    borderRadius: pxToDp(10),
    borderWidth: pxToDp(1),
    borderColor: colors.color999
  },
  payBtn: {
    width: width * 0.9,
    marginLeft: width * 0.05,
    backgroundColor: colors.main_color,
    borderWidth: 0
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.fontColor,
  },
  uploadImg: {
    minHeight: pxToDp(215),
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: pxToDp(20),
    paddingTop: pxToDp(10),
    borderBottomWidth: 1,
    borderColor: colors.main_back
  },
  uploadInfo: {
    height: pxToDp(170),
    width: pxToDp(170),
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: pxToDp(3),
    borderColor: colors.fontGray,
    margin: pxToDp(10)
  },
  showImgMenus: {
    height: pxToDp(170),
    width: pxToDp(170),
    justifyContent: "center",
    paddingBottom: pxToDp(30),
  },
  uploadIcon: {
    marginTop: pxToDp(30),
    fontSize: pxToDp(50),
    color: "#bfbfbf",
    textAlign: "center"
  },
  upload_img: {
    marginLeft: pxToDp(40),
    marginBottom: pxToDp(15),
    height: pxToDp(170),
    width: pxToDp(170),
    flexDirection: "row",
    alignItems: "flex-end"
  },
  bankCard: {
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30),
    marginTop: pxToDp(30),
    backgroundColor: colors.white
  },
  priceCard: {
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30),
    marginTop: pxToDp(20),
    paddingTop: pxToDp(10),
    backgroundColor: colors.white
  },
  uploadCard: {
    margin: pxToDp(20),
    marginTop: pxToDp(1),
    borderWidth: pxToDp(3),
    borderColor: colors.fontGray
  },
  textarea: {
    margin: pxToDp(20),
    marginTop: pxToDp(1),
    borderWidth: pxToDp(3),
    borderColor: colors.fontGray
  },
  btnSure: {
    width: width * 0.9,
    marginLeft: width * 0.05,
    backgroundColor: colors.main_color,
    borderWidth: 0
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedAccountFill)
