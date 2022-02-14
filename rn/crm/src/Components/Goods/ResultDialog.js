import React from 'react'
import PropTypes from 'prop-types'
import {Image, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";

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
                <Image source={require('../../img/Goods/shibai_.png')} style={styles.image}/>
              </If>
              <If condition={this.props.type === 'success'}>
                <Image source={require('../../img/Goods/wancheng_.png')} style={styles.image}/>
              </If>
              <If condition={this.props.type === 'trophy'}>
                <Image source={require('../../img/Goods/jili_.png')} style={styles.image}/>
              </If>
              <Text style={styles.text}>{this.props.text}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              this.props.onPress && this.props.onPress()
            }}>
              <View style={styles.confirm_btn}>
                <Text style={styles.confirm_btn_text}>知道了</Text>
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
