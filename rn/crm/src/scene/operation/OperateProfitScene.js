import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Text, View,} from "react-native";
import {Cell, CellBody, CellFooter, CellHeader, Cells} from "../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchProfitHome} from "../../reducers/operateProfit/operateProfitActions";
import pxToDp from "../../pubilc/util/pxToDp";
import colors from "../../pubilc/styles/colors";
import Config from "../../pubilc/common/config";
import tool, {toFixed} from "../../pubilc/util/tool";
import RenderEmpty from "./RenderEmpty";
import {hideModal, showModal} from "../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
        {
          fetchProfitHome,
          ...globalActions
        },
        dispatch
    )
  };
}

class OperateProfitScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      query: true,
      items: {},
      unbalanced: 0
    };
    showModal('加载中')
    this.getProfitHome = this.getProfitHome.bind(this);
  }

  getProfitHome() {
    const {dispatch} = this.props;
    let {currStoreId, accessToken} = this.props.global;
    dispatch(
        fetchProfitHome(currStoreId, accessToken, async (ok, obj, desc) => {
          if (ok) {
            this.setState({
              unbalanced: obj.unbalanced,
              items: obj.items
            });
          } else {
          }
          hideModal()
          this.setState({query: false});
        })
    );
  }

  UNSAFE_componentWillMount() {
    this.getProfitHome();
  }

  toOperateDetail(day, total_balanced) {
    this.props.navigation.navigate(Config.ROUTE_OPERATE_DETAIL, {
      day,
      total_balanced
    });
  }

  renderList(obj) {
    if (tool.length(obj) > 0) {
      return tool.objectMap(obj, (item, index) => {
        return (
            <View key={index}>
              <View style={content.item_header}>
                <Text style={{color: "#b2b2b2"}}>{index}  </Text>
              </View>
              <View>
                <Cells style={{marginTop: 0}}>
                  {item.map((ite, key) => {
                    let {day, balance_money, sum_today, total_balanced} = ite;
                    return (
                        <Cell
                            style={content.cell}
                            onPress={() => {
                              this.toOperateDetail(day, total_balanced);
                            }}
                            key={key}
                            customStyle={content.cust}>
                          <CellHeader style={content.header}>
                            <View>
                              <Text style={content.date}> {day} </Text>
                              {parseInt(balance_money) > 0 ? (
                                  <Text style={content.payment}>
                                    收益结转 {toFixed(balance_money)}
                                  </Text>) : (<View/>)}
                            </View>
                          </CellHeader>

                          <CellBody
                              style={{
                                marginLeft: pxToDp(10),
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between"
                              }}>
                            {sum_today > 0 ? (
                                <Text style={[content.text_right, content.take_in]}>
                                  +{toFixed(sum_today)}
                                </Text>
                            ) : (
                                <Text
                                    style={[
                                      content.text_right,
                                      content.take_in,
                                      {color: "#fe0000"}
                                    ]}>
                                  {toFixed(sum_today)}
                                </Text>
                            )}
                          </CellBody>
                          <CellFooter style={[content.text_right, content.foot, content.date]}>
                            {toFixed(total_balanced)}
                            <Entypo name='chevron-thin-down' style={{fontSize: 14, marginLeft: 5}}/>
                          </CellFooter>
                        </Cell>
                    );
                  })}
                </Cells>
              </View>
            </View>
        );
      });
    } else {
      return <RenderEmpty/>;
    }
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <View style={header.wrapper}>
            <Text style={header.profit}>{toFixed(this.state.unbalanced)} </Text>
            <Text style={header.desc}>待结算运营收益额</Text>
          </View>
          <ScrollView>{this.renderList(this.state.items)}</ScrollView>
        </View>
    );
  }
}

const header = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    height: pxToDp(290),
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: pxToDp(1),
    borderColor: colors.fontGray
  },
  profit: {
    fontSize: pxToDp(72),
    color: colors.main_color
  },
  desc: {
    fontSize: pxToDp(24),
    color: "#3e3e3e",
    marginTop: pxToDp(50)
  }
});
const content = StyleSheet.create({
  item_header: {
    flexDirection: "row",
    alignItems: "center",
    height: pxToDp(60),
    paddingHorizontal: pxToDp(30)
  },
  item_time: {
    fontSize: pxToDp(28),
    color: colors.fontColor
  },
  cell: {
    height: pxToDp(125),
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  header: {
    minWidth: pxToDp(150),
    height: "100%",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center"
  },
  body: {
    width: pxToDp(175),
    alignItems: "flex-end"
  },
  text_right: {
    textAlign: "right"
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
    borderColor: "#fe0000",
    color: "#fe0000",
    fontSize: pxToDp(24),
    textAlign: "center",
    lineHeight: pxToDp(30),
    paddingHorizontal: pxToDp(10),
    paddingVertical: pxToDp(5),
    marginTop: pxToDp(5)
  },
  expend: {
    color: "#fe0000"
  },
  take_in: {
    color: colors.main_color
  },
  cust: {
    marginLeft: 0,
    width: "100%",
    paddingHorizontal: pxToDp(30),
    paddingRight: pxToDp(10),
    marginTop: pxToDp(0),
    height: pxToDp(125)
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(OperateProfitScene);
