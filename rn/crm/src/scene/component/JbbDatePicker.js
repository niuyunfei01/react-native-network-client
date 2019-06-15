import {DatePickerView} from "antd-mobile-rn";
import {Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React from 'react'
import color from '../../widget/color'


const {height, width} = Dimensions.get('window')
export default class JbbDatePicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      time: ''
    }
  }
  
  onCancel () {
    this.setState({visible: false})
  }
  
  onConfirm () {
    this.setState({visible: false})
    this.props.onConfirm && this.props.onConfirm(this.state.time)
  }
  
  render () {
    return (
      <View>
        <Modal
          visible={this.state.visible}
          animationType={"slide"}
          onRequestClose={() => this.onCancel()}
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={styles.container}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => this.onCancel()}>
                  <View>
                    <Text style={styles.btn}>取消</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onConfirm()}>
                  <View>
                    <Text style={styles.btn}>确定</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <DatePickerView
                mode={"time"}
                value={this.state.time}
                onChange={(time) => this.setState({time})}
              />
            </View>
          </View>
        </Modal>
        
        <TouchableOpacity onPress={() => this.setState({visible: true})}>
          {this.props.children}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerRow: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  btn: {
    color: color.theme,
    fontWeight: 'bold',
    fontSize: 16
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.4,
    width: width,
    backgroundColor: '#fff'
  }
})