import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Modal, Text, TouchableHighlight, TouchableOpacity, View, StyleSheet, Dimensions} from 'react-native'
import colors from "../styles/colors";

const {height} = Dimensions.get('window')
const styles = StyleSheet.create({
  modalWrap: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    paddingBottom: 0.15 * height
  },
})
export default class LineChartTipModal extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    children: PropTypes.object,
    date: PropTypes.string,
    name: PropTypes.string,
    num: PropTypes.number
  }

  render() {
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.props.onClose}
             maskClosable transparent={true}
             animationType="slide"
             visible={this.props.visible}>
        <TouchableOpacity onPress={this.props.onClose} style={styles.modalWrap}>
          <TouchableHighlight>
            <View style={{
              backgroundColor: colors.white, shadowColor: '#000', shadowOffset: {width: 0, height: 0},
              shadowOpacity: 0.1,
              elevation: 5,
              shadowRadius: 12, height: 54, borderRadius: 4,
            }}>
              <Text style={{paddingLeft: 8, paddingTop: 8, paddingBottom: 4, fontSize: 12, color: colors.color666}}>
                {this.props.date}
              </Text>
              <Text style={{paddingHorizontal: 8, paddingBottom: 8, fontSize: 12, color: colors.color333}}>
                {this.props.name}：{this.props.num}
              </Text>
            </View>
          </TouchableHighlight>
        </TouchableOpacity>
      </Modal>
    )
  }
}
