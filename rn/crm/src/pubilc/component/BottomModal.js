import React from 'react'
import PropTypes from 'prop-types'
import {Modal, ScrollView, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import {Button} from "react-native-elements";

class BottomModal extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    btnStyle: PropTypes.object
  }
  static defaultProps = {
    visible: true
  }

  render(): React.ReactNode {
    return <Modal hardwareAccelerated={true}
                  onRequestClose={this.props.onClose}
                  maskClosable transparent={true}
                  visible={this.props.visible}>

      <TouchableOpacity onPress={this.props.onClose} style={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
      }}>
        <TouchableHighlight style={{
          backgroundColor: colors.white,
          padding: 10,
          borderRadius: pxToDp(30),
          width: '88%',
        }}>

          <ScrollView style={{paddingBottom: 3,}}>
            <View style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}>
              <TouchableOpacity
                style={{width: '20%'}}
                onPress={this.props.onClose}>
              </TouchableOpacity>

              <Text style={[{
                textAlign: 'center',
                color: colors.title_color,
                fontWeight: "bold",
                flex: 1,
                fontSize: pxToDp(34)
              }]}>{this.props.title}</Text>

              <TouchableOpacity
                style={[{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: '20%'
                }]}
                onPress={this.props.onClose}>
                <Entypo name="circle-with-cross"
                        style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
              </TouchableOpacity>
            </View>
            {this.props.children}
            <View style={{height: 5}}></View>
            <Button buttonStyle={[{backgroundColor: colors.warn_color}, this.props.btnStyle]}
                    titleStyle={{color: colors.white}} title={this.props.actionText}
                    onPress={this.props.onPress}></Button>
          </ScrollView>
        </TouchableHighlight>
      </TouchableOpacity>
    </Modal>
  }
}

export default BottomModal
