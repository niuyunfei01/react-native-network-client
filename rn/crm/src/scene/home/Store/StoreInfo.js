import React, {Component} from "react";
import {Alert, Clipboard, InteractionManager, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {copyStoreGoods, saveOfflineStore} from "../../../reducers/mine/mineActions";

import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import * as tool from "../../../pubilc/util/tool";
import {simpleBarrier} from "../../../pubilc/util/tool";
import Entypo from "react-native-vector-icons/Entypo";
import Config from "../../../pubilc/common/config";
import config from "../../../pubilc/common/config";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import {Button} from "react-native-elements";
import _ from "lodash";
import {uploadImg} from "../../../reducers/product/productActions";
import {TextArea} from "../../../weui";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        saveOfflineStore,
        copyStoreGoods,
        ...globalActions
      },
      dispatch
    )
  };
}

class StoreInfo extends Component {
  constructor(props) {
    super(props);

    let {currVendorId} = tool.vendor(this.props.global);
    const {mine} = this.props;
    let user_list = mine.user_list[currVendorId] || [];
    let normal_list = mine.normal[currVendorId] || [];

    let userActionSheet = [];
    userActionSheet.push({key: -999, section: true, label: "职位任命"});
    userActionSheet.push({key: -100, label: "创建新用户"});
    userActionSheet.push({key: 0, label: "不任命任何人"});
    for (let user_info of normal_list) {
      let item = {
        key: user_info.id,
        label: user_info.nickname
      };
      userActionSheet.push(item);
    }


    const {btn_type} = this.props.route.params || {};
    this.state = {
      currVendorId: currVendorId,
      timerIdx: 0,
      timerType: "start",
      isRefreshing: false,
      btn_type: btn_type,
      onSubmitting: false,
      goToCopy: false,
      goToReset: false,
      user_list: user_list,
      userActionSheet: userActionSheet,
      isStartVisible: false,
      isEndVisible: false,
      isShowTimepicker: false,
      isBd: false, //是否是bd
      isUploadingImage: false,
      storeImageInfo: undefined,
      bossImageInfo: undefined,
      fileId: [],
      templateList: [], //模板列表
      templateInfo: {key: undefined, label: undefined},
      qualification: {name: '', info: ''}, //上传资质
      bdList: [],
      bdInfo: {key: undefined, label: undefined},
      sale_categoryInfo: {key: undefined, label: '店铺类型'},
      isGetbdList: true,
      isLoadingStoreList: true,
      isServiceMgr: false,  //是否是业务人员 BD+运营
      remark: '',
      receiveSecretKey: '',
      createUserName: '',
      workerPopupVisible: false,
      workerPopupMulti: false,
      err_num: 0,
      selectCity: {
        cityId: '',
        name: "点击选择城市"
      },
      shelfNos: [{label: '托管店', value: '1'}, {label: '联营店', value: '0'}],
      shoptypes: [{label: '托管店', value: '1'}, {label: '联营店', value: '0'}],
      pickerValue: "",
      timemodalType: false,
      sale_category_name: "",
      sale_category: "",
      datePickerValue: new Date(),
      is_mgr: this.props.route.params.is_mgr ? this.props.route.params.is_mgr : false
    };
    this.fetchDeliveryErrorNum();
  }

  fetchDeliveryErrorNum() {
    HttpUtils.get.bind(this.props)(`/v1/new_api/Stores/sale_categories?access_token=${accessToken}`, {}).then(res => {
      res.map((v) => {
        v.label = v.name
        v.value = v.id
      })
      this.setState({
        shelfNos: res
      })
    }).catch((res) => {
      ToastLong(res.reason)
    })

    if (this.props.route.params.btn_type === "add") {
      return null;
    }
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/shop_bind_list?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then((res) => {
      if (res.diff_count > 0) {
        this.setState({
          err_num: res.diff_count
        })
      }
    })
  }

  onStoreCopyGoods(force) {
    if (this.state.store_id <= 0) {
      ToastLong("错误的门店信息");
      return false;
    }
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(
        copyStoreGoods(this.state.store_id, force, this.props.global.accessToken, resp => {
          if (resp.ok) {
            ToastLong(resp.desc);
          }
          this.setState({
            goToReset: false,
            goToCopy: false
          });
        })
      );
    });
  }


  getStoreMgrName() {
    const {owner_id, user_list} = this.state;

    let store_mgr_name;
    if (owner_id > 0) {
      const owner = user_list[owner_id];
      if (!owner) {
        store_mgr_name = this.state.createUserName || '-'
      } else {
        store_mgr_name = `${owner['nickname']}(${owner['mobilephone']})`
      }
    } else {
      store_mgr_name = "-";
    }
    return store_mgr_name;
  }

  getViceMgrName() {
    const {vice_mgr, user_list} = this.state;
    let vice_mgr_name = "";
    if (!!vice_mgr && vice_mgr !== "0") {
      for (let vice_mgr_id of vice_mgr.split(",")) {
        if (vice_mgr_id > 0) {
          let user_info = user_list[vice_mgr_id] || {};
          let mgr_name = user_info["name"] || user_info["nickname"] || vice_mgr_id;
          //let mgr_tel = user_info['mobilephone'];
          if (!!mgr_name) {
            if (vice_mgr_name !== "") {
              vice_mgr_name += ",";
            }
            vice_mgr_name += mgr_name;
          }
        }
      }
    }
    let viceMgrNames = vice_mgr_name || "点击选择店助";
    return viceMgrNames
  }

  showWorkerPopup(is_vice) {
    Alert.alert('提示', '请选择方式', [

      {
        'text': '搜索员工',
        onPress: () => this.setState({workerPopupMulti: is_vice}, () => {
          this.setState({workerPopupVisible: true})
        })
      },
      {
        'text': '添加员工',
        onPress: () => this.onAddUser(is_vice)
      },
      {'text': '取消'},
    ])
  }

  onAddUser(is_vice) {
    let storeId = this.state.store_id;
    let storeData = this.getStoreEditData();
    this.onPress(Config.ROUTE_USER_ADD, {
      type: 'add',
      pageFrom: 'storeAdd',
      storeData: storeData,
      store_id: storeId,
      onBack: (userId, userMobile, userName) => this.onCreateUser(userId, userMobile, userName, is_vice)
    });
    return false;
  }

  getStoreEditData() {
    let {
      store_id, type, alias, name, district,
      owner_name, owner_nation_id, location_long,
      location_lat, deleted, tel, mobile, dada_address,
      owner_id, open_end, open_start, vice_mgr, call_not_print,
      ship_way, fn_price_controlledname, fn_price_controlled, bdInfo, templateInfo, sale_category
    } = this.state;
    return {
      store_id: store_id,
      type: type,
      alias: alias,
      name: name,
      district: district,
      owner_name: owner_name,
      owner_nation_id: owner_nation_id,
      location_long: location_long,
      location_lat: location_lat,
      deleted: deleted,
      tel: tel,
      mobile: mobile,
      dada_address: dada_address,
      owner_id: owner_id,
      open_end: open_end,
      open_start: open_start,
      vice_mgr: vice_mgr,
      call_not_print: call_not_print,
      ship_way: ship_way,
      fn_price_controlledname: fn_price_controlledname,
      fn_price_controlled: fn_price_controlled,
      bdInfo: bdInfo,
      templateInfo: templateInfo,
      sale_category: sale_category
    };
  }


  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);

    });
  }

  setAddress(res) {
    let lat = res.location.substr(res.location.lastIndexOf(",") + 1, res.location.length);
    let Lng = res.location.substr(0, res.location.lastIndexOf(","));
    this.setState({
      selectCity: {
        name: res.cityname,
        cityId: res.citycode
      },
      district: res.adname,
      dada_address: res.address,
      location_long: Lng,
      location_lat: lat,
    })
  }

  doUploadImg = qualification => {
    this.setState({
      isUploadingImage: true
    });
    let barrier = simpleBarrier();
    let self = this;
    this.upload(qualification.bossImageInfo, "StoreBoss", barrier);
    this.upload(qualification.storeImageInfo, "StoreImage", barrier);
    qualification.imageList.map(element => {
      this.upload(element.imageInfo, "StoreImageList", barrier);
    });
    let doneUpload = () => {
      let rmIds = qualification.rmIds;
      let existImgIds = self.state.existImgIds;
      let ids = _.difference(existImgIds, rmIds); //去掉rmids中的和existimgids中重复的去掉 返回去重后的existImgIds
      let fileIds = self.fileId;
      fileIds = fileIds.concat(ids);
      self.fileId = fileIds;
      self.setState({
        isUploadingImage: false,
        fileId: fileIds,
        qualification: qualification,
        imageList: qualification.imageList, // array
        storeImageUrl: qualification.storeImageUrl,
        storeImageInfo: qualification.storeImageInfo,
        bossImageUrl: qualification.bossImageUrl,
        bossImageInfo: qualification.bossImageInfo
      });
    };
    //存在图片上传
    if (barrier.getRequiredCallbacks() > 0) {
      barrier.endWith(doneUpload);
    } else {
      doneUpload();
    }
  };
  upload = (imageInfo, name, barrier) => {
    let handleResp = resp => {
      if (resp.ok) {
        this.fileId.push(resp.obj.file_id);
      } else {
        ToastLong(resp.desc);
      }
      return resp;
    };
    if (imageInfo) {
      uploadImg(imageInfo, barrier.waitOn(handleResp), name, 1);
    }
  };

  getReceiveSecretKey() {
    const url = `api/get_store_receive_secret_key/${this.state.store_id}?access_token=${this.props.global.accessToken}`;
    HttpUtils.post.bind(this.props)(url).then((res) => {
      this.setState({
        receiveSecretKey: res
      })
    }).catch((res) => {
      ToastShort(res.reason)
    })
  }

  copyReceiveSecretKey(text) {
    Clipboard.setString(text)
    ToastLong('已复制到剪切板')
  }

  setOrder(res) {
    this.setState({
      ship_way: res.ship_way,
      call_not_print: res.call_not_print
    })

  }

  setBank(res) {
    this.setState({
      bankcard_code: res.bankcard_code,
      bankcard_address: res.bankcard_address,
      bankcard_username: res.bankcard_username,
    })

  }


  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <ScrollView style={{backgroundColor: colors.main_back, marginHorizontal: 10}}>
          {this.renderErrmsg()}
          {this.renderStoreInfo()}
          {this.renderWorker()}
          {this.renderPayInfo()}
          {this.renderBack()}
          {this.renderOther()}
        </ScrollView>
        {this.renderBtn()}
      </View>
    );
  }


  renderHeader() {
    const params = this.props.route.params || {}
    let title = params.btn_type === "add" ? "新增门店" : "门店信息/修改";
    let ActionSheet = [
      {key: -999, section: true, label: "操作"},
      {key: 1, label: "初始化商品"}, //force -> true
      {key: 2, label: "复制商品"} //force -> false
    ];
    return (
      <View style={{
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderBottomColor: colors.fontGray,
        borderBottomWidth: pxToDp(1)
      }}>
        <TouchableOpacity style={{width: 40}} onPress={() => this.props.navigation.goBack()}>
          <Entypo name='chevron-thin-left' style={{
            fontWeight: "bold",
            fontSize: 20,
            marginLeft: 5
          }}/>
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          color: "#4a4a4a",
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center"
        }}>{title} </Text>

        <ModalSelector
          onChange={option => {
            if (option.label === "初始化商品") {
              params.goToReset();
            } else if (option.label === "复制商品") {
              params.goToCopy();
            }
          }}
          data={ActionSheet}
          skin="customer"
        >
          <Entypo name="dots-three-horizontal" style={{
            fontSize: 18, marginRight: 10
          }}/>
        </ModalSelector>
      </View>
    )
  }

  renderErrmsg() {
    return (
      <If condition={this.state.err_num > 0}>
        <View style={{
          flexDirection: 'row',
          marginTop: 5,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            fontSize: pxToDp(25),
            color: '#E88A8A',
            textDecorationLine: 'underline',
          }}>检测到{this.state.err_num}家配送平台所留信息不一致 </Text>
          <Button onPress={() => {
            this.onPress(Config.ROUTE_DELIVERY_LIST);
          }}
                  title={'去修改'}
                  titleStyle={{
                    fontSize: 12,
                    color: colors.white
                  }}
                  buttonStyle={{
                    height: 30,
                    marginLeft: pxToDp(40),
                    backgroundColor: "#EE2626",
                  }}>去修改</Button>
        </View>
      </If>
    )
  }

  renderStoreInfo() {
    let {
      name,
      location_long,
      location_lat,
      tel,
      dada_address,
      shelfNos,
    } = this.state;
    return (
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 8,
        marginVertical: 10,
        padding: 10,
      }}>
        <View style={{
          borderBottomWidth: 1,
          paddingBottom: 2,
          borderColor: colors.colorCCC
        }}>
          <Text style={{
            color: colors.color333,
            padding: 10,
            paddingLeft: 8,
            fontSize: 15,
            fontWeight: 'bold',
          }}>门店信息 </Text>
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店铺名称</Text>
          <TextInput
            onChangeText={name => this.setState({name})}
            value={name}
            placeholder="64个字符以内"
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            underlineColorAndroid="transparent"
          />
        </View>


        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>门店电话 </Text>
          <TextInput
            onChangeText={tel => this.setState({tel})}
            value={tel}
            placeholder="请输入店铺电话"
            maxLength={18} // 可输入的最大长度
            keyboardType="numeric" //默认弹出的键盘
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            underlineColorAndroid="transparent"
          />
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>门店地址 </Text>
          <TextInput
            onChangeText={dada_address => this.setState({dada_address})}
            value={dada_address}
            placeholder="请输入门店地址"
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>定位地址 </Text>

          <Text onPress={() => {
            let center = "";
            if (location_long && location_lat) {
              center = `${location_long},${location_lat}`;
            }
            const params = {
              keywords: this.state.dada_address,
              onBack: (res) => {
                this.setAddress.bind(this)(res)
              },
              action: Config.LOC_PICKER,
              center: center,
              isType: 'fixed',
            };
            this.onPress(Config.ROUTE_SEARC_HSHOP, params);
          }} style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
            textAlign: "right",
          }}>
            {location_long !== "" && location_lat !== "" && location_lat !== undefined
              ? `${location_long}、${location_lat}`
              : "点击选择地址"}
          </Text>

          <Entypo name="location-pin" style={{
            color: colors.main_color,
            fontSize: 20,
          }}/>

        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店铺类型 </Text>

          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              if (option.value === 6 || option.value === 7) {
                ToastLong('鲜花/蛋糕类商品配送价格可能高于其他类型商品，且您在选择店铺类型后将不能随意更改，注册后如需更改请联系客服。')
              }
              this.setState({
                sale_categoryInfo: {
                  key: option.value,
                  label: option.label
                },
                sale_category_name: option.label,
                sale_category: option.value
              });
            }}
            data={shelfNos}
            skin="customer"
            defaultKey={-999}
          >
            <Text style={{
              fontSize: 14,
              color: colors.color333,
              textAlign: 'right'
            }}>{this.state.sale_category_name || '点击选择店铺类型'} </Text>
          </ModalSelector>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </View>

        <TouchableOpacity onPress={() => {
          if (this.state.is_mgr) {
            this.setState({
              timemodalType: true
            })
          } else {
            ToastLong("您没有权限!");
          }
        }} style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>营业时间 </Text>

          <Text style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
            textAlign: "right",
          }}>
            {this.state.open_time_conf ? this.state.open_time_conf.map((item, idx) => {
              return (
                <Text style={{
                  fontSize: 14,
                  color: colors.color333,
                }}>
                  {item.start_time} —— {item.end_time}
                </Text>
              )
            }) : "设置营业时间"}
          </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderWorker() {
    let {
      mobile,
      owner_id,
    } = this.state;
    return (
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
      }}>

        <View style={{
          borderBottomWidth: 1,
          paddingBottom: 2,
          borderColor: colors.colorCCC
        }}>
          <Text style={{
            color: colors.color333,
            padding: 10,
            paddingLeft: 8,
            fontSize: 15,
            fontWeight: 'bold',
          }}>店长信息 </Text>
        </View>
        <TouchableOpacity onPress={() => this.showWorkerPopup(false)}
                          style={{
                            borderBottomWidth: 1,
                            borderColor: colors.colorCCC,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            height: pxToDp(90),
                          }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店长 </Text>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
            textAlign: "right",
          }}>
            {owner_id > 0 ? this.getStoreMgrName() : "点击选择店长"}
          </Text>
        </TouchableOpacity>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: colors.colorCCC,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            height: pxToDp(90),
          }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店长手机号 </Text>
          <TextInput
            onChangeText={mobile => this.setState({mobile})}
            value={mobile}
            maxLength={11} // 可输入的最大长度
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            placeholder="店长手机号"
            keyboardType="numeric" //默认弹出的键盘
            underlineColorAndroid="transparent" //取消安卓下划线
          />
        </View>

        <TouchableOpacity onPress={() => this.showWorkerPopup(true)}
                          style={{
                            borderBottomWidth: 1,
                            borderColor: colors.colorCCC,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            height: pxToDp(90),
                          }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店助 </Text>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
            textAlign: "right",
          }}>
            {this.getViceMgrName()}
          </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderPayInfo() {
    let {receiveSecretKey} = this.state
    return (

      <View style={{
        backgroundColor: colors.white,
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
      }}>

        <View style={{
          borderBottomWidth: 1,
          paddingBottom: 2,
          borderColor: colors.colorCCC
        }}>
          <Text style={{
            color: colors.color333,
            padding: 10,
            paddingLeft: 8,
            fontSize: 15,
            fontWeight: 'bold',
          }}>结算收款信息 </Text>
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>店长实名 </Text>
          <TextInput
            onChangeText={v => {
              this.setState({owner_name: v});
            }}
            value={this.state.owner_name}
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            underlineColorAndroid="transparent"
          />
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
          }}>收款密钥 </Text>
          {receiveSecretKey ?
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: colors.color333}}>{receiveSecretKey} </Text>
              <Button titleStyle={{color: colors.color333, fontSize: 14}}
                      buttonStyle={{width: 120, backgroundColor: colors.main_back}} title={'复制'}
                      onPress={() => this.copyReceiveSecretKey(receiveSecretKey)}/>
            </View> :
            <Button title={'获取收款密钥'} titleStyle={{color: colors.color333, fontSize: 14}}
                    buttonStyle={{width: 160, backgroundColor: colors.main_back}}
                    onPress={() => this.getReceiveSecretKey()}/>
          }
        </View>


      </View>
    )
  }

  renderBack() {
    return (
      <View>
        <TouchableOpacity onPress={() => {
          // ROUTE_SHOP_ORDER
          this.props.navigation.navigate(Config.ROUTE_SHOP_ORDER, {
            ship_way: this.state.ship_way,
            call_not_print: this.state.call_not_print,
            onBack: (res) => {
              this.setOrder.bind(this)(res)
            },
          })
        }} style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          borderRadius: 8,
          marginBottom: 10,
          height: pxToDp(90),
          backgroundColor: colors.white,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>订单信息 </Text>
          <Text style={{fontSize: 14, color: colors.color999, flex: 1}}>
            （选填，可不填）
          </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate(Config.ROUTE_SHOP_BANK, {
            bankcard_code: this.state.bankcard_code,
            bankcard_address: this.state.bankcard_address,
            bankcard_username: this.state.bankcard_username,
            onBack: (res) => {
              this.setBank.bind(this)(res)
            },
          })
        }} style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          borderRadius: 8,
          marginBottom: 10,
          height: pxToDp(90),
          backgroundColor: colors.white,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>银行卡信息 </Text>
          <Text style={{fontSize: 14, color: colors.color999, flex: 1}}>
            （选填，可不填）
          </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderOther() {

    let {
      owner_nation_id,
    } = this.state;

    return (
      <View style={{
        backgroundColor: colors.white,
        borderRadius: 8,
        marginBottom: 100,
        padding: 10,
      }}>

        <View style={{
          borderBottomWidth: 1,
          paddingBottom: 2,
          borderColor: colors.colorCCC
        }}>
          <Text style={{
            color: colors.color333,
            padding: 10,
            paddingLeft: 8,
            fontSize: 15,
            fontWeight: 'bold',
          }}>其他信息 </Text>
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>门店类型 </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              this.setState({
                fn_price_controlled: option.value,
                fn_price_controlledname: option.label
              });
            }}
            data={this.state.shoptypes}
            skin="customer"
            defaultKey={-999}
          >
            <Text style={{fontSize: 14, color: colors.color333, textAlign: 'right'}}>
              {this.state.fn_price_controlledname || '点击选择门店类型'}
            </Text>
          </ModalSelector>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </View>
        <TouchableOpacity onPress={() =>
          this.props.navigation.navigate(
            Config.ROUTE_SELECT_QUALIFICATION,
            {
              imageList: this.state.imageList,
              storeImageUrl: this.state.storeImageUrl,
              storeImageInfo: this.state.storeImageInfo,
              bossImageUrl: this.state.bossImageUrl,
              bossImageInfo: this.state.bossImageInfo,
              callback: qualification => {
                this.doUploadImg(qualification);
              }
            }
          )
        } style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>商家资质 </Text>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            flex: 1,
            textAlign: "right",
          }}> {this.state.qualification.name || '点击上传'} </Text>
          <Entypo name="chevron-thin-right" style={{
            color: colors.color666,
            fontSize: 18,
          }}/>
        </TouchableOpacity>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>身份证号 </Text>
          <TextInput
            onChangeText={owner_nation_id =>
              this.setState({owner_nation_id})
            }
            value={owner_nation_id}
            maxLength={18} // 可输入的最大长度
            placeholder="请输入本人身份证号"
            keyboardType="numeric" //默认弹出的键盘
            style={{
              textAlign: 'right',
              fontSize: 14,
              flex: 1,
              height: pxToDp(90),
            }}
            underlineColorAndroid="transparent"
          />
        </View>


        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>选择模版店 </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              this.setState({
                templateInfo: {
                  key: option.key,
                  label: option.label
                }
              });
            }}
            data={this.state.templateList}
            skin="customer"
            defaultKey={-999}
          >
            <Text style={{fontSize: 14, color: colors.color333, textAlign: 'right'}}>
              {this.state.templateInfo.label || "点击选择模板店"}
            </Text>
          </ModalSelector>
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
          }}>选择BD </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              this.setState({
                bdInfo: {
                  key: option.key,
                  label: option.label
                }
              });
            }}
            data={this.state.bdList}
            skin="customer"
            defaultKey={-999}
          >
            <Text style={{fontSize: 14, color: colors.color333, textAlign: 'right'}}>
              {this.state.bdInfo.label || "点击选择bd"}
            </Text>
          </ModalSelector>
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          padding: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: colors.color333,
            marginTop: 5
          }}>备注: </Text>
          <TextArea
            value={this.state.remark}
            onChange={(remark) => {
              this.setState({remark})
            }}
            showCounter={false}
            underlineColorAndroid="transparent" //取消安卓下划线
            style={{
              borderWidth: 1,
              borderColor: '#efefef',
              height: 100,
              width: 260,
              marginLeft: 15,
              backgroundColor: colors.main_back
            }}
          >
          </TextArea>
        </View>
      </View>
    )
  }

  renderBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'确认修改'}
                onPress={() => {
                  this.props.navigation.navigate(config.ROUTE_BIND_MEITUAN)
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
    )
  }
}


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreInfo);
