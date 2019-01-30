import React from 'react'
import {StyleSheet, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";

class StoreRule extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "规则处理",
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      cnt: this.props.navigation.state.params.cnt
    }
  }
  
  render () {
    return (
      <View style={styles.container}>
        <View style={styles.cell}>
          <Text style={styles.fontOrange}>待处理差评{this.state.cnt}个</Text>
          <Text>当天未处理，扣除1元活动补贴，如有疑问联系商服</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.fontOrange}>关店规则</Text>
          <Text>每月1~5次，不扣费；</Text>
          <Text>每月6~10次，每单扣除0.5元满减补贴费；</Text>
          <Text>每月11次以上，每单扣除1元满减补贴费；</Text>
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
export default (StoreRule)