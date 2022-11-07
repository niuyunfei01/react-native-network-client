import React from 'react'
import PropTypes from 'prop-types'
import {Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View,} from 'react-native'
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

const {width, height} = Dimensions.get("window")
const styles = StyleSheet.create({
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  contentWrap: {
    backgroundColor: colors.white, borderRadius: pxToDp(30), width: '88%', maxHeight: height * 0.8
  },
  keyboardWrap: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 0,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  title: {
    color: colors.color333,
    fontWeight: "bold",
    flex: 1,
    fontSize: 16
  },
  closeWrap: {
    flexDirection: "row", justifyContent: "flex-end", width: '20%'
  },
  btnWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10
  },
  closeBtn: {
    backgroundColor: colors.white,
    width: width * 0.40,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.color666,
  }
})

class BottomModal extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    onPressClose: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    closeText: PropTypes.string,
    visible: PropTypes.bool,
    btnStyle: PropTypes.object,
    children: PropTypes.object,
    btnTitleStyle: PropTypes.object,
    closeBtnStyle: PropTypes.object,
    closeBtnTitleStyle: PropTypes.object,
    btnBottomStyle: PropTypes.object,
  }
  static defaultProps = {
    visible: true
  }

  render() {
    const {
      onClose, visible, children, btnBottomStyle, closeText, closeBtnStyle, closeBtnTitleStyle, onPressClose, btnStyle,
      btnTitleStyle, actionText, onPress
    } = this.props
    return (
      <Modal hardwareAccelerated={true} onRequestClose={onClose} transparent={true} visible={visible}>
        <TouchableOpacity style={styles.modalWrap} onPress={onClose}>
          <TouchableHighlight style={styles.contentWrap}>
            <KeyboardAwareScrollView style={{paddingBottom: 3}} scrollEnabled={false} enableOnAndroid={false}>
              <View style={styles.keyboardWrap}>
                <Text style={styles.title}>
                  {this.props.title}
                </Text>
                <TouchableOpacity style={styles.closeWrap} onPress={onClose}>
                  <SvgXml xml={cross_icon()} width={18} height={18}/>
                </TouchableOpacity>
              </View>
              <View style={{paddingHorizontal: 10}}>
                {children}
              </View>

              <View style={{height: 10}}/>
              <View style={[styles.btnWrap, btnBottomStyle]}>
                <If condition={closeText}>
                  <Button buttonStyle={[styles.closeBtn, closeBtnStyle]}
                          titleStyle={[{color: colors.color666}, closeBtnTitleStyle]}
                          title={closeText}
                          onPress={() => {
                            if (onPressClose) {
                              onPressClose()
                            } else {
                              onClose()
                            }
                          }}/>
                </If>

                <Button buttonStyle={[{
                  backgroundColor: colors.warn_color,
                  width: closeText !== undefined ? width * 0.40 : width * 0.82
                }, btnStyle]}
                        titleStyle={[{color: colors.white}, btnTitleStyle]} title={actionText}
                        onPress={onPress}/>
              </View>
            </KeyboardAwareScrollView>
          </TouchableHighlight>
        </TouchableOpacity>
      </Modal>
    )
  }
}

export default BottomModal
