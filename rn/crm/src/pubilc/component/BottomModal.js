import React from 'react'
import PropTypes from 'prop-types'
import {Modal, ScrollView, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import pxToDp from "../util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

const width = Dimensions.get("window").width;

class BottomModal extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    onPressClose: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    closeText: PropTypes.string,
    visible: PropTypes.bool,
    btnStyle: PropTypes.object,
    btnTitleStyle: PropTypes.object,
    closeBtnStyle: PropTypes.object,
    closeBtnTitleStyle: PropTypes.object,
    btnBottomStyle: PropTypes.object,
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
          // padding: 10,
          borderRadius: pxToDp(30),
          width: '88%',
        }}>

          <ScrollView style={{paddingBottom: 3,}}>
            <View style={{
              flexDirection: "row",
              padding: 10,
              paddingBottom: 0,
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
            <View style={{paddingHorizontal: 10}}>
              {this.props.children}
            </View>

            <View style={{height: 10}}></View>
            <View style={[{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
            }, this.props.btnBottomStyle]}>
              <If condition={this.props.closeText}>
                <Button buttonStyle={[{
                  backgroundColor: colors.white,
                  width: width * 0.40,
                  marginRight: 10,
                }, this.props.closeBtnStyle]}
                        titleStyle={[{color: colors.color333}, this.props.closeBtnTitleStyle]}
                        title={this.props.closeText}
                        onPress={this.props.onPressClose}></Button>
              </If>

              <Button buttonStyle={[{
                backgroundColor: colors.warn_color,
                width: this.props.closeText !== undefined ? width * 0.40 : width * 0.82,
              }, this.props.btnStyle]}
                      titleStyle={[{color: colors.white}, this.props.btnTitleStyle]} title={this.props.actionText}
                      onPress={this.props.onPress}></Button>
            </View>
          </ScrollView>
        </TouchableHighlight>
      </TouchableOpacity>
    </Modal>
  }
}

export default BottomModal
