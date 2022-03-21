import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, Dialog, Input,} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {changeProfitInvalidate, fetchProfitIncomeOrderList} from "../../reducers/operateProfit/operateProfitActions";
import {toFixed} from '../../common/tool';
import Header from './OperateHeader';
import OperateIncomeItem from './OperateIncomeItem'
import RenderEmpty from './RenderEmpty'
import {hideModal, showModal} from "../../util/ToastUtils";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProfitIncomeOrderList,
      changeProfitInvalidate,
      ...globalActions
    }, dispatch)
  }
}

class OperateIncomeDetailScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      tabNum: 2,
      editable: false,
      orders: [],
      other: [],
      query: true,
      upload: false,
      order_money: 0,
      other_money: 0
    };
    this.tab = this.tab.bind(this)
    showModal('加载中')
  }

  async getProfitIncomeOrderList() {
    let {currStoreId, accessToken} = this.props.global;
    let {day, type} = this.props.route.params;
    const {dispatch} = this.props;
    dispatch(fetchProfitIncomeOrderList(type, currStoreId, day, accessToken, async (ok, obj, desc) => {
      let {orders, other, editable} = obj;
      if (ok) {
        this.setState({
          orders: orders,
          other: other,
          editable: editable,
          dlgShipVisible: false,
        })
      }
      hideModal()
      this.setState({query: false,})
    }));
  }


  UNSAFE_componentWillMount() {
    let {type, order_money, other_money} = this.props.route.params;
    this.setState({
      tabNum: type,
      order_money: order_money,
      other_money: other_money,
    });
    this.getProfitIncomeOrderList()
  }

  tab(num) {
    this.setState({tabNum: num})
  }

  renderContent() {
    let {tabNum, orders, other} = this.state;
    if (tabNum == 1 && orders.length > 0) {
      return (
        <View>
          <Header text={'今日订单总收入'} money={toFixed(this.state.order_money)}/>
          <Cells style={{marginLeft: 0, padding: 0}}>
            {
              orders.map((item, index) => {
                let {good_num, money, name, order_id} = item;
                return (
                  <Cell access
                        key={index}
                        style={styles.cell}
                        onPress={() => {
                        }}
                  >
                    <CellHeader>
                      <Text style={styles.cell_name}>{name}  </Text>
                    </CellHeader>
                    <CellBody style={{justifyContent: 'center'}}>
                      <Text style={styles.cell_num}>{good_num}件商品  </Text>
                    </CellBody>
                    <CellFooter>
                      <Text style={styles.cell_money}>{toFixed(money)}  </Text>
                    </CellFooter>
                  </Cell>
                )
              })
            }
          </Cells>
        </View>)

    } else if (tabNum == 2 && other.length > 0) {
      return (
        <View>
          <Header text={'今日其他总收入'} money={toFixed(this.state.other_money)}/>
          {
            other.map((item, index) => {
              let {label, invalid, remark, money, id} = item;
              return (
                <OperateIncomeItem
                  update={() => this.getProfitIncomeOrderList()}
                  key={index}
                  item={item}
                  state={this.state}/>)
            })
          }
          {
            this.state.editable ?
              <Button type={'primary'} style={styles.btn}
                      onPress={() => {
                        this.setState({dlgShipVisible: true})
                      }
                      }
              >
                添加新收入
              </Button> : null
          }

        </View>
      )
    } else {
      return <RenderEmpty/>
    }

  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={tab.wrapper}>
          <TouchableOpacity
            onPress={() => {
              this.tab(1)
            }}
          >
            <Text style={this.state.tabNum == 1 ? [tab.text, tab.active] : [tab.text]}>订单明细</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.tab(2)
            }}
          >
            <Text
              style={this.state.tabNum == 2 ? [tab.text, tab.right, tab.active] : [tab.right, tab.text]}>其他收入</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {
            this.renderContent()
          }
        </ScrollView>

        <Dialog onRequestClose={() => {
        }}
                visible={this.state.dlgShipVisible}
                title={'添加其他收入'}
                titleStyle={{textAlign: 'center', color: colors.white}}
                headerStyle={{
                  backgroundColor: colors.main_color,
                  paddingTop: pxToDp(20),
                  justifyContent: 'center',
                  paddingBottom: pxToDp(20)
                }}
                buttons={[{
                  type: 'default',
                  label: '取消',
                  onPress: () => {
                    this.setState({dlgShipVisible: false});
                  }
                }, {
                  type: 'primary',
                  label: '保存',
                  onPress: () => {
                    this.setState({dlgShipVisible: false});
                  }
                }]}

        >
          <ScrollView style={{height: pxToDp(500)}}>
            <Text>项目(不超过15个汉字) </Text>
            <Input
              underlineColorAndroid='transparent'
              style={{borderWidth: pxToDp(1), borderColor: colors.fontGray, borderRadius: pxToDp(10)}}
              maxLength={15}
            />
            <Text>金额(无) </Text>
            <Input
              underlineColorAndroid='transparent'
              style={{borderWidth: pxToDp(1), borderColor: colors.fontGray, borderRadius: pxToDp(10)}}
              keyboardType={"numeric"}
            />
            <Text>备注说明</Text>
            <Input
              underlineColorAndroid='transparent'
              style={{
                borderWidth: pxToDp(1),
                borderColor: colors.fontGray,
                borderRadius: pxToDp(10),
                height: pxToDp(150),
                marginBottom: pxToDp(150)
              }}
              multiline={true}
            />
          </ScrollView>
        </Dialog>
      </View>
    )
  }
}

const tab = StyleSheet.create({
  wrapper: {
    height: pxToDp(100),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: pxToDp(32),
    color: colors.fontGray

  },
  right: {
    marginLeft: pxToDp(110)
  },
  active: {
    color: colors.main_color
  }
});
const styles = StyleSheet.create({
  cell: {
    borderTopWidth: 0,
    height: pxToDp(100),
  },
  cell_name: {
    fontSize: pxToDp(30),
    color: '#3e3e3e',
    height: pxToDp(100),
    lineHeight: pxToDp(70)
  },
  cell_num: {
    fontSize: pxToDp(24),
    color: '#bebebe',
    lineHeight: pxToDp(35)
  },
  cell_money: {
    fontSize: pxToDp(36)
  },
  btn: {
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(160),
    marginBottom: pxToDp(30)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OperateIncomeDetailScene)
