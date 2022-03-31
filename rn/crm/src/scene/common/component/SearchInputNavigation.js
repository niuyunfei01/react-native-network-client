import React from 'react'
import PropType from 'prop-types'
import pxToDp from "../../../util/pxToDp";
import SearchInput from './SearchInput'
import {NavigationItem1} from "./All"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default class SearchInputNavigation extends React.Component {
  static propTypes = {
    onSearch: PropType.func.isRequired,
    onBack: PropType.func
  }

  static defaultProps = {}

  render() {
    return (
      <NavigationItem1
        icon={<FontAwesome5 name={'arrow-left'} style={{fontSize:25}}/>}
        iconStyle={{
          width: pxToDp(48),
          height: pxToDp(48),
          marginLeft: pxToDp(31)
        }}
        onPress={() => {
          this.props.onBack && this.props.onBack()
        }}
        children={<SearchInput onSearch={(text) => this.props.onSearch(text)}/>}
      />
    )
  }
}
