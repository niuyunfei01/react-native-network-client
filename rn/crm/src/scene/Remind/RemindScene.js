import React from 'react'
import ReactNative from 'react-native'
import {Tabs} from '@ant-design/react-native';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Alias from './Alias';
import LoadingView from '../../widget/LoadingView';
import {ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import ModalDropdown from 'react-native-modal-dropdown';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import RNButton from '../../widget/RNButton';
import Config from '../../config'
import Cts from '../../Cts'
import pxToEm from '../../util/pxToEm';

import {ActionSheet, Dialog} from "../../weui/index";
import IconBadge from '../../widget/IconBadge';
import colors from "../../styles/colors";
import top_styles from './TopStyles'
import bottom_styles from './BottomStyles'
import * as tool from "../../common/tool";
import {screen} from '../../common';

const {
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  InteractionManager,
  ActivityIndicator,
  Image,
  View,
  SafeAreaView
} = ReactNative;

const {PureComponent} = React;

function mapStateToProps(state) {
  const {remind, global} = state;
  return {remind: remind, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchRemind,
      updateRemind,
      fetchRemindCount,
      delayRemind, ...globalActions
    }, dispatch)
  }
}


let canLoadMore;
let loadMoreTime = 0;
const _typeIds = [100, 101, 102, 103];
const _fetchDataTypeIds = [100, 101, 102, Cts.TASK_TYPE_OTHER_IMP, Cts.TASK_TYPE_UN_CLASSIFY, Cts.TASK_TYPE_UPLOAD_NEW_GOODS, Cts.TASK_TYPE_CHG_SUPPLY_PRICE];//其他分类下的子分类定义
const _otherSubTypeIds = [Cts.TASK_TYPE_OTHER_IMP, Cts.TASK_TYPE_UN_CLASSIFY, Cts.TASK_TYPE_UPLOAD_NEW_GOODS, Cts.TASK_TYPE_CHG_SUPPLY_PRICE];//其他分类下的子分类定义
const _typeAlias = ['refund_type', 'remind_type', 'complain_type', 'other_type'];
const _otherTypeTag = 103;

// create a component
class RemindScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      canSwitch: true,
      dataSource: [],
      showStopRemindDialog: false,
      showDelayRemindDialog: false,
      opRemind: {},
      localState: {},
      otherTypeActive: 3
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    canLoadMore = false;
  }

  UNSAFE_componentWillMount() {
    const {dispatch} = this.props;
    let token = this._getToken();
    let {store_id, vendor_id} = this._getStoreAndVendorId();
    dispatch(fetchRemindCount(vendor_id, store_id, token));

    let {is_helper, is_service_mgr} = tool.vendor(this.props.global);
    if ((is_helper || is_service_mgr) && _fetchDataTypeIds.indexOf(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED) === -1) {//上传商品失败分类只展示给服务人员和后台人员
      _fetchDataTypeIds.push(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED);
    }
    _fetchDataTypeIds.forEach((typeId) => {
      dispatch(fetchRemind(false, true, typeId, false, 1, token, Cts.TASK_STATUS_WAITING, vendor_id, store_id));
    });
  }

  componentDidMount() {
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
  }

  onRefresh(typeId) {
    const {dispatch} = this.props;
    let token = this._getToken();
    let {store_id, vendor_id} = this._getStoreAndVendorId();
    dispatch(fetchRemindCount(vendor_id, store_id, token));
    dispatch(fetchRemind(true, false, typeId, false, 1, token, Cts.TASK_STATUS_WAITING, vendor_id, store_id));
    canLoadMore = true;
  }

  _getToken() {
    const {global} = this.props;
    return global['accessToken']
  }

  _getStoreAndVendorId() {
    let {currVendorId} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;
    return {'store_id': currStoreId, 'vendor_id': currVendorId}
  }


  onPress(route, params) {
    let self = this;
    let {canSwitch} = self.state;
    if (canSwitch) {
      self.setState({canSwitch: false});
      InteractionManager.runAfterInteractions(() => {
        self.props.navigation.navigate(route, params);
      });
      this.__resetState();
    }
  }

  onPressDropdown(key, id, type) {
    const {remind} = this.props;
    if (remind.doingUpdate) {
      ToastShort("操作太快了！");
      return false;
    }
    if (parseInt(key) === 0) {
      //暂停提示
      this._showDelayRemindDialog(type, id);
    } else {
      //强制关闭
      this._showStopRemindDialog(type, id);

    }
  }

  __resetState() {
    setTimeout(() => {
      this.setState({canSwitch: true})
    }, 2500)
  }

  _hideDelayRemindDialog() {
    this.setState({
      showDelayRemindDialog: false,
      opRemind: {}
    });
  }

  _showDelayRemindDialog(type, id) {
    this.setState({
      showDelayRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  _hideStopRemindDialog() {
    this.setState({
      showStopRemindDialog: false,
      opRemind: {}
    });
  }

  _showStopRemindDialog(type, id) {
    this.setState({
      showStopRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  _doStopRemind() {
    let {type, id} = this.state.opRemind;
    const {dispatch} = this.props;
    let token = this._getToken();
    dispatch(updateRemind(id, type, Cts.TASK_STATUS_DONE, token))
    this._hideStopRemindDialog();
  }

  _doDelayRemind(minutes) {
    let {type, id} = this.state.opRemind;
    const {dispatch} = this.props;
    let token = this._getToken();
    dispatch(delayRemind(id, type, minutes, token));
    this._hideDelayRemindDialog();
  }

  onEndReached(typeId) {
    let time = Date.parse(new Date()) / 1000;
    const {remind} = this.props;
    let token = this._getToken();
    let pageNum = remind.currPage[typeId];
    canLoadMore = true;
    if (remind.noMore[typeId]) {
      canLoadMore = false;
    }
    if (canLoadMore && time - loadMoreTime > 1) {
      const {dispatch} = this.props;
      let {store_id, vendor_id} = this._getStoreAndVendorId();
      dispatch(fetchRemind(false, false, typeId, true, pageNum + 1, token, Cts.TASK_STATUS_WAITING, vendor_id, store_id));
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  }

  pressSubButton(type) {
    this.setState({
      otherTypeActive: type
    });
  }

  pressToDoneRemind(route, params = {}) {
    let _this = this;
    let {canSwitch} = _this.state;
    if (canSwitch) {
      _this.setState({canSwitch: false});
      InteractionManager.runAfterInteractions(() => {
        _this.props.navigation.navigate(route, params);
      });
      this.__resetState();
    }
  }

  __getBadgeButton(key, name, quick) {
    quick = quick ? quick : 0;
    let activeType = this.state.otherTypeActive;
    let self = this;
    return <IconBadge
      key={key}
      MainElement={
        <RNButton
          onPress={() => self.pressSubButton(key)}
          containerStyle={activeType == key ? styles.subButtonActiveContainerStyle : styles.subButtonContainerStyle}
          style={activeType == key ? styles.subButtonActiveStyle : styles.subButtonStyle}>
          {name}
        </RNButton>
      }
      BadgeElement={
        <Text style={{color: '#FFFFFF', fontSize: pxToDp(18)}}>{quick > 99 ? '99+' : quick} </Text>
      }
      MainViewStyle={{marginHorizontal: pxToDp(10)}}
      Hidden={quick == 0}
      IconBadgeStyle={styles.iconBadgeStyle}
      MainProps={{key: key}}
    />;
  }

  renderHead(typeId) {
    let self = this;
    if (typeId != _otherTypeTag) {
      return null;
    }
    let buttons = [];
    const {remind} = this.props;
    let quickNum = remind.quickNum;

    let {is_helper, is_service_mgr} = tool.vendor(this.props.global);
    if ((is_helper || is_service_mgr) && _otherSubTypeIds.indexOf(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED) === -1) {//上传商品失败分类只展示给服务人员和后台人员
      _otherSubTypeIds.push(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED);
    }
    _otherSubTypeIds.forEach((typeId) => {
      buttons.push(self.__getBadgeButton(typeId, Alias.SUB_CATEGORIES[typeId], quickNum[typeId]));
    });
    return (
      <View style={styles.listHeadStyle}>
        {buttons}
      </View>
    );
  }

  renderFooter(typeId) {
    const {remind} = this.props;
    if (!remind.isLoadMore[typeId]) return <View style={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <RNButton
        activeOpacity={0.7}
        onPress={() => {
          this.pressToDoneRemind(Config.ROUTE_DONE_REMIND, {
            type: 'DoneRemind',
            title: '已处理工单'
          })
        }}
        containerStyle={styles.stickyButtonContainer}
        style={{
          fontSize: 16,
          color: '#999'
        }}>
        已处理工单
      </RNButton>
    </View>;
    else
      return (
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator styleAttr='Inverse' color='#3e9ce9'/>
          <Text style={{textAlign: 'center', fontSize: 16}}>
            加载中…
          </Text>
        </View>
      );
  }

  renderItem(remind) {
    let {item, index} = remind;
    return (
      <RemindItem item={item} index={index} key={index} onRefresh={() => this.onRefresh(item.type)}
                  onPressDropdown={this.onPressDropdown.bind(this)}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(dataSource, typeId, tagTypeId) {
    const {remind} = this.props;
    if (remind.loading[typeId]) {
      return <LoadingView/>;
    }
    let loading = remind.remindList[typeId] == undefined ? true : false;
    let {store_id, vendor_id} = this._getStoreAndVendorId();
    if (loading) {
      const {dispatch} = this.props;
      let token = this._getToken();
      return (
        <ScrollView
          automaticallyAdjustContentInsets={false}
          horizontal={false}
          contentContainerStyle={styles.no_data}
          style={{flex: 1}}
          refreshControl={
            `<RefreshControl
              refreshing={loading}
              onRefresh={() => {
                dispatch(fetchRemind(false, true, typeId, false, 1, token, Cts.TASK_STATUS_WAITING, vendor_id, store_id));
              }}
              title={"加载中..."}
              colors={['#ffaa66cc', '#ff00ddff', '#ffffbb33', '#ffff4444']}
            />`}>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>
              正在加载...
            </Text>
          </View>
        </ScrollView>
      );
    }

    return (
      <SafeAreaView style={{flex: 1}}>
        <FlatList
          extraData={this.state.dataSource}
          data={dataSource}
          legacyImplementation={false}
          directionalLockEnabled={true}
          onTouchStart={(e) => {
            this.pageX = e.nativeEvent.pageX;
            this.pageY = e.nativeEvent.pageY;
          }}
          onTouchMove={(e) => {
            if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
              this.setState({scrollLocking: true});
            } else {
              this.setState({scrollLocking: false});
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={this.renderItem}
          onEndReached={this.onEndReached.bind(this, typeId)}
          onRefresh={this.onRefresh.bind(this, typeId)}
          refreshing={!!remind.isRefreshing[typeId]}
          ListFooterComponent={this.renderFooter.bind(this, typeId)}
          ListHeaderComponent={this.renderHead.bind(this, tagTypeId)}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListEmptyComponent={() =>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'row',
              height: (screen.height - (tagTypeId !== Cts.TASK_ALL_SHIP && tagTypeId !== Cts.TASK_ALL_AFTER_SALE && tagTypeId !== Cts.TASK_ALL_REFUND ? 210 : 180))
            }}>
              <Text style={{fontSize: 18}}>
                暂无待处理任务
              </Text>
            </View>}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }

  _keyExtractor = (item) => {
    return item.id.toString();
  }

  render() {
    const {remind} = this.props;
    const remindCount = remind.remindCount;
    const self = this;
    let lists = [];
    _typeIds.forEach((typeId, index) => {
      let label = Alias.CATEGORIES[typeId];
      let tabTagId = typeId;
      if (typeId == _otherTypeTag) {
        typeId = self.state.otherTypeActive;
      }
      lists.push(
        <View
          key={`${typeId}`}
          tabLabel={label}
          style={{flex: 1}}>
          {this.renderContent(this.state.dataSource = remind.remindList[typeId] == undefined ? [] : remind.remindList[typeId], typeId, tabTagId)}
        </View>);

    });

    return (
      <View style={{flex: 1}}>
        <Tabs tabs={Alias.CATEGORIES_TAB}
              swipeable={true}
              animated={true}
              renderTabBar={tabProps => {
                const count = this.props.remind.remindCount;
                return (
                  <View style={{
                    paddingHorizontal: 40,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  }}>
                    {

                      tabProps.tabs.map((tab, i) => {
                        let indexKey = _typeIds[i];
                        let countData = count ? count[indexKey] : 0;
                        let total = !countData ? 0 : countData['total'];
                        let quick = !countData ? 0 : countData['quick'];
                        return (

                          // change the style to fit your needs
                          <TouchableOpacity
                            activeOpacity={0.9}
                            key={tab.key || i}
                            style={{
                              width: "40%",
                              padding: 15,
                            }}
                            onPress={() => {
                              const {goToTab, onTabClick} = tabProps;
                              // tslint:disable-next-line:no-unused-expression
                              onTabClick && onTabClick(tabs[i], i);
                              // tslint:disable-next-line:no-unused-expression
                              goToTab && goToTab(i);
                            }}
                          >
                            <IconBadge
                              MainElement={
                                <View>
                                  <Text style={{
                                    color: tabProps.activeTab === i ? 'green' : 'black', fontSize: pxToEm(25)
                                  }}>
                                    {total == 0 ? tab.title : tab.title + "(" + total + ")"}
                                  </Text>
                                </View>
                              }
                              BadgeElement={
                                <Text
                                  style={{color: '#FFFFFF', fontSize: pxToDp(18)}}>{quick > 99 ? '99+' : quick} </Text>
                              }
                              Hidden={quick == 0}
                              IconBadgeStyle={
                                {width: 20, height: 15, top: -10, right: 0}
                              }
                            />
                          </TouchableOpacity>
                        )
                      })}
                  </View>
                )
              }
              }
        >
          {lists}
        </Tabs>
        <Dialog onRequestClose={() => this._hideStopRemindDialog()}
                visible={this.state.showStopRemindDialog}
                title="不再提醒"
                buttons={[
                  {
                    type: 'default',
                    label: '返回解决',
                    onPress: this._hideStopRemindDialog.bind(this),
                  }, {
                    type: 'primary',
                    label: '已解决',
                    onPress: this._doStopRemind.bind(this),
                  },
                ]}><Text>已解决问题，如果没有返回解决</Text>
        </Dialog>
        <ActionSheet
          visible={this.state.showDelayRemindDialog}
          onRequestClose={() => this._hideDelayRemindDialog()}
          menus={[
            {
              type: 'default',
              label: '10分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 10),
            }, {
              type: 'default',
              label: '20分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 20),
            }, {
              type: 'warn',
              label: '30分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 30),
            }
          ]}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: this._hideDelayRemindDialog.bind(this),
            }
          ]}
        />
      </View>

    );
  }

}

const dropDownImg = require("../../img/Order/pull_down.png");
const dropUpImg = require("../../img/Order/pull_up.png");

class RemindItem extends React.PureComponent {

  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    onPressDropdown: PropTypes.func,
    onPress: PropTypes.func,
    onRefresh: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {toggleImg: dropDownImg};
  }

  _dropdown_willShow() {
    this.setState({
      toggleImg: dropUpImg
    });
  }

  _dropdown_willHide() {
    this.setState({
      toggleImg: dropDownImg
    });
  }

  render() {
    let {item, onPressDropdown, onPress} = this.props;
    let task_type = parseInt(item.type);
    let task_info = item.remark;
    if (task_type === Cts.TASK_TYPE_UPLOAD_NEW_GOODS && item.remind_id) {
      let new_goods_info = JSON.parse(item.remind_id);
      task_info = '申请上架: ' + item.remark + ';  价格: ' + new_goods_info.price_desc;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.order_id > 0) {
            onPress(Config.ROUTE_ORDER, {orderId: item.order_id})
          } else if (parseInt(item.type) === Cts.TASK_TYPE_UPLOAD_NEW_GOODS) {
            let params = {
              task_id: item.id,
              refresh_list: () => {
                this.props.onRefresh()
              }
            };
            onPress(Config.ROUTE_GOODS_WORK_NEW_PRODUCT, params);
          } else if (parseInt(item.type) === Cts.TASK_TYPE_CHG_SUPPLY_PRICE) {
            let params = {viewStoreId: item.store};
            onPress(Config.ROUTE_GOODS_APPLY_RECORD, params);
          }
        }}
        activeOpacity={0.6}>
        <View style={top_styles.container}>
          <View style={[top_styles.order_box]}>
            <View style={top_styles.box_top}>
              <View style={[top_styles.order_head]}>
                {item.quick > 0 ?
                  <Image
                    style={[top_styles.icon_ji]}
                    source={require('../../img/Remind/quick.png')}/> : null}
                {!!item.orderDate ? <View>
                  <Text style={top_styles.o_index_text}>{item.orderDate}#{item.dayId} </Text>
                </View> : null}
                <View>
                  <Text style={top_styles.o_store_name_text}>{item.store_id} </Text>
                </View>
                <TouchableOpacity style={[top_styles.icon_dropDown]}
                                  onPress={() => this.toggleDropDown()}>
                  <ModalDropdown
                    onDropdownWillShow={this._dropdown_willShow.bind(this)}
                    onDropdownWillHide={this._dropdown_willHide.bind(this)}
                    options={['暂停提示', '强制关闭']}
                    defaultValue={''}
                    style={top_styles.drop_style}
                    dropdownStyle={top_styles.drop_listStyle}
                    dropdownTextStyle={top_styles.drop_textStyle}
                    dropdownTextHighlightStyle={top_styles.drop_optionStyle}
                    onSelect={(event) => onPressDropdown(event, item.id, item.type)}>
                    <Image style={[top_styles.icon_img_dropDown]}
                           source={this.state.toggleImg}/>
                  </ModalDropdown>
                </TouchableOpacity>
              </View>
              <View style={[top_styles.order_body]}>
                <Text style={[top_styles.order_body_text]}>
                  <Text style={top_styles.o_content}>
                    {task_info}
                    {task_type === Cts.TASK_TYPE_UPLOAD_GOODS_FAILED && item.remind_id}
                  </Text>
                </Text>
                <View style={[top_styles.ship_status]}>
                  <Text style={[top_styles.ship_status_text]}>{item.orderStatus} </Text>
                </View>
              </View>
            </View>
            <View style={bottom_styles.container}>
              <View style={bottom_styles.time_date}>
                <Text style={bottom_styles.time_date_text}>{item.noticeDate} </Text>
              </View>
              <View>
                <Text style={bottom_styles.time_start}>{item.noticeTime}生成</Text>
              </View>
              {!!item.expect_end_time &&
              <Image style={[bottom_styles.icon_clock]} source={require('../../img/Remind/clock.png')}/>}
              <View>
                <Text style={bottom_styles.time_end}>{item.expect_end_time} </Text>
              </View>
              {item.delegation_to_user && (<View style={bottom_styles.operator}>
                <Text style={bottom_styles.operator_text}>
                  处理人：{item.delegation_to_user}
                </Text>
              </View>)}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  listView: {
    backgroundColor: '#eeeeec'
  },
  no_data: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100
  },
  subButtonContainerStyle: {
    height: 30,
    // width: 48,
    paddingHorizontal: pxToDp(20),
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#999',
    borderWidth: 1
  },
  subButtonActiveContainerStyle: {
    height: 30,
    // width: 48,
    paddingHorizontal: pxToDp(20),
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: colors.main_color,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.main_color,
    borderWidth: 1
  },
  subButtonStyle: {
    fontSize: 10,
    color: '#999'
  },
  subButtonActiveStyle: {
    fontSize: 10,
    color: 'white'
  },
  listHeadStyle: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'space-between',
    flexWrap: 'nowrap',
    backgroundColor: 'white'
  },
  iconBadgeStyle: {
    width: 20,
    height: 15,
    top: 0,
    right: -5
  },
  stickyButtonContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#999',
    borderWidth: 1,
    height: 35,
    width: 256,
    flex: 1,
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'black',
    shadowOffset: {height: 0, width: 0},
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RemindScene)
