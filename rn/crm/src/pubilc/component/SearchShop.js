import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {Dimensions, FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import tool from "../util/tool";
import Config from "../common/config";
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import {ToastLong} from "../util/ToastUtils";
import {Button, SearchBar} from 'react-native-elements';
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";

let height = Dimensions.get("window").height;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class SearchShop extends Component {
  constructor(props) {
    super(props);
    const {center, cityName, keywords} = this.props.route.params;
    let map = {};
    let isMap = false;
    let is_default = false
    let cityNames = cityName !== undefined && tool.length(cityName) > 0 ? cityName : "北京市"

    if (tool.store(this.props.global)) {
      let citymsg = tool.store(this.props.global);
      cityNames = citymsg.city
      map.location = citymsg.loc_lng + "," + citymsg.loc_lat;
    }
    if (tool.length(center) > 0) {
      map.location = center
      isMap = is_default = true;
    }

    if (keywords) {
      map.address = keywords
      this.search()
    }

    this.state = {
      shops: [],
      searchKeywords: keywords,
      isMap: isMap, //控制显示搜索还是展示地图
      is_default: is_default,
      cityname: cityNames,
      shopmsg: map,
    }
  }

  onCancel = () => { //点击取消
    this.setState({searchKeywords: '', shops: []});
  }

  search = () => {   //submit 事件 (点击键盘的 enter)
    tool.debounces(() => {
      const searchKeywords = this.state.searchKeywords ? this.state.searchKeywords : '';
      if (searchKeywords) {
        let header = 'https://restapi.amap.com/v5/place/text?parameters?'
        const params = {
          keywords: searchKeywords,
          key: '85e66c49898d2118cc7805f484243909',
          city: this.state.cityname,
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
    this.setState({searchKeywords}, () => {
      this.search()
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

  setLatLng = (latitude, longitude) => {
    let shopmsg = this.state.shopmsg;
    shopmsg.location = longitude + ',' + latitude
    this.setState({
      is_default: false,
      shopmsg
    })
  }


  choseItem() {
    return <View style={{
      position: 'absolute',
      top: 0,
      zIndex: 999,
      width: "100%",
      padding: 10,
      backgroundColor: colors.background
    }}>
      <View style={{flexDirection: "row", justifyContent: 'center', paddingBottom: 8}}>
        <Text
          style={{fontSize: 14, fontWeight: 'bold', color: colors.color333}}>所选经纬度：{this.state.shopmsg.location} </Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8}}>
        <Entypo name="help-with-circle"
                style={{fontSize: 15, color: colors.warn_color}}/>
        <Text style={{fontSize: 12, color: colors.color333}}> 标注点长按三秒后可拖拽到指定地点 </Text>
      </View>
      <View style={{flexDirection: 'row',}}>
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
        mapType={MapType.Navi}
        style={StyleSheet.absoluteFill}
        initialCameraPosition={{
          target: {latitude: Number(lat), longitude: Number(lng)},
          zoom: 18
        }}>
        <Marker
          draggable={true}
          position={{latitude: Number(lat), longitude: Number(lng)}}
          onDragEnd={({nativeEvent}) => {
            this.setLatLng(nativeEvent.latitude, nativeEvent.longitude)
          }}
        >
          <View style={{alignItems: 'center'}}>
            <View style={{
              zIndex: 999,
              backgroundColor: colors.main_color,
              marginBottom: 15,
              padding: 8,
              borderRadius: 6,
            }}>
              <Text style={{
                color: colors.white,
                fontSize: 18,
              }}>标注点 </Text>
            </View>
            <Entypo name={'triangle-down'}
                    style={{color: colors.main_color, fontSize: 30, position: 'absolute', top: 24}}/>
          </View>
        </Marker>
      </MapView>
    )
  }

  renderSearchBar() {
    return (
      <View style={{height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <TouchableOpacity
          style={{width: "16%", flexDirection: 'row', justifyContent: 'center'}}
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
            <Entypo name={'location-pin'} style={styles.map_icon}/>
            {this.state.cityname.length > 4 ? this.state.cityname.slice(0, 4) + '...' : this.state.cityname}
          </Text>
        </TouchableOpacity>
        <SearchBar
          inputStyle={styles.containerstyle}
          inputContainerStyle={styles.containerstyle}
          containerStyle={styles.searchbox}
          lightTheme={'false'}
          placeholder="请输入您的店铺地址"
          onChangeText={(v) => this.onChange(v)}
          onCancel={this.onCancel}
          value={this.state.searchKeywords}
        />
      </View>
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
                                  paddingVertical: 10,
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
    fontSize: 15,
    color: colors.color666,
    textAlignVertical: "center"
  },
  searchbox: {
    flex: 1,
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
