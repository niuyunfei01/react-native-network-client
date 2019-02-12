import React from 'react'
import {StyleSheet, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class StoreRule extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "规则处理",
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      cnt: this.props.navigation.state.params.cnt,
      rules: []
    }
  }
  
  componentWillMount () {
    const self = this
    const access_token = this.props.global.accessToken
    HttpUtils.get(`/api/store_rules?access_token=${access_token}`).then(res => {
      self.setState({rules: res.rules})
    })
  }
  
  render () {
    return (
      <View style={styles.container}>
        <View style={styles.cell}>
          <Text style={styles.fontOrange}>关店规则</Text>
          <For each="item" index="idx" of={this.state.rules}>
            <Text key={idx}>{item}</Text>
          </For>
        </View>
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