import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CommonStyle from "../../common/CommonStyles";

import {getOrder, saveOrderBasic} from "../../reducers/order/orderActions";
import {createTaskByOrder} from "../../reducers/remind/remindActions";
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {InputItem, Modal, WhiteSpace} from "@ant-design/react-native"

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
import {List} from "react-native-elements";
import SearchStore from "../component/SearchStore";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import {ToastLong} from "../../util/ToastUtils";

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
      orders: [
          "饿了吗-菜鸟食材",
          "美团菜鸟食材（北苑店）",
          "美团菜鸟食材（亚运村店）"
      ],
      flag: false,
      searchStoreVisible: false
    };

    this.onCanChangeStore = this.onCanChangeStore.bind(this);

    this.navigationOptions(this.props)
      console.log(this.props)
  }

  componentDidMount() {}

 UNSAFE_componentWillMount() {}

  _back() {
    this.setState({onSendingConfirm: false});
    const {navigation} = this.props;
    navigation.goBack();
  }

  modalType(searchStoreVisible) {
    this.setState({
      searchStoreVisible: searchStoreVisible
    })
  }
  onCancel() {
    this.setState({
      flag: false
    })
  }

  onCanChangeStore (store_id) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(
        userCanChangeStore(store_id, accessToken, resp => {
          if (resp.obj.auth_store_change) {
            this._doChangeStore(store_id);
          } else {
            ToastLong("您没有该店访问权限, 如需访问请向上级申请");
          }
        })
    );
  }

  render() {
    return (
      <ScrollView style={[styles.container, {flex: 1}]}>

        <TouchableOpacity onPress={() => {this.modalType(true)}}>
          <Cells style={{}}>
            <Cell>
              <CellHeader>
                <Label style={{color: colors.fontBlack}}>发</Label>
              </CellHeader>
              <CellBody>
                <Input
                    editable={false}
                    placeholder="请选择发货地址"
                    keyboardType="numeric"
                    value={''}
                    onChangeText={''}
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                />
              </CellBody>
              <CellFooter access/>
            </Cell>
          </Cells>
        </TouchableOpacity>

        <Cells style={{}}>
            <Cell>
                <CellHeader>
                    <Label style={{color: colors.fontBlack}}>收</Label>
                </CellHeader>
                <CellBody>
                    <Input
                        placeholder="请选择收货人地址"
                        keyboardType="numeric"
                        value={''}
                        onChangeText={''}
                        underlineColorAndroid={"transparent"}
                        style={CommonStyle.inputH35}
                        editable={false}
                    />
                </CellBody>
              <CellFooter access/>
            </Cell>
        </Cells>

        <Cell>
          <CellBody>
            <List>
              <InputItem
                  value={this.state.value}
                  onChange={value => {
                    this.setState({
                      value,
                    });
                  }}
                  placeholder="楼号、单元、门牌号等"
              />
              <InputItem
                  value={this.state.value}
                  onChange={value => {
                    this.setState({
                      value,
                    });
                  }}
                  placeholder="收货人姓名"
              />
              <InputItem
                  value={this.state.value}
                  onChange={value => {
                    this.setState({
                      value,
                    });
                  }}
                  placeholder="收货人电话(分机号选填)"
              />
            </List>
          </CellBody>
        </Cell>

        <Cells style={{}}>
          <Cell onPress={this._toSetLocation}>
            <CellHeader>
              <Label style={{color: colors.fontBlack}}>期望送达时间</Label>
            </CellHeader>
            <CellBody style={{flexDirection: "row", flex: 1}}>
            </CellBody>
            <CellFooter access>立即送达</CellFooter>
          </Cell>
        </Cells>

        <Cells style={{}}>
          <Cell onPress={this._toSetLocation}>
            <CellHeader>
              <Label style={{color: colors.fontBlack}}>重量</Label>
            </CellHeader>
            <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
              <Input
                  placeholder=""
                  style={{borderColor: "black", borderWidth: 1, height: pxToDp(70), width: pxToDp(100)}}
                  keyboardType="numeric"
                  // value={''}
                  // onChangeText={''}
                  underlineColorAndroid={"transparent"}
              />
            </CellBody>
            <CellFooter>千克</CellFooter>
          </Cell>
        </Cells>

        <Cells style={{}}>
          <Cell onPress={this._toSetLocation}>
            <CellHeader>
              <Label style={{color: colors.fontBlack}}>订单金额</Label>
            </CellHeader>
            <CellBody style={{flexDirection: "row", justifyContent: "flex-end"}}>
              <Input
                  placeholder=""
                  style={{borderColor: "black", borderWidth: 1, height: pxToDp(70), width: pxToDp(100), marginRight: pxToDp(30)}}
                  keyboardType="numeric"
                  // value={''}
                  // onChangeText={''}
                  underlineColorAndroid={"transparent"}
              />
            </CellBody>
            <CellFooter>元</CellFooter>
            <CellsTips style={{position: "absolute", left: pxToDp(-30), top: pxToDp(80)}}>保价时需填写</CellsTips>
          </Cell>
        </Cells>

        <CellsTitle style={{fontSize: pxToDp(28), color: colors.fontBlack}}>订单备注</CellsTitle>
        <Cells style={CommonStyle.cells35}>
          <Cell>
            <CellBody>
              <TextArea
                maxLength={60}
                placeholder="请输入备注内容"
                onChange={v => {
                  this.setState({storeRemark: v});
                }}
                value={this.state.storeRemark}
                underlineColorAndroid={"transparent"}
              />
            </CellBody>
          </Cell>
        </Cells>

        <WhiteSpace/>

        <View style={{flexDirection: "row", justifyContent: "space-around"}}>
          <TouchableOpacity onPress={() => {}}>
            <View
                style={{
                  width: pxToDp(196),
                  height: pxToDp(56),
                  backgroundColor: colors.back_color,
                  marginRight: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1
                }} >
              <Text style={{color: colors.title_color, fontSize: 14, fontWeight: "bold"}} > 保存 </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <View
                style={{
                  width: pxToDp(196),
                  height: pxToDp(56),
                  backgroundColor: colors.editStatusDeduct,
                  marginRight: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1
                }} >
              <Text style={{color: colors.title_color, fontSize: 14, fontWeight: "bold"}} > 保存并发单 </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/*<Modal*/}
        {/*    visible={this.state.flag}*/}
        {/*    animationType={"slide"}*/}
        {/*    onRequestClose={() => this.onCancel()}*/}
        {/*    transparent={false}*/}
        {/*    style={styles.containerModal}*/}
        {/*>*/}
          <SearchStore visible={this.state.searchStoreVisible}
                       onClose={() => this.setState({searchStoreVisible: false})}
                       onSelect={(item) => {
                         this.onCanChangeStore(item.id);
                         this.setState({searchStoreVisible: false})
                       }}/>
        {/*</Modal>*/}

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
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderSettingScene);
