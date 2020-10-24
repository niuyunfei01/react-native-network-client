import React from 'react'
import PropTypes from 'prop-types'
import color from '../../widget/color'
import {Text, TouchableOpacity, View} from 'react-native'
import pxToDp from "../../util/pxToDp";
import {Button, Modal} from "antd-mobile-rn";
import Styles from "../../themes/Styles";

class BottomModal extends React.Component {
  static propTypes = {
    onPress: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    visible:PropTypes.bool
  }

  static defaultProps = {
    visible: true
  }

  render(): React.ReactNode {

    return <Modal popup maskClosable animationType="slide-up" visible={this.props.visible} onClose={this.props.onClose}>
      <View style={{paddingBottom: 20, paddingHorizontal: 20}}>
        <View style={{flexDirection: 'column'}}>
          <View style={Styles.endcenter}>
            <Text style={[{textAlign: 'center', flex: 1}, Styles.n1b]}>{this.props.title}</Text>
            <TouchableOpacity style={[Styles.center, {width: pxToDp(120), height: pxToDp(60)}]}
                              onPress={this.props.onClose}>
              <Text style={Styles.n1b}>X</Text>
            </TouchableOpacity>
          </View>
          {this.props.children}
          <Button type="warning" onClick={this.props.onPress}>{this.props.actionText}</Button>
        </View>
      </View>
    </Modal>
  }
}

export default BottomModal
