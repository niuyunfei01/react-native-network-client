import React from "react";
import PropType from 'prop-types'
import Dialog from "../../component/Dialog";
import {connect} from "react-redux";
import {StyleSheet, Text, View} from "react-native";
import color from '../../../widget/color'
import JbbPrompt from "../../component/JbbPrompt";
import HttpUtils from "../../../util/http";
import pxToDp from "../../../util/pxToDp";
import {tool} from "../../../common";

function mapStateToProps (state) {
  const {global, mine} = state;
  return {global, mine};
}

class PackDetail extends React.Component {
  static propTypes = {
    details: PropType.object,
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
      visible: false,
      details: []
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({visible: nextProps.visible, details: nextProps.details})
  }
  
  onAddPackNumber (value, productId, prodIdx) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry_append?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: this.props.item.id,
      productId: productId,
      num: value
    }).then(res => {
      const {details} = this.state
      details[prodIdx].entries.push(res)
      this.setState({details})
    })
  }
  
  renderContent () {
    let items = []
    for (let idx in this.props.details) {
      const item = this.props.details[idx]
      items.push(
        <View key={idx} style={styles.item}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={{width: 250}}>
              {item.product_name}
            </Text>
            <JbbPrompt
              title={'请输入数量'}
              onConfirm={(value) => this.onAddPackNumber(value, item.product_id, idx)}
              keyboardType={'numeric'}
            >
              <Text style={styles.add}>
                添加
              </Text>
            </JbbPrompt>
          </View>
  
          <For of={item.entries} each="record" index="i">
            <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>{record.pack_user.nickname} </Text>
              <Text>{record.num > 0 ? `+${record.num}` : record.num}</Text>
            </View>
          </For>
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
export default connect(mapStateToProps)(PackDetail)