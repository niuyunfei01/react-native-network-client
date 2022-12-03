import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Modal, Text, TouchableHighlight, TouchableOpacity, View, StyleSheet} from 'react-native'
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

class AlertModal extends PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
    onPressClose: PropTypes.func,
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    children: PropTypes.object,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
    actionText: PropTypes.string.isRequired,
    closeText: PropTypes.string,
  }

  render() {
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.props.onClose}
             maskClosable transparent={true}
             animationType="slide"
             visible={this.props.visible}>
        <TouchableOpacity onPress={this.props.onClose} style={styles.modalWrap}>
          <TouchableHighlight style={styles.touchWrap}>
            <View style={{padding: 20,}}>

              <Text style={styles.title}>
                {this.props.title}&nbsp;
              </Text>

              <If condition={this.props.desc}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Text style={styles.desc}>
                    {this.props.desc}&nbsp;
                  </Text>
                </View>
              </If>
              <View style={[styles.rowBetween, {marginTop: this.props.desc ? 0 : 20}]}>
                <If condition={this.props.closeText}>
                  <Button title={this.props.closeText}
                          onPress={this.props.onPressClose}
                          containerStyle={{flex: 1, borderRadius: 20, length: 40, marginRight: 10}}
                          buttonStyle={{backgroundColor: colors.f5}}
                          titleStyle={{color: colors.color666, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
                </If>
                <Button title={this.props.actionText}
                        onPress={this.props.onPress}
                        containerStyle={{flex: 1, borderRadius: 20, length: 40,}}
                        buttonStyle={{backgroundColor: colors.main_color}}
                        titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
              </View>
            </View>

          </TouchableHighlight>
        </TouchableOpacity>
      </Modal>
    )
  }
}

export default AlertModal
