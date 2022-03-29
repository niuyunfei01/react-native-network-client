import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import CommonStyle from '../../common/CommonStyles'
import {deliveryFailedAudit} from '../../reducers/order/orderActions'
import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {
  Button,
  ButtonArea,
  Cell,
  CellBody,
  CellFooter,
  Cells,
  CellsTitle,
  Dialog,
  Icon,
  RadioCells,
  TextArea
} from "../../weui/index";
import S from '../../stylekit'
import {hideModal, showModal, showSuccess} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({deliveryFailedAudit}, dispatch)}
}

class JdAuditDeliveryScene extends Component {


  constructor(props: Object) {
    super(props);

    const {order, remind} = (this.props.route.params || {});

    this.state = {
      order: order,
      remind: remind,
      reply_content: '',
      is_agree: '',//默认拒绝后重新呼叫配送
      delivery_urge: true,//默认同意后重新呼叫配送
      doneSubmitting: false,
      onSubmitting: false,
    };

    this.deliveryAudit = this.deliveryAudit.bind(this);
    this._checkDisableSubmit = this._checkDisableSubmit.bind(this);
  }

  _checkDisableSubmit() {
    return !this.state.is_agree;
  }

  deliveryAudit() {
    const {dispatch, global, navigation, route} = this.props;
    const {order, remind} = (route.params || {});
    let wm_id = order.id;
    let req_data = {};
    let {is_agree, delivery_urge, reply_content} = this.state;
    if (wm_id && is_agree !== '') {
      req_data['wm_id'] = wm_id;
      req_data['is_agree'] = is_agree === 'yes';
      req_data['delivery_urge'] = delivery_urge;
      req_data['reply_content'] = is_agree === 'yes' ? '同意取消' : reply_content;
    } else {
      this.setState({errorHints: '参数错误'});
      return false;
    }

    this.setState({onSubmitting: true});

    showModal('提交中')
    dispatch(deliveryFailedAudit(global.accessToken, wm_id, req_data, (ok, msg, data) => {
      this.setState({onSubmitting: false});
      hideModal()
      if (ok) {
        showSuccess('已回复配送')
        // this.setState({doneSubmitting: true});
        setTimeout(() => {
          // this.setState({doneSubmitting: false});
          navigation.goBack();
        }, 2000);
      } else {
        this.setState({errorHints: msg});
      }
    }));
  }

  render() {
    let {delivery_urge, reply_content, remind} = this.state;

    return <ScrollView style={[styles.container, {flex: 1}]}>
      <Dialog
        onRequestClose={() => {
        }}
        visible={!!this.state.errorHints}
        buttons={[{
          type: 'default',
          label: '知道了',
          onPress: () => {
            this.setState({errorHints: ''});
          }
        }]}
      >
        <Text>{this.state.errorHints} </Text>
      </Dialog>

      <CellsTitle
        style={{fontSize: 13, marginBottom: 0, marginTop: 0, paddingTop: 10, paddingBottom: 4}}
      >{remind.remark}, 请尽快审核!</CellsTitle>
      <RadioCells
        style={{marginTop: 2}}
        options={[{label: '同意取消配送', value: 'yes'}, {label: '拒绝取消配送', value: 'no'}]}
        onChange={(action) => {
          this.setState({is_agree: action});
        }}
        cellTextStyle={[CommonStyle.cellTextH45, {fontWeight: 'bold', color: colors.color333,}]}
        value={this.state.is_agree}
      />

      {this.state.is_agree === 'no' && (
        <View>
          <CellsTitle style={CommonStyle.cellsTitle35}>拒绝理由</CellsTitle>
          <Cells style={{marginTop: 2}}>
            <Cell>
              <CellBody>
                <TextArea
                  maxLength={20}
                  placeholder="请输入拒绝理由"
                  onChange={(v) => {
                    this.setState({reply_content: v});
                  }}
                  value={reply_content}
                  underlineColorAndroid={'transparent'}
                />
              </CellBody>
            </Cell>
          </Cells>
        </View>
      )}

      {this.state.is_agree === 'yes' && (
        <View>
          <CellsTitle style={CommonStyle.cellsTitle35}>同意后重新召唤京东配送?</CellsTitle>
          <Cells style={[styles.cell_box]}>
            <Cell
              onPress={() => this.setState({delivery_urge: !delivery_urge})}
              customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={styles.cell_body}>{delivery_urge ? "重新召唤" : "不再召唤"} </Text>
              </CellBody>
              <CellFooter>
                <Icon name={delivery_urge ? "success_no_circle" : "cancel"} style={{fontSize: 16}}/>
              </CellFooter>
            </Cell>
          </Cells>
        </View>
      )}

      <ButtonArea style={{marginTop: 35}}>
        <Button
          type="primary"
          disabled={this._checkDisableSubmit()}
          onPress={this.deliveryAudit}
          style={[S.mlr15]}
        >回复审核</Button>
      </ButtonArea>

      {/*<Toast*/}
      {/*  icon="loading"*/}
      {/*  show={this.state.onSubmitting}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>提交中</Toast>*/}

      {/*<Toast*/}
      {/*  icon="success"*/}
      {/*  show={this.state.doneSubmitting}*/}
      {/*  onRequestClose={() => {*/}
      {/*  }}*/}
      {/*>已回复配送</Toast>*/}
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
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
  },
  cell_body: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(JdAuditDeliveryScene)
