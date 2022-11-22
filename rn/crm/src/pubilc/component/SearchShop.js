import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {
  ActivityIndicator,
  FlatList,
  Image,
  InteractionManager, Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import tool from "../util/tool";
import Config from "../common/config";
import colors from "../styles/colors";
import {ToastLong, ToastShort} from "../util/ToastUtils";
import {MapType, MapView, Marker} from "react-native-amap3d";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";
import {SvgXml} from "react-native-svg";
import {cross_circle_icon, empty_order, this_down} from "../../svg/svg";
import HttpUtils from "../util/http";

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
    let show_map = false;
    let show_seach_msg = true;
    let local_city = '北京';

    let {store_info = {}} = this.props.global;

    if (tool.length(store_info) > 0) {
      local_city = store_info?.city
      map.location = store_info?.loc_lng + "," + store_info?.loc_lat;
    }

    if (tool.length(keywords) > 0) {
      map.address = keywords
      show_seach_msg = false
    }

    if (tool.length(city_name) > 0) {
      local_city = city_name;
    }

    if (tool.length(center) > 0) {
      map.location = center
      if (tool.length(keywords) > 0) {
        show_map = true;
      }
    }

    this.state = {
      loading: false,
      show_select_city: show_select_city,
      show_seach_msg: show_seach_msg,
      shops: [],
      ret_list: [],
      keyword: keywords,
      show_map: show_map, //控制显示搜索还是展示地图
      is_default: show_map,
      city_name: local_city,
      location: map,
      placeholderText: placeholder_text,
      is_can_load_more: false,
      show_placeholder: true,
      is_add: true,
      page: 1,
      page_size: 20,
    }

    if (tool.length(center) > 0 && tool.length(keywords) <= 0) {
      this.searchLngLat()
    }
  }

  onRefresh = () => {
    this.setState({page: 1, is_add: true},
      () => {
        if (this.state.show_map) {
          this.searchLngLat()
        } else {
          this.search()
        }
      })
  }

  search = () => {   //submit 事件 (点击键盘的 enter)
    let {keyword, city_name, page, page_size, shops, ret_list, is_add} = this.state;
    if (!is_add) {
      return;
    }
    this.setState({loading: true, show_map: false})
    tool.debounces(() => {
      if (tool.length(keyword) > 0) {
        const api = `v4/wsb_map/getKeywordTips`
        let params = {
          keyword: keyword,
          region: city_name,
          region_fix: 1,
          policy: 1,
          page_index: page,
          page_size
        }
        HttpUtils.get.bind(this.props)(api, params).then((res) => {
          this.setState({
            page: page + 1,
            shops: page === 1 ? res : shops.concat(res),
            ret_list: page === 1 ? res : ret_list.concat(res),
            loading: false,
            is_add: tool.length(res) >= page_size
          })
        })
      } else {
        ToastLong("请输入门店位置信息")
      }
    })
  }

  setLatLng = (latitude, longitude) => {
    let {location} = this.state;
    location.location = longitude + ',' + latitude
    this.setState({
      is_default: false,
      page: 1,
      is_add: true,
      location
    }, () => {
      this.searchLngLat()
    })
  }

  searchLngLat = () => {
    let {location, page, page_size, is_add, shops, ret_list} = this.state;
    if (!is_add) {
      return;
    }
    this.setState({loading: true})
    tool.debounces(() => {
      const api = `/v4/wsb_map/getNearbyLocation`
      let params = {
        location: location?.location,
        page,
        page_size
      }
      HttpUtils.get.bind(this.props)(api, params).then((res) => {
        Keyboard.dismiss()
        this.setState({
          keyword: '',
          page: page + 1,
          shops: page === 1 ? res : shops.concat(res),
          ret_list: page === 1 ? res : ret_list.concat(res),
          loading: false,
          is_add: tool.length(res) >= page_size,
          show_placeholder: true
        })
      })

    }, 300)
  }

  goSelectCity = () => {
    let {show_select_city, city_name} = this.state;
    if (!show_select_city) {
      return;
    }
    this.props.navigation.navigate(
      Config.ROUTE_SELECT_CITY_LIST,
      {
        city: city_name,
        callback: (item) => {
          this.setState({
            city_name: item.name,
          })
        }
      }
    )
  }

  onChange = (keyword) => {
    let show_seach_msg = tool.length(keyword) <= 0
    this.setState({keyword, show_seach_msg, is_add: true, loading: true, page: 1}, () => {
      this.search()
    });
  }

  render() {
    let {shops, ret_list, show_map} = this.state;
    return (
      <View style={{flex: 1}}>

        {this.renderHeader()}
        <If condition={!show_map}>
          <View style={{paddingHorizontal: 12, paddingVertical: 10, flex: 1,}}>
            {this.renderList(shops)}
          </View>
        </If>
        <If condition={show_map}>
          {this.renderMap()}
          {this.renderList(ret_list)}
        </If>
      </View>
    )
  }

  onClickItem = (item) => {
    let {show_map, is_default} = this.state;
    InteractionManager.runAfterInteractions(() => {
      if (show_map) {
        if (!is_default) {
          this.props.route.params.onBack(item);
        }
        this.props.navigation.goBack();
      } else {
        this.setState({
          show_map: true,
          location: item
        })
      }
    })
  }

  renderHeader = () => {
    let {show_seach_msg, city_name, keyword, placeholderText, show_placeholder} = this.state
    return (
      <View style={{
        backgroundColor: colors.white,
        // marginBottom: show_seach_msg ? 30 : 0,
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
          paddingLeft: 10,
        }}>
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
          <TextInput
            underlineColorAndroid='transparent'
            placeholder={placeholderText}
            onChangeText={(v) => this.onChange(v)}
            value={keyword}
            placeholderTextColor={show_placeholder ? colors.color999 : colors.f5}
            onBlur={() => {
              this.setState({
                show_placeholder: true
              })
            }}
            onFocus={() => {
              this.setState({
                show_placeholder: false
              })
            }}
            style={{
              height: 40,
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

        {/*<If condition={show_seach_msg}>*/}
        {/*  <TouchableOpacity style={{position: 'absolute', top: 22, left: 80}}>*/}
        {/*    <Entypo name={'triangle-up'}*/}
        {/*            style={{color: "rgba(0,0,0,0.7)", fontSize: 24, marginLeft: 10}}/>*/}
        {/*    <View style={{*/}
        {/*      backgroundColor: 'rgba(0,0,0,0.7)',*/}
        {/*      borderRadius: 4,*/}
        {/*      height: 36,*/}
        {/*      width: 280,*/}
        {/*      position: 'absolute',*/}
        {/*      top: 17.4,*/}
        {/*      left: 3,*/}
        {/*      alignItems: 'center',*/}
        {/*      justifyContent: 'center'*/}
        {/*    }}>*/}
        {/*      <Text style={{fontSize: 12, color: colors.f7, lineHeight: 17}}>*/}
        {/*        请输入准确的地址信息进行搜索，如小区，大厦等*/}
        {/*      </Text>*/}
        {/*    </View>*/}
        {/*  </TouchableOpacity>*/}
        {/*</If>*/}
      </View>
    )
  }


  onEndReached = () => {
    let {is_can_load_more, is_add, show_map} = this.state;
    if (is_can_load_more) {
      this.setState({is_can_load_more: false}, () => {
        if (is_add) {
          if (show_map) {
            this.searchLngLat();
          } else {
            this.search();
          }
        } else {
          ToastShort('已经到底部了')
        }
      })
    }
  }

  onMomentumScrollBegin = () => {
    this.setState({is_can_load_more: true})
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
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
          keyExtractor={(item, index) => `${index}`}
          shouldItemUpdate={this._shouldItemUpdate}
          ListEmptyComponent={this.renderNoData()}
          ListFooterComponent={this.renderBottomView()}
          renderItem={({item, index}) => this.renderItem(item, index)}
        />
      </View>
    )
  }

  renderBottomView = () => {
    let {is_add, ret_list, loading} = this.state;

    if (loading && tool.length(ret_list) > 10) {
      return (
        <View style={{
          paddingVertical: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center'
        }}>
          <ActivityIndicator color={colors.color666} size={20}/>
          <Text style={{fontSize: 14, color: colors.color999}}> 加载中… </Text>
        </View>
      )
    }

    if (is_add || tool.length(ret_list) < 10) {
      return <View/>
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10}}>
        <Text style={{fontSize: 14, color: colors.color999}}> 已经到底了～ </Text>
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
                <Text style={{color: colors.color333, fontSize: 12}}>
                  {tool.jbbsubstr(address, 5, 0, '标注点')}
                </Text>
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
    if (loading) {
      return null;
    }
    return (
      <View style={styles.noOrderContent}>
        <SvgXml style={{marginBottom: 10}} xml={empty_order()}/>

        <If condition={tool.length(keyword) > 0}>
          <Text style={styles.noOrderDesc}> 找不到该地址 </Text>
          <Text style={styles.noOrderDesc}> 很抱歉，暂未找到您搜索的地址 </Text>
          <Text style={styles.noOrderDesc}> 建议扩大关键词范围进行搜索 </Text>
        </If>

        <If condition={tool.length(keyword) <= 0}>
          <Text style={styles.noOrderDesc}> 请输入准确的地址信息进行搜索 </Text>
          <Text style={styles.noOrderDesc}> 如小区，大厦等 </Text>
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
