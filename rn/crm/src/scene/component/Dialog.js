import React from 'react'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";

export default class Dialog extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    transparent: PropTypes.bool,
    onClickModal: PropTypes.func,
    onRequestClose: PropTypes.func.isRequired,
    align: PropTypes.string
  }

  static defaultProps = {
    transparent: true,
    align: 'left'
  }

  onRequestClose() {

  }

  render() {
    let containerStyle = {}
    if (this.props.align === 'center') {
      containerStyle = {
        alignItems: 'center'
      }
    }

    return (
      <Modal
        visible={this.props.visible}
        onRequestClose={() => this.props.onRequestClose()}
        animationType={'fade'}
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.container, containerStyle]}>
            {this.props.children}
          </View>
          <TouchableOpacity onPress={() => this.props.onRequestClose()} style={styles.modalCancel}>
            <View>
              <Text style={styles.modalCancelText}>关&nbsp;&nbsp;&nbsp;&nbsp;闭</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: pxToDp(10),
    padding: pxToDp(20)
  },
  modalCancel: {
    width: '90%',
    height: pxToDp(80),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(20)
  },
  modalCancelText: {
    color: color.theme,
    fontSize: pxToDp(40)
  }
})
