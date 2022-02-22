import React, {Component} from 'react';
import {FlatList, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Radio, SearchBar} from "@ant-design/react-native";
import Cts from "../../Cts";
import tool from "../../common/tool";
import Config from "../../config";
import {ToastLong} from "../../util/ToastUtils";
import {WebView} from "react-native-webview";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader} from "../../weui";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../styles/colors";
import {Button} from "react-native-elements";

const RadioItem = Radio.RadioItem;

class SearchShop extends Component {
  constructor(props) {
    super(props);
    const {onBack, isType, center} = this.props.route.params;
    let map = {};
    let isMap = false;
    let is_default = false
    if (tool.length(center) > 0) {
      map.name = '';
      map.location = center
      isMap = is_default = true;
    }
    this.state = {
      shops: [],
      page_size: 1,
      page_num: Cts.GOODS_SEARCH_PAGE_NUM,
      searchKeywords: this.props.route.params.keywords,
      isMap: isMap, //控制显示搜索还是展示地图
      is_default: is_default,
      onBack,
      coordinate: "116.40,39.90",//默认为北京市
      isType,
      cityname: "北京市",
      shopmsg: map,
      weburl: Config.apiUrl('/map.html')
    }
    if (this.props.route.params.keywords) {
      this.search()
    }
  }

  onCancel = () => { //点击取消
    this.setState({searchKeywords: '', shops: []});
  }

  search = () => {   //submit 事件 (点击键盘的 enter)
    tool.debounces(() => {
      ToastLong("加载中")
      const searchKeywords = this.state.searchKeywords ? this.state.searchKeywords : '';
      if (searchKeywords) {
        let header = 'https://restapi.amap.com/v5/place/text?parameters?'
        const params = {
          keywords: searchKeywords,
          key: '85e66c49898d2118cc7805f484243909',
          location: this.state.coordinate,
          radius: "50000",
          // page_size: this.state.page,
          // page_num: this.state.page_num,
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )
        //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大
        fetch(header).then(response => response.json()).then(data => {
          if (data.status === "1") {
            console.log(data.pois, 'data.pois')
            this.setState({
              shops: data.pois,
            })
          }
        });
      } else {
        ToastLong("请输入内容")
      }
    }, 1000)
  }

  onChange = (searchKeywords) => {
    const toUpdate = {searchKeywords};
    if (this.state.searchKeywords !== searchKeywords) {
      toUpdate.page = 1
    }
    this.setState(toUpdate, () => {
      this.search(true)
    });
  }

  render() {
    return (
      <View style={{
        flex: 1,
      }}>
        <If condition={this.state.isMap}>
          {this.choseItem()}
          {this.renderMap()}
        </If>
        <If condition={!this.state.isMap}>
          <View style={{
            flexGrow: 1,
          }}>
            {this.renderSearchBar()}
            {this.renderList()}
          </View>
          {this.getcity()}
        </If>
      </View>
    )
  }


  choseItem = () => {
    return <View style={{
      position: 'absolute',
      top: 0,
      zIndex: 999,
      width: "100%",
      padding: pxToDp(20),
      flexDirection: 'row',
      backgroundColor: colors.colorEEE
    }}>
      <Button title={'重新选择'}
              onPress={() => {
                this.setState({
                  isMap: false,
                  is_default: false,
                })
              }}
              buttonStyle={{
                borderRadius: pxToDp(10),
                backgroundColor: colors.fontColor,
                width: pxToDp(250),
                marginLeft: pxToDp(30),
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 16
              }}
      />
      <View style={{flex: 1}}></View>
      <Button title={'确定地址'}
              onPress={() => {
                if (this.state.is_default) {
                  this.props.navigation.navigate.goBack();
                  return;
                }
                //用户确定    返回上一层页面
                this.setState({
                  isShow: false
                })
                this.props.route.params.onBack(this.state.shopmsg);
                if (this.props.route.params.isType == "fixed") {
                  this.props.navigation.navigate(Config.ROUTE_STORE_ADD, this.state.shopmsg);
                } else if (this.props.route.params.isType == "orderSetting") {
                  this.props.navigation.navigate(Config.ROUTE_ORDER_SETTING, this.state.shopmsg);
                } else if (this.props.route.params.isType == "OrderEdit") {
                  this.props.navigation.navigate(Config.ROUTE_ORDER_EDIT, this.state.shopmsg);
                } else {
                  this.props.navigation.navigate('Apply', this.state.shopmsg);
                }
              }}
              buttonStyle={{
                borderRadius: pxToDp(10),
                backgroundColor: colors.main_color,
                width: pxToDp(250),
                marginRight: pxToDp(30),
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 16
              }}
      />
    </View>
  }

  renderMap() {
    let gdkey = "85e66c49898d2118cc7805f484243909"
    let uri = "https://m.amap.com/navi/?dest=" +
      this.state.shopmsg.location +
      "&destName=" + "" +
      "&hideRouteIcon=1&key=" + gdkey
    if (Platform.OS === "ios") {
      uri = "https://m.amap.com/navi/?dest=" +
        this.state.shopmsg.location +
        "&destName=" + this.state.shopmsg.name +
        "&hideRouteIcon=1&key=" + gdkey
    }
    return (
      <WebView
        source={{uri}}
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.99,
          zIndex: 999,
        }}
      />
    );
  }

  renderSearchBar() {
    return (
      <Cell first>
        <CellHeader>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate(
                Config.ROUTE_SELECT_CITY_LIST,
                {
                  callback: selectCity => {
                    const message: string = selectCity.name;
                    this.webview.postMessage(message)
                  }
                }
              )
            }
          >
            <Text>
              <MIcon name="map-marker-outline" style={styles.map_icon}/>
              {this.state.cityname}
            </Text>
          </TouchableOpacity>
        </CellHeader>
        <CellBody>
          <SearchBar placeholder="请输入您的店铺地址" value={this.state.searchKeywords} onChange={this.onChange}
                     onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
        </CellBody>
      </Cell>
    )
  }

  renderList() {
    return (
      <View style={{
        flexDirection: "column",
        paddingBottom: 80
      }}>
        <FlatList
          data={this.state.shops}
          ListEmptyComponent={() => {
            return (
              <View style={{
                paddingVertical: 9,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                marginTop: '40%',
                flex: 1
              }}>
                <If condition={this.state.searchKeywords}>
                  <Text>没有找到" {this.state.searchKeywords} "这个店铺</Text>
                </If>
                <If condition={!this.state.searchKeywords}>
                  <Text>请输入关键词</Text>
                </If>
              </View>
            )
          }}
          renderItem={({item, index}) => {
            return (
              <RadioItem key={index}
                         style={{
                           fontSize: 16,
                           fontWeight: 'bold',
                           paddingTop: pxToDp(15),
                           paddingBottom: pxToDp(15)
                         }}
                         onChange={event => {
                           if (event.target.checked) {
                             this.setState({
                               isMap: true,
                               shopmsg: this.state.shops[index]
                             })
                           }
                         }}>
                <View>
                  <Text> {item.name} </Text>
                  <Text
                    style={{
                      color: "gray",
                      fontSize: 12
                    }}> {item.adname}-{item.address} </Text>
                </View>
              </RadioItem>
            )
          }}
        />
      </View>
    )
  }

  getcity() {
    return (
      <View style={{
        flexDirection: "column",
        flex: 1,
      }}>
        <WebView
          ref={w => this.webview = w}
          source={{uri: this.state.weburl}}
          onMessage={(event) => {
            let cityData = JSON.parse(event.nativeEvent.data)
            if (cityData.info) {
              if (cityData.restype === 'auto') {
                if (this.props.route.params.isType === "orderSetting") {
                  //  创建订单的时候 取门店所在城市
                  this.state.coordinate = this.props.route.params.loc_lng + "," + this.props.route.params.loc_lat;
                  this.setState({
                    cityname: this.props.route.params.cityname
                  })
                } else {
                  // ToastLong('已自动定位到' + cityData.city)
                  let coordinate = cityData.rectangle.split(';')[0];
                  if (coordinate) {
                    this.state.coordinate = coordinate;
                    this.setState({
                      cityname: cityData.city
                    })

                  }
                }
              } else {
                if (cityData.geocodes && cityData.geocodes[0]) {
                  let resu = cityData.geocodes[0];
                  ToastLong('已定位到' + resu.formattedAddress)
                  let rescoordinate = resu.location.lng + ',' + resu.location.lat;
                  this.setState({
                    cityname: resu.addressComponent.city
                  })
                  this.state.coordinate = rescoordinate;
                }
              }
            }
          }}
          style={{display: 'none', height: 0}}
        />
      </View>
    )
  }
}

const
  styles = StyleSheet.create({
    map_icon: {
      fontSize: pxToDp(30),
      color: colors.color666,
      height: pxToDp(60),
      width: pxToDp(40),
      textAlignVertical: "center"
    },
  })

export default SearchShop;
