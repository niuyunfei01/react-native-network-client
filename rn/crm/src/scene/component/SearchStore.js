import React from 'react'
import PropType from 'prop-types'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import SearchList from "react-native-search-list"
import {connect} from "react-redux";
import SearchStoreItem from "../component/SearchStoreItem";

const rowHeight = 40

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class SearchStore extends React.Component {
  static propTypes = {
    visible: PropType.bool,
    onSelect: PropType.func,
    onClose: PropType.func
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    const {
      canReadStores
    } = this.props.global;
    let dataSource = [];
    for (let key in canReadStores) {
      let item = {...canReadStores[key]};
      item['searchStr'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
      item['cursor'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
      dataSource.push(item);
    }
    this.state = {
      dataSource: dataSource
    }
  }

  // custom render row
  renderRow(item, sectionID, rowID, highlightRowFunc, isSearching) {
    return (<SearchStoreItem rowID={rowID} onPress={() => {
      this.props.onSelect && this.props.onSelect(item.item)
    }} item={item.item} rowHeight={rowHeight}/>)
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
        <Text style={{color: '#979797', fontSize: 18, paddingTop: 20}}> 暂无结果 </Text>
        <Text
          style={{color: '#171a23', fontSize: 18}}>{searchStr} </Text>
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
      <View><Text style={styles.headerTitle}>搜索店铺</Text></View>
      <View style={{width: 40}}></View>
    </View>)
  }

  render() {
    return (
      <Modal style={styles.container} visible={this.props.visible}
             onRequestClose={() => this.props.onClose && this.props.onClose()}>
        <SearchList
          data={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderEmptyResult={this.renderEmptyResult.bind(this)}
          renderBackButton={this.renderBackBtn.bind(this)}
          renderRightButton={this.renderRightBtn.bind(this)}
          renderEmpty={this.renderEmpty.bind(this)}
          rowHeight={rowHeight}
          hideSectionList={this.state.dataSource.length >= 200}
          toolbarBackgroundColor={'#2196f3'}
          title='搜索店铺'
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

export default connect(mapStateToProps)(SearchStore);
