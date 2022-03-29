import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";
import HttpUtils from "../../pubilc/util/http";
import {connect} from "react-redux";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class StoreRule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cnt: this.props.route.params.cnt,
      rules: [],
      isLoading: false
    }

  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const self = this
    const access_token = this.props.global.accessToken
    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props)(`/api/store_rules_v2?access_token=${access_token}`).then(res => {
      self.setState({rules: res.rules, isLoading: false})
    })
  }

  render() {
    return (
      <ScrollView
        style={{flex: 1}}
        refreshControl={
          <RefreshControl
            onRefresh={() => this.fetchData()}
            refreshing={this.state.isLoading}
          />
        }
      >
        <View style={styles.container}>
          <For each="item" index="ruleIdx" of={this.state.rules}>
            <View style={styles.cell} key={`rule_${ruleIdx}`}>
              <Text style={styles.fontOrange}>{item.title} </Text>
              <For each="item" index="idx" of={item.items}>
                <Text key={`rule_${ruleIdx}_item_${idx}`}>{item} </Text>
              </For>
            </View>
          </For>
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
  cell: {
    backgroundColor: '#fff',
    padding: pxToDp(30),
    marginBottom: pxToDp(20),
    // alignItems: 'center'
  },
  fontOrange: {
    color: color.orange,
    fontWeight: '600'
  }
})
export default connect(mapStateToProps)(StoreRule)
