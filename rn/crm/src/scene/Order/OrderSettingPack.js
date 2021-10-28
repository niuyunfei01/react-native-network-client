import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CommonStyle from "../../common/CommonStyles";

import {getOrder, saveOrderBasic} from "../../reducers/order/orderActions";
import {createTaskByOrder} from "../../reducers/remind/remindActions";
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {DatePicker, InputItem, WhiteSpace, List, Provider} from "@ant-design/react-native"
import {
  Cell,
  CellBody,
  CellFooter,
  CellHeader,
  Cells, CellsTips,
  CellsTitle,
  Input,
  Label,
  TextArea
} from "../../weui/index";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import IconEvilIcons from "react-native-vector-icons/EvilIcons";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Config from "../../config";
import {tool} from "../../common";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import JbbText from "../component/JbbText";
import Dialog from "../component/Dialog";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {saveOrderBaisc: saveOrderBasic, getOrder, createTaskByOrder, userCanChangeStore},
      dispatch
    )
  };
}

class OrderSettingScene extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: "创建订单"
    })
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      flag: false,
      loc_data: "",
      loc_name: "",
      confirmModalVisible: false,
      time: undefined,
      timeStr: '',
      remark: '',
      isOperating: false,
      call_date: '',
      value: '',
      datePickerValue: undefined,
      dateTimeValue: undefined,
      address: '',
      name: '',
      phone: '',
      tabs: [
        {title: "北京菜鸟食材（北苑店）"},
        {title: "北京菜鸟食材（111）"}
      ],
      location_long: '',
      val:'请选择发货地址',
      location_lat: '',
      weight: undefined,
      orderAmount: undefined
    };

    this._toSetLocation = this._toSetLocation.bind(this);
    this._storeLoc = this._storeLoc.bind(this);

    this.navigationOptions(this.props)
  }

  componentDidMount() {
  }

  UNSAFE_componentWillMount() {
  }

  onDateChange(value) {
    this.setState({
      datePickerValue: value
    })
  }

  onDateTimeChange(value) {
    this.setState({
      dateTimeValue: value
    })
  }

  modalType(flag) {
    this.setState({
      flag: flag
    })
  }

  onCancel() {
    this.setState({
      flag: false
    })
  }

  _toSetLocation() {
    const {location_long, location_lat} = this.state
    let center = ""
    if (location_long && location_lat) {
      center = `${location_long},${location_lat}`
    }
    const params = {
      action: Config.LOC_PICKER,
      center: center,
      actionBeforeBack: resp => {
        let {name, address} = resp;
        let locate = name;
        let locate1 = address;
        this.setState({
          location_long: locate,
          location_lat: locate1
        });
      }
    };
    this.onPress(Config.ROUTE_WEB, params);
  }

  _storeLoc() {
    const {order} = this.props.route.params || {};
    if (order) {
      const store = tool.store(this.props.global, order.store_id);
      return store ? `${store.loc_lng},${store.loc_lat}` : "0,0";
    }
    return "0,0"
  }

  showDeliveryAddress() {
    let items = []
    let that = this
    let tab = that.state.tabs[0].title
    for (let i in this.state.tabs) {
      const tabs = that.state.tabs[i]
      items.push(
          <RadioItem key={i}
                     style={{fontSize: 12, fontWeight: "bold", backgroundColor: colors.white}}
                     checked={tab === tabs.title}
                     onChange={(event) => {
                       if (event.target.checked) {
                       }{
                         this.setState({
                           flag: false,
                           val:tabs.title
                         })
                       }
                     }}
          >
            <JbbText style={{color: colors.fontBlack}}>{tabs.title}</JbbText>
          </RadioItem>)
    }
    return <List style={{marginTop: 8}}>
      {items}
    </List>
  }

  onPress (route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }
  render() {
    const {location_long, location_lat} = this.state
    return (
        <ScrollView style={[styles.container, {flex: 1}]}>

          <Cells style={{}}>
            <Cell onPress={() => {
              this.modalType(true)
            }} style={styles.deliverCellBorder}>
              <CellHeader>
                <Label style={styles.cellLabel}>发</Label>
              </CellHeader>
              <CellBody>
                <Input
                    editable={false}
                    placeholder="请选择发货地址"
                    value={this.state.val}
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                    clearButtonMode={true}
                />
              </CellBody>
              <CellFooter access style={{marginRight: pxToDp(20)}}/>
            </Cell>
          </Cells>

          <Cells style={{}}>
            <Cell onPress={this._toSetLocation} style={styles.deliverCellBorder}>
              <CellHeader>
                <Label style={styles.cellLabel}>收</Label>
              </CellHeader>
              <CellBody style={{flexDirection: "row", flex: 1}}>
                <Input
                    placeholder="请选择收货人地址"
                    keyboardType="numeric"
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                    editable={false}
                >
                  {/*<IconEvilIcons name="location" size={26} color={colors.color666}/>*/}
                  <MIcon name="map-marker-outline"  size={26}/>
                  <Text style={[styles.body_text]}>
                    {(location_long !== "" && location_lat !== "")
                    && `${location_long}(${location_lat})`}
                  </Text>
                </Input>
              </CellBody>
              <TouchableOpacity>
                <CellFooter access/>
              </TouchableOpacity>
            </Cell>
          </Cells>

          <Cell style={styles.addressDetail}>
            <CellBody>
              <List>
                <InputItem
                    value={this.state.address}
                    onChangeText={value => {
                      this.setState({
                        address: value
                      });
                    }}
                    placeholder="楼号、单元、门牌号等"
                />
                <InputItem
                    value={this.state.name}
                    onChangeText={value => {
                      this.setState({
                        name: value
                      });
                    }}
                    placeholder="收货人姓名"
                />
                <InputItem
                    value={this.state.phone}
                    onChangeText={value => {
                      this.setState({
                        phone: value
                      });
                    }}
                    placeholder="收货人电话(分机号选填)"
                />
              </List>
            </CellBody>
          </Cell>

          <Provider>
            <View>
              <List>
                <DatePicker
                    value={this.state.datePickerValue}
                    mode="date"
                    defaultDate={new Date()}
                    minuteStep={1}
                    minDate={new Date()}
                    onChange={(value) => this.onDateChange(value)}
                    format="YYYY-MM-DD"
                    title="预约时间"
                >
                  <List.Item arrow="horizontal">期望送达日期</List.Item>
                </DatePicker>
              </List>
            </View>
          </Provider>

          <Provider>
            <View>
              <List>
                <DatePicker
                    value={this.state.dateTimeValue}
                    mode="time"
                    defaultDate={new Date()}
                    minuteStep={10}
                    onChange={(value) => this.onDateTimeChange(value)}
                    format="YYYY-MM-DD"
                    title="预约时间"
                    onOk={() => {
                      this.onDateTimeChange()
                    }}
                >
                  <List.Item arrow="horizontal">期望送达时间</List.Item>
                </DatePicker>
              </List>
            </View>
          </Provider>

          <Cells style={{}}>
            <Cell onPress={{}}>
              <CellHeader>
                <Label style={styles.labelFontStyle}>重量</Label>
              </CellHeader>
              <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
                <Input
                    placeholder=""
                    style={{borderColor: "black", borderWidth: 1, height: pxToDp(70), width: pxToDp(100)}}
                    keyboardType="numeric"
                    value={this.state.weight}
                    onChangeText={value => {
                      this.setState({
                        weight: value
                      })
                    }}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
              <CellFooter>千克</CellFooter>
            </Cell>
          </Cells>

          <Cells style={{}}>
            <Cell onPress={{}}>
              <CellHeader>
                <Label style={styles.labelFontStyle}>订单金额</Label>
              </CellHeader>
              <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
                <Input
                    placeholder=""
                    style={{
                      borderColor: "black",
                      borderWidth: 1,
                      height: pxToDp(70),
                      width: pxToDp(100),
                      marginRight: pxToDp(30)
                    }}
                    keyboardType="numeric"
                    value={this.state.orderAmount}
                    onChangeText={value => {
                      this.setState({
                        orderAmount: value
                      })
                    }}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
              <CellFooter>元</CellFooter>
              <CellsTips style={{position: "absolute", left: pxToDp(-25), top: pxToDp(80), fontSize: pxToDp(20), color: colors.warn_color}}>保价时需填写</CellsTips>
            </Cell>
          </Cells>

          <CellsTitle style={{fontSize: pxToDp(28), color: colors.fontBlack}}>订单备注</CellsTitle>
          <Cells style={CommonStyle.cells35}>
            <Cell>
              <CellBody>
                <TextArea
                    maxLength={60}
                    placeholder="请输入备注内容"
                    onChange={value => {
                      this.setState({storeRemark: value});
                    }}
                    value={this.state.storeRemark}
                    underlineColorAndroid={"transparent"}
                />
              </CellBody>
            </Cell>
          </Cells>

          <WhiteSpace/>

          <View style={{flexDirection: "row", justifyContent: "space-around"}}>
            <TouchableOpacity onPress={() => {
            }}>
              <View
                  style={styles.saveButtonStyle1}>
                <Text style={styles.saveButtonStyle}> 保存 </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
            }}>
              <View
                  style={styles.saveSendButtonStyle}>
                <Text style={styles.saveButtonStyle}> 保存并发单 </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Dialog visible={this.state.flag} onRequestClose={() => {
            this.setState({
              flag: false
            })
          }}>
            {this.showDeliveryAddress()}
          </Dialog>

          <WhiteSpace/>

        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999
  },
  cells: {
    marginTop: 0
  },
  body_text: {
    paddingLeft: pxToDp(8),
    fontSize: pxToDp(30),
    color: colors.color333,
    height: pxToDp(60),
    textAlignVertical: "center"
  },
  containerModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fontGray,
  },
  deliverCellBorder: {
    borderTopColor: colors.editStatusDeduct,
    borderBottomColor: colors.editStatusDeduct,
    borderWidth: 1
  },
  cellLabel: {
    color: colors.fontBlack,
    paddingLeft: pxToDp(50),
    fontWeight: "bold"
  },
  labelFontStyle: {
    color: colors.fontBlack
  },
  saveButtonStyle: {
    color: colors.title_color,
    fontSize: 14,
    fontWeight: "bold"
  },
  saveSendButtonStyle: {
    width: pxToDp(196),
    height: pxToDp(66),
    backgroundColor: colors.editStatusDeduct,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1
  },
  saveButtonStyle1: {
    width: pxToDp(196),
    height: pxToDp(66),
    backgroundColor: colors.back_color,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1
  },
  addressDetail: {
    marginVertical: pxToDp(20)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderSettingScene);
