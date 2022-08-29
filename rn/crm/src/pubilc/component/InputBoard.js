import React from "react";
import {Keyboard, Platform, View} from "react-native";

export default class InputBoard extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.keyboardDidShowStatus = false
    this.keyboardDidShow = Keyboard.addListener('keyboardWillShow', this._keyboardDidShow)

    this.keyboardDidHide = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide)
  }

  componentWillUnmount() {
    this._keyboardDidHide({}, true)
    this.keyboardDidHide.remove()
    this.keyboardDidShow.remove()
  }

  _keyboardDidShow = (e) => {
    if (Platform.OS === 'android' || this.keyboardDidShowStatus)
      return
    this.keyboardDidShowStatus = true
    this.viewRef.setNativeProps({marginBottom: e.endCoordinates.height})

  }
  _keyboardDidHide = (e = {}, isUnmount = false) => {
    this.keyboardDidShowStatus = false
    if (isUnmount)
      return

    this.viewRef.setNativeProps({marginBottom: 0})
  }

  render() {
    const {children} = this.props
    return (
      <View ref={ref => this.viewRef = ref}>
        {children}
      </View>

    )
  }
}
