import React, {Component} from 'react';
import {Dimensions, FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import {Button, SearchBar} from 'react-native-elements';
import Cts from "../common/Cts";
import tool from "../util/tool";
import Config from "../common/config";
import {ToastLong} from "../util/ToastUtils";
import {WebView} from "react-native-webview";
import 'react-native-get-random-values';
import pxToDp from "../util/pxToDp";
import {Cell, CellBody, CellHeader} from "../../weui";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../styles/colors";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";

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
    const {onBack, isType, center, cityName} = this.props.route.params;
    let map = {};
    let isMap = false;
    let is_default = false
    let cityNames = cityName !== undefined && tool.length(cityName) > 0 ? cityName : "北京市"
    if (tool.length(center) > 0) {
      map.name = '';
      map.location = center
      isMap = is_default = true;
    }
    if (tool.store(this.props.global)) {
      let citymsg = tool.store(this.props.global);
      cityNames = citymsg.city
      let location = citymsg.loc_lng + "," + citymsg.loc_lat;
      map.name = '';
      map.location = location
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
      cityname: cityNames,
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
      this.state.loading = true;
      const searchKeywords = this.state.searchKeywords ? this.state.searchKeywords : '';
      if (searchKeywords) {
        let header = 'https://restapi.amap.com/v5/place/text?parameters?'
        const params = {
          keywords: searchKeywords,
          key: '85e66c49898d2118cc7805f484243909',
          city: this.state.cityname,
          radius: "50000",
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )
        //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大
        fetch(header).then(response => response.json()).then(data => {
          this.state.loading = false;
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

                InteractionManager.runAfterInteractions(() => {
                  this.setState({
                    isMap: false,
                    is_default: false,
                  }, () => {
                    ToastLong('请重新选择')
                  })
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
      <View style={{flex: 1}}/>
      <Button title={'确定地址'}
              onPress={() => {

                InteractionManager.runAfterInteractions(() => {
                  if (!this.state.is_default) {
                    this.props.route.params.onBack(this.state.shopmsg);
                  }
                  this.props.navigation.goBack();
                })
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
    let lat = this.state.shopmsg.location.split(",")[1];
    let lng = this.state.shopmsg.location.split(",")[0];
    if (!lat || !lng) {
      return null
    }

    return (
      <MapView
        mapType={MapType.Standard}
        style={StyleSheet.absoluteFill}
        initialCameraPosition={{
          target: {latitude: Number(lat), longitude: Number(lng)},
          zoom: 18
        }}>
        <Marker
          position={{latitude: Number(lat), longitude: Number(lng)}}
          onPress={() => alert("onPress")}
        >
          <View style={{alignItems: 'center'}}>
            <Text style={{
              color: colors.white,
              fontSize: 18,
              zIndex: 999,
              backgroundColor: colors.main_color,
              marginBottom: 15,
              padding: 3,
            }}>终点 </Text>
            <Entypo name={'triangle-down'}
                    style={{color: colors.main_color, fontSize: 30, position: 'absolute', top: 20}}/>
          </View>
        </Marker>
      </MapView>
    )
    return (
      <WebView
        source={{uri}}
        style={{
          width: '100%',
          height: this.state.isMap ? '100%' : 0,
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
            <Text style={{color: colors.color333}}>
              <MIcon name="map-marker-outline" style={styles.map_icon}/>
              {this.state.cityname.length > 4 ? this.state.cityname.slice(0, 4) + '...' : this.state.cityname}
            </Text>
          </TouchableOpacity>
        </CellHeader>
        <CellBody>
          <SearchBar
            inputStyle={styles.containerstyle}
            inputContainerStyle={styles.containerstyle}
            containerStyle={styles.searchbox}
            lightTheme={'false'}
            placeholder="请输入您的店铺地址"
            onChangeText={(v) => {
              this.setState({
                searchKeywords: v
              }, () => {
                this.search(true)
              })
            }}
            onCancel={this.onCancel}
            value={this.state.searchKeywords}
          />
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
                  <Text style={{color: colors.color333}}>没有找到" {this.state.searchKeywords} "这个店铺</Text>
                </If>
                <If condition={!this.state.searchKeywords}>
                  <Text style={{color: colors.color333}}>请输入关键词</Text>
                </If>
              </View>
            )
          }}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity key={index}
                                style={{
                                  fontSize: 16,
                                  fontWeight: 'bold',
                                  paddingTop: pxToDp(15),
                                  paddingBottom: pxToDp(15),
                                  paddingLeft: pxToDp(15),
                                  backgroundColor: 'white',
                                  borderBottomWidth: pxToDp(1),
                                  borderColor: '#c4c7ce',
                                }}
                                onPress={() => {

                                  InteractionManager.runAfterInteractions(() => {
                                    this.setState({
                                      isMap: true,
                                      shopmsg: this.state.shops[index]
                                    })
                                  })
                                }}>
                <View>
                  <Text style={{color: colors.color333}}> {item.name} </Text>
                  <Text
                    style={{
                      color: "gray",
                      fontSize: 12
                    }}> {item.adname}-{item.address} </Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  map_icon: {
    fontSize: pxToDp(30),
    color: colors.color666,
    height: pxToDp(60),
    width: pxToDp(40),
    textAlignVertical: "center"
  },
  searchbox: {
    width: '100%',
    padding: 0,
    margin: 0,
    backgroundColor: '#f7f7f7',
    borderWidth: 0,
  },
  containerstyle: {
    margin: 4,
    height: 35,
    borderRadius: 6,
    padding: 0,
    backgroundColor: colors.white,
    borderWidth: 0
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchShop);
