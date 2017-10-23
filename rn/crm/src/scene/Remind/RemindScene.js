/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React from 'react'
import ReactNative from 'react-native'

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
  StatusBar
} = ReactNative;

const {PureComponent, PropTypes} = React;

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as Alias from './Alias';
import LoadingView from '../../widget/LoadingView';
import {ToastShort, ToastLong} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import ModalDropdown from 'react-native-modal-dropdown';
import {fetchRemind, updateRemind, fetchRemindCount, delayRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'

import RNButton from '../../widget/RNButton';

import Config from '../../config'

const BadgeTabBar = require('./BadgeTabBar');

import {Dialog, ActionSheet} from "../../weui/index";
import IconBadge from '../../widget/IconBadge';
import colors from "../../styles/colors";

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
const _fetchDataTypeIds = [100, 101, 102, 3, 0];
const _otherSubTypeIds = [0, 3];
const _typeAlias = ['refund_type', 'remind_type', 'complain_type', 'other_type'];
const _otherTypeTag = 103;

// create a component
class RemindScene extends PureComponent {

  static navigationOptions = {title: 'Remind', header: null};

  constructor(props) {
    super(props);
    this.state = {
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

  componentWillMount() {
    const {dispatch} = this.props;
    let token = this._getToken();
    dispatch(fetchRemindCount(token));
    dispatch(fetchRemind(false, true, _fetchDataTypeIds[0], false, 1, token, 0));
  }

  componentDidMount() {
    const {dispatch} = this.props;
    let token = this._getToken();
    let array = _fetchDataTypeIds.slice(1);
    array.forEach((typeId) => {
      dispatch(fetchRemind(false, true, typeId, false, 1, token, 0));
    });
  }

  componentWillReceiveProps(nextProps) {
    const {remind} = this.props;
    // get typeId
    // if (remind.isLoadMore && !nextProps.remind.isLoadMore && !nextProps.remind.isRefreshing) {
    //   if (nextProps.remind.noMore) {
    //     ToastShort('没有更多数据了');
    //   }
    // }
  }

  onRefresh(typeId) {
    const {dispatch} = this.props;
    let token = this._getToken();
    dispatch(fetchRemind(true, false, typeId, false, 1, token, 0));
    canLoadMore = true;
  }

  _getToken() {
    const {global} = this.props;
    return global['accessToken']
  }

  onPress(route, params) {
    let self = this;
    let orderId = self.state.localState.orderId;
    if (!orderId) {
      InteractionManager.runAfterInteractions(() => {
        self.setState({
          localState: {
            orderId: orderId
          }
        });
        self.props.navigation.navigate(route, params);
      }).done(
        () => {
          self.setState({
            localState: {
              orderId: ''
            }
          });
        }
      );
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
    dispatch(updateRemind(id, type, Config.TASK_STATUS_DONE, token))
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
      ToastShort('没有更多数据了');
      canLoadMore = false;
    }
    if (canLoadMore && time - loadMoreTime > 1) {
      const {dispatch} = this.props;
      dispatch(fetchRemind(false, false, typeId, true, pageNum + 1, token, 0));
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  }

  pressSubButton(type) {
    this.setState({
      otherTypeActive: type
    });
  }

  __getBadgeButton(key, name, quick) {
    quick = quick ? quick : 0;
    let activeType = this.state.otherTypeActive;
    let self = this;
    return <IconBadge
      key={key}
      MainElement={
        <RNButton
          onPress={(key) => self.pressSubButton(key)}
          containerStyle={activeType == key ? styles.subButtonActiveContainerStyle : styles.subButtonContainerStyle}
          style={activeType == key ? styles.subButtonActiveStyle : styles.subButtonStyle}>
          {name}
        </RNButton>
      }
      BadgeElement={
        <Text style={{color: '#FFFFFF'}}>{quick}</Text>
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
    if (!remind.isLoadMore[typeId]) return null;
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
      <RemindItem item={item} index={index} key={index} onPressDropdown={this.onPressDropdown.bind(this)}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(dataSource, typeId, tagTypeId) {
    const {remind} = this.props;
    if (remind.loading[typeId]) {
      return <LoadingView/>;
    }
    let isLoading = remind.remindList[typeId] == undefined;
    let isEmpty = isLoading ? false : remind.remindList[typeId].length == 0;
    if (isLoading || isEmpty) {
      let title = isLoading ? "Loading..." : "";
      let tip = isLoading ? "正在加载..." : "";
      return (
        <ScrollView
          automaticallyAdjustContentInsets={false}
          horizontal={false}
          contentContainerStyle={styles.no_data}
          style={{flex: 1}}
          refreshControl={
            <RefreshControl
              refreshing={remind.isRefreshing[typeId]}
              onRefresh={this.onRefresh.bind(this, typeId)}
              title={title}
              colors={['#ffaa66cc', '#ff00ddff', '#ffffbb33', '#ffff4444']}
            />}>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>
              {tip}
            </Text>
          </View>
        </ScrollView>
      );
    }
    return (
      <FlatList
        extraData={this.state.dataSource}
        data={dataSource}
        legacyImplementation={false}
        directionalLockEnabled={true}
        viewabilityConfig={{
          minimumViewTime: 3000,
          viewAreaCoveragePercentThreshold: 100,
          waitForInteraction: true,
        }}
        onEndReachedThreshold={0.1}
        renderItem={this.renderItem}
        onEndReached={this.onEndReached.bind(this, typeId)}
        onRefresh={this.onRefresh.bind(this, typeId)}
        refreshing={remind.isRefreshing[typeId]}
        ListFooterComponent={this.renderFooter.bind(this, typeId)}
        ListHeaderComponent={this.renderHead.bind(this, typeId)}
        keyExtractor={this._keyExtractor}
        shouldItemUpdate={this._shouldItemUpdate}
        getItemLayout={this._getItemLayout}
        initialNumToRender={5}
      />
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
    const tagNum = remind.tagNum;
    const self = this;
    let lists = [];
    _typeIds.forEach((typeId, index) => {
      let key = typeId + "-" + _typeAlias[index];
      let label = Alias.CATEGORIES[typeId];
      let tabTagId = typeId;
      //other type
      if (typeId == _otherTypeTag) {
        typeId = self.state.otherTypeActive;
      }
      lists.push(
        <View
          key={key}
          tabLabel={label}
          style={{flex: 1}}>
          {this.renderContent(this.state.dataSource = remind.remindList[typeId] == undefined ? [] : remind.remindList[typeId], typeId, tabTagId)}
        </View>);
    });
    return (
      <View style={{flex: 1}}>
        <ScrollableTabView
          initialPage={0}
          renderTabBar={() => <BadgeTabBar count={tagNum} countIndex={_typeIds}/>}
          locked={remind.processing}
          tabBarActiveTextColor={"#333"}
          tabBarUnderlineStyle={{backgroundColor: "#59b26a"}}
          tabBarTextStyle={{fontSize: pxToDp(26)}}>
          {lists}
        </ScrollableTabView>
        <Dialog onRequestClose={() => this._hideStopRemindDialog()}
                visible={this.state.showStopRemindDialog}
                title="不在提醒"
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

const dropDownImg = require("../../img/Remind/drop-down.png");
const dropUpImg = require("../../img/Order/pull_up.png");

class RemindItem extends React.PureComponent {

  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    onPressDropdown: PropTypes.func,
    onPress: PropTypes.func
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
    let {item, index, onPressDropdown, onPress} = this.props;
    return (
      <TouchableOpacity onPress={() => onPress(Config.ROUTE_ORDER, {orderId: item.order_id})} activeOpacity={0.6}>
        <View style={top_styles.container}>
          <View style={[top_styles.order_box]}>
            <View style={top_styles.box_top}>
              <View style={[top_styles.order_head]}>
                {item.quick == 1 ? <Image style={[top_styles.icon_ji]}
                                          source={require('../../img/Remind/quick.png')}/> : null}
                <View>
                  <Text style={top_styles.o_index_text}>{item.orderDate}#{item.dayId}</Text>
                </View>
                <View>
                  <Text style={top_styles.o_store_name_text}>{item.store_id}</Text>
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
                    {item.remark}
                  </Text>
                </Text>
                <View style={[top_styles.ship_status]}>
                  <Text style={[top_styles.ship_status_text]}>{item.orderStatus}</Text>
                </View>
              </View>
            </View>
            <View style={bottom_styles.container}>
              <View style={bottom_styles.time_date}>
                <Text style={bottom_styles.time_date_text}>{item.noticeDate}</Text>
              </View>
              <View>
                <Text style={bottom_styles.time_start}>{item.noticeTime}生成</Text>
              </View>
              {item.expect_end_time != '' ?
                <Image style={[bottom_styles.icon_clock]} source={require('../../img/Remind/clock.png')}/> : null}
              <View>
                <Text style={bottom_styles.time_end}>{item.expect_end_time}</Text>
              </View>
              <View style={bottom_styles.operator}>
                <Text style={bottom_styles.operator_text}>
                  处理人：{item.delegation_to_user}
                </Text>
              </View>
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
    width: 48,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#999',
    borderWidth: 1
  },
  subButtonActiveContainerStyle: {
    height: 30,
    width: 48,
    overflow: 'hidden',
    borderRadius: 15,
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
  }
});

const top_styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
  },
  order_box: {
    backgroundColor: '#fff',
    marginHorizontal: pxToDp(0),
    marginVertical: pxToDp(5),
  },
  active: {
    borderWidth: pxToDp(1),
    borderColor: '#000',
  },
  box_top: {
    marginVertical: pxToDp(12),
    marginHorizontal: pxToDp(20),
  },

  order_head: {
    marginBottom: pxToDp(20),
    height: pxToDp(50),
    flexDirection: 'row',
    // backgroundColor: 'red',
  },

  icon_ji: {
    width: pxToDp(35),
    height: pxToDp(35),
    alignSelf: 'center',
    marginRight: pxToDp(5),
  },
  o_index_text: {
    color: '#666',
    fontSize: pxToDp(32),
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  o_store_name_text: {
    height: pxToDp(50),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
    color: '#999',
    paddingLeft: pxToDp(30),
  },
  icon_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
    position: 'absolute',
    right: 0,
    // backgroundColor: 'green',
  },
  icon_img_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_style: {//和背景图片同框的按钮的样式
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_listStyle: {//下拉列表的样式
    width: pxToDp(150),
    height: pxToDp(141),
    backgroundColor: '#5f6660',
    marginTop: -StatusBar.currentHeight,
  },
  drop_textStyle: {//下拉选项文本的样式
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#fff',
    height: pxToDp(69),
    backgroundColor: '#5f6660',
    borderRadius: pxToDp(3),
    borderColor: '#5f6660',
    borderWidth: 1,
    shadowRadius: pxToDp(3),
  },
  drop_optionStyle: {//选项点击之后的文本样式
    color: '#4d4d4d',
    backgroundColor: '#939195',
  },

  order_body: {
    // backgroundColor: 'green',
  },
  order_body_text: {
    fontSize: pxToDp(30),
    color: '#333',
  },
  o_content: {
    fontWeight: 'bold',
    lineHeight: pxToDp(42),
  },
  ship_status: {
    alignSelf: 'flex-end',
  },
  ship_status_text: {
    fontSize: pxToDp(26),
    color: '#999',
  },
});

const bottom_styles = StyleSheet.create({
  container: {
    height: pxToDp(70),
    borderTopWidth: 1,
    borderTopColor: '#999',
    paddingHorizontal: pxToDp(20),
    flexDirection: 'row',
  },

  time_date: {
    marginRight: pxToDp(10),
  },
  time_date_text: {
    color: '#4d4d4d',
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  time_start: {
    color: '#999',
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  icon_clock: {
    marginLeft: pxToDp(70),
    marginRight: pxToDp(5),
    width: pxToDp(35),
    height: pxToDp(35),
    marginTop: pxToDp(5),
    alignSelf: 'center',
  },
  time_end: {
    color: '#db5d5d',
    fontSize: pxToDp(34),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
  operator: {
    position: 'absolute',
    right: pxToDp(20),
  },
  operator_text: {
    fontSize: pxToDp(28),
    height: pxToDp(70),
    textAlignVertical: 'center',
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RemindScene)
