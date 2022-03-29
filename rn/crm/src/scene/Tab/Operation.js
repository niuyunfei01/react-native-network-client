import React from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import Config from "../../pubilc/common/config";
import {connect} from "react-redux";
import HttpUtils from "../../pubilc/util/http";
import BaseComponent from "../BaseComponent";
import colors from "../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class Operation extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      isRefreshing: false,
      competition: {
        PriceScore: {
          score: 0,
          tip: '',
          highPercent: 0,
          show: false
        },
        StoreScore: {
          score: 0,
          show: false,
          tip: ''
        },
        StoreProduct: {
          score: 0,
          show: false,
          tip: ''
        },
        StoreComment: {
          tip: '',
          cnt: 0,
          comments: {
            bad: 0,
            good: 0,
            total: 0
          },
          show: false
        },
        BusinessCircleChg: {
          tip: '',
          show: false,
          cnt: {
            down: '',
            up: '',
            total: 0
          }
        },
        MarketExamine: {
          show: false
        },
        HotSaleProds: {
          cnt: 0,
          show: false,
          tip: ''
        }
      }
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const {accessToken, currStoreId} = this.props.global
    const self = this
    self.setState({isRefreshing: true})
    HttpUtils.get.bind(this.props)(`/api/store_competition/${currStoreId}?access_token=${accessToken}`).then(res => {
      self.setState({competition: res, isRefreshing: false})
    })
  }

  onRefresh() {
    this.fetchData()
  }

  navigate(route, params = {}) {
    let _this = this;

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  render() {
    return (<View style={{height: '100%'}}>
      <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this)}/>
          <ScrollView
              refreshControl={
                <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={() => this.fetchData()}
                />
              }>
            <View style={styles.container}>

              <If condition={this.state.competition.StoreProduct && this.state.competition.StoreProduct.show}>
                <View style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%'}}>
                  <Text style={{fontSize: pxToDp(34)}}>{this.state.competition.StoreProduct.tip}</Text>
                  <Text style={{color: '#999999', fontSize: pxToDp(30)}}>当前在售商品{this.state.competition.StoreProduct.score}个</Text>
                </View></If>

              <If condition={this.state.competition.BusinessCircleChg && this.state.competition.BusinessCircleChg.show}>
                <TouchableOpacity style={{flexDirection: "column", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, width: '98%', marginLeft: '1%', marginVertical: '2%', paddingVertical: '2%'}} onPress={() => {
                  this.navigate(Config.ROUTE_GOODS_COMMODITY_PRICING, {})
                }}>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{fontSize: pxToDp(34)}}>{this.state.competition.BusinessCircleChg.tip}</Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Text style={{color: '#999999', fontSize: pxToDp(30)}}>当前调价{this.state.competition.BusinessCircleChg.cnt.total}个</Text>
                      <Entypo name="chevron-right" style={styles.right_icon}/>
                    </View>
                  </View>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: '1%'}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Entypo name='arrow-up' style={{fontSize: 20, color: '#E13030', marginTop: pxToDp(4)}}/>
                      <Text style={{fontSize: pxToDp(26), color: '#E13030'}}>涨价商品</Text>
                      <Text style={{fontSize: pxToDp(26), marginLeft: pxToDp(30)}}>共计{this.state.competition.BusinessCircleChg.cnt.up}个</Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Entypo name='arrow-down' style={{fontSize: 20, color: '#59B26A', marginTop: pxToDp(4)}}/>
                      <Text style={{fontSize: pxToDp(26), color: '#59B26A'}}>降价商品</Text>
                      <Text style={{fontSize: pxToDp(26), marginLeft: pxToDp(30)}}>共计{this.state.competition.BusinessCircleChg.cnt.down}个</Text>
                    </View>
                  </View>
                </TouchableOpacity></If>

              <If condition={this.state.competition.PriceScore && this.state.competition.PriceScore.show == 1}>
                <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%', marginVertical: '2%'}} onPress={() => {this.navigate(Config.ROUTE_GOODS_PRICE_INDEX, {from: 'rn'})}}>
                  <Text style={{fontSize: pxToDp(34)}}>价格指数</Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#999999', fontSize: pxToDp(30)}}>{this.state.competition.PriceScore.tip}</Text>
                    <Entypo name="chevron-right" style={styles.right_icon}/>
                  </View>
                </TouchableOpacity></If>

              <If condition={this.state.competition.StoreScore && this.state.competition.StoreScore.show}>
                <TouchableOpacity style={{flexDirection: "column", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, width: '98%', marginLeft: '1%', marginVertical: '2%', paddingVertical: '1%'}} onPress={() => this.navigate(Config.ROUTE_STORE_RATE, {score: this.state.competition.StoreScore.score})}>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{fontSize: pxToDp(34)}}>店铺评分</Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Text style={{fontSize: pxToDp(30)}}>{this.state.competition.StoreScore.tip}</Text>
                      <Entypo name="chevron-right" style={styles.right_icon}/>
                    </View>
                  </View>
                  <Text style={{fontSize: pxToDp(26), color: '#999999', marginVertical: pxToDp(10)}}>本月累计评价{this.state.competition.StoreComment.comments.total}个；差评{this.state.competition.StoreComment.comments.bad}个，好评{this.state.competition.StoreComment.comments.good}个</Text>
                </TouchableOpacity></If>

              <If condition={this.state.competition.HotSaleProds && this.state.competition.HotSaleProds.show}>
                <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%'}} onPress={() => this.navigate(Config.ROUTE_GOODS_ANALYSIS)}>
                  <Text style={{fontSize: pxToDp(34)}}>热销商品</Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#999999', fontSize: pxToDp(30)}}>{this.state.competition.HotSaleProds.tip}</Text>
                    <Entypo name="chevron-right" style={styles.right_icon}/>
                  </View>
                </TouchableOpacity></If>

              <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%', marginVertical: '2%'}} onPress={() => this.navigate(Config.ROUTE_STORE_RULE, {cnt: this.state.competition.StoreComment.cnt})}>
                <Text style={{fontSize: pxToDp(34)}}>规则处理</Text>
                <Entypo name="chevron-right" style={styles.right_icon}/>
              </TouchableOpacity>

              <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%'}} onPress={() => this.navigate(Config.ROUTE_GOODS_MARKET_EXAMINE)}>
                <Text style={{fontSize: pxToDp(34)}}>市场调查</Text>
                <Entypo name="chevron-right" style={styles.right_icon}/>
              </TouchableOpacity>

              <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", borderRadius: pxToDp(15), paddingHorizontal: pxToDp(10), backgroundColor: colors.white, alignItems: "center", width: '98%', marginLeft: '1%', paddingVertical: '3%', marginVertical: '2%'}} onPress={() => {
                let url = 'https://jinshuju.net/f/ObTCwq';
                this.navigate(Config.ROUTE_WEB, {url: url, title: '问卷调查'});
              }}>
                <Text style={{fontSize: pxToDp(34)}}>有奖问卷调查</Text>
                <Entypo name="chevron-right" style={styles.right_icon}/>
              </TouchableOpacity>

            </View>
          </ScrollView>
    </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: pxToDp(30),
    paddingHorizontal: pxToDp(20)
  },
  right_icon: {
    fontSize: pxToDp(40),
    color: colors.title_color,
    justifyContent: "center",
    alignItems: "center"
  }
})
export default connect(mapStateToProps)(Operation)
