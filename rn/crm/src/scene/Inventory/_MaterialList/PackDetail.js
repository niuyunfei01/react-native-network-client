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
import {List} from "antd-mobile-rn/lib/list/index.native";
import ModalSelector from "react-native-modal-selector";

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
    const store = tool.store(this.props.global)
    console.log(user)
    this.state = {
      user: user,
      store: store,
      visible: false,
      details: [],
      activeUsers: [],
      appendVisible: false,
      appendUser: {},
      appendProductId: 0,
      appendIdx: 0
    }
  }
  
  componentDidMount (): void {
    this.fetchActiveWorker()
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({visible: nextProps.visible, details: nextProps.details})
  }
  
  onAddPackNumber (value) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry_append?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: this.props.item.id,
      productId: this.state.appendProductId,
      num: value,
      appendUId: this.state.appendUser.id
    }).then(res => {
      const {details} = this.state
      details[this.state.appendIdx].entries.push(res)
      this.setState({details})
    })
  }
  
  fetchActiveWorker () {
    const self = this
    const {accessToken} = this.props.global;
    let {store} = this.state;
    const url = `api/store_contacts/${store.id}.json?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({activeUsers: res})
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
            <ModalSelector
              onChange={(option) => this.setState({
                appendUser: option,
                appendVisible: true,
                appendProductId: item.product_id,
                appendIdx: idx
              })}
              cancelText={'取消'}
              data={this.state.activeUsers}
            >
              <Text style={styles.add}>
                添加
              </Text>
            </ModalSelector>
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
  
        <JbbPrompt
          visible={this.state.appendVisible}
          title={`追加${this.state.appendUser.desc}打包数量`}
          onConfirm={(value) => this.onAddPackNumber(value)}
          keyboardType={'numeric'}
        />
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