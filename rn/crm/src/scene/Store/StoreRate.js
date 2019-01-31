import React from 'react'
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";
import Rate from "../../Components/Goods/Rate";
import Config from "../../config";
import {connect} from "react-redux";
import * as tool from "../../common/tool";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class StoreRate extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "店铺评分",
    }
  }
  
  constructor (props) {
    super(props)
    const {currVendorId} = tool.vendor(this.props.global)
    this.state = {
      score: Number(this.props.navigation.state.params.score),
      accessToken: this.props.global.accessToken,
      vendorId: currVendorId
    }
  }
  
  routeTo (route, params = {}) {
    let _this = this;
    
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }
  
  toCrmWebEvaluation () {
    const {accessToken, vendorId} = this.state
    let path = `/crm_mobile/evaluation.html?access_token=${accessToken}&_v_id=${vendorId}`;
    let url = Config.serverUrl(path, Config.https);
    this.routeTo(Config.ROUTE_WEB, {url: url});
  }
  
  render () {
    return (
      <View style={styles.container}>
        <View style={styles.storeRateRow}>
          <Text>店铺评分</Text>
          <Rate showRecord={true} currRecord={this.state.score} maxRecord={5} style={styles.rate}/>
        </View>
        <View>
          <Text style={styles.tip}>评分未达到5分，每单扣除1元满减补贴费。</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.title}>完成5.0评分，只需2步</Text>
          <View style={styles.stepItem}>
            <Text>第1步：在美团做3~5个好评；</Text>
            <TouchableOpacity onPress={() => this.toCrmWebEvaluation()}>
              <View>
                <Text style={styles.linkText}>如何做评价</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.stepItem}>
            <Text>第2步：价格指数调整在4.2分以上；</Text>
            <TouchableOpacity onPress={() => this.routeTo(Config.ROUTE_GOODS_PRICE_INDEX)}>
              <View>
                <Text style={styles.linkText}>查看价格指数</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/*<View style={styles.stepItem}>*/}
          {/*<Text>第3步：上架热销新品；</Text>*/}
          {/*<TouchableOpacity onPress={() => this.routeTo(Config.ROUTE_GOODS_ANALYSIS)}>*/}
          {/*<View>*/}
          {/*<Text style={styles.linkText}>上架新品</Text>*/}
          {/*</View>*/}
          {/*</TouchableOpacity>*/}
          {/*</View>*/}
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
    color: color.red,
    fontSize: pxToDp(25),
    marginTop: pxToDp(20)
  },
  title: {
    backgroundColor: color.yellow,
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
    color: color.blue_link,
    textDecorationLine: 'underline'
  }
})

export default connect(mapStateToProps)(StoreRate)