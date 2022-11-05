import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View,} from 'react-native'
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import colors from "../styles/colors";

const {width, height} = Dimensions.get("window")
const styles = StyleSheet.create({
  modalWrap: {
    height: height - 40,
    width: width,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    left: 0,
    zIndex: 999
  },
})

class TopSelectModal extends React.Component {
  static propTypes = {
    list: PropTypes.any,
    default_val: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    label_field:PropTypes.string,
    value_field:PropTypes.string,
    onPress: PropTypes.func,
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    marTop: PropTypes.number,
    children: PropTypes.object,
    modalStyle: PropTypes.object,
  }
  static defaultProps = {
    visible: true
  }


  render() {
    const {
      marTop = 42,
      visible = false,
      modalStyle = {},
      list = [],
      default_val = 0,
      label_field = 'label',
      value_field = 'value',
    } = this.props
    if (!visible) {
      return null;
    }
    return (
      <TouchableOpacity onPress={this.props.onClose} style={[styles.modalWrap, {top: marTop}]}>
        <TouchableHighlight>
          <ScrollView
            style={[
              {
                width: width,
                maxHeight: height * 0.6,
                backgroundColor: colors.white,
              },
              modalStyle]}
          >
            <View style={{
              paddingHorizontal: 20,
            }}>
              <For index='index' each='item' of={list}>
                <TouchableOpacity onPress={() => {
                  this.props.onPress(item);
                }} key={index} style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: "center",
                  paddingVertical: 14,
                  borderBottomColor: colors.e5,
                  borderBottomWidth: 0.5
                }}>
                  <Text style={[
                    styles.item_text_style,
                    {color: default_val === item?.[value_field] ? colors.main_color : colors.color666}
                  ]}> {item?.[label_field]} </Text>
                </TouchableOpacity>
              </For>
            </View>
          </ScrollView>
        </TouchableHighlight>
      </TouchableOpacity>
    )
  }
}

export default TopSelectModal
