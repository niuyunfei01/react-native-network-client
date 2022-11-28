import React, {PureComponent} from "react";
import {
  Alert,
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {connect} from "react-redux";
import {hideModal, showError, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";
import {Dialog} from "../../../weui";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import {MixpanelInstance} from '../../../pubilc/util/analytics';
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Config from "../../../pubilc/common/config";
import tool from "../../../pubilc/util/tool";
import {Button} from "react-native-elements";
import BottomModal from "../../../pubilc/component/BottomModal";
import {SvgXml} from "react-native-svg";
import {
  check_circle_icon,
  cross_circle_icon,
  empty_data,
  platformLogoEleme,
  platformLogoJD,
  platformLogoMeiTuan,
  platformLogoTaoXianDa,
  platformLogoWechat,
  platformLogoWSB
} from "../../../svg/svg";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}


const timeOptions = [
  {label: '30分钟', value: 30, key: 30},
  {label: '1小时', value: 60, key: 60},
  {label: '2小时', value: 120, key: 120},
  {label: '4小时', value: 240, key: 240},
  {label: '8小时', value: 480, key: 480},
  {label: '5天', value: 432000, key: 432000},
  {label: '10天', value: 864000, key: 864000},
  {label: '15天', value: 1296000, key: 1296000},
  {label: '关到下班前', value: 'CLOSE_TO_OFFLINE', key: 'CLOSE_TO_OFFLINE'},
  {label: '停止营业', value: 'STOP_TO_BUSINESS', key: 'STOP_TO_BUSINESS'},
  {label: '申请下线', value: 'APPLY_FOR_OFFLINE', key: 'APPLY_FOR_OFFLINE'}
]

class StoreStatusScene extends PureComponent {
  buttons = [{
    type: 'default',
    label: '取消',
    sty: {
      borderColor: 'gray',
      borderWidth: 0.5,
    },
    onPress: () => this.setState({dialogVisible: false})
  }, {
    type: 'primary',
    label: '允许',
    sty: {
      backgroundColor: colors.b2,
      borderColor: 'gray',
      borderWidth: 0.5,
    },
    textsty: {
      color: colors.white,
    },
    onPress: () => this.setState({dialogVisible: false}, () => {
      this.setAutoTaskOrder()
    })
  }]

  constructor(props) {
    super(props)
    let {is_service_mgr} = tool.vendor(this.props.global);
    this.state = {
      all_close: false,
      all_open: false,
      allow_self_open: false,
      business_status: [],
      loading: false,
      show_body: false,
      allow_merchants_store_bind: false,
      is_service_mgr: is_service_mgr,
      dialogVisible: false,
      suspend_confirm_order: false,
      total_wm_stores: 0,
      allow_store_mgr_call_ship: false,
      modal: false,
      alert_msg: ''
    }
    this.mixpanel = MixpanelInstance;
  }

  componentDidMount() {
    const {navigation, global} = this.props
    let {store_id, vendor_id} = global
    let {is_service_mgr} = tool.vendor(this.props.global);
    let {total_wm_stores} = this.state;
    this.mixpanel.track("mine.wm_store_list", {store_id, vendor_id, total_wm_stores});
    navigation.setOptions({
      headerRight: () => {
        if (this.state.show_body && (this.state.allow_merchants_store_bind || is_service_mgr)) {
          return <TouchableOpacity style={{flexDirection: 'row'}}
                                   onPress={() => {
                                     this.onPress(Config.PLATFORM_BIND)
                                     this.mixpanel.track("mine.wm_store_list.click_add", {store_id, vendor_id});
                                   }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 15, color: colors.main_color,}}>绑定外卖店铺 </Text>
              <Entypo name='chevron-thin-right' style={[styles.right_btn]}/>
            </View>
          </TouchableOpacity>
        }
      }
    })
    this.focus = navigation.addListener('focus', () => {
      this.fetchData()
    })

  }


  componentWillUnmount() {
    this.focus()
  }

  fetchData = () => {
    const {accessToken, store_id} = this.props.global
    this.setState({
      loading: true,
    })
    const api = `/api/get_store_business_status/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      let show_body = false;
      if (tool.length(res.business_status) > 0) {
        show_body = true
      }

      this.setState({
        loading: false,
        all_close: res.all_close,
        all_open: res.all_open,
        allow_self_open: res.allow_self_open,
        business_status: res.business_status,
        show_body: show_body,
        allow_merchants_store_bind: res.allow_merchants_store_bind === '1',
        total_wm_stores: tool.length(res.business_status),
        allow_store_mgr_call_ship: res.allow_store_mgr_call_ship === '0',
        alert_msg: res.alert_msg,
      })
      const {updateStoreStatusCb = undefined} = this.props.route.params;
      if (updateStoreStatusCb) {
        updateStoreStatusCb(res)
      }
      this.props.navigation.setParams({
        allow_edit: res.allow_edit_store
      })
      hideModal()
    }).catch(() => {
      hideModal()
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  openStore() {
    showModal('请求中...')
    const {accessToken, store_id} = this.props.global
    const api = `/api/open_store/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then(() => {
      hideModal()
      this.fetchData()
      showSuccess('操作成功')
    }).catch(() => {
      showError('操作失败')
    })
  }

  closeModal = () => {
    this.setState({
      modal: false
    })
  }

  showAlert() {
    Alert.alert('提示', '•兼容模式支持在外送帮呼叫 “美团跑腿”配送；\n' +
      '•如果美团商户端发起配送时，会跟外送帮上的骑手重复；\n' +
      '•兼容模式不支持自动接单\t\t\t', [
      {
        text: '取消',
        onPress: () => {
        }
      },
    ]);
  }

  getPlatIcon = (icon_name) => {
    switch (icon_name) {
      case 'eleme':
        return platformLogoEleme()
      case 'meituan':
        return platformLogoMeiTuan()
      case 'jd':
        return platformLogoJD()
      case 'txd':
        return platformLogoTaoXianDa()
      case 'weixin':
        return platformLogoWechat()
      default:
        return platformLogoWSB()
    }
  }

  getLabelOfCloseBtn() {
    return this.state.all_close ? '已全部关店' : "紧急关店"
  }

  setAutoTaskOrder() {
    showModal("修改中");
    const {accessToken, store_id} = this.props.global
    const api = `/api/set_store_suspend_confirm_order/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      hideModal()
      showSuccess('操作成功');
    }).catch(() => {
      showError('操作失败');
    })
  }


  render() {
    let {loading, show_body, dialogVisible, modal} = this.state;
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{
            flexGrow: 1,
            backgroundColor: colors.f5
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => this.fetchData()}
              tintColor='gray'
            />
          }
        >
          <If condition={!loading}>
            <If condition={!show_body}>
              {this.renderNoBody()}
            </If>
            <If condition={show_body}>
              {this.renderBody()}
            </If>
          </If>
        </ScrollView>
        <If condition={!loading && show_body}>
          {this.renderBtn()}
        </If>
        <Dialog
          onRequestClose={() => this.setState({dialogVisible: false})}
          visible={dialogVisible}
          buttons={this.buttons}
        >
          <View>
            <Text style={{flexDirection: 'row', textAlign: 'center'}}>
              <Text style={{fontSize: 15}}>是否允许外送帮自动接单</Text>
              {/*<Text style={{fontSize: 12.5, color: colors.main_color}}>查看详情</Text>*/}
            </Text>
            <Text style={{fontSize: 12.5, textAlign: 'center'}}>你可以从这里再找到它</Text>
            <View style={{flexDirection: 'row'}}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/showAutoTaskOrder2.png'}}
                     style={styles.image}/>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/showAutoTaskOrder1.png'}}
                     style={styles.image}/>
            </View>
          </View>
        </Dialog>

        <BottomModal title={'提示'} actionText={'确定'} closeText={'取消'} onPress={this.closeModal}
                     visible={modal} onPressClose={this.closeModal}
                     onClose={this.closeModal}
                     btnBottomStyle={{
                       borderTopWidth: 1,
                       borderTopColor: "#E5E5E5",
                       paddingBottom: 0,
                     }}
                     closeBtnStyle={{
                       borderWidth: 0,
                       borderRadius: 0,
                       borderRightWidth: 1,
                       borderColor: "#E5E5E5",
                     }}
                     btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
                     closeBtnTitleStyle={{color: colors.color333}}
                     btnTitleStyle={{color: colors.main_color}}>
          <View style={{padding: 10}}>
            <Text style={{color: colors.red, fontSize: 12}}> &nbsp;&nbsp;&nbsp;收银模式有以下特点 </Text>
            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text style={{color: colors.color333, fontSize: 14}}>收银模式支持在外送帮呼叫 “美团跑腿”配送 </Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text
                style={{color: colors.color333, fontSize: 14}}>如果美团商户端发起配送时，会跟外送帮上的骑手重复 </Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 4}}>
              <Entypo style={{fontSize: 14, color: colors.color333,}} name={'controller-record'}/>
              <Text style={{color: colors.color333, fontSize: 14}}>收银模式不支持自动接单 </Text>
            </View>
          </View>
        </BottomModal>
      </View>
    )
  }

  renderBtn = () => {
    const {accessToken, store_id} = this.props.global
    let {all_open, allow_self_open, all_close} = this.state;
    let canOpen = !all_open && allow_self_open
    let canClose = !all_close && allow_self_open
    return (
      <View style={{
        flexDirection: 'row',
        height: 40,
      }}>
        <If condition={canOpen}>
          <TouchableOpacity style={styles.footerItem} onPress={() => this.openStore()}>
            <View style={[styles.footerBtn, canOpen ? styles.successBtn : styles.disabledBtn]}>
              <Text style={styles.footerBtnText}>开店接单 </Text>
            </View>
          </TouchableOpacity>
        </If>

        <If condition={!canOpen}>
          <View style={[styles.footerItem, styles.footerBtn, canOpen ? styles.successBtn : styles.disabledBtn]}>
            <Text style={styles.footerBtnText}>开店接单 </Text>
          </View>
        </If>

        <If condition={canClose}>
          <TouchableOpacity style={[styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}
                            onPress={() => {
                              this.onPress(Config.ROUTE_STORE_CLOSE, {
                                data: timeOptions,
                                access_token: accessToken,
                                store_id: store_id
                              })
                            }}>
            <View style={[styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}>
              <Text style={styles.footerBtnText}>{this.getLabelOfCloseBtn()} </Text>
            </View>
          </TouchableOpacity>
        </If>

        <If condition={!canClose}>
          <View style={[styles.footerItem, styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}>
            <Text style={styles.footerBtnText}>{this.getLabelOfCloseBtn()} </Text>
          </View>
        </If>

      </View>
    )
  }


  renderBody = () => {
    const {business_status} = this.state
    const {store_id, vendor_id} = this.props.global
    return (
      <View style={{
        flex: 1,
      }}>
        {
          business_status && business_status.map((store, index) => {
            let suspend_confirm_order = store.suspend_confirm_order === '0'
            return (
              <TouchableOpacity key={index} onPress={() => {
                this.mixpanel.track("mine.wm_store_list.click_store", {store_id, vendor_id});
                this.onPress(Config.ROUTE_SEETING_DELIVERY, {
                  ext_store_id: store.id,
                  store_id: store_id,
                  poi_name: store.poi_name,
                  showBtn: store.zs_way === '商家自送',
                })
              }}>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 7,
                  borderTopWidth: 1,
                  borderTopColor: colors.colorDDD,
                  backgroundColor: colors.white
                }}>

                  <View style={{
                    width: 60,
                    height: 65,
                    paddingHorizontal: 10,
                    marginRight: 10,
                  }}>
                    <SvgXml xml={this.getPlatIcon(store.icon_name)}/>
                    <TouchableOpacity onPress={() => this.setState({
                      modal: true
                    })} style={{
                      position: 'absolute',
                      left: 41,
                      top: 2,
                      textAlign: 'center',
                    }}>
                      <If condition={store.business_id}>
                        <AntDesign name='earth' style={[styles.right_btn, {fontSize: 18}]}/>
                      </If>
                    </TouchableOpacity>
                  </View>

                  <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
                    <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 10,
                      position: "relative"
                    }}>
                      <Text style={styles.wm_store_name}>
                        {tool.jbbsubstr(store?.name, 13)}
                      </Text>
                      <Text
                        style={[!store.open ? styles.close_text : styles.open_text, {
                          fontSize: 12,
                          position: 'absolute',
                          top: "10%",
                          right: "3%"
                        }]}>
                        {store.status_label}
                      </Text>
                    </View>
                    <View style={[styles.between, {marginTop: 2, marginEnd: 5}]}>
                      <If condition={store.show_open_time}>
                        <Text style={{color: '#595959', width: 150, fontSize: 10}}>
                          开店时间：{store.next_open_desc || store.next_open_time}
                        </Text>
                      </If>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{fontSize: 10, paddingTop: 3,}}>
                        {store.zs_way}
                      </Text>
                      <View style={{flex: 1,}}/>
                    </View>
                    <If condition={store.zs_way === '商家自送'}>
                      <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 5
                      }}>
                        <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                          <SvgXml width={12} height={12} style={{marginRight: 5}}
                                  xml={store.auto_call == '已开启自动呼叫' ? check_circle_icon() : cross_circle_icon()}/>

                          <Text style={{color: colors.color333}}>自动呼叫配送</Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                          <SvgXml width={12} height={12} style={{marginRight: 5}}
                                  xml={suspend_confirm_order == 1 ? check_circle_icon() : cross_circle_icon()}/>

                          <Text style={{color: colors.color333}}>自动接单</Text>
                        </View>
                        <View style={{width: 35}}>
                          <Entypo name='chevron-thin-right' style={[styles.right_btns]}/>
                        </View>
                      </View>
                    </If>
                  </View>
                </View>

              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }


  renderNoBody = () => {
    let {allow_merchants_store_bind, is_service_mgr} = this.state;
    return (
      <View style={styles.noOrderContent}>
        <SvgXml xml={empty_data()}/>
        <If condition={allow_merchants_store_bind || is_service_mgr}>
          <Text style={styles.noOrderDesc}>暂无绑定外卖店铺</Text>
          <Button title={'去绑定'}
                  onPress={() => this.onPress(Config.PLATFORM_BIND)}
                  buttonStyle={styles.noOrderBtn}
                  titleStyle={styles.noOrderBtnTitle}
          />
        </If>
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(StoreStatusScene)

const styles = StyleSheet.create({
  bodyContainer: {
    flexGrow: 1
  },
  wm_store_name: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.listTitleColor
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
  },
  footerItem: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  successBtn: {
    backgroundColor: '#59b26a'
  },
  errorBtn: {
    backgroundColor: '#e94f4f'
  },
  disabledBtn: {
    backgroundColor: 'grey'
  },
  footerBtnText: {
    color: '#fff'
  },
  right_btn: {
    color: colors.main_color,
    fontSize: 12.5,
    paddingTop: 3.5,
    marginLeft: 5,
  },
  right_btns: {
    fontSize: 12.5,
    paddingTop: 3.5,
    marginLeft: 5,
  },
  image: {
    width: 120,
    margin: 7,
    height: 200,
  },
  open_text: {
    color: colors.main_color,
    textAlign: "center"
  },
  close_text: {
    color: colors.warn_red,
    textAlign: "center"
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  noOrderDesc: {
    fontSize: 15,
    marginTop: 9,
    marginBottom: 20,
    color: colors.color999
  },
  noOrderBtn: {
    width: 180,
    borderRadius: 20,
    backgroundColor: colors.main_color,
    paddingVertical: 10,
    marginTop: 20
  },
  noOrderBtnTitle: {
    color: colors.white,
    fontSize: 16
  }
})
