import React from 'react'
import PropType from 'prop-types'
import {Modal, StyleSheet, Text, View} from "react-native";
import SearchList, {HighlightableText} from "@unpourtous/react-native-search-list"
import Touchable from "@unpourtous/react-native-search-list/library/utils/Touchable"

const rowHeight = 40

class SearchPopup extends React.Component {
  static propTypes = {
    dataSource: PropType.array,
    visible: PropType.bool,
    onSelect: PropType.func,
    onClose: PropType.func,
    placeholder: PropType.string,
    title: PropType.string
  }
  
  static defaultProps = {}
  
  constructor (props) {
    super(props)
    this.state = {
      dataSource: this.props.dataSource
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({dataSource: nextProps.dataSource})
  }
  
  // custom render row
  renderRow (item, sectionID, rowID, highlightRowFunc, isSearching) {
    return (
      <Touchable onPress={() => {
        this.props.onSelect && this.props.onSelect(item)
      }}>
        <View key={rowID} style={{flex: 1, marginLeft: 20, height: rowHeight, justifyContent: 'center'}}>
          {/*use `HighlightableText` to highlight the search result*/}
          <HighlightableText
            matcher={item.matcher}
            text={item.searchStr}
            textColor={'#000'}
            hightlightTextColor={'#0069c0'}
          />
        </View>
      </Touchable>
    )
  }
  
  // render empty view when datasource is empty
  renderEmpty () {
    return (
      <View style={styles.emptyDataSource}>
        <Text style={{color: '#979797', fontSize: 18, paddingTop: 20}}> No Content </Text>
      </View>
    )
  }
  
  // render empty result view when search result is empty
  renderEmptyResult (searchStr) {
    return (
      <View style={styles.emptySearchResult}>
        <Text style={{color: '#979797', fontSize: 18, paddingTop: 20}}> 暂无结果 <Text
          style={{color: '#171a23', fontSize: 18}}>{searchStr}</Text></Text>
        <Text style={{color: '#979797', fontSize: 18, alignItems: 'center', paddingTop: 10}}>请重新搜索</Text>
      </View>
    )
  }
  
  renderBackBtn () {
    return (
      <Touchable onPress={() => this.props.onClose && this.props.onClose()}>
        <View style={{width: 80, alignItems: 'center'}}><Text
          style={styles.headerTitle}>&lt;&nbsp;|&nbsp;返回</Text></View>
      </Touchable>
    )
  }
  
  renderRightBtn () {
    return (<View style={{width: 80}}/>)
  }
  
  renderHeader () {
    return (<View style={styles.header}>
      <Touchable onPress={() => this.props.onClose && this.props.onClose()}>
        <View style={{width: 40}}><Text style={styles.headerTitle}>&lt;返回</Text></View>
      </Touchable>
      <View><Text style={styles.headerTitle}>{this.props.title}</Text></View>
      <View style={{width: 40}}></View>
    </View>)
  }
  
  render () {
    return (
      <Modal
        style={styles.container}
        visible={this.props.visible}
        onRequestClose={() => this.props.onClose && this.props.onClose()}
      >
        <SearchList
          data={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderEmptyResult={this.renderEmptyResult.bind(this)}
          renderBackButton={this.renderBackBtn.bind(this)}
          renderRightButton={this.renderRightBtn.bind(this)}
          renderEmpty={this.renderEmpty.bind(this)}
          rowHeight={rowHeight}
          toolbarBackgroundColor={'#2196f3'}
          title={this.props.placeholder}
          cancelTitle='取消'
          onClickBack={() => {
          }}
          searchListBackgroundColor={'#2196f3'}
          searchBarToggleDuration={300}
          searchInputBackgroundColor={'#0069c0'}
          searchInputBackgroundColorActive={'#6ec6ff'}
          searchInputPlaceholderColor={'#FFF'}
          searchInputTextColor={'#FFF'}
          searchInputTextColorActive={'#000'}
          searchInputPlaceholder='搜索'
          sectionIndexTextColor={'#6ec6ff'}
          searchBarBackgroundColor={'#2196f3'}
        />
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  },
  emptyDataSource: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 50
  },
  emptySearchResult: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 50
  },
  header: {
    flexDirection: 'row',
    height: 50,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0069c0'
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  }
})

export default SearchPopup