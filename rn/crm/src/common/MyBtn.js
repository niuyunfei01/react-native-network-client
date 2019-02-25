import React, {PureComponent} from 'react';
import {
  Text,
  TouchableOpacity,
} from 'react-native';

class MyBtn extends PureComponent {
  render() {
    let {
      text,
      onPress,
      style,
    } = this.props;
    return (
      <TouchableOpacity
        onPress={onPress}
      >
        <Text style={style}>{text}</Text>
      </TouchableOpacity>
    )
  }
}

export default MyBtn