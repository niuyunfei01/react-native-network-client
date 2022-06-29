import React from 'react'
import PropTypes from 'prop-types'
import {Modal, View, StyleSheet, Text, TouchableOpacity, ScrollView} from 'react-native'
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../util/http";
import Config from "../common/config";
import {showError} from "../util/ToastUtils";

const initState = {
  scrollViewIsBottom: false,
  advicesInfoArray: {},
  showAdvicesVisible: false
}

class RemindModal extends React.Component {
  state = initState

  static propTypes = {
    accessToken: PropTypes.string,
    onPress: PropTypes.func,
    currStoreId: PropTypes.string
  }

  componentDidMount() {
    this.getAdvicesInfo()
  }

  getAdvicesInfo = () => {
    const {accessToken, currStoreId} = this.props;
    const url='/v1/new_api/advice/showPopAdvice'
    const params={store_id:currStoreId, access_token: accessToken}
    HttpUtils.get.bind(this.props)(url,params).then(res=>{
      this.setState({
        advicesInfoArray: res, showAdvicesVisible: true
      })
    }).catch(error=>{showError(error)})
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
    }).then((res) => {
      console.log('recordAdvice  res =>', res)
    })
  }

  toAdvicesDetail = (val) => {
    this.setState({
      showAdvicesVisible: false
    }, () => {
      this.clearRecord(val.id)
      this.props.onPress(Config.ROUTE_DETAIL_NOTICE, {content: val})
    })
  }
  render(): React.ReactNode {
    return <Modal hardwareAccelerated={true}
                  onRequestClose={() => this.closeRemindModal()}
                  transparent={true}
                  animationType="fade"
                  maskClosable
                  visible={this.state.showAdvicesVisible}>
      <View style={styles.modalWrap}>
        <View style={styles.modalContentWrap}>
          <View style={styles.modalContentIcon}>
            <TouchableOpacity onPress={() => this.closeRemindModal()}>
              <Entypo name={'cross'} style={styles.closeIcon}/>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContentTitle}>
            <Text style= {styles.modalContentTitleText}>
              {this.state.advicesInfoArray.title}
            </Text>
          </View>
          <ScrollView style={styles.modalContainer} onMomentumScrollEnd={(e) => {
            let self = this
            let offsetY = e.nativeEvent.contentOffset.y;
            let contentSizeHeight = e.nativeEvent.contentSize.height;
            let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height;
            if (offsetY + oriageScrollHeight + 1 >= contentSizeHeight){
              self.setState({
                scrollViewIsBottom: true
              })
            }
          }} automaticallyAdjustContentInsets={false} showsVerticalScrollIndicator={true} scrollsToTop={true}>
            <Text style={styles.modalContentText}>
              {this.state.advicesInfoArray.content}
            </Text>
          </ScrollView>
          <If condition={this.state.advicesInfoArray.type == 4}>
            <View style={{display: "flex",flexDirection: "row",justifyContent: "space-around",alignItems: "center"}}>
              <Button title={'取消'}
                      onPress={() => {
                        this.closeAdvicesModal(this.state.advicesInfoArray.id)
                      }}
                      buttonStyle={styles.modalBtnWrapCancel}
                      titleStyle={styles.modalBtnTextCancel}
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
            <Button title={'知道了'}
                    onPress={() => {
                      this.closeAdvicesModal(this.state.advicesInfoArray.id)
                    }}
                    buttonStyle={styles.modalBtnWrap}
                    titleStyle={styles.modalBtnText}
            />
          </If>
          <If condition={this.state.advicesInfoArray.type == 2}>
            <Button title={'查看详情'}
                    onPress={() => {
                      this.toAdvicesDetail(this.state.advicesInfoArray)
                    }}
                    buttonStyle={styles.modalBtnWrap}
                    titleStyle={styles.modalBtnText}
            />
          </If>
          <If condition={this.state.advicesInfoArray.type == 3}>
            <Button title={'我已阅读'}
                    onPress={() => {
                      this.closeAdvicesModal(this.state.advicesInfoArray.id)
                    }}
                    disabled={!this.state.scrollViewIsBottom}
                    buttonStyle={this.state.scrollViewIsBottom ? styles.modalBtnWrap : styles.modalBtnWrap1}
                    titleStyle={styles.modalBtnText}
            />
          </If>
        </View>
      </View>

    </Modal>
  }
}

const styles = StyleSheet.create({
  modalWrap:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalContainer: {height: 200, paddingHorizontal: 10, marginTop: 20},
  modalContentWrap:{
    width:'80%',
    backgroundColor: colors.colorEEE,
    borderRadius:8,
    padding:12,
    position: "relative"
  },
  modalContentTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems:'center',
    justifyContent: "center"
  },
  modalContentIcon: {
    flex: 1,
    position: "absolute",
    right: 0,
    top: 0
  },
  modalContentTitleText: {
    fontSize:12,
    fontWeight:'bold',
    paddingTop:8,
    paddingBottom:8,
    lineHeight:25
  },
  closeIcon: {
    fontSize: 35,
    color: colors.fontColor
  },
  modalBtnWrap:{
    backgroundColor:colors.main_color,
    marginLeft:20,
    marginRight:20
  },
  modalBtnWrapCancel:{
    backgroundColor:colors.white,
    borderWidth: 1,
    borderColor: colors.color333,
    marginLeft:20,
    marginRight:20
  },
  modalBtnWrap1:{
    backgroundColor:colors.fontColor,
    marginLeft:20,
    marginRight:20
  },
  modalBtnText:{
    color:colors.white,
    fontSize:20,
    padding:12,
    textAlign:'center'
  },
  modalBtnTextCancel:{
    color:colors.color333,
    fontSize:20,
    padding:12,
    textAlign:'center'
  },
});

export default RemindModal
