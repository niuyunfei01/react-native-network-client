import React, {PureComponent} from 'react'
import {FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions'
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Entypo from "react-native-vector-icons/Entypo";
import SearchStoreItem from "../../../pubilc/component/SearchStoreItem";
import tool from "../../../pubilc/util/tool";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class StoreSelect extends PureComponent {

  constructor(props) {
    super(props);
    const {global} = this.props
    this.state = {
      dataSource: [],
      isLoading: false,
      isCanLoadMore: false,
      query: {
        page: 1,
        page_size: 20
      },
      searchKeywords: '',
      isLastPage: false,
      focus: false,
      lang: {
        cancel: '清除'
      },
      access_token: global?.accessToken,
    };
    this.clearHandle = this.clearHandle.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentDidMount() {
    this.fetchData()
    tool.debounces(() => {
      this.searchInput.focus()
    }, 800)
  }

  clearHandle = () => {
    this.setState({
      searchKeywords: '',
      focus: false
    }, () => {
      this.fetchData({page: 1})
    })
  }

  onCancel = () => {
    this.setState({
      searchKeywords: '',
      focus: false
    }, () => {
      this.fetchData({page: 1})
    })
    Keyboard.dismiss()
  }

  fetchData = (options = {}) => {
    const {query, access_token} = this.state
    let {page, page_size} = query
    const api = `/v1/new_api/stores/get_can_read_stores?access_token=${access_token}`;
    let params = {
      keywords: this.state.searchKeywords,
      page: options.page ? options.page : page,
      page_size: page_size
    }
    this.setState({
      isLoading: true
    });

    HttpUtils.get(api, params).then(obj => {
      this.setState({isLoading: false});
      let isLastPage = true
      if (obj.lists && obj.page * obj.pageSize < obj.count) {
        isLastPage = false
      }
      let list = obj.lists
      let dataSource = []
      Object.keys(list).map((key) => {
        let item = {...list[key]};
        item['searchStr'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        item['cursor'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        dataSource.push(item);
      })
      dataSource = obj.page !== 1 ? this.state.dataSource.concat(dataSource) : dataSource
      this.setState({
        dataSource: dataSource,
        query: {
          page: obj.page + 1,
          page_size: obj.pageSize
        },
        isLastPage: isLastPage
      })
    }, () => {
    })
  }

  getStoreGoBack = (item) => {
    this.props.route.params.onBack && this.props.route.params.onBack(item)
    this.props.navigation.goBack()
  }

  onEndReached() {
    const {query, isLastPage} = this.state;
    if (isLastPage) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.fetchData()
    })
  }

  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        isLastPage: false,
        query: query,
        dataSource: []
      }, () => {
        this.fetchData()
      })
    }, 600)
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  handleFocus() {
    this.setState({focus: true})
  }

  renderList = (info) => {
    let {item, index} = info
    return (
      <SearchStoreItem key={index} onPress={() => this.getStoreGoBack(item)} item={item} rowHeight={50}/>
    )
  }

  listEmptyComponent = () => {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', height: 210}}>
        <Text style={{fontSize: 18, color: colors.b2}}>
          未搜索到门店
        </Text>
      </View>
    )
  }

  renderHeader = () => {
    let {searchKeywords, lang} = this.state
    return (
      <View style={styles.searchInner}>
        <Entypo name="magnifying-glass" size={16} style={{color: colors.color999, marginRight: 10}}/>
        <TextInput
          ref={ref => this.searchInput = ref}
          returnKeyType="search"
          returnKeyLabel="搜索"
          value={searchKeywords}
          underlineColorAndroid='transparent'
          placeholder='搜索店铺'
          placeholderTextColor='#999'
          selectionColor='#ff4f39'
          style={styles.inputText}
          blurOnSubmit={true}
          onChangeText={(text) => {
            this.setState({searchKeywords: text}, () => {
              tool.debounces(() => {
                this.fetchData({page: 1})
              }, 800)
            })
          }}
          onSubmitEditing={e => {
            this.fetchData({keywords: this.state.searchKeywords, page: 1})
          }}
        />
        <If condition={searchKeywords !== ''}>
          <Text onPress={this.clearHandle} style={{color: colors.main_color}}>
            {lang.cancel}
          </Text>
        </If>
      </View>
    )
  }

  renderContent = () => {
    let {isLoading, isCanLoadMore} = this.state;
    const {dataSource} = this.state
    return (
      <FlatList
        data={dataSource}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={this.renderList}
        onRefresh={this.onRefresh}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (isCanLoadMore) {
            this.onEndReached();
            this.setState({isCanLoadMore: false})
          }
        }}
        onMomentumScrollBegin={this.onMomentumScrollBegin}
        refreshing={isLoading}
        keyExtractor={(item, index) => `${index}`}
        ListEmptyComponent={this.listEmptyComponent()}
        initialNumToRender={5}
      />
    );
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.Container}
        behavior={Platform.OS == "ios" ? "padding" : "height"}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </KeyboardAvoidingView>
    );
  }

}

const styles = StyleSheet.create({
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    marginBottom: 10,
    backgroundColor: colors.white
  },
  inputText: {
    flex: 1,
    padding: 0,
  },
  Container: {
    flex: 1,
    backgroundColor: colors.fa
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(StoreSelect)
