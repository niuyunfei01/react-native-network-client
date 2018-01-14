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
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchProfitHome} from "../../reducers/operateProfit/operateProfitActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import {uploadImg, newProductSave, fetchApplyRocordList} from "../../reducers/product/productActions";
import tool from '../../common/tool';
import {toFixed} from "../../common/tool";
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import  RenderEmpty from './RenderEmpty'

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchProfitHome,
      ...globalActions
    }, dispatch)
  }
}

class OperateProfitScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '运营收益',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      query: true,
      items: {},
      unbalanced: 0
    };

    this.getProfitHome = this.getProfitHome.bind(this)
  }
  getProfitHome() {
    const {dispatch} = this.props;
    let {currStoreId,accessToken} = this.props.global;
    dispatch(fetchProfitHome(currStoreId, accessToken, async (ok, obj, desc) => {
      console.log('obj',obj)
      if (ok) {
        this.setState({
          unbalanced: obj.unbalanced,
          items: obj.items
        })
      }else {

      }
      this.setState({query: false,})
    }));
  }
  componentWillMount() {
    this.getProfitHome()
  }
  toOperateDetail(day) {
    this.props.navigation.navigate(Config.ROUTE_OPERATE_DETAIL,{day:day})
  }
  renderList(obj) {
    if(tool.length(obj)>0){
      return tool.objectMap(obj, (item, index) => {
        return (
            <View key={index}>
              <View style={content.item_header}>
                <Text style={{color: '#b2b2b2'}}>{index}</Text>
              </View>
              <View>
                <Cells style={{marginTop: 0}}>
                  {
                    item.map((ite, key) => {
                      let {day, balance_money, sum_today, total_balanced} = ite;
                      return (
                          <Cell access
                                style={content.cell}
                                onPress={() => {
                                  this.toOperateDetail(day)
                                }}
                                key={key}
                          >
                            <CellHeader style={content.header}>
                              <Text style={content.date}> {day}</Text>
                              <Text style={content.payment}>结款 {toFixed(balance_money)}</Text>
                            </CellHeader>
                            <CellBody style={{marginLeft: pxToDp(10)}}>
                              {
                                sum_today > 0 ?
                                    <Text style={[content.text_right, content.take_in]}>+{toFixed(sum_today)}</Text>
                                    : <Text style={[content.text_right, content.take_in,{color:'#fe0000'}]}>-{toFixed(sum_today)}</Text>
                              }
                            </CellBody>
                            <CellFooter style={[content.text_right, content.foot, content.date]}>
                              {toFixed(total_balanced)}
                            </CellFooter>
                          </Cell>
                      )
                    })
                  }
                </Cells>
              </View>
            </View>
        )
      })
    }else {
      return <RenderEmpty />
    }

  }
  render() {
    return (
        <View style={{flex: 1}}>
          <View style={header.wrapper}>
            <Text style={header.profit}>{toFixed(this.state.unbalanced)}</Text>
            <Text style={header.desc}>待结算运营收益额</Text>
          </View>
          <ScrollView>
            {
              this.renderList(this.state.items)
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

const header = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    height: pxToDp(290),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: pxToDp(1),
    borderColor: colors.fontGray
  },
  profit: {
    fontSize: pxToDp(72),
    color: colors.main_color,
  },
  desc: {
    fontSize: pxToDp(24),
    color: "#3e3e3e",
    marginTop: pxToDp(50)
  }
});
const content = StyleSheet.create({
  item_header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(60),
    paddingHorizontal: pxToDp(30)
  },
  item_time: {
    fontSize: pxToDp(28),
    color: colors.fontColor
  },
  cell: {
    height: pxToDp(125),
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    minWidth: pxToDp(150),
  },
  body: {
    width: pxToDp(175),
    alignItems: 'flex-end',
  },
  text_right: {
    textAlign: 'right'
  },
  foot: {
    width: pxToDp(150)
  },
  date: {
    color: colors.fontBlack
  },
  payment: {
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(30),
    borderColor: '#fe0000',
    color: '#fe0000',
    fontSize: pxToDp(24),
    textAlign: 'center',
    lineHeight: pxToDp(30),
    paddingHorizontal: pxToDp(10),
    paddingVertical: pxToDp(5),
    marginTop: pxToDp(2)
  },
  expend: {
    color: '#fe0000'
  },
  take_in: {
    color: colors.main_color
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(OperateProfitScene)
