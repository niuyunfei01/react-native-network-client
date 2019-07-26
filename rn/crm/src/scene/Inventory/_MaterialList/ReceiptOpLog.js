import React from "react";
import PropType from 'prop-types'
import Dialog from "../../component/Dialog";
import {connect} from "react-redux";
import {StyleSheet, Text, View} from "react-native";
import color from '../../../widget/color'
import pxToDp from "../../../util/pxToDp";
import {tool} from "../../../common";
import {withNavigation} from 'react-navigation'

function mapStateToProps (state) {
  const {global, mine} = state;
  return {global, mine};
}

class ReceiptOpLog extends React.Component {
  static propTypes = {
    item: PropType.object,
    visible: PropType.bool,
    receiptId: PropType.oneOfType([PropType.string, PropType.number]),
    onClickClose: PropType.func
  }
  
  constructor (props) {
    super(props)
    const user = tool.user(this.props.global, this.props.mine)
    console.log(user)
    this.state = {
      user: user,
      visible: false
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({visible: nextProps.visible})
  }
  
  renderContent () {
    let items = []
    for (let idx in this.props.item.logs) {
      const item = this.props.item.logs[idx]
      items.push(
        <View key={idx} style={styles.item}>
          <Text>
            {item.user.nickname}
          </Text>
          <Text>
            操作内容：{item.what}
          </Text>
          <Text>
            操作时间：{item.created}
          </Text>
        </View>
      )
    }
    
    return items
  }
  
  render () {
    return (
      <View>
        <Dialog visible={this.state.visible} onRequestClose={() => this.props.onClickClose()}>
          {this.renderContent()}
        </Dialog>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: pxToDp(10),
    borderBottomWidth: 0.5,
    borderColor: '#eee'
  },
  add: {
    color: color.theme,
  }
})
export default withNavigation(connect(mapStateToProps)(ReceiptOpLog))