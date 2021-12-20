import React from 'react'
import PropType from 'prop-types'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import SearchList, {HighlightableText} from "react-native-search-list"

class SearchPopup extends React.Component {
  static propTypes = {
    dataSource: PropType.array,
    visible: PropType.bool,
    onSelect: PropType.func,
    onClose: PropType.func,
    placeholder: PropType.string,
    title: PropType.string,
    rowHeight: PropType.number
  }

  static defaultProps = {
    rowHeight: 40
  }

  constructor(props) {
    super(props)
    const {dataSource} = this.props;
    let dataSourceTmp = [];
    for (let key in dataSource) {
      let item = {...dataSource[key]};
      item['cursor'] = item['searchStr']
      dataSourceTmp.push(item);
    }
    this.state = {
      dataSource: dataSourceTmp
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    this.setState({dataSource: nextProps.dataSource})
  }

  // custom render row
  renderRow(item, sectionID, rowID, highlightRowFunc, isSearching) {
    item = item.item
    return (
      <TouchableOpacity onPress={() => {
        this.props.onSelect && this.props.onSelect(item)
      }}>
        <View key={rowID} style={{flex: 1, marginLeft: 20, height: this.props.rowHeight, justifyContent: 'center'}}>
          {/*use `HighlightableText` to highlight the search result*/}
          <HighlightableText
            matcher={item.matcher}
            text={item.searchStr}
            textColor={'#000'}
            hightlightTextColor={'#0069c0'}
          />
        </View>
      </TouchableOpacity>
    )
  }

  // render empty view when datasource is empty
  renderEmpty() {
    return (
      <View style={styles.emptyDataSource}>
        <Text style={{color: '#979797', fontSize: 18, paddingTop: 20}}> No Content </Text>
      </View>
    )
  }

  // render empty result view when search result is empty
  renderEmptyResult(searchStr) {
    return (
      <View style={styles.emptySearchResult}>
        <Text style={{color: '#979797', fontSize: 18, paddingTop: 20}}> 暂无结果 <Text
          style={{color: '#171a23', fontSize: 18}}>{searchStr}</Text></Text>
        <Text style={{color: '#979797', fontSize: 18, alignItems: 'center', paddingTop: 10}}>请重新搜索</Text>
      </View>
    )
  }

  renderBackBtn() {
    return (
      <TouchableOpacity onPress={() => this.props.onClose && this.props.onClose()}>
        <View style={{width: 80, alignItems: 'center'}}><Text
          style={styles.headerTitle}>&lt;&nbsp;|&nbsp;返回</Text></View>
      </TouchableOpacity>
    )
  }

  renderRightBtn() {
    return (<View style={{width: 80}}/>)
  }

  renderHeader() {
    return (<View style={styles.header}>
      <TouchableOpacity onPress={() => this.props.onClose && this.props.onClose()}>
        <View style={{width: 40}}><Text style={styles.headerTitle}>&lt;返回</Text></View>
      </TouchableOpacity>
      <View><Text style={styles.headerTitle}>{this.props.title}</Text></View>
      <View style={{width: 40}}></View>
    </View>)
  }

  render() {
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
          rowHeight={this.props.rowHeight}
          toolbarBackgroundColor={'#2196f3'}
          title={this.props.title}
          cancelTitle='取消'
          onClickBack={() => {
          }}
          searchInputPlaceholder='搜索'
          colors={{
            toolbarBackgroundColor: '#2196f3',
            titleTextColor: '#ffffff',
            cancelTextColor: '#ffffff',
            searchIconColor: '#ffffff',
            searchListBackgroundColor: '#2196f3',
            searchInputBackgroundColor: '#0069c0',
            searchInputBackgroundColorActive: '#0069c0',
            searchInputPlaceholderColor: '#ffffff',
            searchInputTextColor: '#ffffff',
            searchInputTextColorActive: '#ffffff',
            sectionIndexTextColor: '#6ec6ff',
            searchBarBackgroundColor: '#2196f3'
          }}
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
