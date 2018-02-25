import React, {PureComponent} from 'react';
import pxToDp from "../../util/pxToDp";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableHighlight,
} from 'react-native';
class ImgBtn extends PureComponent {
  onPress() {
    this.props.onPress()
  }

  render() {
    let {require} = this.props
    return (
        <TouchableOpacity
            onPress={() => this.onPress()}
        >
          <Image style={[{height: pxToDp(42), width: pxToDp(42)},this.props.style]}
                 source={require}/>
        </TouchableOpacity>
    )
  }
}
export default ImgBtn;