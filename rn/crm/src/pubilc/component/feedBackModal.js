import React from 'react'
import PropTypes from 'prop-types'
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import {Button, CheckBox} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../util/http";
import pxToDp from "../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {TextArea} from "../../weui";

const width = Dimensions.get("window").width;

const initState = {
  showAdvicesVisible: true,
  checked: 0,
  suggest: ''
}

const options = [
  {
    label: '清晰',
    key: 0
  },
  {
    label: '不清晰',
    key: 1
  }
]

class FeedBackModal extends React.Component {
  static propTypes = {
    accessToken: PropTypes.string,
    onPress: PropTypes.func
  }
  state = initState

  componentDidMount() {
  }

  commitFeedback = () => {
    const {accessToken, currStoreId, checked, suggest} = this.props;
    const url = '/v1/new_api/user/commit_feedback'
    const params = {
      store_id: currStoreId,
      access_token: accessToken,
      is_legible: checked,
      feedback: suggest
    }
    HttpUtils.post.bind(this.props)(url, params).then()
  }

  closeRemindModal = () => {
    this.setState({
      showAdvicesVisible: false
    })
  }

  submit = () => {
    this.setState({
      showAdvicesVisible: false
    }, () => {
      this.commitFeedback()
    })
  }

  setItem = (val) => {
    this.setState({
      checked: val
    })
  }

  render = () => {
    let {showAdvicesVisible, checked, suggest} = this.state
    return <Modal hardwareAccelerated={true}
                  onRequestClose={() => this.closeRemindModal()}
                  transparent={true}
                  animationType="fade"
                  maskClosable
                  visible={showAdvicesVisible}>
      <View style={styles.modalWrap}>
        <View style={styles.modalContentWrap}>
          <View style={styles.modalContentTitle}>
            <TouchableOpacity style={{width: '10%'}} onPress={() => this.closeRemindModal()}/>
            <Text style={styles.modalContentTitleText}>反馈信息 </Text>
            <TouchableOpacity style={styles.modalContentIcon} onPress={() => this.closeRemindModal()}>
              <Entypo name="cross" style={{backgroundColor: "#fff", fontSize: 35, color: colors.b2}}/>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContainer} automaticallyAdjustContentInsets={false}
                      showsVerticalScrollIndicator={true} scrollsToTop={true}>
            <View style={styles.Content}>
              <Text style={styles.ContentTitle}>我的页面功能是否清晰 ? </Text>
              <For each="info" of={options} index="key">
                <TouchableOpacity style={styles.TouchBox} onPress={() => this.setItem(info.key)}>
                  <Text>{info.label} </Text>
                  <CheckBox center type={'material'} size={16} checkedIcon={'dot-circle-o'}
                            checkedColor={colors.main_color}
                            uncheckedIcon={'circle-o'} checked={checked === info.key}
                            onPress={() => this.setItem(info.key)}/>
                </TouchableOpacity>
              </For>
              <If condition={checked === 1}>
                <TextArea
                  multiline={true}
                  numberOfLines={4}
                  maxLength={60}
                  style={styles.suggestInput}
                  placeholder=" 请输入修改建议"
                  placeholderTextColor={'#bbb'}
                  onChange={(suggest) => {
                    this.setState({suggest})
                  }}
                  value={suggest}
                  underlineColorAndroid={"transparent"}
                />
              </If>
            </View>
          </ScrollView>
          <View style={[styles.modalButtonBox]}>
            <Button title={'提交'}
                    onPress={() => {
                      this.submit()
                    }}
                    buttonStyle={[styles.modalBtnWrapWhite, {width: width * 0.8}]}
                    titleStyle={styles.modalBtnTextGreen}
            />
          </View>
        </View>
      </View>

    </Modal>
  }
}

const styles = StyleSheet.create({
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalContainer: {height: 200, paddingHorizontal: 20, marginTop: pxToDp(20)},
  modalContentText: {color: colors.fontBlack},
  modalContentWrap: {
    width: width * 0.8,
    backgroundColor: colors.white,
    borderRadius: 8,
    position: "relative"
  },
  modalContentTitle: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 0,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  modalContentIcon: {flexDirection: "row", justifyContent: "flex-end", width: '10%'},
  modalContentTitleText: {
    textAlign: 'center',
    color: colors.color000,
    fontWeight: "bold",
    flex: 1,
    fontSize: pxToDp(30)
  },
  closeIcon: {
    fontSize: 35,
    color: colors.b2
  },
  modalBtnWrap: {
    backgroundColor: colors.main_color,
    width: width * 0.35,
    height: 36,
    borderRadius: 2
  },
  modalBtnWrapWhite: {
    backgroundColor: colors.white
  },
  modalBtnWrap1: {
    backgroundColor: '#CCCCCC',
    width: width * 0.35,
    height: 36,
    borderRadius: 2
  },
  modalBtnText: {
    color: colors.white,
    fontSize: pxToDp(30),
    textAlign: 'center'
  },
  modalBtnTextGreen: {
    color: colors.main_color,
    fontSize: 20,
    textAlign: 'center'
  },
  modalButtonBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.colorEEE,
    padding: pxToDp(5)
  },
  Content: {
    flexDirection: "column",
    padding: 10
  },
  ContentTitle: {color: colors.color000, fontSize: pxToDp(25), marginBottom: 10},
  TouchBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  suggestInput: {
    borderColor: colors.colorEEE,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    fontSize: 14
  }
});

export default FeedBackModal
