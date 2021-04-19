import React, {Component} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import tool, {simpleStore} from "../../common/tool";
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

class InventoryItems extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '库存'
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      storeId: this.props.global.currStoreId,
      till: '', //到某一秒的库存
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
  }

  componentWillMount () {

    const {global, dispatch} = this.props
    simpleStore(global, dispatch, (store) => {
      this.setState({fnPriceControlled: store['fn_price_controlled']})
      this.search()
    })

    // this.fetchCategories(storeId, prod_status, accessToken)
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
    const params = {
      page: this.state.page,
      pageSize: this.state.pageNum,
      product_name: this.state.text ? this.state.text : '',
    }

    this.setState({isLoading: true})
    HttpUtils.get.bind(this.props)(`/api_products/inventory_items/${this.state.storeId}/${this.state.till}.json?access_token=${accessToken}`, params).then(res => {
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
      bigImageUri: [{url: Config.staticUrl(product.prod.coverimg)}],
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


  renderRow = (item, idx) => {
    const self = this
    return (
      <View style={styles.productRow} key={item.product_id}>
        <TouchableOpacity onPress={() => this.showBigImage(item)}>
          <CachedImage source={{uri: Config.staticUrl(item.prod.coverimg)}}
                       style={{width: pxToDp(150), height: pxToDp(150)}}/>
        </TouchableOpacity>
        <View style={styles.productRight}>
          <View style={styles.productRowTop}>
            <Text numberOfLines={2} style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}>
              {item.prod.name}
            </Text>
          </View>
          <View style={styles.productRowBottom}>
            <View>
              <Text style={{fontSize: pxToDp(20)}}>库存：{item.total_item}</Text>
              <Text style={{fontSize: pxToDp(20)}}>金额：{item.sum_cost}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  renderNoFoundBtn = () => {
    return <View style={styles.noFoundBtn}><Text style={styles.noFoundBtnText}>已翻到最后一页</Text></View>
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

export default connect(mapStateToProps, mapDispatchToProps)(InventoryItems);

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
