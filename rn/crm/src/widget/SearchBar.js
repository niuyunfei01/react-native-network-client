import React, {PureComponent} from 'react'
import {Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {system} from '../util'


class SearchBar extends PureComponent {

  props: {
    onSubmitEditing: Function,
    text: string,
    onChangeText: Function,
    onSubmit: Function,
    style: Object
  }

  state: {
    text: string
  }

  constructor(props: Object) {
    super(props);

    this.state = {
      text: this.props.text,
    };
  }

  onChangeText(text: string) {
    this.setState({text: text});

    this.props.onChangeText && this.props.onChangeText()
  }

  onSubmitEditing() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.text);
    }
  }

  click() {
    if (system.isIOS) {
      //取消

    } else {
      //搜索
      this.onSubmitEditing();
    }
    Keyboard.dismiss();
  }

  render() {
    return (
        <View style={[styles.container, this.props.style]}>
          <View style={styles.inputContainer}>
            <FontAwesome5 name={'search'} style={{fontSize: 21}}/>
            <TextInput
                ref='input'
                style={styles.input}
                placeholder='搜索'
                returnKeyType='search'
                onSubmitEditing={this.onSubmitEditing.bind(this)}
                onChangeText={(text) => {
                  this.onChangeText(text)
                }}
                underlineColorAndroid='transparent'
            />

          </View>

          <TouchableOpacity
              onPress={this.click.bind(this)}
              style={styles.cancelBtn}>
            <Text style={styles.cancelText}>
              {system.isIOS ? '取消' : '搜索'}
            </Text>
          </TouchableOpacity>

        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  inputContainer: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4e4e4',
    borderRadius: 5,
  },
  icon: {
    marginLeft: 10,
    width: 21,
    height: 21,
  },
  cancelBtn: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#4683ca',
    fontSize: 14,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  }
});


export default SearchBar;
