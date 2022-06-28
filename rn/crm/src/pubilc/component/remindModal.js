import React from 'react'
import PropTypes from 'prop-types'
import {Modal, View, StyleSheet} from 'react-native'
import colors from "../styles/colors";

const styles = StyleSheet.create({
  modalWrap:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalContentWrap:{
    width:'80%',
    backgroundColor: colors.colorEEE,
    borderRadius:8,
    padding:12,
  }
});

class RemindModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    modalStyle: PropTypes.object,
  }
  static defaultProps = {
    visible: true
  }

  render(): React.ReactNode {
    return <Modal hardwareAccelerated={true}
                  onRequestClose={this.props.onClose}
                  transparent={true}
                  animationType="fade"
                  maskClosable
                  visible={this.props.visible}>
      <View style={styles.modalWrap}>
        <View style={[styles.modalContentWrap]}>
          {this.props.children}
        </View>
      </View>

    </Modal>
  }
}

export default RemindModal
