import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {FlatList, Image, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import tool from "../util/tool";
import Config from "../common/config";
import colors from "../styles/colors";
import {ToastLong, ToastShort} from "../util/ToastUtils";
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";
import {SvgXml} from "react-native-svg";
import {cross_circle_icon, empty_order, this_down} from "../../svg/svg";

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
    let {
      center,
      keywords,
      city_name,
      placeholder_text = '请搜索门店位置信息',
      show_select_city = true
    } = this.props.route.params;
    let map = {};

    let isMap = false;
    let show_seach_msg = true;
    let local_city = '北京';

    let {store_info = {}} = this.props.global;
    if (tool.length(store_info) > 0) {
      local_city = store_info?.city
      map.location = store_info?.loc_lng + "," + store_info?.loc_lat;
    }

    if (keywords) {
      map.address = keywords
      show_seach_msg = false
    }

    if (tool.length(city_name) > 0) {
      local_city = city_name;
    }

    if (tool.length(center) > 0) {
      map.location = center
      isMap = true;
    }

    this.state = {
      loading: false,
      show_select_city: show_select_city,
      show_seach_msg: show_seach_msg,
      shops: [],
      ret_list: [],
      keyword: keywords,
      isMap: isMap, //控制显示搜索还是展示地图
      is_default: isMap,
      city_name: local_city,
      location: map,
      placeholderText: placeholder_text,
      isCanLoadMore: false,
      is_add: true,
      page: 1,
      pagesize: 10
    }

    if (tool.length(center) <= 0 && keywords) {
      this.search()
    }
  }

  search = (isMap = false) => {   //submit 事件 (点击键盘的 enter)
    let {keyword, city_name} = this.state;
    this.setState({loading: true})
    tool.debounces(() => {
      if (keyword) {
        let header = 'https://restapi.amap.com/v3/assistant/inputtips?parameters?'
        const params = {
          keywords: keyword,
          key: '85e66c49898d2118cc7805f484243909',
          city: city_name,
          citylimit: true
        }
        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )
        fetch(header).then(response => response.json()).then(data => {
          if (data.status === "1") {
            this.setState({
              shops: data?.tips,
              ret_list: data?.tips,
              loading: false,
              isMap: isMap,
            })
          }
        });
      } else {
        ToastLong("请输入门店位置信息")
      }
    }, 1000)
  }

  searchLngLat = () => {   //submit 事件 (点击键盘的 enter)
    let {location, keyword, city_name} = this.state;
    this.setState({loading: true})
    tool.debounces(() => {
      if (location?.location) {
        let header = 'https://restapi.amap.com/v5/place/around?'
        const params = {
          region: city_name,
          location: location?.location,
          keywords: keyword,
          radius: 100,
          key: '85e66c49898d2118cc7805f484243909',
          types: '120100|120200|120202|120203|120300|120301|120302|120303|120304|120201|190108|190400|190403|991401|150500|060100|100100|150501|991000|991001|991001|010000|020000|030000|040000|050000|060000|070000|080000|090000|100000|110000|120000|130000|140000|150000|160000|170000|180000|190000|200000|',
        }

        Object.keys(params).forEach(key => {
            header += '&' + key + '=' + params[key]
          }
        )

        fetch(header).then(response => response.json()).then(data => {
          if (data.status === "1" && tool.length(data?.pois) > 0) {
            this.setState({
              ret_list: data?.pois,
              loading: false,
              keyword: ''
            })
          } else {
            this.search(true)
            this.setState({
              loading: false,
              keyword: ''
            })
          }
        });
      }
    }, 1000)
  }


  setLatLng = (latitude, longitude) => {
    let {location} = this.state;
    location.location = longitude + ',' + latitude
    this.setState({
      is_default: false,
      location
    }, () => {
      this.searchLngLat()
    })
  }

  goSelectCity = () => {
    this.props.navigation.navigate(
      Config.ROUTE_SELECT_CITY_LIST,
      {
        city: this.state.city_name,
        callback: (selectCity) => {
          this.setState({
            city_name: selectCity.name,
          })
        }
      }
    )
  }

  onCancel = () => { //点击取消
    this.setState({keyword: '', shops: []});
  }

  onChange = (keyword) => {
    let show_seach_msg = tool.length(keyword) <= 0
    this.setState({keyword, show_seach_msg}, () => {
      this.search()
    });
  }

  render() {
    let {shops, ret_list, isMap} = this.state;
    return (
      <View style={{
        flex: 1,
      }}>
        {this.renderHeader()}
        <If condition={!isMap}>
          <View style={{paddingHorizontal: 12, paddingVertical: 10, flex: 1,}}>
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
    let {show_select_city, show_seach_msg, city_name, keyword, placeholderText} = this.state
    return (
      <View style={{
        backgroundColor: colors.white,
        marginBottom: show_seach_msg ? 30 : 0,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.f5,
          height: 32,
          borderRadius: 16,
          flex: 1,
          paddingLeft: show_select_city ? 0 : 10,
        }}>
          <If condition={show_select_city}>
            <TouchableOpacity
              style={{
                width: 66,
                borderRightWidth: 1,
                borderRightColor: colors.colorDDD,
                flexDirection: 'row',
                justifyContent: 'center'
              }}
              onPress={() => this.goSelectCity()}
            >
              <Text style={{textAlign: 'center', fontSize: 14, color: colors.color333}}>
                {tool.jbbsubstr(city_name, 3)}
              </Text>
              <SvgXml xml={this_down()}/>
            </TouchableOpacity>
          </If>
          <TextInput
            underlineColorAndroid='transparent'
            placeholder={placeholderText}
            onChangeText={(v) => this.onChange(v)}
            maxLength={11}
            value={keyword}
            placeholderTextColor={colors.color999}
            style={{
              paddingLeft: 10,
              fontSize: 14,
              color: colors.color333,
              flex: 1,
            }}
          />
          <If condition={tool.length(keyword) > 0}>
            <SvgXml onPress={() => {
              this.setState({keyword: '', show_seach_msg: true});
            }} xml={cross_circle_icon()}
                    style={{position: 'absolute', top: 6, right: 10, color: colors.color999}}/>
          </If>
        </View>

        <Text onPress={() => this.props.navigation.goBack()}
              style={{textAlign: 'right', width: 40, fontSize: 14, color: colors.color333}}>取消</Text>

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

  onClickItem = (item) => {
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
          location: item
        })
      }
    })
  }

  onEndReached = () => {
    let {isCanLoadMore, is_add} = this.state;
    if (isCanLoadMore) {
      this.setState({isCanLoadMore: false}, () => {
        if (is_add) {
          this.search();
        } else {
          ToastShort('已经到底部了')
        }
      })
    }
  }

  onMomentumScrollBegin = () => {
    this.setState({isCanLoadMore: true})
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }
  _getItemLayout = (data, index) => {
    return {length: 80, offset: 80 * index, index}
  }
  _keyExtractor = (item) => {
    return item?.id.toString();
  }

  onRefresh = () => {
    this.search()
  }

  renderList(list) {
    let {loading} = this.state;
    return (
      <View style={{
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        flexDirection: "column",
        flex: 1,
      }}>
        <FlatList
          data={list}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          legacyImplementation={false}
          directionalLockEnabled={true}
          refreshing={loading}
          initialNumToRender={5}
          onEndReachedThreshold={0.3}
          onRefresh={this.onRefresh}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListEmptyComponent={this.renderNoData()}
          renderItem={({item, index}) => this.renderItem(item, index)}
        />
      </View>
    )
  }

  renderItem = (item, index) => {
    return (
      <TouchableOpacity key={index}
                        style={{
                          paddingVertical: 20,
                          borderColor: colors.e5,
                          borderBottomWidth: 0.5,
                          backgroundColor: 'white',
                        }}
                        onPress={() => this.onClickItem(item)}>
        <Text style={{color: colors.color333, fontSize: 16}}> {item?.name}  </Text>
        <Text style={{
          color: colors.color999,
          fontSize: 12,
          marginTop: 4
        }}> {tool.jbbsubstr(item?.address, 25)} </Text>
      </TouchableOpacity>
    )
  }

  renderMap() {
    let {location} = this.state;
    let lat = location.location.split(",")[1];
    let lng = location.location.split(",")[0];
    if (!lat || !lng) {
      return null
    }
    let address = location?.name ? location?.name : location?.address;
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
            if (aLon && aLat) {
              this.setLatLng(aLat, aLon)
            }
          }}
          initialCameraPosition={{
            target: {latitude: Number(lat), longitude: Number(lng)},
            zoom: 17
          }}>
          <Marker
            position={{latitude: Number(lat), longitude: Number(lng)}}
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
                }}>{tool.jbbsubstr(address, 5, 0, '标注点')} </Text>
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


  renderNoData = () => {
    let {keyword, loading} = this.state;
    return (
      <View style={styles.noOrderContent}>
        <SvgXml style={{marginBottom: 10}} xml={empty_order()}/>

        <If condition={tool.length(keyword) > 0 && !loading}>
          <Text style={styles.noOrderDesc}> 找不到该地址 </Text>
          <Text style={styles.noOrderDesc}> 很抱歉，暂未找到您搜索的地址 </Text>
          <Text style={styles.noOrderDesc}> 建议扩大关键词范围进行搜索 </Text>
        </If>

        <If condition={tool.length(keyword) <= 0 && !loading}>
          <Text style={styles.noOrderDesc}> 建议扩大关键词范围进行搜索 </Text>
        </If>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 86,
    paddingBottom: 286,
  },
  noOrderDesc: {flex: 1, fontSize: 15, color: colors.color999, lineHeight: 21},
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchShop);
