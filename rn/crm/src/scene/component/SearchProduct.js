import React, {Component} from "react"
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {connect} from "react-redux"
import pxToDp from "../../util/pxToDp"
import Config from "../../config"
import tool from "../../common/tool"
import color from "../../widget/color"
import HttpUtils from "../../util/http"
import NoFoundDataView from "../component/NoFoundDataView"
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache"
import BigImage from "../component/BigImage"
import PropTypes from 'prop-types'
import SearchInputNavigation from "./SearchInputNavigation";


function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class SearchProduct extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
  }
  
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
      onlineType: 'browse',
      bigImageVisible: false,
      bigImageUri: []
    }
  }
  
  componentWillMount () {
    this.fetchCategories()
  }
  
  fetchCategories () {
    const self = this
    let accessToken = this.props.global.accessToken;
    let storeId = this.state.storeId
    HttpUtils.get.bind(this.props)(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`, {
      hideAreaHot: true
    }).then(res => {
      self.setState({categories: res, selectTagId: res[0].id}, () => this.search())
    })
  }
  
  renderHeader () {
    return (
      <View style={{height: 45, borderBottomColor: '#eee', borderBottomWidth: 1}}>
        <SearchInputNavigation
          onSearch={(text) => this.searchWithKeyword(text)}
          onBack={() => this.props.onCancel && this.props.onCancel()}
        />
      </View>
    )
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
    HttpUtils.get.bind(this.props)(`/api/find_prod_with_pagination.json?access_token=${accessToken}`, params).then(res => {
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
  
  showBigImage (product) {
    this.setState({
      bigImageUri: [{url: Config.staticUrl(product.coverimg)}],
      bigImageVisible: true
    })
  }
  
  closeBigImage () {
    this.setState({
      bigImageUri: [],
      bigImageVisible: false
    })
  }
  
  renderRow = (product, idx) => {
    const self = this
    return (
      <View style={styles.productRow} key={product.id}>
        <TouchableOpacity onPress={() => this.showBigImage(product)}>
          <CachedImage
            source={{uri: Config.staticUrl(product.coverimg)}}
            style={{width: pxToDp(150), height: pxToDp(150)}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.onSelect(product)}
          style={{flex: 1}}
        >
          <View style={styles.productRight}>
            <View style={styles.productRowTop}>
              <Text
                numberOfLines={3}
                style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}
              >
                {product.name}
              </Text>
            </View>
            <View style={styles.productRowBottom}>
            
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
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
    // if (this.state.isLastPage) {
    //   items.push(this.renderNoFoundBtn())
    // }
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
      <Modal
        visible={this.props.visible}
        onRequestClose={() => this.props.onCancel()}
      >
        {this.renderHeader()}
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
            </If>
          </View>
          
          <BigImage
            visible={this.state.bigImageVisible}
            urls={this.state.bigImageUri}
            onClickModal={() => this.closeBigImage()}
          />
        </View>
      </Modal>
    );
  }
}

export default connect(mapStateToProps)(SearchProduct);

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
    flex: 1,
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