import React, {Component} from 'react';
import {Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import {Radio, SearchBar} from "@ant-design/react-native";
import Cts from "../../pubilc/common/Cts";
import tool from "../../pubilc/common/tool";
import Config from "../../pubilc/common/config";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import {WebView} from "react-native-webview";
import 'react-native-get-random-values';
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader} from "../../weui";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../pubilc/styles/colors";
import {Button} from "react-native-elements";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import geolocation from "@react-native-community/geolocation"

const RadioItem = Radio.RadioItem;
let height = Dimensions.get("window").height;

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

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
      isType,
      coordinate: "116.40,39.90",//默认为北京市
      cityname: "北京市",
      shopmsg: map,
      weburl: Config.apiUrl('/map.html')
    }
    if (this.props.route.params.keywords) {
      this.search()
    }
  }

  UNSAFE_componentWillMount() {
    this.getCity();
  }


  getCity() {
    if (!this.state.isType) {   //注册时type  为空
      this.autoGetgeolocation()
    } else {
      if (tool.store(this.props.global)) {
        let citymsg = tool.store(this.props.global);
        let location = citymsg.loc_lng + "," + citymsg.loc_lat;
        this.setState({
          cityname: citymsg.city,
          coordinate: location,
        })
      } else {
        this.autoGetgeolocation()
      }
    }
  }

  autoGetgeolocation = () => {
    geolocation.getCurrentPosition((pos) => {
      let coords = pos.coords;
      let location = coords.longitude + "," + coords.latitude;
      let url = "https://restapi.amap.com/v3/geocode/regeo?parameters?";
      const params = {
        key: '85e66c49898d2118cc7805f484243909',
        location: location,
      }
      Object.keys(params).forEach(key => {
          url += '&' + key + '=' + params[key]
        }
      )
      fetch(url).then(response => response.json()).then(data => {
        if (data.status === "1") {
          this.setState({
            cityname: data.regeocode.addressComponent.city,
            coordinate: location,
          })
        }
      });
    })
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
          city: this.state.cityname,
          radius: "50000",
          // location: this.state.coordinate,
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
        </If>
      </View>
    )
  }


  choseItem() {
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
                }, () => {
                  ToastLong('请重新选择')
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
                if (!this.state.is_default) {
                  this.props.route.params.onBack(this.state.shopmsg);
                }
                this.props.navigation.goBack();
                // if (this.props.route.params.isType == "fixed") {
                //   this.props.navigation.navigate(Config.ROUTE_STORE_ADD, this.state.shopmsg);
                // } else if (this.props.route.params.isType == "orderSetting") {
                //   this.props.navigation.navigate(Config.ROUTE_ORDER_SETTING, this.state.shopmsg);
                // } else if (this.props.route.params.isType == "OrderEdit") {
                //   this.props.navigation.navigate(Config.ROUTE_ORDER_EDIT, this.state.shopmsg);
                // } else {
                //   this.props.navigation.navigate('Apply', this.state.shopmsg);
                // }
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
                  callback: (selectCity) => {
                    this.setState({
                      cityname: selectCity.name,
                    })
                  }
                }
              )
            }
          >
            <Text>
              <MIcon name="map-marker-outline" style={styles.map_icon}/>
              {this.state.cityname.length > 4 ? this.state.cityname.slice(0, 4) + '...' : this.state.cityname}
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
        height: height,
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchShop);
