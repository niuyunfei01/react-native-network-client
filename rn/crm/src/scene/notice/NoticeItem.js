import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {delayRemind, updateRemind} from "../../reducers/remind/remindActions";
import * as globalActions from "../../reducers/global/globalActions";
import {Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Config from "../../pubilc/common/config";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";
import LinearGradient from "react-native-linear-gradient";
import ModalDropdown from "react-native-modal-dropdown";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Cts from "../../pubilc/common/Cts";
import {ActionSheet, Dialog} from "../../weui";

let width = Dimensions.get("window").width;

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      updateRemind,
      delayRemind,
      ...globalActions
    }, dispatch)
  }
}

class NoticeItem extends PureComponent {
  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    fetchData: PropTypes.func,
    onPress: PropTypes.func,
    accessToken: PropType.string,
  };
  state = {
    showDelayRemindDialog: false,
    showStopRemindDialog: false,
    opRemind: {},
  }

  constructor() {
    super();
  }


  onPressDropdown = (key, id, type) => {
    if (parseInt(key) === 0) {
      //暂停提示
      this._showDelayRemindDialog(type, id);
    } else {
      //强制关闭
      this._showStopRemindDialog(type, id);
    }
  }

  _showDelayRemindDialog(type, id) {
    this.setState({
      showDelayRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  _showStopRemindDialog(type, id) {
    this.setState({
      showStopRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  _hideDelayRemindDialog() {
    this.setState({
      showDelayRemindDialog: false,
      opRemind: {}
    });
  }

  _hideStopRemindDialog() {
    this.setState({
      showStopRemindDialog: false,
      opRemind: {}
    });
  }

  _doStopRemind() {
    let {type, id} = this.state.opRemind;
    const {dispatch, accessToken} = this.props;
    dispatch(updateRemind(id, type, Cts.TASK_STATUS_DONE, accessToken))
    this._hideStopRemindDialog();
    this.props.fetchData()
  }

  _doDelayRemind(minutes) {
    let {type, id} = this.state.opRemind;
    const {dispatch, accessToken} = this.props;
    dispatch(delayRemind(id, type, minutes, accessToken));
    this._hideDelayRemindDialog();
    this.props.fetchData()
  }

  render() {
    let {item, onPress} = this.props;
    return (
      <TouchableOpacity onPress={() => {
        if (item.order_id > 0) {
          onPress(Config.ROUTE_ORDER, {orderId: item.order_id})
        } else if (parseInt(item.type) === Cts.TASK_TYPE_UPLOAD_NEW_GOODS) {
          let params = {
            task_id: item.id,
            refresh_list: () => {
              this.props.fetchData()
            }
          };
          onPress(Config.ROUTE_GOODS_WORK_NEW_PRODUCT, params);
        } else if (parseInt(item.type) === Cts.TASK_TYPE_CHG_SUPPLY_PRICE) {
          let params = {viewStoreId: item.store};
          onPress(Config.ROUTE_GOODS_APPLY_RECORD, params);
        }
      }} style={styles.ItemContent}>
        <LinearGradient style={styles.ItemHeaderLinear}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        colors={!item.quick > 0 ? ['#F7FFFE', '#D0EDFF'] : ['#FFFAF7', '#FFE4D0']}>
          {this.renderItemHeader()}
        </LinearGradient>
        {this.renderItemBody()}
        {this.renderModal()}
      </TouchableOpacity>
    )
  }

  renderItemHeader = () => {
    let {item} = this.props;
    return (
      <View style={styles.header}>
        <If condition={item.quick > 0}>
          <View style={styles.ItemHeader}/>
          <Text style={styles.ItemHeaderTitle}>急 </Text>
        </If>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <If condition={item.orderDate && item.dayId}>
            <Text style={{flex: 1, fontSize: 16, color: colors.color333, marginLeft: item.quick > 0 ? 0 : 10}}>
              {item.orderDate}#{item.dayId}
            </Text>
          </If>

          {/*<If condition={!(item.orderDate && item.dayId)}>*/}
          {/*  <View style={{flex: 1}}/>*/}
          {/*</If>*/}
          <If condition={item.expect_end_time}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesome5 name={'clock'} style={{
                fontSize: 15,
                color: colors.red,
                marginRight: 5,
                marginLeft: !(item.orderDate && item.dayId) ? 0 : 10
              }}/>
              <Text style={{fontSize: 16, color: colors.color333}}>{item.expect_end_time} </Text>
            </View>
          </If>
          <If condition={Number(item.status) === 1}>
            <Text style={{flex: 1, textAlign: 'right', fontSize: 14, color: colors.color333, marginRight: 5}}>已处理</Text>
          </If>
          <If condition={Number(item.status) !== 1}>
            <ModalDropdown
              options={['暂停提示', '强制关闭']}
              defaultValue={''}
              style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}
              dropdownStyle={styles.drop_listStyle}
              dropdownTextStyle={styles.drop_textStyle}
              dropdownTextHighlightStyle={styles.drop_optionStyle}
              onSelect={(event) => this.onPressDropdown(event, item.id, item.type)}>
              <Entypo name={"circle-with-cross"} style={{fontSize: 20, color: colors.color999, marginRight: 5}}/>
            </ModalDropdown>
          </If>
        </View>
      </View>
    )
  }

  renderItemBody = () => {
    let {item} = this.props;
    let task_type = parseInt(item.type);
    let task_info = item.remark;
    if (task_type === Cts.TASK_TYPE_UPLOAD_NEW_GOODS && item.remind_id) {
      let new_goods_info = JSON.parse(item.remind_id);
      task_info = '申请上架: ' + item.remark + ';  价格: ' + new_goods_info.price_desc;
    }
    return (
      <View style={{paddingVertical: 10, marginHorizontal: 12, paddingHorizontal: 4}}>
        <If condition={item.store_id}>
          <View style={styles.bodyItemRow}>
            <Text style={styles.itrmLabel}>店铺名称: </Text>
            <Text style={styles.itemValue}>{item.store_id} </Text>
          </View>
        </If>
        <If condition={item.created}>
          <View style={styles.bodyItemRow}>
            <Text style={styles.itrmLabel}>创建时间: </Text>
            <Text style={styles.itemValue}>{item.created} </Text>
          </View>
        </If>
        <If condition={item.delegation_to_user || item.orderStatus}>
          <View style={styles.bodyItemRow}>
            <If condition={item.delegation_to_user}>
              <Text style={styles.itrmLabel}>处理人: </Text>
              <Text style={styles.itemValue1}>{item.delegation_to_user} </Text>
            </If>
            <If condition={item.orderStatus}>
              <Text style={styles.itrmLabel}>订单状态: </Text>
              <Text style={styles.itemValue1}>{item.orderStatus} </Text>
            </If>
          </View>
        </If>
        <If condition={item.remark}>
          <View style={styles.bodyItemRow}>
            {/*<Text style={styles.itrmLabel}>店铺名称: </Text>*/}
            <Text style={{fontSize: 14, color: colors.color333, width: width * 0.85, fontWeight: "bold"}}>
              {task_info}{task_type === Cts.TASK_TYPE_UPLOAD_GOODS_FAILED && item.remind_id}</Text>
          </View>
        </If>
      </View>
    )
  }

  renderModal = () => {
    let {showStopRemindDialog, showDelayRemindDialog} = this.state;
    return (
      <View>
        <Dialog onRequestClose={() => this._hideStopRemindDialog()}
                visible={showStopRemindDialog}
                title="不再提醒"
                buttons={[
                  {
                    type: 'default',
                    label: '返回解决',
                    onPress: this._hideStopRemindDialog.bind(this),
                  }, {
                    type: 'primary',
                    label: '已解决',
                    onPress: this._doStopRemind.bind(this),
                  },
                ]}><Text style={{color: colors.color333}}>已解决问题，如果没有返回解决</Text>
        </Dialog>
        <ActionSheet
          visible={showDelayRemindDialog}
          onRequestClose={() => this._hideDelayRemindDialog()}
          menus={[
            {
              type: 'default',
              label: '10分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 10),
            }, {
              type: 'default',
              label: '20分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 20),
            }, {
              type: 'warn',
              label: '30分钟后再次提醒',
              onPress: this._doDelayRemind.bind(this, 30),
            }
          ]}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: this._hideDelayRemindDialog.bind(this),
            }
          ]}
        />
      </View>
    )
  }

}


const styles = StyleSheet.create({
  flexColumn: {flexDirection: 'column'},
  ItemContent: {
    flexDirection: "column",
    backgroundColor: colors.white,
    marginTop: 6,
    marginHorizontal: 12,
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    height: 40
  },
  ItemHeaderLinear: {
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    width: "100%",
    height: 40,
  },
  ItemHeader: {
    width: 0,
    height: 0,
    borderTopWidth: 32,
    borderTopColor: "#f98754",
    borderRightWidth: 28,
    borderRightColor: 'transparent',
  },
  ItemHeaderTitle: {
    color: colors.white,
    position: 'absolute',
    top: 1,
    left: 1,
    fontSize: 14
  },

  drop_style: {//和背景图片同框的按钮的样式
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_listStyle: {//下拉列表的样式
    width: pxToDp(150),
    height: pxToDp(141),
    backgroundColor: '#5f6660',
    marginTop: -StatusBar.currentHeight,
  },
  drop_textStyle: {//下拉选项文本的样式
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#fff',
    height: pxToDp(69),
    backgroundColor: '#5f6660',
    borderRadius: pxToDp(3),
    borderColor: '#5f6660',
    borderWidth: 1,
    shadowRadius: pxToDp(3),
  },
  drop_optionStyle: {//选项点击之后的文本样式
    color: '#4d4d4d',
    backgroundColor: '#939195',
  },
  bodyItemRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  itrmLabel: {
    fontSize: 14, color: colors.color333, width: width * 0.20
  },
  itemValue: {
    fontSize: 14, color: colors.color333, width: width * 0.65
  },
  itemValue1: {
    fontSize: 14, color: colors.color333, width: width * 0.25
  }
});


export default connect(mapDispatchToProps)(NoticeItem)
