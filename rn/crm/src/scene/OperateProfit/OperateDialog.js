import React, {PureComponent} from 'react'
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native'
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
        <View>
          <Dialog onRequestClose={() => {

          }}
                  visible={this.state.dlgShipVisible}
                  title={'添加其他支出'}
                  titleStyle={{textAlign: 'center',}}
                  headerStyle={{backgroundColor: colors.main_color}}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.props.dlgShipVisible = false;

                    }
                  }, {
                    type: 'primary',
                    label: '确定',
                    onPress: () => {


                    }
                  }]}

          ><Text></Text>
          </Dialog>
        </View>
    )
  }

}

export default OperateDialog