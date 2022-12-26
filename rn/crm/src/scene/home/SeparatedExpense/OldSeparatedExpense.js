import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {List} from '@ant-design/react-native';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";
import MonthPicker from 'react-native-month-year-picker';
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import tool from "../../../pubilc/util/tool";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
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


    let date = new Date();
    this.state = {
      records: [],
      by_labels: [],
      data_labels: [],
      date: date,
      start_day: tool.fullMonth(date),
      visible: false
    }
  }

  headerRight = () => {
    const {navigation} = this.props;
    return (
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
  }

  componentDidMount() {
    this.fetchExpenses()
    const {navigation, route} = this.props;
    let wsbShowBtn = route.params.showBtn && route.params.showBtn === 1
    if (wsbShowBtn) {
      navigation.setOptions({headerRight: this.headerRight}
      );
    }
  }

  fetchExpenses() {
    const self = this;
    showModal('加载中')
    const {global} = self.props;
    const url = `api/store_separated_items_statistics/${global.store_id}/${this.state.start_day}?access_token=${global.accessToken}&start_day=`;
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

  onChange = (event, date) => {
    if (event === 'dismissedAction') {
      this.setState({visible: false})
      return
    }
    this.setState({date: date, start_day: tool.fullMonth(date)}, function () {
      this.fetchExpenses();
    })

  }

  onItemClicked(item) {
    let _this = this;
    let wsbShowBtn = _this.props.route.params.showBtn && _this.props.route.params.showBtn === 1
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE_INFO, {
        day: item.day,
        total_balanced: item.total_balanced,
        showBtn: wsbShowBtn
      });
    });
  }

  render() {
    const {date, records, visible, start_day} = this.state;
    return (
      <ScrollView style={{flex: 1, backgroundColor: '#f5f5f9'}}>
        <List
          style={{width: "100%"}}
          renderHeader={() => {
            return <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: "100%",
              backgroundColor: colors.white,
              borderBottomWidth: pxToDp(1),
              borderColor: '#ccc',
              paddingVertical: pxToDp(25),
              paddingHorizontal: pxToDp(30),
              zIndex: 999,
            }}>
              <Text style={{color: colors.color111, flex: 1, fontSize: 16, fontWeight: "bold"}}> 请选择月份 </Text>
              <Text style={{
                color: colors.color111,
                fontSize: 16,
                fontWeight: 'bold',
                padding: 5,
                width: 200,
                textAlign: 'right'
              }}>
                {start_day} &nbsp;&nbsp;&nbsp;
                <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 10}}/>
              </Text>
            </View>
          }}>
          {records && records.map((item, id) => {
            return <List.Item
              arrow="horizontal"
              key={id}
              onClick={() => this.onItemClicked(item)}
              extra={<Text style={{fontSize: pxToDp(36), fontWeight: 'bold'}}>
                {item.day_balanced !== '' ? (`${item.day_balanced / 100}`) : ''}
              </Text>}

            >
              <Text style={{color: colors.color333}}> {item.day} </Text>
            </List.Item>
          })}
        </List>
        <CommonModal visible={visible} onRequestClose={() => this.onChange('dismissedAction')}>
          <MonthPicker value={date}
                       cancelButton={'取消'}
                       okButton={'确定'}
                       autoTheme={true}
                       mode={'number'}
                       onChange={(event, newDate) => this.onChange(event, newDate)}
                       maximumDate={new Date()}
                       minimumDate={new Date(2015, 8, 15)}/>
        </CommonModal>
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
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
