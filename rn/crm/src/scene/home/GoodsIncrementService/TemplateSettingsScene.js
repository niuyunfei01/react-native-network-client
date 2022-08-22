import React, {PureComponent} from "react";
import {Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity} from "react-native";
import {Styles} from "./GoodsIncrementServiceStyle";
import colors from "../../../pubilc/styles/colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import HttpUtils from "../../../pubilc/util/http";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 25
  },
  rowDescription: {
    padding: 12,
    fontSize: 17,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 24
  },
  rowRightText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    marginRight: 10
  },
  textInput: {
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 1,
    height: 261,
    borderColor: colors.colorCCC,
    borderRadius: 8,
    textAlignVertical: 'top'
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  applyBtn: {
    marginTop: 13,
    marginLeft: 13,
    marginRight: 13,
    marginBottom: 25,
    backgroundColor: colors.colorCCC,
    borderRadius: 8
  },
  activeApplyBtn: {
    marginTop: 13,
    marginLeft: 13,
    marginRight: 13,
    marginBottom: 25,
    backgroundColor: colors.main_color,
    borderRadius: 8
  },
  applyText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 22,
    paddingTop: 7,
    paddingBottom: 7,
    textAlign: 'center'
  }
})

const TEMP_LIST = [
  {
    id: '1',
    text: '默认模板',
    name: 'defaultTemp'
  },
  {
    id: '2',
    text: '自定义模板',
    name: 'customerTemp'
  },
]

export default class TemplateSettingsScene extends PureComponent {

  constructor(props) {
    super(props);
    this.navigationOptions(props, props.route.params.store)
    this.state = {
      selectItem: '-1',
      tempValue: {
        defaultTemp: '',
        customerTemp: props.route.params.store.tpl_content
      }
    }
    this.getDefaultTempContent(props.route.params.store)
  }

  getDefaultTempContent = (store) => {

    const api = `/v1/new_api/added/reply_tpl?type=score_${store.tpl_level}&access_token=${store.accessToken}`
    const {tempValue} = this.state
    HttpUtils.get(api).then(res => {
      this.setState({
        tempValue: {
          ...tempValue,
          defaultTemp: res
        }
      })
    })
  }
  headerTitle = (item) => {
    return (
      <Text style={styles.title}>{item.title} </Text>
    )
  }
  navigationOptions = ({navigation}, item) => {
    navigation.setOptions({
      headerTitle: () => this.headerTitle(item),
    })
  }

  onChangeText = (text, attr) => {
    if (attr === 'defaultTemp') {
      this.setState({
        tempValue: {...this.state.tempValue, defaultTemp: text},
      })
      return
    }
    this.setState({
      tempValue: {...this.state.tempValue, customerTemp: text},
    })
  }

  selectTempInput = (id) => {
    this.setState({
      selectItem: id,
    })
  }

  saveSetting = () => {
    const {store} = this.props.route.params
    const {selectItem, tempValue} = this.state
    if (selectItem === '2' && tempValue.customerTemp.length <= 0) {
      showError('请先输入自定义模板内容')
      return
    }
    const api = `/v1/new_api/added/auto_reply_tpl`
    const params = {
      store_id: store.store_id,
      ext_store_id: store.ext_store_id,
      tpl_level: store.tpl_level,
      tpl_type: selectItem,
      tpl_content: selectItem === '1' ? tempValue.defaultTemp : tempValue.customerTemp
    }
    HttpUtils.post(api, params).then(() => {
      showSuccess('保存成功')
    }).catch(error => showError('保存出错，原因：' + error.reason))
  }

  render() {
    const {tempValue, selectItem} = this.state
    return (
      <ScrollView>
        {
          TEMP_LIST.map((item, index) => {
            return (
              <View style={Styles.zoneWrap} key={index}>
                <TouchableOpacity style={styles.row} onPress={() => this.selectTempInput(item.id)}>
                  <Text style={styles.rowDescription}>
                    {item.text}
                  </Text>
                  <Text style={styles.rowRightText}>
                    回评模板
                    <AntDesign name={selectItem === item.id ? 'down' : 'right'} color={colors.colorCCC}/>
                  </Text>
                </TouchableOpacity>
                <If condition={selectItem === item.id}>
                  <TextInput style={styles.textInput}
                             value={tempValue[item.name]}
                             editable={item.id !== '1'}
                             onChangeText={text => this.onChangeText(text, item.name)}
                             multiline={true}/>
                  <TouchableOpacity style={tempValue[item.name].length > 0 ? styles.activeApplyBtn : styles.applyBtn}
                                    onPress={this.saveSetting}>
                    <Text style={styles.applyText}>
                      应用模板
                    </Text>
                  </TouchableOpacity>
                </If>
              </View>
            )
          })
        }
      </ScrollView>
    )
  }
}
