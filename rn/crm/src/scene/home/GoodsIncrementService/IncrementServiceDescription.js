import React, {PureComponent} from "react";
import {View, Text, ScrollView, TouchableOpacity, Alert} from 'react-native'
import {LineView, Styles} from "./GoodsIncrementServiceStyle";
import Config from "../../../pubilc/common/config";
import HttpUtils from "../../../pubilc/util/http";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import {receiveIncrement} from "../../../reducers/mine/mineActions";

const DESCRIPTION_LIST = [
  {
    id: 0,
    title: '差评提醒',
    description: '当日差评自动短信/电话提醒，协助商家及时解决问题，降低差评数量，提高店铺评分。'
  },
  {
    id: 1,
    title: '自动回评',
    description: '根据评价类型（星级），自动回复客户评价，提供回复模板，帮助商家更好的运营店铺。'
  },
  {
    id: 2,
    title: '自动打包',
    description: '自由设置来单x分钟后自动打包，节省处理时间，提升商家整体数据。'
  },
]

class IncrementServiceDescription extends PureComponent {

  constructor(props) {
    super(props);

  }

  useIncrementService = () => {
    const {currStoreId, accessToken} = this.props.global

    const params = {
      store_id: currStoreId,
      open_serv: ['bad_notify', 'auto_reply', 'auto_pack'],
      open_type: '2',
      confirm: '0'
    }
    const api = `/v1/new_api/added/service_open?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, params).then(res => {
      Alert.alert(res[0], res[1], [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          style: 'default',
          onPress: () => this.openService()
        }
      ])
    }).catch(error => showError(error.reason))

  }

  openService = () => {
    const {currStoreId, accessToken} = this.props.global
    const {increment} = this.props.mine
    const {dispatch} = this.props
    const params = {
      store_id: currStoreId,
      open_serv: ['bad_notify', 'auto_reply', 'auto_pack'],
      open_type: '2',
      confirm: '1'
    }
    const api = `/v1/new_api/added/service_open?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, params).then(() => {
      showSuccess(increment.incrementStatus ? '续费成功' : '开通成功')
      dispatch(receiveIncrement({...increment, incrementStatus: true}))
    }).catch(error => showError(error.reason))
  }

  render() {
    const {increment} = this.props.mine
    return (
      <>
        <ScrollView>
          {
            DESCRIPTION_LIST.map((item, index) => {
              return (
                <View style={Styles.zoneWrap} key={index}>
                  <Text style={Styles.headerTitleText}>
                    {item.title}
                  </Text>

                  <LineView/>
                  <Text style={Styles.descriptionText}>
                    {item.description}
                  </Text>
                  <If condition={item.id === 0}>
                    <Text style={Styles.tipText}>
                      短信、电话通讯费用另计（由通讯公司收取费用）
                    </Text>
                  </If>
                </View>
              )
            })
          }
        </ScrollView>
        <View style={Styles.saveZoneWrap}>
          <TouchableOpacity style={Styles.saveWrap} onPress={this.useIncrementService}>
            <Text style={Styles.saveText}>
              {increment.incrementStatus ? '续费' : '开通功能'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global, mine} = state;
  return {global: global, mine: mine};
}

export default connect(mapStateToProps)(IncrementServiceDescription)
