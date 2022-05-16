import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import styles from 'rmc-picker/lib/PopupStyles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo"

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
      balanceNum: 0,
      records: [],
      records2: [],
      by_labels: [],
      data_labels: [],
      date: date,
      choseTab: 1,
      start_day: this.format(date)
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchExpenses()
    this.getBanlance()
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

  //获取余额
  getBanlance() {
    const {global} = this.props;
    const url = `new_api/stores/store_remaining_fee/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        balanceNum: res
      })
    })
  }

  // 获取充值记录
  fetchaddExpenses() {
    const {global} = this.props;
    const url = `new_api/stores/store_recharge_log/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      if (res.records) {
        this.setState({records2: res.records})
      }
    })
  }

  onChange = (date) => {
    this.setState({date: date, start_day: this.format(date)}, function () {
      if (this.state.choseTab === 1) {
        this.fetchExpenses();
      } else {
        this.fetchaddExpenses();
      }
    })
  }


  format = (date) => {
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
        day: item.day
      });
    });
  }


  render() {
    const {date, records, records2} = this.state;
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
        {this.renderHeader()}
        {this.renderType()}

        <View style={{
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
          <Text style={{flex: 1, color: colors.color333, fontWeight: "bold",}}> 请选择月份 </Text>

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
              color: colors.title_color,
              fontSize: 16,
              fontWeight: 'bold'
            }}> {this.state.start_day} </Text>
          </PopPicker>

          <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 10}}/>
        </View>


        <If condition={this.state.choseTab === 1}>
          {records && records.map((item, id) => {
            return <TouchableOpacity key={id} style={{
              paddingVertical: pxToDp(25),
              paddingHorizontal: pxToDp(30),
              flex: 1,
              // justifyContent: "center",
              alignItems: "center",
              flexDirection: 'column',
              backgroundColor: 'white',
              borderBottomWidth: pxToDp(1),
              borderColor: '#ccc',
            }} onPress={() => this.onItemClicked(item)}>
              <View style={{alignItems: "center", flexDirection: 'row'}}>
                <Text style={{fontSize: 16, color: colors.color333, fontWeight: 'bold'}}>{item.day} </Text>
                <View style={{flex: 1}}></View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  width: "30%",
                  textAlign: 'right',
                }}> {item.day_balanced !== '' ? (`${item.day_balanced / 100}`) : ''}
                </Text>
                <Entypo name='chevron-thin-right' style={{fontSize: 14, marginLeft: 10}}/>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10}}>
                <Text style={{fontSize: 14, color: colors.color999, flex: 1}}>理想金额: {item.total_ideal_balanced} </Text>
                <Text style={{fontSize: 14, color: colors.color999}}>实际金额: {item.total_balanced} </Text>
              </View>
            </TouchableOpacity>
          })}
        </If>

        <If condition={this.state.choseTab === 2}>
          {records2 && records2.map((item, idx) => {
            return <View key={idx} style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: "100%",
              borderBottomWidth: pxToDp(1),
              borderColor: '#ccc',
              paddingTop: pxToDp(20),
              paddingBottom: pxToDp(20),
              paddingLeft: pxToDp(40),
              backgroundColor: colors.white
            }}>
              <View style={{
                flex: 3,
              }}>
                <Text style={{
                  fontWeight: "bold",
                }}>{item.remark} </Text>
                <Text style={{
                  color: '#999',
                  marginTop: pxToDp(8)
                }}>{item.created} </Text>
              </View>
              <View style={{
                fontWeight: "bold",
                flex: 1,
              }}>
                <Text
                  style={{
                    textAlign: 'right',
                    marginRight: pxToDp(40),
                    fontWeight: 'bold',
                  }}> {item.type === "1" ? '+' : '-'}{item.fee / 100} </Text>
              </View>
            </View>
          })}
        </If>
      </ScrollView>
    )
  }


  renderHeader() {
    return (
      <View style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#28A077',
        margin: pxToDp(20),
        paddingVertical: pxToDp(50),
        borderRadius: pxToDp(8)
      }}>
        <Text style={{
          width: '100%',
          marginLeft: pxToDp(100),
          textAlign: 'left',
          color: 'white'
        }}>当前余额（元） </Text>
        <Text style={{
          marginVertical: pxToDp(30),
          fontSize: pxToDp(120),
          fontWeight: "bold",
          textAlign: 'center',
          color: 'white'
        }}>{this.state.balanceNum} </Text>
        <TouchableOpacity style={{
          backgroundColor: 'white',
          width: 140,
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: "center",
        }} onPress={() => this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}
        >
          <Text style={{
            color: colors.main_color,
            textAlign: 'center',
            paddingVertical: pxToDp(10),
          }}> 充 值 </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          justifyContent: 'center',
          alignItems: "center",
          marginTop: pxToDp(10),
        }} onPress={() => this.props.navigation.navigate(Config.ROUTE_SETTING)}>
          <Text style={{
            color: '#f7f7f7',
            textAlign: 'center',
            paddingVertical: pxToDp(10),
            textDecorationLine: 'underline',
          }}> 去设置余额不足电话通知 </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderType() {
    let choseTab = this.state.choseTab
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.white,
        height: 40,
        marginBottom: 5,
      }}>
        <TouchableOpacity style={{width: '50%', alignItems: "center"}} onPress={() => {
          this.setState({
            choseTab: 1
          })
          this.fetchExpenses();
        }}>
          <View style={{
            borderColor: colors.main_color,
            borderBottomWidth: choseTab === 1 ? 3 : 0,
            height: 40,
            justifyContent: 'center',
          }}>
            <Text style={{color: colors.color333}}> 费用账单 </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{width: '50%', alignItems: "center"}} onPress={() => {
          this.setState({
            choseTab: 2
          })
          this.fetchaddExpenses();
        }}>
          <View style={{
            borderColor: colors.main_color,
            borderBottomWidth: choseTab === 2 ? 3 : 0,
            height: 40,
            justifyContent: 'center',
          }}>
            <Text style={{color: colors.color333}}>充值记录 </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
