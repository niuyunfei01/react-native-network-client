import React from 'react'
import PropTypes from 'prop-types'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default class ResultDialog extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    text: PropTypes.string,
    type: PropTypes.oneOf(['info', 'success', 'trophy']),
    onPress: PropTypes.func.isRequired
  }

  static defaultProps = {
    visible: false
  }

  render() {
    return (
        <Modal
            visible={this.props.visible}
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
            animationType={'fade'}
            transparent={true}
            onRequestClose={() => {
              this.props.onPress && this.props.onPress()
            }}
        >
          <View style={styles.modal}>
            <View style={styles.inner_box}>
              <View style={styles.content}>
                <If condition={this.props.type === 'info'}>
                  <FontAwesome5 name={'exclamation-circle'} size={32} style={{height: pxToDp(112), width: pxToDp(95)}}/>
                </If>
                <If condition={this.props.type === 'success'}>
                  <FontAwesome5 name={'check-circle'} size={32} style={{height: pxToDp(112), width: pxToDp(95)}}/>
                </If>
                <If condition={this.props.type === 'trophy'}>
                  <FontAwesome5 name={'trophy'} size={32}
                                style={{height: pxToDp(112), width: pxToDp(95), color: '#F9AD00'}}/>
                </If>
                <Text style={styles.text}>{this.props.text} </Text>
              </View>
              <TouchableOpacity onPress={() => {
                this.props.onPress && this.props.onPress()
              }}>
                <View style={styles.confirm_btn}>
                  <Text style={styles.confirm_btn_text}>知道了 </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    )
  }
}
const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inner_box: {
    backgroundColor: '#fff',
    borderRadius: pxToDp(10),
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderStyle: 'solid',
    width: pxToDp(590),
    height: pxToDp(480),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: pxToDp(90),
    paddingVertical: pxToDp(90),
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee',
  },
  image: {
    width: pxToDp(112),
    height: pxToDp(112)
  }
  ,
  text: {
    marginTop: pxToDp(38),
    fontSize: pxToDp(30),
    color: '#a3a3a3'
  }
  ,
  confirm_btn: {
    height: pxToDp(100),
    justifyContent: 'center',
    alignItems: 'center'
  }
  ,
  confirm_btn_text: {
    fontSize: pxToDp(36),
    color: '#59b26a'
  }
})
