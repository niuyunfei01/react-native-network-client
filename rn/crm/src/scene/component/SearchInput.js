import React from 'react'
import PropType from 'prop-types'
import {Image, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";

const StyleSheetPropType = require('StyleSheetPropType');
const ViewStylePropTypes = require('ViewStylePropTypes');
const stylePropType = StyleSheetPropType(ViewStylePropTypes);

export default class SearchInputBar extends React.Component {
  static propTypes = {
    onSearch: PropType.func.isRequired,
    containerStyle: stylePropType,
    onFocus: PropType.func
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
      <View style={[styles.container, this.props.containerStyle]}>
        <TextInput
          style={styles.textInput}
          value={this.state.text}
          maxLength={20}
          placeholder={"请输入搜索内容"}
          underlineColorAndroid="transparent"
          placeholderTextColor={"#bfbfbf"}
          onChangeText={text => this.setState({text})}
          onBlur={() => this.props.onSearch(this.state.text)}
          onFocus={() => this.props.onFocus && this.props.onFocus()}
        />
        <TouchableOpacity onPress={() => this.props.onSearch(this.state.text)}>
          <View style={styles.searchTextBtn}>
            {/*<Text style={styles.searchText}>搜索</Text>*/}
            <Image source={require('../../img/new/searchG.png')} style={{width: 20}} resizeMode={'contain'}/>
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
    paddingHorizontal: 10
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    padding: 5
  },
  searchTextBtn: {
    flex: 1,
    width: 40,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchText: {
    color: '#fff'
  }
})