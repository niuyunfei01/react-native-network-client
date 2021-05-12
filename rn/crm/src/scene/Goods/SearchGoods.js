import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import tool from "../../common/tool";
import native from "../../common/native";
import { NavigationActions } from '@react-navigation/compat';
import SearchInputNavigation from "../component/SearchInputNavigation";
import color from "../../widget/color";
import HttpUtils from "../../util/http";
import NoFoundDataView from "../component/NoFoundDataView";
import LoadMore from 'react-native-loadmore'
import {CachedImage} from "react-native-img-cache";
import BigImage from "../component/BigImage";
import Mapping from "../../Mapping";


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
  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    const type = params.type;
    navigation.setOptions({
      headerLeft: () => (
        <SearchInputNavigation
          onSearch={(text) => this.searchWithKeyword(text)}
          onBack={() => {if (type !== 'select_for_store') {native.toGoods.bind(this)();}}}
        />
      )
    })
  };

  constructor (props) {
    super(props);
    const {limit_store} = this.props.route.params;

    this.state = {
      storeId: limit_store ? limit_store : this.props.global.currStoreId,
      fnPriceControlled: false,
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
      bigImageUri: [],
    }

    this.navigationOptions(this.props)
  }

  UNSAFE_componentWillMount () {
    //设置函数
    let accessToken = this.props.global.accessToken;
    const {limit_store, prod_status} = this.props.route.params;
    let storeId = limit_store ? limit_store : this.state.storeId

    HttpUtils.get.bind(this.props)(`/api/read_store_simple/${storeId}?access_token=${accessToken}`).then(store => {
          this.setState({fnPriceControlled: store['fn_price_controlled']})
        } , (res) => {
      console.log("ok=", res.ok, "reason=", res.reason)
    })

    this.fetchCategories(storeId, prod_status, accessToken)
  }

  fetchCategories (storeId, prod_status, accessToken) {
    const hideAreaHot = prod_status ? 1 : 0;

    HttpUtils.get.bind(this.props)(`/api/list_prod_tags/${storeId}?access_token=${accessToken}`, {hideAreaHot}).then(res => {
      this.setState({categories: res, selectTagId: res[0].id}, () => this.search())
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

    const {type, limit_store, prod_status} = this.props.route.params;

    let storeId = type === 'select_for_store' ? limit_store : this.state.storeId;
    this.setState({isLoading: true})
    const params = {
      vendor_id: currVendorId,
      tagId: this.state.selectTagId,
      page: this.state.page,
      pageNum: this.state.pageNum,
      name: this.state.text ? this.state.text : '',
      storeId: storeId,
    }
    if (limit_store) {
      params['hideAreaHot'] = 1;
      params['limit_status'] = (prod_status || []).join(",");
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

  changeRowExist (idx, supplyPrice) {
    const products = this.state.goods
    products[idx].is_exist = {supply_price: supplyPrice, status: 1}
    this.setState({goods: products})
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

  showOnlineBtn (product) {
    return !product.is_exist
      || Mapping.Tools.ValueEqMapping(Mapping.Product.STORE_PRODUCT_STATUS.OFF_SALE.value, product.is_exist.status)
  }

  /**
   * 保底模式并且是售卖中的商品显示保底价
   */
  showSupplyPrice (product) {
    return this.state.fnPriceControlled > 0
      && product
      && !Mapping.Tools.ValueEqMapping(Mapping.Product.STORE_PRODUCT_STATUS.OFF_SALE, product.status)
  }

  showSelect(product) {
    return this.props.route.params.type === 'select_for_store' && product;
  }

  renderRow = (product, idx) => {
    const self = this
    return (
      <View style={styles.productRow} key={product.id}>
        <TouchableOpacity onPress={() => this.showBigImage(product)}>
          <CachedImage source={{uri: Config.staticUrl(product.coverimg)}}
                       style={{width: pxToDp(150), height: pxToDp(150)}}/>
        </TouchableOpacity>
        <View style={styles.productRight}>
          <View style={styles.productRowTop}>
            <Text
              numberOfLines={2}
              style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}
            >
              {product.name}
            </Text>
          </View>
          <View style={styles.productRowBottom}>
            <View>
              <If condition={product.sales}>
                <Text style={{fontSize: pxToDp(20)}}>销量：{product.sales}</Text>
              </If>
            </View>
            <If condition={self.showSelect(product) && product.is_exist}>
              <View style={{flexDirection: 'row'}}>
                <If condition={this.showSupplyPrice(product.is_exist)}>
                  <View style={{marginRight: pxToDp(10)}}>
                    <Text style={{color: color.orange}}>￥{tool.toFixed(product.is_exist.supply_price)}</Text>
                  </View>
                </If>
                <View style={styles.isOnlineBtn}>
                  <Text style={styles.isOnlineBtnText}>
                    {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, product.is_exist.status)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  self.props.route.params.onBack(product.name, product.is_exist);
                  this.props.navigation.dispatch(NavigationActions.back())
                }}>
                  <View style={styles.toOnlineBtn}>
                    <Text style={styles.toOnlineBtnText}>选择</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </If>
            <If condition={!self.showSelect(product)}>
              <If condition={!this.showOnlineBtn(product)}>
                <View style={{flexDirection: 'row'}}>
                  <If condition={this.showSupplyPrice(product.is_exist)}>
                    <View style={{marginRight: pxToDp(10)}}>
                      <Text style={{color: color.orange}}>￥{tool.toFixed(product.is_exist.supply_price)}</Text>
                    </View>
                  </If>
                  <View style={styles.isOnlineBtn}>
                    <Text style={styles.isOnlineBtnText}>
                      {Mapping.Tools.MatchLabel(Mapping.Product.STORE_PRODUCT_STATUS, product.is_exist.status)}
                    </Text>
                  </View>
                </View>
              </If>
              <If condition={this.showOnlineBtn(product)}>
                <TouchableOpacity onPress={() => self.props.navigation.navigate(Config.ROUTE_ONLINE_STORE_PRODUCT, {
                  store_id: this.state.storeId,
                  product_id: product.id,
                  mode: 2,
                  onlineType: this.state.onlineType,
                  onBack: (supplyPrice) => this.changeRowExist(idx, supplyPrice)
                })}>
                  <View style={styles.toOnlineBtn}>
                    <Text style={styles.toOnlineBtnText}>上架</Text>
                  </View>
                </TouchableOpacity>
              </If>
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

        <BigImage
          visible={this.state.bigImageVisible}
          urls={this.state.bigImageUri}
          onClickModal={() => this.closeBigImage()}
        />
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
