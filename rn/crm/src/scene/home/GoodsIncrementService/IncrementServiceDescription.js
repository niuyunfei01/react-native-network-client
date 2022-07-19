import React, {PureComponent} from "react";
import {View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet} from 'react-native'
import {LineView, Styles} from "./GoodsIncrementServiceStyle";
import HttpUtils from "../../../pubilc/util/http";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import {receiveIncrement} from "../../../reducers/mine/mineActions";
import colors from "../../../pubilc/styles/colors";

const styles = StyleSheet.create({
  saveZoneWrap: {justifyContent: 'flex-end', backgroundColor: colors.white, flexDirection: 'row'},
  yearWrap: {
    flex: 1,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 2,
    backgroundColor: colors.main_color,
  },
  monthWrap: {
    flex: 1,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 2,
    backgroundColor: colors.colorCCC,
  }
})

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

  useIncrementService = (open_type = '2') => {
    const {currStoreId, accessToken} = this.props.global

    const params = {
      store_id: currStoreId,
      open_serv: ['bad_notify', 'auto_reply', 'auto_pack'],
      open_type: open_type,
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
          onPress: () => this.openService(open_type)
        }
      ])
    }).catch(error => showError(error.reason))

  }

  openService = (open_type = '2') => {
    const {currStoreId, accessToken} = this.props.global
    const {increment} = this.props.mine
    const {dispatch} = this.props
    const params = {
      store_id: currStoreId,
      open_serv: ['bad_notify', 'auto_reply', 'auto_pack'],
      open_type: open_type,
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
        <If condition={!increment.incrementStatus}>
          <View style={Styles.saveZoneWrap}>
            <TouchableOpacity style={Styles.saveWrap} onPress={() => this.useIncrementService('2')}>
              <Text style={Styles.saveText}>
                {'开通功能'}
              </Text>
            </TouchableOpacity>
          </View>
        </If>
        <If condition={increment.incrementStatus}>
          <View style={styles.saveZoneWrap}>
            <TouchableOpacity style={styles.monthWrap} onPress={() => this.useIncrementService('2')}>
              <Text style={Styles.saveText}>
                {'续费月费'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yearWrap} onPress={() => this.useIncrementService('1')}>
              <Text style={Styles.saveText}>
                {'续费年费'}
              </Text>
            </TouchableOpacity>
          </View>
        </If>

      </>
    )
  }
}

function mapStateToProps(state) {
  const {global, mine} = state;
  return {global: global, mine: mine};
}

export default connect(mapStateToProps)(IncrementServiceDescription)
