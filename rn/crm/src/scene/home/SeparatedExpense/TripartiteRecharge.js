import React, {PureComponent} from 'react'
import ReactNative, {ImageBackground, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import {hideModal, showError, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo"
import {Button, Image} from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import LinearGradient from "react-native-linear-gradient";
import JbbModal from "../../../pubilc/component/JbbModal";
import {InputItem} from "@ant-design/react-native";
import {SvgXml} from "react-native-svg";
import {empty_data} from "../../../svg/svg";

const {StyleSheet} = ReactNative

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

class SeparatedExpense extends PureComponent {
  constructor(props: Object) {
    super(props);
    this.state = {
      isRefreshing: false,
      freeze_show: false,
      freeze_msg: "",
      prompt_msg: '外送帮仅支持充值，如需查看充值记录和账单明细，请登录配送商家版查看',
      thirdAccountList: [],
      pay_url: '',
      dadaAccountModal: false,
      dadaAccountNum: 0
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchThirdDeliveryList()
  }

  onPress(route, params = {}, callback = {}) {
    this.props.navigation.navigate(route, params, callback);
  }

  onRefresh = () => {
    this.fetchThirdDeliveryList()
  }


  // 获取三方配送充值列表
  fetchThirdDeliveryList = () => {
    const {global} = this.props;
    this.setState({
      isRefreshing: true
    })
    const url = `/v1/new_api/delivery/delivery_account_balance/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        thirdAccountList: res,
        isRefreshing: false
      })
    })
  }

  // 顺丰去充值
  toPay = (row) => {
    if (row.type == 2) {
      this.setState({
        dadaAccountModal: true,
        type_dada: row.type
      })
    } else {
      showModal('请求中')
      const {global} = this.props;
      const url = `/v1/new_api/delivery/delivery_pay_url?access_token=${global.accessToken}`;
      HttpUtils.post.bind(this.props)(url, {
        store_id: global.currStoreId,
        delivery_type_v1: row.type,
        amount: 0
      }).then(res => {
        hideModal()
        if (res.msg && res.msg !== '') {
          showError(`${res.msg}`)
        } else {
          this.setState({
            pay_url: res.pay_url,
          }, () => {
            this.onPress(Config.ROUTE_WEB, {url: this.state.pay_url})
          })
        }
      })
    }
  }

  // 达达去充值
  fetchDeliveryPayUrl = () => {
    showModal('请求中')
    let {type_dada, dadaAccountNum} = this.state
    const {global} = this.props;
    const url = `/v1/new_api/delivery/delivery_pay_url?access_token=${global.accessToken}`;
    HttpUtils.post.bind(this.props)(url, {
      store_id: global.currStoreId,
      delivery_type_v1: type_dada,
      amount: dadaAccountNum
    }).then(res => {
      hideModal()
      if (res.msg && res.msg !== '') {
        showError(`${res.msg}`)
      } else {
        this.setState({
          pay_url: res.pay_url,
        }, () => {
          ToastLong('即将前往充值...')
          setTimeout(() => {
            this.onPress(Config.ROUTE_WEB, {url: this.state.pay_url})
          }, 100)
        })
      }
    })
  }

  // 去授权
  toAuthorization = () => {
    this.onPress(Config.ROUTE_DELIVERY_LIST, {tab: 2})
  }

  closeAccountModal = () => {
    this.setState({
      dadaAccountModal: false,
      dadaAccountNum: 0
    })
  }

  render() {
    const {isRefreshing} = this.state;
    return (
      <View style={Styles.containerContent}>
        <ScrollView style={Styles.containerContent} refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => this.onRefresh()}
                          tintColor='gray'/>
        }>

          {this.renderTHIRDContainer()}
          {this.renderAccountModal()}

        </ScrollView>
      </View>
    )
  }

  renderTHIRDContainer = () => {
    const {thirdAccountList, prompt_msg, isRefreshing} = this.state
    if (isRefreshing) {
      return <View/>;
    }
    return (
      <View>
        <View style={Styles.THIRDHeader}>
          <FontAwesome5 name={'exclamation-circle'} style={Styles.THORDHeaderIcon} size={18}/>
          <Text style={Styles.THIRDHeaderText}>{prompt_msg} </Text>
        </View>
        {thirdAccountList.length > 0 ? this.renderTHIRDContentItem() : this.renderNOTHIRDList()}
      </View>
    )
  }

  renderTHIRDContentItem = () => {
    const {thirdAccountList} = this.state
    return (
      <View style={Styles.THIRDContainerList}>
        <For index='i' each='info' of={thirdAccountList}>
          <LinearGradient style={Styles.THIRDContainerItemLinear}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          colors={info.background_color}>
            <View style={Styles.THIRDContainerItemBody}>
              <View style={Styles.THIRDContainerItemBody}>
                <Image source={{uri: info.img}}
                       style={Styles.THIRDContainerItemIcon}/>
                <Text style={Styles.THIRDContainerItemName}>{info.name} </Text>
              </View>
              <Button buttonStyle={Styles.THIRDContainerBtn}
                      titleStyle={{color: info.btn_title_color, fontSize: pxToDp(25), fontWeight: "bold"}}
                      title={'立即充值'}
                      onPress={() => {
                        this.toPay(info)
                      }}/>
            </View>
            <View style={Styles.THIRDContainerItemBody}>
              <Text style={Styles.currentBanlance}>当前余额： ￥ {info.current_balance} </Text>
              <ImageBackground source={{uri: info.background_img}} style={Styles.THIRDContainerItemIconBg}/>
            </View>
          </LinearGradient>
        </For>
      </View>
    )
  }


  renderNOTHIRDList = () => {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
      }}>
        <SvgXml xml={empty_data()}/>
        <Text style={Styles.noOrderDesc}> 您当前还未绑定自有账号, </Text>
        <Text style={Styles.noOrderDesc}> 点击下方按钮进行绑定, </Text>
        <Text style={Styles.noOrderDesc}> 运力更多接起更快 </Text>
        <Button title={'去绑定'}
                onPress={this.toAuthorization}
                buttonStyle={{
                  width: 180,
                  borderRadius: 20,
                  backgroundColor: colors.main_color,
                  paddingVertical: 10,
                  marginTop: 20
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }


  renderAccountModal = () => {
    let {dadaAccountModal, dadaAccountNum} = this.state;
    return (
      <JbbModal visible={dadaAccountModal} onClose={() => this.closeAccountModal()} modal_type={'center'}>
        <View style={{padding: pxToDp(20)}}>
          <TouchableOpacity onPress={() => this.closeAccountModal()} style={Styles.flexRowStyle}>
            <Text style={Styles.modalTitle}>充值金额</Text>
            <Entypo name="circle-with-cross" style={Styles.closeIcon}/>
          </TouchableOpacity>
          <InputItem clear error={dadaAccountNum <= 0} type="number" value={dadaAccountNum}
                     onChange={dadaAccountNum => {
                       this.setState({dadaAccountNum});
                     }}
                     extra="元"
                     placeholder="帐户充值金额">
          </InputItem>
          <View style={Styles.modalBtnStyle}>
            <Button buttonStyle={Styles.modalBtnText}
                    titleStyle={{fontSize: pxToDp(30), color: 'white'}}
                    title={'取消'}
                    onPress={() => {
                      this.closeAccountModal()
                    }}/>
            <Button buttonStyle={Styles.modalBtnText1}
                    titleStyle={{fontSize: pxToDp(30), color: 'white'}}
                    title={'确定'}
                    onPress={() => {
                      this.closeAccountModal()
                      this.fetchDeliveryPayUrl()
                    }}/>
          </View>
        </View>
      </JbbModal>
    )
  }

}

const Styles = StyleSheet.create({
  noOrderDesc: {flex: 1, fontSize: 15, color: colors.color999, lineHeight: 21},
  flexRowStyle: {flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', marginBottom: 20},
  modalTitle: {fontWeight: 'bold', fontSize: pxToDp(30), color: colors.color333},
  flex1: {flex: 1},
  flex3: {flex: 3},
  fontBold: {fontWeight: "bold"},
  color333: {color: colors.color333},
  containerContent: {flex: 1, backgroundColor: '#f5f5f9'},
  containerHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#EEDEE0',
    height: 40
  },
  containerHeaderText: {
    color: colors.color666,
    fontSize: 12,
    paddingLeft: 13,
    flex: 1
  },
  containerHeaderBtn: {
    backgroundColor: colors.red,
    borderRadius: 6,
    marginRight: 13,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  containerHeaderBtnText: {
    fontSize: 12,
    color: colors.white,
  },
  expensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    backgroundColor: colors.white,
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(30),
    zIndex: 999,
  },
  selectMonthLabel: {flex: 1, color: colors.color333, fontWeight: "bold"},
  selectMonthText: {
    color: colors.title_color,
    fontSize: 16,
    fontWeight: 'bold'
  },
  selectMonthIcon: {fontSize: 14, marginLeft: 10},
  recordsContent: {
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(30),
    flex: 1,
    alignItems: "center",
    flexDirection: 'column',
    backgroundColor: 'white',
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
  },
  recordsBody: {alignItems: "center", flexDirection: 'row'},
  recordsItemTime: {fontSize: 16, color: colors.color333, fontWeight: 'bold'},
  recordsItemBalanced: {
    fontSize: 16,
    fontWeight: 'bold',
    width: "30%",
    textAlign: 'right',
  },
  recordsItemIcon: {fontSize: 14, marginLeft: 10},
  recordsItemDesc: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10},
  recordsItemDescTextLeft: {fontSize: 14, color: colors.color999, flex: 1},
  recordsItemDescTextRight: {fontSize: 14, color: colors.color999},
  recordsContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
    paddingTop: pxToDp(20),
    paddingBottom: pxToDp(20),
    paddingLeft: pxToDp(40),
    backgroundColor: colors.white
  },
  recordsCreated2: {color: '#999', marginTop: pxToDp(8)},
  recordsFee2: {
    textAlign: 'right',
    marginRight: pxToDp(40),
    fontWeight: 'bold',
  },
  WSBHeader: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#28A077',
    margin: pxToDp(20),
    paddingVertical: pxToDp(50),
    borderRadius: pxToDp(8)
  },
  WSBHeaderTitle: {
    width: '100%',
    marginLeft: pxToDp(100),
    textAlign: 'left',
    color: 'white'
  },
  WSBHeaderBalanceNum: {
    marginVertical: pxToDp(30),
    fontSize: pxToDp(120),
    fontWeight: "bold",
    textAlign: 'center',
    color: 'white'
  },
  WSBCZBtn: {
    backgroundColor: 'white',
    width: 140,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: "center",
  },
  WSBCZText: {
    color: colors.main_color,
    textAlign: 'center',
    paddingVertical: pxToDp(10),
  },
  WSBSZBtn: {
    justifyContent: 'center',
    alignItems: "center",
    marginTop: pxToDp(10),
  },
  WSBSZText: {
    color: '#f7f7f7',
    textAlign: 'center',
    paddingVertical: pxToDp(10),
    textDecorationLine: 'underline',
  },
  WSBType: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 40,
    marginBottom: 5,
  },
  WSBTypeBtn: {width: '50%', alignItems: "center"},
  headerType: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 40,
  },
  switchTypeLeft: {
    borderColor: colors.main_color,
    borderBottomWidth: 3,
    height: 40,
    justifyContent: 'center'
  },
  switchTypeRight: {
    borderColor: colors.main_color,
    borderBottomWidth: 0,
    height: 40,
    justifyContent: 'center'
  },
  THIRDHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: '#E7E7E7',
    width: '96%',
    marginLeft: '2%',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(10),
    color: '#333333',
    padding: pxToDp(10),
    flexGrow: 1
  },
  THORDHeaderIcon: {
    color: '#F12626',
    marginLeft: pxToDp(5)
  },
  THIRDHeaderText: {
    color: colors.color333,
    fontSize: pxToDp(18)
  },
  THIRDContainerList: {
    display: "flex",
    flexDirection: "column"
  },
  THIRDContainerNOList: {
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  THIRDContainerItemBody: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: '1%',
    paddingRight: '5%'
  },
  THIRDContainerItemLinear: {
    width: "96%",
    height: 142,
    marginLeft: '2%',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(10),
    padding: pxToDp(40)
  },
  THIRDContainerItemName: {
    fontSize: pxToDp(40),
    fontWeight: "bold",
    color: '#ffffff'
  },
  THIRDContainerItemIcon: {width: 53, height: 53, borderRadius: 26, marginRight: pxToDp(20)},
  THIRDContainerItemIconBg: {width: 97, height: 59},
  THIRDContainerBtn: {
    backgroundColor: '#ffffff',
    width: 88,
    height: 38,
    borderRadius: pxToDp(10),
    padding: pxToDp(10)
  },
  currentBanlance: {
    fontSize: pxToDp(30),
    color: '#ffffff',
    marginTop: pxToDp(30),
    marginLeft: pxToDp(10)
  },
  NoTHIRDListText: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#999999',
  },
  NoTHIRDListBtn: {
    width: "96%",
    height: pxToDp(70),
    marginTop: '20%',
    marginLeft: '2%',
    backgroundColor: '#59B26A',
    borderRadius: pxToDp(10)
  },
  closeIcon: {backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray},
  modalBtnStyle: {
    flexDirection: 'row',
    marginTop: 30,
  },
  modalBtnText: {
    height: 40,
    width: "50%",
    marginHorizontal: '10%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'gray',
    lineHeight: 40,
    borderRadius: pxToDp(10)
  },
  modalBtnText1: {
    height: 40,
    width: "50%",
    marginHorizontal: '10%',
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.main_color,
    color: 'white',
    lineHeight: 40,
    borderRadius: pxToDp(10)
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
