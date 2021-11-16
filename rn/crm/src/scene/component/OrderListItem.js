import React from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import Config from "../../config";
import JbbText from "./JbbText";
import {bindActionCreators} from "redux";
import ReactNative, {
  Alert,
  Clipboard,
  Dimensions,
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
import JbbTextBtn from "./JbbTextBtn";
import {showError, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {Dialog, Input,} from "../../weui/index";
import {addTipMoney, cancelReasonsList, cancelShip, orderCallShip} from "../../reducers/order/orderActions";
import {connect} from "react-redux";
import {tool} from "../../common";

let width = Dimensions.get("window").width;
let height = Dimensions.get("window").height;

const {StyleSheet} = ReactNative

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      addTipMoney, orderCallShip, cancelShip, cancelReasonsList
    }, dispatch)
  }
}

const initState = {
  modalType: false,
  addTipMoney: false,
  addMoneyNum: '',
  ProgressData: [],
  btns: [],
  addTipDialog: false,
  dlgShipVisible: false
}

class OrderListItem extends React.PureComponent {

  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    showBtn: PropTypes.bool,
    onPressDropdown: PropTypes.func,
    onPress: PropTypes.func,
    onRefresh: PropTypes.func,
    fetchData: PropType.func,
    order: PropType.object,
  };

  state = initState

  constructor() {
    super();
  }

  fetchShipData() {
    const self = this;
    const orderId = this.props.item.id;
    const accessToken = this.props.accessToken;
    const api = `/api/third_deliverie_record/${orderId}?access_token=${accessToken}`;
    HttpUtils.get.bind(self.props)(api).then(res => {
      this.setState({modalType: true, ProgressData: res.delivery_lists, btns: res.delivery_btns});
    })
  }

  render() {
    let {item, onPress} = this.props;
    let styleLine = {
      borderTopColor: colors.back_color,
      borderTopWidth: 1 / PixelRatio.get() * 2,
      borderStyle: "dotted"
    };
    return (
      <>
        <TouchableWithoutFeedback onPress={() => {
          onPress(Config.ROUTE_ORDER, {orderId: item.id})
        }}>
          <View style={[Styles.columnStart, {
            backgroundColor: colors.white,
            marginTop: 10,
            paddingVertical: 10,
            marginHorizontal: 12,
            paddingHorizontal: 12
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
              <JbbText style={{color: colors.warn_color, fontSize: 16, fontWeight: 'bold'}}>订单已取消</JbbText>}
            </View>
            <View style={[Styles.row, {paddingBottom: 8}]}>
              <JbbText style={{fontSize: 16}}>{item.userName} </JbbText>
              <JbbTextBtn onPress={() => this.onClickTimes(item)}>
                {item.order_times <= 1 ? '新客户' : `第${item.order_times}次`} </JbbTextBtn>
            </View>
            <View style={[Styles.row]}><JbbText>电话: </JbbText>
              <JbbText>{item.mobileReadable}</JbbText>
              <JbbText onPress={() => this.dialCall(item.mobile)}
                       style={{paddingBottom: 8, color: colors.main_color, paddingStart: 2}}>呼叫</JbbText></View>
            <View style={[Styles.columnStart, {paddingBottom: 8}]}>
              <View style={[Styles.row]}><JbbText>地址: </JbbText><JbbText
                style={{marginRight: 24}}>{item.address}</JbbText></View>
            </View>

            <View style={[Styles.columnStart, styleLine]}>
              <View
                style={[Styles.between, {paddingTop: 8}]}><JbbText>下单: {item.orderTimeInList} </JbbText><JbbText>{item.moneyLabel}:
                ¥{item.moneyInList}</JbbText></View>
              <View style={[Styles.between]}>
                <JbbText style={{paddingTop: 8}}>单号: {item.id} </JbbText>
                <View style={[Styles.between]}>
                  <JbbText selectable={true} style={{paddingTop: 8}}>{item.platform_oid}</JbbText>
                  <JbbText onPress={() => this.onCopy(item.platform_oid)}
                           style={{color: colors.main_color, paddingStart: 2, paddingTop: 8}}>复制</JbbText>
                </View>
              </View>
            </View>
            {/*<View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>*/}
            {/*  <View style={[Styles.between, {paddingTop: 8}]}>*/}
            {/*    <JbbText>骑手: {item.shipStatusText}</JbbText>*/}
            {/*    <Text onPress={() =>{*/}
            {/*      this.fetchShipData()*/}
            {/*    }*/}
            {/*    } style={{color: colors.main_color}}>查看</Text>*/}
            {/*  </View>*/}
            {/*</View>*/}
            <View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>
              <View
                style={[Styles.between, {paddingTop: 8}]}><JbbText>骑手: {item.shipStatusText}</JbbText>{!!item.ship_worker_mobile &&
              <JbbText onPress={() => this.dialCall(item.ship_worker_mobile)}
                       style={{color: colors.main_color}}>呼叫</JbbText>}
              </View>
            </View>
            <If condition={Number(item.orderStatus) === Cts.ORDER_STATUS_TO_READY && this.props.showBtn}>
              <View style={{flexDirection: 'row', marginTop: pxToDp(20)}}>
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
                    width: '40%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    borderWidth: pxToDp(2),
                    color: colors.fontColor,
                    borderColor: colors.fontColor
                  }}>忽略配送</Text>
                <Text
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                  }}
                  style={{
                    width: '40%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    color: colors.white,
                    backgroundColor: colors.fontColor,
                    marginLeft: "15%"
                  }}>呼叫第三方配送</Text>
              </View>
            </If>
          </View>


        </TouchableWithoutFeedback>
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.addTipMoney}
          title={'加小费'}
          buttons={[{
            type: 'default',
            label: '取消',
            onPress: () => {
              this.setState({addTipMoney: false, addMoneyNum: ''})
            }
          },
            {
              type: 'default',
              label: '确定',
              onPress: async () => {
                await this.setState({addTipMoney: false});
                this.upAddTip()
              }
            }
          ]}
        >
          <Input
            placeholder={'请输入金额，金额只能大于0'}
            value={`${this.state.addMoneyNum}`}
            keyboardType='numeric'
            onChangeText={(text) => {
              this.setState({addMoneyNum: text})
            }}
          />
        </Dialog>

        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.addTipDialog}
          buttons={[{
            type: 'default',
            label: '知道了',
            onPress: () => {
              this.setState({addTipDialog: false, addTipMoney: true})
            }
          }]}
        >
          <View>
            <Text style={{color: '#000'}}>
              1.达达或美团快送加小费金额以
              <Text style={{color: "red"}}>最新一次为准</Text>
              ,新一次金额必须大于上次加小费的金额.
            </Text>
            <Text style={{color: '#000'}}>2. 如果加错小费, 或需减少小费, 请取消配送, 并重新发单, 小费将被清0, 可重新加小费.</Text>
          </View>
        </Dialog>

        <Modal visible={this.state.modalType} onRequestClose={() => this.setState({modalType: false})}
               transparent={true} animationType="slide"
        >
          <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0,0.25)', height: height, flex: 1}}
                            onPress={() => this.setState({modalType: false})}/>
          <View style={{backgroundColor: colors.white, height: height, flex: 1, width: width}}>
            <View style={[styles.toOnlineBtn, {borderRightWidth: 0}]}>
              <ScrollView style={{height: "100%", width: width}}>
                <MapProgress data={[...this.state.ProgressData]} accessToken={this.props.accessToken}
                             navigation={this.props.navigation}/>
              </ScrollView>
            </View>
            <View style={styles.btn}>
              {this.state.btns.self_ship == 1 && <TouchableOpacity><JbbText style={styles.btnText}
                                                                            onPress={() => Alert.alert('提醒', "自己送后系统将不再分配骑手，确定自己送吗?", [{text: '取消'}, {
                                                                              text: '确定',
                                                                              onPress: () => {
                                                                                this.onCallSelf()
                                                                              }
                                                                            }])
                                                                            }>我要自己送</JbbText></TouchableOpacity>}
              {this.state.btns.add_tip == 1 &&
              <TouchableOpacity onPress={() => this.setState({addTipMoney: true, addTipDialog: true})}><JbbText
                style={styles.btnText}>加小费</JbbText></TouchableOpacity>}
              {this.state.btns.stop_auto_ship == 1 && <TouchableOpacity onPress={() => {
                this.onStopSchedulingTo()
              }}><JbbText style={styles.btnText}>暂停调度</JbbText></TouchableOpacity>}
              {this.state.btns.cancel_ship == 1 && <TouchableOpacity onPress={() => {
                this.onConfirmCancel(this.state.btns.cancel_ship_id)
              }}><JbbText style={styles.btnText}>取消配送</JbbText></TouchableOpacity>}
              {this.state.btns.call_ship == 1 && <TouchableOpacity onPress={() => {
                this.onCallThirdShip(0)
              }}><JbbText style={styles.btnText}>追加配送</JbbText></TouchableOpacity>}
              {this.state.btns.if_reship == 1 && <TouchableOpacity onPress={() => {
                this.onCallThirdShip(1)
              }}><JbbText style={styles.btnText}>补送</JbbText></TouchableOpacity>}
            </View>
          </View>
        </Modal>
      </>
    );
  }

  onTransferSelf() {
    const self = this;
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
    let {orderId} = this.props.item.id
    let {addMoneyNum} = this.state;
    const accessToken = this.props.accessToken;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      this.setState({onSubmitting: true});
      dispatch(addTipMoney(orderId, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          ToastLong('加小费成功')
          this.setState({addTipDialog: false})
        } else {
          ToastLong(resp.desc)
        }
        await this.setState({onSubmitting: false, addMoneyNum: ''});
        this._orderChangeLogQuery();
      }));
    } else {
      this.setState({addMoneyNum: ''});
      ToastLong('加小费的金额必须大于0')
    }
  }

  onCallThirdShip(if_reship) {
    console.log('调用呼叫第三方配送')
    let order = this.props.item;
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
        showError('操作失败' + e)
      })
    }, 1000)
  }

  onCallThirdShips(order_id, store_id) {
    console.log('调用呼叫第三方配送')
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
      console.log(`call ${phoneNumber} done:`, r)
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
}

const styles = StyleSheet.create({
  verticalLine: {
    backgroundColor: 'green',
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 35,
    marginTop: 20,
  },
  verticalLine1: {
    backgroundColor: '#CBCBCB',
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 35,
    marginTop: 20,
  },
  verticalLine2: {
    backgroundColor: '#fff',
    width: 2,
    height: height,
    position: 'absolute',
    marginLeft: 35,
    marginTop: 20,
  },
  verticalWrap: {
    justifyContent: 'space-around',
    alignItems: "flex-start",
    height: '100%',
  },
  itemWrap: {
    width: '100%',
    height: 40,
    marginLeft: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    position: "relative"
  },
  pointWrap: {
    backgroundColor: '#CBCBCB',
    height: 20,
    width: 20,
    borderRadius: 20,
    marginLeft: 5,
    alignItems: 'center',
  },
  pointWrap1: {
    backgroundColor: 'green',
    borderRadius: 20,
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  pointWrap2: {
    backgroundColor: 'red',
    borderRadius: 20,
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  markerText1: {
    marginVertical: pxToDp(5),
    color: "black",
    fontSize: pxToDp(24),
    position: 'relative',
    top: -5,
    left: 50,
  },
  markerText2: {
    marginVertical: pxToDp(5),
    color: "red",
    fontSize: pxToDp(24),
    position: 'relative',
    top: -5,
    left: 50,
  },
  markerText3: {
    color: "green",
    fontSize: pxToDp(24),
    marginLeft: 55,
    position: "absolute",
    top: -2,
    left: 130
  },
  markerText4: {
    color: "green",
    fontSize: pxToDp(24),
    marginLeft: 55,
    position: "absolute",
    top: -2,
    left: 190
  },
  markerText5: {
    marginVertical: pxToDp(5),
    color: "black",
    fontSize: pxToDp(24),
    position: 'relative',
    top: -5,
    right: "110%",
  },
  markerText6: {
    marginVertical: pxToDp(5),
    color: "red",
    fontSize: pxToDp(24),
    position: 'relative',
    top: -5,
    right: "110%",
  },
  markerText: {color: 'black', fontSize: pxToDp(30), fontWeight: "bold"},
  currentMarker: {color: 'red', fontSize: pxToDp(30), fontWeight: "bold"},
  toOnlineBtn: {
    borderRightWidth: pxToDp(1),
    borderColor: colors.colorBBB,
    flexDirection: "column-reverse",
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    flex: 1
  },
  btn: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: pxToDp(50)
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
    borderRadius: pxToDp(50)
  }
});

const MapProgress = (props) => {
  const accessToken = props.accessToken
  const navigation = props.navigation
  const length = props.data.length
  if (!props.data || length === 0) return null;
  return (
    <View style={{flex: 1}}>
      <View style={styles.verticalWrap}>

        {props.data.map((item, index) => (
          <View>
            {(index == (length - 1)) ? <View style={styles.verticalLine2}></View> : <View
              style={[(index == 0 && item.status_color == "green") ? styles.verticalLine : styles.verticalLine1, {height: height}]}></View>}
            <View style={styles.itemWrap}>
              <View
                style={item.status_color == "green" ? styles.pointWrap1 : (item.status_color == "red" ? styles.pointWrap2 : styles.pointWrap)}></View>
              <View style={{marginLeft: 5, flex: 1}}>
                <JbbText style={item.status_desc_color == "red" ? styles.currentMarker : styles.markerText}>
                  {item.status_desc}
                </JbbText>
              </View>
            </View>

            {item.lists.map((itm, ind) => {
              return <View key={ind} style={{flexDirection: "row", justifyContent: "space-between"}}>
                <JbbText style={itm.desc_color == "red" ? styles.markerText2 : styles.markerText1}>
                  {itm.desc}
                </JbbText>
                {itm.show_look_location == 1 && <TouchableOpacity style={styles.markerText4} onPress={() => {
                  let path = '/rider_tracks.html?delivery_id=' + itm.delivery_id + "&access_token=" + accessToken;
                  const uri = Config.serverUrl(path);
                  navigation.navigate(Config.ROUTE_WEB, {url: uri});
                }}><JbbText style={{color: "green", fontSize: pxToDp(22)}}>查看位置</JbbText></TouchableOpacity>}

                {itm.driver_phone != '' && <TouchableOpacity style={styles.markerText3} onPress={() => {
                  let phoneNumber = '';
                  if (Platform.OS === 'android') {
                    phoneNumber = `tel:${itm.driver_phone}`;
                  } else {
                    phoneNumber = `telprompt:${itm.driver_phone}`;
                  }
                  Linking.openURL(phoneNumber).then(r => {
                    console.log(`call ${phoneNumber} done:`, r)
                  });
                }}><JbbText style={{color: "green", fontSize: pxToDp(22)}}>呼叫骑手</JbbText></TouchableOpacity>}

                <JbbText style={itm.content_color == "red" ? styles.markerText6 : styles.markerText5}>
                  {itm.content}
                </JbbText>
              </View>
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default connect(mapDispatchToProps)(OrderListItem)


