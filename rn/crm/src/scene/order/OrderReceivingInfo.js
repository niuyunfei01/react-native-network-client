import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {InteractionManager, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

import colors from "../../pubilc/styles/colors";
import {Button} from 'react-native-elements';
import Config from "../../pubilc/common/config";
import HttpUtils from "../../pubilc/util/http";
import tool from "../../pubilc/util/tool";
import {hideModal, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import * as globalActions from "../../reducers/global/globalActions";
import PropTypes from "prop-types";
import JbbModal from "../../pubilc/component/JbbModal";
import {TextArea} from "../../weui";
import {SvgXml} from "react-native-svg";
import {cross_icon} from "../../svg/svg";

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        ...globalActions
      },
      dispatch
    )
  };
}

class OrderReceivingInfo extends Component {

  static propTypes = {
    route: PropTypes.object,
  };

  constructor(props: Object) {
    super(props);
    let {accessToken} = this.props.global
    let {type} = this.props.route.params
    this.state = {
      accessToken: accessToken,
      type: type,
      id: '',
      loc_lng: '',
      loc_lat: '',
      name: '',
      mobile: '',
      address: '',
      street_block: '',
      mobile_suffix: '',
      showModal: false,
      show_smart_input: false,
      show_smart_modal: false,
      smartText: '',
    };
  }

  setHeader = () => {
    const {navigation} = this.props
    let {type} = this.state;
    navigation.setOptions({
      headerTitle: (type === 'add' ? '添加' : '编辑') + '收件人',
      headerRight: () => (
        <If condition={type !== 'add'}>
          <TouchableOpacity onPress={() => {
            this.setState({
              showModal: true
            })
          }} style={{marginHorizontal: 10}}>
            <Text style={{fontSize: 16, color: colors.color333}}>
              删除
            </Text>
          </TouchableOpacity>
        </If>),
    });
  }

  componentDidMount() {
    this.setHeader()
    if (this.props.route.params?.info) {
      this.setAddressInfo()
    }
  }

  setAddressInfo = () => {
    let {info} = this.props.route.params
    this.setState({
      id: info && info?.id,
      name: info && info?.name,
      mobile: info && info?.phone,
      mobile_suffix: info && info?.ext,
      loc_lat: info && info?.lat,
      loc_lng: info && info?.lng,
      address: info && info?.address,
      street_block: info && info?.street_block,
    })
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  goSelectAddress = () => {
    let {address, loc_lng, loc_lat} = this.state;
    let center = ""
    if (loc_lng && loc_lat) {
      center = loc_lng + ',' + loc_lat
    }
    const params = {
      center: center,
      keywords: address,
      show_select_city: false,
      placeholder_text: '请在此输入收件人地址',
      onBack: (res) => {
        this.setAddress.bind(this)(res)
      },
    };
    this.props.navigation.navigate(Config.ROUTE_SEARCH_SHOP, params);
  }

  setAddress = (res) => {
    let Lng = (res.location).split(',')[0];
    let lat = (res.location).split(',')[1];
    let states = {
      loc_lng: Lng,
      loc_lat: lat,
    }
    if (res?.name) {
      states.address = res.name;
    }
    if (res?.address) {
      states.street_block = res?.address;
    }
    this.setState({...states})
  }

  saveInfo() {
    const {
      id,
      name,
      mobile,
      mobile_suffix,
      loc_lat,
      loc_lng,
      address,
      street_block,
      type,
      accessToken,
    } = this.state

    if (tool.length(loc_lng) <= 0 || tool.length(loc_lat) <= 0 || address === '') {
      return ToastShort('请选择定位地址!', 0)
    }

    if (tool.length(mobile) !== 11) {
      return ToastShort('请输入正确的手机号');
    }

    if (tool.length(name) <= 0) {
      return ToastShort('请输入收件人姓名');
    }

    let params = {
      name: name,
      phone: mobile,
      lng: loc_lng,
      lat: loc_lat,
      ext: mobile_suffix,
      address: address,
      street_block: street_block
    }
    if (type === 'edit') {
      params.id = id;
    }
    const api = `/v1/new_api/address/updateAddress?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api, params).then(() => {
      ToastShort('保存成功, 即将返回', 0)
      setTimeout(() => {
        this.props.navigation.goBack();
      }, 1000)
    })
  }

  deleteAddressItem = () => {
    this.closeModal()
    let {id, accessToken} = this.state
    const api = `/v1/new_api/address/deleteAddress?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api, {id: id}).then(() => {
      ToastShort('已删除', 0)
      setTimeout(() => {
        this.props.navigation.goBack();
      }, 1000)
    })
  }


  intelligentIdentification = () => {
    const {smartText, accessToken} = this.state
    if (tool.length(smartText) <= 0) {
      return ToastShort('请从粘贴板粘贴地址', 0);
    }
    showModal('加载中...')
    const api = `/v1/new_api/orders/distinguish_delivery_string?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(api, {
      copy_string: smartText
    }).then(res => {
      this.setState({
        smartText: ''
      })
      hideModal()
      if (res.phone === '') {
        return ToastShort('电话号识别失败！')
      } else if (res.name === '') {
        return ToastShort('姓名识别失败！')
      } else if (res.address === '') {
        return ToastShort('地址识别失败！')
      }
      this.setState({
        name: res.name,
        address: res.address,
        mobile: res.phone,
      })
      const params = {
        show_select_city: false,
        keywords: res.address,
        placeholder_text: '请在此输入收件人地址',
        onBack: (res) => {
          this.setAddress.bind(this)(res)
          this.setState({show_smart_modal: true,})
        },
      };
      this.props.navigation.navigate(Config.ROUTE_SEARCH_SHOP, params);
    })
  }


  cancelData = () => {
    this.setState({
      name: '',
      mobile: '',
      mobile_suffix: '',
      address: '',
      street_block: '',
      loc_lng: '',
      loc_lat: '',
    })
  }


  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={[styles.container, {flex: 1}]}>
          {this.renderUserFrom()}
        </ScrollView>
        {this.renderBtn()}
        {this.renderModal()}
        {this.renderSmartModal()}
      </View>
    );
  }

  renderUserFrom = () => {
    let {mobile, mobile_suffix, address, street_block, smartText, name, type, show_smart_input} = this.state;
    return (
      <View style={{
        borderRadius: 4,
        backgroundColor: colors.white,
        padding: 12,
        marginTop: 10,
      }}>
        <TouchableOpacity onPress={this.goSelectAddress} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: 'bold', fontSize: 14, color: colors.color333}}>地址 </Text>
          <View style={{
            flex: 1,
          }}>
            <Text style={{
              fontSize: 14,
              color: tool.length(address) > 0 ? colors.color333 : colors.color999,
            }}>{tool.length(address) > 0 ? address : '收件人地址，如小区/大厦/学校'} </Text>
          </View>
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: 'bold', fontSize: 14, color: colors.color333}}>门牌号 </Text>
          <TextInput placeholder="详细楼号，单元，门牌号（选填） "
                     underlineColorAndroid="transparent"
                     style={{height: 50, flex: 1}}
                     placeholderTextColor={'#999'}
                     value={street_block}
                     onChangeText={street_block => {
                       this.setState({street_block});
                     }}
          />
        </View>


        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: 1,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: 'bold', fontSize: 14, color: colors.color333}}>联系人 </Text>
          <TextInput placeholder="收件人姓名"
                     underlineColorAndroid="transparent"
                     style={{height: 50, flex: 1}}
                     placeholderTextColor={'#999'}
                     value={name}
                     onChangeText={value => {
                       this.setState({name: value});
                     }}
          />
        </View>


        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: colors.e5,
          borderBottomWidth: type === 'add' ? 1 : 0,
          height: 54,
        }}>
          <Text style={{width: 54, fontWeight: 'bold', fontSize: 14, color: colors.color333}}>电话 </Text>
          <View style={{
            flex: 1,
            borderColor: colors.e5,
            borderRightWidth: 1,
          }}>
            <TextInput placeholder="联系电话 "
                       maxLength={11}
                       underlineColorAndroid="transparent"
                       placeholderTextColor={'#999'}
                       keyboardType={'numeric'}
                       value={mobile}
                       onChangeText={value => {
                         const newText = value.replace(/[^\d]+/, '');
                         this.setState({mobile: newText});
                       }}
            />
          </View>
          <TextInput placeholder="分机号(选填)"
                     maxLength={4}
                     underlineColorAndroid="transparent"
                     style={{
                       width: 100,
                       fontSize: 14,
                       color: colors.color333,
                       textAlign: 'right'
                     }}
                     placeholderTextColor={colors.color666}
                     keyboardType={'numeric'}
                     value={mobile_suffix}
                     onChangeText={value => {
                       const newText = value.replace(/[^\d]+/, '');
                       this.setState({mobile_suffix: newText});
                     }}
                     textAlign='center'
          />

        </View>
        <If condition={type === 'add'}>
          <View style={{
            borderRadius: 4,
            marginTop: 11
          }}>
            <TextArea
              showCounter={false}
              style={{
                height: show_smart_input ? 110 : 44,
                fontSize: 12,
                paddingLeft: 10,
                borderRadius: 5,
                backgroundColor: colors.f5,
              }}
              onFocus={() => {
                this.setState({
                  show_smart_input: true
                })
              }}
              placeholder={show_smart_input ? "复制粘贴收货人信息至此,点击智能填写,系统会自动识别并自动填入(若不按指定格式填写,识别将会不精确)。如: 张三 北京市东城区景山前街4号 16666666666"
                : "智能地址识别"}
              placeholderTextColor={colors.color999}
              onChange={value => {

                this.setState({smartText: value, show_smart_input: tool.length(value) > 0});
              }}
              value={smartText}
              underlineColorAndroid={"transparent"}
            />

            <If condition={show_smart_input}>
              <Button title={'识别'}
                      onPress={() => this.intelligentIdentification()}
                      containerStyle={{
                        borderRadius: 5,
                        position: 'absolute',
                        top: 78,
                        right: 5,
                      }}
                      buttonStyle={{
                        padding: 0,
                        paddingVertical: 2,
                        paddingHorizontal: 12,
                        backgroundColor: tool.length(smartText) > 0 ? colors.main_color : colors.color999,
                      }}
                      titleStyle={{color: colors.white, fontSize: 12}}/>

            </If>

          </View>
        </If>
      </View>
    )
  }


  renderSmartModal = () => {
    let {show_smart_modal, address, name, street_block, mobile} = this.state;
    return (
      <JbbModal visible={show_smart_modal} HighlightStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'center'}>
        <View style={{marginBottom: 20}}>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 15, lineHeight: 30}}>
              使用复制的收件信息？
            </Text>

            <SvgXml onPress={this.closeModal} xml={cross_icon()}/>

          </View>

          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <View style={{paddingHorizontal: 20, paddingBottom: 20}}>
              <View style={{flexDirection: "row", alignItems: 'center'}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>地址： </Text>
                <Text style={{
                  color: colors.color333,
                  fontSize: 14
                }}>{tool.jbbsubstr(address, 10)} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>门牌号： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{street_block} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>联系人： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{name} </Text>
              </View>
              <View style={{flexDirection: "row", alignItems: 'center', marginTop: 10}}>
                <Text style={{color: colors.color999, fontSize: 14, width: 80, textAlign: 'right'}}>联系电话： </Text>
                <Text style={{color: colors.color333, fontSize: 14}}>{mobile} </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Button title={'取消'}
                      onPress={() => {
                        this.cancelData()
                        this.closeModal()
                      }}
                      containerStyle={{
                        flex: 1,
                        borderRadius: 20,
                        length: 40,
                        marginRight: 10
                      }}
                      buttonStyle={{
                        backgroundColor: colors.f5,
                      }}
                      titleStyle={{color: colors.color333, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>

              <Button title={'确定'}
                      onPress={this.closeModal}
                      containerStyle={{
                        flex: 1,
                        borderRadius: 20,
                        length: 40,
                      }}
                      buttonStyle={{
                        backgroundColor: colors.main_color,
                      }}
                      titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>
            </View>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderBtn = () => {
    let {type} = this.state
    return (
      <View style={{backgroundColor: colors.white, padding: 15}}>
        <Button title={type === 'add' ? '确 认' : '保 存'}
                onPress={() => {
                  this.saveInfo()
                }}
                buttonStyle={[{
                  backgroundColor: colors.main_color,
                  borderRadius: 24,
                  length: 48,
                }]}
                titleStyle={{color: colors.f7, fontWeight: 'bold', fontSize: 20, lineHeight: 28}}
        />
      </View>
    )
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      show_smart_modal: false,
    })
  }

  renderModal = () => {
    let {showModal} = this.state;
    return (
      <JbbModal visible={showModal} onClose={this.closeModal} modal_type={'center'}>
        <View style={{marginBottom: 20}}>

          <Text
            style={{
              fontSize: 17,
              color: colors.color333,
              fontWeight: 'bold',
              marginVertical: 30,
              textAlign: 'center',
            }}>确定要删除该收件人吗？ </Text>
          <View
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button title={'暂  不'}
                    onPress={this.closeModal}
                    containerStyle={{
                      flex: 1,
                      borderRadius: 20,
                      length: 40,
                      marginRight: 10
                    }}
                    buttonStyle={{
                      backgroundColor: colors.f5,
                    }}
                    titleStyle={{color: colors.color333, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>

            <Button title={'删 除'}
                    onPress={this.deleteAddressItem}
                    containerStyle={{
                      flex: 1,
                      borderRadius: 20,
                      length: 40,
                    }}
                    buttonStyle={{
                      backgroundColor: colors.main_color,
                    }}
                    titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }
}

const styles = StyleSheet.create({
  container: {backgroundColor: "#f2f2f2", paddingHorizontal: 12, paddingVertical: 10},
  inputActivity: {backgroundColor: colors.main_color, borderRadius: 10, padding: 5, width: 60},
  inputNormal: {backgroundColor: '#A7A7A7', borderRadius: 10, padding: 5, width: 60},
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderReceivingInfo);
