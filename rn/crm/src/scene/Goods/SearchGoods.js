import React, {Component} from "react";
import {Image, Text, TouchableOpacity, View, StyleSheet, ScrollView} from "react-native";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import tool from "../../common/tool";
import native from "../../common/native";
import SearchInputNavigation from "../component/SearchInputNavigation";
import color from "../../widget/color";
import HttpUtils from "../../util/http";
import NoFoundDataView from "../component/NoFoundDataView";
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache";


function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch
  };
}

class SearchGoods extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    const {params} = navigation.state;
    return {
      headerLeft: (
        <SearchInputNavigation
          onSearch={(text) => params.search(text)}
          onBack={() => native.toGoods()}
        />
      )
    };
  };
  
  constructor (props) {
    super(props);
    this.state = {
      storeId: this.props.global.currStoreId,
      goods: [],
      page: 1,
      pageNum: 15,
      categories: [],
      isLoading: false,
      isLastPage: false,
      selectTagId: 0,
      showCategory: true,
      text: '',
      // 上线类型: 浏览(browse)、搜索(search)
      onlineType: 'browse'
    }
  }
  
  componentWillMount () {
    //设置函数
    this.props.navigation.setParams({search: this.searchWithKeyword})
    this.fetchCategories()
  }
  
  fetchCategories () {
    const self = this
    let accessToken = this.props.global.accessToken;
    let storeId = this.state.storeId
    HttpUtils.get(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`).then(res => {
      self.setState({categories: res, selectTagId: res[0].id}, () => this.search())
    })
  }
  
  searchWithKeyword = (text) => {
    const self = this
    let showCategory = !text
    self.setState({
      page: 1,
      showCategory: showCategory,
      text: text, selectTagId: 0,
      onlineType: showCategory ? 'browse' : 'search'
    }, () => self.search())
  }
  
  search = () => {
    const self = this
    let accessToken = this.props.global.accessToken;
    let {currVendorId} = tool.vendor(this.props.global);
    let storeId = this.state.storeId
    this.setState({isLoading: true})
    const params = {
      vendor_id: currVendorId,
      tagId: this.state.selectTagId,
      page: this.state.page,
      pageNum: this.state.pageNum,
      name: this.state.text ? this.state.text : '',
      storeId: storeId
    }
    console.log('find_prod_with_pagination => ', params)
    HttpUtils.get(`/api/find_prod_with_pagination.json?access_token=${accessToken}`, params).then(res => {
      let totalPage = res.count / res.pageSize
      let isLastPage = res.page >= totalPage
      let goods = res.page == 1 ? res.lists : this.state.goods.concat(res.lists)
      self.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
    })
  };
  
  onRefresh () {
    this.setState({page: 1}, () => this.search())
  }
  
  
  onLoadMore () {
    let page = this.state.page
    this.setState({page: page + 1}, () => this.search())
  }
  
  onSelectCategory (category) {
    this.setState({
      selectTagId: category.id,
      page: 1,
      onlineType: 'browse'
    }, () => this.search())
  }
  
  changeRowExist (idx) {
    const products = this.state.goods
    products[idx].is_exist = true
    this.setState({goods: products})
  }
  
  renderRow = (product, idx) => {
    const self = this
    return (
      <View style={styles.productRow} key={product.id}>
        <CachedImage source={{uri: Config.staticUrl(product.coverimg)}}
                     style={{width: pxToDp(150), height: pxToDp(150)}}/>
        <View style={styles.productRight}>
          <View style={styles.productRowTop}>
            <Text
              numberOfLines={1}
              style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}
            >
              {product.name}
            </Text>
          </View>
          <View style={styles.productRowBottom}>
            <View/>
            <If condition={product.is_exist}>
              <View style={styles.isOnlineBtn}>
                <Text style={styles.isOnlineBtnText}>已上架</Text>
              </View>
            </If>
            <If condition={!product.is_exist}>
              <TouchableOpacity onPress={() => self.props.navigation.navigate(Config.ROUTE_ONLINE_STORE_PRODUCT, {
                store_id: this.state.storeId,
                product_id: product.id,
                mode: 2,
                onlineType: this.state.onlineType,
                onBack: () => this.changeRowExist(idx)
              })}>
                <View style={styles.toOnlineBtn}>
                  <Text style={styles.toOnlineBtnText}>上架</Text>
                </View>
              </TouchableOpacity>
            </If>
          </View>
        </View>
      </View>
    );
  };
  
  renderNoFoundBtn = () => {
    const storeId = this.state.storeId
    return (
      <TouchableOpacity
        style={styles.noFoundBtnRow}
        key={'NOT_FOUND_BTN'}
        onPress={() => this.props.navigation.navigate(Config.ROUTE_CREATE_NEW_GOOD_REMIND, {storeId: storeId})}>
        <View style={styles.noFoundBtn}>
          <Text style={styles.noFoundBtnText}>
            没有找到合适的商品？手动添加
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
  
  renderList () {
    const products = this.state.goods
    let items = []
    for (var idx in products) {
      items.push(this.renderRow(products[idx], idx))
    }
    if (this.state.isLastPage) {
      items.push(this.renderNoFoundBtn())
    }
    return items
  }
  
  renderCategory (category) {
    const selectCategoryId = this.state.selectTagId
    let active = selectCategoryId === category.id
    return (
      <TouchableOpacity key={category.id} onPress={() => this.onSelectCategory(category)}>
        <View style={[active ? styles.categoryItemActive : styles.categoryItem]}>
          <Text style={styles.categoryText}>{category.name}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  
  renderCategories () {
    const categories = this.state.categories
    let item = []
    for (let i in categories) {
      item.push(this.renderCategory(categories[i]))
    }
    return item
  }
  
  render () {
    return (
      <View style={styles.container}>
        {/*分类*/}
        <If condition={this.state.showCategory}>
          <View style={styles.categoryBox}>
            <ScrollView>
              {this.renderCategories()}
            </ScrollView>
          </View>
        </If>
        {/*搜索商品列表*/}
        <View style={{flex: 1}}>
          <If condition={this.state.goods && this.state.goods.length}>
            <LoadMore
              loadMoreType={'scroll'}
              renderList={this.renderList()}
              onRefresh={() => this.onRefresh()}
              onLoadMore={() => this.onLoadMore()}
              isLastPage={this.state.isLastPage}
              isLoading={this.state.isLoading}
            />
          </If>
          
          <If condition={!(this.state.goods && this.state.goods.length)}>
            <NoFoundDataView/>
            {this.renderNoFoundBtn()}
          </If>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchGoods);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  categoryBox: {
    width: pxToDp(200),
    backgroundColor: 'rgb(212,213,214)',
    height: '100%'
  },
  categoryItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: pxToDp(50)
  },
  categoryItemActive: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: pxToDp(10),
    borderLeftColor: color.theme,
    height: pxToDp(50)
  },
  categoryText: {},
  noFoundBtnRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: pxToDp(150)
  },
  noFoundBtn: {
    width: "80%",
    height: pxToDp(50),
    borderColor: color.theme,
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(25),
    alignItems: "center",
    justifyContent: "center"
  },
  noFoundBtnText: {
    color: color.theme,
    textAlign: "center"
  },
  productRow: {
    flex: 1,
    height: pxToDp(170),
    borderWidth: 1,
    borderColor: "#ccc",
    padding: pxToDp(10),
    marginBottom: pxToDp(5),
    backgroundColor: '#fff',
    flexDirection: 'row'
  },
  productRight: {
    flex: 1,
    height: pxToDp(150),
    marginLeft: pxToDp(20),
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  productRowTop: {
    flexDirection: 'column'
  },
  productRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: pxToDp(50)
  },
  isOnlineBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: pxToDp(100),
    height: pxToDp(40),
    backgroundColor: '#ddd'
  },
  isOnlineBtnText: {
    color: '#fff'
  },
  toOnlineBtn: {
    borderWidth: pxToDp(1),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: color.theme,
    width: pxToDp(100),
    height: pxToDp(40)
  },
  toOnlineBtnText: {
    color: color.theme
  }
})