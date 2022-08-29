import React, {PureComponent} from 'react'
import {
  DeviceEventEmitter,
  InteractionManager,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions'
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Entypo from "react-native-vector-icons/Entypo";
import SearchStoreItem from "../../../pubilc/component/SearchStoreItem";
import Loadmore from 'react-native-loadmore'
import tool from "../../../pubilc/util/tool";

const rowHeight = 40

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
    let token = global['accessToken']

    this.state = {
      dataSource: [],
      isLoading: false,
      page: 1,
      page_size: 20,
      searchKeywords: '',
      isLastPage: false,
      focus: false,
      lang: {
        cancel: '取消'
      },
      access_token: token
    };
    this.clearHandle = this.clearHandle.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.focus = this.focus.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{padding: 10}}>
          <Entypo name="reply-all" style={{fontSize: 20, color: colors.white, marginLeft: 10}}/>
        </TouchableOpacity>
      )
    });
  };

  onPress(route, params, callBack = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params, callBack);
    });
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

  handleFocus = () => {
    this.setState({focus: true})
  }

  focus() {
    this.refs.searchInput.focus()
  }

  blur() {
    this.refs.searchInput.blur()
  }

  fetchData = (options = {}) => {
    const {page, page_size, access_token} = this.state
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
        page: obj.page + 1,
        page_size: obj.pageSize,
        isLastPage: isLastPage
      })
    }, () => {
    })
  }

  renderItem = (item, sectionID, rowID) => {
    return (<SearchStoreItem rowID={rowID} onPress={() => {
      this.props.navigation.goBack()
      DeviceEventEmitter.emit("EventChangeStore", {
        id: item['id']
      })
    }} item={item} rowHeight={rowHeight}/>)
  }

  renderList = () => {
    let _this = this
    const {dataSource} = _this.state
    let items = []
    for (let i in dataSource) {
      if (dataSource[i]) {
        items.push(_this.renderItem(dataSource[i], i))
      }
    }
    return items
  }

  listEmptyComponent = () => {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', height: 210}}>
        <Text style={{fontSize: 18, color: colors.fontColor}}>
          未搜索到门店
        </Text>
      </View>
    )
  }

  renderHeader = () => {
    let {focus, searchKeywords, lang} = this.state
    return (
      <View style={[styles.searchBar]}>
        <View style={styles.searchOuter}>
          <View style={styles.searchInner}>
            <Entypo name="magnifying-glass" size={12} style={{color: colors.color999, marginRight: 10}}/>
            <TextInput
              returnKeyType="search"
              eturnKeyLabel="搜索"
              value={searchKeywords}
              ref="searchInput"
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
              onFocus={this.handleFocus}
            />
            <If condition={searchKeywords !== ''}>
              <Text onPress={this.clearHandle}>
                <Entypo name="circle-with-cross" size={16} color={colors.color999}/>
              </Text>
            </If>
          </View>
        </View>
        <If condition={focus}>
          <Text style={styles.searchCancel} onPress={this.onCancel}>
            {lang.cancel}
          </Text>
        </If>
      </View>
    )
  }

  renderContent = () => {

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.back_color, color: colors.fontColor}}>
        <Loadmore
          keyboardShouldPersistTaps="never"
          renderList={this.renderList()}
          onLoadMore={() => {
            this.fetchData()
          }}
          isLoading={this.state.isLoading}
          onRefresh={() => {
            this.fetchData({page: 1})
          }}
          loadMoreType={"scroll"}
          isLastPage={this.state.isLastPage}
        />
      </SafeAreaView>
    );
  }

  render() {
    let {dataSource} = this.state
    return (
      <View style={{flex: 1, backgroundColor: colors.white}}>
        {this.renderHeader()}
        {tool.length(dataSource) <= 0 ? this.listEmptyComponent() : this.renderContent()}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.main_color
  },
  searchbar: {
    width: '70%',
    padding: 0,
    margin: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6
  },
  searchBar: {
    position: 'relative',
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFF4',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: '#C7C7C7',
  },
  searchOuter: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6E6EA',
    borderRadius: 5,
  },
  searchInner: {
    position: 'relative',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    padding: 0,
  },
  searchCancel: {
    marginLeft: 10,
    color: '#09BB07',
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(StoreSelect)
