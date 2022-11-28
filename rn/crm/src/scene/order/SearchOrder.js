import React, {PureComponent} from 'react'
import {FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import HttpUtils from "../../pubilc/util/http";
import tool from "../../pubilc/util/tool";
import colors from "../../pubilc/styles/colors";
import {ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import {SearchBar} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import {back, cross_circle_icon, empty_order, search_icon} from "../../svg/svg";
import OrderItem from "../../pubilc/component/OrderItem";
import GoodsListModal from "../../pubilc/component/GoodsListModal";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal";
import CancelDeliveryModal from "../../pubilc/component/CancelDeliveryModal";
import AddTipModal from "../../pubilc/component/AddTipModal";
import AlertModal from "../../pubilc/component/AlertModal";
import PropTypes from "prop-types";

function mapStateToProps(state) {
  const {global} = state;
  return {global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SearchOrder extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    let {search_store_id = 0} = this.props.route.params;
    this.state = {
      keyword: '',
      keyword_type: 0,
      search_store_id: search_store_id,
      list: [],
      item_list: [],
      end: false,
      is_loading: false,
      is_can_load_more: false,
      query: {
        page_size: 10,
        page: 1,
        is_add: true,
      },
      order_id: 0,
      add_tip_id: 0,
      show_goods_list: false,
      show_add_tip_modal: false,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_finish_delivery_modal: false,
      show_placeholder: true,
    };
  }

  onRefresh = () => {
    const {query} = this.state
    this.setState({
        query: {...query, page: 1, is_add: true, page_size: 10},
      },
      () => this.fetchOrderList())
  }

  fetchOrderList = (setList = 1) => {
    let {
      is_loading,
      query,
      keyword,
      keyword_type,
      search_store_id
    } = this.state;
    if (is_loading || !query.is_add || tool.length(keyword) <= 0) {
      return null;
    }
    this.setState({
      is_loading: true,
    })
    let {accessToken} = this.props.global;
    let params = {
      search_store_id: search_store_id,
      keyword: keyword,
      keyword_type: keyword_type,
      page: query.page,
      page_size: query.page_size,
    }
    const url = `/v4/wsb_order/order_search?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      let {list, query} = this.state;
      if (tool.length(res.data) < query.page_size) {
        query.is_add = false;
      }
      query.page++;
      this.setState({
        is_loading: false,
        query: query,
        list: setList === 1 ? res.data : list.concat(res.data),
      })
    }, (res) => {
      ToastLong(res.reason);
      this.setState({is_loading: false})
    }).catch((res) => {
      ToastLong(res.reason);
      this.setState({is_loading: false})
    })

  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  openAddTipModal = (order_id) => {
    this.setState({
      add_tip_id: order_id,
      show_add_tip_modal: true,
      show_delivery_modal: false
    })
  }

  openCancelDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_cancel_delivery_modal: true,
      show_delivery_modal: false
    })
  }

  openFinishDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_finish_delivery_modal: true,
      show_delivery_modal: false
    })
  }

  closeModal = () => {
    this.setState({
      order_id: 0,
      show_condition_modal: 0,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_finish_delivery_modal: false,
      show_select_store_modal: false,
      show_date_modal: false,
    })
  }

  toSetOrderComplete = () => {
    this.closeModal();
    let {accessToken} = this.props.global;
    let {order_id} = this.state;
    const api = `/api/complete_order/${order_id}?access_token=${accessToken}`
    HttpUtils.get(api).then(() => {
      ToastLong('订单已送达')
      this.fetchOrderList()
    }).catch(() => {
      ToastShort('“配送完成失败，请稍后重试”')
    })
  }


  onCancel = () => {
    this.setState({keyword: ''});
  }
  onScrollBeginDrag = () => {
    this.setState({is_can_load_more: true})
  }

  render() {
    const {store_id, accessToken, dispatch} = this.props.global;
    const {
      is_loading,
      list,
      order_id,
      show_goods_list,
      show_delivery_modal,
      show_add_tip_modal,
      show_cancel_delivery_modal,
      add_tip_id,
    } = this.state
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <FlatList
          data={list}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh}
          refreshing={is_loading}
          shouldItemUpdate={this._shouldItemUpdate}
          keyExtractor={(item, index) => `${index}`}
          ListEmptyComponent={this.renderNoOrder()}
          ListFooterComponent={this.renderBottomView()}
          initialNumToRender={3}
        />
        {this.renderFinishDeliveryModal()}
        <GoodsListModal
          setState={this.setState.bind(this)}
          onPress={this.onPress.bind(this)}
          accessToken={accessToken}
          order_id={order_id}
          store_id={store_id}
          show_goods_list={show_goods_list}/>
        <DeliveryStatusModal
          order_id={order_id}
          order_status={0}
          store_id={store_id}
          fetchData={this.onRefresh.bind(this)}
          onPress={this.onPress.bind(this)}
          openAddTipModal={this.openAddTipModal.bind(this)}
          openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
          openFinishDeliveryModal={this.openFinishDeliveryModal.bind(this)}
          accessToken={accessToken}
          show_modal={show_delivery_modal}
          onClose={this.closeModal}
        />

        <CancelDeliveryModal
          order_id={order_id}
          ship_id={0}
          accessToken={accessToken}
          show_modal={show_cancel_delivery_modal}
          fetchData={this.onRefresh.bind(this)}
          onPress={this.onPress.bind(this)}
          onClose={this.closeModal}
        />

        <AddTipModal
          setState={this.setState.bind(this)}
          accessToken={accessToken}
          id={add_tip_id}
          orders_add_tip={true}
          dispatch={dispatch}
          show_add_tip_modal={show_add_tip_modal}/>

      </View>
    );
  }

  renderHeader = () => {
    let {keyword, keyword_type = 1, item_list, show_placeholder} = this.state
    return (
      <View style={{backgroundColor: colors.white}}>
        <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 6}}>
          <SvgXml style={{marginHorizontal: 4}} onPress={() => {
            this.props.navigation.goBack()
          }} xml={back()}/>
          <SearchBar
            inputStyle={{fontSize: 14, color: colors.color333}}
            leftIconContainerStyle={{
              width: 20,
              height: 20
            }}
            autoFocus={true}
            searchIcon={<SvgXml xml={search_icon(colors.color666)} height={26} width={26}/>}
            clearIcon={<SvgXml onPress={this.onCancel} xml={cross_circle_icon()}/>}
            cancelIcon={<SvgXml onPress={this.onCancel} xml={cross_circle_icon()}/>}
            placeholderTextColor={show_placeholder ? colors.color999 : 'rgba(0,0,0,0)'}
            onBlur={() => {
              this.setState({
                show_placeholder: true
              })
            }}
            onFocus={() => {
              this.setState({
                show_placeholder: false
              })
            }}
            inputContainerStyle={{
              backgroundColor: colors.f5,
              height: 32,
              borderRadius: 16,
              borderWidth: 0
            }}
            containerStyle={{
              flex: 1,
              padding: 0,
              margin: 0,
              height: 31,
              borderRadius: 16
            }}
            lightTheme={'true'}
            placeholder="请输入关键词进行搜索"
            value={keyword}
            onChangeText={(keyword) => {
              let arr = [
                {label: '订单号', value: 4},
                {label: '流水号', value: 5},
                {label: '手机号', value: 6},
                {label: '取货码', value: 7},
              ]
              if (/[\u4e00-\u9fa5]+?$/g.test(keyword)) {
                arr = [
                  {label: '骑手姓名', value: 1},
                  {label: '商品名', value: 2},
                  {label: '收件地址', value: 3},
                ]
              }
              this.setState({
                keyword,
                item_list: arr
              }, () => {
                tool.debounces(() => {
                  this.fetchOrderList()
                })
              })
            }}
            onCancel={this.onCancel.bind(this)}
            onClear={this.onCancel.bind(this)}
          />
          <Text onPress={this.fetchOrderList}
                style={{textAlign: 'center', width: 52, fontSize: 14, color: colors.main_color}}> 搜索 </Text>
        </View>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 9,
          paddingTop: 3,
          paddingHorizontal: 8,
          justifyContent: "flex-start",
          flexWrap: "wrap"
        }}>
          <For index='index' each='info' of={item_list}>
            <TouchableOpacity onPress={() => {
              this.setState({
                keyword_type: Number(info.value) === keyword_type ? 0 : Number(info.value)
              }, () => {
                tool.debounces(() => {
                  this.onRefresh()
                })
              })
            }} key={index} style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 36,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginTop: 6,
              marginHorizontal: 4,
              borderRadius: 15,
              backgroundColor: Number(info.value) === keyword_type ? '#DFFAE2' : colors.f5,
            }}>
              <Text style={{
                fontSize: 13,
                color: Number(info.value) === keyword_type ? colors.main_color : colors.color666,
              }}> {info.label} </Text>
            </TouchableOpacity>
          </For>
        </View>
      </View>
    )
  }


  renderFinishDeliveryModal = () => {
    let {show_finish_delivery_modal} = this.state;
    return (
      <View>
        <AlertModal
          visible={show_finish_delivery_modal}
          onClose={this.closeModal}
          onPressClose={this.closeModal}
          onPress={() => this.toSetOrderComplete()}
          title={'当前配送确认完成吗?'}
          desc={'订单送达后无法撤回，请确认顾客已收到货物'}
          actionText={'确定'}
          closeText={'再想想'}/>
      </View>
    )
  }

  onEndReached = () => {
    let {query, is_can_load_more} = this.state;
    if (is_can_load_more) {
      this.setState({is_can_load_more: false}, () => {
        if (query?.is_add) {
          this.fetchOrderList(0);
        } else {
          ToastShort('已经到底部了')
        }
      })
    }
  }
  onMomentumScrollBegin = () => {
    this.setState({is_can_load_more: true})
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  renderBottomView = () => {
    let {query, list} = this.state;
    if (query?.is_add || tool.length(list) < 3) {
      return <View/>
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10}}>
        <Text style={{fontSize: 14, color: colors.color999}}> 已经到底了～ </Text>
      </View>
    )
  }


  renderItem = (order) => {
    let {item, index} = order;
    let {accessToken} = this.props.global
    return (
      <OrderItem showBtn={item?.show_button_list}
                 key={index}
                 fetchData={() => this.onRefresh()}
                 item={item}
                 accessToken={accessToken}
                 navigation={this.props.navigation}
                 setState={this.setState.bind(this)}
                 openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
                 openFinishDeliveryModal={this.openFinishDeliveryModal.bind(this)}
                 order_status={0}
      />
    );
  }

  renderNoOrder = () => {
    let {keyword, is_loading} = this.state;
    return (
      <View style={styles.noOrderContent}>
        <If condition={!is_loading}>
          <SvgXml style={{marginBottom: 10}} xml={empty_order()}/>
          <If condition={tool.length(keyword) > 0}>
            <Text style={styles.noOrderDesc}> 未查询到订单 </Text>
            <Text style={styles.noOrderDesc}> 目前只支持查询近90天内订单查询 </Text>
          </If>
          <If condition={tool.length(keyword) <= 0}>
            <Text style={styles.noOrderDesc}> 搜索支持如下类型关键词 </Text>
            <Text style={styles.noOrderDesc}> 订单号、流水号、手机号及尾号后4位； </Text>
            <Text style={styles.noOrderDesc}> 骑手姓名、商品名、收件地址等 </Text>
          </If>
        </If>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 86,
  },
  noOrderDesc: {flex: 1, fontSize: 15, color: colors.color999, lineHeight: 21},
});


export default connect(mapStateToProps, mapDispatchToProps)(SearchOrder)
