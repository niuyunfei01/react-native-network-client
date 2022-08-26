import React, {Component} from "react";
import {bindActionCreators} from "redux";
import {InteractionManager, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

import {connect} from "react-redux";
import colors from "../../pubilc/styles/colors";
import {userCanChangeStore} from "../../reducers/mine/mineActions";
import tool from "../../pubilc/util/tool";
import {Button} from 'react-native-elements';
import pxToDp from "../../pubilc/util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import Config from "../../pubilc/common/config";
import {TextArea} from "../../weui";
import HttpUtils from "../../pubilc/util/http";
import {showError, showSuccess, ToastShort} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {userCanChangeStore},
      dispatch
    )
  };
}

class OrderReceivingInfo extends Component {
  constructor(props: Object) {
    super(props);
    let {accessToken} = this.props.global
    this.state = {
      accessToken: accessToken,
      loc_lng: '',
      loc_lat: '',
      address: '',
      name: '',
      mobile: '',
      mobile_suffix: '',
      coordinates: '',
      location: '',
      inputShow: false,
      smartText: '',
      street_block: '',
      id: '',
      type: ''
    };
    this.toSetLocation = this.toSetLocation.bind(this);

  }

  componentDidMount() {
    this.setState({
      name: this.props.route.params.addItem && this.props.route.params.addItem['name'],
      mobile: this.props.route.params.addItem && this.props.route.params.addItem['phone'],
      address: this.props.route.params.addItem && this.props.route.params.addItem['address'],
      street_block: this.props.route.params.addItem && this.props.route.params.addItem['address'],
      street_block_address: this.props.route.params.addItem && this.props.route.params.addItem['street_block'],
      loc_lat: this.props.route.params.addItem && this.props.route.params.addItem['lat'],
      loc_lng: this.props.route.params.addItem && this.props.route.params.addItem['lng'],
      id: this.props.route.params.addItem && this.props.route.params.addItem['id'],
      type: this.props.route.params.type && this.props.route.params.type,
      coordinates: this.props.route.params.addItem !== undefined && this.props.route.params.addItem['lng'] + ',' + this.props.route.params.addItem['lat'],
    })
  }

  UNSAFE_componentWillMount() {
  }


  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  timeOutBack(time) {
    let _this = this;
    setTimeout(() => {
      _this.props.navigation.goBack()
    }, time)
  }

  onCancel() {
    this.setState({searchKeywords: ''});
  }

  toSetLocation() {
    const {loc_lng, loc_lat, coordinates} = this.state
    let center = ""
    if (loc_lng && loc_lat) {
      center = coordinates
    }

    const params = {
      action: Config.LOC_PICKER,
      center: center,
      cityname: tool.store(this.props.global).city,
      loc_lat: tool.store(this.props.global).loc_lat,
      loc_lng: tool.store(this.props.global).loc_lng,
      isType: "orderSetting",
      onBack: resp => {
        let {name, address, location} = resp;
        let locate = name;
        let locate1 = address;
        let locationAll = location.split(',')
        this.setState({
          location_long: locate,
          location_lat: locate1,
          location: location,
          loc_lng: locationAll[0],
          loc_lat: locationAll[1],
          coordinates: resp.location
        });
      }
    };
    this.onPress(Config.ROUTE_SEARC_HSHOP, params);
  }

  updateAddressBook() {
    const {
      name,
      mobile,
      mobile_suffix,
      loc_lat,
      loc_lng,
      location_lat,
      location_long,
      street_block_address,
      id,
      type
    } = this.state
    const api = `/v1/new_api/address/updateAddress?access_token=${this.state.accessToken}`;
    let params = {}
    if (loc_lat === undefined || loc_lng === undefined || street_block_address === '') {
      return showError('请选择定位地址!')
    }
    if (type === 'edit') {
      params = {
        id: id,
        name: name,
        phone: mobile,
        lng: loc_lng,
        lat: loc_lat,
        ext: mobile_suffix,
        address: (location_lat !== undefined && location_long !== undefined) ? location_lat + location_long : this.state.address,
        street_block: street_block_address
      }
    } else {
      params = {
        name: name,
        phone: mobile,
        lng: loc_lng,
        lat: loc_lat,
        ext: mobile_suffix,
        address: location_lat + location_long,
        street_block: street_block_address
      }
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      showSuccess('保存成功, 即将返回')
      setTimeout(() => {
        this.props.navigation.goBack();
      }, 1000)
    })
  }

  intelligentIdentification() {
    const {smartText} = this.state
    const api = `/v1/new_api/orders/distinguish_delivery_string?access_token=${this.state.accessToken}`;
    HttpUtils.get.bind(this.props)(api, {
      copy_string: smartText
    }).then(res => {
      if (res.phone === '') {
        ToastShort('电话号识别失败！')
      } else if (res.name === '') {
        ToastShort('姓名识别失败！')
      } else if (res.address === '') {
        ToastShort('地址识别失败！')
      }
      this.setState({
        name: res.name,
        street_block_address: res.address,
        mobile: res.phone,
        smartText: ''
      })
    })
  }

  render() {
    const {location_long, location_lat, inputShow, address, street_block_address, type} = this.state
    return (
      <View style={{flex: 1}}>
        <ScrollView style={[styles.container, {flex: 1}]}>
          <View
            style={{backgroundColor: colors.white, width: '96%', marginLeft: '2%', borderRadius: 10, marginTop: 10}}>
            <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={this.toSetLocation}>
              <View style={{
                backgroundColor: '#FFB44B',
                width: 31,
                height: 31,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                margin: 15
              }}>
                <Text style={{color: colors.white, fontSize: 16}}>收</Text>
              </View>
              <If condition={type == 'add'}>
                <Text style={[styles.body_text, {flex: 1}]}>
                  {(location_long !== undefined && location_lat !== undefined)
                    ? `${location_long}(${location_lat})` : `请选择定位地址`}</Text>
              </If>
              <If condition={type == 'edit'}>
                <Text style={[styles.body_text, {flex: 1}]}>
                  {((location_long !== undefined && location_lat !== undefined) && street_block_address !== undefined)
                    ? `${location_long}(${location_lat})` : `${address}(${street_block_address})`}</Text>
              </If>
              <Entypo name='chevron-thin-right'
                      style={{fontSize: 16, fontWeight: "bold", color: colors.color999, marginRight: 20}}/>
            </TouchableOpacity>
          </View>
          <View style={{backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10, marginTop: 10}}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomColor: colors.colorEEE,
              borderBottomWidth: 1
            }}>
              <Text style={{color: colors.color333, marginLeft: 18, marginRight: 10}}>详细地址：</Text>
              <TextInput placeholder="楼号、单元、门牌号等"
                         underlineColorAndroid="transparent"
                         style={{height: 50, color: '#666', width: '70%'}}
                         placeholderTextColor={'#999'}
                         value={this.state.street_block_address}
                         onChangeText={value => {
                           this.setState({street_block_address: value});
                         }}
              />
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomColor: colors.colorEEE,
              borderBottomWidth: 1
            }}>
              <Text style={{color: colors.color333, marginLeft: 18, marginRight: 20}}>收货人：</Text>
              <TextInput placeholder="请输入收货人姓名"
                         underlineColorAndroid="transparent"
                         style={{height: 50, color: '#666', width: '80%'}}
                         placeholderTextColor={'#999'}
                         value={this.state.name}
                         onChangeText={value => {
                           this.setState({name: value});
                         }}
              />
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              borderBottomColor: colors.colorEEE,
              borderBottomWidth: 1
            }}>
              <Text style={{color: colors.color333, marginLeft: 18, marginRight: 20}}>手机号：</Text>
              <TextInput placeholder="请输入收货人手机号"
                         maxLength={11}
                         underlineColorAndroid="transparent"
                         style={{height: 50, color: '#666', flex: 3}}
                         placeholderTextColor={'#999'}
                         keyboardType={'numeric'}
                         value={this.state.mobile}
                         onChangeText={value => {
                           const newText = value.replace(/[^\d.]/g, '0');
                           this.setState({mobile: newText});
                         }}
              />
              <TextInput placeholder="分机号(选填)"
                         maxLength={4}
                         underlineColorAndroid="transparent"
                         style={{
                           height: 50,
                           borderLeftColor: '#ddd',
                           borderLeftWidth: 1,
                           paddingLeft: 20,
                           color: '#666',
                           flex: 2,
                           paddingStart: -10
                         }}
                         placeholderTextColor={'#999'}
                         keyboardType={'numeric'}
                         value={this.state.mobile_suffix}
                         onChangeText={value => {
                           const newText = value.replace(/[^\d]+/, '');
                           this.setState({mobile_suffix: newText});
                         }
                         }
                         textAlign='center'
              />
            </View>
            <View style={{flexDirection: "column", padding: 15, position: "relative"}}>
              <TouchableOpacity style={this.state.inputShow ? styles.inputActivity : styles.inputNormal}
                                onPress={() => {
                                  this.setState({
                                    inputShow: !inputShow
                                  })
                                }}>
                <Text style={{color: colors.white, fontSize: 12}}>智能填写</Text>
              </TouchableOpacity>
              {
                this.state.inputShow &&
                <TextArea
                  maxLength={240}
                  style={{
                    fontSize: 12,
                    paddingLeft: 10,
                    borderRadius: 5,
                    backgroundColor: '#EEEEEE',
                    marginTop: 10,
                    marginBottom: 20
                  }}
                  placeholder="复制粘贴收货人信息至此,点击智能填写,系统会自动识别并自动填入(若不按指定格式填写,识别将会不精确)。如: 张三 北京市东城区景山前街4号 16666666666"
                  placeholderTextColor={'#bbb'}
                  onChange={value => {
                    this.setState({smartText: value});
                  }}
                  value={this.state.smartText}
                  underlineColorAndroid={"transparent"}
                />
              }
              {
                this.state.inputShow &&
                <TouchableOpacity style={{
                  backgroundColor: colors.main_color,
                  borderRadius: 10,
                  padding: 10,
                  width: 100,
                  marginTop: 10,
                  position: "absolute",
                  right: 70,
                  top: 125,
                  justifyContent: "center",
                  alignItems: "center"
                }} onPress={() => {
                  this.intelligentIdentification()
                }}>
                  <Text style={{color: colors.white, fontSize: 12}}>智能识别</Text>
                </TouchableOpacity>}
            </View>
          </View>
        </ScrollView>
        <View style={{backgroundColor: colors.white, padding: pxToDp(30)}}>
          <Button title={'保存'}
                  onPress={() => {
                    this.updateAddressBook()
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2"},
  inputActivity: {backgroundColor: colors.main_color, borderRadius: 10, padding: 5, width: 60},
  inputNormal: {backgroundColor: '#A7A7A7', borderRadius: 10, padding: 5, width: 60},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderReceivingInfo);
