import React from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import Config from "../../config";
import JbbText from "./JbbText";
import {bindActionCreators} from "redux";
import Tips from "./Tips";
import ReactNative, {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {Styles} from "../../themes";
import colors from "../../styles/colors";
import Cts from "../../Cts";
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {Dialog, Input} from "../../weui/index";
import {
  addTipMoney,
  addTipMoneyNew,
  cancelReasonsList,
  cancelShip,
  orderCallShip
} from "../../reducers/order/orderActions";
import {connect} from "react-redux";
import {tool} from "../../common";
import {Accordion} from "@ant-design/react-native";
import {MixpanelInstance} from '../../common/analytics';
import {set_mixpanel_id} from '../../reducers/global/globalActions'
import Entypo from "react-native-vector-icons/Entypo"

let width = Dimensions.get("window").width;
let height = Dimensions.get("window").height;

const {StyleSheet} = ReactNative

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      addTipMoney, orderCallShip, cancelShip, cancelReasonsList, addTipMoneyNew
    }, dispatch)
  }
}

class OrderListItem extends React.PureComponent {

  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    showBtn: PropTypes.bool,
    onPress: PropTypes.func,
    onRefresh: PropTypes.func,
    fetchData: PropType.func,
    order: PropType.object,
    onItemClick: PropTypes.func,
  };

  state = {
    modalTip:false,
    modalType: false,
    addTipMoney: false,
    addMoneyNum: '',
    ProgressData: [],
    btns: [],
    addTipDialog: false,
    dlgShipVisible: false,
    activeSections: [],
    veriFicationToShop: false,
    pickupCode: '',
    respReason: '',
    order_id: "",
    store_id: "",
    ok: true
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.reset();
    this.mixpanel.getDistinctId().then(res => {
      if (tool.length(res) > 0) {
        const {dispatch} = this.props;
        dispatch(set_mixpanel_id(res));
        this.mixpanel.alias("new ID", res)
      }
    })
  }
  closeModal() {
    this.setState({
      modalTip: false
    })
  }

  fetchShipData(item) {
    tool.debounces(() => {
      //保存参数 作为Tips的传参
      this.state.order_id = item.id;
      this.state.store_id = item.store_id;
      showModal('加载中...')
      const self = this;
      const orderId = this.props.item.id;
      const accessToken = this.props.accessToken;
      const api = `/api/third_deliverie_record/${orderId}?access_token=${accessToken}`;
      HttpUtils.get.bind(self.props)(api).then(res => {

        if (tool.length(res.delivery_lists)) {
          this.setState({modalType: true, ProgressData: res.delivery_lists, btns: res.delivery_btns});
        } else {
          showError('暂无数据')
        }
        hideModal()
      }).catch((obj) => {
        if (!obj.ok) {
          showError(`${obj.reason}`)
        } else {
          showError('暂无数据')
        }
      })
    }, 1000)
  }

  renderSchedulingDetails(item, addTipMoney, addMoneyNum, respReason, ok) {
    let items = []
    items.push(item)
    return (
      <MapProgress data={items} accessToken={this.props.accessToken} addTipMoney={addTipMoney}
                   addMoneyNum={addMoneyNum}
                   navigation={this.props.navigation} onConfirmCancel={this.onConfirmCancel}
                   onRequestClose={this.onRequestClose} onConfirm={this.onConfirm}
                   onChangeAcount={this.onChangeAcount} respReason={respReason} ok={ok}
                   onTousu={this.onTousu.bind(this)} clearModal={this.clearModalType.bind(this)}
                   onAddTip={this.onAddTip} orderId={this.props.item.id} dispatch={this.props.dispatch}/>
    )
  }

  onChange = activeSections => {
    this.setState({activeSections});
  };

  renderProgressData() {
    let {ProgressData, addTipMoney, addMoneyNum, respReason, ok} = this.state
    let items = []
    for (let i in ProgressData) {
      let item = ProgressData[i]
      this.setState({
        shipId: item.ship_id
      })
      items.push(
        <Accordion.Panel style={{
          flexDirection: 'row',
          justifyContent: "space-between",
          alignItems: "center",
          marginLeft: pxToDp(-10),
          borderRadius: pxToDp(20),
          marginTop: pxToDp(10)
        }}
                         header={
                           <View style={{
                             marginHorizontal: pxToDp(30),
                             flexDirection: "column",
                             flex: 2,
                             marginVertical: pxToDp(5)
                           }}>
                             <Text style={[styles.cell_rowTitleText]}>{item.desc}</Text>
                             <Text
                               style={[styles.cell_rowTitleText1, {color: item.content_color}]}>{item.content}</Text>
                           </View>
                         }
                         key={i} index={i}
        >
          <View style={styles.cell_box}>
            {this.renderSchedulingDetails(item, addTipMoney, addMoneyNum, respReason, ok)}
          </View>
        </Accordion.Panel>
      )
    }
    return items
  }

  render() {
    let {item, onPress, navigation, allow_edit_ship_rule} = this.props;
    let store_id = this.props.item.store_id
    let vendor_id = this.props.vendorId
    let styleLine = {
      borderTopColor: colors.back_color,
      borderTopWidth: 1 / PixelRatio.get() * 2,
      borderStyle: "dotted"
    };
    return (
      <>

        <Tips navigation={this.props.navigation} orderId={this.state.order_id}
              storeId={this.state.store_id} key={this.state.order_id}  modalTip={this.state.modalTip}
              onItemClick={() => this.closeModal()}></Tips>
        <TouchableWithoutFeedback onPress={() => {
          onPress(Config.ROUTE_ORDER, {orderId: item.id})
        }}>
          <View style={[Styles.columnStart, {
            backgroundColor: colors.white,
            marginTop: 10,
            paddingVertical: 10,
            marginHorizontal: 12,
            paddingHorizontal: 12,
            borderRadius: pxToDp(10),
          }]}>
            <View style={[Styles.between, {paddingBottom: 8}]}>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between"
              }}>
                <If condition={item.is_right_once}>
                  <JbbText
                    style={{
                      backgroundColor: colors.main_color,
                      color: colors.white,
                      borderRadius: 3,
                      paddingLeft: 2,
                      paddingRight: 2,
                      marginRight: 4,
                      fontWeight: 'bold',
                      fontSize: item.dayIdSize || 16,
                    }}>预</JbbText>
                </If>
                {
                  item.pickType === "1" && <JbbText style={{
                    borderWidth: pxToDp(1),
                    borderRadius: pxToDp(5),
                    fontWeight: "bold"
                  }}>到店自提</JbbText>
                }
                <JbbText style={{
                  color: colors.main_color,
                  fontSize: item.dayIdSize || 16,
                  fontWeight: 'bold'
                }}>{item.dayIdInList} </JbbText>
              </View>
              {Number(item.orderStatus) !== Cts.ORDER_STATUS_INVALID && <JbbText style={{
                color: colors.main_color,
                fontSize: 16,
                fontWeight: 'bold'
              }}>{item.expectTimeStrInList}</JbbText>}
              {Number(item.orderStatus) === Cts.ORDER_STATUS_INVALID &&
              <JbbText style={{
                color: colors.warn_color,
                fontSize: 16,
                fontWeight: 'bold'
              }}>订单已取消</JbbText>}
            </View>
            <View style={[Styles.row, {paddingBottom: 8, justifyContent: "space-between"}]}>
              <View style={{flexDirection: 'row'}}>
                <JbbText style={{fontSize: 14}}>{item.userName} </JbbText>
                <Text onPress={() => this.dialCall(item.mobile)}
                      style={{fontSize: 14, color: colors.main_color}}>{item.mobileReadable}</Text>
              </View>
              <View style={{
                backgroundColor: '#FFB454',
                borderRadius: pxToDp(5),
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 2
              }}>
                <JbbText onPress={() => this.onClickTimes(item)}
                         style={{color: colors.white, fontSize: pxToDp(24)}}>
                  {item.order_times <= 1 ? '新客户' : `第${item.order_times}次`} </JbbText>
              </View>
            </View>
            {/*<View style={[Styles.row, {justifyContent: "space-between"}]}>*/}
            {/*  <View style={[Styles.row]}>*/}
            {/*    <JbbText>电话: </JbbText>*/}
            {/*    <JbbText>{item.mobileReadable}</JbbText>*/}
            {/*  </View>*/}
            {/*  <View>*/}
            {/*    <JbbText onPress={() => this.dialCall(item.mobile)}*/}
            {/*             style={{*/}
            {/*               paddingBottom: 8,*/}
            {/*               color: colors.main_color,*/}
            {/*               paddingStart: 2,*/}
            {/*               fontWeight: "bold"*/}
            {/*             }}>呼叫</JbbText>*/}
            {/*  </View>*/}
            {/*</View>*/}
            <TouchableOpacity onPress={() => {
              let orderId = item.id;
              const accessToken = this.props.accessToken
              let path = '/AmapTrack.html?orderId=' + orderId + "&access_token=" + accessToken;
              const uri = Config.serverUrl(path);
              this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
            }} style={[Styles.row, {
              paddingBottom: 8,
              marginBottom: 8,
              justifyContent: "space-between",
              borderBottomColor: colors.fontColor,
              borderBottomWidth: pxToDp(1)
            }]}>
              <Text
                style={{marginRight: pxToDp(24), fontSize: 14, width: width - 86}}>{item.address}</Text>
              <Entypo name={"location"}
                      style={{fontSize: pxToDp(35), color: colors.main_color}}></Entypo>
            </TouchableOpacity>


            <If condition={item.show_store_name}>
              <View style={[Styles.columnStart]}>
                <View style={[Styles.row]}>
                  <JbbText style={{width: pxToDp(90)}}>店铺: </JbbText>
                  <JbbText style={{marginRight: 24}}>{item.show_store_name}</JbbText>
                </View>
              </View>
            </If>

            <If condition={item.orderTimeInList}>
              <View style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
                <Text style={{fontSize: 14, width: pxToDp(160)}}>下单时间： </Text>
                <Text style={{fontSize: 14}}>{item.orderTimeInList}  </Text>
              </View>

            </If>


            <View style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
              <Text style={{fontSize: 14, width: pxToDp(140)}}>订单号：</Text>
              <Text style={{fontSize: 14}}>{item.id} </Text>
              <Text onPress={() => {
                Clipboard.setString(item.id)
                ToastLong('已复制到剪切板')
              }} style={{
                fontSize: 10,
                color: colors.main_color,
                borderColor: colors.main_color,
                borderWidth: pxToDp(1),
                textAlign: 'center',
                padding: pxToDp(5),
                marginLeft: pxToDp(30)
              }}>复制</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
              <Text style={{fontSize: 14, width: pxToDp(170)}}>平台单号：</Text>
              <Text style={{fontSize: 14}}>{item.platform_oid} </Text>
              <Text onPress={() => {
                Clipboard.setString(item.platform_oid)
                ToastLong('已复制到剪切板')
              }} style={{
                fontSize: 10,
                color: colors.main_color,
                borderColor: colors.main_color,
                borderWidth: pxToDp(1),
                padding: pxToDp(5),
                textAlign: 'center',
                marginLeft: pxToDp(30)
              }}>复制</Text>
            </View>
            <TouchableOpacity onPress={() => {
              onPress(Config.ROUTE_ORDER, {orderId: item.id})
            }} style={{
              flexDirection: 'row',
              marginTop: pxToDp(15),
              marginBottom: pxToDp(15),
              paddingBottom: pxToDp(15),
              borderBottomWidth: pxToDp(1),
              borderBottomColor: colors.fontColor
            }}>
              <Text style={{fontSize: 14, width: pxToDp(90)}}>{item.moneyLabel}：</Text>
              <Text style={{fontSize: 14}}>{item.moneyInList} </Text>
              <View style={{flex: 1}}></View>
              <Text style={{
                fontSize: 14,
                textAlign: 'center',
              }}>详情 </Text>

              <Entypo name='chevron-thin-right' style={{
                fontSize: 14,
                ...Platform.select({
                  ios: {},
                  android: {
                    marginTop: pxToDp(2),
                  }
                }),
              }}/>
            </TouchableOpacity>


            {/*<View style={[Styles.columnStart, styleLine]}>*/}
            {/*  <View*/}
            {/*    style={[Styles.between, {paddingTop: 8}]}><JbbText>下单: {item.orderTimeInList} </JbbText>*/}
            {/*    <TouchableOpacity onPress={() => {*/}
            {/*      onPress(Config.ROUTE_ORDER, {orderId: item.id})*/}
            {/*    }} style={{*/}
            {/*      borderWidth: 1,*/}
            {/*      borderColor: colors.main_color,*/}
            {/*      paddingVertical: pxToDp(5),*/}
            {/*      paddingHorizontal: pxToDp(30),*/}
            {/*      borderRadius: pxToDp(5)*/}
            {/*    }}><JbbText style={{color: colors.main_color}}>订单详情</JbbText></TouchableOpacity>*/}
            {/*  </View>*/}
            {/*  <View*/}
            {/*    style={[Styles.between, {paddingTop: 8}]}><JbbText>{item.moneyLabel}:*/}
            {/*    ¥{item.moneyInList}</JbbText></View>*/}
            {/*  <View style={[Styles.between]}>*/}
            {/*    <JbbText style={{paddingTop: 8}}>单号: {item.id} </JbbText>*/}
            {/*    <View style={[Styles.between]}>*/}
            {/*      <JbbText selectable={true} style={{paddingTop: 8}}>{item.platform_oid}</JbbText>*/}
            {/*      <JbbText onPress={() => this.onCopy(item.platform_oid)}*/}
            {/*               style={{*/}
            {/*                 color: colors.main_color,*/}
            {/*                 paddingStart: 2,*/}
            {/*                 paddingTop: 8,*/}
            {/*                 fontWeight: "bold"*/}
            {/*               }}>复制</JbbText>*/}
            {/*    </View>*/}
            {/*  </View>*/}
            {/*</View>*/}


            <TouchableOpacity onPress={() => {
              this.fetchShipData(item)
            }} style={{
              ...Platform.select({
                ios: {
                  marginTop: pxToDp(15),
                },
                android: {
                  // marginTop: pxToDp(2),
                }
              }),
              marginBottom: pxToDp(15),
              paddingBottom: pxToDp(15),
              borderBottomWidth: pxToDp(1),
              borderBottomColor: colors.fontColor
            }}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>配送状态</Text>
                <View style={{flex: 1}}></View>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: colors.main_color,
                  ...Platform.select({
                    ios: {
                      marginTop: pxToDp(7),
                    },
                    android: {
                      marginTop: pxToDp(2),
                    }
                  }),
                }}>查看配送详情</Text>
                <Entypo name='chevron-thin-right' style={{fontSize: 14}}/>
              </View>
              <Text style={{fontSize: 14, marginTop: pxToDp(15)}}>{item.shipStatusText}</Text>
            </TouchableOpacity>

            {/*<View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>*/}
            {/*  <View*/}
            {/*    style={[Styles.between, {paddingTop: 8}]}><JbbText>骑手: {item.shipStatusText}</JbbText>{!!item.ship_worker_mobile &&*/}
            {/*  <JbbText onPress={() => this.dialCall(item.ship_worker_mobile)}*/}
            {/*           style={{color: colors.main_color}}>呼叫</JbbText>}*/}
            {/*  </View>*/}
            {/*</View>*/}
            <If condition={item.orderStatus === "10"}>
            <TouchableOpacity  onPress={() => {
              this.setState({
                modalTip: true,

              })
              this.state.store_id = item.store_id;
              this.state.order_id = item.id;
            }}>
            <View style={{flexDirection: 'row'}}>
              <Image
                  source={require("../../img/My/help.png")}
                  style={{
                    position:'absolute',
                    top:pxToDp(0),
                    width:pxToDp(36),
                    height:pxToDp(36),
                  }}
              /><Text style={{marginLeft:pxToDp(60),lineHeight: pxToDp(40)}}>长时间没有骑手接单怎么办？</Text>
            </View>
          </TouchableOpacity>
            </If>
            <If condition={Number(item.orderStatus) === Cts.ORDER_STATUS_TO_READY && this.props.showBtn}>
              <View style={{flexDirection: 'row', marginTop: pxToDp(20), marginVertical: 'auto'}}>
                <Text
                  onPress={() => {
                    Alert.alert('提醒', "忽略配送后系统将不再发单，确定忽略吗？", [{text: '取消'}, {
                      text: '忽略',
                      onPress: () => {
                        this.onOverlookDelivery(item.id)
                      }
                    }])
                  }}
                  style={{
                    width: '47%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    color: colors.white,
                    borderRadius: 2,
                    fontSize: 16,
                    backgroundColor: colors.fontColor
                  }}>忽略配送</Text>
                <Text
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                  }}
                  style={{
                    width: '47%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    color: colors.white,
                    backgroundColor: colors.main_color,
                    borderRadius: 2,
                    fontSize: 16,
                    marginLeft: "5%"
                  }}>呼叫第三方配送</Text>
              </View>
            </If>
            <If condition={item.pickType === "1" && item.orderStatus < 4}>
              <View style={{flexDirection: "row-reverse", marginTop: pxToDp(20)}}>
                <Text
                  onPress={() => {
                    this.veriFicationToShopDialog()
                  }}
                  style={{
                    width: '40%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    color: colors.white,
                    backgroundColor: colors.color777,
                    marginLeft: "15%",
                    fontWeight: "bold"
                  }}>到店核销</Text>
              </View>
            </If>
          </View>
        </TouchableWithoutFeedback>
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.veriFicationToShop}
          title={'输入取货码'}
          titleStyle={{textAlign: 'center', fontWeight: 'bold'}}
        >
          <Input
            placeholder={'请输入取货码'}
            value={`${this.state.pickupCode}`}
            keyboardType='numeric'
            onChangeText={(text) => {
              this.setState({pickupCode: text})
            }}
            style={styles.inputStyle}
          />
          <TouchableOpacity style={{
            backgroundColor: colors.main_color,
            borderRadius: pxToDp(5),
            flexDirection: "row",
            justifyContent: "center",
            marginTop: pxToDp(20)
          }} onPress={async () => {
            await this.setState({veriFicationToShop: false});
            this.goVeriFicationToShop(item.id)
          }}><JbbText style={{
            fontWeight: 'bold',
            color: colors.white,
            paddingVertical: pxToDp(20)
          }}>确定</JbbText></TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: colors.main_color,
            borderRadius: pxToDp(5),
            flexDirection: "row",
            justifyContent: "center",
            marginTop: pxToDp(20)
          }} onPress={async () => {
            this.setState({veriFicationToShop: false});
          }}><JbbText style={{
            fontWeight: 'bold',
            color: colors.white,
            paddingVertical: pxToDp(20)
          }}>取消</JbbText></TouchableOpacity>
        </Dialog>

        <Modal visible={this.state.modalType} onRequestClose={() => this.setState({modalType: false})}
               transparent={true} animationType="slide"
        >
          <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 3, minHeight: pxToDp(200)}}
                            onPress={() => this.setState({modalType: false})}>
          </TouchableOpacity>
          <ScrollView style={{backgroundColor: colors.default_container_bg}}
                      overScrollMode="always"
                      automaticallyAdjustContentInsets={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}>

            <View style={{backgroundColor: colors.default_container_bg}}>
              {allow_edit_ship_rule && <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Config.ROUTE_STORE_STATUS)
                  this.setState({modalType: false})
                  this.mixpanel.track("orderlist.ship.track.to_settings", {store_id, vendor_id});
                }}
              ><View style={{
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: colors.colorEEE
              }}><JbbText
                style={{
                  color: colors.main_color,
                  fontWeight: 'bold',
                  padding: pxToDp(5)
                }}>设置呼叫配送规则</JbbText></View></TouchableOpacity>}
              <Accordion
                onChange={this.onChange}
                activeSections={this.state.activeSections}
                style={[styles.cell_box, {marginTop: pxToDp(10)}]}
              >
                {this.renderProgressData()}
              </Accordion>
              <View style={{
                marginHorizontal: 10,
                borderBottomLeftRadius: pxToDp(20),
                borderBottomRightRadius: pxToDp(20),
                backgroundColor: colors.white,
                flexDirection: "column",
                justifyContent: "space-evenly",
                marginBottom: pxToDp(10)
              }}>
                <View style={styles.btn1}>
                  {this.state.btns.self_ship == 1 &&
                  <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                            onPress={() => Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{text: '取消'}, {
                                                              text: '确定',
                                                              onPress: () => {
                                                                this.onCallSelf()
                                                              }
                                                            }])
                                                            }><JbbText
                    style={styles.btnText}>我自己送</JbbText></TouchableOpacity></View>}
                  {this.state.btns.stop_auto_ship == 1 &&
                  <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onStopSchedulingTo()
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>暂停调度</JbbText></TouchableOpacity></View>}
                  {this.state.btns.call_ship == 1 &&
                  <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onCallThirdShip(0)
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>追加配送</JbbText></TouchableOpacity></View>}
                  {this.state.btns.if_reship == 1 &&
                  <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onCallThirdShip(1)
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>补送</JbbText></TouchableOpacity></View>}
                </View>

              </View>
            </View>
          </ScrollView>
        </Modal>

      </>

    );
  }

  onTransferSelf() {
    const self = this;
    this.clearModalType();
    const api = `/api/order_transfer_self?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.setState({modalType: false})
    }).catch(e => {

    })
  }

  onConfirmCancel = (ship_id) => {
    const {navigation, item} = this.props;
    let order = item
    this.setState({dlgShipVisible: false});
    navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP, {order, ship_id});
  };

  onRequestClose = () => {
    this.setState({
      addTipMoney: false
    })
  }

  onConfirm = () => {
    async () => {
      await this.setState({addTipMoney: false})
    }
    this.upAddTip()
  }

  onChangeAcount = (text) => {
    this.setState({addMoneyNum: text})
  }

  onTousu = (ship_id) => {
    this.setState({modalType: false})
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_COMPLAIN, {id: ship_id})
  };

  clearModalType() {
    this.setState({modalType: false})
  }


  onAddTip = () => {
    this.setState({addTipMoney: true, addTipDialog: true})
  }

  onCallSelf() {
    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
      {
        text: '确定',
        onPress: () => {
          this.onTransferSelf()
        },
      }, {
        text: '取消'
      }
    ])
  }

  onStopScheduling() {
    const self = this;
    const api = `/api/stop_auto_ship?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.setState({modalType: false})
    }).catch(e => {

    })
  }

  onStopSchedulingTo() {
    Alert.alert('提醒', '确定要暂停吗？', [
      {
        text: '确定',
        onPress: () => {
          this.onStopScheduling()
        },
      }, {
        text: '取消'
      }
    ])
  }

  upAddTip() {
    let {addMoneyNum, shipId} = this.state;
    const accessToken = this.props.accessToken;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      this.setState({onSubmitting: true});
      dispatch(addTipMoneyNew(shipId, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          this.setState({addTipMoney: false, respReason: '加小费成功'})
          Alert.alert('提示', `${resp.reason}`, [
            {text: '知道了'}
          ])
        } else {
          this.setState({respReason: resp.desc, ok: resp.ok})
        }
        await this.setState({onSubmitting: false, addMoneyNum: ''});
      }));
    } else {
      this.setState({addMoneyNum: '', respReason: '加小费的金额必须大于0', ok: false});
    }
  }

  onCallThirdShip(if_reship) {
    let order = this.props.item;
    this.clearModalType();
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order.id,
      storeId: order.store_id,
      selectedWay: [],
      if_reship,
      onBack: (res) => {
        if (res && res.count > 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }


  onOverlookDelivery(order_id) {
    const self = this;
    showModal("请求中")
    tool.debounces(() => {
      const api = `/api/transfer_arrived/${order_id}?access_token=${this.props.accessToken}`
      HttpUtils.get.bind(self.props.navigation)(api, {
        orderId: this.props.item.id
      }).then(() => {
        showSuccess('操作成功')
        this.setState({modalType: false})
        this.props.fetchData();
      }).catch(e => {
        showError('操作失败' + e.desc)
      })
    }, 1000)
  }

  onCallThirdShips(order_id, store_id) {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
      selectedWay: [],
      onBack: (res) => {
        if (res && res.count > 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  onClickTimes = (item) => {
    let searchTerm = `@@${item['real_mobile']}|||store:${item['store_id']}`
    const {navigation} = this.props
    navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {term: searchTerm, max_past_day: 10000})
  }

  dialCall = (number) => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber).then(r => {
    });
  }

  onOpenModal(modalType) {
    this.setState({
      modalType: modalType
    }, () => {
    })
  }

  onCopy = (text) => {
    Clipboard.setString(text)
    ToastShort("复制成功")
  }

  veriFicationToShopDialog() {
    this.setState({
      veriFicationToShop: true
    })
  }

  goVeriFicationToShop(id) {
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(success => {
      showSuccess(`核销成功，订单已完成`)
    }).catch((reason) => {
      showError(`${reason.reason}`)
    })
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(10),
    paddingLeft: pxToDp(30)
  },
  verticalLine: {
    backgroundColor: colors.main_color,
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 7,
    marginTop: 20,
  },
  verticalLine1: {
    backgroundColor: '#CBCBCB',
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 7,
    marginTop: 20,
  },
  verticalLine2: {
    backgroundColor: '#fff',
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 7,
    marginTop: 20
  },
  verticalWrap: {
    justifyContent: 'space-around',
    alignItems: "flex-start",
  },
  itemWrap: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  pointWrap: {
    backgroundColor: '#CBCBCB',
    height: 15,
    width: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  pointWrap1: {
    backgroundColor: colors.main_color,
    borderRadius: 15,
    height: 15,
    width: 15,
  },
  pointWrap2: {
    backgroundColor: 'red',
    borderRadius: 15,
    height: 15,
    width: 15,
  },
  markerText1: {
    marginVertical: pxToDp(5),
    color: "black",
    fontSize: pxToDp(24),
    marginLeft: 20
  },
  markerText2: {
    marginVertical: pxToDp(5),
    color: "red",
    fontSize: pxToDp(24),
    marginLeft: 20
  },
  markerText3: {
    color: colors.main_color,
    fontSize: pxToDp(24),
    marginHorizontal: pxToDp(15)
  },
  markerText4: {
    color: colors.main_color,
    fontSize: pxToDp(24),
    marginHorizontal: pxToDp(15)
  },
  markerText5: {
    marginVertical: pxToDp(5),
    color: "black",
    fontSize: pxToDp(24)
  },
  markerText6: {
    marginVertical: pxToDp(5),
    color: "red",
    fontSize: pxToDp(24)
  },
  markerText: {color: 'black', fontSize: pxToDp(30), fontWeight: "bold"},
  currentMarker: {color: 'red', fontSize: pxToDp(30), fontWeight: "bold"},
  btn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: pxToDp(30)
  },
  btn1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: pxToDp(15),
    marginBottom: pxToDp(10)
  },
  btn2: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: pxToDp(15)
  },
  btnText: {
    height: 40,
    backgroundColor: colors.main_color,
    color: 'white',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    borderRadius: pxToDp(10)
  },
  btnText1: {
    height: 30,
    backgroundColor: colors.white,
    color: 'black',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: pxToDp(50),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(30)
  },
  btnText2: {
    height: 40,
    backgroundColor: colors.colorBBB,
    color: 'white',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    borderRadius: pxToDp(10)
  },
  cell_box: {
    marginHorizontal: 10,
    borderTopLeftRadius: pxToDp(20),
    borderTopRightRadius: pxToDp(20),
    borderBottomLeftRadius: pxToDp(0),
    borderBottomRightRadius: pxToDp(0),
    backgroundColor: colors.white,
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  cell_box1: {
    marginHorizontal: 10,
    backgroundColor: colors.white,
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  cell_box2: {
    marginHorizontal: 10,
    backgroundColor: colors.white,
    borderRadius: pxToDp(10),
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  cell_rowTitleText: {
    fontSize: pxToDp(30),
    color: colors.title_color,
    marginVertical: pxToDp(10),
    fontWeight: "bold"
  },
  cell_rowTitleText1: {
    fontSize: pxToDp(24),
    marginVertical: pxToDp(5),
    fontWeight: "bold"
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: pxToDp(10),
    padding: pxToDp(20),
    alignItems: 'center'
  },
  container1: {
    width: '95%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    padding: pxToDp(20),
    justifyContent: "flex-start",
    borderTopWidth: pxToDp(1),
    borderTopColor: "#CCCCCC"
  },
  amountBtn: {
    borderWidth: 1,
    borderColor: colors.title_color,
    width: "30%", textAlign: 'center',
    paddingVertical: pxToDp(5)
  }
});

const MapProgress = (props) => {
  const accessToken = props.accessToken
  const navigation = props.navigation
  const infos = props.data[0]
  const length = infos.length

  if (!infos || length === 0) return null;
  return (
    <View style={[styles.cell_box1], {borderBottomWidth: pxToDp(1), borderColor: colors.colorEEE}}>

      <View style={[styles.verticalWrap], {marginVertical: 10}}>

        {infos.log_lists.map((item, index) => (
          <View>
            {(index == (infos.log_lists.length - 1)) ? <View style={styles.verticalLine2}></View> : <View
              style={[(index == 0 && item.status_color == "green") ? styles.verticalLine : styles.verticalLine1, {height: height}]}></View>}
            <View style={styles.itemWrap}>
              <View
                style={item.status_color == "green" ? styles.pointWrap1 : (item.status_color == "red" ? styles.pointWrap2 : styles.pointWrap)}></View>
              <View style={{marginLeft: 5, flex: 1}}>
                <JbbText
                  style={item.status_desc_color == "red" ? styles.currentMarker : styles.markerText}>
                  {item.status_desc}
                </JbbText>
              </View>
            </View>

            {item.lists.map((itm, ind) => {
              return <View key={ind}
                           style={{
                             flexDirection: "row",
                             justifyContent: "space-between",
                             alignItems: "center"
                           }}>
                <JbbText style={itm.desc_color == "red" ? styles.markerText2 : styles.markerText1}>
                  {itm.desc}
                </JbbText>
                {itm.show_look_location == 1 &&
                <TouchableOpacity style={styles.markerText4} onPress={() => {

                  props.clearModal()
                  let path = '/rider_tracks.html?delivery_id=' + itm.delivery_id + "&access_token=" + accessToken;
                  const uri = Config.serverUrl(path);
                  navigation.navigate(Config.ROUTE_WEB, {url: uri});
                }}><JbbText style={{
                  color: colors.color777,
                  fontSize: pxToDp(22)
                }}>查看位置</JbbText></TouchableOpacity>}

                {itm.driver_phone != '' && <TouchableOpacity style={styles.markerText3} onPress={() => {
                  let phoneNumber = '';
                  if (Platform.OS === 'android') {
                    phoneNumber = `tel:${itm.driver_phone}`;
                  } else {
                    phoneNumber = `telprompt:${itm.driver_phone}`;
                  }
                  Linking.openURL(phoneNumber).then(r => {
                  });
                }}><JbbText style={{
                  color: colors.color777,
                  fontSize: pxToDp(22)
                }}>呼叫骑手</JbbText></TouchableOpacity>}

                <JbbText style={itm.content_color == "red" ? styles.markerText6 : styles.markerText5}>
                  {itm.content}
                </JbbText>
              </View>
            })}
          </View>
        ))}
      </View>
      <Modal
        visible={props.addTipMoney}
        onRequestClose={() => props.onRequestClose()}
        animationType={'fade'}
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.container]}>
            <TouchableOpacity onPress={() => {
              props.onRequestClose()
            }} style={{position: "absolute", right: "3%", top: "3%"}}>
              <Image
                source={require("../../img/My/mistake.png")}
                style={{width: pxToDp(35), height: pxToDp(35), marginRight: pxToDp(10)}}/>
            </TouchableOpacity>
            <JbbText style={{fontWeight: "bold", fontSize: pxToDp(32)}}>加小费</JbbText>
            <JbbText style={{
              fontSize: pxToDp(26),
              color: colors.warn_red,
              marginVertical: pxToDp(20)
            }}>多次添加以累计金额为主，最低一元</JbbText>
            <View style={[styles.container1]}>
              <JbbText style={{fontSize: pxToDp(26)}}>金额</JbbText>
              <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)}}>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(1)
                }}>1元</JbbText>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(2)
                }}>2元</JbbText>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(3)
                }}>3元</JbbText>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)}}>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(4)
                }}>4元</JbbText>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(5)
                }}>5元</JbbText>
                <JbbText style={styles.amountBtn} onPress={() => {
                  props.onChangeAcount(10)
                }}>10元</JbbText>
              </View>
              <View style={{alignItems: "center", marginTop: pxToDp(30)}}>
                <Input
                  style={{
                    fontSize: pxToDp(24),
                    borderWidth: pxToDp(1),
                    paddingLeft: pxToDp(15),
                    width: "100%",
                    height: "40%"
                  }}
                  placeholder={'请输入其他金额'}
                  defaultValue={`${props.addMoneyNum}`}
                  keyboardType='numeric'
                  onChangeText={(value) =>
                    props.onChangeAcount(value)
                  }
                />
                <JbbText style={{
                  fontSize: pxToDp(26),
                  position: "absolute",
                  top: "25%",
                  right: "5%"
                }}>元</JbbText>
              </View>
              {
                (!props.ok || props.addMoneyNum === 0) &&
                <View
                  style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                  <Image
                    source={require('./../../img/Help/cheng.png')}
                    style={{height: pxToDp(32), width: pxToDp(32), marginHorizontal: pxToDp(10)}}
                  />
                  <JbbText style={{
                    color: colors.warn_red,
                    fontWeight: "bold"
                  }}>{props.respReason}</JbbText>
                </View>
              }
            </View>
            <View style={styles.btn1}>
              <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                        onPress={() => {
                                                          props.onRequestClose()
                                                        }}><JbbText
                style={styles.btnText2}>取消</JbbText></TouchableOpacity></View>
              <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                        onPress={() => {
                                                          props.onConfirm()
                                                        }}><JbbText
                style={styles.btnText}>确定</JbbText></TouchableOpacity></View>
            </View>
          </View>
        </View>
      </Modal>
      {(infos.btn_lists.add_tip === 1 || infos.btn_lists.can_cancel === 1 || infos.btn_lists.can_complaint === 1) &&
      <View style={[styles.cell_box1]}>
        <View style={styles.btn2}>
          {infos.btn_lists.add_tip === 1 &&
          <View style={{flex: 1}}><TouchableOpacity onPress={() => {
            props.onAddTip()
          }
          }><JbbText
            style={styles.btnText}>加小费</JbbText></TouchableOpacity></View>}
          {infos.btn_lists.can_complaint === 1 &&
          <View style={{flex: 1, marginHorizontal: pxToDp(10)}}><TouchableOpacity onPress={() => {
            if (tool.length(infos.ship_id) > 0) {
              props.onTousu(infos.ship_id)
            } else {
              showError("暂不支持")
            }
          }}><JbbText style={styles.btnText}>投诉</JbbText></TouchableOpacity></View>}
          {infos.btn_lists.can_cancel === 1 && <View style={{flex: 1}}><TouchableOpacity onPress={() => {
            props.clearModal()
            props.onConfirmCancel(infos.ship_id)
          }}><JbbText style={styles.btnText}>取消配送</JbbText></TouchableOpacity></View>}
        </View>
      </View>}
    </View>
  );
};

export default connect(mapDispatchToProps)(OrderListItem)


