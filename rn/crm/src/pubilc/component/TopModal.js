import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity,} from 'react-native'
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

class TopModal extends React.Component {
  static propTypes = {
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
            {this.props.children}
          </ScrollView>
        </TouchableHighlight>
      </TouchableOpacity>
    )
  }
}

export default TopModal
