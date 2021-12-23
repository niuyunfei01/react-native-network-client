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
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {Dialog, Input,} from "../../weui/index";
import {addTipMoney, cancelReasonsList, cancelShip, orderCallShip} from "../../reducers/order/orderActions";
import {connect} from "react-redux";
import {tool} from "../../common";
import {Accordion} from "@ant-design/react-native";
import {MixpanelInstance} from '../../common/analytics';
import {set_mixpanel_id} from '../../reducers/global/globalActions'

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

  state = {
    modalType: false,
    addTipMoney: false,
    addMoneyNum: '',
    ProgressData: [],
    btns: [],
    addTipDialog: false,
    dlgShipVisible: false,
    activeSections: []
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

  fetchShipData() {
    tool.debounces(() => {
    showModal('加载中...')
    const self = this;
    const orderId = this.props.item.id;
    const accessToken = this.props.accessToken;
    const api = `/api/third_deliverie_record/${orderId}?access_token=${accessToken}`;
    HttpUtils.get.bind(self.props)(api).then(res => {

      if (tool.length(res.delivery_lists)) {
        this.setState({modalType: true, ProgressData: res.delivery_lists, btns: res.delivery_btns});
      }
      hideModal()
    }).catch((obj) => {
      if (!obj.ok) {
        showError(`${obj.reason}`)
      }
    })
    }, 1000)
  }

  renderSchedulingDetails(item) {
    let items = []
    items.push(item)
    return (
      <MapProgress data={items} accessToken={this.props.accessToken}
                   navigation={this.props.navigation} onConfirmCancel={this.onConfirmCancel}
                   onTousu={this.onTousu.bind(this)} clearModal={this.clearModalType.bind(this)}
                   onAddTip={this.onAddTip} orderId={this.props.item.id} dispatch={this.props.dispatch}/>
    )
  }

  onChange = activeSections => {
    this.setState({activeSections});
  };

  renderProgressData() {
    let {ProgressData} = this.state
    let items = []
    for (let i in ProgressData) {
      let item = ProgressData[i]
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
            {this.renderSchedulingDetails(item)}
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
            <If condition={item.show_store_name}>
              <View style={[Styles.columnStart, {paddingBottom: 8}]}>
                <View style={[Styles.row]}><JbbText>店铺: </JbbText><JbbText
                  style={{marginRight: 24}}>{item.show_store_name}</JbbText></View>
              </View>
            </If>
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
            <View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>
              <View style={[Styles.between, {paddingTop: 12}]}>
                <JbbText>骑手: {item.shipStatusText}</JbbText>
                <Text onPress={() => {
                  this.fetchShipData()
                }
                } style={{color: colors.main_color, fontSize: pxToDp(30), fontWeight: "bold"}}>查看</Text>
              </View>
            </View>
            {/*<View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>*/}
            {/*  <View*/}
            {/*    style={[Styles.between, {paddingTop: 8}]}><JbbText>骑手: {item.shipStatusText}</JbbText>{!!item.ship_worker_mobile &&*/}
            {/*  <JbbText onPress={() => this.dialCall(item.ship_worker_mobile)}*/}
            {/*           style={{color: colors.main_color}}>呼叫</JbbText>}*/}
            {/*  </View>*/}
            {/*</View>*/}
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
               transparent={true} animationType="slide" style={{backgroundColor: 'rgba(0,0,0,0.25)'}}
        >
          <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 1, minHeight: pxToDp(200)}}
                            onPress={() => this.setState({modalType: false})}>
          </TouchableOpacity>

          <View style={{backgroundColor: colors.default_container_bg}}>
            {allow_edit_ship_rule && <TouchableOpacity
              onPress={() => {
                navigation.navigate(Config.ROUTE_STORE_STATUS)
                this.setState({modalType: false})
                this.mixpanel.track("orderlist.ship.track.to_settings", {store_id, vendor_id});
              }}
            ><View style={{flexDirection: "row", justifyContent: "center", backgroundColor: colors.colorEEE}}><JbbText
              style={{
                color: colors.main_color,
                fontWeight: 'bold',
                padding: pxToDp(5)
              }}>设置呼叫配送规则</JbbText></View></TouchableOpacity>}
            <ScrollView style={{marginBottom: pxToDp(20), backgroundColor: colors.default_container_bg}}>
              <Accordion
                onChange={this.onChange}
                activeSections={this.state.activeSections}
                style={styles.cell_box}
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
                  {this.state.btns.stop_auto_ship == 1 && <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onStopSchedulingTo()
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>暂停调度</JbbText></TouchableOpacity></View>}
                  {this.state.btns.call_ship == 1 && <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onCallThirdShip(0)
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>追加配送</JbbText></TouchableOpacity></View>}
                  {this.state.btns.if_reship == 1 && <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                    this.onCallThirdShip(1)
                  }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                    style={styles.btnText}>补送</JbbText></TouchableOpacity></View>}
                </View>
              </View>
            </ScrollView>

          </View>
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
    let {id} = this.props.item
    let {addMoneyNum} = this.state;
    const accessToken = this.props.accessToken;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      this.setState({onSubmitting: true});
      dispatch(addTipMoney(id, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          ToastLong('加小费成功')
          this.setState({addTipDialog: false})
        } else {
          ToastLong(resp.desc)
        }
        await this.setState({onSubmitting: false, addMoneyNum: ''});
      }));
    } else {
      this.setState({addMoneyNum: ''});
      ToastLong('加小费的金额必须大于0')
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
        showError('操作失败' + e)
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
}

const styles = StyleSheet.create({
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
                <JbbText style={item.status_desc_color == "red" ? styles.currentMarker : styles.markerText}>
                  {item.status_desc}
                </JbbText>
              </View>
            </View>

            {item.lists.map((itm, ind) => {
              return <View key={ind}
                           style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <JbbText style={itm.desc_color == "red" ? styles.markerText2 : styles.markerText1}>
                  {itm.desc}
                </JbbText>
                {itm.show_look_location == 1 && <TouchableOpacity style={styles.markerText4} onPress={() => {

                  props.clearModal()
                  let path = '/rider_tracks.html?delivery_id=' + itm.delivery_id + "&access_token=" + accessToken;
                  const uri = Config.serverUrl(path);
                  navigation.navigate(Config.ROUTE_WEB, {url: uri});
                }}><JbbText style={{color: colors.color777, fontSize: pxToDp(22)}}>查看位置</JbbText></TouchableOpacity>}

                {itm.driver_phone != '' && <TouchableOpacity style={styles.markerText3} onPress={() => {
                  let phoneNumber = '';
                  if (Platform.OS === 'android') {
                    phoneNumber = `tel:${itm.driver_phone}`;
                  } else {
                    phoneNumber = `telprompt:${itm.driver_phone}`;
                  }
                  Linking.openURL(phoneNumber).then(r => {
                  });
                }}><JbbText style={{color: colors.color777, fontSize: pxToDp(22)}}>呼叫骑手</JbbText></TouchableOpacity>}

                <JbbText style={itm.content_color == "red" ? styles.markerText6 : styles.markerText5}>
                  {itm.content}
                </JbbText>
              </View>
            })}
          </View>
        ))}
      </View>
      {(infos.btn_lists.add_tip == 1 || infos.btn_lists.can_cancel == 1 || infos.btn_lists.can_complaint == 1) &&
      <View style={[styles.cell_box1]}>
        <View style={styles.btn2}>
          {infos.btn_lists.add_tip == 1 &&
          <View style={{flex: 1}}><TouchableOpacity onPress={() => props.onAddTip()}><JbbText
            style={styles.btnText}>加小费</JbbText></TouchableOpacity></View>}
          {infos.btn_lists.can_complaint == 1 &&
          <View style={{flex: 1, marginHorizontal: pxToDp(10)}}><TouchableOpacity onPress={() => {
            if (tool.length(infos.ship_id) > 0) {
              props.onTousu(infos.ship_id)
            } else {
              showError("暂不支持")
            }
          }}><JbbText style={styles.btnText}>投诉</JbbText></TouchableOpacity></View>}
          {infos.btn_lists.can_cancel == 1 && <View style={{flex: 1}}><TouchableOpacity onPress={() => {
            props.clearModal()
            props.onConfirmCancel(infos.ship_id)
          }}><JbbText style={styles.btnText}>取消配送</JbbText></TouchableOpacity></View>}
        </View>
      </View>}
    </View>
  );
};

export default connect(mapDispatchToProps)(OrderListItem)


