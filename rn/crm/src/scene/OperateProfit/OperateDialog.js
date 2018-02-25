import React, {PureComponent} from 'react'
import {Text, View, StyleSheet, TouchableOpacity, Modal, TextInput} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import native from "../../common/native";

class OperateDialog extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <Modal
            transparent={true}
            visible={true}
            onRequestClose={() => {
            }}

        >
          <View style={styles.wrapper}>
            <View style={styles.box}>
              <TextInput/>
            </View>
          </View>
        </Modal>
    )
  }

}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    alignItems:'center',
    justifyContent:'center'
  },
  box: {
    width: '100%',
    backgroundColor:colors.white
  }
});

export default OperateDialog