import React, { PureComponent, Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import InputNumber from 'rc-input-number';
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import Config from '../../config'
import CommonStyle from '../../common/CommonStyles'

import {saveOrderBaisc} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, Switch, TextArea, ButtonArea, Toast, Label, Dialog, Cells, Input, CellsTitle, Cell, CellHeader, CellFooter, CellBody, CellsTips} from "../../weui/index";
import S from '../../stylekit'
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({saveOrderBaisc }, dispatch)}
}

class OrderEditScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: '修改订单信息',
      headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
      headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
      headerRight: '',
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
      onSubmitting: false,
      errorHints: '',
    };

    this.editFields = [
      {key: 'backupPhone', val: (order) => order.phone_backup},
      {key: 'detailAddr', val: (order) => order.detailAddr},
      {key: 'storeRemark', val: (order) => order.store_remark},
      {key: 'taxInvoice', val: (order) => order.invoice},
      {key: 'taxId', val: (order) => order.taxId},
      {key: 'loc_data', val: (order) => `${order.loc_lng},${order.loc_lat}`},
    ];

    this._onChangeBackupPhone = this._onChangeBackupPhone.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._shouldDisabledSaveBtn = this._shouldDisabledSaveBtn.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._doSaveEdit = this._doSaveEdit.bind(this);
    this._toSetLocation = this._toSetLocation.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._onChangeTaxId = this._onChangeTaxId.bind(this);
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
    const {order} = this.props.order;
    const {state, navigate} = this.props.navigation;
    const params = {
      action: Config.LOC_PICKER,
      center: this.state.loc_data,
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

  _doSaveEdit() {
    this.setState({onSubmitting: true});
    const {dispatch, global} = this.props;
    const {order} = this.props.navigation.state.params;
    
    const editions = [];

    const changes = this.editFields.filter((edit) => this.state[edit.key] !== edit.val(order))
      .map((edit) => {
        return {key: edit.key, value: this.state[edit.key]}
      });

    dispatch(saveOrderBaisc(global.accessToken, order.id, changes, (ok, msg) => {
      console.log('results', ok, msg);
      this.setState({onSubmitting: false});
    }));
  }

  _shouldDisabledSaveBtn() {
    const {order} = this.props.navigation.state.params;

    return !this.editFields.filter((edit) => this.state[edit.key] !== edit.val(order));
  }

  render() {
    return <ScrollView style={[styles.container, {flex: 1}]}>
          { !!this.state.errorHints &&
          <Dialog onRequestClose={()=>{}}
            visible={!!this.state.errorHints}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {this.setState({errorHints: ''})}
            }]}
          ><Text>{this.state.errorHints}</Text></Dialog>
          }

      <CellsTitle style={CommonStyle.cellsTitle35}>备用手机号</CellsTitle>
      <Cells style={CommonStyle.cells35}>
        <Cell>
          <CellHeader><Label style={CommonStyle.cellTextH35}>手机号</Label></CellHeader>
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
          <CellHeader><Label style={CommonStyle.cellTextH35}>保存到客户资料</Label></CellHeader>
          <Switch onChange={this._onChangeAutoSaveBackup} value={this.state.autoSaveUserBackup}/>
        </Cell>
      </Cells>

      <CellsTitle style={CommonStyle.cellsTitle35}>地址</CellsTitle>
      <Cells style={CommonStyle.cells35}>
        <Cell onPress={this._toSetLocation}><CellHeader><Label style={CommonStyle.cellTextH35}>收货地址</Label></CellHeader>
          <CellBody style={{flexDirection: 'row', flex: 1}}>
            <IconEvilIcons name="location" size={26}/>
            <Text style={{fontSize: 15}}>{this.state.loc_name || this.state.loc_data}</Text>
          </CellBody>
          <CellFooter access/>
        </Cell>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35}>楼号门牌</Label></CellHeader>
          <CellBody><Input
            placeholder="例：16号楼2单元1102"
            value={this.state.detailAddr}
            onChangeText={this._onChangeDetailAddr}
            underlineColorAndroid={'transparent'}
            style={CommonStyle.inputH35}
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
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35}>发票抬头</Label></CellHeader>
          <CellBody><Input
            placeholder=""
            value={this.state.taxInvoice}
            onChangeText={this._onChangeTaxInvoice}
            underlineColorAndroid={'transparent'}
            style={CommonStyle.inputH35}
          />
          </CellBody>
        </Cell>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35}>税     号</Label></CellHeader>
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

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._shouldDisabledSaveBtn()} onPress={this._doSaveEdit} style={[S.mlr15]}>保存</Button>
      </ButtonArea>

      <Toast
        icon="loading"
        show={this.state.onSubmitting}
        onRequestClose={() => {
        }}
      >提交中</Toast>
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