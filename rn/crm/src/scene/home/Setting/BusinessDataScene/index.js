import React, {PureComponent} from "react";
import {View, ScrollView, StyleSheet, TouchableOpacity, Text} from "react-native";
import {connect} from "react-redux";
import {SvgXml} from "react-native-svg";
import {back, down} from "../../../../svg/svg";
import colors from "../../../../pubilc/styles/colors";
import RevenueDataComponent from "./RevenueDataComponent";
import DeliveryDataComponent from "./DeliveryDataComponent";
import PlatformDataComponent from "./PlatformDataComponent";
import ProfitAndLossComponent from "./ProfitAndLossComponent";
import TopSelectModal from "../../../../pubilc/component/TopSelectModal";
import HttpUtils from "../../../../pubilc/util/http";

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 6,
  },
  headerTextWrap: {flexDirection: 'row', alignItems: 'center'},
  headerText: {
    color: colors.color333,
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24,
    marginRight: 4,
    textAlign: 'center'
  },
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    marginBottom: 10
  },
  notSelectCategoryWrap: {},
  selectedCategoryWrap: {
    borderBottomColor: colors.main_color,
    borderBottomWidth: 2,
    borderRadius: 1.5
  },
  notSelectCategoryText: {
    fontSize: 14,
    color: colors.color666,
    lineHeight: 20,
    paddingVertical: 8
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.main_color,
    lineHeight: 20,
    paddingVertical: 8
  },
})

const CATEGORY_LIST = [
  {
    index: 0,
    name: '营收'
  },
  {
    index: 1,
    name: '配送'
  },
  {
    index: 2,
    name: '平台'
  },
  {
    index: 3,
    name: '盈亏'
  },
]

class BusinessDataScene extends PureComponent {

  state = {
    store_id: this.props.global?.store_id,
    store_name: this.props.global?.store_info?.name,
    store_list: [],
    page: 1,
    is_last_page: false,
    page_size: 10,
    selectCategory: 0,
    selectStoreVisible: false,
    show_select_store: true,
  }
  getStoreList = () => {
    const {accessToken, only_one_store} = this.props.global;
    const {page_size, page, store_list, is_last_page, show_select_store} = this.state
    if (only_one_store || is_last_page || !show_select_store)
      return
    let params = {
      page: page,
      page_size: page_size
    }
    this.setState({refreshing: true})
    const api = `/v4/wsb_store/listCanReadStore?access_token=${accessToken}`
    HttpUtils.get(api, params).then(res => {
      const {lists, page, isLastPage} = res
      if (page === 1) {
        lists.shift()
      }
      let list = page !== 1 ? store_list.concat(lists) : lists
      this.setState({
        store_list: list,
        page: page + 1,
        refreshing: false,
        is_last_page: isLastPage
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.getStoreList()
    })
  }

  selectStore = () => {
    let {show_select_store} = this.state;
    if (show_select_store) {
      this.setState({
        selectStoreVisible: true
      })
    }
  }
  renderHeader = () => {
    let {store_name} = this.state;
    const {only_one_store} = this.props.global;
    return (
      <View style={styles.headerWrap}>
        <SvgXml height={32}
                width={32}
                onPress={() => this.props.navigation.goBack()}
                xml={back()}/>
        <If condition={!only_one_store}>
          <TouchableOpacity style={styles.headerTextWrap} onPress={() => this.selectStore()}>
            <Text style={styles.headerText}>{store_name}</Text>
            <SvgXml xml={down(20, 20, colors.color333)}/>
          </TouchableOpacity>
        </If>
        <If condition={only_one_store}>
          <Text style={styles.headerText}>经营数据</Text>
        </If>
        <View/>
      </View>
    )
  }
  setStoreInfo = (item) => {
    const {name, id} = item
    this.setState({store_name: name, store_id: id, selectStoreVisible: false})
  }

  setCategory = (index) => {
    this.setState({selectCategory: index})
  }
  renderCategory = () => {
    const {selectCategory} = this.state
    return (
      <View style={styles.categoryWrap}>
        {
          CATEGORY_LIST.map((item, index) => {
            return (
              <TouchableOpacity key={index}
                                onPress={() => this.setCategory(index)}
                                style={selectCategory === index ? styles.selectedCategoryWrap : styles.notSelectCategoryWrap}>
                <Text style={selectCategory === index ? styles.selectedCategoryText : styles.notSelectCategoryText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }

  renderContent = () => {
    const {selectCategory, store_id, store_name} = this.state
    const {accessToken} = this.props.global
    const {navigation} = this.props
    switch (selectCategory) {
      case 0:
        return <RevenueDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 1:
        return <DeliveryDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 2:
        return <PlatformDataComponent store_id={store_id} accessToken={accessToken} navigation={navigation}/>
      case 3:
        return <ProfitAndLossComponent store_id={store_id}
                                       accessToken={accessToken}
                                       store_name={store_name}
                                       navigation={navigation}/>
      default:
        return null
    }
  }
  renderTopSelectStore = () => {
    const {selectStoreVisible, refreshing, store_id, store_list = []} = this.state
    return (
      <TopSelectModal visible={selectStoreVisible}
                      marTop={40}
                      list={store_list}
                      label_field={'name'}
                      value_field={'id'}
                      default_val={store_id}
                      onEndReachedThreshold={0.3}
                      onEndReached={this.getStoreList}
                      refreshing={refreshing}
                      initialNumToRender={10}
                      onPress={(item) => this.setStoreInfo(item)}
                      onClose={() => this.setState({selectStoreVisible: false})}/>
    )
  }

  render() {

    return (
      <>
        {this.renderHeader()}
        {this.renderCategory()}
        <ScrollView>
          {this.renderContent()}
        </ScrollView>
        {this.renderTopSelectStore()}
      </>
    );
  }
}

const mapStateToProps = ({global}) => ({global: global})
export default connect(mapStateToProps)(BusinessDataScene)
