import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Config from "../../pubilc/common/config";
import AppConfig from "../../pubilc/common/config";
import CommonStyle from "../../pubilc/util/CommonStyles";

import {getOrder, saveOrderBasic, saveUserTag} from "../../reducers/order/orderActions";
import {createTaskByOrder} from "../../reducers/remind/remindActions";
import {connect} from "react-redux";
import tool from "../../pubilc/util/tool";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";
import UserTagPopup from "../common/component/UserTagPopup";
import FetchEx from "../../pubilc/util/fetchEx";
import {WhiteSpace} from "@ant-design/react-native"

import {
  Cell,
  CellBody,
  CellFooter,
  CellHeader,
  Cells,
  CellsTitle,
  Dialog,
  Input,
  Label,
  Switch,
  TextArea,
} from "../../weui/index";
import IconEvilIcons from "react-native-vector-icons/EvilIcons";
import Cts from "../../pubilc/common/Cts";
import _ from "lodash";
import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {saveOrderBaisc: saveOrderBasic, getOrder, createTaskByOrder},
      dispatch
    )
  };
}

class OrderEditScene extends Component {
  constructor(props: Object) {
    super(props);

    this.state = {
      autoSaveUserBackup: true,
      backupPhone: "",
      detailAddr: "",
      storeRemark: "",
      taxInvoice: "",
      taxId: "",
      loc_data: "",
      editLogId: "",
      onSubmitting: false,
      onSendingConfirm: false,
      onSubmittingConfirm: false,
      confirmSent: false,
      errorHints: "",
      userTagPopupVisible: false,
      userTagPopupMulti: false,
      userTags: [],
      selectTagIds: []
    };

    this.editFields = [
      {
        key: "backupPhone",
        val: order => order.phone_backup,
        label: "备用电话"
      },
      {key: "detailAddr", val: order => order.address, label: "送货地址"},
      {
        key: "storeRemark",
        val: order => order.store_remark,
        label: "商家备注"
      },
      {key: "taxInvoice", val: order => order.invoice, label: "发票抬头"},
      {key: "taxId", val: order => order.taxer_id, label: "纳税人识别号"},
      {
        key: "loc_data",
        val: order => `${order.loc_lng},${order.loc_lat}`,
        label: "经纬度座标"
      }
    ];

    this._onChangeBackupPhone = this._onChangeBackupPhone.bind(this);
    this._onChangeAutoSaveBackup = this._onChangeAutoSaveBackup.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._shouldDisabledSaveBtn = this._shouldDisabledSaveBtn.bind(this);
    this._doSaveEdit = this._doSaveEdit.bind(this);
    this._toSetLocation = this._toSetLocation.bind(this);
    this._onChangeTaxInvoice = this._onChangeTaxInvoice.bind(this);
    this._onChangeTaxId = this._onChangeTaxId.bind(this);
    this._doSendRemind = this._doSendRemind.bind(this);
    this._back = this._back.bind(this);
    this._storeLoc = this._storeLoc.bind(this);
    this._buildNotifyRemark = this._buildNotifyRemark.bind(this);

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => this._doSaveEdit()}>
          <View
            style={{
              width: pxToDp(96),
              height: pxToDp(46),
              backgroundColor: colors.main_color,
              marginRight: 8,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center"
            }}>
            <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 保存 </Text>
          </View>
        </TouchableOpacity>
      )
    })
  };

  componentDidMount() {
    this.props.navigation.setParams({
      save: this._doSaveEdit,
      onPrint: this.onPrint
    });
  }

  UNSAFE_componentWillMount() {
    const {order} = this.props.route.params || {};
    const init = {autoSaveUserBackup: true, loc_name: order.street_block};
    this.editFields.map(edit => init[edit.key] = edit.val(order));

    this.setState(init);
  }

  getUserTagNames() {
    let names = _.pluck(this.state.userTags, 'name');
    if (_.isEmpty(names)) {
      return '点击选择标签'
    } else {
      return names.join(',')
    }
  }

  _storeLoc() {
    const {order} = this.props.route.params || {};
    if (order) {
      const store = tool.store(this.props.global, order.store_id);
      return store ? `${store.loc_lng},${store.loc_lat}` : "0,0";
    }
    return "0,0"
  }

  _onChangeBackupPhone(backupPhone) {
    const {order} = this.props.route.params;
    if (order.mobile === backupPhone) {
      this.setState({errorHints: "备用电话不能与订单电话相同"});
      return;
    }
    this.setState({backupPhone});
  }

  _onChangeAutoSaveBackup(autoSaveUserBackup) {
    this.setState({autoSaveUserBackup});
  }

  setAddress(res) {
    this.setState({
      loc_data: res.location,
      detailAddr: res.address,
    })
  }

  _toSetLocation() {
    const {state, navigate} = this.props.navigation;
    const params = {
      isType: "OrderEdit",
      action: Config.LOC_PICKER,
      center:
        this.state.loc_data === "0,0" || !this.state.loc_data
          ? this._storeLoc()
          : this.state.loc_data,
      onBack: (res) => {
        this.setAddress.bind(this)(res)
      },
    };
    navigate(Config.ROUTE_SEARC_HSHOP, params);
  }

  _onChangeDetailAddr(detailAddr) {
    this.setState({detailAddr});
  }

  _onChangeTaxId(taxId) {
    this.setState({taxId});
  }

  _onChangeTaxInvoice(taxInvoice) {
    this.setState({taxInvoice});
  }

  _buildNotifyRemark() {
    const {order} = this.props.route.params;

    const changes = this.editFields
      .filter(edit => this.state[edit.key] !== edit.val(order))
      .map(edit => {
        return edit.label;
      });

    return changes ? `修改了${changes.join(",")}` : "没有修改";
  }

  _doSaveEdit() {
    const {dispatch, global} = this.props;
    const {order} = this.props.route.params;

    const changes = this.editFields
      .filter(edit => this.state[edit.key] !== edit.val(order))
      .reduce((previous, edit) => {
        previous[edit.key] = this.state[edit.key];
        return previous;
      }, {});


    if (!_.isEmpty(changes)) {
      showModal('提交中')
      this.setState({onSubmitting: true});
      const token = global.accessToken;
      dispatch(
        saveOrderBasic(token, order.id, changes, (ok, msg, respData) => {
          hideModal()
          if (ok) {
            const stateUpdating = {
              onSendingConfirm: true,
              onSubmitting: false
            };
            if (respData.log_id) {
              stateUpdating.editLogId = respData.log_id;
            }
            this.setState(stateUpdating);
            dispatch(getOrder(token, order.id));
          } else {
            this.setState({
              onSubmitting: false,
              errorHints: "保存失败:" + msg
            });
          }
        })
      );
    } else {
      this.setState({errorHints: "没有修改需要保存"});
    }
  }

  _back() {
    this.setState({onSendingConfirm: false});
    const {navigation} = this.props;
    navigation.goBack();
  }

  _doSendRemind() {
    const {dispatch, global} = this.props;
    const {order} = this.props.route.params;
    this.setState({onSendingConfirm: false, onSubmittingConfirm: true});
    showModal('正在发送订单修改通知')
    const remark = this._buildNotifyRemark();

    dispatch(
      createTaskByOrder(
        global.accessToken,
        order.id,
        Cts.TASK_TYPE_ORDER_CHANGE,
        remark,
        "",
        Cts.TASK_SERIOUS,
        this.state.editLogId,
        (ok, msg) => {
          hideModal()
          if (ok) {
            showSuccess('发送成功')
            setTimeout(() => {
              this._back();
            }, 2000);
          } else {
            this.setState({
              errorHints:
                "发送通知时发生错误：" + msg + ", 请使用其他方式通知门店",
              onSubmittingConfirm: false
            });
            this._errorHintsCallback = () => {
              this._back();
            };
          }
        }
      )
    );
  }

  _shouldDisabledSaveBtn() {
    const {order} = this.props.route.params;

    const ts = this.editFields.filter(
      edit => this.state[edit.key] !== edit.val(order)
    );
    return tool.length(ts) === 0;
  }


  render() {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[styles.container, {flex: 1}]}>
        <Dialog
          onRequestClose={() => {
            if (this._errorHintsCallback) this._errorHintsCallback();
          }}
          visible={!!this.state.errorHints}
          buttons={[
            {
              type: "default",
              label: "知道了",
              onPress: () => {
                this.setState({errorHints: ""});
              }
            }
          ]}
        >
          <Text style={{color: colors.color333}}>{this.state.errorHints} </Text>
        </Dialog>

        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.onSendingConfirm}
          buttons={[
            {
              type: "default",
              label: "不发送",
              onPress: this._back
            },
            {
              type: "primary",
              label: "发送提醒",
              onPress: this._doSendRemind
            }
          ]}
        >
          <Text style={{color: colors.color333}}>语音循环提示门店，直到门店确认看到修改信息为止 </Text>
        </Dialog>

        <CellsTitle style={CommonStyle.cellsTitle35}>备用手机号</CellsTitle>
        <Cells style={CommonStyle.cells35}>
          <Cell>
            <CellHeader>
              <Label style={CommonStyle.cellTextH35W70}>手机号</Label>
            </CellHeader>
            <CellBody>
              <Input
                placeholder="仅支持大陆手机号"
                keyboardType="numeric"
                value={this.state.backupPhone}
                onChangeText={this._onChangeBackupPhone}
                underlineColorAndroid={"transparent"}
                style={CommonStyle.inputH35}
              />
            </CellBody>
          </Cell>
          <Cell>
            <CellHeader>
              <Label style={[CommonStyle.cellTextH35W70, {fontSize: 12}]}>
                保存到客户
              </Label>
            </CellHeader>
            <Switch
              onChange={this._onChangeAutoSaveBackup}
              value={this.state.autoSaveUserBackup}
            />
          </Cell>
        </Cells>

        <CellsTitle style={CommonStyle.cellsTitle35}>地址</CellsTitle>
        <Cells style={CommonStyle.cells35}>
          <Cell onPress={this._toSetLocation}>
            <CellHeader>
              <Label style={CommonStyle.cellTextH35W70}>导航坐标</Label>
            </CellHeader>
            <CellBody style={{flexDirection: "row", flex: 1}}>
              <IconEvilIcons name="location" size={26}/>
              <Text style={{fontSize: 15}}>
                {this.state.loc_name || this.state.loc_data}
              </Text>
            </CellBody>
            <CellFooter access/>
          </Cell>
          <Cell>
            <CellHeader>
              <Label style={CommonStyle.cellTextH35W70}>文字地址</Label>
            </CellHeader>
            <CellBody>
              <Input
                placeholder="例：黄庄南里 16号楼2单元1102"
                value={this.state.detailAddr}
                onChangeText={this._onChangeDetailAddr}
                underlineColorAndroid={"transparent"}
                style={[CommonStyle.inputH35, {fontSize: 12}]}
              />
            </CellBody>
          </Cell>
        </Cells>

        <CellsTitle style={CommonStyle.cellsTitle35}>商家备注</CellsTitle>
        <Cells style={CommonStyle.cells35}>
          <Cell>
            <CellBody>
              <TextArea
                multiline={true}
                numberOfLines={4}
                maxLength={60}
                placeholder=""
                onChange={v => {
                  this.setState({storeRemark: v});
                }}
                value={this.state.storeRemark}
                underlineColorAndroid={"transparent"}
              />
            </CellBody>
          </Cell>
        </Cells>

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
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderEditScene);
