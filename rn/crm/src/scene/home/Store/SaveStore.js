//import liraries
import React, {PureComponent} from "react";
import {
  Dimensions,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {
  doAuthLogin,
  getConfig,
  setAccessToken,
  setCurrentStore,
  setUserProfile
} from "../../../reducers/global/globalActions";
import HttpUtils from "../../../pubilc/util/http";
import PropTypes from "prop-types";
import colors from "../../../pubilc/styles/colors";
import {Button} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import {back, cross_icon} from "../../../svg/svg";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../../pubilc/util/tool";
import Validator from "../../../pubilc/util/Validator";
import AlertModal from "../../../pubilc/component/AlertModal";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import {AMapSdk} from "react-native-amap3d/lib/src/index";
import geolocation from "@react-native-community/geolocation";
import {mergeMixpanelId} from "../../../pubilc/util/analytics";

const {width, height} = Dimensions.get("window");

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
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

// create a component
class SaveStore extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    let {store_id = 0, type = 'add', mobile = '', verify_code = ''} = this.props.route.params;
    this.state = {
      loading: false,
      store_id,
      type,
      store_name: '',
      store_address: '',
      lng: '',
      lat: '',
      street_block: '',
      category_list: [],
      category_id: '',
      category_id_input_vlue: '',
      category_id_input_vlue_desc: '',
      category_desc: '',
      contact_name: '',
      contact_phone: '',
      verify_code: verify_code,
      city: '',
      show_back_modal: false,
      show_category_modal: false,
      show_placeholder: true,
      referrer_id: ''
    };
    this.fetchCategories()
    if (type === 'edit') {
      this.fetchData()
    } else {
      this.autoGetgeolocation()
    }
  }

  autoGetgeolocation = () => {
    AMapSdk.init(
      Platform.select({
        android: "1d669aafc6970cb991f9baf252bcdb66",
        ios: "48148de470831f4155abda953888a487",
      })
    );
    let that = this
    geolocation.getCurrentPosition((pos) => {
      let coords = pos.coords;
      let location = coords?.longitude + "," + coords?.latitude;
      let url = `https://restapi.amap.com/v3/geocode/regeo?key=85e66c49898d2118cc7805f484243909&location=${location}`;
      fetch(url).then(response => response.json()).then((data) => {
        if (data.status === "1") {
          that.setState({
            city: data?.regeocode?.addressComponent?.city,
            lng: coords?.longitude,
            lat: coords?.latitude,
          })
        }
      });
    })
  }

  fetchCategories = () => {
    const {accessToken = ''} = this.props.global;
    const api = `/v1/new_api/stores/sale_categories?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        category_list: res
      })
    })
  }

  fetchData = () => {
    let {loading, store_id} = this.state;
    if (Number(store_id) <= 0) {
      ToastShort('操作错误,请退出重试');
      return this.props.navigation.goBack()
    }
    if (loading) {
      return;
    }
    this.setState({loading: true});
    const {accessToken = ''} = this.props.global;
    const api = `/v4/wsb_store/findStore?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {store_id_real: store_id}).then((res) => {
      this.setState({
        loading: false,
        store_name: res?.store_name,
        store_address: res?.store_address,
        lat: res?.lat,
        lng: res?.lng,
        city: res?.store_city,
        category_id: res?.sale_category,
        category_id_input_vlue: Number(res?.sale_category),
        category_desc: res?.category_desc,
        contact_name: res?.contact_name,
        contact_phone: res?.contact_phone,
      })
    })
  }

  onPress = (route, params = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }
  closeModal = () => {
    this.setState({
      show_back_modal: false,
      show_category_modal: false,
    })
  }
  setAddress = (res) => {
    let Lng = (res?.location).split(',')[0];
    let lat = (res?.location).split(',')[1];
    let states = {
      lng: Lng,
      lat: lat,
    }
    if (res?.name) {
      states.store_address = res?.name;
    }
    if (res?.address) {
      states.street_block = res?.address;
    }
    this.setState({...states})
  }

  goSelectAddress = () => {
    let {store_address, lng, lat, city, type} = this.state;
    let center = ""
    if (lng && lat) {
      center = lng + ',' + lat
    }
    const params = {
      center: center,
      city_name: city,
      show_select_city: type !== 'edit',
      keywords: store_address,
      onBack: (res) => {
        this.setAddress.bind(this)(res)
      },
    };
    this.props.navigation.navigate(Config.ROUTE_SEARCH_SHOP, params);
  }

  submit = () => {
    let {
      loading,
      store_id,
      store_name,
      store_address,
      lng,
      lat,
      street_block,
      category_id,
      category_desc,
      contact_name,
      contact_phone,
      verify_code,
      type,
      referrer_id
    } = this.state;

    if (loading) {
      return;
    }
    this.setState({loading: true});
    const {accessToken = '', vendor_id = ''} = this.props.global;
    let params = {
      store_id_real: store_id,
      store_name,
      store_address,
      lng,
      lat,
      street_block,
      sale_category: category_id,
      category_desc,
      contact_name,
      contact_phone,
      mobile: contact_phone,
      password: verify_code,
      vendor_id,
      referrer_id
    }
    const validator = new Validator();
    validator.add(store_name, 'required', '请填写门店名称')
    validator.add(lat, 'required', '请设置门店地址')
    validator.add(store_address, 'required', '请设置门店地址')
    validator.add(category_id, 'required', '请设置门店品类')
    validator.add(contact_name, 'required', '请填写门店联系人')
    validator.add(contact_phone, 'required|equalLength:11|isMobile', '请输入正确的手机号')
    const err_msg = validator.start();
    if (err_msg) {
      this.setState({
        loading: false
      })
      return ToastShort(err_msg)
    }

    let api = `/v4/wsb_store/createStore?access_token=${accessToken}`
    if (type === 'edit') {
      api = `/v4/wsb_store/editOfStore?access_token=${accessToken}`
    }
    HttpUtils.post.bind(this.props)(api, params).then((res) => {
      if (type === 'register' && res?.user?.token && res?.user?.user_id) {
        showModal("注册成功，正在登录...")
        let {access_token, refresh_token, expires_in: expires_in_ts} = res.user.token;
        this.props.dispatch(setAccessToken({access_token, refresh_token, expires_in_ts}))
        const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;
        const authCallback = (ok, msg, profile) => {
          if (ok) {
            this.props.dispatch(setUserProfile(profile));
          }
        };
        doAuthLogin(access_token, expire, this.props, authCallback)
        this.queryConfig(access_token, res?.OfflineStore?.id)
        this.mixpanel.getDistinctId().then(res => {
          if (res !== res?.user?.user_id) {
            mergeMixpanelId(res, res?.user?.user_id);
            this.mixpanel.identify(res?.user?.user_id);
          }
        })
      }
      this.setState({
        loading: false
      })
      ToastShort(res?.desc);
      this.props.navigation.goBack();
    }, (e) => {
      ToastShort(e?.desc);
      this.setState({
        loading: false
      })
    }).catch((e) => {
      ToastShort(e?.desc);
      this.setState({
        loading: false
      })
    })
  }

  queryConfig = (accessToken, currStoreId) => {
    const {dispatch, navigation} = this.props;
    dispatch(getConfig(accessToken, currStoreId, (ok, err_msg, cfg) => {
      if (ok) {
        dispatch(setCurrentStore(cfg?.store_id || currStoreId));
        tool.resetNavStack(navigation, cfg?.show_bottom_tab ? Config.ROUTE_ORDERS : Config.ROUTE_ALERT, cfg?.show_bottom_tab ? {} : {
          initTab: Config.ROUTE_ORDERS,
          initialRouteName: Config.ROUTE_ALERT
        });
        hideModal()
      } else {
        ToastShort(err_msg, 0);
      }
    }));
  }


  render() {
    return (
      <View style={{flex: 1, backgroundColor: colors.f5}}>
        {this.renderHead()}
        {this.renderBody()}
        {this.renderBtn()}
        {this.renderBackModal()}
        {this.renderCategoriesModal()}
      </View>
    )
  }

  renderHead = () => {
    let {type} = this.state;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        paddingHorizontal: 6,
      }}>
        <SvgXml style={{marginRight: 4}} onPress={() => {
          if (type === 'add') {
            return this.setState({
              show_back_modal: true,
            })
          }
          this.props.navigation.goBack()
        }} xml={back()}/>
        <Text style={{
          color: colors.color333,
          fontSize: 17,
          fontWeight: 'bold',
          lineHeight: 24,
          marginRight: 40,
          flex: 1,
          textAlign: 'center'
        }}> {type === 'edit' ? '门店管理' : '创建门店'} </Text>
      </View>
    )
  }

  renderBody = () => {
    let {
      store_name,
      store_address,
      street_block,
      category_desc,
      contact_name,
      contact_phone,
      show_placeholder,
      type,
      referrer_id
    } = this.state;
    return (
      <ScrollView automaticallyAdjustContentInsets={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false} style={{
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 6,
          paddingHorizontal: 12,
        }}>


          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: 0.5,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>门店名称 </Text>
            <TextInput placeholder={"请填写门店名称"}
                       underlineColorAndroid="transparent"
                       style={{flex: 1, textAlign: 'right', color: colors.color333}}
                       placeholderTextColor={show_placeholder ? '#999' : colors.white}
                       value={store_name}
                       maxLength={20}
                       onBlur={() => {
                         this.setState({
                           show_placeholder: true
                         })
                       }}
                       multiline={true}
                       numberOfLines={2}
                       onFocus={() => {
                         this.setState({
                           show_placeholder: false
                         })
                       }}
                       onChangeText={store_name => {
                         // if (/^[a-zA-Z0-9\u4e00-\u9fa5\\(\\)\\（\\）]+?$/g.test(store_name)) {
                         //   this.setState({store_name});
                         // }
                         this.setState({store_name: store_name.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\\(\\)\\（\\）]/g, "")});
                       }}
            />
          </View>

          <TouchableOpacity onPress={this.goSelectAddress} style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: 0.5,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>门店地址 </Text>
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: tool.length(store_address) > 0 ? colors.color333 : colors.color999,
              textAlign: 'right'
            }}>
              {tool.length(store_address) > 0 > 0 ? store_address : '点击设置门店地址'}
            </Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
          </TouchableOpacity>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: 0.5,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>详细地址 </Text>
            <TextInput placeholder="填写详细门牌号"
                       underlineColorAndroid="transparent"
                       style={{flex: 1, textAlign: 'right', color: colors.color333}}
                       placeholderTextColor={'#999'}
                       value={street_block}
                       multiline={true}
                       numberOfLines={2}
                       maxLength={20}
                       onChangeText={street_block => {
                         this.setState({street_block: tool.filteremoji(street_block)});
                       }}
            />
          </View>

          <TouchableOpacity onPress={() => {
            this.setState({
              show_category_modal: true
            })
          }} style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: 0.5,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>经营品类 </Text>
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: tool.length(category_desc) > 0 ? colors.color333 : colors.color999,
              textAlign: 'right'
            }}>
              {tool.length(category_desc) > 0 ? category_desc : '设置门店品类'}
            </Text>
            <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
          </TouchableOpacity>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: 0.5,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>联系人 </Text>
            <TextInput placeholder="请填写门店联系人"
                       underlineColorAndroid="transparent"
                       style={{height: 56, flex: 1, textAlign: 'right', color: colors.color333}}
                       placeholderTextColor={'#999'}
                       maxLength={10}
                       value={contact_name}
                       onChangeText={contact_name => {
                         this.setState({contact_name: tool.filtrationInput(contact_name)});
                       }}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: type !== 'edit' ? 0.5 : 0,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>门店电话 </Text>
            <TextInput placeholder="请填写门店联系电话"
                       underlineColorAndroid="transparent"
                       style={{height: 56, flex: 1, textAlign: 'right', color: colors.color333}}
                       placeholderTextColor={'#999'}
                       maxLength={11}
                       keyboardType={'numeric'}
                       // editable={type !== 'register'}
                       value={contact_phone}
                       onChangeText={value => {
                         // const newText = value.replace(/[^\d]+/, '');
                         this.setState({contact_phone: value.replace(/[^0-9]/g, "")});
                       }}
            />
          </View>

          <If condition={type !== 'edit'}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 56
            }}>
              <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>推荐人ID </Text>
              <TextInput placeholder="请填写推荐人ID(选填)"
                         underlineColorAndroid="transparent"
                         style={{height: 56, flex: 1, textAlign: 'right', color: colors.color333}}
                         placeholderTextColor={'#999'}
                         keyboardType={'numeric'}
                         value={referrer_id}
                         onChangeText={value => {
                           this.setState({referrer_id: value.replace(/[^0-9]/g, "")});
                         }}
              />
            </View>
          </If>

        </View>

      </ScrollView>
    )
  }


  renderBtn = () => {
    let {type} = this.state;
    return (
      <View style={{backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 10, height: 62}}>
        <Button title={type === 'edit' ? '保存并同步' : '保 存'}
                onPress={this.submit}
                buttonStyle={[{
                  backgroundColor: colors.main_color,
                  borderRadius: 20,
                  length: 42,
                }]}
                titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}
        />
      </View>
    )
  }

  renderBackModal = () => {
    let {show_back_modal} = this.state;
    return (
      <View>
        <AlertModal
          visible={show_back_modal}
          onClose={this.closeModal}
          onPressClose={this.closeModal}
          onPress={() => {
            this.closeModal()
            this.props.navigation.goBack()
          }}
          title={'确定要退出吗?'}
          desc={''}
          actionText={'确定'}
          closeText={'暂不'}/>
      </View>
    )
  }

  renderCategoriesModal = () => {
    let {category_list, show_category_modal, category_id_input_vlue, category_id_input_vlue_desc} = this.state;
    if (show_category_modal && tool.length(category_list) <= 0) {
      ToastShort('正在请求品类，请稍后再试');
      return this.closeModal();
    }
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.closeModal}
             maskClosable transparent={true}
             animationType="fade"
             visible={show_category_modal}>
        <View style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flex: 1
        }]}>
          <TouchableOpacity onPress={this.closeModal} style={{flexGrow: 1}}/>
          <View style={[{
            backgroundColor: colors.white,
            maxHeight: height * 0.7,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }]}>
            <View>
              <View style={{
                flexDirection: 'row',
                padding: 12,
                paddingBottom: 5,
                justifyContent: 'space-between',
              }}>
                <Text style={{fontWeight: 'bold', fontSize: 15, lineHeight: 30}}>
                  经营品类
                </Text>
                <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
              </View>

              <ScrollView
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={{
                  paddingHorizontal: 12,
                  maxHeight: 380,
                }}>
                <View style={{

                  flexDirection: 'row',
                  alignItems: "center",
                  justifyContent: "center",
                }}>

                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                    flexWrap: "wrap"
                  }}>
                    <For index='index' of={category_list} each='info'>
                      <TouchableOpacity onPress={() => {
                        this.setState({
                          category_id_input_vlue: Number(info?.id),
                          category_id_input_vlue_desc: info?.name
                        })
                      }} key={index} style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: width * 0.28,
                        height: 36,
                        margin: 5,
                        borderWidth: 0.5,
                        borderRadius: 4,
                        backgroundColor: Number(info?.id) === category_id_input_vlue ? '#DFFAE2' : colors.white,
                        borderColor: Number(info?.id) === category_id_input_vlue ? colors.main_color : colors.colorDDD,
                      }}>
                        <Text style={{
                          fontSize: 14,
                          color: Number(info?.id) === category_id_input_vlue ? colors.main_color : colors.color333,
                          fontWeight: Number(info?.id) === category_id_input_vlue ? 'bold' : 'normal',
                        }}>{info?.name} </Text>
                      </TouchableOpacity>
                    </For>
                  </View>
                </View>
              </ScrollView>
              <View style={{
                padding: 20
              }}>
                <Button title={'确 定'}
                        onPress={() => {
                          this.setState({
                            show_category_modal: false,
                            category_id: category_id_input_vlue,
                            category_desc: category_id_input_vlue_desc,
                          })
                        }}
                        buttonStyle={{
                          backgroundColor: colors.main_color,
                          width: width * 0.9,
                          borderRadius: 20,
                          height: 40,
                          marginHorizontal: 3,
                        }}
                        titleStyle={{color: colors.white, fontSize: 16, fontWeight: 'bold'}}
                />
              </View>
            </View>

          </View>
        </View>
      </Modal>
    )
  }
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SaveStore);
