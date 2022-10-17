import React from 'react'
import PropTypes from 'prop-types'
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../util/http";
import Config from "../common/config";
import pxToDp from "../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import GlobalUtil from "../util/GlobalUtil";

const width = Dimensions.get("window").width;

const {HOST_UPDATED} = require("../../pubilc/common/constants").default;

const initState = {
  scrollViewIsBottom: false,
  advicesInfoArray: {},
  showAdvicesVisible: false,
  countDownTime: 5
}

class RemindModal extends React.Component {
  static propTypes = {
    accessToken: PropTypes.string,
    currStoreId: PropTypes.string,
    onPress: PropTypes.func,
    dispatch: PropTypes.func,
  }
  state = initState

  componentDidMount() {
    this.getAdvicesInfo()
  }

  getAdvicesInfo = () => {
    const {accessToken, currStoreId} = this.props;
    const url = '/v1/new_api/advice/showPopAdvice'
    const params = {store_id: currStoreId, access_token: accessToken}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      this.setState({
        advicesInfoArray: res,
        showAdvicesVisible: true
      })
    })

    let api = 'v4/wsbServerConfig/getServer?accessToken='+accessToken
    let data = {
      store_id:currStoreId,
    }
    HttpUtils.post.bind(this.props)(api, data).then(res => {
      if(res?.host && res?.host !== GlobalUtil.getHostPort()){
        const {dispatch} = this.props;
        dispatch({type: HOST_UPDATED, host: res?.host});
        GlobalUtil.setHostPort(res?.host)
      }
    })
  }

  closeRemindModal = () => {
    this.setState({
      showAdvicesVisible: false
    })
  }

  closeAdvicesModal = (val) => {
    this.setState({
      showAdvicesVisible: false
    }, () => {
      this.clearRecord(val)
    })
  }

  clearRecord = (id) => {
    const {accessToken} = this.props;
    const api = `/v1/new_api/advice/recordAdvice/${id}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken
    }).then()
  }

  toAdvicesDetail = (val) => {
    this.setState({
      showAdvicesVisible: false
    }, () => {
      //this.clearRecord(val.id)
      this.props.onPress(Config.ROUTE_DETAIL_NOTICE, {content: val})
    })
  }

  countDown = () => {
    let timer = setTimeout(() => {
      this.setState((preState) => ({
        countDownTime: preState.countDownTime - 1,
      }), () => {
        if (this.state.countDownTime == 0) {
          clearTimeout(timer)
          this.setState({
            scrollViewIsBottom: true
          })
        }
      });
    }, 1000)
  }

  render(): React.ReactNode {
    if (this.state.advicesInfoArray.type && this.state.advicesInfoArray.type == 3) {
      this.countDown()
    }
    return <Modal hardwareAccelerated={true}
                  onRequestClose={() => this.closeRemindModal()}
                  transparent={true}
                  animationType="fade"
                  maskClosable
                  visible={this.state.showAdvicesVisible}>
      <View style={styles.modalWrap}>
        <View style={styles.modalContentWrap}>
          <View style={styles.modalContentTitle}>
            <TouchableOpacity style={{width: '10%'}} onPress={() => this.closeRemindModal()}/>
            <Text style={styles.modalContentTitleText}>{this.state.advicesInfoArray.title} </Text>
            <TouchableOpacity style={styles.modalContentIcon} onPress={() => this.closeRemindModal()}>
              <Entypo name="cross" style={{backgroundColor: "#fff", fontSize: 35, color: colors.b2}}/>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContainer} automaticallyAdjustContentInsets={false}
                      showsVerticalScrollIndicator={true} scrollsToTop={true}>
            <Text style={styles.modalContentText}>
              {this.state.advicesInfoArray.content}
            </Text>
          </ScrollView>
          <If condition={this.state.advicesInfoArray.type == 4}>
            <View style={[styles.modalButtonBox]}>
              <Button title={'取消'}
                      onPress={() => {
                        this.closeAdvicesModal(this.state.advicesInfoArray.id)
                      }}
                      buttonStyle={styles.modalBtnWrap1}
                      titleStyle={styles.modalBtnText}
              />
              <Button title={'同意'}
                      onPress={() => {
                        this.closeAdvicesModal(this.state.advicesInfoArray.id)
                      }}
                      buttonStyle={styles.modalBtnWrap}
                      titleStyle={styles.modalBtnText}
              />
            </View>
          </If>
          <If condition={this.state.advicesInfoArray.type == 1}>
            <View style={[styles.modalButtonBox]}>
              <Button title={'我知道了'}
                      onPress={() => {
                        this.closeAdvicesModal(this.state.advicesInfoArray.id)
                      }}
                      buttonStyle={[styles.modalBtnWrapWhite, {width: width * 0.8}]}
                      titleStyle={styles.modalBtnTextGreen}
              />
            </View>
          </If>
          <If condition={this.state.advicesInfoArray.type == 2}>
            <View style={[styles.modalButtonBox]}>
              <Button title={'查看详情'}
                      onPress={() => {
                        this.toAdvicesDetail(this.state.advicesInfoArray)
                      }}
                      buttonStyle={[styles.modalBtnWrap, {width: width * 0.7}]}
                      titleStyle={styles.modalBtnText}
              />
            </View>
          </If>
          <If condition={this.state.advicesInfoArray.type == 3}>
            <View style={[styles.modalButtonBox]}>
              <Button title={'我已阅读'}
                      onPress={() => {
                        this.closeAdvicesModal(this.state.advicesInfoArray.id)
                      }}
                      disabled={!this.state.scrollViewIsBottom}
                      buttonStyle={[this.state.scrollViewIsBottom ? styles.modalBtnWrap : styles.modalBtnWrap1, {width: width * 0.7}]}
                      titleStyle={styles.modalBtnText}
              />
            </View>
          </If>
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
    color: colors.color111,
    fontWeight: "bold",
    flex: 1,
    fontSize: pxToDp(28)
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
    padding: 12
  }
});

export default RemindModal
