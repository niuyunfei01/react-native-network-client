import React, {PureComponent} from "react";
import {
  Alert,
  InteractionManager, Modal, RefreshControl, ScrollView,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {Cell, CellBody, CellHeader, Cells} from "../../weui";
import {ToastLong} from "../../util/ToastUtils";
import Styles from "../../common/CommonStyles";
import {Colors} from "../../themes";
import { Button } from 'react-native-elements';
import {CheckBox} from 'react-native-elements';
import Entypo from "react-native-vector-icons/Entypo";

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class StoreClose extends PureComponent {
  constructor(props) {
    super(props);

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
      isRefreshing: false,
      applyForOfflineDialog: false,
      stopToBusinessDialog: false,
      offLineReason: '',
      refundReason: [],
      refundReasonStopBusiness: [],
      index: 0,
      showReasonText: false,
      checked: false,
      content: ''
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {
  }

  fetchData() {
    const self = this
    const access_token = this.props.route.params.access_token
    const store_id = this.props.route.params.store_id
    const api = `/api/get_store_business_status/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      self.setState({
        refundReason: res.reason_list['APPLY_FOR_OFFLINE'],
        refundReasonStopBusiness: res.reason_list['STOP_TO_BUSINESS'],
      })
    }).catch(() => {
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  closeStore() {
    let minutes = this.state.offLineReason
    const navigation = this.props.navigation
    const access_token = this.props.route.params.access_token
    const store_id = this.props.route.params.store_id

    if (typeof minutes === 'undefined') {
      return
    }
    const api = `/api/close_store/${store_id}/${minutes}?access_token=${access_token}`
    ToastLong('请求中...')
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.fetchData()
      ToastLong('操作成功')
      setTimeout(() => {
        navigation.goBack();
      }, 1000)
    }).catch(() => {
    })

  }

  applyForOffline () {
    const navigation = this.props.navigation
    const access_token = this.props.route.params.access_token
    const store_id = this.props.route.params.store_id
    let {content} = this.state
    ToastLong('请求中...')
    const api = `/api/close_store/${store_id}/APPLY_FOR_OFFLINE?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {
      reason: this.state.offLineReason,
      content: content
    }).then(res => {
      Alert.alert('提示', '运营已接收工单，请耐心等待', [{
        text: '知道了', onPress: () => {
          setTimeout(() => {
            navigation.goBack();
          }, 1000)
        }}])
      this.fetchData()
    }).catch(() => {
    })
  }

  render() {
    let {refundReason, refundReasonStopBusiness, showReasonText, timeOptions, content} = this.state
    const access_token = this.props.route.params.access_token
    const store_id = this.props.route.params.store_id
    const navigation = this.props.navigation
    return (<View>
          <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
          <ScrollView style={[styles.container, {position: "relative"}]}
                      refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={() => this.fetchData()}
                            tintColor='gray'
                        />
                      }
                      automaticallyAdjustContentInsets={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
          >
          <For index="index" each="element" of={timeOptions}>
            <Cells style={{
              marginRight: "2%",
              marginLeft: "2%",
              borderRadius: pxToDp(20),
              borderColor: colors.white
            }}>
              <Cell customStyle={{height: pxToDp(90), justifyContent: "center"}}
                    onPress={() => {
                      let menus = [...this.state.timeOptions]
                      menus.forEach(item => {
                        item.checked = false
                      })
                      menus[index].checked = true
                      this.setState({
                        menus: menus
                      })
                      if (element.value === 'STOP_TO_BUSINESS') {
                        this.setState({
                          stopToBusinessDialog: true,
                          offLineReason: element.value
                        })
                      } else if (element.value === 'APPLY_FOR_OFFLINE') {
                        this.setState({
                          applyForOfflineDialog: true,
                          offLineReason: element.value
                        })
                      } else {
                        this.setState({
                          offLineReason: element.value
                        })
                      }
                    }}
              >
                <CellHeader>
                  <CheckBox
                      checked={element.checked}
                      checkedColor={colors.main_color}
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      uncheckedColor='#979797'
                      size={18}
                      onPress={() => {
                        let menus = [...this.state.timeOptions]
                        menus.forEach(item => {
                          item.checked = false
                        })
                        menus[index].checked = true
                        this.setState({
                          menus: menus
                        })
                        if (element.value === 'STOP_TO_BUSINESS') {
                          this.setState({
                            stopToBusinessDialog: true,
                            offLineReason: element.value
                          })
                        } else if (element.value === 'APPLY_FOR_OFFLINE') {
                          this.setState({
                            applyForOfflineDialog: true,
                            offLineReason: element.value
                          })
                        } else {
                          this.setState({
                            offLineReason: element.value
                          })
                        }
                      }}
                  />
                </CellHeader>
                <CellBody>
                  <Text>{element.label}</Text>
                </CellBody>
              </Cell>
            </Cells>
          </For>

          <Modal
              visible={this.state.stopToBusinessDialog}
              transparent={true}
              onRequestClose={() => {this.setState({
                stopToBusinessDialog: false, showReasonText: false
              })}}
              animationType="fade"
          >
            <TouchableOpacity style={{flex: 1, backgroundColor: "rgba(0,0,0,0.25)"}} onPress={() => {this.setState({stopToBusinessDialog: false, showReasonText: false})}}></TouchableOpacity>
            <View style={{backgroundColor: "rgba(0,0,0,0.25)"}}>
              <View style={{backgroundColor: colors.white, width: '80%', marginHorizontal: '10%', padding: pxToDp(20), borderRadius: pxToDp(20)}}>
                <View style={{marginTop: pxToDp(5), marginLeft: pxToDp(5)}}>
                  <Text style={{color: '#333333', fontWeight: "bold", fontSize: pxToDp(32)}}>下线原因</Text>
                </View>
                <For index="index" each='element' of={refundReasonStopBusiness}>
                  <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          index: index,
                          offLineReason: element
                        });
                        if (element.indexOf('其他理由') !== -1) {
                          this.setState({
                            showReasonText: true
                          })
                        } else {
                          this.setState({
                            showReasonText: false
                          })
                        }
                      }}
                  >
                    <View
                        style={[
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 15
                          }
                        ]}
                    >
                      <TouchableOpacity style={{
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        backgroundColor: this.state.index === index ? colors.main_color : colors.white,
                        justifyContent: "center",
                        alignItems: 'center',
                      }} onPress={() => {
                        this.setState({
                          index: index,
                          offLineReason: element
                        });
                        if (element.indexOf('其他理由') !== -1) {
                          this.setState({
                            showReasonText: true
                          })
                        } else {
                          this.setState({
                            showReasonText: false
                          })
                        }
                      }}>
                        <Entypo name={this.state.index === index ? 'check' : 'circle'} style={{
                          fontSize: pxToDp(32),
                          color: this.state.index === index ? Colors.white : colors.main_color,
                        }}/>
                      </TouchableOpacity>
                      <Text style={[Styles.h203e, {marginLeft: 20}]}>
                        {element}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </For>
                <View style={{paddingHorizontal: pxToDp(31), marginTop: 15}}>
                  <If condition={showReasonText}>
                    <TextInput
                        style={[
                          {
                            height: 90,
                            borderWidth: 1,
                            borderColor: "#f2f2f2",
                            padding: 5,
                            textAlignVertical: "top"
                          },
                          Styles.n1grey9
                        ]}
                        placeholder="请输入内容..."
                        selectTextOnFocus={true}
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        placeholderTextColor={Colors.grey9}
                        multiline={true}
                        onChangeText={text => {
                          this.setState({
                            content: text
                          })
                        }}
                    /></If>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                  <Button title={'取消'}
                          onPress={() => {
                            this.setState({stopToBusinessDialog: false, showReasonText: false})
                          }}
                          buttonStyle={{
                            width: '98%',
                            backgroundColor: colors.white,
                            borderRadius: pxToDp(10)
                          }}

                          titleStyle={{
                            color: '#000000',
                            fontSize: 16
                          }}
                  />
                  <Button title={'保存'}
                          onPress={async () => {
                              await this.setState({stopToBusinessDialog: false}, () => {
                                const api = `/api/close_store/${store_id}/STOP_TO_BUSINESS?access_token=${access_token}`
                                Alert.alert('提示', '确定停止营业吗？停业后不会自动恢复营业', [{
                                  text: '确定', onPress: () => {
                                    ToastLong('请求中...')
                                    HttpUtils.get.bind(this.props)(api, {
                                      reason: this.state.offLineReason,
                                      content: content
                                    }).then(res => {
                                      ToastLong('操作成功，即将返回')
                                      this.fetchData()
                                      setTimeout(() => {
                                        navigation.goBack();
                                      }, 1000)
                                    }).catch(() => {
                                    })
                                  }
                                }, {text: '取消'}])
                          })}}
                          buttonStyle={{
                            width: '98%',
                            backgroundColor: colors.white,
                            borderRadius: pxToDp(10)
                          }}

                          titleStyle={{
                            color: '#000000',
                            fontSize: 16
                          }}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity style={{flex: 1, backgroundColor: "rgba(0,0,0,0.25)"}} onPress={() => {this.setState({stopToBusinessDialog: false, showReasonText: false})}}></TouchableOpacity>
          </Modal>

          <Modal
              visible={this.state.applyForOfflineDialog}
              transparent={true}
              onRequestClose={() => {this.setState({
                applyForOfflineDialog: false, showReasonText: false
              })}}
              animationType="fade"
          >
            <TouchableOpacity style={{flex: 1, backgroundColor: "rgba(0,0,0,0.25)"}} onPress={() => {this.setState({applyForOfflineDialog: false, showReasonText: false})}}></TouchableOpacity>
            <View style={{backgroundColor: "rgba(0,0,0,0.25)"}}>
              <View style={{backgroundColor: colors.white, width: '80%', marginHorizontal: '10%', padding: pxToDp(20), borderRadius: pxToDp(20)}}>
                <View style={{marginTop: pxToDp(5), marginLeft: pxToDp(5)}}>
                  <Text style={{color: '#333333', fontWeight: "bold", fontSize: pxToDp(32)}}>下线原因</Text>
                </View>
                <For index="index" each='element' of={refundReason}>
                  <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          index: index,
                          offLineReason: element
                        });
                        if (element.indexOf('其他理由') !== -1) {
                          this.setState({
                            showReasonText: true
                          })
                        } else {
                          this.setState({
                            showReasonText: false
                          })
                        }
                      }}
                  >
                    <View
                        style={[
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 15
                          }
                        ]}
                    >
                      <TouchableOpacity style={{
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        backgroundColor: this.state.index === index ? colors.main_color : colors.white,
                        justifyContent: "center",
                        alignItems: 'center',
                      }} onPress={() => {
                        this.setState({
                          index: index,
                          offLineReason: element
                        });
                        if (element.indexOf('其他理由') !== -1) {
                          this.setState({
                            showReasonText: true
                          })
                        } else {
                          this.setState({
                            showReasonText: false
                          })
                        }
                      }}>
                        <Entypo name={this.state.index === index ? 'check' : 'circle'} style={{
                          fontSize: pxToDp(32),
                          color: this.state.index === index ? Colors.white : colors.main_color,
                        }}/>
                      </TouchableOpacity>
                      <Text style={[Styles.h203e, {marginLeft: 20}]}>
                        {element}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </For>
                <View style={{paddingHorizontal: pxToDp(31), marginTop: 15}}>
                  <If condition={showReasonText}>
                    <TextInput
                        style={[
                          {
                            height: 90,
                            borderWidth: 1,
                            borderColor: "#f2f2f2",
                            padding: 5,
                            textAlignVertical: "top"
                          },
                          Styles.n1grey9
                        ]}
                        placeholder="请输入内容..."
                        selectTextOnFocus={true}
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        placeholderTextColor={Colors.grey9}
                        multiline={true}
                        onChangeText={text => {
                          this.setState({
                            content: text
                          })
                        }}
                    /></If>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                  <Button title={'取消'}
                          onPress={() => {
                            this.setState({applyForOfflineDialog: false, showReasonText: false})
                          }}
                          buttonStyle={{
                            width: '98%',
                            backgroundColor: colors.white,
                            borderRadius: pxToDp(10)
                          }}

                          titleStyle={{
                            color: '#000000',
                            fontSize: 16
                          }}
                  />
                  <Button title={'保存'}
                          onPress={async () => {
                            await this.setState({applyForOfflineDialog: false}, () => this.applyForOffline())}}
                          buttonStyle={{
                            width: '98%',
                            backgroundColor: colors.white,
                            borderRadius: pxToDp(10)
                          }}

                          titleStyle={{
                            color: '#000000',
                            fontSize: 16
                          }}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity style={{flex: 1, backgroundColor: "rgba(0,0,0,0.25)"}} onPress={() => {this.setState({applyForOfflineDialog: false, showReasonText: false})}}></TouchableOpacity>
          </Modal>

          </ScrollView>
          <View style={{position: "absolute", bottom: 0, left: 0, width: '100%', padding: pxToDp(10), backgroundColor: colors.white, shadowOffset: {width: -4, height: -4}, shadowOpacity: 0.75, shadowRadius: 4}}>
            <Button title={'确定'}
                    onPress={() => {
                      this.closeStore()
                    }}
                    buttonStyle={{
                      width: '98%',
                      backgroundColor: colors.main_color,
                      borderRadius: pxToDp(10)
                    }}

                    titleStyle={{
                      color: colors.white,
                      fontSize: 16
                    }}
            />
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  cells: {
    marginBottom: pxToDp(10),
    marginTop: 0,
    paddingLeft: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  right_btn: {
    color: colors.main_color,
    fontSize: pxToDp(25),
    paddingTop: pxToDp(7),
    marginLeft: pxToDp(10),
  },
  container: {
    backgroundColor: colors.f7
  },
  cell_input: {
    fontSize: pxToDp(30),
    height: pxToDp(70),
    borderWidth: pxToDp(1),
    width: pxToDp(120),
    paddingTop: pxToDp(13),
    marginLeft: pxToDp(10),
    marginRight: pxToDp(10),
  }
})

export default StoreClose;
