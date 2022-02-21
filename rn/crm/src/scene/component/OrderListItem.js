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
  Modal,
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
import {native, tool} from "../../common";
import {MixpanelInstance} from '../../common/analytics';
import {set_mixpanel_id} from '../../reducers/global/globalActions'
import Entypo from "react-native-vector-icons/Entypo"
import {Button} from "react-native-elements";

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
    setState: PropType.func
  };
  state = {
    modalTip: false,
    modalType: false,
    addTipModal: false,
    addMoneyNum: '',
    veriFicationToShop: false,
    pickupCode: '',
    respReason: '',
    order_id: "",
    store_id: "",
    showDeliveryModal: false,
    delivery_list: [],
    delivery_btn: [],
    if_reship: 0,
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

  fetchShipData(item) {
    tool.debounces(() => {
      //保存参数 作为Tips的传参
      this.state.order_id = item.id;
      this.state.store_id = item.store_id;
      showModal('加载中...')
      const self = this;
      const orderId = this.props.item.id;
      const accessToken = this.props.accessToken;
      const api = `/v1/new_api/orders/third_deliverie_record/${orderId}?access_token=${accessToken}`;
      HttpUtils.get.bind(self.props)(api).then(res => {
        if (tool.length(res.delivery_lists)) {
          this.setState({showDeliveryModal: true, delivery_list: res.delivery_lists, if_reship: res.delivery_btns.if_reship, delivery_btn: res.delivery_btns});
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
    }, 600)
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

  onTransferSelf() {
    const api = `/api/order_transfer_self?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
    }).catch(e => {
      ToastLong('操作失败:' + e.desc);
    })
  }

  onChangeAcount = (text) => {
    this.setState({addMoneyNum: text})
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

  onStopScheduling() {
    const self = this;
    const api = `/api/stop_auto_ship?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.setState({showDeliveryModal: false})
    }).catch(e => {
      ToastLong('操作失败')
    })
  }


  upAddTip() {
    let {addMoneyNum, shipId} = this.state;
    const accessToken = this.props.accessToken;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      dispatch(addTipMoneyNew(shipId, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          this.setState({addTipModal: false, respReason: '加小费成功'})
          ToastShort(resp.reason)
        } else {
          this.setState({respReason: resp.desc, ok: resp.ok})
        }
        await this.setState({addMoneyNum: ''});
      }));
    } else {
      this.setState({addMoneyNum: '', respReason: '加小费的金额必须大于0', ok: false});
    }
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
        this.props.fetchData();
      }).catch(e => {
        showError('操作失败' + e.desc)
      })
    }, 600)
  }

  onCallThirdShips(order_id, store_id, if_reship) {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
      selectedWay: [],
      if_reship: if_reship,
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

  goVeriFicationToShop(id) {
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(success => {
      showSuccess(`核销成功，订单已完成`)
    }).catch((reason) => {
      showError(`${reason.reason}`)
    })
  }


  render() {
    return (
      <View>
        <Tips navigation={this.props.navigation} orderId={this.state.order_id}
              storeId={this.state.store_id} key={this.state.order_id} modalTip={this.state.modalTip}
              onItemClick={() => {
                this.setState({
                  modalTip: false
                })
              }}></Tips>
        {this.renderItem()}
        {this.renderPickModal()}
        {this.renderDeliveryModal()}
      </View>
    );
  }

  renderItem() {
    let {item, onPress} = this.props;
    return (
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
              <Text onPress={() => {
                native.dialNumber(item.mobile)
              }}
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

          <If condition={item.orderStatus === "10"}>
            <TouchableOpacity onPress={() => {
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
                    position: 'absolute',
                    top: pxToDp(0),
                    width: pxToDp(36),
                    height: pxToDp(36),
                  }}
                /><Text style={{marginLeft: pxToDp(60), lineHeight: pxToDp(40)}}>长时间没有骑手接单怎么办？</Text>
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
                  this.setState({
                    veriFicationToShop: true
                  })
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
    )
  }

  renderPickModal() {
    let {item, onPress} = this.props;
    return (<Dialog
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
    </Dialog>)
  }

  renderDeliveryModal() {
    let {navigation} = this.props;
    let {order_id, store_id, delivery_btn} = this.state
    let height = tool.length(this.state.delivery_list) >= 3 ? pxToDp(800) : tool.length(this.state.delivery_list) * 250;
    if (tool.length(this.state.delivery_list) < 2) {
      height = 400;
    }
    return (
      <View>
        <Modal
          visible={this.state.addTipModal}
          onRequestClose={() => {
            this.setState({
              addTipModal: false
            })
          }}
          animationType={'fade'}
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.container]}>
              <TouchableOpacity onPress={() => {
                this.setState({
                  addTipModal: false
                })
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
                    this.onChangeAcount(1)
                  }}>1元</JbbText>
                  <JbbText style={styles.amountBtn} onPress={() => {
                    this.onChangeAcount(2)
                  }}>2元</JbbText>
                  <JbbText style={styles.amountBtn} onPress={() => {
                    this.onChangeAcount(3)
                  }}>3元</JbbText>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)}}>
                  <JbbText style={styles.amountBtn} onPress={() => {
                    this.onChangeAcount(4)
                  }}>4元</JbbText>
                  <JbbText style={styles.amountBtn} onPress={() => {
                    this.onChangeAcount(5)
                  }}>5元</JbbText>
                  <JbbText style={styles.amountBtn} onPress={() => {
                    this.onChangeAcount(10)
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
                    defaultValue={`${this.state.addMoneyNum}`}
                    keyboardType='numeric'
                    onChangeText={(value) =>
                      this.onChangeAcount(value)
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
                  (!this.state.ok || this.state.addMoneyNum === 0) &&
                  <View
                    style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                    <Image
                      source={require('./../../img/Help/cheng.png')}
                      style={{height: pxToDp(32), width: pxToDp(32), marginHorizontal: pxToDp(10)}}
                    />
                    <JbbText style={{
                      color: colors.warn_red,
                      fontWeight: "bold"
                    }}>{this.state.respReason}</JbbText>
                  </View>
                }
              </View>
              <View style={styles.btn1}>
                <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                          onPress={() => {
                                                            this.setState({
                                                              addTipModal: false
                                                            })
                                                          }}><JbbText
                  style={styles.btnText2}>取消</JbbText></TouchableOpacity></View>
                <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                          onPress={() => {
                                                            this.upAddTip()
                                                          }}><JbbText
                  style={styles.btnText}>确定</JbbText></TouchableOpacity></View>
              </View>
            </View>
          </View>
        </Modal>


        <Modal visible={this.state.showDeliveryModal} hardwareAccelerated={true}
               onRequestClose={() => this.setState({showDeliveryModal: false})}
               transparent={true}>
          <View style={{flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)',}}>
            <TouchableOpacity style={{flex: 1}} onPress={() => {
              this.setState({showDeliveryModal: false})
            }}></TouchableOpacity>
            <View style={{
              backgroundColor: colors.white,
              height: height,
              borderTopLeftRadius: pxToDp(30),
              borderTopRightRadius: pxToDp(30),
            }}>
              <View style={{flexDirection: 'row',}}>
                <Text onPress={() => {
                  navigation.navigate(Config.ROUTE_STORE_STATUS)
                  this.setState({showDeliveryModal: false})
                }} style={{color: colors.main_color, marginTop: pxToDp(20), marginLeft: pxToDp(20)}}>呼叫配送规则</Text>
                <View style={{flex: 1}}></View>
                <TouchableOpacity onPress={() => {
                  this.setState({showDeliveryModal: false})
                }}>
                  <Entypo name={'cross'} style={{fontSize: pxToDp(50), color: colors.fontColor}}/>
                </TouchableOpacity>
              </View>

              <ScrollView
                overScrollMode="always"
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}>

                <View style={{padding: pxToDp(20),}}>
                  <For each="info" index="i" of={this.state.delivery_list}>
                    <View key={i} style={{
                      padding: pxToDp(20),
                      borderRadius: pxToDp(15),
                      backgroundColor: "#F3F3F3",
                      marginBottom: pxToDp(20),
                    }}>
                      <TouchableOpacity onPress={() => {
                        let delivery_list = this.state.delivery_list
                        delivery_list[i].default_show = !delivery_list[i].default_show
                        this.props.setState({
                          delivery_list: delivery_list
                        })
                      }} style={{flexDirection: 'row'}}>
                        <Text style={{fontSize: 12, fontWeight: 'bold'}}>{info.desc}  </Text>
                        <Text style={{
                          color: info.content_color,
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>{info.status_content} - {info.fee} 元 </Text>
                        <View style={{flex: 1}}></View>
                        {!info.default_show ? <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> :
                          <Entypo name='chevron-thin-up' style={{fontSize: 14}}/>}
                      </TouchableOpacity>
                      <View
                        style={{fontSize: 12, marginTop: 12, marginBottom: 12, flexDirection: 'row'}}>
                        <Text style={{width: pxToDp(450)}}>{info.content} {info.driver_phone}  </Text>

                      </View>
                      {info.default_show ? this.renderDeliveryStatus(info.log_lists) : null}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                        {info.btn_lists.can_cancel === 1 ? <Button title={'撤回呼叫'}
                                                                   onPress={() => {
                                                                     this.setState({showDeliveryModal: false})
                                                                     navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP,
                                                                       {
                                                                         order: this.state.order,
                                                                         ship_id: info.ship_id,
                                                                         onCancelled: (ok, reason) => {
                                                                           this.fetchData()
                                                                         }
                                                                       });
                                                                   }}
                                                                   buttonStyle={{
                                                                     backgroundColor: colors.white,
                                                                     borderWidth: pxToDp(2),
                                                                     width: pxToDp(150),
                                                                     borderColor: colors.fontBlack,
                                                                     borderRadius: pxToDp(10),
                                                                     padding: pxToDp(14),
                                                                     marginRight: pxToDp(15)
                                                                   }}
                                                                   titleStyle={{
                                                                     color: colors.fontBlack,
                                                                     fontSize: 12,
                                                                     fontWeight: 'bold'
                                                                   }}
                        /> : null}
                        {info.btn_lists.can_complaint === 1 ? <Button title={'投诉骑手'}
                                                                      onPress={() => {
                                                                        this.setState({showDeliveryModal: false})
                                                                        navigation.navigate(Config.ROUTE_COMPLAIN, {id: info.ship_id})
                                                                      }}
                                                                      buttonStyle={{
                                                                        backgroundColor: colors.white,
                                                                        borderWidth: pxToDp(1),
                                                                        width: pxToDp(150),
                                                                        borderColor: colors.fontBlack,
                                                                        borderRadius: pxToDp(10),
                                                                        padding: pxToDp(15),
                                                                        marginRight: pxToDp(15)
                                                                      }}
                                                                      titleStyle={{
                                                                        color: colors.fontBlack,
                                                                        fontSize: 12,
                                                                      }}
                        /> : null}

                        {info.btn_lists.can_view_position === 1 ? <Button title={'查看位置'}
                                                                          onPress={() => {
                                                                            this.setState({showDeliveryModal: false})
                                                                            const accessToken = this.props.accessToken
                                                                            let path = '/rider_tracks.html?delivery_id=' + info.ship_id + "&access_token=" + accessToken;
                                                                            const uri = Config.serverUrl(path);
                                                                            this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
                                                                          }}
                                                                          buttonStyle={{
                                                                            backgroundColor: colors.white,
                                                                            borderWidth: pxToDp(1),
                                                                            width: pxToDp(150),
                                                                            borderColor: colors.main_color,
                                                                            borderRadius: pxToDp(10),
                                                                            padding: pxToDp(15),
                                                                            marginRight: pxToDp(15)
                                                                          }}

                                                                          titleStyle={{
                                                                            color: colors.main_color,
                                                                            fontSize: 12,
                                                                          }}
                        /> : null}
                        {info.btn_lists.add_tip === 1 ?
                          <Button title={'加小费'}
                                  onPress={() => {
                                    this.setState({addTipModal: true, showDeliveryModal: false, shipId: info.ship_id})
                                  }}
                                  buttonStyle={{
                                    backgroundColor: colors.main_color,
                                    width: pxToDp(150),
                                    borderRadius: pxToDp(10),
                                    padding: pxToDp(15),
                                    marginRight: pxToDp(15)
                                  }}
                                  titleStyle={{
                                    color: colors.white,
                                    fontSize: 12,
                                  }}
                          />
                          : null}
                        {info.btn_lists.can_call === 1 ? <Button title={'呼叫骑手'}
                                                                 onPress={() => {
                                                                   native.dialNumber(info.driver_phone)
                                                                 }}
                                                                 buttonStyle={{
                                                                   backgroundColor: colors.main_color,
                                                                   borderWidth: pxToDp(1),
                                                                   width: pxToDp(150),
                                                                   borderColor: colors.fontColor,
                                                                   borderRadius: pxToDp(10),
                                                                   padding: pxToDp(15),
                                                                   marginRight: pxToDp(15)
                                                                 }}
                                                                 titleStyle={{
                                                                   color: colors.white,
                                                                   fontSize: 12,
                                                                 }}
                        /> : null}
                      </View>
                    </View>
                  </For>
                  <View style={{
                    marginHorizontal: 10,
                    borderBottomLeftRadius: pxToDp(20),
                    borderBottomRightRadius: pxToDp(20),
                    backgroundColor: colors.white,
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginBottom: pxToDp(10)
                  }}>
                    {delivery_btn.if_reship === 1 && <Button title={'补送'}
                                                           onPress={() => {
                                                             this.setState({showDeliveryModal: false})
                                                             this.onCallThirdShips(order_id, store_id, 1)
                                                           }}
                                                           buttonStyle={{
                                                             backgroundColor: colors.main_color,
                                                             borderWidth: pxToDp(1),
                                                             width: pxToDp(150),
                                                             borderColor: colors.fontColor,
                                                             borderRadius: pxToDp(10),
                                                             padding: pxToDp(15),
                                                             marginRight: pxToDp(15)
                                                           }}
                                                           titleStyle={{
                                                             color: colors.white,
                                                             fontSize: 12,
                                                           }}
                    />}
                    {delivery_btn.self_ship === 1 && <Button title={'我自己送'}
                                                               onPress={() => {
                                                                 this.setState({showDeliveryModal: false})
                                                                 Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{text: '取消'}, {
                                                                   text: '确定',
                                                                   onPress: () => {
                                                                     this.onCallSelf()
                                                                   }
                                                                 }])

                                                               }}
                                                               buttonStyle={{
                                                                 backgroundColor: colors.main_color,
                                                                 borderWidth: pxToDp(1),
                                                                 width: pxToDp(150),
                                                                 borderColor: colors.fontColor,
                                                                 borderRadius: pxToDp(10),
                                                                 padding: pxToDp(15),
                                                                 marginRight: pxToDp(15)
                                                               }}
                                                               titleStyle={{
                                                                 color: colors.white,
                                                                 fontSize: 12,
                                                               }}
                    />}
                    {delivery_btn.stop_auto_ship === 1 && <Button title={'暂停调度'}
                                                                    onPress={() => {
                                                                      this.setState({showDeliveryModal: false})
                                                                      this.onStopSchedulingTo()
                                                                    }}
                                                                    buttonStyle={{
                                                                      backgroundColor: colors.main_color,
                                                                      borderWidth: pxToDp(1),
                                                                      width: pxToDp(150),
                                                                      borderColor: colors.fontColor,
                                                                      borderRadius: pxToDp(10),
                                                                      padding: pxToDp(15),
                                                                      marginRight: pxToDp(15)
                                                                    }}
                                                                    titleStyle={{
                                                                      color: colors.white,
                                                                      fontSize: 12,
                                                                    }}
                    />}
                    {delivery_btn.call_ship === 1 && <Button title={'追加配送'}
                                                               onPress={() => {
                                                                 this.setState({showDeliveryModal: false})
                                                                 this.onCallThirdShips(order_id, store_id, 0)
                                                               }}
                                                               buttonStyle={{
                                                                 backgroundColor: colors.main_color,
                                                                 borderWidth: pxToDp(1),
                                                                 width: pxToDp(150),
                                                                 borderColor: colors.fontColor,
                                                                 borderRadius: pxToDp(10),
                                                                 padding: pxToDp(15),
                                                                 marginRight: pxToDp(15)
                                                               }}
                                                               titleStyle={{
                                                                 color: colors.white,
                                                                 fontSize: 12,
                                                               }}
                    />}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    )
  }


  renderDeliveryStatus(list) {
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View style={{
            flexDirection: 'row',
            paddingTop: pxToDp(15),
            paddingBottom: pxToDp(15),
          }}>
            <View style={{width: 30}}>
              <View style={{
                width: pxToDp(30),
                height: pxToDp(30),
                backgroundColor: log.status_color,
                borderRadius: pxToDp(15)
              }}>
                {i !== 0 ? <View style={{
                  width: pxToDp(5),
                  height: pxToDp(35),
                  backgroundColor: log.status_color,
                  position: 'absolute',
                  bottom: pxToDp(28),
                  left: pxToDp(13)
                }}></View> : null}

                {i !== list.length - 1 ? <View style={{
                    width: pxToDp(5),
                    height: pxToDp(35),
                    backgroundColor: log.status_color,
                    position: 'absolute',
                    top: pxToDp(28),
                    left: pxToDp(13)
                  }}></View>
                  : null}
              </View>
            </View>
            <View style={{width: '90%'}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color: log.status_desc_color, fontSize: 12}}>{log.status_desc}  </Text>
                <View style={{flex: 1}}></View>
                <Text style={{color: log.lists[0].content_color, fontSize: 12}}>{log.lists[0].content}  </Text>
              </View>
              <Text
                style={{
                  color: log.lists[0].desc_color,
                  fontSize: 10,
                  marginTop: pxToDp(10)
                }}>{log.lists[0].desc}  </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(10),
    paddingLeft: pxToDp(30)
  },
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


export default connect(mapDispatchToProps)(OrderListItem)


