import React from "react";
import {Dimensions, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import AntDesign from "react-native-vector-icons/AntDesign";
import colors from "../../../pubilc/styles/colors";
import FastImage from "react-native-fast-image";
import {hideModal, showError, showModal} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import HttpUtils from "../../../pubilc/util/http";
import {SvgXml} from "react-native-svg";
import {noSearchGoodsData} from "../../../svg/svg";

const {width} = Dimensions.get('window')
const styles = StyleSheet.create({
  page: {flex: 1},
  HeaderWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginTop: 10
  },
  HeaderInputWrap: {
    flex: 9, flexDirection: 'row', alignItems: 'center', borderRadius: 17, backgroundColor: '#f7f7f7'
  },
  searchTextInput: {flex: 1, padding: 8, marginLeft: 13},
  itemWrap: {
    height: 100,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
    backgroundColor: colors.white
  },
  storeHasItemWrap: {
    height: 100,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
    backgroundColor: colors.colorCCC
  },
  itemGoodsExitsWrap: {height: 100, borderRadius: 4, flexDirection: 'row', alignItems: 'center'},
  itemImage: {width: 80, height: 80, margin: 10},
  itemTitle: {fontSize: 14, fontWeight: 'bold', color: colors.color333, width: width - 120, paddingTop: 10},
  itemCategoryName: {fontSize: 12, color: colors.color666, width: width - 120},
  itemGoodsExistFlagWrap: {backgroundColor: colors.red, borderRadius: 2, position: 'absolute', top: 4, right: 6},
  itemGoodsExistFlagText: {fontSize: 10, color: colors.white, paddingVertical: 1, paddingHorizontal: 4},
  itemGoodsMultiFlagWrap: {backgroundColor: '#FFB454', borderRadius: 2, position: 'absolute', bottom: 4, right: 6},
  itemGoodsMultiFlagText: {fontSize: 10, color: colors.white, paddingVertical: 1, paddingHorizontal: 4},
  bottomWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.colorEEE
  },
  bottomTextNormal: {fontSize: 14, color: colors.color666},
  bottomTextBtn: {fontSize: 14, color: colors.main_color, marginLeft: 12},
  center: {flex: 1, alignItems: 'center', marginTop: 80},
  notHasGoodsDesc: {
    fontSize: 15,
    marginTop: 9,
    color: colors.color999
  },
})

class SearchAndCreateGoodsScene extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      searchKeywords: '',
      goodsList: [],
      page: 1,
      pageSize: 10,
      isLastPage: false,
      isLoading: false,
      isCanLoadMore: false,
      hasGoodsResult: false,
      showBottomView: false
    }
  }

  onChangeText = (value) => {
    this.setState({searchKeywords: value})
    if (!value) {
      this.setState({hasGoodsResult: false, showBottomView: false})
    }
  }

  searchGoods = () => {
    this.setState({page: 1}, () => this.search())
  }

  getHeader() {
    let {searchKeywords} = this.state
    return (
      <View style={styles.HeaderWrap}>
        <View style={styles.HeaderInputWrap}>
          <AntDesign name={'search1'} size={18} style={{marginLeft: 10}}/>
          <TextInput value={searchKeywords}
                     onChangeText={text => this.onChangeText(text)}
                     returnKeyType={'search'}
                     onSubmitEditing={this.searchGoods}
                     style={styles.searchTextInput}
                     underlineColorAndroid={'transparent'}
                     placeholderTextColor={colors.color999}
                     placeholder={'请输入商品名称'}/>

        </View>
        <If condition={searchKeywords}>
          <Text onPress={this.searchGoods} style={{fontSize: 16, padding: 8, color: colors.color333}}>
            搜索
          </Text>
        </If>
      </View>
    )
  }


  renderItem = ({item}) => {
    const {store_has, name, sg_tag_name_list, barcode, pic, series_id} = item
    return (
      <TouchableOpacity style={store_has ? styles.storeHasItemWrap : styles.itemWrap}
                        onPress={() => this.jumpToGoodsEdit(item)}
                        disabled={store_has}>
        <FastImage style={styles.itemImage} source={{uri: pic}} resizeMode={FastImage.resizeMode.contain}/>
        <View>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {name}
          </Text>

          <Text style={styles.itemCategoryName} numberOfLines={2}>
            类目：{sg_tag_name_list}
          </Text>
          <Text style={styles.itemCategoryName}>
            UPC：{barcode}
          </Text>
        </View>
        <If condition={store_has}>
          <View style={styles.itemGoodsExistFlagWrap}>
            <Text style={styles.itemGoodsExistFlagText}>
              商品已存在
            </Text>
          </View>
        </If>
        <If condition={parseInt(series_id) > 0}>
          <View style={styles.itemGoodsMultiFlagWrap}>
            <Text style={styles.itemGoodsMultiFlagText}>
              多规格
            </Text>
          </View>
        </If>
      </TouchableOpacity>
    )
  }

  getItemLayout = (data, index) => ({
    length: 100, offset: 100 * index, index
  })
  onScrollBeginDrag = () => {
    this.setState({isCanLoadMore: true})
  }
  search = () => {
    const {searchKeywords, goodsList, page, pageSize} = this.state
    const {accessToken, currStoreId, vendor_id} = this.props.global
    if (!searchKeywords)
      return
    const url = `/api/get_product_by_name`
    const params = {
      access_token: accessToken,
      store_id: currStoreId,
      vendor_id: vendor_id,
      name: searchKeywords,
      page: page,
      pageSize: pageSize
    };
    showModal('加载中')
    HttpUtils.get(url, params).then(res => {
      hideModal()
      if (Array.isArray(res.lists)) {

        this.setState({
          goodsList: Number(res.page) === 1 ? res.lists : goodsList.concat(res.lists),
          page: res.page,
          isLastPage: res.isLastPage,
          isLoading: false,
          hasGoodsResult: !res.lists.length,
          showBottomView: true
        })

      }
    }, () => {
      this.setState({isLoading: false})
      hideModal()
    })
      .catch(() => {
        hideModal()
        this.setState({isLoading: false})
      })
    Keyboard.dismiss()
  }
  onLoadMore = () => {
    let {page, isLastPage, isLoading, isCanLoadMore} = this.state
    if (!isCanLoadMore || isLoading)
      return;
    if (isLastPage) {
      showError('没有更多商品')
      this.setState({isCanLoadMore: false})
      return
    }
    this.setState({page: page + 1, isLoading: true, isCanLoadMore: false}, () => this.search())
  }
  getGoodsList = () => {
    const {goodsList, hasGoodsResult} = this.state
    if (goodsList.length > 0)
      return (
        <FlatList data={goodsList}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={this.renderItem}
                  getItemLayout={this.getItemLayout}
                  initialNumToRender={10}
                  onScrollBeginDrag={this.onScrollBeginDrag}
                  onEndReachedThreshold={0.2}
                  onEndReached={this.onLoadMore}
                  keyExtractor={(item, index) => `${index}`}
        />
      )
    return (
      <If condition={hasGoodsResult}>
        <View style={styles.center}>
          <SvgXml xml={noSearchGoodsData()}/>
          <Text style={styles.notHasGoodsDesc}>
            暂无搜索结果
          </Text>
        </View>
      </If>
    )
  }

  jumpToGoodsEdit = (goodsInfo = {}) => {
    let {navigation} = this.props;
    navigation.navigate(Config.ROUTE_GOODS_EDIT, {goodsInfo: goodsInfo, type: 'add'})
  }
  getBottomView = () => {
    const {showBottomView} = this.state
    if (showBottomView)
      return (
        <View style={styles.bottomWrap}>
          <Text style={styles.bottomTextNormal}>
            未找到合适的商品可
          </Text>
          <Text style={styles.bottomTextBtn} onPress={() => this.jumpToGoodsEdit(null)}>
            手动创建
          </Text>
        </View>
      )
  }

  render() {
    return (
      <>
        {this.getHeader()}
        {this.getGoodsList()}
        {this.getBottomView()}

      </>
    )
  }
}

const mapStateToProps = (state) => {
  const {global} = state
  return {global: global}
}
export default connect(mapStateToProps)(SearchAndCreateGoodsScene)
