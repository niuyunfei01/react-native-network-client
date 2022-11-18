import React, {Component} from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FastImage from "react-native-fast-image";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {fetchApplyRocordList} from "../../../reducers/product/productActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import Cts from "../../../pubilc/common/Cts";
import Config from "../../../pubilc/common/config";

import * as tool from "../../../pubilc/util/tool";
//请求
import {getWithTpl} from "../../../pubilc/util/common";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";

import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";

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
      auditStatus: Cts.AUDIT_STATUS_WAIT,
      list: [],
      query: true,
      pullLoading: false,
      total_page: 1,
      curr_page: 1,
      refresh: false,
      onSendingConfirm: true,
      selectedItem: {},
      shouldShowModal: false,
      setPrice: '',
      isKf: is_service_mgr
    };


  }

  componentDidMount() {
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

  tab = (num) => {
    if (num !== this.state.auditStatus) {
      showModal('加载中')
      this.setState({query: true, auditStatus: num, list: [], refresh: true}, () => {
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

  getApplyList = (page) => {
    let {pullLoading, auditStatus, viewStoreId, list, refresh} = this.state;
    if (pullLoading) {
      return false;
    }
    showModal('加载中')
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(
      fetchApplyRocordList(viewStoreId, auditStatus, page, accessToken, async resp => {
        if (resp.ok) {
          let {total_page, audit_list = []} = resp.obj;
          this.setState({
            list: refresh ? audit_list : list.concat(audit_list),
            total_page: total_page,
            curr_page: page
          });
        }
        hideModal()
        this.setState({pullLoading: false, refresh: false, query: false});
      })
    );
  }

  renderTitle() {
    if (tool.length(this.state.list) > 0) {
      return (
        <View style={styles.title}>
          <Text style={[styles.title_text, {flex: 1}]}>图片</Text>
          <Text style={[styles.title_text, {flex: 3, marginLeft: 8}]}>商品名称</Text>
          <Text style={[styles.title_text, {flex: 1}]}>原价</Text>
          <Text style={[styles.title_text, {flex: 1}]}>调价</Text>
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
              auditStatus: Cts.AUDIT_STATUS_WAIT,
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
              auditStatus: Cts.AUDIT_STATUS_WAIT,
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

  renderItem = ({item}) => {
    const {
      audit_status, auto_reject_time, product_id, store_id, apply_price, cover_img, product_name, created, before_price,
      audit_desc, remark, lower, upper, id
    } = item
    const {auditStatus, isKf} = this.state
    return (
      <View style={styles.listItemWrap}>
        <TouchableOpacity style={[styles.item, {flexDirection: 'row',}]}
                          onPress={() => this.jumpToGoodDetail(store_id, audit_status, product_id, apply_price)}>
          <FastImage style={{height: 56, width: 56, borderRadius: 5, flex: 1}}
                     source={{uri: cover_img}}
                     resizeMode={FastImage.resizeMode.contain}
          />
          <View style={{flex: 3, marginLeft: 8}}>

            <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.name_text}>
              {/*<View style={styles.shanWrap}><Text style={styles.shanText}>美</Text></View> <View style={styles.shanWrap}><Text style={styles.shanText}>闪</Text></View> <View*/}
              {/*style={styles.eWrap}><Text style={styles.eText}>饿</Text></View> <View style={styles.huoWrap}><Text*/}
              {/*style={styles.huoText}>活</Text></View> */}{product_name}
            </Text>
            <Text style={styles.name_time}>
              #{product_id} {tool.fullDateOther(created)}
            </Text>
          </View>
          <View style={[styles.center, {flex: 1}]}>
            <Text style={styles.price_text}>
              {(before_price / 100).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.center, {flex: 1, flexDirection: 'row', alignItems: 'center'}]}>
            <Text style={styles.price_text}>
              {(apply_price / 100).toFixed(2)}
            </Text>
            {
              parseFloat(apply_price / 100) >= parseFloat(before_price / 100) ?
                <AntDesign name={'arrowup'} color={'#FF0000'}/> :
                <AntDesign name={'arrowdown'} color={'#26B942'}/>
            }
          </View>
        </TouchableOpacity>
        <If condition={auditStatus === Cts.AUDIT_STATUS_FAILED}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={{marginLeft: 15, color: colors.color999, fontSize: 12, width: '62%'}}>理由：
              <Text style={{color: '#FF8309'}}>
                {audit_desc === 'other' ? remark : audit_desc}
              </Text>
            </Text>
            <TouchableOpacity style={{backgroundColor: '#E4FFE7', borderRadius: 15, marginRight: 12}}
                              onPress={() => this.openPriceAdjustmentModal(item)}>
              <Text style={{color: '#26B942', fontSize: 14, paddingVertical: 5, paddingHorizontal: 14}}>
                重新报价
              </Text>
            </TouchableOpacity>
          </View>
        </If>
        <If condition={isKf && auditStatus === Cts.AUDIT_STATUS_WAIT}>
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
            <TouchableOpacity style={{backgroundColor: '#E4FFE7', borderRadius: 15}}
                              onPress={() => this.approvedPrice(id)}>
              <Text style={{color: '#26B942', fontSize: 14, paddingVertical: 5, paddingHorizontal: 20}}>
                通过
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor: '#FFE4E0', borderRadius: 15}}
                              onPress={() => this.refusePrice(id)}>
              <Text style={{color: '#FF2200', fontSize: 14, paddingVertical: 5, paddingHorizontal: 20}}>
                拒绝
              </Text>
            </TouchableOpacity>
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
        onEndReachedThreshold={0.2}
        initialNumToRender={9}
        onEndReached={this.onEndReached}
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

  render() {
    const {auditStatus, shouldShowModal, selectedItem} = this.state
    return (
      <View style={{flex: 1}}>
        <View style={styles.tab}>
          <TouchableOpacity style={auditStatus === Cts.AUDIT_STATUS_WAIT ? styles.activeWrap : {}}
                            onPress={() => this.tab(Cts.AUDIT_STATUS_WAIT)}>
            <Text style={auditStatus === Cts.AUDIT_STATUS_WAIT ? styles.active : styles.fontStyle}>
              审核中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={auditStatus === Cts.AUDIT_STATUS_PASSED ? styles.activeWrap : {}}
                            onPress={() => this.tab(Cts.AUDIT_STATUS_PASSED)}>
            <Text style={auditStatus === Cts.AUDIT_STATUS_PASSED ? styles.active : styles.fontStyle}>
              已审核
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={auditStatus === Cts.AUDIT_STATUS_FAILED ? styles.activeWrap : {}}
                            onPress={() => this.tab(Cts.AUDIT_STATUS_FAILED)}>
            <Text style={auditStatus === Cts.AUDIT_STATUS_FAILED ? styles.active : styles.fontStyle}>
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
    paddingLeft: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    backgroundColor: colors.white
  },
  tab: {
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  fontStyle: {
    fontSize: 14,
    paddingVertical: 10,
    color: colors.color666
  },
  activeWrap: {borderBottomColor: '#26B942', borderBottomWidth: 2},
  active: {
    color: '#58C587',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 10
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title_text: {paddingVertical: 8, fontSize: 12, color: colors.color999, textAlign: "center"},
  titleGoodsName: {paddingVertical: 8, fontSize: 12, color: colors.color999,},
  item: {flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  center: {justifyContent: "center", alignItems: "center",},
  image: {width: pxToDp(90), height: "100%", flexDirection: "row", alignItems: "center"},

  price_text: {fontWeight: 'bold', color: colors.color333, fontSize: 13},
  shanWrap: {
    backgroundColor: '#FFD225',
    borderRadius: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shanText: {
    // width: 14,
    // height: 14,
    fontSize: 11,
    color: colors.color333,
    // backgroundColor: '#FFD225',
    // paddingTop: 2,
    // paddingLeft: 2,
    // paddingBottom: 1,
    // paddingRight: 1
  },
  eWrap: {
    backgroundColor: '#0292FE',
    borderRadius: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  eText: {
    // width: 14,
    // height: 14,
    fontSize: 11,
    color: colors.white,
    // backgroundColor: '#0292FE',
    // paddingTop: 2,
    // paddingRight: 2,
    // paddingLeft: 1,
    // paddingBottom: 1
  },
  huoWrap: {
    backgroundColor: '#FF8309',
    borderRadius: 2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  huoText: {

    fontSize: 11,
    color: colors.white,
    // backgroundColor: '#FF8309',
    // paddingLeft: 1,
    // paddingBottom: 1,
    // paddingTop: 2,
    // paddingRight: 2
  },

  name_text: {height: 36, fontSize: 13, color: '#1A1614', lineHeight: 18},
  name_time: {fontSize: 11, color: colors.color999}
});
export default connect(mapStateToProps, mapDispatchToProps)(GoodsApplyRecordScene)
