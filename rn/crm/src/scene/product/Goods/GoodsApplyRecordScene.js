import React, {Component} from "react";
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {fetchApplyRocordList} from "../../../reducers/product/productActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import Cts from "../../../pubilc/common/Cts";
import Config from "../../../pubilc/common/config";

import {Dialog} from "../../../weui";
import * as tool from "../../../pubilc/util/tool";
import {Button1} from "../../common/component/All";
//请求
import {getWithTpl} from "../../../pubilc/util/common";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";

import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchApplyRocordList,
        ...globalActions
      },
      dispatch
    )
  };
}

class GoodsApplyRecordScene extends Component {
  constructor(props) {
    super(props);
    const {is_service_mgr = false} = tool.vendor(this.props.global)
    this.state = {
      audit_status: Cts.AUDIT_STATUS_WAIT,
      list: [],
      query: true,
      pullLoading: false,
      total_page: 1,
      curr_page: 1,
      refresh: false,
      onSendingConfirm: true,
      dialog: false,
      selectedItem: {},
      shouldShowModal: false,
      setPrice: '',
      isKf: is_service_mgr
    };
    this.tab = this.tab.bind(this);
    this.getApplyList = this.getApplyList.bind(this);

    showModal('加载中')
  }

  UNSAFE_componentWillMount() {
    this.initData()
  }

  initData() {
    let {viewStoreId} = this.props.route.params;
    let storeId = this.props.global.currStoreId;
    if (viewStoreId) {
      storeId = viewStoreId;
    }
    this.setState({viewStoreId: storeId, refresh: true}, () => this.getApplyList(1));
  }

  tab(num) {
    if (num != this.state.audit_status) {
      showModal('加载中')
      this.setState({query: true, audit_status: num, list: [], refresh: true}, () => {
        this.getApplyList(1);
      });
    }
  }

  openPriceAdjustmentModal(item) {
    this.setState({
      selectedItem: item,
      shouldShowModal: true,
      setPrice: parseFloat(item.apply_price / 100).toFixed(2)
    })
  }

  tips(msg) {
    this.setState({dialog: true, errMsg: msg});
  }

  getApplyList(page) {
    let pullLoading = this.state.pullLoading;
    if (pullLoading) {
      return false;
    }
    showModal('加载中')
    let store_id = this.state.viewStoreId;
    let audit_status = this.state.audit_status;
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(
      fetchApplyRocordList(store_id, audit_status, page, token, async resp => {
        if (resp.ok) {
          let {total_page, audit_list} = resp.obj;
          let arrList;
          if (this.state.refresh) {
            arrList = audit_list;
          } else {
            arrList = this.state.list.concat(audit_list);
          }
          this.setState({
            list: arrList,
            total_page: total_page,
            curr_page: page
          });
        } else {
        }
        hideModal()
        this.setState({pullLoading: false, refresh: false, query: false});
      })
    );
  }

  renderTitle() {
    if (this.state.list.length > 0) {
      return (
        <View style={styles.title}>
          <Text style={[styles.title_text, {flex: 1}]}>图片</Text>
          <Text style={[styles.title_text, {flex: 3}]}>商品名称</Text>
          <Text style={[styles.title_text, {flex: 1}]}>原价</Text>
          <Text style={[styles.title_text, {flex: 1}]}>调整价</Text>
        </View>
      );
    } else {
      return <View/>;
    }
  }

  jumpToGoodDetail = (store_id, audit_status, product_id, apply_price) => {
    if (audit_status !== Cts.AUDIT_STATUS_FAILED) {
      this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
        pid: product_id,
        storeId: store_id,
        updatedCallback: (pid, prodFields, spFields) => {
          if (typeof spFields.applying_price !== 'undefined') {
            apply_price = spFields.applying_price
          }
        },
      });
    }
  }

  approvedPrice = (id) => {
    let url = `api/store_audit_action/${id}/yes?access_token=${this.props.global.accessToken}`;
    getWithTpl(url, json => {
        if (json.ok || json.ok === null) {
          ToastLong("成功通过!");
          this.setState({
              query: true,
              audit_status: Cts.AUDIT_STATUS_WAIT,
              list: []
            },
            () => {
              this.getApplyList(1);
            }
          );
        } else {
          ToastLong(json.reason);
        }
      },
      () => {
        ToastLong("失败!");
      }
    );
  }

  refusePrice = (id) => {
    let url = `api/store_audit_action/${id}/no?access_token=${this.props.global.accessToken}`;
    getWithTpl(
      url,
      json => {
        if (json.ok || json.ok === null) {
          ToastLong("已拒绝!");
          showModal('加载中')
          this.setState({
              query: true,
              audit_status: Cts.AUDIT_STATUS_WAIT,
              list: []
            },
            () => {
              this.getApplyList(1);
            }
          );
        } else {
          ToastLong(json.reason);
        }
      },
      () => {
        ToastLong("失败!");
      }
    );
  }

  renderItem = (item) => {
    const {
      audit_status, auto_reject_time, product_id, store_id, apply_price, cover_img, product_name, created, before_price,
      audit_desc, remark, lower, upper, id
    } = item.item
    return (
      <View style={styles.listItemWrap}>
        <TouchableOpacity onPress={() => this.jumpToGoodDetail(store_id, audit_status, product_id, apply_price)}>
          <View>
            <View style={[styles.item, {flexDirection: 'row',}]}>
              <View style={[styles.center, styles.image, {flex: 1}]}>
                <Image
                  style={{height: pxToDp(90), width: pxToDp(90)}}
                  source={{uri: cover_img}}
                />
              </View>
              <View style={[styles.goods_name, {flex: 3}]}>
                <View style={styles.name_text}>
                  <Text numberOfLines={2}>{product_name} </Text>
                </View>
                <Text style={styles.name_time}>
                  #{product_id} {tool.orderExpectTime(created)}
                </Text>
              </View>
              <View style={[styles.center, styles.original_price, {flex: 1}]}>
                <Text style={styles.price_text}>
                  {(before_price / 100).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.center, {flex: 1}]}>
                <Text style={styles.price_text}>
                  {(apply_price / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <If condition={this.state.audit_status === Cts.AUDIT_STATUS_FAILED}>
          <View>
            <View style={{flexDirection: "row", flex: 1}}>
              <View style={{marginLeft: 15}}>
                <Text style={{color: colors.color666, fontSize: 12}}>理由：<Text
                  style={{color: 'red'}}>{audit_desc === 'other' ? remark : audit_desc} </Text></Text>
              </View>
            </View>
            <View style={{flexDirection: "row", margin: 5}}>
              <View style={{flex: 4}}></View>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 5,
                  backgroundColor: '#72AF73'
                }}
                onPress={() => this.openPriceAdjustmentModal(item.item)}>
                <Text style={{color: 'white'}}>重新报价</Text>
              </TouchableOpacity>
            </View>
          </View>
        </If>
        <If condition={this.state.isKf && this.state.audit_status === Cts.AUDIT_STATUS_WAIT}>
          <View style={styles.statusWaitWrap}>
            <View style={{width: pxToDp(90), justifyContent: "center", alignItems: "center"}}>
              <Text style={[{backgroundColor: auto_reject_time ? "mediumseagreen" : "#fff"}, styles.controlStatus]}>
                控
              </Text>
            </View>
            <If condition={lower > 0}>
              <Text style={{width: pxToDp(240)}}>
                [{`${(lower / 100).toFixed(2)} - ${(upper / 100).toFixed(2)}`}]
              </Text>
            </If>
            <If condition={lower <= 0}>
              <Text style={{width: pxToDp(240)}}>无参考价</Text>
            </If>
            <Button1 t="通过" w={pxToDp(110)} h={pxToDp(60)} onPress={() => this.approvedPrice(id)} mgt={0}/>
            <Button1 t="拒绝" w={pxToDp(110)} h={pxToDp(60)} mgt={0} onPress={() => this.refusePrice(id)}/>
          </View>
        </If>
      </View>
    );
  }

  renderList() {
    return (
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        style={{flex: 1}}
        data={this.state.list}
        renderItem={this.renderItem}
        onEndReachedThreshold={0.5}
        onEndReached={this.onEndReached}
        ListFooterComponent={() => {
          return <View/>;
        }}
        ListEmptyComponent={this.renderEmpty()}
        refreshing={false}
        onRefresh={this.onRefresh}
      />
    );
  }

  onEndReached = () => {
    let {curr_page, total_page} = this.state;
    curr_page = parseInt(curr_page);
    total_page = parseInt(total_page);
    if (curr_page < total_page) {
      curr_page = curr_page + 1;
      this.setState({pullLoading: true});
      this.getApplyList(curr_page);
    }
  }

  onRefresh = async () => {
    showModal('加载中')
    this.setState({query: true, refresh: true});
    this.getApplyList(1);
  }

  renderEmpty(str = "没有相关记录") {
    if (!this.state.query) {
      return (
        <View style={{alignItems: "center", justifyContent: "center", flex: 1, marginTop: pxToDp(200)}}>
          <FontAwesome5 name={'file-signature'} size={52} color={colors.color999}/>
          <Text style={{fontSize: pxToDp(24), color: "#bababa", marginTop: pxToDp(30)}}>
            {str}
          </Text>
        </View>
      );
    }
  }

  buttons = [
    {
      type: "default",
      label: "确定",
      onPress: () => this.setState({dialog: false})
    }
  ]

  render() {
    const {audit_status, dialog, shouldShowModal, selectedItem, errMsg} = this.state
    return (
      <View style={{flex: 1}}>
        <View style={styles.tab}>
          <TouchableOpacity onPress={() => this.tab(Cts.AUDIT_STATUS_WAIT)}>
            <Text style={audit_status === Cts.AUDIT_STATUS_WAIT ? styles.active : styles.fontStyle}>
              审核中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.tab(Cts.AUDIT_STATUS_PASSED)}>
            <Text style={audit_status === Cts.AUDIT_STATUS_PASSED ? styles.active : styles.fontStyle}>
              已审核
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.tab(Cts.AUDIT_STATUS_FAILED)}>
            <Text style={audit_status === Cts.AUDIT_STATUS_FAILED ? styles.active : styles.fontStyle}>
              未通过
            </Text>
          </TouchableOpacity>
        </View>
        {this.renderTitle()}
        {this.renderList()}
        <If condition={shouldShowModal}>
          <GoodItemEditBottom pid={Number(selectedItem.product_id)} modalType={'update_apply_price'}
                              productName={selectedItem.product_name}
                              strictProviding={false}
                              accessToken={this.props.global.accessToken}
                              beforePrice={Number(selectedItem.before_price)}
                              storeId={Number(selectedItem.store_id)}
                              storePro={selectedItem.product ? selectedItem.product : {}}
                              currStatus={Number(selectedItem.status)}
                              doneProdUpdate={this.doneProdUpdate}
                              onClose={this.onClose}
                              applyingPrice={Number(selectedItem.apply_price)} spId={0}/>
        </If>
        <Dialog visible={dialog} buttons={this.buttons}>
          <Text>{errMsg} </Text>
        </Dialog>
      </View>
    );
  }

  onClose = () => {
    this.setState({
      shouldShowModal: false,
      selectedItem: {}
    })
  }
  doneProdUpdate = () => {
    this.setState({
      shouldShowModal: false,
      selectedItem: {}
    })
    this.initData()
  }
}


const styles = StyleSheet.create({
  controlStatus: {
    color: "#fff",
    fontSize: pxToDp(30),
    borderRadius: 2,
    width: pxToDp(45),
    height: pxToDp(45),
    alignItems: "center",
    textAlign: "center",
    lineHeight: pxToDp(45),
    justifyContent: "center"
  },
  statusWaitWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: pxToDp(30),
    paddingBottom: pxToDp(15),
    backgroundColor: colors.white
  },
  listItemWrap: {
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#e0e0e0',
    backgroundColor: colors.white
  },
  tab: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: colors.white,
    height: pxToDp(90),
    flexDirection: "row",
    justifyContent: "space-around"
  },
  fontStyle: {
    fontSize: pxToDp(28),
    marginTop: pxToDp(20),
    color: '#b2b2b2'
  },
  active: {
    color: '#58C587',
    fontSize: pxToDp(28),
    marginTop: pxToDp(20),
    borderBottomWidth: pxToDp(3),
    borderBottomColor: '#58C587',
    paddingBottom: pxToDp(20)
  },
  title: {
    height: pxToDp(55),
    paddingHorizontal: pxToDp(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#e0e0e0'
  },
  title_text: {
    fontSize: pxToDp(24),
    width: pxToDp(90),
    textAlign: "center"
  },
  item: {
    paddingHorizontal: pxToDp(30),
    // height: pxToDp(140),
    paddingVertical: pxToDp(15),
    flexDirection: "row",
    justifyContent: "space-between",

    alignItems: "center"
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    height: pxToDp(100)
  },
  image: {
    width: pxToDp(90),
    height: "100%",
    flexDirection: "row",
    alignItems: "center"
  },
  goods_name: {
    width: pxToDp(240),
    height: pxToDp(100)
  },
  original_price: {},
  price: {
    width: pxToDp(120)
  },
  price_text: {
    color: "#ff0000",
    fontSize: pxToDp(30)
  },
  name_text: {
    width: "100%",
    minHeight: pxToDp(70)
  },
  name_time: {
    fontSize: pxToDp(18),
    color: '#b2b2b2'
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(GoodsApplyRecordScene)
