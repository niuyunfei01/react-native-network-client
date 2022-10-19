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
  constructor(props) {
    super(props);
    let {delivery_id} = this.props.route.params;
    if (!delivery_id) {
      ToastLong("参数错误");
      this.props.navigation.goBack()
      return;
    }
    this.state = {
      shops: [],
      delivery_id,
      distance_destination: 0,
      distance_order: 0,
      distance_store: 0,
      track_destination: [],
      track_horseman: [],
      track_list: [],
      track_store: [],
      msg: '',
      zoom: 13,
    }
    this.fetchData()
  }

  fetchData = () => {
    let {delivery_id} = this.state;
    const accessToken = this.props.global.accessToken
    let api = `/api/get_track/${delivery_id}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      let msg = ''
      if (res.distance_store > 0 || res.distance_destination > 0) {
        msg = res.distance_store > 0 ? "距离门店地址：" + res.distance_store + "米" : "距离收货地址：" + res.distance_destination + "米"
      }
      let zoom = res.distance_order > 0 && res.distance_order > 2000 ? 13 : 14;
      let list = [];
      let item = {};
      tool.objectMap(res.track_list, (itm, idx) => {
        item = {latitude: itm[1], longitude: itm[0]}
        list.push(item)
      })
      this.setState({
        distance_destination: res.distance_destination,
        distance_order: res.distance_order,
        distance_store: res.distance_store,
        track_destination: res.track_destination,
        track_horseman: res.track_horseman,
        track_list: list,
        track_store: res.track_store,
        msg,
        zoom,
      })
    }, () => {
      ToastLong("未查询到骑手轨迹");
      this.props.navigation.goBack()
    })

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
    let {zoom, track_store, track_destination, track_horseman, track_list, msg} = this.state;
    let track_store_lng = Number(track_store[0]);
    let track_store_lat = Number(track_store[1]);
    let track_destination_lng = Number(track_destination[0]);
    let track_destination_lat = Number(track_destination[1]);
    let track_horseman_lng = Number(track_horseman[0]);
    let track_horseman_lat = Number(track_horseman[1]);
    if (!track_store_lng || !track_destination_lng || !track_horseman_lng) {
      return null;
    }

    return (
      <MapView
        mapType={MapType.Navi}
        style={StyleSheet.absoluteFill}
        initialCameraPosition={{
          target: {latitude: track_horseman_lat, longitude: track_horseman_lng},
          zoom: zoom
        }}>

        <If condition={track_horseman_lat && track_horseman_lng}>
          <Marker
            zIndex={99}
            position={{latitude: track_horseman_lat, longitude: track_horseman_lng}}
          >
            <View style={{alignItems: 'center'}}>

              <If condition={msg !== ''}>
                <View style={{marginBottom: 30, alignItems: 'center'}}>
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
                    }}>{msg} </Text>
                  </View>
                  <Entypo name={'triangle-down'}
                          style={{color: colors.white, fontSize: 30, position: 'absolute', top: 20}}/>
                </View>
              </If>
              <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location_ship.png'}} style={{
                width: 30,
                height: 34,
              }}/>
            </View>
          </Marker>
        </If>
        <If condition={track_store_lat && track_store_lng}>
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
        <If condition={track_destination_lat && track_destination_lng}>
          <Marker
            zIndex={93}
            // centerOffset={{x: 1, y: 1}}
            position={{latitude: track_destination_lat, longitude: track_destination_lng}}
            icon={{
              uri: "https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png",
              width: 22,
              height: 42,
            }}
          />
        </If>
        <If condition={track_list}>
          <Polyline width={4} color={colors.warn_color} points={track_list}/>
        </If>

      </MapView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RiderTrajectory);
