import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {Image, StyleSheet, Text, View} from 'react-native'
import colors from "../../pubilc/styles/colors";
import {MapType, MapView, Marker, Polyline} from "react-native-amap3d";
import HttpUtils from "../../pubilc/util/http";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import tool from "../../pubilc/util/tool";
import Entypo from "react-native-vector-icons/Entypo";
import * as PropTypes from "prop-types";
import numeral from "numeral";
import FastImage from "react-native-fast-image";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class RiderTrajectory extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    let {delivery_id, order_id} = this.props.route.params;
    if (!order_id) {
      ToastLong("参数错误");
      this.props.navigation.goBack()
      return;
    }
    this.state = {
      shops: [],
      delivery_id: delivery_id ? delivery_id : 0,
      order_id,
      distance_destination: 0,
      distance_order: 0,
      distance_store: 0,
      track_destination: [],
      track_horseman: [],
      track_list: [],
      track_store: [],
      zoom: 13,
    }
    this.fetchData()
  }

  fetchData = () => {
    let {delivery_id, order_id} = this.state;
    const accessToken = this.props.global.accessToken
    let api = `/v4/wsb_order/get_order_track/${order_id}/${delivery_id}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      let zoom = res.distance_order > 0 && res.distance_order > 2000 ? 13 : 14;
      if (res?.distance_order > 4000) {
        zoom = 12
      }
      let list = [];
      let item = {};
      if (tool.length(res.track_list) > 0) {
        tool.objectMap(res.track_list, (itm, idx) => {
          item = {latitude: itm[1], longitude: itm[0]}
          list.push(item)
        })
      }
      this.setState({
        distance_destination: res.distance_destination,
        distance_order: res.distance_order,
        distance_store: res.distance_store,
        track_destination: res?.pos_destination,
        track_horseman: res?.pos_rider,
        track_list: list,
        track_store: res?.pos_store,
        zoom,
      })
    }, () => {
      ToastLong("操作失败，请刷新后再试");
      this.props.navigation.goBack()
    })
  }

  filterDistance = (val = 0) => {
    let flag = val / 1000
    if (flag >= 1) {
      return `${numeral(val / 1000).format('0.0')}公里`
    } else {
      return `${val}米`
    }
  }

  render() {
    return (
      <View style={{
        flex: 1,
      }}>
        {this.renderMap()}
      </View>
    )
  }

  renderMap() {
    let {
      zoom,
      track_store,
      track_destination,
      track_horseman,
      track_list,
      distance_order,
      distance_store,
      distance_destination
    } = this.state;
    let track_store_lng = Number(track_store[0]);
    let track_store_lat = Number(track_store[1]);
    let track_destination_lng = Number(track_destination[0]);
    let track_destination_lat = Number(track_destination[1]);
    let track_horseman_lng = Number(track_horseman[0]);
    let track_horseman_lat = Number(track_horseman[1]);
    if (!track_store_lng || !track_destination_lng) {
      return null;
    }
    let {
      aLon,
      aLat
    } = tool.getCenterLonLat(distance_destination > 0 ? track_horseman_lng : track_store_lng, distance_destination > 0 ? track_horseman_lat : track_store_lat, track_destination_lng, track_destination_lat)
    return (
      <MapView
        mapType={MapType.Standard}
        style={StyleSheet.absoluteFill}
        initialCameraPosition={{
          target: {latitude: aLat, longitude: aLon},
          zoom: zoom
        }}>

        {/*骑手定位*/}
        <If condition={track_horseman_lat && track_horseman_lng}>
          <Marker
            zIndex={99}
            position={{latitude: track_horseman_lat, longitude: track_horseman_lng}}
          >
            <View style={{alignItems: 'center'}}>

              <View style={{alignItems: 'center'}}>
                <View style={{
                  zIndex: 999,
                  backgroundColor: colors.white,
                  marginBottom: 15,
                  padding: 8,
                  borderRadius: 6,
                }}>
                  <If condition={distance_store > 0}>
                    <Text style={{
                      color: colors.color333,
                      fontSize: 12,
                    }}>骑手距离商家{this.filterDistance(distance_store)} </Text>
                  </If>
                  <If condition={distance_destination > 0}>
                    <Text style={{
                      color: colors.color333,
                      fontSize: 12,
                    }}>骑手距离顾客{this.filterDistance(distance_destination)} </Text>
                  </If>
                </View>
                <Entypo name={'triangle-down'}
                        style={{color: colors.white, fontSize: 30, position: 'absolute', top: 20}}/>
              </View>

              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location_ship.png'}} style={{
                width: 30,
                height: 34,
              }}/>
            </View>
          </Marker>
        </If>

        {/*商家定位*/}
        <If condition={distance_destination <= 0 && track_store_lat && track_store_lng}>
          <Marker
            zIndex={91}
            position={{latitude: track_store_lat, longitude: track_store_lng}}
            icon={{
              uri: "https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location_store.png",
              width: 30,
              height: 34,
            }}
          />
        </If>

        {/*顾客定位*/}
        <If
          condition={distance_destination > 0 && track_destination_lat && track_destination_lng && distance_store <= 0}>
          <Marker
            zIndex={93}
            position={{latitude: track_destination_lat, longitude: track_destination_lng}}
            icon={{
              uri: "https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png",
              width: 22,
              height: 42,
            }}
          />
        </If>

        {/*顾客定位*/}
        <If
          condition={distance_store <= 0 && distance_destination <= 0 && track_destination_lat && track_destination_lng}>
          <Marker
            zIndex={93}
            position={{latitude: track_destination_lat, longitude: track_destination_lng}}
          >
            <View style={{alignItems: 'center'}}>
              <View style={{alignItems: 'center'}}>
                <View style={{
                  zIndex: 999,
                  backgroundColor: colors.white,
                  marginBottom: 15,
                  padding: 8,
                  borderRadius: 6,
                }}>
                  <Text style={{color: colors.color333, fontSize: 12}}>
                    距门店{this.filterDistance(distance_order)}
                  </Text>
                </View>
                <Entypo name={'triangle-down'}
                        style={{color: colors.white, fontSize: 30, position: 'absolute', top: 20}}/>
              </View>

              <FastImage source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png'}}
                         style={{width: 22, height: 42}}
                         resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </Marker>
        </If>
        <If condition={track_list}>
          <Polyline width={4} color={colors.warn_color} points={track_list}/>
        </If>

      </MapView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RiderTrajectory);
