import React, {PureComponent} from 'react'
import {Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";

const {height} = Dimensions.get("window");
const styles = StyleSheet.create({
  modalWrap: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  },
  touchWrap: {backgroundColor: colors.white, maxHeight: height * 0.8, borderRadius: 15, width: '88%'},
  title: {fontSize: 16, color: colors.color333, fontWeight: 'bold', marginVertical: 10, textAlign: 'center'},
  desc: {fontSize: 15, color: colors.color333, marginBottom: 10},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between',}
})
let _this = null;

class JbbAlert extends PureComponent {

  constructor(props) {
    super(props);
    _this = this;
    this.state = {
      show: false,
      onPress: undefined,
      onPressClose: undefined,
      title: '',
      desc: '',
      actionText: '',
      closeText: '',
      descStyle: null,
      titleStyle: null,
      allowCloseModal: true
    };
  }

  static show = (params) => {
    _this.setState({
      descStyle: params?.descStyle || null,
      titleStyle: params?.titleStyle || null,
      show: true,
      onPress: undefined,
      onPressClose: undefined,
      title: '',
      desc: '',
      allowCloseModal: params.allowCloseModal ?? true,
      actionText: '',
      closeText: '',
      ...params,
    })
  };

  static hide = () => {
    _this.setState({show: false})
  };

  onClose = () => {
    const {allowCloseModal} = this.state
    if (allowCloseModal)
      _this.setState({show: false})
  }

  touchClose=()=>{
    _this.setState({show: false})
  }

  render() {
    let {show, onPress, onPressClose, title, desc, actionText, closeText, descStyle, titleStyle} = this.state;
    if (show) {
      return (
        <Modal hardwareAccelerated={true}
               onRequestClose={this.onClose}
               maskClosable transparent={true}
               animationType="slide"
               visible={show}>
          <TouchableOpacity onPress={this.onClose} style={styles.modalWrap}>
            <TouchableHighlight style={styles.touchWrap}>
              <View style={{padding: 20,}}>

                <Text style={titleStyle || styles.title}>
                  {title}&nbsp;
                </Text>

                <If condition={desc}>
                  <Text style={descStyle || styles.desc}>
                    {desc}&nbsp;
                  </Text>
                </If>
                <View style={[styles.rowBetween, {marginTop: desc ? 0 : 20}]}>
                  <If condition={closeText}>
                    <Button title={closeText}
                            onPress={() => {
                              this.touchClose();
                              onPressClose && onPressClose()
                            }}
                            containerStyle={{flex: 1, borderRadius: 20, length: 40, marginRight: 10}}
                            buttonStyle={{backgroundColor: colors.f5}}
                            titleStyle={{color: colors.color666, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
                  </If>
                  <Button title={actionText}
                          onPress={() => {
                            this.touchClose();
                            onPress && onPress()
                          }}
                          containerStyle={{flex: 1, borderRadius: 20, length: 40,}}
                          buttonStyle={{backgroundColor: colors.main_color}}
                          titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
                </View>
              </View>

            </TouchableHighlight>
          </TouchableOpacity>
        </Modal>
      )
    } else {
      return null
    }

  }
}

export default JbbAlert
