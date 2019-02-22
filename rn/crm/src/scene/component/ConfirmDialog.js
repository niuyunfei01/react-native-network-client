import React from 'react'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";

export default class ConfirmDialog extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    transparent: PropTypes.bool,
    onClickModal: PropTypes.func,
    onClickCancel: PropTypes.func.isRequired,
    onClickConfirm: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func
  }
  
  static defaultProps = {
    transparent: true,
    
  }
  
  constructor (props) {
    super(props)
    this.state = {
      onRequestClose: this.props.onRequestClose ? this.props.onRequestClose : this.props.onClickCancel
    }
  }
  
  render () {
    return (
      <Modal
        visible={this.props.visible}
        onRequestClose={() => this.state.onRequestClose()}
        animationType={'fade'}
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.container}>
            {this.props.children}
          </View>
          <View style={styles.modalCancel}>
            <TouchableOpacity onPress={() => this.props.onClickConfirm()} style={[styles.btn, styles.btnBorder]}>
              <View>
                <Text style={styles.modalCancelText}>确&nbsp;&nbsp;&nbsp;&nbsp;定</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.onClickCancel()} style={styles.btn}>
              <View>
                <Text style={styles.modalCancelText}>关&nbsp;&nbsp;&nbsp;&nbsp;闭</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    // borderRadius: pxToDp(10),
    borderTopRightRadius: pxToDp(10),
    borderTopLeftRadius: pxToDp(10),
    padding: pxToDp(20)
  },
  modalCancel: {
    width: '90%',
    height: pxToDp(80),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    // borderRadius: pxToDp(10),
    borderBottomRightRadius: pxToDp(10),
    borderBottomLeftRadius: pxToDp(10),
    borderTopWidth: pxToDp(2),
    borderTopColor: color.fontGray
    // marginTop: pxToDp(20)
  },
  modalCancelText: {
    color: color.theme,
    fontSize: pxToDp(40)
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.5
  },
  btnBorder: {
    borderRightWidth: pxToDp(1),
    borderRightColor: color.fontGray
  }
})