import React, {PureComponent} from 'react'
import {FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../../pubilc/util/tool";
import CustomMonthPicker from "../../../pubilc/component/CustomMonthPicker";
import AntDesign from "react-native-vector-icons/AntDesign";

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
    const {navigation, route = {}} = this.props;
    const {params = {}} = route
    let wsbShowBtn = params.showBtn === 1
    if (wsbShowBtn) {
      navigation.setOptions({headerRight: this.headerRight}
      );
    }
  }

  fetchExpenses() {
    showModal('加载中')
    const {global} = this.props;
    const url = `api/store_separated_items_statistics/${global.store_id}/${this.state.start_day}?access_token=${global.accessToken}&start_day=`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        records: res.records,
        by_labels: res.by_labels,
        data_labels: res.data_labels
      }, () => {
        hideModal()
      })
    }, () => {
      hideModal();
    })
  }

  onChange = (event, date) => {
    this.setState({visible: false})
    if (event === 'dateSetAction') {
      this.setState({date: date, start_day: tool.fullMonth(date)}, function () {
        this.fetchExpenses();
      })
    }
  }

  onItemClicked = (item) => {
    const {params = {}} = this.props.route
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE_INFO, {
        day: item.day,
        total_balanced: item.total_balanced,
        showBtn: params.showBtn === 1
      });
    });
  }

  renderItem = ({item}) => {
    return (
      <TouchableOpacity onPress={() => this.onItemClicked(item)} style={style.itemWrap}>
        <Text style={{color: colors.color333, fontSize: 12}}> {item.day} </Text>
        <View style={style.rightWrap}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.color333}}>
            {`${item.day_balanced / 100}` || ''}
          </Text>
          <AntDesign name={'right'} size={16} color={colors.color666}/>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const {date, records, visible, start_day} = this.state;
    return (
      <View style={{backgroundColor: colors.white}}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          borderBottomWidth: pxToDp(1),
          borderColor: '#ccc',
          paddingVertical: pxToDp(25),
          paddingHorizontal: pxToDp(30),
          zIndex: 999,
        }}>
          <Text style={{color: colors.color111, flex: 1, fontSize: 16, fontWeight: "bold"}}> 请选择月份 </Text>
          <Text style={{color: colors.color111, fontSize: 16, fontWeight: 'bold', padding: 5, textAlign: 'right'}}
                onPress={() => this.setState({visible: true})}>
            {start_day}&nbsp;&nbsp;
            <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 10}}/>
          </Text>
        </View>
        <FlatList data={records}

                  renderItem={this.renderItem}
                  initialNumToRender={10}
                  keyExtractor={(item, index) => `${index}`}
                  ItemSeparatorComponent={ItemSeparatorComponent}/>

        <CustomMonthPicker visible={visible} onChange={(event, newDate) => this.onChange(event, newDate)} date={date}/>

      </View>
    )
  }
}

const ItemSeparatorComponent = () => {
  return (
    <View style={style.line}/>
  )
}
const style = StyleSheet.create({
  saAmountStyle: {
    color: colors.orange,
  },
  saAmountAddStyle: {
    color: colors.main_vice_color,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  rightWrap: {flexDirection: 'row', alignItems: 'center',},
  line: {borderBottomColor: colors.f5, borderBottomWidth: 0.5}
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
