import React, {PureComponent} from "react";
import {Modal, StyleSheet, View} from "react-native";
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  flexEnd: {
    justifyContent: 'flex-end'
  },
  center: {
    justifyContent: 'center'
  }
})
export default class CommonModal extends PureComponent {

  static propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    position: PropTypes.string
  }

  render() {
    const {visible, children, position, onClose} = this.props
    const positionStyle = position && position === 'flex-end' ? styles.flexEnd : styles.center
    return (
      <Modal hardwareAccelerated={true}
             transparent={true}
             visible={visible}
             animationType={'slide'}
             onRequestClose={onClose}>
        <View style={[styles.page, positionStyle]}>
          {children}
        </View>
      </Modal>
    )
  }
}
