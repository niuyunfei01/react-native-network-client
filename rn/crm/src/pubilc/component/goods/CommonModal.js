import React, {PureComponent} from "react";
import {Modal, StyleSheet} from "react-native";
import PropTypes from 'prop-types'
import {SafeAreaView} from "react-native-safe-area-context";

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
    onRequestClose: PropTypes.func,
    onShow: PropTypes.func,
    children:PropTypes.element,
    position: PropTypes.string
  }

  render() {
    const {visible, children, position, onRequestClose, onShow} = this.props
    const positionStyle = position && position === 'flex-end' ? styles.flexEnd : styles.center
    return (
      <Modal hardwareAccelerated={true}
             transparent={true}
             visible={visible}
             animationType={'slide'}
             onShow={onShow && onShow}
             onRequestClose={onRequestClose}>
        <SafeAreaView style={[styles.page, positionStyle]}>
          {children}
        </SafeAreaView>
      </Modal>
    )
  }
}
