import React, {PureComponent} from "react";
import {View, StyleSheet, Dimensions, TouchableOpacity, Text, FlatList, ImageBackground} from 'react-native'
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import {Badge} from "react-native-elements";
import FastImage from "react-native-fast-image";
import AlertModal from "../../../pubilc/component/AlertModal";
import {If} from "babel-plugin-jsx-control-statements/components";
import {SvgXml} from "react-native-svg";
import {no_message} from "../../../svg/svg";
import Config from "../../../pubilc/common/config";

const {width} = Dimensions.get('window')
const styles = StyleSheet.create({
  approvalRejection: {
    backgroundColor: colors.f5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    width: (width - 2 * 28) / 2,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectApprovalRejection: {
    backgroundColor: colors.main_color,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    width: (width - 2 * 28) / 2,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },

  selectTabText: {fontSize: 14, fontWeight: '500', color: colors.white, lineHeight: 20},
  selectPlatformNotSale: {
    backgroundColor: colors.main_color,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    width: (width - 2 * 28) / 2,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  platformNotSale: {
    backgroundColor: colors.f5,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    width: (width - 2 * 28) / 2,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {fontSize: 14, color: colors.color666, lineHeight: 20},
  selectHeaderWrap: {borderBottomColor: colors.main_color, borderBottomWidth: 2},
  selectHeaderText: {fontSize: 14, fontWeight: '500', color: colors.main_color, paddingVertical: 10},
  headerWrap: {backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'space-around'},
  headerText: {fontSize: 14, fontWeight: '400', color: colors.color666, paddingVertical: 10},
  itemWrap: {
    backgroundColor: colors.white,
    borderRadius: 6,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 10
  },
  itemHeaderWrap: {flexDirection: 'row', alignItems: 'center'},
  statusTabBadge: {position: 'absolute', top: 1, right: -20},
  childrenTabBadge: {position: 'absolute', top: 0, right: 40},
  imgWrap: {width: 80, height: 80, borderRadius: 4},
  saleWrap: {
    position: 'absolute',
    height: 20,
    width: 80,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  saleText: {fontSize: 14, color: colors.white, opacity: 1},
  cannotSaleText: {fontSize: 14, color: '#FF2200', opacity: 1},
  itemBottomBtnWrap: {flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15},
  itemBtnWrap: {borderRadius: 18, borderWidth: 0.5, borderColor: colors.color999, marginLeft: 10},
  itemBtnText: {fontSize: 14, color: colors.color333, paddingHorizontal: 18, paddingVertical: 8},
  itemProductName: {fontSize: 14, fontWeight: '500', color: colors.color333},
  reviewProgressWrap: {flexDirection: 'row', backgroundColor: colors.f5, borderRadius: 4, padding: 10, marginTop: 10},
  failWrap: {backgroundColor: colors.f5, borderRadius: 4, padding: 10, marginTop: 10},
  childrenTabZoneWarp: {backgroundColor: colors.white, paddingVertical: 12},
  childrenTabWrap: {flexDirection: 'row', alignItems: 'center', marginHorizontal: 28},
  tipWrap: {backgroundColor: '#FFF1E3'},
  tipText: {fontSize: 12, color: '#FF862C', paddingLeft: 12, paddingVertical: 7},
  center: {flex: 1, alignItems: 'center', marginTop: 80},
  notHasGoodsDesc: {
    fontSize: 15,
    marginTop: 9,
    color: colors.color999
  },
  notHasMoreInfo: {paddingVertical: 10, fontSize: 14, color: colors.color999, textAlign: 'center'}
})

const HEADER_DATA = [
  {
    label: '审核中',
    value: 'in_audit'
  },
  {
    label: '未通过',
    value: 'no_pass_audit'
  },
  {
    label: '已通过',
    value: 'pass_audit'
  },
  {
    label: '失败',
    value: 'fail_audit'
  },
]
let sale_status = ''

class GoodsAuditScene extends PureComponent {

  state = {
    selectTabKey: 'in_audit',
    page: 1,
    isLastPage: false,
    isLoading: false,
    isCanLoadMore: false,
    pageSize: 10,
    goods_status_number: {},
    list: [],
    visible: false,
    id: 0,
    hasGoodsResult: false
  }

  componentDidMount() {
    this.getBadge()
    this.getList()
  }

  getList = () => {
    const {accessToken, store_id} = this.props.global
    const {selectTabKey, page, pageSize} = this.state
    const url = `v1/new_api/store_product/product_audit_list/${store_id}/${selectTabKey}/${page}/${pageSize}?access_token=${accessToken}`
    HttpUtils.get(url).then(res => {
      const {lists = [], isLastPage = false} = res
      this.setState({
        list: lists,
        isLastPage: isLastPage,
        hasGoodsResult: !lists.length
      })
    }).catch(() => {
      this.setState({hasGoodsResult: true})
    })
  }
  getBadge = () => {
    const {accessToken, store_id} = this.props.global
    const url = `v1/new_api/store_product/product_audit_count/${store_id}/?access_token=${accessToken}`
    HttpUtils.get(url).then(res => {
      this.setState({goods_status_number: res})
    })
  }
  renderNotPassedChildCategory = () => {
    const {selectTabKey, goods_status_number} = this.state
    if (selectTabKey === 'no_pass_audit' || selectTabKey === 'no_sale')
      return (
        <View style={styles.childrenTabZoneWarp}>
          <View style={styles.childrenTabWrap}>
            <TouchableOpacity onPress={() => this.setTab('no_pass_audit')}
                              style={selectTabKey === 'no_pass_audit' ? styles.selectApprovalRejection : styles.approvalRejection}>
              <Text style={selectTabKey === 'no_pass_audit' ? styles.selectTabText : styles.tabText}>
                审核驳回
              </Text>
              <Badge value={goods_status_number.no_pass_audit} status="error" containerStyle={styles.childrenTabBadge}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setTab('no_sale')}
                              style={selectTabKey === 'no_sale' ? styles.selectPlatformNotSale : styles.platformNotSale}>
              <Text style={selectTabKey === 'no_sale' ? styles.selectTabText : styles.tabText}>
                平台禁售
              </Text>
              <Badge value={goods_status_number.no_sale} status="error" containerStyle={styles.childrenTabBadge}/>
            </TouchableOpacity>
          </View>
        </View>
      )
  }

  setTab = (value) => {
    this.setState({selectTabKey: value, page: 1}, () => {
      this.listRef.scrollToIndex({animated: true, index: 0})
      this.getList()
    })
  }
  renderHeader = () => {
    const {selectTabKey, goods_status_number} = this.state
    return (
      <View style={styles.headerWrap}>
        {
          HEADER_DATA.map((item, index) => {
            const isSelect = selectTabKey === item.value || selectTabKey === 'no_sale' && item.value === 'no_pass_audit'
            return (
              <TouchableOpacity key={index}
                                style={isSelect ? styles.selectHeaderWrap : {}}
                                onPress={() => this.setTab(item.value)}>
                <Text style={isSelect ? styles.selectHeaderText : styles.headerText}>
                  {item.label}
                </Text>
                <Badge value={goods_status_number[item.value]} status="error" containerStyle={styles.statusTabBadge}/>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )

  }

  deleteGoods = (id) => {
    const {store_id} = this.props.global
    const url = `/v1/new_api/store_product/del_store_pro/${store_id}/${id}`
    HttpUtils.get(url, {}, false, true).then((res) => {
      showSuccess(`${res.reason}`)
    }, error => {
      showError(error.reason)
    })
  }

  jumpToGoodsEdit = (id) => {
    let {navigation, global} = this.props;
    const {store_id, accessToken, vendor_id} = global
    const url = `/api/get_product_detail/${id}/${vendor_id}/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: 'edit', product_detail: res});
    })

  }

  renderItem = ({item}) => {
    const {
      pname, coverimg, utime, platform, es_name, quality_audit, compliance_audit, is_sale, id, comment, suggest
    } = item
    const {selectTabKey} = this.state
    switch (is_sale) {
      case -1:
        sale_status = ''
        break
      case 0:
        sale_status = '不可售'
        break
      case 1:
        sale_status = '可售'
        break
      case 2:
        sale_status = '修改后可售'
        break
    }
    const {vendor_info} = this.props.global
    return (
      <View style={styles.itemWrap}>
        <View style={styles.itemHeaderWrap}>
          <View style={{justifyContent: 'flex-end'}}>
            <FastImage style={styles.imgWrap}
                       source={{uri: coverimg}}
                       resizeMode={FastImage.resizeMode.contain}/>
            <If condition={sale_status}>
              <View style={styles.saleWrap}>
                <Text style={is_sale === 0 ? styles.cannotSaleText : styles.saleText}>
                  {sale_status}
                </Text>
              </View>
            </If>
          </View>
          <View style={{paddingLeft: 8}}>
            <Text style={styles.itemProductName} numberOfLines={2}>
              {pname}
            </Text>
            <Text style={{fontSize: 12, color: colors.color666, lineHeight: 17}}>
              审核时间：{utime}
            </Text>
            <Text style={{fontSize: 12, color: colors.color666, lineHeight: 17, paddingTop: 4}}>
              平台门店：[{platform}] {es_name}
            </Text>
          </View>
        </View>
        <If condition={selectTabKey === 'in_audit'}>
          <View style={styles.reviewProgressWrap}>
            <Text style={{fontSize: 14, color: colors.color999}}>审核进度：</Text>
            <View>
              <Text style={{fontSize: 14, color: quality_audit === '进行中' ? colors.main_color : colors.color333}}>
                信息质量审核 {quality_audit}
              </Text>
              <Text style={{
                fontSize: 14,
                color: compliance_audit === '进行中' ? colors.main_color : colors.color333,
                paddingTop: 10
              }}>
                信息合规审核 {compliance_audit}
              </Text>
            </View>
          </View>
        </If>
        <If condition={selectTabKey === 'no_pass_audit' || selectTabKey === 'no_sale' || selectTabKey === 'pass_audit'}>
          <View style={styles.reviewProgressWrap}>
            <Text style={{fontSize: 14, color: colors.color999}}>审核结果：</Text>
            <Text style={{fontSize: 14, color: colors.color333}}>
              {comment}
            </Text>
          </View>
        </If>
        <If condition={selectTabKey === 'fail_audit'}>
          <View style={styles.failWrap}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 14, color: colors.color999}}>失败原因：</Text>
              <Text style={{fontSize: 14, color: colors.color333}}>
                {comment}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 10}}>
              <Text style={{fontSize: 14, color: colors.color999}}>失败原因：</Text>
              <Text style={{fontSize: 14, color: colors.color333}}>
                {suggest}
              </Text>
            </View>
          </View>
        </If>
        <If condition={selectTabKey === 'in_audit' || selectTabKey === 'no_pass_audit' || selectTabKey === 'no_sale'}>
          <View style={styles.itemBottomBtnWrap}>
            <TouchableOpacity style={styles.itemBtnWrap} onPress={() => this.setModal(true, id)}>
              <Text style={styles.itemBtnText}>
                删除商品
              </Text>
            </TouchableOpacity>
            <If condition={vendor_info?.allow_merchants_edit_prod == 1}>
              <TouchableOpacity style={styles.itemBtnWrap} onPress={() => this.jumpToGoodsEdit(id)}>
                <Text style={styles.itemBtnText}>
                  {selectTabKey === 'in_audit' ? '编辑商品' : '立即修改'}
                </Text>
              </TouchableOpacity>
            </If>

          </View>
        </If>

      </View>
    )
  }

  onScrollBeginDrag = () => {
    this.setState({isCanLoadMore: true})
  }
  onLoadMore = () => {
    let {page, isLastPage, isLoading, isCanLoadMore} = this.state
    if (!isCanLoadMore || isLoading)
      return;
    if (isLastPage) {
      showError('没有更多商品')
      this.setState({isCanLoadMore: false})
      return
    }
    this.setState({page: page + 1, isLoading: true, isCanLoadMore: false}, () => this.search())
  }
  renderList = () => {
    const {list, hasGoodsResult} = this.state
    if (list.length > 0)
      return (
        <FlatList data={list}
                  ref={ref => this.listRef = ref}
                  renderItem={this.renderItem}
                  keyExtractor={(item, index) => `${index}`}
                  initialNumToRender={5}
                  onScrollBeginDrag={this.onScrollBeginDrag}
                  ListFooterComponent={this.renderNotMoreInfo()}
                  onEndReachedThreshold={0.2}
                  onEndReached={this.onLoadMore}/>
      )

    return (
      <If condition={hasGoodsResult}>
        <View style={styles.center}>
          <SvgXml xml={no_message()}/>
          <Text style={styles.notHasGoodsDesc}>
            暂无数据
          </Text>
        </View>

      </If>

    )
  }

  renderTip = () => {
    const {selectTabKey} = this.state
    if (selectTabKey === 'fail_audit')
      return (
        <View style={styles.tipWrap}>
          <Text style={styles.tipText}>
            首次创建因为平台规则或其他原因，平台创建失败的商品
          </Text>
        </View>
      )
    return null
  }

  setModal = (visible, id) => {
    this.setState({visible: visible, id: id})
  }
  renderModal = () => {
    const {visible} = this.state
    return (
      <AlertModal
        visible={visible}
        onClose={() => this.setModal(false, 0)}
        onPress={() => this.deleteGoods()}
        title={'是否删除商品'}
        desc={'商品将会从当门店和关联外卖门店中删除'}
        actionText={'确定'}
        closeText={'取消'}
        onPressClose={() => this.setModal(false, 0)}/>
    )
  }

  renderNotMoreInfo = () => {
    const {isLastPage} = this.state
    if (isLastPage)
      return (
        <Text style={styles.notHasMoreInfo}>
          没有更多了~
        </Text>
      )
    return null
  }

  render() {
    return (
      <>
        {this.renderHeader()}
        {this.renderNotPassedChildCategory()}
        {this.renderTip()}
        {this.renderList()}
        {this.renderModal()}

      </>
    )
  }
}

const mapStateToProps = ({global}) => ({global: global})
export default connect(mapStateToProps)(GoodsAuditScene)
