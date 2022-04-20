import React, {PureComponent} from "react";
import {
  Alert,
  Image,
  InteractionManager,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {connect} from "react-redux";
import {hideModal, showError, showModal, showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";
import {Dialog} from "../../../weui";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import {MixpanelInstance} from '../../../pubilc/util/analytics';
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";
import Icon from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Config from "../../../pubilc/common/config";
import * as tool from "../../../pubilc/util/tool";
import {Button} from "react-native-elements";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class StoreStatusScene extends PureComponent {
  constructor(props) {
    super(props)
    const {navigation} = this.props


    let {is_service_mgr,} = tool.vendor(this.props.global);
    let store_id = this.props.global.currStoreId
    let vendor_id = this.props.global.config.vendor.id;
    navigation.setOptions({
      headerRight: () => {
        if (this.state.show_body && (this.state.allow_merchants_store_bind || is_service_mgr)) {
          return <TouchableOpacity style={{flexDirection: 'row'}}
                                   onPress={() => {
                                     this.onPress(Config.PLATFORM_BIND)
                                     this.mixpanel.track("mine.wm_store_list.click_add", {store_id, vendor_id});
                                   }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: pxToDp(30), color: colors.main_color,}}>绑定外卖店铺 </Text>
              <Icon name='chevron-thin-right' style={[styles.right_btn]}/>
            </View>
          </TouchableOpacity>
        }
      }
    })

    this.state = {
      timeOptions: [
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
      ],
      all_close: false,
      all_open: false,
      allow_self_open: false,
      business_status: [],
      show_body: false,
      allow_merchants_store_bind: false,
      is_service_mgr: is_service_mgr,
      dialogVisible: false,
      suspend_confirm_order: false,
      total_wm_stores: 0,
      allow_store_mgr_call_ship: false,
      alert_msg: ''
    }

    this.mixpanel = MixpanelInstance;
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {
    let {total_wm_stores} = this.state
    let store_id = this.props.global.currStoreId
    let vendor_id = this.props.global.config.vendor.id;
    this.mixpanel.track("mine.wm_store_list", {store_id, vendor_id, total_wm_stores});
  }

  fetchData() {
    const self = this
    let {currVendorId,} = tool.vendor(this.props.global);
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/get_store_business_status/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      let show_body = false;
      if (res.business_status.length > 0) {
        show_body = true
      }
      if (currVendorId === "68" && res.business_status.length > 0) {
        // this.setState({
        //   dialogVisible: true
        // })
      }

      self.setState({
        all_close: res.all_close,
        all_open: res.all_open,
        allow_self_open: res.allow_self_open,
        business_status: res.business_status,
        show_body: show_body,
        allow_merchants_store_bind: res.allow_merchants_store_bind === '1' ? true : false,
        total_wm_stores: res.business_status.length,
        allow_store_mgr_call_ship: res.allow_store_mgr_call_ship === '0' ? true : false,
        alert_msg: res.alert_msg,
      })
      const {updateStoreStatusCb} = this.props.route.params;
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
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/open_store/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      hideModal()
      this.fetchData()
      showSuccess('操作成功')
    }).catch(() => {
      showError('操作失败')
    })
  }

  closeStore(minutes) {
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId

    if (minutes && minutes === 'STOP_TO_BUSINESS') {
      // const api = `/api/close_store/${store_id}/${minutes}?access_token=${access_token}`
      // Alert.alert('提示', '确定停止营业吗？停业后不会自动恢复营业', [{
      //   text: '确定', onPress: () => {
      //     ToastLong('请求中...')
      //     HttpUtils.get.bind(this.props)(api, {}).then(res => {
      //       this.fetchData()
      //     }).catch(() => {
      //     })
      //   }
      // }, {'text': '取消'}])
    } else {
      if (typeof minutes === 'undefined') {
        return
      }
      const api = `/api/close_store/${store_id}/${minutes}?access_token=${access_token}`
      ToastLong('请求中...')
      HttpUtils.get.bind(this.props)(api, {}).then(res => {
        this.fetchData()
      }).catch(() => {
      })
    }
  }

  showAlert() {
    Alert.alert('提示', '•兼容模式不支持在外送帮呼叫 “美团众包”配送；\n' +
      '•如果美团商户端发起配送时，会跟外送帮上的骑手重复；\n' +
      '•兼容模式不支持自动接单\t\t\t', [
      {
        text: '取消',
        onPress: () => {
        }
      },
    ]);
  }

  renderBody() {
    const business_status = this.state.business_status
    const store_id = this.props.global.currStoreId
    const vendor_id = this.props.global.config.vendor.id
    let items = []
    for (let i in business_status) {
      const store = business_status[i]
      let store_name_str = ''
      if (store.name && store.name.length >= 13) {
        store_name_str = store.name.substring(0, 13) + '...'
      } else {
        store_name_str = store.name
      }
      let suspend_confirm_order = store.suspend_confirm_order === '0' ? true : false
      items.push(
        <TouchableOpacity style={{}} onPress={() => {

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
            paddingTop: pxToDp(14),
            paddingBottom: pxToDp(14),
            borderTopWidth: 1 / PixelRatio.get(),
            borderTopColor: colors.colorDDD,
            backgroundColor: colors.white
          }}>

            <View style={{
              width: pxToDp(120),
              height: pxToDp(130),
              paddingLeft: pxToDp(20),
              paddingRight: pxToDp(20),
              marginRight: pxToDp(20),
            }}>

              <Image style={{
                width: pxToDp(100),
                height: pxToDp(100),
                marginTop: pxToDp(20),
              }} source={this.getPlatIcon(store.icon_name)}/>

              <TouchableOpacity onPress={() => this.showAlert()} style={{
                position: 'absolute',
                left: pxToDp(82),
                top: pxToDp(4),
                textAlign: 'center',
              }}>
                {store.business_id ? <AntDesign name='earth' style={[styles.right_btn, {
                  fontSize: pxToDp(35)
                }]}/> : null}
              </TouchableOpacity>

            </View>

            <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: pxToDp(20),
                position: "relative"
              }}>
                <Text style={styles.wm_store_name}>{store_name_str} </Text>
                <Text
                  style={[!store.open ? styles.close_text : styles.open_text, {
                    fontSize: pxToDp(24),
                    position: 'absolute',
                    top: "10%",
                    right: "3%"
                  }]}>{store.status_label} </Text>
              </View>
              <View style={[styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
                {store.show_open_time &&
                <Text style={{
                  color: '#595959',
                  width: pxToDp(300),
                  fontSize: pxToDp(20)
                }}>开店时间：{store.next_open_desc || store.next_open_time} </Text>}
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{
                  fontSize: pxToDp(20),
                  paddingTop: pxToDp(7),
                }}>
                  {store.zs_way}
                </Text>
                <View style={{flex: 1,}}></View>
                {/*<Text style={{*/}
                {/*  fontSize: pxToDp(20),*/}
                {/*  paddingTop: pxToDp(7),*/}
                {/*}}>*/}
                {/*  {store.auto_call}*/}
                {/*</Text>*/}
              </View>
              {
                store.zs_way === '商家自送' && <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: pxToDp(10)
                }}>
                  <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Image
                      source={store.auto_call == '已开启自动呼叫' ? require("../../../img/My/correct.png") : require("../../../img/My/mistake.png")}
                      style={{width: pxToDp(24), height: pxToDp(24), marginRight: pxToDp(10)}}/>
                    <Text style={{color: colors.color333}}>自动呼叫配送</Text>
                  </View>
                  <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Image
                      source={suspend_confirm_order == 1 ? require("../../../img/My/correct.png") : require("../../../img/My/mistake.png")}
                      style={{width: pxToDp(24), height: pxToDp(24), marginRight: pxToDp(10)}}/>
                    <Text style={{color: colors.color333}}>自动接单</Text>
                  </View>
                  <View style={{width: pxToDp(70)}}>
                    <Icon name='chevron-thin-right' style={[styles.right_btns]}/>
                  </View>
                </View>
              }
            </View>
          </View>
        </TouchableOpacity>)
    }

    return (
      <ScrollView style={styles.bodyContainer}>
        {items}
      </ScrollView>
    )
  }

  renderNoBody() {
    return (
      <View style={{flexDirection: "column", alignItems: "center"}}><Text style={{
        marginTop: '20%',
        marginBottom: '5%',
        backgroundColor: '#f5f5f9',
        textAlignVertical: "center",
        textAlign: "center",
        fontWeight: 'bold',
        fontSize: 25
      }}>暂时未绑定外卖店铺
      </Text>

        <If condition={this.state.allow_merchants_store_bind || this.state.is_service_mgr}>
          <Button
            title={'去绑定'}
            onPress={() => {
              this.onPress(Config.PLATFORM_BIND)
            }}
            buttonStyle={{
              backgroundColor: '#f5f5f9',
              marginTop: 30,
              width: "95%"
            }}
            titleStyle={{color: colors.fontBlack}}
          />
        </If>
      </View>
    )
  }

  getPlatIcon = (icon_name) => {
    if (icon_name === 'eleme') {
      return require(`../../../img/PlatformLogo/pl_store_eleme.png`)
    } else if (icon_name === 'jd') {
      return require(`../../../img/PlatformLogo/pl_store_jd.png`)
    } else if (icon_name === 'meituan') {
      return require(`../../../img/PlatformLogo/pl_store_meituan.png`)
    } else if (icon_name === 'txd') {
      return require(`../../../img/PlatformLogo/pl_store_txd.jpg`)
    } else if (icon_name === 'weixin') {
      return require(`../../../img/PlatformLogo/pl_store_weixin.png`)
    }

    return require(`../../../img/PlatformLogo/pl_store_unknown.png`)
  }

  renderFooter() {
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    let canOpen = !this.state.all_open && this.state.allow_self_open
    let canClose = !this.state.all_close && this.state.allow_self_open
    return (
      <View style={styles.footerContainer}>
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
          {/*<ModalSelector*/}
          {/*  style={[styles.footerItem, {flex: 1}]}*/}
          {/*  touchableStyle={[styles.footerItem, {width: '100%', flex: 1}]}*/}
          {/*  childrenContainerStyle={[styles.footerItem, {width: '100%', flex: 1}]}*/}
          {/*  onModalClose={(option) => {*/}
          {/*    this.closeStore(option.value);*/}
          {/*  }}*/}
          {/*  cancelText={'取消'}*/}
          {/*  data={this.state.timeOptions}>*/}
          {/*  <View style={[styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}>*/}
          {/*    <Text style={styles.footerBtnText}>{this.getLabelOfCloseBtn()} </Text>*/}
          {/*  </View>*/}
          {/*</ModalSelector>*/}
          <TouchableOpacity style={[styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}
                            onPress={() => {
                              this.onPress(Config.ROUTE_STORE_CLOSE, {
                                data: this.state.timeOptions,
                                access_token: access_token,
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

  getLabelOfCloseBtn() {
    return this.state.all_close ? '已全部关店' : "紧急关店"
  }

  setAutoTaskOrder() {
    showModal("修改中");
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/set_store_suspend_confirm_order/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      hideModal()
      showSuccess('操作成功');
    }).catch(() => {
      showError('操作失败');
    })
  }

  render() {
    return (<View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <View style={{flex: 1}}>
          <If condition={!this.state.show_body}>
            {this.renderNoBody()}
          </If>

          <If condition={this.state.show_body}>
            {this.renderBody()}
            {this.renderFooter()}
          </If>
        </View>

        <Dialog
          onRequestClose={() => {
            this.setState({dialogVisible: false})
          }}
          visible={this.state.dialogVisible}
          buttons={[{
            type: 'default',
            label: '取消',
            sty: {
              borderColor: 'gray',
              borderWidth: pxToDp(1),
            },
            onPress: () => {
              this.setState({dialogVisible: false})
            }
          }, {
            type: 'primary',
            label: '允许',
            sty: {
              backgroundColor: colors.fontColor,
              borderColor: 'gray',
              borderWidth: pxToDp(1),
            },
            textsty: {
              color: colors.white,
            },
            onPress: () => {
              this.setState({dialogVisible: false}, () => {
                this.setAutoTaskOrder();
              })
            }
          }]}
        >
          <View>
            <Text style={{flexDirection: 'row', textAlign: 'center'}}>
              <Text style={{fontSize: pxToDp(30)}}>是否允许外送帮自动接单</Text>
              {/*<Text style={{fontSize: pxToDp(25), color: colors.main_color}}>查看详情</Text>*/}
            </Text>
            <Text style={{fontSize: pxToDp(25), textAlign: 'center'}}>你可以从这里再找到它</Text>
            <View style={{flexDirection: 'row'}}>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/showAutoTaskOrder2.png'}}
                     style={styles.image}/>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/showAutoTaskOrder1.png'}}
                     style={styles.image}/>
            </View>
          </View>
        </Dialog>

      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreStatusScene)

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1
  },
  cell_title: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  },
  cells: {
    marginBottom: pxToDp(10),
    marginTop: 0,
    paddingLeft: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999
  },
  wmStatusIcon: {
    width: pxToDp(72),
    height: pxToDp(72),
    marginLeft: pxToDp(20),
    marginRight: pxToDp(20),
  },
  cell_height: {
    height: pxToDp(70)
  },
  cell_content: {
    justifyContent: "center",
    marginLeft: 0,
    paddingRight: 0
  },
  wm_store_name: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.listTitleColor
  },
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
    width: '100%'
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
  btn_edit: {
    fontSize: pxToDp(40),
    width: pxToDp(42),
    height: pxToDp(36),
    color: colors.color666,
    marginRight: pxToDp(30),
  },
  right_btn: {
    color: colors.main_color,
    fontSize: pxToDp(25),
    paddingTop: pxToDp(7),
    marginLeft: pxToDp(10),
  },
  right_btns: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(7),
    marginLeft: pxToDp(10),
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  image: {
    width: pxToDp(240),
    margin: pxToDp(15),
    height: pxToDp(400),
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
})