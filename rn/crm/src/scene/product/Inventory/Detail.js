import BaseComponent from "../../common/BaseComponent";
import {connect} from "react-redux";
import React from "react";
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import LoadMore from "react-native-loadmore";
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from "../../../util/pxToDp";
import color from '../../../pubilc/styles/colors'
import EmptyData from "../../common/component/EmptyData";
import {DatePickerView} from "@ant-design/react-native";
import dayjs from "dayjs";
import {Button} from "react-native-elements";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import DateTimePicker from "react-native-modal-datetime-picker";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class Detail extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      lists: [],
      isLastPage: false,
      isLoading: false,
      date: new Date(),
      datePickerDialog: false,
      dateHtp: '',
      activity: 'specifications_one'
    }

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginRight: 10
          }} onPress={() => {
            this.setState({datePickerDialog: true})
          }}>
            <Text style={{marginRight: pxToDp(10)}}>{dayjs(this.state.date).format('YYYY-MM')}</Text>
            <Entypo name='chevron-down' style={{fontSize: 22, color: '#000000'}}/>
          </TouchableOpacity>
        )
      }
    })
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const {productId, storeId,} = this.props.route.params
    const uri = `/api_products/inventory_detail_history?access_token=${this.props.global.accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props)(uri, {productId, storeId, page: this.state.page}).then(res => {
      const lists = (this.state.page === 1 ? [] : this.state.lists).concat(res.lists)
      this.setState({isLastPage: res.isLastPage, lists: lists, isLoading: false, page: res.page + 1})
    })
  }

  onRefresh() {
    this.setState({page: 1}, () => this.fetchData())
  }

  showDatePicker() {
    let {date} = this.state
    return <View style={{backgroundColor: colors.white}}>
      <DatePickerView value={date}
                      mode={"month"}
                      onChange={(value) => {
                        this.setState({dateHtp: dayjs(value).format('YYYY-MM'), date: value})
                      }
                      }>
      </DatePickerView>
      {/*<DateTimePicker*/}
      {/*    cancelTextIOS={'取消'}*/}
      {/*    confirmTextIOS={'修改'}*/}
      {/*    customHeaderIOS={() => {*/}
      {/*      return (<View/>)*/}
      {/*    }}*/}
      {/*    date={date}*/}
      {/*    mode='date'*/}
      {/*    isVisible={this.state.datePickerDialog}*/}
      {/*    onConfirm={(value) => {*/}
      {/*      this.setState({dateHtp: dayjs(value).format('YYYY-MM'), date: value, datePickerDialog: false})*/}
      {/*    }}*/}
      {/*    onCancel={() => {*/}
      {/*      this.setState({*/}
      {/*        datePickerDialog: false,*/}
      {/*      });*/}
      {/*    }}*/}
      {/*/>*/}
      <Button title={'确 认'}
        onPress={() => {
          this.setState({datePickerDialog: false})
          this.navigationOptions(this.props)
        }}
        buttonStyle={{
          backgroundColor: colors.main_color,
          borderRadius: pxToDp(20)
        }}

        titleStyle={{
          color: colors.white,
          fontSize: 16
        }}
      />
    </View>
  }

  renderList() {
    return (
        <For of={this.state.lists} each="item" index="idx">
          <View key={idx} style={styles.item}>
            <View style={styles.itemRow}>
              <Text style={styles.itemRowText}>操作时间：{item.updated} </Text>
              <If condition={item.operator_user}>
                <Text style={styles.itemRowText}>操作人：{item.operator_user.nickname} </Text>
              </If>
              <Text style={styles.itemRowText}>库存：{item.stock} </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemRowText}>操作类型：{item.operate_type} </Text>
              <Text style={styles.itemRowText}>{item.num > 0 ? `+${item.num}` : item.num} </Text>
            </View>
            <If condition={item.remark}>
              <View style={styles.itemRow}>
                <Text style={styles.itemRowText}>备注信息：{item.remark} </Text>
              </View>
            </If>
          </View>
        </For>
    )
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={{flexDirection: "column", justifyContent: "space-between", backgroundColor: colors.white, marginBottom: 10}}>
            <View style={{flexDirection: "row"}}>
              <TouchableOpacity style={this.state.activity === 'specifications_one' ? styles.tabActivity : styles.tab} onPress={() => this.setState({activity : 'specifications_one'})}>
                <Text style={this.state.activity === 'specifications_one' ? styles.tabTextActivity : styles.tabText}>规格1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.state.activity === 'specifications_two' ? styles.tabActivity : styles.tab} onPress={() => this.setState({activity : 'specifications_two'})}>
                <Text style={this.state.activity === 'specifications_two' ? styles.tabTextActivity : styles.tabText}>规格2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.state.activity === 'specifications_three' ? styles.tabActivity : styles.tab} onPress={() => this.setState({activity : 'specifications_three'})}>
                <Text style={this.state.activity === 'specifications_three' ? styles.tabTextActivity : styles.tabText}>规格3</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.lists.length ? <LoadMore
              loadMoreType={'scroll'}
              onLoadMore={() => this.fetchData()}
              bottomLoadDistance={50}
              renderList={this.renderList()}
              onRefresh={() => this.onRefresh()}
              isLastPage={this.state.isLastPage}
              isLoading={this.state.isLoading}
          /> : <EmptyData/>}
          <Modal visible={this.state.datePickerDialog}
                 onRequestClose={() => this.setState({datePickerDialog: false})}
                 transparent={true} animationType="fade"
          >
            <TouchableOpacity
                style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 2, minHeight: pxToDp(200)}}
                onPress={() => this.setState({datePickerDialog: false})}>
            </TouchableOpacity>
            {this.showDatePicker()}
          </Modal>
        </View>
    )
  }
}

export default connect(mapStateToProps)(Detail)

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: pxToDp(20),
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: color.fontGray
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pxToDp(10),
  },
  itemRowText: {
    fontSize: 12
  },
  tab: {flex: 1, alignItems: "center", justifyContent: "center", padding: 10},
  tabActivity: {flex: 1, borderBottomColor: colors.main_color, borderBottomWidth: 2, alignItems: "center", justifyContent: "center", padding: 10},
  tabText: {color: colors.title_color},
  tabTextActivity: {color: colors.main_color},
})
