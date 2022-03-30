import React, {PureComponent} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {fetchListVendorGoods, fetchListVendorTags} from '../../../reducers/product/productActions.js';
import pxToDp from "../../../util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import tool from '../../../pubilc/common/tool';
import Cts from '../../../pubilc/common/Cts';
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchListVendorTags,
      fetchListVendorGoods,
      ...globalActions
    }, dispatch)
  }
}

class GoodsMangerScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      tabNum: 0,
      platId: Cts.WM_PLAT_ID_WX,
      vendorId: Cts.STORE_TYPE_SELF,
      tagList: [],
      selectedTag: Cts.GOODS_CLASSIFY_ALL,
      selectList: [],
      platList: [
        Cts.WM_PLAT_ID_WX,
        Cts.WM_PLAT_ID_BD,
        Cts.WM_PLAT_ID_MT,
        Cts.WM_PLAT_ID_ELE,
        Cts.WM_PLAT_ID_JD,
      ],
      goods: {},
      vendorList: [
        Cts.STORE_TYPE_SELF,
        Cts.STORE_TYPE_AFFILIATE,
        Cts.STORE_TYPE_GZW,
        Cts.STORE_TYPE_BLX,
      ],
      sortId: Cts.GOODS_MANAGE_SOLD_SORT,
      sortList: [
        Cts.GOODS_MANAGE_DEFAULT_SORT,
        Cts.GOODS_MANAGE_SOLD_SORT,
      ],
      query: false,
      queryTags: false,
    }
  }


  toggleSelectBox() {
    let {toggle} = this.state;
    this.setState({toggle: !toggle})
  }

  showSelectBox() {
    this.setState({toggle: true})
  }

  async UNSAFE_componentWillMount() {
    let {selectId, selectPlatformId} = this.props.product;
    await this.setState({
      vendorId: selectId,
      platId: selectPlatformId,
    });
    await this.getListVendorTags();
    await this.getListVendorGoods();
  }

  toStoresList(item = {}) {
    let {vendorId} = this.state;
    this.props.navigation.navigate(
      Config.ROUTE_GOODS_PRICE_DETAIL, {
        vendorId: vendorId,
        item: item
      }
    )
  }

  async getListVendorTags() {
    const {vendorId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    showModal('加载中')
    dispatch(fetchListVendorTags(vendorId, accessToken, (ok, desc, obj) => {
      hideModal()
      if (ok) {
        this.setState({tagList: obj});
      } else {
        ToastLong(desc);
      }
    }));
  }

  async getListVendorGoods() {
    const {platId, vendorId, sortId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;

    showModal('加载中')
    this.setState({query: true});
    dispatch(fetchListVendorGoods(vendorId, platId, sortId, accessToken, (ok, desc, obj) => {
      this.setState({query: false});
      hideModal()
      if (ok) {
        this.setState({goods: obj})
      } else {
        ToastLong(desc)
      }
    }));
  }

  //没有相关记录
  renderEmpty(str = '没有相关记录') {
    if (!this.state.query) {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
          <Image style={{width: pxToDp(100), height: pxToDp(135)}}
                 source={require('../../../pubilc/img/Goods/zannwujilu.png')}/>
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>{str} </Text>
        </View>
      )
    }
  }

//渲染下拉列表项
  renderSelectList() {
    let {selectList, tabNum, platId, vendorId, sortList, sortId} = this.state;
    if (tabNum == 1) {
      return (
        selectList.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={async () => {
                await this.setState({
                  platId: item,
                  query: true,
                  tabNum: 0
                });
                showModal("加载中")
                this.toggleSelectBox();
                this.getListVendorGoods();
              }}
              key={index}
            >
              <Text
                style={platId == item ? [select.select_item, select.select_item_active] : [select.select_item, select.select_item_cancel]}>
                {
                  tool.get_platform_name(item)
                }
              </Text>
            </TouchableOpacity>
          )
        })
      )
    } else if (tabNum == 2) {
      return (
        selectList.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={async () => {
                await this.setState({
                  vendorId: item,
                  tabNum: 0,
                  query: true,
                  selectedTag: Cts.GOODS_CLASSIFY_ALL
                });
                showModal("加载中")
                this.toggleSelectBox();
                await this.getListVendorTags();
                this.getListVendorGoods();
              }}
              key={index}
            >
              <Text
                style={vendorId == item ? [select.select_item, select.select_item_active] : [select.select_item, select.select_item_cancel]}>
                {
                  tool.getVendorName(item)
                }
              </Text>
            </TouchableOpacity>
          )
        })
      )
    } else {
      return (
        selectList.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={async () => {
                await this.setState({sortId: item, tabNum: 0, query: true});
                this.toggleSelectBox();
                this.getListVendorGoods();
                showModal("加载中")
              }}
              key={index}
            >
              <Text
                style={sortId == item ? [select.select_item, select.select_item_active] : [select.select_item, select.select_item_cancel]}>
                {
                  tool.getSortName(item)
                }
              </Text>
            </TouchableOpacity>
          )
        })
      )
    }
  }

//渲染下拉框
  renderSelectBox() {
    let {toggle, selectList} = this.state;
    if (toggle) {
      return (
        <View style={select.items_wrapper}>
          <View style={select.items_box}>
            {
              this.renderSelectList()
            }
            {
              selectList.length % 3 === 2 ? <Text style={{width: pxToDp(172),}}/> : null
            }
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              this.setState({toggle: false, tabNum: 0})
            }}
          >
            <View style={{flex: 1}}/>
          </TouchableWithoutFeedback>
        </View>
      )
    } else {
      return null;
    }
  }

  async selected(num) {
    let {platList, vendorList, sortList, tabNum} = this.state;
    if (num === 1) {
      await this.setState({selectList: platList})
    } else if (num === 2) {
      await this.setState({selectList: vendorList})
    } else {
      await this.setState({selectList: sortList})
    }
    if (num == tabNum) {
      this.setState({tabNum: 0});
      this.toggleSelectBox()
    } else {
      this.setState({tabNum: num})
    }

  }

//商品列表
  renderGoodsList() {
    let {goods, selectedTag} = this.state;
    return (
      <FlatList
        extraData={this.state}
        style={{flex: 1, borderWidth: 1}}
        data={goods[selectedTag]}
        getItemLayout={(data, index) => (
          {length: pxToDp(190), offset: pxToDp(190) * index, index}
        )}
        ListEmptyComponent={this.renderEmpty('该品类下没有商品!')}
        renderItem={({item, key}) => {
          let {
            list_img,
            max_price,
            min_price,
            name,
            product_id,
            sale_store_num,
            refer_upper,
            refer_lower,
            refer_price,
          } = item;
          return (
            <TouchableOpacity
              onPress={() => {
                this.toStoresList(item);
              }}
            >
              <View style={content.goods_item} key={key}>
                <View style={{paddingHorizontal: pxToDp(10)}}>
                  <Image style={content.good_img}
                         source={!!list_img ? {uri: list_img} : require('../../../pubilc/img/Order/zanwutupian_.png')}
                  />
                  <Text style={content.good_id}>#{product_id} </Text>
                </View>

                <View style={{paddingRight: pxToDp(30), flex: 1, paddingLeft: pxToDp(10)}}>
                  <Text style={content.good_name}
                        numberOfLines={1}
                  >{name} </Text>
                  <View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <View style={content.good_desc}>
                        <Text style={content.on_sale}>在售({sale_store_num})家</Text>
                      </View>
                      <View style={content.good_desc}>
                        <Image style={content.zuidajia_img} source={require('../../../pubilc/img/Goods/zuidajia_.png')}/>
                        <Text style={content.zuidajia}>{tool.toFixed(max_price)} </Text>
                      </View>
                      <View style={content.good_desc}>
                        <Image style={content.zuidajia_img} source={require('../../../pubilc/img/Goods/zuixiaojia_.png')}/>
                        <Text style={content.zuixiaojia}>{tool.toFixed(min_price)} </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={content.cankao}>参考价范围 :
                      {
                        refer_price ?
                          tool.toFixed(refer_lower) + ' - ' + tool.toFixed(refer_upper)
                          : ' 无'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        refreshing={false}
        onRefresh={async () => {
          await this.setState({query: true});
          showModal("加载中")
          this.getListVendorGoods();
        }}
      />
    )
  }

// 分类列表
  renderTagsList() {
    let {tagList, selectedTag, platId} = this.state;
    tagList.forEach((item, index) => {
      item.key = index
    });
    return (
      <FlatList
        extraData={this.state}
        style={{flex: 1}}
        data={tagList}
        renderItem={({item, key}) => {
          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                this.setState({selectedTag: item.id})
              }}
            >
              <Text style={selectedTag == item.id ? content.type_active : content.type}
              >{item.name} </Text>
            </TouchableOpacity>
          )
        }}
      />
    )
  }

  render() {
    let {vendorId, tabNum, platId, sortId} = this.state;
    return (
      <View style={{flex: 1}}>

        <View style={!this.state.toggle ? [select.wrapper] : [select.wrapper, select.wrapper_active]}>

          <ImageBtn name={tool.getVendorName(vendorId)}
                    activeStyle={tabNum == 2 ? {backgroundColor: colors.white} : {}}
                    onPress={() => {
                      this.showSelectBox()
                      this.selected(2);

                    }}
          />
          <ImageBtn name={tool.get_platform_name(platId)}
                    activeStyle={tabNum == 1 ? {backgroundColor: colors.white} : {}}
                    onPress={() => {
                      this.showSelectBox();
                      this.selected(1);
                    }}
          />
          <ImageBtn name={tool.getSortName(sortId)}
                    activeStyle={tabNum == 3 ? {backgroundColor: colors.white} : {}}
                    onPress={() => {
                      this.showSelectBox();
                      this.selected(3);
                    }}
          />
        </View>
        {
          this.renderSelectBox()
        }
        <View style={content.box}>
          <View style={content.left}>
            {
              this.renderTagsList()
            }
          </View>
          <View style={content.right}>
            {
              this.renderGoodsList()
            }
          </View>
        </View>
        {/*  <Toast*/}
        {/*      icon="loading"*/}
        {/*      show={this.state.query}*/}
        {/*      onRequestClose={() => {*/}
        {/*      }}*/}
        {/*  >加载中</Toast>*/}
        {/*  <Toast*/}
        {/*    icon="loading"*/}
        {/*    show={this.state.queryTags}*/}
        {/*    onRequestClose={() => {*/}
        {/*    }}*/}
        {/*>加载中</Toast>*/}

      </View>
    )
  }
}

class ImageBtn extends PureComponent {
  constructor() {
    super()
  }

  render() {
    let {name, onPress, activeStyle} = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          onPress()
        }}
      >
        <View style={[select.item, activeStyle]}>
          <Text style={select.item_text}>{name} </Text>
          <Image source={require('../../../pubilc/img/Public/xiangxialv_.png')}
                 style={{width: pxToDp(28), height: pxToDp(18), marginLeft: pxToDp(10)}}/>
        </View>
      </TouchableOpacity>
    )
  }
}

const content = StyleSheet.create({
  box: {
    flexDirection: "row",
    flex: 1
  },
  left: {
    width: pxToDp(162),
    height: '100%',
    backgroundColor: colors.white,
  },
  right: {
    height: '100%',
    flex: 1,
  },
  type: {
    height: pxToDp(76),
    textAlign: 'center',
    fontSize: pxToDp(24),
    color: '#4c4c4c',
    textAlignVertical: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: pxToDp(1),
  },
  type_active: {
    height: pxToDp(76),
    textAlign: 'center',
    fontSize: pxToDp(24),
    color: colors.main_color,
    textAlignVertical: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: pxToDp(1),
    backgroundColor: '#eee'
  },
  goods_item: {
    flexDirection: 'row',
    paddingVertical: pxToDp(15),
    marginBottom: pxToDp(5),
    backgroundColor: colors.white,
    marginLeft: pxToDp(7),
    height: pxToDp(190),
  },
  good_img: {
    height: pxToDp(110),
    width: pxToDp(110),
    borderWidth: pxToDp(1),
    borderColor: '#eee',
  },
  good_id: {
    height: pxToDp(40),
    width: pxToDp(110),
    backgroundColor: '#eee',
    textAlign: 'center',
  },
  good_name: {
    fontSize: pxToDp(26),
    color: '#4a4a4a',
    lineHeight: pxToDp(30),
    marginBottom: pxToDp(15),
  },
  on_sale: {
    color: colors.main_color,
    fontSize: pxToDp(24),
    textAlignVertical: "top",
    marginBottom: pxToDp(4),
    height: pxToDp(40),
  },
  zuidajia_img: {
    height: pxToDp(26),
    width: pxToDp(26),
  },
  zuidajia: {
    fontSize: pxToDp(24),
    color: '#e60012',
    marginLeft: pxToDp(8),
  },
  zuixiaojia: {
    fontSize: pxToDp(24),
    color: '#1f9cdd',
    marginLeft: pxToDp(8),
  },
  good_desc: {
    height: pxToDp(40),
    flexDirection: 'row',
    alignItems: 'center',
    width: pxToDp(140),
  },
  cankao: {
    width: '100%',
    height: pxToDp(50),
    backgroundColor: '#ededed',
    borderRadius: pxToDp(35),
    textAlignVertical: "center",
    paddingLeft: pxToDp(20),
    fontSize: pxToDp(24),
    marginTop: pxToDp(8)
  }

});
const select = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(30),
    position: 'relative',
    width: '100%',
    minHeight: pxToDp(100),
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
  },
  wrapper_active: {
    zIndex: 1000,
    borderBottomWidth: 0,
  },
  item: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    height: pxToDp(57),
    width: pxToDp(186),
    borderRadius: pxToDp(5),
    justifyContent: 'center'
  },
  item_text: {
    // fontSize: pxToDp(24)
  },
  items_wrapper: {
    width: '100%',
    position: 'absolute',
    top: pxToDp(90),
    backgroundColor: 'rgba(0,0,0,.4)',
    height: '100%',
    zIndex: 100,
  },
  items_box: {
    minHeight: pxToDp(60),
    backgroundColor: "#fff",
    paddingHorizontal: pxToDp(45),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: pxToDp(50),
    justifyContent: 'space-between',
    borderTopWidth: pxToDp(1)
  },
  select_item: {
    width: pxToDp(172),
    marginTop: pxToDp(50),
    height: pxToDp(55),
    textAlign: 'center',
    borderRadius: pxToDp(25),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
  },
  select_item_active: {
    backgroundColor: colors.main_color,
    color: colors.white,
  },
  select_item_cancel: {
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(GoodsMangerScene)
