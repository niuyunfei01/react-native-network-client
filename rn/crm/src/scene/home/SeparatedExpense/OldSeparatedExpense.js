import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import styles from 'rmc-picker/lib/PopupStyles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {Icon, List} from '@ant-design/react-native';
import pxToDp from "../../../util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SeparatedExpense extends PureComponent {
  constructor(props: Object) {
    super(props);
    const {navigation} = props;
    navigation.setOptions(
      {
        headerRight: (() => (
            <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}>
              <View style={{
                width: pxToDp(96),
                height: pxToDp(46),
                backgroundColor: colors.main_color,
                marginRight: 8,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 充值 </Text>
              </View>
            </TouchableOpacity>
          )
        )
      }
    );
    let date = new Date();
    this.state = {
      records: [],
      by_labels: [],
      data_labels: [],
      date: date,
      start_day: this.format(date)
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchExpenses()
  }

  fetchExpenses() {
    const self = this;
    showModal('加载中')
    const {global} = self.props;
    const url = `api/store_separated_items_statistics/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}&start_day=`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels}, () => {
        hideModal()
      })
    }, () => {
      hideModal();
    })
  }

  onHeaderStyle(record) {
    return record.sa === 1 ? record.total_balanced > 0 ? style.saAmountAddStyle : style.saAmountStyle : {};
  }

  onChange = (date) => {
    this.setState({date: date, start_day: this.format(date)}, function () {
      this.fetchExpenses();
    })

  }

  format = (date) => {
    let mday = date.getDate();
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
  }

  onDismiss() {
  }

  onItemClicked(item) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE_INFO, {
        day: item.day,
        total_balanced: item.total_balanced
      });
    });
  }

  render() {
    const props = this.props;
    const {date, records} = this.state;
    const datePicker = (
      <DatePicker
        rootNativeProps={{'data-xx': 'yy'}}
        minDate={new Date(2015, 8, 15, 10, 30, 0)}
        maxDate={new Date()}
        defaultDate={date}
        mode="month"
        locale={zh_CN}
      />
    );
    return (
      <ScrollView
        style={{flex: 1, backgroundColor: '#f5f5f9'}}
      >
        <List
          style={{width: "100%"}}
          renderHeader={() => {
            return <View
              style={{flexDirection: 'row', alignItems: 'center', width: "100%", height: 40, backgroundColor: "#fff"}}>
              <PopPicker
                datePicker={datePicker}
                transitionName="rmc-picker-popup-slide-fade"
                maskTransitionName="rmc-picker-popup-fade"
                styles={styles}
                title={'选择日期'}
                okText={'确认'}
                dismissText={'取消'}
                date={date}
                onDismiss={this.onDismiss}
                onChange={this.onChange}
              >
                <Text style={{
                  height: 40,
                  width: "100%",
                  alignItems: 'center',
                  flexDirection: "row",
                  justifyContent: 'space-between',
                  paddingLeft: '5%',
                  paddingRight: '3%',
                  marginTop: 12,
                }}>
                  <View style={{
                    width: pxToDp(220),
                    height: pxToDp(50),
                    backgroundColor: colors.white,
                    // marginRight: 8,
                    borderRadius: 5,
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    // borderWidth: pxToDp(1)
                  }}>
                    <View><Text
                      style={{width: pxToDp(200), color: colors.title_color, fontSize: 16}}> 请选择月份</Text></View>
                    <View><Text><Icon name={"caret-down"} size={"xs"} color={"#666"}/></Text></View>
                  </View>
                </Text>
              </PopPicker>
              <View style={{width: pxToDp(120)}}><Text
                style={{fontSize: 14, color: colors.title_color}}>{this.state.start_day} </Text>
              </View>
            </View>
          }}>
          {records && records.map((item, id) => {
            return <List.Item
              arrow="horizontal"
              key={id}
              onClick={() => this.onItemClicked(item)}
              extra={<Text
                style={{
                  fontsize: pxToDp(36),
                  fontWeight: 'bold'
                }}>{item.day_balanced !== '' ? (`${item.day_balanced / 100}`) : ''} </Text>}

            >
              <Text> {item.day} </Text>
            </List.Item>
          })}
        </List>
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  popPicker: {},
  saAmountStyle: {
    color: colors.orange,
  },
  saAmountAddStyle: {
    color: colors.main_vice_color,
  },
  right_btn: {
    fontSize: pxToDp(40),
    textAlign: "center",
    color: colors.main_color
  },
  chevron_right: {
    position: "absolute",
    right: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    width: pxToDp(60),
    height: pxToDp(140)
  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28)
  },
  success: {
    color: colors.main_color,
    borderColor: colors.main_color
  },
  warn: {
    color: colors.orange,
    borderColor: colors.orange
  },
  detailBox: {
    padding: pxToDp(40),
    backgroundColor: '#fff'
  },
  remarkBox: {
    flexDirection: 'row'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
