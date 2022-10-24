import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {FlatList, Image, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import tool from "../util/tool";
import Config from "../common/config";
import colors from "../styles/colors";
import {ToastLong} from "../util/ToastUtils";
import {SearchBar} from 'react-native-elements';
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";

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

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    const {center, cityName, keywords, placeholderText, show_select_city} = this.props.route.params;

    let map = {};
    let isMap = false;
    let show_seach_msg = false;
    let is_default = false
    let cityNames = "北京市"

    if (tool.length(tool.store(this.props.global)) > 0) {
      let citymsg = tool.store(this.props.global);
      cityNames = citymsg.city
      map.location = citymsg.loc_lng + "," + citymsg.loc_lat;
    }
    if (cityName !== undefined && tool.length(cityName) > 0)
      cityNames = cityName;

    if (keywords) {
      map.address = keywords
      show_seach_msg = false
    }

    if (tool.length(center) > 0) {
      map.location = center
      isMap = is_default = true;
    }

    this.state = {
      loading: false,
      show_select_city: show_select_city !== undefined ? show_select_city : true,
      show_seach_msg: show_seach_msg,
      shops: [],
      ret_list: [],
      searchKeywords: keywords,
      isMap: isMap, //控制显示搜索还是展示地图
      is_default: is_default,
      cityname: cityNames,
      shopmsg: map,
      placeholderText: placeholderText !== undefined ? placeholderText : '请在此输入地址'
    }

    if (tool.length(center) <= 0 && keywords) {
      this.search()
    }
  }

  onCancel = () => { //点击取消
    this.setState({searchKeywords: '', shops: []});
  }

  onChange = (searchKeywords) => {
    let show_seach_msg = tool.length(searchKeywords) <= 0
    this.setState({searchKeywords, show_seach_msg}, () => {
      this.search()
    });
  }

  search = () => {   //submit 事件 (点击键盘的 enter)
    let {searchKeywords, cityname} = this.state;
    this.setState({loading: true})
    tool.debounces(() => {
      if (searchKeywords) {
        let header = 'https://restapi.amap.com/v5/place/text?parameters?'
        const params = {
          keywords: searchKeywords,
          key: '85e66c49898d2118cc7805f484243909',
          region: cityname,
          city_limit: true,
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )
        //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大
        fetch(header).then(response => response.json()).then(data => {
          if (data.status === "1") {
            this.setState({
              shops: data?.pois,
              loading: false,
              isMap: false,
            })
          }
        });
      } else {
        ToastLong("请输入内容")
      }
    }, 1000)
  }

  searchLngLat = () => {   //submit 事件 (点击键盘的 enter)
    let {shopmsg} = this.state;
    this.setState({loading: true})
    tool.debounces(() => {
      if (shopmsg?.location) {
        let header = 'https://restapi.amap.com/v5/place/around?parameters?'
        const params = {
          location: shopmsg?.location,
          key: '85e66c49898d2118cc7805f484243909',
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )
        //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大
        fetch(header).then(response => response.json()).then(data => {
          if (data.status === "1") {
            // let shopmsg = data?.pois[0];
            // let item = {
            //   address: shopmsg?.name,
            //   adname: shopmsg?.adname,
            //   citycode: shopmsg?.citycode,
            //   cityname: shopmsg?.cityname,
            //   id: shopmsg?.id,
            //   location: shopmsg?.location,
            //   name: shopmsg?.name,
            //   pcode: shopmsg?.pcode,
            //   pname: shopmsg?.pname,
            //   type: shopmsg?.type,
            //   typecode: shopmsg?.typecode,
            // }
            this.setState({
              ret_list: data?.pois,
              loading: false,
            })
          }
        });
      } else {
        ToastLong("请输入内容")
      }
    }, 1000)
  }


  setLatLng = (latitude, longitude) => {
    let {shopmsg} = this.state;
    shopmsg.location = longitude + ',' + latitude
    this.setState({
      is_default: false,
      shopmsg
    }, () => {
      this.searchLngLat()
    })
  }

  goSelectCity = () => {
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

  render() {
    let {shops, ret_list, isMap} = this.state;
    return (
      <View style={{
        flex: 1,
      }}>

        {this.renderHeader()}
        <If condition={!isMap}>
          <View style={{paddingHorizontal: 12, paddingVertical: 10}}>
            {this.renderList(shops)}
          </View>
        </If>

        <If condition={isMap}>
          {this.renderMap()}
          {this.renderList(ret_list)}
        </If>

      </View>
    )
  }

  renderHeader = () => {
    let {show_select_city, show_seach_msg, cityname, searchKeywords, placeholderText} = this.state
    return (
      <View style={{backgroundColor: colors.white, marginBottom: show_seach_msg ? 30 : 0,}}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 10,
          paddingLeft: show_select_city ? 0 : 10
        }}>
          <If condition={show_select_city}>
            <TouchableOpacity
              style={{width: 60, flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => this.goSelectCity()}
            >
              <Text style={{textAlign: 'center', fontSize: 14, color: colors.color333}}>
                <Entypo name={'location-pin'} style={styles.map_icon}/>
                {tool.length(cityname) > 4 ? cityname.slice(0, 4) + '...' : cityname}
              </Text>
            </TouchableOpacity>
          </If>
          <SearchBar
            inputStyle={{fontSize: 14, color: colors.color333}}
            leftIconContainerStyle={{
              width: 20,
              height: 20
            }}
            cancelIcon={true}
            clearIcon={true}
            inputContainerStyle={{
              backgroundColor: colors.f5,
              height: 32,
              borderRadius: 16,
              borderWidth: 0
            }}
            containerStyle={{
              flex: 1,
              padding: 0,
              margin: 0,
              height: 31,
              borderRadius: 16
            }}
            lightTheme={true}
            placeholder={placeholderText}
            onChangeText={(v) => this.onChange(v)}
            onCancel={this.onCancel}
            value={searchKeywords}
          />
          <Text onPress={() => this.props.navigation.goBack()}
                style={{textAlign: 'center', width: 56, fontSize: 14, color: colors.color333}}>取消</Text>

        </View>

        <If condition={show_seach_msg}>
          <TouchableOpacity style={{position: 'absolute', top: 20, left: show_select_city ? 56 : 6}}>
            <Entypo name={'triangle-up'}
                    style={{color: "rgba(0,0,0,0.7)", fontSize: 24, marginLeft: 10}}/>

            <View style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 4,
              height: 36,
              width: 280,
              position: 'absolute',
              top: 17.4,
              left: 3,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{fontSize: 12, color: colors.f7, lineHeight: 17}}> 请输入准确的地址信息进行搜索，如小区，大厦等 </Text>
            </View>
          </TouchableOpacity>

        </If>
      </View>
    )
  }
  onClickItrm = (item) => {
    let {isMap, is_default} = this.state;
    InteractionManager.runAfterInteractions(() => {
      if (isMap) {
        if (!is_default) {
          this.props.route.params.onBack(item);
        }
        this.props.navigation.goBack();
      } else {
        this.setState({
          isMap: true,
          shopmsg: item
        })
      }

    })
  }

  renderList(list) {
    let {loading, searchKeywords} = this.state;
    return (
      <View style={{
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        flexDirection: "column",
        flexGrow: 1,
      }}>
        <FlatList
          data={list}
          ListEmptyComponent={() => {
            return (
              <View style={{
                paddingVertical: 9,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                marginTop: '30%',
                flex: 1
              }}>
                <If condition={loading}>
                  <Text style={{color: colors.color666}}>搜索中 </Text>
                </If>
                <If condition={searchKeywords && !loading}>
                  <Text style={{color: colors.color666}}>没有找到" {searchKeywords} " 这个地址 </Text>
                </If>
                <If condition={!searchKeywords && !loading}>
                  <Text style={{color: colors.color666}}>请输入关键词 </Text>
                </If>
              </View>
            )
          }}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity key={index}
                                style={{
                                  paddingVertical: 20,
                                  borderColor:
                                  colors.e5,
                                  borderBottomWidth: 0.5,
                                  backgroundColor: 'white',
                                }}
                                onPress={() => this.onClickItrm(item)}>
                <View>
                  <Text style={{color: colors.color333, fontSize: 16}}> {item.name} </Text>
                  <Text
                    style={{
                      color: colors.color666,
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

  renderMap() {
    let {shopmsg} = this.state;
    let lat = shopmsg.location.split(",")[1];
    let lng = shopmsg.location.split(",")[0];
    if (!lat || !lng) {
      return null
    }
    let address = shopmsg?.name ? shopmsg?.name : shopmsg?.address;
    return (
      <View style={{height: 300}}>
        <MapView
          mapType={MapType.Standard}
          style={StyleSheet.absoluteFill}
          minZoom={12}
          maxZoom={20}
          onPress={({nativeEvent}) => {
            this.setLatLng(nativeEvent.latitude, nativeEvent.longitude)
          }}
          onCameraIdle={({nativeEvent}) => {
            let northeast = nativeEvent?.latLngBounds?.northeast;
            let southwest = nativeEvent?.latLngBounds?.southwest;
            let {
              aLon,
              aLat
            } = tool.getCenterLonLat(northeast?.longitude, northeast?.latitude, southwest?.longitude, southwest?.latitude)
            if (aLon, aLat) {
              this.setLatLng(aLat, aLon)
            }
          }}
          initialCameraPosition={{
            target: {latitude: Number(lat), longitude: Number(lng)},
            zoom: 17
          }}>
          <Marker
            // draggable={true}
            position={{latitude: Number(lat), longitude: Number(lng)}}
            // onDragEnd={({nativeEvent}) => {
            //   this.setLatLng(nativeEvent.latitude, nativeEvent.longitude)
            // }}
          >
            <View style={{alignItems: 'center'}}>
              <View style={{
                zIndex: 999,
                backgroundColor: colors.white,
                marginBottom: 15,
                padding: 8,
                borderRadius: 6,
              }}>
                <Text style={{
                  color: colors.color333,
                  fontSize: 12,
                }}>{tool.jbbsubstr(address, 5, '标注点')} </Text>
              </View>
              <Entypo name={'triangle-down'}
                      style={{color: colors.white, fontSize: 30, position: 'absolute', top: 21}}/>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png'}} style={{
                width: 23,
                height: 48,
              }}/>
            </View>
          </Marker>
        </MapView>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchShop);
