import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {KeyboardAvoidingView, Modal, Platform, TouchableHighlight, TouchableOpacity} from 'react-native'
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

const {height, width} = Dimensions.get("window");

class JbbModal extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    modal_type: PropTypes.string,
    children: PropTypes.object,
    HighlightStyle: PropTypes.object,
  }
  static defaultProps = {
    visible: true,
  }

  render() {
    let {modal_type, onClose, visible, children, HighlightStyle} = this.props;
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={onClose}
             transparent={true}
             animationType="slide"
             visible={visible}>
        <TouchableOpacity onPress={onClose} style={{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flexGrow: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: modal_type !== 'center' ? 'flex-end' : 'center',
        }}>
          <KeyboardAvoidingView
            automaticallyAdjustContentInsets={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            behavior={Platform.select({android: 'height', ios: 'padding'})}
            style={[{
              padding: 10,
              backgroundColor: colors.white,
              maxHeight: height * 0.8
            }, modal_type === 'center' ? {
              borderRadius: 15,
              width: '88%',
            } : {
              width: width,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              paddingBottom: 20,
            }, HighlightStyle]}>
            <TouchableHighlight>
              {children}
            </TouchableHighlight>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    )
  }
}

export default JbbModal
