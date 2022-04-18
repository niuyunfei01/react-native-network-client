import React from 'react'
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import Rate from "../../../pubilc/component/goods/Rate";
import Config from "../../../pubilc/common/config";
import {connect} from "react-redux";
import * as tool from "../../../pubilc/util/tool";
import HttpUtils from "../../../pubilc/util/http";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class StoreRate extends React.Component {
  constructor(props) {
    super(props)
    const {currVendorId} = tool.vendor(this.props.global)
    this.state = {
      score: Number(this.props.route.params.score),
      accessToken: this.props.global.accessToken,
      vendorId: currVendorId,
      info: {
        tips: [],
        title: '',
        steps: {
          1: {},
          2: {},
          3: {}
        }
      }
    }
  }

  UNSAFE_componentWillMount() {
    const self = this
    const access_token = this.props.global.accessToken
    HttpUtils.get.bind(this.props)(`/api/store_rate?access_token=${access_token}`).then(res => {
      self.setState({info: res})
    })
  }

  routeTo(route, params = {}) {
    let _this = this;

    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  toCrmWebEvaluation() {
    const {accessToken, vendorId} = this.state
    let path = `/crm_mobile/evaluation.html?access_token=${accessToken}&_v_id=${vendorId}`;
    let url = Config.serverUrl(path, Config.https);
    this.routeTo(Config.ROUTE_WEB, {url: url});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.storeRateRow}>
          <Text style={{color: colors.color333}}>店铺评分 </Text>
          <Rate showRecord={true} currRecord={this.state.score} maxRecord={5} style={styles.rate}/>
        </View>
        <View>
          <For each="item" index="idx" of={this.state.info.tips}>
            <Text style={[styles.tip, {color: item.color ? item.color : '#000'}]} key={idx}>{item.text} </Text>
          </For>
        </View>
        <View style={styles.cell}>
          <Text style={styles.title}>{this.state.info.title} </Text>
          <If condition={this.state.info.steps[1].show}>
            <View style={styles.stepItem}>
              <Text style={{color: colors.color333}}>{this.state.info.steps[1].title} </Text>
              <TouchableOpacity onPress={() => this.toCrmWebEvaluation()}>
                <View>
                  <Text style={styles.linkText}>如何做评价 </Text>
                </View>
              </TouchableOpacity>
            </View>
          </If>
          <If condition={this.state.info.steps[2].show}>
            <View style={styles.stepItem}>
              <Text style={{color: colors.color333}}>{this.state.info.steps[2].title} </Text>
              <TouchableOpacity onPress={() => this.routeTo(Config.ROUTE_GOODS_PRICE_INDEX)}>
                <View>
                  <Text style={styles.linkText}>查看价格指数 </Text>
                </View>
              </TouchableOpacity>
            </View>
          </If>
          <If condition={this.state.info.steps[3].show}>
            <View style={styles.stepItem}>
              <Text style={{color: colors.color333}}>{this.state.info.steps[3].title} </Text>
              <TouchableOpacity onPress={() => this.routeTo(Config.ROUTE_GOODS_ANALYSIS)}>
                <View>
                  <Text style={styles.linkText}>上架新品 </Text>
                </View>
              </TouchableOpacity>
            </View>
          </If>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(30),
    flex: 1
  },
  cell: {
    backgroundColor: '#fff',
    paddingVertical: pxToDp(30),
    marginBottom: pxToDp(10),
    alignItems: 'center',
    marginTop: pxToDp(20)
  },
  storeRateRow: {
    flexDirection: 'row'
  },
  rate: {
    marginLeft: pxToDp(15)
  },
  tip: {
    fontSize: pxToDp(25),
    marginTop: pxToDp(20)
  },
  title: {
    backgroundColor: '#F7C339',
    fontWeight: '600',
    marginBottom: pxToDp(30)
  },
  stepItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: pxToDp(20),
    paddingHorizontal: pxToDp(10)
  },
  linkText: {
    color: colors.blue_link,
    textDecorationLine: 'underline'
  }
})

export default connect(mapStateToProps)(StoreRate)
