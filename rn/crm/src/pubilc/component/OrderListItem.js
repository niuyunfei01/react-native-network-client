import React from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import Config from "../common/config";
import {bindActionCreators} from "redux";
import Tips from "../../scene/common/component/Tips";
import {
  Alert,
  Clipboard,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {connect} from "react-redux";
import {
  addTipMoney,
  addTipMoneyNew,
  cancelReasonsList,
  cancelShip,
  orderCallShip
} from "../../reducers/order/orderActions";

import {hideModal, showModal, showSuccess, ToastLong, ToastShort} from "../util/ToastUtils";
import pxToDp from "../util/pxToDp";
import HttpUtils from "../util/http";
import native from "../../pubilc/util/native";
import tool from "../util/tool";
import colors from "../styles/colors";
import GlobalUtil from "../util/GlobalUtil";
import LinearGradient from 'react-native-linear-gradient'
import Entypo from "react-native-vector-icons/Entypo"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import {Button, Image} from "react-native-elements";
import BottomModal from "./BottomModal";
import JbbModal from "./JbbModal";


let width = Dimensions.get("window").width;

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
    orderStatus: PropType.number,
    order: PropType.object,
    onItemClick: PropTypes.func,
    setState: PropType.func
  };
  state = {
    modalTip: false,
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
    ok: true,
    is_merchant_add_tip: 0
  }

  constructor(props) {
    super(props);
  }

  fetchShipData = (item) => {
    tool.debounces(() => {
      //保存参数 作为Tips的传参
      this.state.order_id = item.id;
      this.state.store_id = item.store_id;
      showModal('加载中...')
      const api = `/v1/new_api/orders/third_deliverie_record/${this.props.item.id}?access_token=${this.props.accessToken}`;
      HttpUtils.get.bind(this.props)(api).then(res => {
        hideModal()
        if (tool.length(res.delivery_lists)) {
          this.setState({
            showDeliveryModal: true,
            delivery_list: res.delivery_lists,
            if_reship: res.delivery_btns.if_reship,
            delivery_btn: res.delivery_btns,
            is_merchant_add_tip: res.is_merchant_add_tip
          });
        } else {
          ToastShort('暂无数据')
        }
      }).catch((obj) => {
        ToastShort(`操作失败：${obj.reason}`)
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

  onTransferSelf = () => {
    const api = `/api/order_transfer_self?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.props.fetchData();
    }).catch(e => {
      ToastLong('操作失败:' + e.desc);
    })
  }

  onChangeAcount = (text) => {
    this.setState({addMoneyNum: text})
  }

  onStopSchedulingTo = () => {
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

  onStopScheduling = () => {
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


  upAddTip = () => {
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


  onOverlookDelivery = (order_id) => {
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
        ToastShort('操作失败' + e.desc)
      })
    }, 600)
  }

  cancelPlanDelivery = (order_id, planId) => {
    tool.debounces(() => {
      let api = `/v1/new_api/orders/cancel_delivery_plan/${order_id}/${planId}`;
      HttpUtils.get(api).then(success => {
        ToastShort(`取消预约成功`)
        this.fetchData()
      }).catch((reason) => {
        ToastShort(`${reason.reason}`)
      })
    }, 600)
  }

  onCallThirdShips = (order_id, store_id, if_reship) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
      selectedWay: [],
      if_reship: if_reship,
      onBack: (res) => {
        if (res && res.count >= 0) {
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

  goVeriFicationToShop = (id) => {
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(success => {
      ToastShort(`核销成功，订单已完成`)
    }).catch((reason) => {
      ToastShort(`操作失败：${reason.reason}`)
    })
  }

  onAinSend = (order_id, store_id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_AIN_SEND, {
      orderId: order_id,
      storeId: store_id,
      onBack: (res) => {
        if (res) {
          this.props.fetchData()
          GlobalUtil.setOrderFresh(1)
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
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

  renderItemHeader = () => {
    let {item} = this.props;
    return (
      <View style={{flexDirection: 'column'}}>
        <If condition={item.is_right_once}>
          <View style={{
            width: 0,
            height: 0,
            borderTopWidth: 42,
            borderTopColor: "#f98754",
            borderRightWidth: 40,
            borderRightColor: 'transparent',
          }}>
          </View>
          <Text style={{
            color: colors.white,
            position: 'absolute',
            top: 1,
            left: 1,
            fontSize: 18
          }}>预 </Text>
        </If>
        <If condition={item.pickType === "1"}>
          <View style={{
            backgroundColor: "#3CABFF",
            borderBottomRightRadius: 8,
            width: 66,
            height: 19,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: colors.white,
              fontSize: 14,
            }}>到店自提 </Text>
          </View>
        </If>

        <View style={{
          position: 'absolute',
          top: item.pickType !== "1" ? 10 : 24,
          left: 26,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Image source={{uri: item.platformIcon}}
                 style={{width: 36, height: 36, borderRadius: 18}}/>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.color333, marginLeft: 10}}># </Text>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: colors.color333}}>{item.platform_dayId} </Text>
            <Text
              style={{fontSize: 14, fontWeight: 'bold', color: colors.color333, marginLeft: 10}}>总#{item.dayId} </Text>
            <If condition={Number(item.orderStatus) === 5}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: "#F21F1F",
                marginLeft: width * 0.17
              }}>订单已取消 </Text>
            </If>
          </View>
        </View>

        <If condition={item.pickType !== "1"}>
          <View style={{flexDirection: 'row', marginTop: item.is_right_once ? 10 : 50, marginLeft: 26}}>
            <Text style={{fontWeight: "bold", fontSize: 14, color: colors.color333}}> 预定 </Text>
            <Text style={{fontWeight: "bold", fontSize: 14, color: "#FF8854"}}> {item.humanExpectTime} </Text>
            <Text style={{fontWeight: "bold", fontSize: 14, color: colors.color333}}> 前送达 </Text>
          </View>
        </If>

      </View>
    )
  }


  renderUser = () => {
    let {item} = this.props;
    return (
      <View style={{
        paddingVertical: 10,
        marginHorizontal: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: colors.colorEEE
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{width: width * 0.65,}}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.color333,
              marginTop: 2,
              marginBottom: 13
            }}> {item.userName}-{item.mobileReadable} </Text>
            <View style={{
              width: width * 0.18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.main_color,
              borderRadius: 2,
              height: 16,
            }}>
              <Text onPress={() => this.onClickTimes(item)}
                    style={{color: colors.white, fontSize: 10}}>
                {item.order_times <= 1 ? '新客户' : `第${item.order_times}次`} </Text>
            </View>
          </View>
          <FontAwesome5 onPress={() => {
            native.dialNumber(item.mobile)
          }} name={"phone-alt"}
                        style={{width: width * 0.14, fontSize: 25, color: colors.main_color}}/>
          <Entypo onPress={() => {
            let path = '/AmapTrack.html?orderId=' + item.id + "&access_token=" + this.props.accessToken;
            this.props.navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path)});
          }} name={"location-pin"}
                  style={{fontSize: 35, color: colors.main_color}}/>
        </View>
        <Text style={{fontSize: 14, color: colors.color666, marginTop: 10}}>
          {item.address}
        </Text>
      </View>
    )
  }

  renderOrderInfo = () => {
    let {item} = this.props;
    return (
      <View style={{
        paddingVertical: 10,
        marginHorizontal: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: colors.colorEEE
      }}>
        <If condition={item.show_store_name}>
          <View style={{flexDirection: "row", marginTop: 4}}>
            <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>店铺名称 </Text>
            <Text style={{fontSize: 14, color: colors.color333}}>{item.show_store_name}</Text>
          </View>
        </If>

        <If condition={item.orderTimeInList}>
          <View style={{flexDirection: "row", marginTop: 14}}>
            <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>下单时间 </Text>
            <Text style={{fontSize: 14, color: colors.color333}}>{item.orderTimeInList}</Text>
          </View>
        </If>

        {/*<View style={{flexDirection: 'row', marginTop: 14}}>*/}
        {/*  <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>订单号 </Text>*/}
        {/*  <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>{item.id} </Text>*/}
        {/*  <Text onPress={() => {*/}
        {/*    Clipboard.setString(item.id)*/}
        {/*    ToastLong('已复制到剪切板')*/}
        {/*  }} style={{*/}
        {/*    fontSize: 14,*/}
        {/*    color: colors.main_color,*/}
        {/*    marginRight: 14,*/}
        {/*  }}>复制</Text>*/}
        {/*</View>*/}

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 14}}>
          <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>平台单号 </Text>
          <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>{item.platform_oid} </Text>
          <Text onPress={() => {
            Clipboard.setString(item.id)
            ToastLong('已复制到剪切板')
          }} style={{
            fontSize: 14,
            color: colors.main_color,
            marginRight: 14,
          }}>复制 </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 14}}>
          <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>{item.moneyLabel} </Text>
          <Text style={{fontSize: 14, color: colors.color333, flex: 1, fontWeight: 'bold'}}>¥{item.moneyInList} </Text>
          <Text style={{
            fontSize: 14,
            color: colors.main_color,
          }}>详情 </Text>
          <Entypo name='chevron-thin-right' style={{
            fontSize: 14,
            color: colors.main_color,
          }}/>
        </View>

      </View>
    )
  }

  renderDeliveryInfo = () => {
    let {item} = this.props;
    return (
      <TouchableOpacity onPress={() => {
        this.fetchShipData(item)
      }} style={{
        paddingVertical: 10,
        marginHorizontal: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: colors.colorEEE
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
          <Text style={{fontSize: 14, color: colors.color333, flex: 1, fontWeight: 'bold'}}>配送状态 </Text>
          <Text style={{
            fontSize: 14,
            color: colors.main_color,
          }}>查看配送详情 </Text>
          <Entypo name='chevron-thin-right' style={{
            fontSize: 14,
            color: colors.main_color,
          }}/>
        </View>
        <Text style={{fontSize: 14, color: colors.color666, marginTop: 10}}>
          {item.shipStatusText}
        </Text>
      </TouchableOpacity>
    )
  }

  renderButton = () => {
    let {item} = this.props;
    return (
      <View style={{
        paddingVertical: 10,
        marginHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>

        <If condition={Number(item.orderStatus) === 1 && this.props.showBtn}>
          <Button title={'忽略配送'}
                  onPress={() => {
                    Alert.alert('提醒', "忽略配送会造成平台配送信息回传不达标，建议我自己送", [{text: '取消'}, {
                      text: '继续忽略配送',
                      onPress: () => {
                        this.onOverlookDelivery(item.id)
                      }
                    }])
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.white,
                    borderColor: colors.colorCCC,
                    borderWidth: 1
                  }}
                  titleStyle={{
                    color: colors.colorCCC,
                    fontSize: 16
                  }}
          />
          <Button title={'我自己送'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                    this.onAinSend(item.id, item.store_id)
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.white,
                    borderColor: colors.main_color,
                    borderWidth: 1
                  }}
                  titleStyle={{
                    color: colors.main_color,
                    fontSize: 16
                  }}
          />
          <Button title={'呼叫配送'}
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </If>
        <If condition={item.pickType === "1" && item.orderStatus < 4}>
          <View style={{flex: 1}}></View>
          <Button title={'到店核销'}
                  onPress={() => {
                    this.setState({
                      veriFicationToShop: true
                    })
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                    marginRight: 10
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </If>
      </View>
    )
  }

  renderItem = () => {
    let {item, onPress} = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => {
        onPress(Config.ROUTE_ORDER, {orderId: item.id})
      }}>
        <View style={{
          flexDirection: "column",
          backgroundColor: colors.white,
          marginTop: 10,
          marginHorizontal: 12,
          borderRadius: 6,
        }}>
          <LinearGradient style={{
            borderTopRightRadius: 6,
            borderTopLeftRadius: 6,
            width: "100%",
            height: 74,
          }}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          colors={item.pickType === "1" ? ['#F7FFFE', '#D0EDFF'] : ['#FFFAF7', '#FFE4D0']}>
            {this.renderItemHeader()}
          </LinearGradient>
          {this.renderUser()}
          {this.renderOrderInfo()}
          {this.renderDeliveryInfo()}
          {this.renderButton()}
          <If condition={this.props.orderStatus === 10}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  modalTip: true,
                  addTipModal: false
                })
                this.state.store_id = item.store_id;
                this.state.order_id = item.id;
              }} style={{
              paddingVertical: 10,
              marginHorizontal: 12,
              paddingHorizontal: 4,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Entypo name='help-with-circle' style={{
                fontSize: 20,
                color: colors.main_color,
              }}/>
              <Text style={{
                marginLeft: 10,
                color: colors.color333,
                lineHeight: pxToDp(40)
              }}>长时间没有骑手接单怎么办？</Text>
            </TouchableOpacity>
          </If>
        </View>

      </TouchableWithoutFeedback>
    )
  }

  renderPickModal = () => {
    let {item,} = this.props;
    return (
      <BottomModal
        visible={this.state.veriFicationToShop}
        modal_type={'center'}
        onPress={async () => {
          await this.setState({veriFicationToShop: false});
          this.goVeriFicationToShop(item.id)
        }}
        title={'到店核销'}
        actionText={'确定'}
        closeText={'取消'}
        onClose={() => {
          this.setState({
            veriFicationToShop: false,
          })
        }}>
        <TextInput placeholder={"请输入取货码"}
                   onChangeText={(pickupCode) => {
                     this.setState({pickupCode})
                   }}
                   value={this.state.pickupCode}
                   placeholderTextColor={'#ccc'}
                   style={{
                     color: colors.color333,
                     borderBottomWidth: pxToDp(1),
                     borderBottomColor: '#999',
                     fontSize: 16,
                     height: pxToDp(90),
                     borderWidth: pxToDp(1),
                     borderRadius: pxToDp(10),
                     marginVertical: 20,
                   }}
                   underlineColorAndroid="transparent"/>
      </BottomModal>
    )
  }

  renderDeliveryModal = () => {
    let {navigation} = this.props;
    let {order_id, store_id, delivery_btn, is_merchant_add_tip} = this.state
    let height = tool.length(this.state.delivery_list) >= 3 ? pxToDp(800) : tool.length(this.state.delivery_list) * 250;
    if (tool.length(this.state.delivery_list) < 2) {
      height = 400;
    }
    return (
      <View>
        <JbbModal
          visible={this.state.addTipModal} modal_type={'center'} onClose={() => {

          this.setState({
            addTipModal: false
          })
        }}>
          <View>
            <Text style={{fontWeight: "bold", fontSize: pxToDp(32)}}>加小费</Text>
            <Text style={{
              fontSize: pxToDp(26),
              color: colors.color333,
              marginVertical: pxToDp(15)
            }}>多次添加以累计金额为主，最低一元</Text>
            <If condition={is_merchant_add_tip === 1}>
              <Text style={{
                fontSize: pxToDp(22),
                color: '#F32B2B',
                marginVertical: pxToDp(10)
              }}>小费金额商家和外送帮各承担一半，在订单结算时扣除小费</Text>
            </If>
            <View style={[styles.container1]}>
              <Text style={{fontSize: pxToDp(26)}}>金额</Text>
              <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)}}>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(1)
                }}>1元</Text>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(2)
                }}>2元</Text>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(3)
                }}>3元</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)}}>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(4)
                }}>4元</Text>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(5)
                }}>5元</Text>
                <Text style={styles.amountBtn} onPress={() => {
                  this.onChangeAcount(10)
                }}>10元</Text>
              </View>
              <View style={{alignItems: "center", marginTop: pxToDp(30)}}>
                <TextInput
                  style={{
                    fontSize: pxToDp(24),
                    borderWidth: pxToDp(1),
                    paddingLeft: pxToDp(15),
                    width: "100%",
                    height: "40%"
                  }}
                  placeholder={'请输入其他金额'}
                  value={this.state.addMoneyNum}
                  keyboardType='numeric'
                  onChangeText={(value) =>
                    this.onChangeAcount(value)
                  }
                />
                <Text style={{
                  fontSize: pxToDp(26),
                  position: "absolute",
                  top: "25%",
                  right: "5%"
                }}>元</Text>
              </View>
              {
                (!this.state.ok || this.state.addMoneyNum === 0) &&
                <View
                  style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                  <Entypo name={"help-with-circle"}
                          style={{
                            fontSize: pxToDp(35),
                            color: colors.warn_red,
                            marginHorizontal: pxToDp(10)
                          }}></Entypo>
                  <Text style={{
                    color: colors.warn_red,
                    fontWeight: "bold"
                  }}>{this.state.respReason} </Text>
                </View>
              }
            </View>
            <View style={styles.btn1}>
              <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                        onPress={() => {
                                                          this.setState({
                                                            addTipModal: false
                                                          })
                                                        }}><Text
                style={styles.btnText2}>取消</Text></TouchableOpacity></View>
              <View style={{flex: 1}}><TouchableOpacity style={{marginHorizontal: pxToDp(10)}}
                                                        onPress={() => {
                                                          this.upAddTip()
                                                        }}><Text
                style={styles.btnText}>确定</Text></TouchableOpacity></View>
            </View>
          </View>
        </JbbModal>
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
                        let arr = [...this.state.delivery_list]
                        arr[i].default_show = !arr[i].default_show
                        this.props.setState({
                          delivery_list: arr
                        })
                      }} style={{flexDirection: 'row'}}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: info.desc_color ? info.desc_color : 'black'
                        }}>{info.desc} -</Text>
                        <Text style={{
                          color: info.content_color,
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>{info.status_content}{info.plan_id === 0 ? ` - ${info.fee} 元` : ''} </Text>
                        <View style={{flex: 1}}></View>
                        {!info.default_show ? <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> :
                          <Entypo name='chevron-thin-up' style={{fontSize: 14}}/>}
                      </TouchableOpacity>
                      <View
                        style={{marginVertical: 12, flexDirection: 'row'}}>
                        <Text style={{
                          fontSize: 12,
                          color: colors.color333
                        }}> 商品重量-{info.weight}kg </Text>
                        <If condition={info.fee_tip > 0}><Text style={{
                          fontSize: 12,
                          color: colors.color333
                        }}> 小费：{info.fee_tip}元 </Text></If>
                      </View>

                      <View
                        style={{fontSize: 12, marginTop: 12, marginBottom: 12, flexDirection: 'row'}}>
                        <Text style={{width: pxToDp(450)}}>{info.content} {info.driver_phone} {info.ext_num}  </Text>

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
                        {info.btn_lists.can_cancel_plan === 1 ? <Button title={'取消预约'}
                                                                        onPress={() => {
                                                                          this.setState({showDeliveryModal: false})
                                                                          Alert.alert('提醒', "确定取消预约发单吗", [{text: '取消'}, {
                                                                            text: '确定',
                                                                            onPress: () => {
                                                                              this.cancelPlanDelivery(order_id, info.plan_id)
                                                                            }
                                                                          }])
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
                                    this.setState({
                                      addTipModal: true,
                                      modalTip: false,
                                      showDeliveryModal: false,
                                      shipId: info.ship_id
                                    })
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
                        {info.btn_lists.can_call === 1 ? <Button title={'联系骑手'}
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
                                                               this.onAinSend(order_id, store_id)
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


  renderDeliveryStatus = (list) => {
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View key={i} style={{
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
                }}>{log.lists[0].desc} {log.lists[0].ext_num} </Text>
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
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
});


export default connect(mapDispatchToProps)(OrderListItem)


