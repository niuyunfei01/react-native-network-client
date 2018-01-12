import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchListVendorTags, fetchListVendorGoods} from '../../reducers/product/productActions.js';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool, {get_platform_name} from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {Toast, Dialog, Icon, Button} from "../../weui/index";

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
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '商品管理',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      tabNum: 0,
      platId: Cts.WM_PLAT_ID_WX,
      vendorId: Cts.STORE_TYPE_SELF,
      tagList: {},
      selectedTag: '999999999',
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
        Cts.STORE_TYPE_XGJ
      ]
    }
  }

  toggleSelectBox() {
    let {toggle} = this.state;
    this.setState({toggle: !toggle})
  }

  showSelectBox() {
    this.setState({toggle: true})
  }

  componentWillMount() {
    this.getListVendorTags();
    this.getListVendorGoods();
  }

  getListVendorTags() {
    const {vendorId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchListVendorTags(vendorId, accessToken, (ok, desc, obj) => {
      this.setState({tagList: obj})
    }));
  }

  getListVendorGoods() {
    const {platId, vendorId} = this.state;
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(fetchListVendorGoods(vendorId, platId, accessToken, (ok, desc, obj) => {
      this.setState({goods: obj})

    }));
  }

//渲染下拉列表项
  renderSelectList() {
    let {selectList, tabNum} = this.state;
    if (tabNum == 1) {
      return (
          selectList.map((item, index) => {
            return (
                <TouchableOpacity
                    onPress={() => {
                      this.toggleSelectBox()
                    }}
                    key={index}
                >
                  <Text style={[select.select_item, select.select_item_active]}>
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
                    onPress={() => {
                      this.toggleSelectBox()
                    }}
                    key={index}
                >
                  <Text style={[select.select_item, select.select_item_active]}>
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
                    onPress={() => {
                      this.toggleSelectBox()
                    }}
                    key={index}
                >
                  <Text style={[select.select_item, select.select_item_active]}>
                    {
                      tool.get_platform_name(item)
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
    let {toggle,selectList} = this.state;
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
          </View>
      )
    } else {
      return null;
    }
  }

  selected(num) {
    console.log(num);
    let {platList,vendorList} = this.state;
    if (num === 1) {
      this.setState({selectList: platList})
    }else if(num === 2){
      this.setState({selectList: vendorList})
    }else{
      this.setState({selectList: vendorList})

    }
    this.setState({tabNum: num})
  }

//商品列表
  renderGoodsList() {
    let {goods, selectedTag} = this.state;
    return (
        <FlatList
            extraData={this.state}
            style={{flex: 1}}
            data={goods[selectedTag]}
            renderItem={({item, key}) => {
              let {
                list_img,
                max_price,
                min_price,
                name,
                product_id,
                sale_store_num
              } = item
              return (
                  <View style={content.goods_item}>
                    <View style={{paddingHorizontal: pxToDp(10)}}>
                      <Image style={content.good_img}
                             source={{uri: list_img}}/>
                      <Text style={content.good_id}>#{product_id}</Text>
                    </View>
                    <View style={{paddingRight: pxToDp(30), flex: 1, paddingLeft: pxToDp(10)}}>
                      <Text style={content.good_name}
                            numberOfLines={2}
                      >{name}</Text>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={content.good_desc}>
                          <Text style={content.on_sale}>在售({sale_store_num})家</Text>
                        </View>
                        <View style={content.good_desc}>
                          <Image style={content.zuidajia_img} source={require('../../img/Goods/zuidajia_.png')}/>
                          <Text style={content.zuidajia}>{tool.toFixed(max_price)}</Text>
                        </View>
                        <View style={content.good_desc}>
                          <Image style={content.zuidajia_img} source={require('../../img/Goods/zuixiaojia_.png')}/>
                          <Text style={content.zuixiaojia}>{tool.toFixed(min_price)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
              )
            }}
        />
    )
  }

// 分类列表
  renderTagsList() {
    let {tagList, selectedTag, platId} = this.state;
    return (
        <FlatList
            extraData={this.state}
            style={{flex: 1}}
            data={tagList}
            renderItem={({item, key}) => {
              return (
                  <TouchableOpacity
                      onPress={() => {
                        this.setState({selectedTag: item.id})
                      }}
                  >
                    <Text style={selectedTag == item.id ? content.type_active : content.type}
                    >{item.name}</Text>
                  </TouchableOpacity>
              )
            }}
        />
    )
  }

  render() {
    let {vendorId, tabNum, platId} = this.state;
    return (
        <View style={{flex: 1}}>

          <View style={!this.state.toggle ? [select.wrapper] : [select.wrapper, select.wrapper_active]}>
            <ImageBtn name={tool.get_platform_name(platId)}
                      activeStyle={tabNum == 1 ? {backgroundColor: colors.white} : {}}
                      onPress={() => {
                        this.selected(1);
                        this.showSelectBox()
                      }}
            />
            <ImageBtn name={tool.getVendorName(vendorId)}
                      activeStyle={tabNum == 2 ? {backgroundColor: colors.white} : {}}
                      onPress={() => {
                        this.selected(2);
                        this.showSelectBox()
                      }}
            />
            <ImageBtn name='销量降序'
                      activeStyle={tabNum == 3 ? {backgroundColor: colors.white} : {}}
                      onPress={() => {
                        this.selected(3);
                        this.showSelectBox()
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

            <ScrollView style={content.right}>
              {
                this.renderGoodsList()
              }

            </ScrollView>
          </View>
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
            <Text style={select.item_text}>{name}</Text>
            <Image source={require('../../img/Public/xiangxialv_.png')}
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
    marginLeft: pxToDp(7)
  },
  good_img: {
    height: pxToDp(110),
    width: pxToDp(110),
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
  },
  good_desc: {
    height: pxToDp(40),
    flexDirection: 'row',
    alignItems: 'center',
    width: pxToDp(140),
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
    borderTopWidth: pxToDp(1)
  },
  items_box: {
    minHeight: pxToDp(50),
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
