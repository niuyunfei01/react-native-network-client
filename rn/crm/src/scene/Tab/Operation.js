import React from 'react'
import {InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import {List, WhiteSpace} from 'antd-mobile-rn';
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";
import Config from "../../config";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import BaseComponent from "../BaseComponent";

const Item = List.Item;

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class Operation extends BaseComponent {
  static navigationOptions = {title: "Operation", header: null};
  
  constructor (props) {
    super(props)
    this.state = {
      isRefreshing: false,
      competition: {
        PriceScore: {
          score: 0,
          tip: ''
        },
        StoreScore: {
          score: 0,
          tip: ''
        },
        StoreComment: {
          tip: ''
        },
        BusinessCircleChg: {
          tip: ''
        },
        HotSaleProds: {
          tip: ''
        },
        MarketExamine: {
          show: false
        }
      }
    }
  }
  
  componentWillMount () {
    this.fetchData()
  }
  
  fetchData () {
    const {accessToken, currStoreId} = this.props.global
    const self = this
    self.setState({isRefreshing: true})
    HttpUtils.get.bind(this.props)(`/api/store_competition/${currStoreId}?access_token=${accessToken}`).then(res => {
      self.setState({competition: res, isRefreshing: false})
    })
  }
  
  renderItem (isShow, title, extra, onClick) {
    return (
      <If condition={isShow}>
        <List>
          <Item arrow="horizontal" extra={extra} onClick={() => onClick && onClick()}>
            {title}
          </Item>
        </List>
        <WhiteSpace/>
      </If>
    )
  }
  
  navigate (route, params = {}) {
    let _this = this;
    
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }
  
  render () {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.fetchData()}
          />
        }>
        <View style={styles.container}>
          {this.renderItem(
            this.state.competition.PriceScore.show,
            (<Text>价格指数 <Text style={styles.fontRed}>{this.state.competition.PriceScore.score}</Text></Text>),
            (<Text>{this.state.competition.PriceScore.tip}</Text>),
            () => this.navigate(Config.ROUTE_GOODS_PRICE_INDEX, {from: 'rn'})
          )}
          
          {this.renderItem(
            this.state.competition.StoreScore.show,
            (<Text>店铺评分 <Text style={styles.fontRed}>{this.state.competition.StoreScore.score}</Text></Text>),
            (<Text>{this.state.competition.StoreScore.tip}</Text>),
            () => this.navigate(Config.ROUTE_STORE_RATE, {score: this.state.competition.StoreScore.score})
          )}
          
          {this.renderItem(
            this.state.competition.HotSaleProds.show,
            (<Text>热销新品</Text>),
            (<Text>{this.state.competition.HotSaleProds.tip}</Text>),
            () => this.navigate(Config.ROUTE_GOODS_ANALYSIS)
          )}
          
          {this.renderItem(
            this.state.competition.BusinessCircleChg.show,
            (<Text>商圈调研</Text>),
            (<Text>{this.state.competition.BusinessCircleChg.tip}</Text>),
            () => this.navigate(Config.ROUTE_AREA_GOODS_PRICE)
          )}
          
          {this.renderItem(
            this.state.competition.StoreComment.show,
            (<Text>规则处理</Text>),
            (<Text> </Text>),
            () => this.navigate(Config.ROUTE_STORE_RULE, {cnt: this.state.competition.StoreComment.cnt})
          )}
  
          {this.renderItem(
            this.state.competition.MarketExamine.show,
            (<Text>市价调查</Text>),
            (<Text> </Text>),
            () => this.navigate(Config.ROUTE_GOODS_MARKET_EXAMINE)
          )}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: pxToDp(30),
    paddingHorizontal: pxToDp(20)
  },
  fontRed: {
    color: color.red
  }
})
export default connect(mapStateToProps)(Operation)