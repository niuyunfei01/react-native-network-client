import React from "react";
import {Animated, Keyboard, StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const styles = StyleSheet.create({
  content: {flex: 1}
})

export default class KeyboardAvoidingWrapView extends React.PureComponent {

  constructor(props) {
    super(props);
    this.keyboardHeight = new Animated.Value(0);
  }

  componentDidMount() {
    this.keyboardShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardShow);
    this.keyboardHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardHide);
  }

  keyboardShow = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: event.endCoordinates.height,
      useNativeDriver: false,
    }).start();
  };
  keyboardHide = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  componentWillUnmount() {
    this.keyboardShowSub.remove();
    this.keyboardHideSub.remove();
  }

  render() {
    const {children} = this.props
    return (
      <SafeAreaView style={styles.content}>
        <Animated.ScrollView style={{flex: 1, paddingBottom: this.keyboardHeight}}>
          {children}
        </Animated.ScrollView>
      </SafeAreaView>

    )
  }
}
