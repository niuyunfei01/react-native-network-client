import React from 'react'
import {ScrollView, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../../pubilc/util/pxToDp";
import TabButton from "../../../pubilc/component/TabButton";
import colors from "../../../pubilc/styles/colors";

export default class StoreRate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tabData: [{label: '美团', value: 'mt'}, {label: '饿百', value: 'eb'}]
    }
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "店铺评分",
    }
  }

  onClickTab(value) {

  }

  renderStoreRate() {
    return (
      <View style={styles.cell}>
        <View style={styles.rateBox}>
          <View style={styles.rateItem}>
            <Text style={[styles.striking]}>3.7 </Text>
            <Text style={{color: colors.color333}}>您的店铺评分</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={[styles.striking]}>4.7 </Text>
            <Text style={{color: colors.color333}}>商圈同行平均评分 </Text>
          </View>
        </View>
        <Text style={styles.tip}>
          每天邀请好评至少2个，有效提升排名到商圈平均值
        </Text>
      </View>
    )
  }

  renderStoreEvaluation() {
    return (
      <View style={styles.cell}>
        <View style={styles.rateBox}>
          <View style={styles.rateItem}>
            <Text style={styles.rateItemTop}><Text style={[styles.striking]}>8 </Text>个 </Text>
            <Text style={{color: colors.color333}}>您的店铺评分 </Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateItemTop}>≤<Text style={[styles.striking]}>3 </Text>个 </Text>
            <Text style={{color: colors.color333}}>商圈同行平均评分 </Text>
          </View>
        </View>
        <Text style={styles.tip}>
          每天及时回复差评，提高排名最有效；
        </Text>
      </View>
    )
  }

  renderStoreRank() {
    return (
      <View style={styles.cell}>
        <Text style={[styles.striking]}>店铺商圈排名<Text style={styles.redText}>第10名 </Text></Text>
        <Text style={{color: colors.color333}}>店铺休息或关店，排名会沉到底部 </Text>
        <Text style={{color: colors.color333}}>经常关店会直接影响排名，尽量减少 </Text>
      </View>
    )
  }

  renderTrackRate() {
    return (
      <View style={styles.trackRate}>
        <Text style={{color: colors.color333}}>同行评分：</Text>
        <ScrollView>
          <For each="item" index="idx" of={[1, 2, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}>
            <View key={idx} style={styles.trackRateItem}>
              <Text style={{color: colors.color333}}>菜老包</Text>
              <Text style={{color: colors.color333}}>评分4.5</Text>
            </View>
          </For>
        </ScrollView>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <TabButton
          data={this.state.tabData}
          onClick={(value) => this.onClickTab(value)}
          disableBackgroundTint={colors.background}
        />

        {this.renderStoreRate()}
        {this.renderStoreEvaluation()}
        {this.renderStoreRank()}
        {this.renderTrackRate()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
    flex: 1
  },
  cell: {
    backgroundColor: '#fff',
    paddingVertical: pxToDp(30),
    marginBottom: pxToDp(10),
    alignItems: 'center'
  },
  rateBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  rateItem: {
    alignItems: 'center'
  },
  rateItemTop: {
    fontSize: pxToDp(25)
  },
  striking: {
    fontSize: pxToDp(40),
    fontWeight: 'bold'
  },
  tip: {
    color: colors.orange,
    fontSize: pxToDp(20),
    marginTop: pxToDp(20)
  },
  redText: {
    color: colors.red
  },
  succText: {
    color: colors.theme
  },
  trackRate: {
    marginTop: pxToDp(15),
    flex: 1
  },
  trackRateItem: {
    height: pxToDp(60),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(20),
    borderBottomWidth: pxToDp(1),
    backgroundColor: '#fff',
    flexDirection: 'row'
  }
})