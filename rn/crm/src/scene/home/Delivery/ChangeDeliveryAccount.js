import React, {PureComponent} from "react";
import {StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import {SvgXml} from "react-native-svg";
import {convert} from "../../../svg/svg";
import Config from "../../../pubilc/common/config";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";

import OpenDeliveryModal from "../../../pubilc/component/OpenDeliveryModal";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  pageHeader: {color: colors.color333, fontSize: 16, fontWeight: 'bold'},
  headerRightWrap: {flexDirection: 'row', alignItems: 'center'},
  headerRightText: {fontSize: 15, color: colors.color333, marginLeft: 2},
  tipText: {paddingLeft: 18, paddingVertical: 10, fontSize: 14, color: colors.color999},
  deliveryStatusWrap: {marginHorizontal: 12, marginBottom: 10, borderRadius: 6, backgroundColor: colors.white},
  deliveryRowWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  deliveryTitle: {fontSize: 14, fontWeight: 'bold', color: colors.color333, paddingLeft: 12, paddingVertical: 18},
  deliveryContent: {fontSize: 14, color: colors.color333, paddingRight: 12, paddingVertical: 18},
  deliveryStatus: {fontSize: 14, color: '#FF862C', paddingRight: 12, paddingVertical: 18},
  line: {borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5', marginHorizontal: 12},
  deliveryStatusSwitchContentWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  deliveryStatusSwitchContentHeaderText: {fontSize: 14, color: colors.color333, paddingTop: 15, paddingLeft: 12},
  deliveryStatusSwitchContentText: {
    fontSize: 12,
    color: colors.color999,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 15
  },
  openDeliveryModalWrap: {backgroundColor: colors.white, borderTopLeftRadius: 10, borderTopRightRadius: 10},
  openDeliveryModalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  openDeliveryModalHeaderText: {fontSize: 16, fontWeight: 'bold', color: colors.color333, padding: 20},

  wsbDeliveryWrap: {borderRadius: 6, borderColor: '#26B942', borderWidth: 1, marginHorizontal: 20, marginBottom: 10},
  wsbDeliverHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.color333,
    paddingTop: 15,
    paddingLeft: 12,
    paddingBottom: 8
  },
  wsbDeliverContentDescription: {fontSize: 13, color: colors.color666, paddingHorizontal: 12, paddingBottom: 10},
  wsbDeliverContentText: {fontSize: 13, color: colors.color666, paddingHorizontal: 12, paddingBottom: 15},

  storeDeliveryWrap: {borderRadius: 6, backgroundColor: '#F5F5F5', marginHorizontal: 20, marginBottom: 10},
  storeDeliveryText: {fontSize: 13, color: colors.color333, paddingHorizontal: 12, paddingBottom: 15},
  storeDeliveryLeft: {color: '#FF862C'},

  editStoreInfoText: {fontSize: 14, paddingVertical: 14, color: '#39BF3E', textAlign: 'center'},
  mobileStyle: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingLeft: 12,
    paddingVertical: 13
  },
  verificationCodeWrap: {
    borderRadius: 6,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  verificationCodeInput: {paddingLeft: 12, paddingVertical: 13, flex: 1},
  verificationCodeText: {fontSize: 16, color: colors.colorBBB, paddingRight: 12, paddingVertical: 13},
  verificationCodeActiveText: {fontSize: 16, color: '#26B942', paddingRight: 12, paddingVertical: 13},
  openBtnWrap: {backgroundColor: '#26B942', borderRadius: 24, margin: 20, marginTop: 10},
  openBtnText: {fontSize: 16, fontWeight: 'bold', color: colors.white, paddingVertical: 10, textAlign: 'center'},

  rightCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26B942',
    borderLeftWidth: 1,
    borderLeftColor: 'transparent'

  }
})

class ChangeDeliveryAccount extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    const {delivery, store_id} = props.route.params
    this.state = {

      openDeliveryVisible: false,//开通运力
      deliveryType: delivery?.type,//运力类型
      deliveryName: '',//运力名称
      store_bind_deliveries: [],
      wsb_bind_deliveries: [],
      delivery: delivery,
      deliveryStatusObj: {apply_status: 2, apply_status_desc: ''},
      store_id: store_id
    }
  }

  headerTitle = (route) => {
    return (
      <Text style={styles.pageHeader}>
        {(route.params.delivery || {}).name}
      </Text>
    )
  }

  headerRight = () => {
    let {show_head_create_text} = this.props.route.params;
    return (
      <TouchableOpacity style={styles.headerRightWrap} onPress={this.openDeliveryModal}>
        <If condition={!show_head_create_text}>
          <SvgXml xml={convert()}/>
          <Text style={styles.headerRightText}>
            更换账号
          </Text></If>

        <If condition={show_head_create_text}>
          <Text style={styles.headerRightText}>
            开通自有账号
          </Text>
        </If>
      </TouchableOpacity>
    )
  }
  closeOpenDeliveryModal = () => {
    this.setState({openDeliveryVisible: false})
  }
  navigationOptions = ({navigation, route}) => {
    const {delivery} = route.params

    navigation.setOptions({
      headerTitle: () => this.headerTitle(route),
      headerRight: () => this.headerRight(delivery)
    })
  };

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {

    const {navigation} = this.props
    this.navigationOptions(this.props)
    this.focus = navigation.addListener('focus', () => {
      this.getDeliveryList(this.props)
      this.getDeliverStatus()
    })

  }

  getDeliverStatus = () => {
    const {accessToken, vendor_id} = this.props.global;

    const {store_id, delivery} = this.state
    const {id = 0, v2_type} = delivery;
    const params = {
      store_id: store_id,
      delivery_id: id,
      vendor_id: vendor_id,
      v2_type: v2_type
    }
    const url = `/v4/wsb_delivery/getDeliveryStatus/?access_token=${accessToken}`
    HttpUtils.get(url, params).then(res => {
      this.setState({deliveryStatusObj: res})
    }).catch((error) => ToastShort(error.reason))
  }

  getDeliveryList = ({global, route}) => {
    const {store_id} = this.state
    const {accessToken} = global;
    const {v2_type} = route.params.delivery;
    const api = `/v4/wsb_delivery/getShopDelivery?access_token=${accessToken}`
    const params = {real_store_id: store_id, choose_v2_type: v2_type}
    HttpUtils.get(api, params).then(res => {
      const {wsb_bind_deliveries = [], store_bind_deliveries = []} = res
      this.setState({
        wsb_bind_deliveries: wsb_bind_deliveries,
        store_bind_deliveries: store_bind_deliveries
      })
    }).catch(() => {
    })
  }

  switchDeliveryStatus = (deliveryStatus) => {
    let {accessToken, vendor_id} = this.props.global
    const {navigation} = this.props
    let {delivery, store_id, deliveryStatusObj} = this.state

    const {id = 0, v2_type, bind_type} = delivery
    const {apply_status} = deliveryStatusObj

    if ('wsb' === bind_type) {

      let params = {
        store_id: store_id,
        v2_type: v2_type,
        delivery_id: id,
        status: apply_status == 2 ? 1 : 0
      }

      let url = `/v4/wsb_delivery/setDeliveryStatus?access_token=${accessToken}`;
      HttpUtils.post(url, params).then(() => {
        // this.setState({delivery: {...delivery, is_forbidden: deliveryStatus ? 0 : 1}})
        ToastShort(`${deliveryStatus ? '恢复' : '禁用'}成功`)
        navigation.goBack()
      }).catch((error) => {
        ToastLong(`${deliveryStatus ? '恢复' : '禁用'}失败，原因：${error.reason}`)
      })
      return
    }
    const params = {store_id: store_id, delivery_type: v2_type}
    const url = `/v1/new_api/delivery/unbind_store_delivery?vendorId=${vendor_id}&access_token=${accessToken}`
    HttpUtils.post(url, params).then(() => {
      ToastShort(`解绑成功`)
      navigation.goBack()
    }).catch((error) => {
      ToastLong(`解绑失败，原因：${error.reason}`)
    })
  }
  openDeliveryModal = () => {
    const {delivery} = this.state
    const {type, name} = delivery
    this.setState({
      openDeliveryVisible: true,
      deliveryType: type,
      deliveryName: name
    })
  }


  touchEditStore = () => {
    const {store_id} = this.state
    const params = {
      type: 'edit',
      store_id: store_id
    }
    this.props.navigation.navigate(Config.ROUTE_SAVE_STORE, params)
  }

  render() {
    const {delivery = {}, deliveryStatusObj, deliveryType, openDeliveryVisible, store_id} = this.state
    const {is_forbidden = 0, bind_type = ''} = delivery
    const {apply_status = '', account_desc = '', reason, apply_status_desc} = deliveryStatusObj
    const {navigation} = this.props
    return (
      <View>
        <If condition={Config.MEI_TUAN_PEI_SONG != deliveryType}>
          <Text style={styles.tipText}>
            关联信息
          </Text>
          <View style={styles.deliveryStatusWrap}>
            <View style={styles.deliveryRowWrap}>
              <Text style={styles.deliveryTitle}>
                账号
              </Text>
              <Text style={styles.deliveryContent}>
                {account_desc}
              </Text>
            </View>

            <If condition={bind_type === 'wsb' && apply_status != 2}>
              <View style={styles.line}/>
              <View style={styles.deliveryRowWrap}>
                <Text style={styles.deliveryTitle}>
                  状态
                </Text>
                <Text style={styles.deliveryStatus}>
                  {apply_status_desc}
                </Text>
              </View>
              <View style={styles.line}/>
            </If>
            <If condition={apply_status == 3}>
              <View style={styles.deliveryRowWrap}>
                <Text style={styles.deliveryTitle}>
                  原因
                </Text>
                <Text style={styles.deliveryContent}>
                  {reason}
                </Text>
              </View>
              <View style={styles.line}/>
              <Text style={styles.editStoreInfoText} onPress={this.touchEditStore}>
                {'去修改 >'}
              </Text>
            </If>

          </View>
        </If>

        <View style={styles.deliveryStatusWrap}>
          <View style={styles.deliveryStatusSwitchContentWrap}>
            <View>
              <Text style={styles.deliveryStatusSwitchContentHeaderText}>配送状态开启</Text>
              <Text style={styles.deliveryStatusSwitchContentText}>关闭后，下单页不再展示该配送</Text>
            </View>
            <Switch style={{marginRight: 12}} value={is_forbidden === 0}
                    onValueChange={deliveryStatus => this.switchDeliveryStatus(deliveryStatus)}/>
          </View>
        </View>

        <If condition={openDeliveryVisible}>
          <OpenDeliveryModal visible={openDeliveryVisible}
                             onRequestClose={this.closeOpenDeliveryModal}
                             deliveryType={deliveryType}
                             navigation={navigation}
                             store_id={store_id}
                             delivery={delivery}/>
        </If>
      </View>
    )
  }
}

const mapStateToProps = ({global}) => ({global: global})
export default connect(mapStateToProps)(ChangeDeliveryAccount)
