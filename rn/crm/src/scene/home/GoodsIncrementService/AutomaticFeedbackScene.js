import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import {LineView, Styles} from "./GoodsIncrementServiceStyle";
import Config from "../../../pubilc/common/config";
import AntDesign from "react-native-vector-icons/AntDesign";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";

const styles = StyleSheet.create({
  rowHeaderText: {
    padding: 12,
    fontSize: 15,
    fontWeight: '500',
    color: colors.color333,
    lineHeight: 21
  },
  rowContentText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 12,
  },
  rowContentRightText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color999,
    lineHeight: 17,
    paddingRight: 15,
    paddingLeft: 12,
    paddingTop: 13,
    paddingBottom: 13,
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  switchStyle: {marginRight: 14}
})
const REPLAY_LIST = [
  {
    title: '五星超赞',
    id: 5
  },
  {
    title: '四星满意',
    id: 4
  },
  {
    title: '中评',
    id: 3
  },
  {
    title: '差评',
    id: 1
  }
]

class AutomaticFeedbackScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      storeList: [],
      selectStore: {
        label: '',
        value: '',
        status: {
          score_1: 'off',
          score_3: 'off',
          score_4: 'off',
          score_5: 'off'
        }
      },
      settings: {},
    }
    this.getSetting()
  }

  getStoreList = () => {
    const {global} = this.props
    const {accessToken, currStoreId} = global
    const {selectStore, settings} = this.state

    const api = `/v1/new_api/added/ext_store_list/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get(api).then(list => {
      list.map(item => {
        item.value = item.id
        item.label = item.name
      })
      let _selectStore = tool.length(list) > 0 ? list[0] : selectStore
      Object.keys(settings).map(key => {
        if (_selectStore.value === key)
          _selectStore = {..._selectStore, status: settings[key].status};
      })
      this.setState({
        storeList: list,
        selectStore: _selectStore
      })
    }).catch(error => showError(error.reason))
  }

  getSetting = () => {
    const {global} = this.props

    const {accessToken, currStoreId} = global
    const api = `/v1/new_api/added/auto_reply_info/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get(api).then(res => {
      this.setState({
        settings: res
      }, () => this.getStoreList())
    }).catch(error => showError('获取外卖店设置出错，原因：' + error.reason))
  }

  onChange = (item) => {
    let {selectStore, settings} = this.state
    Object.keys(settings).map(key => {
      if (item.value === key) {
        this.setState({
          selectStore: {
            ...selectStore,
            status: settings[key].status,
            label: item.label,
            name: item.label,
            value: item.value,
            id: item.value,
          }
        })
      }
    })

  }
  renderHeader = () => {
    const {storeList, selectStore} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <Text style={styles.rowHeaderText}>
          外卖店
        </Text>
        <LineView/>
        <ModalSelector skin="customer" data={storeList} onChange={item => this.onChange(item)}>
          <View style={styles.row}>
            <Text style={styles.rowContentText}>
              {selectStore.label}
            </Text>
            <Text style={styles.rowContentRightText}>
              {'切换门店 >'}
            </Text>
          </View>
        </ModalSelector>
      </View>
    )
  }

  touchTempDetail = (item) => {
    const {global} = this.props
    const {currStoreId, accessToken} = global
    const {selectStore, settings} = this.state
    let tpl_content = ''
    Object.keys(settings).map(key => {
      if (key === selectStore.id) {
        const storeInfo = settings[key]
        Object.keys(storeInfo?.tpl).map(tplKey => {
          if (tplKey === `${item.id}`) {
            tpl_content = storeInfo.tpl[tplKey].tpl_content
          }
        })
      }
    })
    this.props.navigation.navigate(Config.ROUTE_TEMPLATE_SETTINGS, {
      store: {
        store_id: currStoreId,
        ext_store_id: selectStore.value,
        tpl_level: `${item.id}`,
        tpl_content: tpl_content,
        title: item.title,
        accessToken: accessToken
      }
    })
  }

  getSwitchStatus = (id) => {
    const {selectStore} = this.state
    let status = false
    switch (id) {
      case 1:
        status = selectStore?.status?.score_1 === 'on'
        break
      case 3:
        status = selectStore?.status?.score_3 === 'on'
        break
      case 4:
        status = selectStore?.status?.score_4 === 'on'
        break
      case 5:
        status = selectStore?.status?.score_5 === 'on'
        break
    }
    return status !== undefined ? status : false
  }
  onValueChange = (value, id) => {
    const {selectStore} = this.state
    switch (id) {
      case 1:
        this.setState({
          selectStore: {...selectStore, status: {...selectStore.status, score_1: value ? 'on' : 'off'}},
        })
        break
      case 3:
        this.setState({
          selectStore: {...selectStore, status: {...selectStore.status, score_3: value ? 'on' : 'off'}}
        })
        break
      case 4:
        this.setState({
          selectStore: {...selectStore, status: {...selectStore.status, score_4: value ? 'on' : 'off'}}
        })
        break
      case 5:
        this.setState({
          selectStore: {...selectStore, status: {...selectStore.status, score_5: value ? 'on' : 'off'}}
        })
        break
    }
  }
  renderContent = () => {
    return (
      <View style={Styles.zoneWrap}>
        <Text style={styles.rowHeaderText}>
          回评开关
        </Text>
        <LineView/>
        {
          REPLAY_LIST.map((item, index) => {
            return (
              <View key={index}>
                <View style={styles.row}>
                  <Text style={styles.rowContentText}>
                    {item.title}
                  </Text>
                  <Switch style={styles.switchStyle}
                          value={this.getSwitchStatus(item.id)}
                          onValueChange={value => this.onValueChange(value, item.id)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={() => this.touchTempDetail(item)}>
                  <Text style={styles.rowContentRightText}>
                    回评模板
                  </Text>
                  <Text style={styles.rowContentRightText}>
                    {'模板详情'}
                    <AntDesign name={'right'}/>
                  </Text>
                </TouchableOpacity>
                <LineView/>
              </View>
            )
          })
        }
      </View>
    )
  }

  saveSetting = () => {
    const {selectStore} = this.state
    const {global} = this.props
    const {accessToken, currStoreId} = global
    const api = `/v1/new_api/added/auto_reply?access_token=${accessToken}`
    const params = {
      store_id: currStoreId,
      ext_store_id: selectStore.value,
      score_5: selectStore.status.score_5,
      score_4: selectStore.status.score_4,
      score_3: selectStore.status.score_3,
      score_1: selectStore.status.score_1
    }
    HttpUtils.post(api, params).then(() => {
      showSuccess('保存成功')
    }).catch(error => showError('保存失败，原因：' + error.reason))
  }

  render() {
    return (
      <>
        <ScrollView>
          {this.renderHeader()}
          {this.renderContent()}
        </ScrollView>
        <View style={Styles.saveZoneWrap}>
          <TouchableOpacity style={Styles.saveWrap} onPress={this.saveSetting}>
            <Text style={Styles.saveText}>
              保存
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(AutomaticFeedbackScene)
