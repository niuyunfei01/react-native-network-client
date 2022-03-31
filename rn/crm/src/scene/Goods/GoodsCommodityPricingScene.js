import React from 'react'
import {
  InteractionManager,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import BaseComponent from "../BaseComponent";
import colors from "../../styles/colors";
import {DatePickerView} from "@ant-design/react-native"
import { Button } from 'react-native-elements';
import dayjs from "dayjs";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class Operation extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      isRefreshing: false,
      date: new Date(),
      datePickerDialog: false,
      dateHtp: '',
      total: 0,
      productLogDown: 0,
      productLogUp: 0
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchProductLogData()
  }

  fetchProductLogData() {
    const {accessToken, currStoreId} = this.props.global;
    const self = this
    self.setState({isRefreshing: true})
    HttpUtils.get.bind(this.props)(`/api/store_product_log/${currStoreId}/${this.state.dateHtp}?access_token=${accessToken}`).then(res => {
      self.setState({
        isRefreshing: false,
        total: res.total,
        productLogDown: res.productLogDown,
        productLogUp: res.productLogUp
      })
    }).catch(() => {
      self.setState({isRefreshing: false})
    })
  }

  navigate(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  showDatePicker() {
    let {date} = this.state
    return <View>
      <DatePickerView value={date} minDate={new Date()}
                      mode={"month"}
                      onChange={(value) => {
                        this.setState({dateHtp: dayjs(value).format('YYYY-MM'), date: value})
                      }
                      }>
      </DatePickerView>
      <Button title={'确 认'}
              onPress={() => {
                this.setState({datePickerDialog : false})
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

  render() {
    return (
        <ScrollView
            refreshControl={
              <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={() => this.fetchProductLogData()}
              />
            }>

          <View style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), marginVertical: pxToDp(20), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%'}}>
            <Text style={{fontSize: pxToDp(34)}}>选择月份</Text>
            <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: pxToDp(1), borderRadius: pxToDp(10), paddingHorizontal: pxToDp(20)}} onPress={() => {
              this.setState({datePickerDialog: true})
            }}>
              <Text style={{marginRight: pxToDp(70)}}>{dayjs(this.state.date).format('YYYY-MM')} </Text>
              <Entypo name='calendar' style={{fontSize: 20, color: '#000000'}}/>
            </TouchableOpacity>
            <Button title={'查 询'}
                    onPress={() => {
                      this.fetchProductLogData()
                    }}
                    buttonStyle={{
                      backgroundColor: colors.white,
                      borderWidth: pxToDp(1),
                      borderColor: '#59B26A',
                      borderRadius: pxToDp(20),
                      paddingVertical: pxToDp(5)
                    }}

                    titleStyle={{
                      color: '#59B26A',
                      fontSize: 16
                    }}
            />
          </View>

          <View style={{flexDirection: "column", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, width: '98%', marginLeft: '1%', paddingVertical: '3%'}}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: pxToDp(1), borderColor: colors.colorBBB, paddingBottom: pxToDp(10)}}>
              <Text style={{fontSize: pxToDp(40)}}>{this.state.date.getMonth() + 1}月调价商品记录 </Text>
              <Text style={{fontSize: pxToDp(30), color: '#999999'}}>共计{this.state.total}个</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: pxToDp(1), borderColor: colors.colorBBB, paddingVertical: pxToDp(20)}}>
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <Entypo name='arrow-up' style={{fontSize: 20, color: '#E13030', marginTop: pxToDp(4)}}/>
                <Text style={{fontSize: pxToDp(32), color: '#E13030'}}>涨价商品</Text>
              </View>
              <Text style={{fontSize: pxToDp(30), color: '#999999'}}>共计{this.state.productLogUp}个</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: pxToDp(1), borderColor: colors.colorBBB, paddingVertical: pxToDp(20)}}>
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <Entypo name='arrow-down' style={{fontSize: 20, color: '#59B26A', marginTop: pxToDp(4)}}/>
                <Text style={{fontSize: pxToDp(32), color: '#59B26A'}}>降价商品</Text>
              </View>
              <Text style={{fontSize: pxToDp(30), color: '#999999'}}>共计{this.state.productLogDown}个</Text>
            </View>
          </View>

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

        </ScrollView>
    )
  }
}

export default connect(mapStateToProps)(Operation)
