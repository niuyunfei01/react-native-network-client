import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import {fetchProfitIncomeOrderList} from "../../reducers/operateProfit/operateProfitActions";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import Header from './OperateHeader';
import OperateIncomeItem from './OperateIncomeItem'
import {fetchProfitDaily} from "../../reducers/operateProfit/operateProfitActions";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProfitIncomeOrderList,
      ...globalActions
    }, dispatch)
  }
}

class OperateIncomeDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '收入详情',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      tabNum: 2,
      editable:false,
      orders:[],
      other:[],

    };
    this.tab = this.tab.bind(this)
  }
  getProfitIncomeOrderList(){
    let {currStoreId, accessToken} = this.props.global;
    let {day,type} = this.props.navigation.state.params;
    const {dispatch} = this.props;
    dispatch(fetchProfitIncomeOrderList(type,currStoreId, day, accessToken, async (ok, obj, desc) => {
      let {orders,other,editable} = obj;
      if (ok) {
        this.setState({
          orders:orders,
          other:other,
          editable:editable
        })
      }
      this.setState({query: false,})
    }));
  }

  componentWillMount() {
    let {type} = this.props.navigation.state.params;
    this.setState({tabNum: type})
    this.getProfitIncomeOrderList()
  }
  tab(num) {
    this.setState({tabNum: num})
  }
  renderContent() {
    let {tabNum,orders,other} = this.state;
    if (tabNum == 1) {
      return (
          <Cells style={{marginLeft: 0,padding:0}}>
            {
              orders.map((item,index)=>{
                let {good_num,money,name,order_id} = item;
                return(
                    <Cell access
                          key = {index}
                          style={styles.cell}
                          onPress = {()=>{
                            console.log(order_id);
                          }}
                    >
                      <CellHeader>
                        <Text style={styles.cell_name}>{name}</Text>
                      </CellHeader>
                      <CellBody style={{justifyContent: 'center'}}>
                        <Text style={styles.cell_num}>{good_num}件商品</Text>
                      </CellBody>
                      <CellFooter>
                        <Text style={styles.cell_money}>{money}</Text>
                      </CellFooter>
                    </Cell>
                )
              })
            }
          </Cells>
      )
    } else {
      return (
          <View style={{marginTop: pxToDp(20)}}>
            {
              other.map((item,index)=>{
                return <OperateIncomeItem invalid = {item.invalid}/>
              })
            }
            {
              this.state.editable? <Button type={'primary'} style={{marginHorizontal: pxToDp(30), marginTop: pxToDp(160),marginBottom:pxToDp(30)}}>
                添加新收入
              </Button>:null
            }

          </View>
      )
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
          <Header text={'今日订单总收入'} money={61716.89}/>
          <ScrollView>
            {
              this.renderContent()
            }
          </ScrollView>
          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >加载中</Toast>
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
    borderTopWidth:0,
    height:pxToDp(100),
  },
  cell_name: {
    fontSize: pxToDp(30),
    color: '#3e3e3e',
    height:pxToDp(100),
    lineHeight:pxToDp(70)
  },
  cell_num: {
    fontSize: pxToDp(24),
    color: '#bebebe',
    lineHeight: pxToDp(35)
  },
  cell_money: {
    fontSize: pxToDp(36)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OperateIncomeDetailScene)
