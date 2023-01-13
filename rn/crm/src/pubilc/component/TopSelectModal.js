import React from 'react'
import PropTypes from 'prop-types'
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableHighlight, TouchableOpacity} from 'react-native'
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
  },
  item_text_style: {fontSize: 14}
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
    initialNumToRender: PropTypes.number,
    numColumns: PropTypes.number,
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

  otherItem = ({item, index}) => {

    const {default_val, onPress, selectWrap, warp, selectTextStyle, textStyle, value_field = 'value'} = this.props
    const isSelect = default_val === item[value_field]
    return (
      <TouchableOpacity style={isSelect ? selectWrap : warp}
                        onPress={() => onPress(item, index)}>
        <Text style={isSelect ? selectTextStyle : textStyle}>
          {item.label}
        </Text>
      </TouchableOpacity>
    )
  }

  render() {
    const {
      marTop = 42, visible = false, modalStyle = {}, list = [], onEndReachedThreshold, onEndReached, refreshing,
      initialNumToRender, numColumns = 1, selectWrap = null
    } = this.props
    if (visible)
      return (
        <SafeAreaView style={[styles.modalWrap, {top: marTop}]}>
          <TouchableOpacity style={{flex: 1}} onPress={this.props.onClose}>
            <TouchableHighlight>
              <FlatList data={list}
                        numColumns={numColumns}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={[{maxHeight: height * 0.6, backgroundColor: colors.white}, modalStyle]}
                        renderItem={selectWrap ? this.otherItem : this.renderItem}
                        keyExtractor={(item, index) => `${index}`}
                        onEndReachedThreshold={onEndReachedThreshold}
                        onEndReached={onEndReached}
                        refreshing={refreshing}
                        initialNumToRender={initialNumToRender}/>

            </TouchableHighlight>
          </TouchableOpacity>
        </SafeAreaView>
      )
    return null
  }
}

