import React from 'react'
import {ScrollView, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import Cts from "../../../pubilc/common/Cts";
import color from "../../../pubilc/styles/colors";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}


class AreaGoodsPrice extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      access_token: this.props.global.accessToken,
      store_id: this.props.global.currStoreId,
      lists: []
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const self = this
    const {access_token, store_id} = this.state
    HttpUtils.get.bind(this.props)(`/api/get_store_prod_chgs/${store_id}?access_token=${access_token}`).then(res => {
      self.setState({lists: res})
    })
  }

  render() {
    return (
        <ScrollView style={styles.container}>
          <For each="item" index="idx" of={this.state.lists}>
            <View key={idx} style={styles.row}>
              <Text style={styles.productName}>{item.product_name} </Text>
              <Text style={styles.storeName}>{item.store_name} </Text>
              <Text style={styles.productPrice}>{item.old_wm_price}=>{item.new_wm_price} </Text>
              <If condition={item.type == Cts.TRACK_PROD_CHG_UP}>
                <Text style={[styles.fontTrend, styles.fontRed]}>↑</Text>
              </If>
              <If condition={item.type == Cts.TRACK_PROD_CHG_DOWN}>
                <Text style={[styles.fontTrend, styles.fontGreen]}>↓</Text>
              </If>
            </View>
          </For>
        </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: pxToDp(30),
    paddingHorizontal: pxToDp(20)
  },
  productName: {
    flex: 1
  },
  productPrice: {
    width: pxToDp(200)
  },
  storeName: {
    width: pxToDp(150),
    textAlign: 'center'
  },
  fontRed: {
    color: color.red
  },
  fontTrend: {
    width: pxToDp(20)
  },
  fontGreen: {
    color: color.green
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(50)
  }
})

export default connect(mapStateToProps)(AreaGoodsPrice)
