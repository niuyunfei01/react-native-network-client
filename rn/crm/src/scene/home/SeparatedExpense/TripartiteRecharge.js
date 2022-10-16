import React, {PureComponent} from 'react'
import ReactNative, {InteractionManager, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import {hideModal, showError, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo"
import {Button} from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import JbbModal from "../../../pubilc/component/JbbModal";
import {InputItem} from "@ant-design/react-native";
import tool from "../../../pubilc/util/tool";

const {StyleSheet} = ReactNative

function mapStateToProps(state) {
  const {global, device} = state;
  return {global: global, device: device}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const THIRD_PARTY_ACCOUNT = 1;

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class TripartiteRecharge extends PureComponent {
  constructor(props: Object) {
    super(props);
    this.state = {
      isRefreshing: false,
      prompt_msg: '外送帮仅支持充值，如需查看充值记录和账单明细，请登录配送商家版查看',
      thirdAccountList: [],
      pay_url: '',
      dadaAccountModal: false,
      dadaAccountNum: 0,
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchThirdDeliveryList()
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  onRefresh = () => {
    this.fetchThirdDeliveryList()
  }

  // 获取三方配送充值列表
  fetchThirdDeliveryList = () => {
    showModal('加载中')
    const {global} = this.props;
    const url = `/v1/new_api/delivery/delivery_account_balance/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      hideModal()
      this.setState({
        thirdAccountList: res
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
            switch_type: THIRD_PARTY_ACCOUNT
          }, () => {
            ToastLong('即将前往充值...')
            setTimeout(() => {
              this.onPress(Config.ROUTE_WEB, {url: this.state.pay_url})
            }, 100)
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
          switch_type: THIRD_PARTY_ACCOUNT
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
    let {thirdAccountList} = this.state;
    return (
      <View style={Styles.containerContent}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this)}/>
        <ScrollView style={Styles.containerContent} refreshControl={
          <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.onRefresh()}
                          tintColor='gray'/>
        }>

          {this.renderTHIRDHeader()}
          {tool.length(thirdAccountList) > 0 ? this.renderTHIRDContentItem() : this.renderNOTHIRDList()}
          {this.renderAccountModal()}
        </ScrollView>
      </View>
    )
  }


  renderTHIRDHeader = () => {
    const {prompt_msg} = this.state
    return (
      <View style={Styles.THIRDHeader}>
        <FontAwesome5 name={'exclamation-circle'} style={Styles.THORDHeaderIcon} size={18}/>
        <Text style={Styles.THIRDHeaderText}>{prompt_msg}</Text>
      </View>
    )
  }


  renderNOTHIRDList = () => {
    return (
      <View style={Styles.THIRDContainerNOList}>
        <Text style={Styles.NoTHIRDListText}>
          未授权商家自有账号
        </Text>
        <Button buttonStyle={Styles.NoTHIRDListBtn}
                titleStyle={{fontSize: pxToDp(25), fontWeight: "bold"}}
                title={'去授权'}
                onPress={() => {
                  this.toAuthorization()
                }}/>
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
                    titleStyle={{fontSize: 15, color: 'white'}}
                    title={'取消'}
                    onPress={() => {
                      this.closeAccountModal()
                    }}/>
            <Button buttonStyle={Styles.modalBtnText1}
                    titleStyle={{fontSize: 15, color: 'white'}}
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
    fontSize: 30,
    fontWeight: "bold",
    color: '#999999',
    marginTop: '30%',
    marginLeft: '20%'
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


export default connect(mapStateToProps, mapDispatchToProps)(TripartiteRecharge);
