import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../../util/pxToDp";
import {Button, Modal} from "@ant-design/react-native";
import {Icon} from "../../../weui";
import colors from "../../../pubilc/styles/colors";

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

    return <Modal style={{marginBottom: Platform.OS === 'ios' ? 210 : 0}} maskClosable transparent={true}
                  animationType="slide-up"
                  visible={this.props.visible} onClose={this.props.onClose}>
      <View style={{paddingBottom: 10, paddingHorizontal: 10,}}>
        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
            <Text style={[{
              textAlign: 'center',
              flex: 1,
            }, styles.n1b, {fontSize: pxToDp(34),}]}>{this.props.title}</Text>
            <TouchableOpacity
                style={[styles.endcenter, {width: pxToDp(120), height: pxToDp(60), marginTop: 1, position: 'absolute'}]}
                onPress={this.props.onClose}>
              <Icon name="clear"
                    size={pxToDp(30)}
                    style={{backgroundColor: "#fff"}}
                    color={colors.fontGray}/>
            </TouchableOpacity>
          </View>
          {this.props.children}
          <View style={{height: 10}}></View>
          <Button type="warning" style={this.props.btnStyle}
                  onPress={this.props.onPress}>{this.props.actionText}</Button>
        </View>
      </View>
    </Modal>

  }
}

const styles = StyleSheet.create({
  n1b: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: "bold"
  },
  endcenter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
})

export default BottomModal
