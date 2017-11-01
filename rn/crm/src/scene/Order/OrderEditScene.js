import React, { Component } from 'react'
import {bindActionCreators} from "redux";
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import Config from '../../config'
import CommonStyle from '../../common/CommonStyles'

import {saveOrderBaisc, getOrder} from '../../reducers/order/orderActions'
import {createTaskByOrder} from '../../reducers/remind/remindActions'
import {connect} from "react-redux";
import {tool} from '../../common';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, Switch, TextArea, ButtonArea, Toast, Label, Dialog, Cells, Input, CellsTitle, Cell, CellHeader, CellFooter, CellBody, CellsTips} from "../../weui/index";
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';
import NavigationItem from "../../widget/NavigationItem";
import Cts from "../../Cts";
import _ from 'underscore';

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({saveOrderBaisc, getOrder, createTaskByOrder }, dispatch)}
}

class OrderEditScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    // disabled={this._shouldDisabledSaveBtn()}
    return {
      // headerTitle: '修改订单信息',
      // headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>修改订单信息</Text>
        </View>
      ),
      headerRight: <NavigationItem
          containerStyle = {{width: pxToDp(96), height: pxToDp(46), backgroundColor: colors.main_color, flex: 0, marginRight: 8}}
          titleStyle={{color: colors.white, fontSize: 14, fontWeight: 'bold', margin: 0}}
          title="保存"
          onPress={() => {params.save()}}
        />
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      autoSaveUserBackup: true,
      backupPhone: '',
      detailAddr: '',
      storeRemark: '',
      taxInvoice: '',
      taxId: '',
      loc_data: '',
      editLogId: '',
      onSubmitting: false,
      onSendingConfirm: false,
      onSubmittingConfirm: false,
      confirmSent: false,
      errorHints: '',
    };

    this.editFields = [
      {key: 'backupPhone', val: (order) => order.phone_backup, label: '备用电话'},
      {key: 'detailAddr', val: (order) => order.address, label: '送货地址'},
      {key: 'storeRemark', val: (order) => order.store_remark, label: '商家备注'},
      {key: 'taxInvoice', val: (order) => order.invoice, label: '发票抬头'},
      {key: 'taxId', val: (order) => order.taxer_id, label: '纳税人识别号'},
      {key: 'loc_data', val: (order) => `${order.loc_lng},${order.loc_lat}`, label: '经纬度座标'},
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
  }

  componentDidMount() {
    this.props.navigation.setParams({save: this._doSaveEdit, onPrint: this.onPrint});
  }

  componentWillMount() {
    const {order} = (this.props.navigation.state.params || {});
    const init = {
      autoSaveUserBackup: true,
      loc_name: order.street_block,
    };
    this.editFields.map((edit) => {
      init[edit.key] = edit.val(order);
    });

    this.setState(init)
  }

  _storeLoc() {
    const {order} = (this.props.navigation.state.params || {});
    const store = tool.store(order.store_id, this.props.global);
    return store ? `${store.loc_lng},${store.loc_lat}` : '0,0';
  }

  _onChangeBackupPhone(backupPhone) {
    const {order} = this.props.navigation.state.params;
    if (order.mobile === backupPhone) {
      this.setState({errorHints: '备用电话不能与订单电话相同'});
      return;
    }
    this.setState({backupPhone});
  }

  _onChangeAutoSaveBackup(autoSaveUserBackup) {
    this.setState({autoSaveUserBackup});
  }

  _toSetLocation() {
    const {state, navigate} = this.props.navigation;
    const params = {
      action: Config.LOC_PICKER,
      center: this.state.loc_data === '0,0' || !this.state.loc_data ? this._storeLoc() : this.state.loc_data,
      actionBeforeBack: (location) => {
        console.log('update to new location:', location);
        this.setState({
          loc_name: location.name,
          loc_data: location.location,
        });
      }
    };
    navigate(Config.ROUTE_WEB, params);
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
    const {order} = this.props.navigation.state.params;

    const changes = this.editFields.filter((edit) => this.state[edit.key] !== edit.val(order))
      .map((edit) => {
        return edit.label;
      });

    return changes ? `修改了${changes.join(',')}` : '没有修改';
  }

  _doSaveEdit() {
    const {dispatch, global} = this.props;
    const {order} = this.props.navigation.state.params;

    const changes = this.editFields.filter((edit) => this.state[edit.key] !== edit.val(order))
      .reduce((previous, edit) => {
        previous[edit.key] = this.state[edit.key];
        return previous;
      }, {});

    console.log('changes', changes);

    if (!_.isEmpty(changes)) {
      
      this.setState({onSubmitting: true});
      const token = global.accessToken;
      dispatch(saveOrderBaisc(token, order.id, changes, (ok, msg, respData) => {
        console.log('results', ok, msg);

        if (ok) {
          const stateUpdating = {onSendingConfirm: true, onSubmitting: false};
          if (respData.log_id) {
            stateUpdating.editLogId = respData.log_id;
          }
          this.setState(stateUpdating);
          dispatch(getOrder(token, order.id));
        } else {
          this.setState({onSubmitting: false, errorHints: '保存失败:'+msg});
        }
      }));
    } else {
      this.setState({errorHints: '没有修改需要保存'})
    }
  }

  _back() {
    this.setState({onSendingConfirm: false});
    const {navigation} = this.props;
    navigation.goBack();
  }

  _doSendRemind() {
    const {dispatch, global} = this.props;
    const {order} = this.props.navigation.state.params;
    this.setState({onSendingConfirm: false, onSubmittingConfirm: true});

    const remark = this._buildNotifyRemark();

    dispatch(createTaskByOrder(global.accessToken, order.id, Cts.TASK_TYPE_ORDER_CHANGE, remark, '', Cts.TASK_SERIOUS,
      this.state.editLogId, (ok, msg) => {
      if (ok) {
        this.setState({
          onSubmittingConfirm: false,
          confirmSent: true,
        });
        setTimeout(() => {
          this.setState({confirmSent: false});
          this._back();
        }, 2000);
      } else {
        this.setState({
          errorHints: '发送通知时发生错误：' + msg + ', 请使用其他方式通知门店',
          onSubmittingConfirm: false,
        });
        this._errorHintsCallback = () => {
          this._back();
        };
      }
    }));
  }

  _shouldDisabledSaveBtn() {
    const {order} = this.props.navigation.state.params;

    const ts = this.editFields.filter((edit) => this.state[edit.key] !== edit.val(order));
    return ts.length === 0;
  }

  render() {
    return <ScrollView style={[styles.container, {flex: 1}]}>
          <Dialog onRequestClose={()=>{ if(this._errorHintsCallback) this._errorHintsCallback();}}
            visible={!!this.state.errorHints}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {this.setState({errorHints: ''})}
            }]}
          ><Text>{this.state.errorHints}</Text></Dialog>

      <Dialog onRequestClose={()=>{}}
              visible={this.state.onSendingConfirm}
              buttons={[{
                type: 'default',
                label: '不发送',
                onPress: this._back
              }, {
                type: 'primary',
                label: '发送提醒',
                onPress: this._doSendRemind
              }]}
      ><Text>语音循环提示门店，直到门店确认看到修改信息为止</Text></Dialog>

      <CellsTitle style={CommonStyle.cellsTitle35}>备用手机号</CellsTitle>
      <Cells style={CommonStyle.cells35}>
        <Cell>
          <CellHeader><Label style={CommonStyle.cellTextH35W70}>手机号</Label></CellHeader>
          <CellBody>
            <Input
              placeholder="仅支持大陆手机号"
              keyboardType='numeric'
              value={this.state.backupPhone}
              onChangeText={this._onChangeBackupPhone}
              underlineColorAndroid={'transparent'}
              style={CommonStyle.inputH35}
            />
          </CellBody></Cell>
        <Cell>
          <CellHeader><Label style={[CommonStyle.cellTextH35W70, {fontSize: 12}]}>保存到客户</Label></CellHeader>
          <Switch onChange={this._onChangeAutoSaveBackup} value={this.state.autoSaveUserBackup}/>
        </Cell>
      </Cells>

      <CellsTitle style={CommonStyle.cellsTitle35}>地址</CellsTitle>
      <Cells style={CommonStyle.cells35}>
        <Cell onPress={this._toSetLocation}><CellHeader><Label style={CommonStyle.cellTextH35W70}>导航座标</Label></CellHeader>
          <CellBody style={{flexDirection: 'row', flex: 1}}>
            <IconEvilIcons name="location" size={26}/>
            <Text style={{fontSize: 15}}>{this.state.loc_name || this.state.loc_data}</Text>
          </CellBody>
          <CellFooter access/>
        </Cell>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35W70}>文字地址</Label></CellHeader>
          <CellBody><Input
            placeholder="例：黄庄南里 16号楼2单元1102"
            value={this.state.detailAddr}
            onChangeText={this._onChangeDetailAddr}
            underlineColorAndroid={'transparent'}
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
              maxLength={60}
              placeholder=""
              onChange={(v) => {
                this.setState({storeRemark: v})
              }}
              value={this.state.storeRemark}
              underlineColorAndroid={'transparent'}
            />
          </CellBody>
        </Cell>
      </Cells>

      <CellsTitle style={CommonStyle.cellsTitle35}>发票</CellsTitle>
      <Cells style={CommonStyle.cells35}>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35W70}>发票抬头</Label></CellHeader>
          <CellBody><Input
            placeholder=""
            value={this.state.taxInvoice}
            onChangeText={this._onChangeTaxInvoice}
            underlineColorAndroid={'transparent'}
            style={CommonStyle.inputH35}
          />
          </CellBody>
        </Cell>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35W70}>税     号</Label></CellHeader>
          <CellBody><Input
            placeholder="个人可不填"
            value={this.state.taxId}
            onChangeText={this._onChangeTaxId}
            underlineColorAndroid={'transparent'}
            style={CommonStyle.inputH35}
          />
          </CellBody>
        </Cell>
      </Cells>

      {/*<ButtonArea style={{marginTop: 35}}>*/}
        {/*<Button type="primary" disabled={this._shouldDisabledSaveBtn()} onPress={this._doSaveEdit} style={[S.mlr15]}>保存</Button>*/}
      {/*</ButtonArea>*/}

      <Toast
        icon="loading"
        show={this.state.onSubmitting}
        onRequestClose={() => {
        }}
      >提交中</Toast>

      <Toast
        icon="loading"
        show={this.state.onSubmittingConfirm}
        onRequestClose={() => {
        }}
      >正在发送订单修改通知</Toast>

      <Toast
        icon="success"
        show={this.state.confirmSent}
        onRequestClose={() => {
        }}
      >发送成功</Toast>
      
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  cells: {
    marginTop: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderEditScene)