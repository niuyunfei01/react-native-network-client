//import liraries
import React, {PureComponent} from "react";
import {
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
import {back, cross_icon, head_cross_icon} from "../../../svg/svg";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../../pubilc/util/tool";
import Validator from "../../../pubilc/util/Validator";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import {AMapSdk} from "react-native-amap3d/lib/src/index";
import geolocation from "@react-native-community/geolocation";
import {mergeMixpanelId} from "../../../pubilc/util/analytics";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import JbbAlert from "../../../pubilc/component/JbbAlert";

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
    let {vendor_info = {}} = this.props.global;
    let show_store_info = false;
    let {is_service_mgr = false} = tool.vendor(this.props.global);

    if (type === 'add' && is_service_mgr && vendor_info?.co_type === 'baodi' && Number(vendor_info?.is_agency_operation) === 1) {
      show_store_info = true
    }

    if (tool.length(mobile) <= 0 && !show_store_info) {
      mobile = this.props.global.store_info?.mobile
    }

    if (store_id === 0) {
      store_id = this.props.global?.store_id
    }

    this.state = {
      loading: false,
      store_id,
      type,
      show_store_info,
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
      mobile,
      verify_code: verify_code,
      city: '选择城市',
      show_category_modal: false,
      show_placeholder: true,
      referrer_id: ''
    };

  }

  componentDidMount() {
    let {type = 'add'} = this.state
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
        street_block: res?.street_block,
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
      // states.street_block = res?.address;
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
      disable_select_city: type !== 'edit',
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
      mobile,
      referrer_id,
      show_store_info
    } = this.state;

    if (loading) {
      return;
    }
    this.setState({loading: true});
    const {accessToken = '', vendor_id = ''} = this.props.global;
    let params = {
      store_id_real: store_id,
      store_id,
      store_name,
      store_address,
      lng,
      lat,
      street_block,
      sale_category: category_id,
      category_desc,
      contact_name,
      contact_phone,
      mobile,
      password: verify_code,
      vendor_id,
      referrer_id,
    }
    const validator = new Validator();
    validator.add(store_name, 'required', '请填写门店名称')
    validator.add(lat, 'required', '请设置门店地址')
    validator.add(store_address, 'required', '请设置门店地址')
    validator.add(category_id, 'required', '请设置门店品类')
    validator.add(contact_name, 'required', '请填写门店联系人')
    validator.add(contact_phone, 'required|equalLength:11|isMobile', '请输入正确的门店联系电话')
    if (show_store_info) {
      validator.add(mobile, 'required|equalLength:11|isMobile', '请输入正确的商户手机号')
    }
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
    } else {
      params.op_type = show_store_info ? 'add_by_bd' : type
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
      } else {
        this.setState({
          loading: false
        })
        ToastShort('操作成功');
        this.props.navigation.goBack();
      }
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

  queryConfig = (accessToken, store_id) => {
    const {dispatch} = this.props;
    dispatch(getConfig(accessToken, store_id, (ok, err_msg, cfg) => {
      if (ok) {
        dispatch(setCurrentStore(cfg?.store_id || store_id));
        this.setState({
          type: 'register_success'
        }, () => hideModal())

      } else {
        ToastShort(err_msg, 0);
      }
    }));
  }


  render() {
    let {type} = this.state;
    return (
      <View style={{flex: 1, backgroundColor: colors.f5}}>
        {this.renderHead()}
        <If condition={type === 'register_success'}>
          {this.renderRegisterSuccess()}
        </If>
        <If condition={type !== 'register_success'}>
          {this.renderBody()}
          {this.renderBtn()}
          {this.renderCategoriesModal()}
        </If>
      </View>
    )
  }

  renderHead = () => {
    let {navigation} = this.props
    let {type} = this.state;
    let head_text = '添加门店'
    switch (type) {
      case 'register':
        head_text = '创建门店';
        break;
      case 'edit':
        head_text = '编辑门店';
        break;
      case 'add':
        head_text = '添加门店';
        break;
      case 'register_success':
        head_text = '开通运力';
        break;
    }
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.white,
        paddingHorizontal: 6,
      }}>
        <SvgXml style={{marginRight: 4}} onPress={() => {
          if (type === 'register_success') {
            return tool.resetNavStack(navigation, Config.ROUTE_ALERT, {
              initTab: Config.ROUTE_ORDERS,
              initialRouteName: Config.ROUTE_ALERT
            });
          }
          if (type === 'register') {

            return JbbAlert.show({
              title: '确定要退出吗?',
              actionText: '确定',
              closeText: '暂不',
              onPress: () => {
                this.props.navigation.goBack()
              },
            })

          }
          this.props.navigation.goBack()
        }} xml={type === 'register_success' ? head_cross_icon() : back()}/>
        <Text style={{
          color: colors.color333,
          fontSize: 17,
          fontWeight: 'bold',
          lineHeight: 24,
          marginRight: 40,
          flex: 1,
          textAlign: 'center'
        }}> {head_text} </Text>
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
      mobile,
      referrer_id,
      show_store_info
    } = this.state;
    return (
      <KeyboardAwareScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}>
        <Text style={{color: colors.color999, fontSize: 14, marginBottom: 10, lineHeight: 20}}> 门店信息 </Text>
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
                       placeholderTextColor={show_placeholder ? colors.color999 : 'rgba(0,0,0,0)'}
                       value={store_name}
                       maxLength={20}
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
                       multiline={true}
                       numberOfLines={2}
                       onChangeText={store_name => {
                         // if (/^[a-zA-Z0-9\u4e00-\u9fa5\\(\\)\\（\\）]+?$/g.test(store_name)) {
                         //   this.setState({store_name});
                         // }
                         this.setState({store_name: store_name.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\s\\(\\)\\（\\）]/g, "")});
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


          <If condition={!show_store_info}>
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
          </If>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: colors.e5,
            borderBottomWidth: type === 'register' ? 0.5 : 0,
            height: 56
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>联系电话 </Text>
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

          <If condition={type === 'register'}>
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
                         value={referrer_id}
                         onChangeText={value => {
                           this.setState({referrer_id: value.replace(/[^\a-\z\A-\Z0-9]/g, "")});
                         }}
              />
            </View>
          </If>
        </View>

        <If condition={show_store_info}>
          <Text style={{color: colors.color999, fontSize: 14, marginVertical: 10, lineHeight: 20}}> 商户信息 </Text>
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
              <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>商户名称 </Text>
              <TextInput placeholder="请填写商户名称"
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
              height: 56
            }}>
              <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>商户账号 </Text>
              <TextInput placeholder="请填写商户手机号"
                         underlineColorAndroid="transparent"
                         style={{height: 56, flex: 1, textAlign: 'right', color: colors.color333}}
                         placeholderTextColor={'#999'}
                         maxLength={11}
                         keyboardType={'numeric'}
                         value={mobile}
                         onChangeText={value => {
                           this.setState({mobile: value.replace(/[^0-9]/g, "")});
                         }}
              />
            </View>

          </View>
        </If>
      </KeyboardAwareScrollView>
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
             animationType="slide"
             visible={show_category_modal}>
        <View style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flexGrow: 1,
          flexDirection: 'row',
          alignItems: 'flex-end'
        }]}>
          <View style={[{
            backgroundColor: colors.white,
            maxHeight: height * 0.7,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingBottom: 10,
          }]}>
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
                      borderRadius: 20,
                      height: 40,
                      marginTop: 10,
                      marginHorizontal: 20,
                    }}
                    titleStyle={{color: colors.white, fontSize: 16, fontWeight: 'bold'}}
            />
          </View>
        </View>
      </Modal>
    )
  }

  renderRegisterSuccess = () => {
    return (
      <View style={styles.noOrderContent}>

        <Image
          source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/create_delivery.png'}}
          style={{width: 160, height: 138, marginVertical: 30}}/>

        <Text style={styles.noOrderDesc}>已为您开通外送帮支持的聚合运力，您可以根据门店实际配送场景和诉求选择合适的配送商～ </Text>
        <Text style={styles.noOrderDesc}>同时您也可以绑定自有账号，自有账号同步使用账号余额和优惠券，接单更快，免收服务费～ </Text>
        <Button title={'去绑定自有账号'}
                onPress={() => {
                  this.onPress(Config.ROUTE_DELIVERY_LIST, {into_type: 'register', show_select_store: false})
                }}
                buttonStyle={[{
                  marginTop: 20,
                  backgroundColor: colors.main_color,
                  borderRadius: 24,
                  width: width * 0.6,
                  length: 48,
                }]}
                titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 18, lineHeight: 25}}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  noOrderContent: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  noOrderDesc: {marginTop: 10, fontSize: 15, color: colors.color333, lineHeight: 21},
});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SaveStore);
