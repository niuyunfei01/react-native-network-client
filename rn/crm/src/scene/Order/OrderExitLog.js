import React from 'react'
import {ScrollView, Text, View} from 'react-native'
import {connect} from 'react-redux'
import BaseComponent from "../BaseComponent";
import HttpUtils from "../../util/http";
import {Accordion} from "@ant-design/react-native";

const mapStateToProps = state => {
  return {global: state.global}
}

class OrderExitLog extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      orderItems: []
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const self = this
    const accessToken = this.props.global.accessToken
    const orderId = this.props.route.params.orderId
    const uri = `/crm_orders/order_scan_exit_log/${orderId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({orderItems: res})
    })
  }

  render() {
    return (
      <ScrollView>
        <Accordion>
          <For each="item" index="idx" of={this.state.orderItems}>
            <Accordion.Panel
              key={item.id}
              header={`${item.name}(${item.exitLog.length})`}
              style={{backgroundColor: '#fff'}}
            >
              <View>
                <For each="log" index="logIdx" of={item.exitLog}>
                  <View key={log.id} style={{padding: 10, borderBottomWidth: 1, borderBottomColor: '#f8f8f8'}}>
                    {log.pack_time ? (<Text>打包时间：{log.pack_time} </Text>) : null}
                    {log.packUsername ? (<Text>打包人：{log.packUsername} </Text>) : null}
                    {log.weight ? (<Text>重量：{log.weight} </Text>) : null}
                    {log.num ? (<Text>数量：{log.num} </Text>) : null}
                  </View>
                </For>
              </View>
            </Accordion.Panel>
          </For>
        </Accordion>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps)(OrderExitLog)
