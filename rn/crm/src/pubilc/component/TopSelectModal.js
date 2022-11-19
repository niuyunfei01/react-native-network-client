import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableHighlight, TouchableOpacity, FlatList} from 'react-native'
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
  itemWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: colors.e5,
    borderBottomWidth: 0.5
  }
})

export default class TopSelectModal extends React.Component {
  static propTypes = {
    list: PropTypes.array,
    default_val: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    label_field: PropTypes.string,
    value_field: PropTypes.string,
    onPress: PropTypes.func,
    onClose: PropTypes.func,
    visible: PropTypes.bool,
    marTop: PropTypes.number,
    children: PropTypes.object,
    modalStyle: PropTypes.object,
    onEndReachedThreshold: PropTypes.number,
    onEndReached: PropTypes.func,
    refreshing: PropTypes.bool,
    initialNumToRender: PropTypes.number
  }
  static defaultProps = {
    visible: true
  }

  renderItem = ({item}) => {
    const {default_val = 0, label_field = 'label', value_field = 'value'} = this.props
    return (
      <TouchableOpacity onPress={() => this.props.onPress(item)} style={styles.itemWrap}>
        <Text
          style={[styles.item_text_style, {color: default_val === item?.[value_field] ? colors.main_color : colors.color666}]}>
          {item?.[label_field]}
        </Text>
      </TouchableOpacity>
    )
  }

  render() {
    const {
      marTop = 42, visible = false, modalStyle = {}, list = [], onEndReachedThreshold, onEndReached, refreshing,
      initialNumToRender
    } = this.props
    if (visible)
      return (
        <TouchableOpacity onPress={this.props.onClose} style={[styles.modalWrap, {top: marTop}]}>
          <TouchableHighlight>
            <FlatList data={list}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      style={[{maxHeight: height * 0.6, backgroundColor: colors.white}, modalStyle]}
                      renderItem={this.renderItem}
                      keyExtractor={(item, index) => `${index}`}
                      onEndReachedThreshold={onEndReachedThreshold}
                      onEndReached={onEndReached}
                      refreshing={refreshing}
                      initialNumToRender={initialNumToRender}/>

          </TouchableHighlight>
        </TouchableOpacity>
      )
    return null
  }
}

