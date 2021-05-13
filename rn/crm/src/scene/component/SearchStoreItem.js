import React, { PureComponent } from 'react';
import {View} from "react-native";
import {HighlightableText} from "react-native-search-list";
import Touchable from "react-native-search-list/src/utils/Touchable";

class SearchStoreItem extends PureComponent {
  render() {
    return <Touchable onPress={this.props.onPress}>
      <View key={this.props.rowID || this.props.item.searchStr} style={{flex: 1, marginLeft: 20, height: this.props.rowHeight, justifyContent: 'center'}}>
        <HighlightableText
          matcher={this.props.item.matcher}
          text={this.props.item.searchStr}
          textColor={'#000'}
          hightlightTextColor={'#0069c0'}
        />
      </View>
    </Touchable>;
  }
}

export default SearchStoreItem