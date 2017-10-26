import React, { PureComponent, Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import InputNumber from 'rc-input-number';
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { screen, system, tool, native } from '../../common'
import {bindActionCreators} from "redux";
import Config from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'
import CommonStyle from '../../common/CommonStyles'

import {getOrder, printInCloud, getRemindForOrderPage} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, Agreement, Switch, ActionSheet, TextArea, RadioCells, ButtonArea,Icon, Toast, Label, Dialog, Cells, Input, CellsTitle, Cell, CellHeader, CellBody, CellsTips} from "../../weui/index";
import {ToastShort} from "../../util/ToastUtils";
import {StatusBar} from "react-native";
import ModalDropdown from 'react-native-modal-dropdown';
import Cts from '../../Cts'
import inputNumberStyles from './inputNumberStyles';
import S from '../../stylekit'
import CellFooter from "../../weui/Cell/CellFooter";
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';

const numeral = require('numeral')

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({getContacts, getOrder, printInCloud, getRemindForOrderPage}, dispatch)}
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
      order: {},
      autoSaveUserBackup: true,
      backupPhone: '',
      detailAddr: '',
      storeRemark: '',
      onSubmitting: false,
      errorHints: '',
    };

    this.refundMoney = '1.11';

    this._onChangeBackupPhone = this._onChangeBackupPhone.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._shouldDisabledSaveBtn = this._shouldDisabledSaveBtn.bind(this);
    this._onChangeDetailAddr = this._onChangeDetailAddr.bind(this);
    this._doSaveEdit = this._doSaveEdit.bind(this);
    this._toSetLocation = this._toSetLocation.bind(this);
  }

  componentWillMount() {
    const {order, remind} = (this.props.navigation.state.params || {});
    const reasons = {
      'hasOut': '已送出',
      'inCooking': '正在烹饪',
      'weather': '天气原因',
      'shortHand': '人手不齐',
      'custom': '自定义回复'
    };
    this.setState({order, remind, reasons})
  }

  _onChangeBackupPhone(v) {
    this.setState({refund_yuan: v});
  }

  _onChangeAutoSaveBackup(v) {
    this.setState({});
  }

  _toSetLocation() {
    const {order} = this.props.order;
    const { state, navigate } = this.props.navigation;
    const params = {action: Config.LOC_PICKER,
      center: `${order.loc_lng},${order.loc_lat}`,
      actionBeforeBack: (location) => {
        this.setState({
          loc_name: location.name,
          loc_data: location.location,
          loc_address: location.address,
        });
      }
    };
    navigate(Config.ROUTE_WEB, params);
  }

  _onChangeDetailAddr() {
    console.log('agree refund ...')
  }

  _doSaveEdit() {
    console.log('refuse refund ...')
  }

  _shouldDisabledSaveBtn() {
    return true;
  }

  render() {
    const {order} = this.props.order;
    const reasonOpts = tool.objectMap(this.state.reasons, (reason, key) => {
      return {label: reason, value: key}
    });

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
            <Text style={{fontSize: 15}}>{this.state.loc_name || '点击选择'}</Text>
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
              maxLength={20}
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
            value={this.state.detailAddr}
            onChangeText={this._onChangeDetailAddr}
            underlineColorAndroid={'transparent'}
            style={CommonStyle.inputH35}
          />
          </CellBody>
        </Cell>
        <Cell><CellHeader><Label style={CommonStyle.cellTextH35}>税     号</Label></CellHeader>
          <CellBody><Input
            placeholder="个人可不填"
            value={this.state.detailAddr}
            onChangeText={this._onChangeDetailAddr}
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