import React, { Component } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'

import {orderAddTodo} from '../../reducers/order/orderActions'
import {getConfigItem} from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, TextArea, RadioCells, ButtonArea,Icon, Toast, Dialog, Cells, CellsTitle, Cell, CellBody} from "../../weui/index";
import S from '../../stylekit'
import {tool} from "../../common";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({orderAddTodo, getConfigItem}, dispatch)}
}

class OrderTodoScene extends Component {

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>添加稍后处理事项</Text>
        </View>
      ),
    })
  };

  convertTypes (types) {
    return tool.objectMap(types, (val, key) => {
      return {label: val.name, key: key};
    });
  };

  KEY_CUSTOM = 'custom';
  LABEL_CUSTOM = '其他';

  constructor(props: Object) {
    super(props);

    this.state = {
      loadingTypes: false,
      taskTypes : [],
      reason_idx: -1,
      custom: '',
      doneSubmitting: false,
      onSubmitting: false,
    };

    this._onTypeSelected = this._onTypeSelected.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
    this._doReply = this._doReply.bind(this);

    this.navigationOptions(this.props)
  }

 UNSAFE_componentWillMount() {
    let order_task_types;
    const {global, dispatch} = this.props;
    if (global.cfgOfKey && global.cfgOfKey.order_task_types) {
      order_task_types = global.cfgOfKey.order_task_types.type;
    }


    if (!order_task_types || !order_task_types.length) {
      this.setState({loadingTypes: true});
      dispatch(getConfigItem(global.accessToken, 'order_task_types', (ok, msg, types) => {
        if (ok) {
          this.setState({taskTypes: this.convertTypes(types.type), loadingTypes: false});
        } else {
          this.setState({loadingTypes: false, errorHints: msg});
        }
      }));
    } else {
      this.setState({taskTypes : this.convertTypes(order_task_types)});
    }
  }

  _onTypeSelected(idx) {
    this.setState({reason_idx: idx});
    const key = this._taskType(idx);

    if (key === this.KEY_CUSTOM) {
      console.log(key, idx);
      const label = this.state.taskTypes[idx]['label'];
      this.setState({custom: label === this.LABEL_CUSTOM ? '' : label});
    }
  }

  _checkDisableSubmit() {
    const key = this._taskType();
    return !(key && (key !== 'custom' || this.state.custom));
  }

  _taskType(idx) {
    if (typeof idx === 'undefined') {
      idx = this.state.reason_idx;
    }
    return this.state.taskTypes && idx >= 0 ? this.state.taskTypes[idx]['key'] : '';
  }

  _doReply() {
    const {dispatch, global, route, navigation} = this.props;
    const {order} = (route.state.params || {});
    this.setState({onSubmitting: true});
    dispatch(orderAddTodo(global.accessToken, order.id, this._taskType(this.state.reason_idx), this.state.custom, (ok, msg, data) => {
      console.log(ok, msg, data);
      this.setState({onSubmitting: false});
      if (ok) {
        this.setState({doneSubmitting: true});
        setTimeout(() => {
          this.setState({doneSubmitting: false});
          navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }))
  }

  render() {
    console.log(this.state.taskTypes);

    const reasonOpts = this.state.taskTypes.map((reason, idx) => {
      return {label: reason.label, value: idx}
    });

    return <ScrollView style={[styles.container, {flex: 1}]}>

      <Dialog onRequestClose={() => {}}
              visible={!!this.state.errorHints}
              buttons={[{
                type: 'default',
                label: '知道了',
                onPress: () => {
                  this.setState({errorHints: ''})
                }
              }]}
      ><Text>{this.state.errorHints}</Text></Dialog>

      <CellsTitle style={styles.cellsTitle}>选择任务类型</CellsTitle>
      {!this.state.loadingTypes && <RadioCells
        style={{marginTop: 2}}
        options={reasonOpts}
        onChange={this._onTypeSelected}
        cellTextStyle={[CommonStyle.cellTextH35, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.reason_idx}
      />}

      <View>
        <CellsTitle style={styles.cellsTitle}>其他信息（选填）</CellsTitle>
        <Cells style={{marginTop: 2}}>
          <Cell>
            <CellBody>
            <TextArea
              maxLength={60}
              placeholder="输入需要给处理人的其他信息"
              onChange={(v)=>{this.setState({custom: v})}}
              value={this.state.custom}
              underlineColorAndroid={'transparent'}
            />
            </CellBody>
          </Cell>
        </Cells>
      </View>

      <ButtonArea style={{marginTop: 35}}>
        <Button type="primary" disabled={this._checkDisableSubmit()} onPress={this._doReply} style={[S.mlr15]}>创建任务</Button>
      </ButtonArea>

      <Toast
        icon="loading"
        show={this.state.onSubmitting}
        onRequestClose={() => {
        }}
      >提交中</Toast>

      <Toast
        icon="loading"
        show={this.state.loadingTypes}
        onRequestClose={() => {
        }}
      >加载中...</Toast>

      <Toast
        icon="success"
        show={this.state.doneSubmitting}
        onRequestClose={() => {
        }}
      >任务已创建</Toast>
    </ScrollView>
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#f2f2f2'},
  border_top: {
    borderTopWidth: pxToDp(1),
    borderTopColor: colors.color999,
  },
  cellsTitle: {
    fontSize: 13, marginBottom: 0, marginTop: 20
  },
  cells: {
    marginTop: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderTodoScene)