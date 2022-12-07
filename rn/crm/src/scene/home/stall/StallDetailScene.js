import React, {PureComponent} from "react";
import {FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {showError, ToastShort} from "../../../pubilc/util/ToastUtils";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import Entypo from "react-native-vector-icons/Entypo";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import JbbModal from "../../../pubilc/component/JbbModal";
import {connect} from "react-redux";
import tool from "../../../pubilc/util/tool";

const styles = StyleSheet.create({
  rowCenter: {flexDirection: 'row', alignItems: 'center', marginRight: 8},
  titleRightText: {fontSize: 14, fontWeight: '400', color: colors.main_color, lineHeight: 20, marginRight: 17},
  headerWrap: {
    shadowColor: 'rgba(0,0,0,0.1)',
    paddingTop: 13,
    paddingBottom: 14,
    paddingLeft: 17,
    paddingRight: 15,
    backgroundColor: colors.white
  },
  headerTopWrap: {flexDirection: 'row', justifyContent: 'space-between'},
  headerTopText: {fontSize: 18, fontWeight: '600', color: colors.color000, lineHeight: 25},
  headerTopRightWrap: {
    backgroundColor: '#EE2626',
    width: 41,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTopRightText: {color: colors.white, lineHeight: 14, fontWeight: '400', fontSize: 10},
  headerDateText: {fontSize: 12, fontWeight: '400', color: colors.color333, lineHeight: 17},
  row: {flexDirection: 'row'},
  headerLeftWrap: {alignItems: 'center', flex: 1, borderRightColor: colors.colorEEE, borderRightWidth: 1},
  width50: {alignItems: 'center', flex: 1, paddingBottom: 7},
  headerPriceWrap: {flexDirection: 'row', marginTop: 4, alignItems: 'flex-end'},
  headerPriceTitle: {fontSize: 12, fontWeight: '400', color: colors.color999, lineHeight: 17},
  headerPriceFlag: {fontSize: 12, fontWeight: '400', color: colors.color333},
  itemWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 31,
    paddingTop: 12,
    paddingBottom: 12,
    height: 46,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.colorEEE
  },
  itemLeftText: {fontSize: 15, fontWeight: 'bold', color: colors.color333, lineHeight: 21},
  itemRightWrap: {flexDirection: 'row'},
  itemRightText: {fontSize: 14, fontWeight: '400', color: '#EE2626', lineHeight: 20},
  itemRightIcon: {color: colors.colorCCC, marginLeft: 9, alignSelf: 'center'},
  itemSeparator: {borderColor: '#F7F7F7', borderTopWidth: 1, paddingLeft: 10, paddingRight: 10},
  listHeaderWrap: {
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 7,
    marginBottom: 1,
    marginTop: 10,
    backgroundColor: colors.white
  },
  selectedItemWrap: {
    flex: 1,
    borderBottomColor: colors.main_color,
    borderBottomWidth: 1,
    paddingBottom: 4
  },
  notSelectItemWrap: {
    flex: 1,
    paddingBottom: 4
  },
  selectedItem: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 22,
    textAlign: 'center'
  },
  notSelectItem: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 22,
    textAlign: 'center'
  },
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalTitle: {
    textAlign: 'center',
    color: colors.color333,
    fontWeight: 'bold',
    lineHeight: 25,
    fontSize: 18,
    paddingBottom: 25
  },
  modalContentWrap: {
    backgroundColor: colors.white,
    borderRadius: pxToDp(30),
  },
  modalInputContentWrap: {},
  modalContentRowWrap: {paddingBottom: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  modalContentLeftText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    marginRight: 16,
    textAlign: 'right',
  },
  modalContentRightTextInput: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    width: '70%',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#979797',
    borderStyle: 'solid',
    paddingTop: 3,
    paddingLeft: 7,
    paddingBottom: 4
  },
  selectContent: {
    width: '70%',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#979797',
    borderStyle: 'solid',
    paddingTop: 3,
    paddingLeft: 7,
    paddingBottom: 4
  },
  modalContentRightText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    width: '70%',
    paddingTop: 3,
    paddingBottom: 4,
  },
  modalContentRightMultipleTextInput: {
    width: '70%',
    borderRadius: 4,
    height: 88,
    borderWidth: 1,
    borderColor: '#979797',
    borderStyle: 'solid',
    paddingTop: 3,
    paddingLeft: 7,
    paddingBottom: 4,
    textAlignVertical: 'top'
  },
  modalCloseTitleStyle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.color333,
    textAlign: 'center',
  },
  modalCloseTitleWrap: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    width: '50%',
    paddingTop: 12,
    paddingBottom: 11,
  },
  modalBtnTitleWrap: {
    borderLeftColor: '#E5E5E5',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    width: '50%',
    // flex: 1,
    paddingTop: 12,
    paddingBottom: 11,
  },
  modalBtnTitleStyle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.main_color,
    textAlign: 'center',
  },
  modalBtnWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSelectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalNotSelectText: {
    fontSize: 14, color: colors.colorDDD, fontWeight: '400', marginRight: 6, lineHeight: 20
  },
  modalSelectText: {
    fontSize: 14, color: colors.color333, fontWeight: '400', marginRight: 6, lineHeight: 20
  },
  modifySettlementWrap: {
    margin: 10,
    backgroundColor: colors.white,
    flex: 1,
    borderRadius: 8,
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12
  },
  modifySettlementTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 32,
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
  },
  modifySettlementTopLeftText: {fontSize: 15, fontWeight: 'bold', color: colors.color333, lineHeight: 21},
  modifySettlementRightText: {fontSize: 16, fontWeight: '600', color: '#EE2626', lineHeight: 22},

  extraViewWrap: {backgroundColor: colors.white, paddingLeft: 18, paddingRight: 18},
  extraHeaderRowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: 15,
    paddingBottom: 11
  },
  extraHeaderLeftText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.color333,
    lineHeight: 20
  },
  extraHeaderRightText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 17
  },
  extraContentWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5
  },
  extraContentText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.color666,
    lineHeight: 18,
    flex: 1
  },
  extraContentNumText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.color666,
    lineHeight: 18,
    width: 30,
    textAlign: 'right',
  },
  extraContentPriceText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.color666,
    lineHeight: 18,
    width: 80,
    textAlign: 'right',
  },
  remarkWrap: {
    flexDirection: 'row',
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  remarkContentWrap: {paddingTop: 4},
  remarkPerson: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20},
  remarkText: {fontSize: 14, fontWeight: '400', color: colors.color333, paddingBottom: 14, lineHeight: 20}
})

const MODAL_DATA = [
  {value: 1, label: '扣款'},
  {value: 2, label: '补偿'},
]

class StallDetailScene extends PureComponent {

  state = {
    selectType: 'income',
    modalVisible: false,
    modalContentObj: {
      type: {
        value: '',
        label: ''
      },
      money: '',
      remark: '',
    },
    stallInfo: {
      income: [],
      outcome: [],
      other: []
    },
    selectItem: -1//展开某一项
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  setModalVisible = (value) => {
    this.setState({modalVisible: value})
  }

  headerRight = () => {
    return (
      <TouchableOpacity style={styles.rowCenter} onPress={() => this.modifySettlement()}>
        <Text style={styles.titleRightText}>
          修改结算
        </Text>
      </TouchableOpacity>
    )
  }

  modifySettlement = () => {
    this.setModalVisible(true)
  }

  submitSettlementInfo = (modalContentObj) => {
    if (tool.length(modalContentObj.type?.value) === 0 || tool.length(modalContentObj.money) === 0) {
      showError('请先选择类型和输入备注', 1);
      return
    }
    if (modalContentObj.money.startsWith('-')) {
      showError('请输入大于的0的数', 1);
      return
    }
    const {stallInfo} = this.state
    const {accessToken, stall_id, store_id} = this.props.route.params
    const url = `/api/mod_stall_bill_deduct?access_token=${accessToken}`
    const params = {
      bill_id: stallInfo?.bill_info?.bill_id ? stallInfo.bill_info.bill_id : 0,
      type: modalContentObj.type.value,
      amount: parseFloat(modalContentObj.money).toFixed(2),
      remark: modalContentObj.remark,
      stall_id: parseInt(stall_id),
      store_id: store_id
    }
    HttpUtils.post.bind(this.props)(url, params).then(res => {
      this.getStallBillDetail()
      ToastShort('提交成功')
    }, res => {
      showError(res.reason)
    }).catch(error => {
      showError(error.reason)
    })
    this.setState({
      modalVisible: false,
      modalContentObj: {
        type: {
          value: '',
          label: ''
        },
        money: '',
        remark: '',
      },
    })
  }

  closeModal = () => {
    this.setState({
      modalVisible: false,
      modalContentObj: {
        type: {
          value: '',
          label: ''
        },
        money: '',
        remark: '',
      },
    })
  }

  onChangeText = (value, attr) => {
    const {modalContentObj} = this.state
    modalContentObj[attr] = value
    this.setState({modalContentObj: {...modalContentObj}})
  }

  componentDidMount() {
    this.navigationOptions()
    this.getStallBillDetail()
  }

  getStallBillDetail = () => {
    const {stall_id, accessToken, selectedDate} = this.props.route.params
    const api = `/api/stall_bill_detail/${stall_id}/${selectedDate}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({stallInfo: res})
    }).catch(error => {

    })
  }

  renderModalContent = () => {
    const {modalContentObj, modalVisible} = this.state
    return (
      <JbbModal visible={modalVisible} onClose={this.closeModal} modalStyle={styles.modalContentWrap}
                modal_type={'center'}>
        <>
          <View style={styles.modalInputContentWrap}>
            <Text style={styles.modalTitle}>修改结算</Text>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                门店
              </Text>
              <Text style={styles.modalContentRightText}>
                {this.props.global?.store_info?.name}
              </Text>
            </View>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                摊位
              </Text>
              <Text style={styles.modalContentRightText}>
                {this.props.route.params.stall_name}
              </Text>
            </View>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                日期
              </Text>
              <Text style={styles.modalContentRightText}>
                {this.props.route.params.selectedDate}
              </Text>
            </View>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                类型
              </Text>
              <ModalSelector onChange={value => this.onChangeText(value, 'type')}
                             data={MODAL_DATA}
                             skin="customer"
                             style={styles.selectContent}
                             defaultKey={1}>
                <View style={styles.modalSelectWrap}>
                  <Text style={modalContentObj.type?.label ? styles.modalSelectText : styles.modalNotSelectText}>
                    {modalContentObj.type?.label ? modalContentObj.type.label : '请选择类型'}
                  </Text>
                  <Entypo name='chevron-thin-down' style={styles.modalSelectText}/>
                </View>
              </ModalSelector>

            </View>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                金额
              </Text>
              <TextInput style={styles.modalContentRightTextInput}

                         value={modalContentObj.money}
                         placeholderTextColor={colors.colorDDD}
                         onChangeText={text => this.onChangeText(text, 'money')}
                         placeholder={'请输入金额'}
                         keyboardType={'numeric'}/>
            </View>
            <View style={styles.modalContentRowWrap}>
              <Text style={styles.modalContentLeftText}>
                备注
              </Text>
              <TextInput style={styles.modalContentRightMultipleTextInput}

                         placeholderTextColor={colors.colorDDD}
                         multiline={true}
                         onChangeText={text => this.onChangeText(text, 'remark')}
                         value={modalContentObj.remark}
                         placeholder={'请输入备注'}/>
            </View>
          </View>
          <View style={styles.modalBtnWrap}>
            <TouchableOpacity style={styles.modalCloseTitleWrap} onPress={this.closeModal}>
              <Text style={styles.modalCloseTitleStyle}>
                取消
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnTitleWrap}
                              onPress={() => this.submitSettlementInfo(modalContentObj)}>
              <Text style={styles.modalBtnTitleStyle}>
                确定
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </JbbModal>
    )
  }

  renderOther = (list) => {
    return (
      <If condition={tool.length(list) > 0}>
        <For of={list} each="item" index="i">
          <View style={styles.modifySettlementWrap} key={i}>
            <View style={styles.modifySettlementTitleWrap}>
              <Text style={styles.modifySettlementTopLeftText}>修改结算</Text>
              <Text style={styles.modifySettlementRightText}>
                {item.f_deduct_fee}元
              </Text>
            </View>
            <View style={styles.remarkWrap}>
              <Text style={styles.remarkPerson}>
                操作人员：{item.username}
              </Text>
            </View>
            <ScrollView
              automaticallyAdjustContentInsets={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.remarkContentWrap}>
              <Text style={styles.remarkText}>
                备注信息：{item.deduct_desc}
              </Text>
            </ScrollView>
          </View>
        </For>

      </If>
    )
  }

  renderHeader = (stall_name, settle_amount, refund_fee, order_num, selectedDate) => {
    const {stallInfo} = this.state
    return (
      <View style={styles.headerWrap}>
        <View style={styles.headerTopWrap}>
          <Text style={styles.headerTopText}>
            摊位结算-{stall_name}
          </Text>
        </View>
        <Text style={styles.headerDateText}>
          日期：{selectedDate}
        </Text>
        <View style={[styles.row, {paddingTop: 14}]}>
          <View style={styles.headerLeftWrap}>
            <Text style={styles.headerPriceTitle}>
              应结金额
            </Text>
            <View style={styles.headerPriceWrap}>
              <Text style={styles.headerPriceFlag}>
                ￥
              </Text>
              <Text style={styles.headerPrice}>
                {stallInfo?.bill_info?.f_settle_amount ? stallInfo?.bill_info?.f_settle_amount : settle_amount}
              </Text>
            </View>
          </View>
          <View style={styles.headerLeftWrap}>
            <Text style={styles.headerPriceTitle}>
              已完成订单
            </Text>
            <View style={styles.headerPriceWrap}>
              <Text style={styles.headerOrderTotal}>
                {order_num}
              </Text>
              <Text style={styles.headerOrderUnit}>
                单
              </Text>
            </View>
          </View>
          <View style={styles.width50}>
            <Text style={styles.headerPriceTitle}>
              退款金额
            </Text>
            <View style={styles.headerPriceWrap}>
              <Text style={styles.headerPriceFlag}>
                ￥
              </Text>
              <Text style={styles.headerPrice}>
                {refund_fee}
              </Text>
            </View>
          </View>
        </View>
      </View>

    )
  }

  selectItem = (selectItem, index) => {
    this.setState({selectItem: selectItem !== index ? index : -1})
  }
  renderExtraView = (order_time, items) => {
    const {stall_name} = this.props.route.params
    return (
      <View style={styles.extraViewWrap}>
        <View style={styles.extraHeaderRowWrap}>
          <Text style={styles.extraHeaderLeftText}>
            {stall_name}
          </Text>
          <Text style={styles.extraHeaderRightText}>
            完成时间：{order_time}
          </Text>
        </View>
        <If condition={Array.isArray(items) && items.length > 0}>
          <For of={items} each="item" index="i">
            <View style={styles.extraContentWrap} key={i}>
              <Text style={styles.extraContentText}>
                {item.name}
              </Text>
              <Text style={styles.extraContentNumText}>
                x{item.num}
              </Text>
              <Text style={styles.extraContentPriceText}>
                ￥{item.price}
              </Text>
            </View>
          </For>
        </If>
      </View>
    )
  }

  renderItem = (item) => {
    const {platform_name, day_id, f_amount, order_time, items} = item.item
    const {selectItem} = this.state
    return (
      <View>
        <TouchableOpacity style={styles.itemWrap} onPress={() => this.selectItem(selectItem, item.index)}>
          <Text style={styles.itemLeftText}>
            {platform_name}(#{day_id})
          </Text>
          <View style={styles.row}>
            <Text style={styles.itemRightText}>
              ￥{f_amount}
            </Text>
            <If condition={selectItem === item.index}>
              <FontAwesome5 name={'angle-down'} style={styles.itemRightIcon}/>
            </If>
            <If condition={selectItem !== item.index}>
              <FontAwesome5 name={'angle-up'} style={styles.itemRightIcon}/>
            </If>
          </View>
        </TouchableOpacity>
        <If condition={selectItem === item.index}>
          {this.renderExtraView(order_time, items)}
        </If>
      </View>
    )
  }

  ItemSeparatorComponent = () => {
    return (
      <View style={styles.itemSeparator}/>
    )
  }

  getItemLayout = (data, index) => ({
    length: 46, offset: 46 * index, index
  })

  renderList = (stallInfo) => {
    const {selectType} = this.state

    return (
      <FlatList data={stallInfo[selectType]}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={this.ItemSeparatorComponent}
                renderItem={(item) => this.renderItem(item)}
                keyExtractor={(item, index) => `${index}`}
                getItemLayout={(data, index) => this.getItemLayout(data, index)}
      />
    )
  }

  selectType = (value) => {
    this.setState({selectType: value})
  }

  renderListHeader = () => {
    const {selectType} = this.state
    return (
      <View style={styles.listHeaderWrap}>
        <TouchableOpacity style={'income' === selectType ? styles.selectedItemWrap : styles.notSelectItemWrap}
                          onPress={() => this.selectType('income')}>
          <Text style={'income' === selectType ? styles.selectedItem : styles.notSelectItem}>
            收款
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={'outcome' === selectType ? styles.selectedItemWrap : styles.notSelectItemWrap}
                          onPress={() => this.selectType('outcome')}>
          <Text style={'outcome' === selectType ? styles.selectedItem : styles.notSelectItem}>
            退款
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={'other' === selectType ? styles.selectedItemWrap : styles.notSelectItemWrap}
                          onPress={() => this.selectType('other')}>
          <Text style={'other' === selectType ? styles.selectedItem : styles.notSelectItem}>
            其他
          </Text>
        </TouchableOpacity>
      </View>

    )
  }

  render() {
    const {selectType, stallInfo} = this.state
    const {stall_name, settle_amount, refund_fee, order_num, selectedDate} = this.props.route.params
    return (
      <>
        {this.renderHeader(stall_name, settle_amount, refund_fee, order_num, selectedDate)}
        {this.renderListHeader()}
        <If condition={selectType === 'income' || selectType === 'outcome'}>
          {this.renderList(stallInfo)}
        </If>
        <If condition={selectType === 'other'}>
          {this.renderOther(stallInfo.other)}
        </If>
        {this.renderModalContent()}
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

export default connect(mapStateToProps)(StallDetailScene)
