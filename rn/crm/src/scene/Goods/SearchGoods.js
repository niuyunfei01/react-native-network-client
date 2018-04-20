import React, {Component} from "react";
import {FlatList, Image, Text, TextInput, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {NavigationActions} from "react-navigation";

import {NavigationItem} from "../../widget";
import pxToDp from "../../util/pxToDp";
import LoadingView from "../../widget/LoadingView";
import {Styles} from "../../themes";
//请求
import {getWithTpl} from "../../util/common";
//配置图片的路由
import Config from "../../config";

const mapStateToProps = state => {
  return {
    global: state.global //全局token,
  };
};

class SearchGoods extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let value = ""; //关键字
    if (params.value) {
      value = params.value;
    }
    return {
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31)
          }}
          onPress={() => {
            navigation.dispatch(NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: Config.ROUTE_GOODS_APPLY_NEW_PRODUCT
                })
              ]
            }));
          }}
          children={
            <View
              style={{
                height: pxToDp(68),
                marginRight: pxToDp(31),
                borderRadius: 30,
                borderColor: "#59b26a",
                borderWidth: 1,
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <TextInput
                style={[{
                  fontSize: 14,
                  flex: 1,
                  paddingVertical: 5,
                  paddingLeft: 5
                }]}
                value={value}
                maxLength={20}
                placeholder={"请输入搜索内容"}
                underlineColorAndroid="transparent"
                placeholderTextColor={"#bfbfbf"}
                onChangeText={text => params.inputText(text)}
              />
              <TouchableOpacity onPress={() => params.search()}>
                <Image
                  source={require("../../img/new/searchG.png")}
                  style={{width: 20, height: 20, marginRight: 5, padding:5}}
                />
              </TouchableOpacity>
            </View>
          }
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      goods: [],
      isLoading: false,
      value: undefined
    };
    this.text = '';
    this.cooperation = true;
  }

  componentWillMount() {
    //设置函数
    this.props.navigation.setParams({
      inputText: this.inputText,
      search: this.search
    });
    const state = this.props.navigation.state;
    let storeId = this.props.global.currStoreId;
    if (state.params && state.params.store_id) {
      storeId = state.params.store_id;
    }
    if (state.params && state.params.result) {
      let code = JSON.parse(state.params.result);
      console.log("code:%o", code);
      this.props.navigation.setParams(
        {
          inputText: this.inputText,
          search: this.search,
          value: code.code //upc
        },
        () => {
          this.search();
        }
      );
    }
    this.fetchResources(storeId);
    this.state = {storeId: storeId};
  }

  inputText = text => {
    this.text = text;
    this.setState({
      value: text
    });
    this.props.navigation.setParams({
      inputText: this.inputText,
      search: this.search,
      value: text //upc
    });
  };
  //获取数据判断是否联营
  fetchResources = (storeId) => {
    let url = `api/get_store_type/${storeId}?access_token=${this.props.global.accessToken}`;
    http: getWithTpl(
      url,
      json => {
        if (json.ok) {
          this.setState({
            isLoading: false
          });
          this.cooperation = json.obj.cooperation;
        } else {
          this.setState({
            isLoading: false
          });
        }
      },
      error => {
        this.setState({
          isLoading: false
        });
      }
    );
  };
  search = () => {
    this.setState({
      isLoading: true
    });
    let url = "";
    if (!this.text) {
      url = `api/query_product_by_upc.json?access_token=${
        this.props.global.accessToken
        }&upc=${this.state.value}`;
    } else {
      url = `api/query_product_by_keyword.json?access_token=${
        this.props.global.accessToken
        }&keyword=${this.text}`;
    }
    http: getWithTpl(
      url,
      json => {
        if (json.ok) {
          this.setState({
            goods: json.obj,
            isLoading: false
          });
        } else {
          this.setState({
            isLoading: false
          });
        }
      }, error => {
        this.setState({
          isLoading: false
        });
      }
    );
  };
  //样式
  renderRow = ({item, index}) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() =>
          this.props.navigation.navigate(Config.ROUTE_NEW_PRODUCT_DETAIL, {
            productId: item.id,
            title: item.name,
            price: item.price
          })
        } style={{marginTop: index === 0 ? 0 : 30, flexDirection: "row"}}>
        <View
          style={{
            width: 100,
            height: 100,
            borderWidth: 1,
            borderColor: "#ccc"
          }}>
          <Image
            source={{uri: Config.staticUrl(item.coverimg)}}
            style={{width: 98, height: 98}}
          />
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
            marginLeft: 18
          }}
        >
          <Text
            numberOfLines={1}
            style={{fontSize: 16, color: "#3e3e3e", fontWeight: "bold"}}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={3}
            style={{flex: 1, color: "#bfbfbf", fontSize: 12, lineHeight: 14}}
          >
            {item.description || "该产品暂无描述"}
          </Text>
          <Text numberOfLines={1} style={{color: "#bfbfbf", fontSize: 12}}>
            UPC:{item.upc || "无"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    console.disableYellowBox = true;
    let storeId = this.state.store_id;
    return this.state.isLoading ? (
      <LoadingView/>
    ) : (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          {/*搜索商品列表*/}
          {this.state.goods && this.state.goods.length ? (
            <View style={{
              paddingHorizontal: 18,
              paddingVertical: 20,
              backgroundColor: "#fff"
            }}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={this.state.goods}
                ref={list => {
                  this.ListView = list;
                }}
                initialNumToRender={this.state.goods.length}
                renderItem={this.renderRow}/>
            </View>
          ) : (<View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Text style={[{}, Styles.tb]}>暂无数据</Text>
          </View>)}
        </View>
        <TouchableOpacity onPress={() => {
          if (this.cooperation) {
            this.props.navigation.navigate(Config.ROUTE_CREATE_NEW_GOOD_REMIND, {storeId: storeId});
          } else {
            this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {type: "add"});
          }
        }}>
          <View style={{paddingHorizontal: pxToDp(31), marginTop: 10}}>
            <View style={{
              width: "100%",
              height: 45,
              backgroundColor: "#59b26a",
              borderRadius: 7,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{color: "#fff", fontSize: 20, textAlign: "center"}}>
                手动添加
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 14,
            color: "#bfbfbf",
            marginTop: 10,
            textAlign: "center",
            marginBottom: 30
          }}
        >
          搜索不到？可点击手动输入信息
        </Text>
      </View>
    );
  }
}

export default connect(mapStateToProps)(SearchGoods);
