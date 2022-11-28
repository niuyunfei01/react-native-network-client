import React from 'react'
import SettlementGoodsScene from './_SettlementDetail/SettlementGoodsScene'
import SettlementOrderScene from './_SettlementDetail/SettlementOrderScene'
import {connect} from "react-redux";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import HttpUtils from "../../../pubilc/util/http";
import Cts from "../../../pubilc/common/Cts";
import tool from "../../../pubilc/util/tool";
import pxToDp from "../../../pubilc/util/pxToDp";
import TabButton from "../../../pubilc/component/TabButton";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import {Button} from "react-native-elements";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

const {width} = Dimensions.get("window");

class SettlementDetailsScene extends React.Component {
  constructor(props) {
    super(props)
    let {date, status, id, key, profit, totalPrePriceDesc, shipPriceDesc} = this.props.route.params || {};
    this.state = {
      date: date,
      status: status,
      id: id,
      key: key,
      profit: profit,
      goodsList: [],
      orderList: [],
      refundList: [],
      otherList: [],
      merchant_reship_tip: [],
      totalPrice: 0,
      totalShipFee: 0,
      totalPrePrice: 0,
      orderNum: 0,
      orderAmount: 0,
      refundNum: 0,
      refundAmount: 0,
      otherNum: 0,
      merchant_add_tip_amount: 0,
      merchant_add_tip_num: 0,
      merchant_reship_amount: 0,
      merchant_reship_num: 0,
      otherAmount: 0,
      tab: [
        {label: '订单详情', value: 'order'},
        {label: '商品详情', value: 'goods'}
      ],
      activeTab: 'order',
      icon: '',
      showPrompt: false,
      totalPrePriceToast: {
        tip_title: '预计总收入',
        tip_desc: totalPrePriceDesc || ''
      },
      shipPriceToast: {
        tip_title: '三方配送支出',
        tip_desc: shipPriceDesc || ''
      },
      promptModalContent: {}
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    let {date, id} = this.state;
    let {accessToken, store_id} = this.props.global;
    showModal("加载中");
    HttpUtils.get.bind(this.props)(`/api/settlement_detail/${id}/${store_id}/${date}?access_token=${accessToken}`).then((res) => {
      hideModal();
      this.setState({
        goodsList: res.goods_list,
        orderList: res.order_list,
        refundList: res.refund_list,
        otherList: res.other_list,
        merchant_reship_tip: res.merchant_reship_tip,
        totalPrice: res.total_price,
        totalShipFee: res.total_ship_fee,
        totalPrePrice: res.total_pre_price,
        orderNum: res.order_num,
        orderAmount: res.order_amount,
        refundNum: res.refund_order_num,
        refundAmount: res.refund_amount,
        otherNum: res.other_num,
        otherAmount: res.other_amount,
        merchant_add_tip_amount: res.merchant_add_tip_amount,
        merchant_add_tip_num: res.merchant_add_tip_num,
        merchant_reship_amount: res.merchant_reship_amount,
        merchant_reship_num: res.merchant_reship_num,
        icon: res.icon
      })
    })
  }

  to_order = (id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_NEW, {orderId: id})
  };

  showPromptModal = (flag) => {
    let {totalPrePriceToast, shipPriceToast} = this.state;
    this.setState({
      showPrompt: true,
      promptModalContent: flag == 1 ? totalPrePriceToast : shipPriceToast
    }, () => {
      this.renderPromptModal()
    })
  }

  closePromptModal = () => {
    this.setState({
      showPrompt: false
    })
  }

  renderHeader() {
    const {date, totalPrice, icon, status} = this.state
    return (
      <View style={styles.header}>
        <Text style={styles.headerDate}>时间：{date} </Text>
        <View style={styles.amountRow}>
          <Text style={styles.headerDate}>结算金额：￥{tool.toFixed(totalPrice)}</Text>
          <FontAwesome5 name={icon}
                        style={{fontSize: icon === 'weixin' ? 22 : 25, color: colors.main_color}}/>
          <View style={{
            flexDirection: 'row',
            padding: 4,
            marginLeft: 5,
            backgroundColor: status === Cts.BILL_STATUS_PAID ? colors.white : colors.warn_red
          }}>
            <Text style={{
              fontSize: 10,
              textAlign: 'center',
              color: status === Cts.BILL_STATUS_PAID ? colors.color333 : colors.white
            }}>{status === Cts.BILL_STATUS_PAID ? '已打款' : tool.billStatus(this.state.status)} </Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const {date, totalPrice, icon, status, totalShipFee, totalPrePrice} = this.state
    return (
      <View style={styles.container}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}} style={{height: 500}}>
          <View style={styles.header}>
            <Text style={styles.headerDate}>时间：{date} </Text>
            <View style={styles.shipBox}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10}}>
                  <Text style={{color: colors.color666, fontSize: 12}}>预计总收入(元) </Text>
                  <Entypo name={'help-with-circle'} style={{fontSize: 14, color: colors.colorDDD}} onPress={() => this.showPromptModal(1)}/>
                </View>
                <Text style={{color: colors.color333, fontSize: 15}}>{tool.toFixed(totalPrePrice)} </Text>
              </View>
              <View style={{width: 1, height: 40, backgroundColor: colors.e5, marginRight: '10%'}} />
              <View style={{flex: 1}}>
                <View style={{flexDirection: "row", alignItems: "center", marginBottom: 10}}>
                  <Text style={{color: colors.color666, fontSize: 12}}>三方配送支出(元) </Text>
                  <Entypo name={'help-with-circle'} style={{fontSize: 14, color: colors.colorDDD}} onPress={() => this.showPromptModal(2)}/>
                </View>
                <Text style={{color: colors.color333, fontSize: 15}}>{tool.toFixed(totalShipFee)} </Text>
              </View>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.totalPrice}>结算金额(元)：<Text style={styles.totalPriceNum}>{tool.toFixed(totalPrice)} </Text></Text>
              <If condition={icon}>
                <FontAwesome5 name={icon}
                              style={{
                                fontSize: 22,
                                color: icon === 'weixin' ? colors.main_color : colors.fontBlue,
                              }}/>
              </If>
              <View style={{
                flexDirection: 'row',
                padding: 4,
                marginLeft: 5,
                backgroundColor: status === Cts.BILL_STATUS_PAID ? '#FF8309' : colors.warn_red
              }}>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: colors.white
                }}>{status === Cts.BILL_STATUS_PAID ? '已打款' : tool.billStatus(this.state.status)} </Text>
              </View>
            </View>
          </View>
          <TabButton
            data={this.state.tab}
            onClick={(value) => this.setState({activeTab: value})}
            containerStyle={{marginVertical: 6}}
          />

          <If condition={this.state.activeTab === 'goods'}>
            <SettlementGoodsScene
              tabLabel='商品详情'
              goodsList={this.state.goodsList}
              orderAmount={this.state.orderAmount}
            />
          </If>

          <If condition={this.state.activeTab === 'order'}>
            <SettlementOrderScene
              func_to_order={this.to_order}
              tabLabel='订单详情'
              orderList={this.state.orderList}
              orderNum={this.state.orderNum}
              orderAmount={this.state.orderAmount}
              refundList={this.state.refundList}
              refundNum={this.state.refundNum}
              refundAmount={this.state.refundAmount}
              otherList={this.state.otherList}
              otherNum={this.state.otherNum}
              otherAmount={this.state.otherAmount}
              merchant_reship_tip={this.state.merchant_reship_tip}
              merchant_add_tip_num={this.state.merchant_add_tip_num}
              merchant_add_tip_amount={this.state.merchant_add_tip_amount}
              merchant_reship_num={this.state.merchant_reship_num}
              merchant_reship_amount={this.state.merchant_reship_amount}
            />
          </If>
          {this.renderPromptModal()}
        </ScrollView>
      </View>
    )
  }

  renderPromptModal = () => {
    let {showPrompt, promptModalContent} = this.state
    return (
      <CommonModal visible={showPrompt} position={'center'} onRequestClose={this.closePromptModal} animationType={'fade'}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {promptModalContent.tip_title}
          </Text>
          <Text style={[styles.modalContentDesc, {marginVertical: 10}]}>
            {promptModalContent.tip_desc}
          </Text>
          <View style={styles.modalBtnBottom}>
            <Button title={'知道了'}
                    onPress={() => this.closePromptModal()}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.main_color}]}
                    titleStyle={[styles.modalBtnText, {color: colors.white}]}
            />
          </View>
        </View>
      </CommonModal>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    padding: pxToDp(30),
    paddingBottom: 0
  },
  headerDate: {
    color: colors.color333,
    fontSize: 14
  },
  totalPrice: {
    color: '#FF8309',
    fontSize: 14,
    fontWeight: "bold",
    flex: 1
  },
  totalPriceNum: {
    color: '#FF8309',
    fontSize: 18,
    fontWeight: "bold"
  },
  shipBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: pxToDp(20),
    borderTopWidth: 1,
    borderTopColor: colors.e5
  },
  status: {
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(20),
    lineHeight: pxToDp(34),
    height: pxToDp(36),
    textAlign: 'center'
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    width: width * 0.9,
    marginLeft: width * 0.05
  },
  modalTitle: {
    color: colors.color333,
    fontWeight: "bold",
    fontSize: 16
  },
  modalContentDesc: {
    color: colors.color333,
    fontSize: 14,
    lineHeight: 20
  },
  modalBtnBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: width * 0.75
  },
  modalBtnWrap: {
    width: width * 0.75,
    height: 40,
    borderRadius: 20
  },
  modalBtnText: {
    fontSize: 16,
    textAlign: 'center'
  }
})
export default connect(mapStateToProps)(SettlementDetailsScene)

