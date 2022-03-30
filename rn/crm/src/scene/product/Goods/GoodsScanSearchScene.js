import React, {PureComponent} from 'react';
import {Image, ScrollView, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import Config from '../../../pubilc/common/config'
import native from "../../../util/native";
import pxToDp from "../../../util/pxToDp";
import MyBtn from '../../../util/MyBtn'
import tool from '../../../pubilc/common/tool'
import {queryProductByKey, queryUpcCode} from '../../../reducers/product/productActions'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import RenderEmpty from '../../operation/RenderEmpty'

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      queryUpcCode,
      queryProductByKey,
    }, dispatch)
  }
}

class GoodsScanSearchScene extends PureComponent {
  constructor(props) {
    super(props);
    let task_id = this.props.route.params.task_id;
    if (!task_id) {
      task_id = 0;
    }
    this.state = {
      products: [],
      upc: '',
      task_id: task_id
    }
  }

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {name} = params;
    let {backPage, inputText, upc, searchUpc} = params;
    let searchVal = '';
    if (name) {
      searchVal = name
    }
    if (upc) {
      searchVal = upc
    }
    return {
      headerTitle: (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: pxToDp(600),
          height: '100%',
          alignItems: 'center'
        }}>
          <TextInput
            underlineColorAndroid='transparent'
            value={searchVal}
            onChangeText={(text) => {
              inputText(text)
            }}
            style={{
              flex: 1,
              borderRadius: pxToDp(90),
              borderWidth: 0.7,
              height: pxToDp(80),
              paddingLeft: pxToDp(40),
              marginLeft: pxToDp(40),
              borderColor: colors.main_color,
              textAlignVertical: 'center',
            }}
          />
          <TouchableOpacity onPress={() => searchUpc()}>
            <Text style={{
              height: '100%',
              width: pxToDp(120),
              textAlign: 'center',
              textAlignVertical: 'center',
              color: colors.main_color,
            }}>搜索 </Text>
          </TouchableOpacity>
        </View>
      )
    }
  };

  inputText = (text) => {
    this.setState({upc: text});
    this.props.navigation.setParams({
      inputText: this.inputText,
      upc: text,
      searchUpc: this.searchUpc
    })
  }

  UNSAFE_componentWillMount() {
    let keyword = '';
    const state = this.props.route;
    try {
      let products = JSON.parse(state.params.products);
      if (tool.length(products) > 0) {
        this.setState({
          products: products,
          upc: products[0]['upc']
        });
        keyword = products[0]['upc'];
      }
    } catch (e) {
    }

    if (state.params.keyword && !keyword) {
      keyword = state.params.keyword;
    }

    this.props.navigation.setParams({
      inputText: this.inputText,
      upc: keyword,
      searchUpc: this.searchUpc
    })
  }

  searchUpc = () => {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    showModal('查询中');
    let {type} = this.props.route.params;
    if (type === 'searchAdd') {
      dispatch(queryProductByKey(this.state.upc, accessToken, (ok, desc, obj) => {
        hideModal()
        if (ok) {
          this.setState({products: obj})
        } else {
          ToastLong('没差查询结果')
        }
      }))
    } else {
      dispatch(queryUpcCode(this.state.upc, accessToken, (ok, desc, obj) => {
        hideModal()
        if (ok) {
          this.setState({products: obj})
        } else {
          ToastLong('没差查询结果')
        }
      }))
    }
  };

  handleImg(item) {
    let img = {};
    let prefix = 'https://www.cainiaoshicai.cn';
    if (item.img) {
      item.img.forEach((ite) => {
        img[ite.id] = {
          url: prefix + ite.path,
          path: ite.path,
          mid_thumb: item.mid_thumb
        }
      });
      item.img = img;
    } else if (item.img_path) {
      item.img = {"0": {url: prefix + item.img_path, path: item.img_path, mid_thumb: item.mid_thumb}}
    }
    return item
  }

  renderBtn() {
    let {type} = this.props.route.params;
    if (type === 'searchAdd') {
      return null
    } else {
      return (
        <View>
          {tool.length(this.state.products)
            ? null
            : <MyBtn
              onPress={() => {
                this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {})
              }}
              style={[styles.btn, {backgroundColor: colors.main_color, color: colors.white}]}
              text={'直接上新'}/>
          }
          <MyBtn
            onPress={() => {
              native.gotoNativeActivity("cn.cainiaoshicai.crm.ui.scanner.FullScannerActivity", false)
            }}
            style={[styles.btn, {color: colors.fontBlack, borderColor: colors.fontGray}]}
            text={'重新扫码'}/>
        </View>
      )
    }

  }

  renderList() {
    let task_id = this.state.task_id;
    return this.state.products.map((item, index) => {
      let img = require('../../../img/Order/zanwutupian_.png');
      if (tool.length(item.img) > 0) {
        img = {uri: 'https://www.cainiaoshicai.cn' + item.img[0]['path']}
      }
      if (item['coverimg']) {
        img = {uri: 'https://www.cainiaoshicai.cn' + item['coverimg']}
      }
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            let msg = this.handleImg(tool.deepClone(item))
            this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
              type: 'add',
              product_detail: msg,
              task_id: task_id,
              scan: true
            })
          }}
        >
          <View style={{
            flexDirection: 'row',
            paddingVertical: pxToDp(30),
            paddingHorizontal: pxToDp(30),
            backgroundColor: colors.white
          }}>
            <Image
              style={{
                height: pxToDp(120),
                backgroundColor: '#ccc',
                width: pxToDp(120),
                borderColor: colors.main_back,
                borderWidth: 1
              }}
              source={img}
            />
            <View style={{paddingLeft: pxToDp(10), justifyContent: 'space-between'}}>
              <Text numberOfLines={2} style={{height: pxToDp(70), fontSize: pxToDp(26)}}>{item.name} </Text>
              <Text style={{fontSize: pxToDp(20), color: colors.fontGray}}>
                UPC:{!!item.upc ? item.upc : "无"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )
    })
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: colors.main_back}}>
        <ScrollView style={{height: pxToDp(300)}}>
          {
            tool.length(this.state.products) > 0 ? this.renderList() : <RenderEmpty/>
          }
        </ScrollView>
        {
          this.renderBtn()
        }
      </View>
    )
  }
}

const styles = {
  btn: {
    height: pxToDp(90),
    width: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: pxToDp(50),
    borderWidth: 0.6,
    borderColor: colors.main_color,
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(45)
  },
  container: {
    paddingTop: 25,
    flex: 1,
  },
  autocompleteContainer: {
    left: 0,
    position: 'absolute',
    right: pxToDp(30),
    top: 0,
    paddingLeft: pxToDp(30),
    paddingTop: pxToDp(20),
    zIndex: 1,
    maxHeight: '90%',
    borderColor: colors.main_color,
  },
  moneyLabel: {fontSize: pxToDp(30), fontWeight: 'bold'},
  moneyText: {fontSize: pxToDp(40), color: colors.color999},
  itemText: {
    fontSize: 15,
    margin: 2
  },
  infoText: {
    textAlign: 'center'
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center'
  },
  directorText: {
    color: 'grey',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center'
  },
  openingText: {
    textAlign: 'center'
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsScanSearchScene)
