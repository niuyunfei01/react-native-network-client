import React, {PureComponent} from "react";
import CommonModal from "./goods/CommonModal";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import colors from "../styles/colors";
import {SvgXml} from "react-native-svg";
import {close} from "../../svg/svg";

let _this = null
export default class UpdateAppProcessComponent extends PureComponent {

  constructor(props) {
    super(props);
    _this = this;
    this.state = {
      show: false,
      onPressClose: undefined,
      title: '',
      process: 0,
    };
    _this.needShow = true
  }

  static show = (params) => {
    _this.setState({
      show: true,
      onPressClose: undefined,
      title: '',
      process: 0,
      ...params,
    })
  };

  static getShowStatus = () => {
    return _this.needShow
  }

  static setShowStatus = (value = true) => {
    _this.needShow = value
  }
  static hide = () => {
    _this.setState({show: false})
  };

  onClose = () => {
    _this.setState({show: false})
  }

  closeModal = () => {
    _this.setState({show: false})
    _this.needShow = false
  }

  render() {
    const {show, process, title} = this.state
    if (show)
      return (
        <CommonModal visible={show} position={'center'} onRequestClose={this.onClose}>
          <View style={styles.content}>
            <View style={styles.headerWarp}>
              <Text style={styles.headerText}>
                {title}
              </Text>
              <SvgXml xml={close(20, 20)} onPress={this.closeModal} style={styles.closeModal}/>
            </View>
            <View style={styles.processWrap}>
              {Progress(process)}
              <Text style={styles.processText}>{process}%</Text>
            </View>
          </View>
        </CommonModal>
      )
    return null
  }
}
const Progress = (downloadFileProgress = 0) => {
  return (
    <View style={styles.progressWrap}>
      <View style={[styles.progressLeftWrap, {width: `${downloadFileProgress}%`}]}/>
      <View style={[styles.progressRightWrap, {width: `${(100 - downloadFileProgress)}%`}]}/>
    </View>
  )
}
const {width, height} = Dimensions.get('window')
const styles = StyleSheet.create({
  content: {borderRadius: 10, backgroundColor: colors.white, marginHorizontal: 27},
  headerWarp: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 22,
    paddingTop: 20,
    paddingLeft: 20
  },
  closeModal: {marginTop: 20, marginRight: 12},
  processWrap: {flexDirection: 'row', alignItems: 'center', marginBottom: 25, marginTop: 22},
  processText: {fontSize: 14, color: colors.color333, lineHeight: 20, marginLeft: 10},
  process: {width: 0.64 * width, height: 0.00985 * height, borderRadius: 5,},
  progressWrap: {
    marginLeft: 12,
    marginRight: 12,
    width: 0.64 * width,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.f5,
    flexDirection: 'row'
  },
  progressLeftWrap: {
    borderRadius: 10,
    backgroundColor: colors.main_color,
  },
  progressRightWrap: {
    borderRadius: 10,

  },
  progressTipText: {fontSize: 14, color: colors.color333, lineHeight: 20, right: 0, position: 'absolute'},
})
