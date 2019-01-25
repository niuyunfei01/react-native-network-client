import React from 'react'
import PropType from 'prop-types'
import {View, StyleSheet, TextInput, TouchableOpacity, Image, Text} from "react-native";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";

export default class SearchInputBar extends React.Component {
  static propTypes = {
    onSearch: PropType.func.isRequired
  }
  
  static defaultProps = {}
  
  constructor (props) {
    super(props)
    this.state = {
      text: ''
    }
  }
  
  render () {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          value={this.state.text}
          maxLength={20}
          placeholder={"请输入搜索内容"}
          underlineColorAndroid="transparent"
          placeholderTextColor={"#bfbfbf"}
          onChangeText={text => this.setState({text})}
          onBlur={() => this.props.onSearch(this.state.text)}
        />
        <TouchableOpacity onPress={() => this.props.onSearch(this.state.text)}>
          <View style={styles.searchTextBtn}>
            <Text style={styles.searchText}>搜索</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: pxToDp(68),
    marginRight: pxToDp(31),
    borderRadius: 30,
    borderColor: "#59b26a",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  textInput: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 5,
    paddingLeft: 5
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    padding: 5
  },
  searchTextBtn: {
    flex: 1,
    width: 80,
    backgroundColor: color.theme,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchText: {
    color: '#fff'
  }
})