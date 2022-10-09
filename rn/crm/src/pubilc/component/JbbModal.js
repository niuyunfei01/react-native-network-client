import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Modal, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

const height = Dimensions.get("window").height;

class JbbModal extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    modal_type: PropTypes.string,
    modalStyle: PropTypes.object,
    HighlightStyle: PropTypes.object,
  }
  static defaultProps = {
    visible: true
  }

  render() {
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.props.onClose}
             maskClosable transparent={true}
             animationType="fade"
             visible={this.props.visible}>
        <TouchableOpacity onPress={this.props.onClose} style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
        }, this.props.modal_type && this.props.modal_type === 'center' ? {
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1
        } : {flex: 1}]}>
          <If condition={this.props.modal_type !== 'center'}>
            <View style={{flexGrow: 1}}/>
          </If>
          <TouchableHighlight style={[{
            backgroundColor: colors.white,
            borderRadius: pxToDp(30),
            maxHeight: height * 0.8
          }, this.props.modal_type && this.props.modal_type === 'center' ? {
            width: '88%',
          } : {
            borderTopLeftRadius: pxToDp(30),
            borderTopRightRadius: pxToDp(30),
            padding: pxToDp(30),
            paddingBottom: pxToDp(50)
          }, this.props.HighlightStyle]}>
            <View style={[{padding: 10}, this.props.modalStyle]}>
              {this.props.children}
            </View>
          </TouchableHighlight>
        </TouchableOpacity>
      </Modal>
    )
  }
}

export default JbbModal
