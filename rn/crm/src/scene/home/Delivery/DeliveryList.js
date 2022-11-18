import React, {PureComponent} from "react";
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import HttpUtils from "../../../pubilc/util/http";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import {hideModal, showModal,} from "../../../pubilc/util/ToastUtils";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import {unDisable} from "../../../reducers/mine/mineActions";
import FastImage from "react-native-fast-image";
import Config from "../../../pubilc/common/config";
import TopSelectModal from "../../../pubilc/component/TopSelectModal";
import OpenDeliveryModal from "../../../pubilc/component/OpenDeliveryModal";
import {SvgXml} from "react-native-svg";
import {down} from "../../../svg/svg";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({unDisable, ...globalActions}, dispatch)
  }
}


class DeliveryList extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      in_review_deliveries: [],
      store_bind_deliveries: [],
      wsb_bind_deliveries: [],
      wsb_unbind_deliveries: [],
      openDeliveryVisible: false,//开通运力

      deliveryType: -1,//运力类型
      platformId: 0,
      selectStoreVisible: false,
      selectDelivery: {},
      store_id: props.global.currStoreId,
      store_name: props.global.store_info.name,
      storeList: [],
      page_size: 20,
      page: 1,
      isLastPage: false,
      refreshing: false
    }
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    this.navigationOptions(this.state)
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.fetchData()
      this.getStoreList()
    })

  }

  getStoreList = () => {
    const {accessToken, only_one_store} = this.props.global;
    const {page_size, page, storeList, isLastPage} = this.state
    if (only_one_store || isLastPage)
      return
    let params = {
      keywords: '',
      page: page,
      page_size: page_size
    }
    this.setState({refreshing: true})
    const api = `/v1/new_api/stores/get_can_read_stores?access_token=${accessToken}`;
    HttpUtils.get(api, params).then(res => {
      const {lists, page, pageSize, count} = res
      let list = []
      Object.keys(lists).map((key) => {
        let item = {...lists[key]};
        item['searchStr'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        item['cursor'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        list.push(item);
      })
      list = page !== 1 ? storeList.concat(list) : list
      this.setState({
        storeList: list,
        page: page + 1,
        page_size: pageSize,
        refreshing: false,
        isLastPage: lists && page * pageSize >= count
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  headerTitle = (store_name) => {
    const {only_one_store} = this.props.global

    return (
      <TouchableOpacity disabled={only_one_store}
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                        onPress={() => this.setState({selectStoreVisible: true})}>
        <Text style={styles.headerText}>
          {store_name}
        </Text>
        <SvgXml xml={down(20, 20)}/>
      </TouchableOpacity>
    )
  }
  navigationOptions = ({store_name}) => {
    const {navigation} = this.props

    const option = {headerTitle: () => this.headerTitle(store_name)}
    navigation.setOptions(option);
  }

  fetchData = () => {
    showModal("请求中...")
    const {accessToken} = this.props.global
    const {store_id} = this.state
    const api = `/v4/wsb_delivery/getShopDelivery?access_token=${accessToken}`
    const params = {store_id: store_id}
    HttpUtils.post(api, params).then((res) => {
      hideModal()
      const {
        in_review_deliveries = [], store_bind_deliveries = [], wsb_bind_deliveries = [], wsb_unbind_deliveries = []
      } = res
      this.setState({
        in_review_deliveries: in_review_deliveries,
        store_bind_deliveries: store_bind_deliveries,
        wsb_bind_deliveries: wsb_bind_deliveries,
        wsb_unbind_deliveries: wsb_unbind_deliveries
      })
    }).catch(() => {
      hideModal()
    })
  }

  openDeliveryModal = (item, touchDelivery) => {
    const {type, v2_type} = item
    // console.log('item', item)
    const {store_id} = this.state
    this.setState({selectDelivery: item})
    if (touchDelivery === 4) {
      this.setState({
        openDeliveryVisible: true,
        deliveryType: type,
        platformId: v2_type,
      })
      return
    }
    const params = {
      delivery: {...item, touchDelivery: touchDelivery},
      store_id: store_id
    }
    this.navigateRoute(Config.ROUTE_CHANGE_DELIVERY_ACCOUNT, params)
  }

  getDeliveries = (deliveriesList = [], text, touchDelivery = 1) => {
    if (deliveriesList.length > 0)
      return (
        <View style={styles.zoneWrap}>
          <Text style={styles.zoneHeaderText}>
            {text}
          </Text>
          <View style={styles.allItemWrap}>
            {
              deliveriesList && deliveriesList.map((item, index) => {
                const {icon = '', name = ''} = item
                return (
                  <TouchableOpacity key={index} style={styles.itemWrap}
                                    onPress={() => this.openDeliveryModal(item, touchDelivery)}>
                    <FastImage resizeMode={FastImage.resizeMode.contain}
                               source={{uri: icon}}
                               style={styles.itemImage}/>
                    <Text style={styles.itemText}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                )

              })
            }
          </View>
        </View>
      )
  }

  closeOpenDeliveryModal = () => {
    this.setState({openDeliveryVisible: false})
  }

  navigateRoute = (route, params = {}, callback = {}) => {
    const {navigation} = this.props
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(route, params, callback);
    });
  }

  setStoreInfo = (item) => {
    const {name, id} = item
    this.setState({store_name: name, store_id: id, selectStoreVisible: false}, () => this.fetchData())
    this.navigationOptions({store_name: name})

  }

  getTip = () => {
    return (
      <View style={styles.tipWrap}>
        <Text style={styles.tipText}>
          点击任意配送可绑定自有账号，免费使用。
        </Text>
      </View>
    )
  }

  render() {
    const {
      wsb_bind_deliveries, in_review_deliveries, store_bind_deliveries, wsb_unbind_deliveries, openDeliveryVisible,
      deliveryType, selectDelivery, selectStoreVisible, storeList, store_id, refreshing
    } = this.state

    const {navigation} = this.props
    return (
      <>
        {this.getTip()}
        <ScrollView>
          {this.getDeliveries(in_review_deliveries, '审核中的省钱配送', 1)}
          {this.getDeliveries(wsb_bind_deliveries, '正在使用的省钱配送', 2)}
          {this.getDeliveries(store_bind_deliveries, '正在使用的自有账号', 3)}
          {this.getDeliveries(wsb_unbind_deliveries, '当前城市支持的其他配送', 4)}
        </ScrollView>
        <If condition={openDeliveryVisible}>
          <OpenDeliveryModal visible={openDeliveryVisible}
                             onRequestClose={this.closeOpenDeliveryModal}
                             deliveryType={deliveryType}
                             navigation={navigation}
                             store_id={store_id}
                             delivery={selectDelivery}/>
        </If>
        <TopSelectModal visible={selectStoreVisible} marTop={0}
                        list={storeList}
                        label_field={'name'}
                        value_field={'id'}
                        default_val={store_id}
                        onEndReachedThreshold={0.3}
                        onEndReached={this.getStoreList}
                        refreshing={refreshing}
                        initialNumToRender={10}
                        onPress={(item) => this.setStoreInfo(item)}
                        onClose={() => this.setState({selectStoreVisible: false})}/>
      </>
    )
  }
}

const styles = StyleSheet.create({
  zoneHeaderText: {fontSize: 15, fontWeight: 'bold', color: colors.color333, padding: 12},
  zoneWrap: {backgroundColor: colors.white, marginHorizontal: 12, marginBottom: 10, borderRadius: 6},
  headerText: {fontSize: 15, fontWeight: 'bold', color: colors.color333, textAlign: 'center'},
  allItemWrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  itemWrap: {
    backgroundColor: '#F9F9F9',
    borderRadius: 4,
    marginLeft: 12,
    marginBottom: 10,
    width: 150,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemImage: {width: 36, height: 36},
  itemText: {fontSize: 13, color: colors.color333, textAlign: 'center', paddingTop: 6},
  tipWrap: {backgroundColor: '#FFF1E3', marginBottom: 10},
  tipText: {fontSize: 12, color: '#FF862C', paddingLeft: 12, paddingVertical: 6},
  openDeliveryModalWrap: {backgroundColor: colors.white, borderTopLeftRadius: 10, borderTopRightRadius: 10},
  openDeliveryModalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  openDeliveryModalHeaderText: {fontSize: 16, fontWeight: '500', color: colors.color333, padding: 20},

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
  openBtnText: {fontSize: 16, fontWeight: '500', color: colors.white, paddingVertical: 10, textAlign: 'center'},

  rightCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26B942',
    borderLeftWidth: 1,
    borderLeftColor: 'transparent'

  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList)
