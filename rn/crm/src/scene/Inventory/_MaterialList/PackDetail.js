import React from "react";
import PropType from 'prop-types'
import Dialog from "../../component/Dialog";
import {connect} from "react-redux";
import {Text, View} from "react-native";
import HttpUtils from "../../../util/http";
import {ToastShort} from "../../../util/ToastUtils";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class PackDetail extends React.Component {
  static propTypes = {
    visible: PropType.bool,
    receiptId: PropType.oneOfType([PropType.string, PropType.number]),
    onClickClose: PropType.func
  }
  
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      items: []
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    if (nextProps.visible) {
      this.onFetchDetail()
    }
    this.setState({visible: nextProps.visible})
  }
  
  onFetchDetail () {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `/api_products/inventory_entry_detail/${this.props.receiptId}?access_token=${accessToken}`
    this.setState({isLoading: true})
    HttpUtils.get.bind(self.props)(api).then(res => {
      if (res.length) {
      
      } else {
        ToastShort('无打包详情')
        self.props.onClickClose()
      }
    })
  }
  
  render () {
    return (
      <Dialog visible={this.state.visible} onRequestClose={() => this.props.onClickClose()}>
        <View>
          <For of={this.state.items} each="item" index="idx">
            <Text key={idx}></Text>
          </For>
        </View>
      </Dialog>
    )
  }
}

export default connect(mapStateToProps)(PackDetail)