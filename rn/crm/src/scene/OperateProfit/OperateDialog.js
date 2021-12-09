import React, {PureComponent} from 'react'
import {Modal, StyleSheet, TextInput, View} from 'react-native'
import colors from "../../styles/colors";

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
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    width: '100%',
    backgroundColor: colors.white
  }
});

export default OperateDialog
