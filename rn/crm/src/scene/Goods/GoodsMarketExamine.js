import React from "react";
import BaseComponent from "../BaseComponent";
import tool from "../../common/tool";
import {connect} from "react-redux";
import HttpUtils from "../../util/http";
import SearchBar from "../../weui/SearchBar/SearchBar";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import LoadMore from "react-native-loadmore";
import NoFoundDataView from "../component/NoFoundDataView";
import BigImage from "../component/BigImage";
import Config from "../../config";
import {CachedImage} from "react-native-img-cache";
import pxToDp from "../../util/pxToDp";
import color from "../../widget/color";
import JbbInput from "../component/JbbInput";
import JbbPrompt from "../component/JbbPrompt";
import JbbButton from "../component/JbbButton";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class GoodsMarketExamine extends BaseComponent {

  constructor(props) {
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

  UNSAFE_componentWillMount() {
    this.fetchCategories()
  }

  fetchCategories() {
    const self = this
    let accessToken = this.props.global.accessToken;
    let storeId = this.state.storeId
    HttpUtils.get.bind(this.props)(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`, {
      hideAreaHot: true
    }).then(res => {
      self.setState({categories: res, selectTagId: res[0].id}, () => this.search())
    })
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
    HttpUtils.get.bind(this.props)(`/api/find_market_examine_prods?access_token=${accessToken}`, params).then(res => {
      let totalPage = res.count / res.pageSize
      let isLastPage = res.page >= totalPage
      let goods = res.page == 1 ? res.lists : this.state.goods.concat(res.lists)
      self.setState({goods: goods, isLastPage: isLastPage, isLoading: false})
    })
  };

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

  onSearchBarCancel() {
    this.setState({
      showCategory: true,
      text: '',
      selectTagId: this.state.categories[0].id
    }, () => this.search())
  }

  onRefresh() {
    this.setState({page: 1}, () => this.search())
  }


  onLoadMore() {
    let page = this.state.page
    this.setState({page: page + 1}, () => this.search())
  }

  onSelectCategory(category) {
    this.setState({
      selectTagId: category.id,
      page: 1,
      onlineType: 'browse'
    }, () => this.search())
  }

  onChgMarketPrice(idx, price, remark) {
    const goods = this.state.goods
    goods[idx].market_price = price
    goods[idx].market_remark = remark
    this.setState({goods})
  }

  onSubmitMarketPrice(idx, productId, price, remark) {
    console.log('on change product market price ', productId, price)
    const self = this
    let accessToken = this.props.global.accessToken
    let uri = `/api_products/chg_product_market_price?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(uri, {
      productId: productId,
      price: price,
      storeId: this.state.storeId,
      remark: remark
    }).then(res => {
      self.onChgMarketPrice(idx, price, remark)
    })
  }


  showBigImage(product) {
    this.setState({
      bigImageUri: [{url: Config.staticUrl(product.coverimg)}],
      bigImageVisible: true
    })
  }

  closeBigImage() {
    this.setState({
      bigImageUri: [],
      bigImageVisible: false
    })
  }

  renderRow = (product, idx) => {
    const self = this
    return (
      <View style={styles.productRow} key={product.id}>
        <TouchableOpacity
          onPress={() => this.showBigImage(product)}
          style={{width: pxToDp(150), height: pxToDp(150)}}
        >
          <CachedImage
            source={{uri: Config.staticUrl(product.coverimg)}}
            style={{width: pxToDp(150), height: pxToDp(150)}}
          />
        </TouchableOpacity>
        <View style={styles.productRight}>
          <View style={styles.productRowTop}>
            <Text
              numberOfLines={2}
              style={{fontSize: 13, color: "#3e3e3e"}}
            >
              {product.name}
            </Text>
          </View>
          <JbbInput
            onChange={value => this.onChgMarketPrice(idx, value)}
            value={product.market_price}
            onBlur={() => this.onSubmitMarketPrice(idx, product.id, product.market_price, product.remark_remark)}
            keyboardType={'numeric'}
            styles={styles.marketPriceInput}
          />
          <View style={styles.productRowBottom}>
            <JbbPrompt
              rows={10}
              initValue={product.market_remark}
              onConfirm={text => this.onSubmitMarketPrice(idx, product.id, product.market_price, text)}>
              <JbbButton text={'备注'} type={'text'} touchStyle={{marginHorizontal: 5}}/>
            </JbbPrompt>

            {/*<JbbButton*/}
            {/*  text={'市调历史>>'}*/}
            {/*  type={'text'}*/}
            {/*  onPress={() => this.props.navigation.navigate(Config.ROUTE_GOODS_MARKET_EXAMINE_HISTORY, {*/}
            {/*    productId: product.id*/}
            {/*  })}*/}
            {/*/>*/}
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

  renderList() {
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

  renderSearchBar() {
    return (
      <SearchBar
        text={this.state.text}
        onChange={text => this.setState({text})}
        onBlurSearch={text => this.searchWithKeyword(text)}
        onCancel={() => this.onSearchBarCancel()}
      />
    )
  }

  renderCategory(category) {
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

  renderCategories() {
    const categories = this.state.categories
    let item = []
    for (let i in categories) {
      item.push(this.renderCategory(categories[i]))
    }
    return item
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderSearchBar()}
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
              {/*{this.renderNoFoundBtn()}*/}
            </If>
          </View>

          <BigImage
            visible={this.state.bigImageVisible}
            urls={this.state.bigImageUri}
            onClickModal={() => this.closeBigImage()}
          />
        </View>
      </View>
    )
  }
}

export default connect(mapStateToProps)(GoodsMarketExamine)

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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: pxToDp(50),
    width: '100%'
  },
  marketPriceInput: {
    flex: 1,
    marginHorizontal: 0
  }
})
