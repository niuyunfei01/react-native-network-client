import React from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import pxToDp from "../util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

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
    textAlign: 'center',
    color: colors.title_color,
    fontWeight: "bold",
    flex: 1,
    fontSize: pxToDp(34)
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
            <KeyboardAwareScrollView style={{paddingBottom: 3,}}>
              <View style={styles.keyboardWrap}>
                <TouchableOpacity style={{width: '20%'}} onPress={this.props.onClose}>
                </TouchableOpacity>

                <Text style={styles.title}>
                  {this.props.title}
                </Text>
                <TouchableOpacity style={styles.closeWrap} onPress={this.props.onClose}>
                  <Entypo name="circle-with-cross" color={colors.fontGray} size={pxToDp(45)}/>
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
                          onPress={onPressClose}/>
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
