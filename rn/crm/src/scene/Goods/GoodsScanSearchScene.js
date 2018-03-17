import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {NavigationItem} from '../../widget';
import colors from "../../styles/colors";
import Config from '../../config'
import native from "../../common/native";
import pxToDp from "../../util/pxToDp";
import MyBtn from '../../common/myBtn'
import tool from '../../common/tool'
import {queryUpcCode} from '../../reducers/product/productActions'
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {ToastLong} from "../../util/ToastUtils";
import {Toast} from "../../weui/index";
import RenderEmpty from '../OperateProfit/RenderEmpty'

function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      queryUpcCode
    }, dispatch)
  }
}

class GoodsScanSearchScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    let {backPage, inputText, upc, searchUpc} = params;
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
                value={upc}
                onChangeText={(text) => {
                  inputText(text)
                }}
                style={{
                  flex: 1,
                  borderRadius: pxToDp(90),
                  borderWidth: 0.7,
                  height: pxToDp(60),
                  borderColor: colors.main_color,
                  textAlignVertical: 'center',
                }}
                keyboardType='numeric'
            />
            <TouchableOpacity onPress={() => searchUpc()}>
              <Text style={{
                height: '100%',
                width: pxToDp(120),
                textAlign: 'center',
                textAlignVertical: 'center',
                color: colors.main_color,
              }}>搜索</Text>
            </TouchableOpacity>
          </View>
      ),
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            if (!!backPage) {
              native.nativeBack();
            } else {
              navigation.goBack();
            }
          }}
      />)
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      upc: '6935284466669',
      query: false
    }
  }

  inputText = (text) => {
    this.setState({upc: text})
    this.props.navigation.setParams({
      inputText: this.inputText,
      upc: text,
      searchUpc: this.searchUpc
    })
  }

  componentWillMount() {
    try {
      let products = JSON.parse(this.props.navigation.state.params.products);
      if (tool.length(products) > 0) {
        try {
          this.setState({
            products: products,
            upc: products[0]['upc']
          });
          this.props.navigation.setParams({
            inputText: this.inputText,
            upc: products[0]['upc'],
            searchUpc: this.searchUpc
          })
        } catch (e) {
        }
      }
    } catch (e) {
      console.log(e)
    }

  }

  searchUpc = () => {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    this.setState({query: true})
    dispatch(queryUpcCode(this.state.upc, accessToken, (ok, desc, obj) => {
      this.setState({query: false})
      if (ok) {
        this.setState({products: obj})
      } else {
        ToastLong('没差查询结果')
      }
    }))
  };

  handleImg(item) {
    let img = {};
    item.img.forEach((ite) => {
      img[ite.id] = {
        url: 'https://www.cainiaoshicai.cn' + ite.path
      }
    });
    item.img = img;
    return item
  }

  renderList() {
    return this.state.products.map((item, index) => {
      return (
          <TouchableOpacity key={index}
                            onPress={() => {
                              let msg = this.handleImg(tool.deepClone(item))
                              this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
                                type: 'scan',
                                product_detail: msg
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
                  source={
                    tool.length(item.img) >0
                        ? {uri: 'https://www.cainiaoshicai.cn'+item.img[0]['path']}
                        : require('../../img/Order/zanwutupian_.png')
                  }
              />
              <View style={{paddingLeft: pxToDp(10), justifyContent: 'space-between'}}>
                <Text numberOfLines={2} style={{height: pxToDp(70), fontSize: pxToDp(26)}}>{item.name}</Text>
                <Text style={{fontSize: pxToDp(20), color: colors.fontGray}}>UPC:{item.upc}</Text>
              </View>
            </View>
          </TouchableOpacity>
      )
    })
  }

  render() {
    return (
        <View style={{flex: 1, backgroundColor: colors.main_back}}>
          <ScrollView style={{}}>
            {
              tool.length(this.state.products) > 0  ? this.renderList() : <RenderEmpty/>
            }
          </ScrollView>

          {
            tool.length(this.state.products)
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
                native.nativeBack();
              }}
              style={[styles.btn, {color: colors.fontBlack, borderColor: colors.fontGray}]}
              text={'重新扫码'}/>

          <Toast
              icon="loading"
              show={this.state.query}
              onRequestClose={() => {
              }}
          >查询中</Toast>
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsScanSearchScene)
