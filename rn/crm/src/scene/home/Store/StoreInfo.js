import React, {Component} from "react";
import {
  Alert,
  Appearance,
  InteractionManager,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Clipboard from '@react-native-community/clipboard';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {copyStoreGoods, saveOfflineStore} from "../../../reducers/mine/mineActions";

import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import tool, {simpleBarrier} from "../../../pubilc/util/tool";
import Entypo from "react-native-vector-icons/Entypo";
import Config from "../../../pubilc/common/config";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {hideModal, showError, showModal, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import {Button} from "react-native-elements";
import _ from "lodash";
import {uploadImg} from "../../../reducers/product/productActions";
import {TextArea} from "../../../weui";
import WorkerPopup from "../../common/component/WorkerPopup";
import Cts from "../../../pubilc/common/Cts";
import DateTimePicker from "react-native-modal-datetime-picker";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

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

    let {currVendorId, is_service_mgr,} = tool.vendor(this.props.global);
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
      isServiceMgr: is_service_mgr,  //是否是业务人员 BD+运营
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
      shelfNos: [],
      shoptypes: [{label: '托管店', value: '1'}, {label: '联营店', value: '0'}],
      pickerValue: "",
      timemodalType: false,
      sale_category_name: "",
      sale_category: "",
      bankcard_code: "",
      bankcard_address: "",
      bankcard_username: "",
      datePickerValue: new Date(),
      is_mgr: this.props.route.params.is_mgr ? this.props.route.params.is_mgr : false,
      store_id: 0,
      type: 0
    };


  }

  componentDidMount() {
    this.fetchcategories();
    let {editStoreId} = this.props.route.params;
    if (editStoreId) {
      this.fetchDeliveryErrorNum();
      const api = `api/read_store/${editStoreId}?access_token=${this.props.global.accessToken}`
      HttpUtils.get.bind(this.props)(api).then(store_info => {
        this.setStateByStoreInfo(store_info, this.state.currVendorId, this.props.global.accessToken);
      })
    } else {
      this.setStateByStoreInfo({}, this.state.currVendorId, this.props.global.accessToken)
    }
  }

  setStateByStoreInfo = (store_info, currVendorId, accessToken) => {
    let {
      id = 0, //store_id
      alias = "",
      name = "",
      type = currVendorId,
      district = "",
      owner_name = "",
      owner_nation_id = "",
      location_long = "",
      location_lat = "",
      deleted = 0,
      tel = "",
      mobile = "",
      files = [],
      dada_address = "",
      owner_id = "",
      open_end = "19:00:00",
      open_start = "09:00:00",
      vice_mgr = 0,
      call_not_print = "0",
      ship_way = Cts.SHIP_AUTO,
      city = undefined,
      city_code = undefined,
      fn_price_controlled = 1,
      reservation_order_print = -1,
      sale_category_name,
      sale_category,
      open_time_conf,
    } = store_info || {};


    //门店照片的地址呀
    let storeImageUrl = undefined;
    let bossImageUrl = undefined;
    let imageList = [];
    let existImgIds = [];

    if (files && files.length) {
      //初始化已有图片
      files.map(element => {
        existImgIds.push(element.id);
        if (element.modelclass === "StoreImage") {
          storeImageUrl = {
            url: Config.staticUrl(element.thumb),
            id: element.id
          };
        } else if (element.modelclass === "StoreBoss") {
          bossImageUrl = {
            url: Config.staticUrl(element.thumb),
            id: element.id
          };
        } else {
          imageList.push({
            imageUrl: {url: Config.staticUrl(element.thumb), id: element.id},
            imageInfo: undefined
          });
        }
      });
    }

    this.setState({
      open_time_conf,
      store_id: id > 0 ? id : 0,
      type: type, //currVendorId
      district: district, //所属区域
      owner_name: owner_name, //店主收款人姓名
      owner_nation_id: owner_nation_id, //身份证号
      location_long: location_long,
      location_lat: location_lat,
      deleted: deleted,
      tel: tel, //门店电话
      mobile: mobile, //店长电话
      dada_address: dada_address, //门店地址
      owner_id: owner_id, //店长ID
      open_end: open_end,
      open_start: open_start,
      vice_mgr: vice_mgr, //店副ID
      call_not_print: call_not_print, //未打印通知
      ship_way: ship_way, //配送方式
      fn_price_controlledname: fn_price_controlled === `1` ? '托管店' : '联营店', //是否是托管
      fn_price_controlled: fn_price_controlled,
      reservation_order_print,
      sale_category_name,
      sale_category,
      selectCity: {
        cityId: city ? city_code : undefined,
        name: city ? city : "点击选择城市"
      },
      qualification: {
        name: files && tool.length(files) ? "资质已上传" : "点击上传资质",
        info: undefined
      }, //上传资质
      alias: alias, //别名
      name: name, //店名
      imageList:
        files && files.length
          ? imageList
          : [
            {id: 1, imageUrl: undefined, imageInfo: undefined},
            {id: 2, imageUrl: undefined, imageInfo: undefined},
            {id: 3, imageUrl: undefined, imageInfo: undefined}
          ],
      storeImageUrl: storeImageUrl, //门店照片
      bossImageUrl: bossImageUrl,
      existImgIds: existImgIds,
    })

    let url = `api/get_tpl_stores/${currVendorId}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      let arr = [];
      for (let i in res) {
        arr.push(res[i]); //属性
      }
      let selectTemp = [{key: -999, section: true, label: "选择模板店"}];
      for (let item of arr) {
        if (
          store_info &&
          store_info.tpl_store &&
          item.id === store_info.tpl_store
        ) {
          this.setState({
            templateInfo: {
              key: item.id,
              label: item.name
            }
          });
        }
        let value = {
          key: item.id,
          label: item.name
        };
        selectTemp.push(value);
      }
      this.setState({
        templateList: selectTemp
      });
    }).catch((res) => {
      ToastLong(res.reason)
    })

    let bdUrl = `api/get_bds/${currVendorId}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(bdUrl).then(res => {
      let arr = [];
      for (let i in res) {
        arr.push(res[i]); //属性
      }

      let selectTemp = [{key: -999, section: true, label: "选择bd"}];
      let data = _.toPairs(res);
      for (let item of data) {
        if (
          store_info &&
          store_info.service_bd &&
          item[0] === store_info.service_bd
        ) {
          this.setState({
            bdInfo: {
              key: item[0],
              label: item[1]
            }
          });
        }
        let value = {
          key: item[0],
          label: item[1]
        };
        selectTemp.push(value);
      }
      this.setState({
        bdList: selectTemp
      });
    }).catch((res) => {
      ToastLong(res.reason)
    })

  }


  fetchcategories() {
    showModal('加载中')
    const {accessToken} = this.props.global
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

    let isServiceMgrUrl = `api/is_service_mgr/${this.state.currVendorId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(isServiceMgrUrl).then(res => {
      this.setState({
        isServiceMgr: res.is_mgr
      })
    }).catch((res) => {
      ToastLong(res.reason)
    })

    let isBdUrl = `api/is_bd/${this.state.currVendorId}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(isBdUrl).then(res => {
      hideModal()
      this.setState({
        isBd: res.is_bd
      })
    }).catch((res) => {
      hideModal()
      ToastLong(res.reason)
    })
  }

  fetchDeliveryErrorNum() {
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
        store_mgr_name = this.state.createUserName || '未知'
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
          if (mgr_name) {
            if (vice_mgr_name !== "") {
              vice_mgr_name += ",";
            }
            vice_mgr_name += mgr_name;
          }
        }
      }
    }
    return vice_mgr_name || "点击选择店助"
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
    this.onPress(Config.ROUTE_USER_ADD, {
      type: 'add',
      pageFrom: 'storeAdd',
      store_id: this.state.store_id,
      onBack: (userId, userMobile, userName) => this.onCreateUser(userId, userMobile, userName, is_vice)
    });
    return false;
  }

  onCreateUser(userId, userMobile, userName, isViceMgr) {
    if (isViceMgr) {
      if (userId > 0) {
        const vice_mgr = this.state.vice_mgr;
        let viceMgrs = vice_mgr ? vice_mgr.split(",") : []
        if (viceMgrs.indexOf(userId) === -1) {
          viceMgrs.push(userId)
          this.setState({
            vice_mgr: viceMgrs.join(",")
          })
        }
      }
    } else {
      this.setState({
        owner_id: userId,
        mobile: userMobile,
        createUserName: userName
      });
    }
  }


  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);

    });
  }

  setAddress(res) {
    let lat = res.location.split(",")[1];
    let Lng = res.location.split(",")[0];
    let states = {
      location_long: Lng,
      location_lat: lat,
    }
    if (res.cityname && res.citycode) {
      states.selectCity = {
        name: res.cityname,
        cityId: res.citycode
      }
    }
    if (res.address) {
      states.dada_address = res.address;
    }
    if (res.adname) {
      states.district = res.adname
    }
    this.setState(states)
  }

  doUploadImg = qualification => {
    this.setState({
      isUploadingImage: true
    });
    let barrier = simpleBarrier();
    this.upload(qualification.bossImageInfo, "StoreBoss", barrier);
    this.upload(qualification.storeImageInfo, "StoreImage", barrier);
    qualification.imageList.map(element => {
      this.upload(element.imageInfo, "StoreImageList", barrier);
    });
    let doneUpload = () => {
      let rmIds = qualification.rmIds;
      let existImgIds = this.state.existImgIds;
      let ids = _.difference(existImgIds, rmIds); //去掉rmids中的和existimgids中重复的去掉 返回去重后的existImgIds
      let fileIds = this.fileId;
      fileIds = fileIds.concat(ids);
      this.fileId = fileIds;
      this.setState({
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


  onStoreAdd() {
    if (this.state.isUploadingImage) {
      ToastLong("商家资质正在上传！请稍后再提交！");
      return false;
    }
    if (this.state.onSubmitting) {
      ToastLong("正在提交...");
      return false;
    }
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let _this = this;
    if (this.onCheckData()) {
      let {
        currVendorId,
        btn_type,
        store_id,
        type,
        alias,
        name,
        district,
        owner_name,
        owner_nation_id,
        location_long,
        location_lat,
        deleted,
        tel,
        mobile,
        dada_address,
        owner_id,
        open_end,
        open_start,
        vice_mgr,
        call_not_print,
        ship_way,
        printer_cfg,
        auto_add_tips,
        fn_price_controlled,
        bankcard_code,
        bankcard_address,
        bankcard_username,
        reservation_order_print,
        remark,
        sale_category
      } = this.state;

      let send_data = {
        app_open_time_conf: JSON.stringify(this.state.open_time_conf),
        type: type, //品牌id
        name: name,
        city: this.state.selectCity.name,
        owner_name: owner_name,
        owner_nation_id: owner_nation_id,
        owner_id: owner_id,
        mobile: mobile,
        tel: tel,
        dada_address: dada_address,
        location_long: location_long,
        location_lat: location_lat,
        open_start: open_start,
        open_end: open_end,
        district: district,
        call_not_print: call_not_print,
        ship_way: ship_way,
        vice_mgr: vice_mgr,
        remark: remark,
        bankcard_code: bankcard_code,
        reservation_order_print: reservation_order_print,
        bankcard_address: bankcard_address,
        bankcard_username: bankcard_username,
        fn_price_controlled: fn_price_controlled,
        sale_category
      };
      if (this.state.isServiceMgr || this.state.isBd) {
        send_data["tpl_store"] = this.state.templateInfo.key ? this.state.templateInfo.key : 0;

        send_data["service_bd"] = this.state.bdInfo.key ? this.state.bdInfo.key : 0;
      }

      if (this.state.isBd) {
        send_data["attachment"] = this.state.fileId.join(",");
      }
      if (store_id > 0) {
        send_data.id = store_id;
      }
      _this.setState({onSubmitting: true});
      showModal('提交中')
      InteractionManager.runAfterInteractions(() => {
        dispatch(
          saveOfflineStore(send_data, accessToken, resp => {
            hideModal()
            _this.setState({onSubmitting: false});
            if (resp.ok) {
              let msg = btn_type === "add" ? "添加门店成功" : "操作成功";
              ToastShort(msg);
              if (btn_type === "edit" && resp.obj.is_pop_sync_window) {
                Alert.alert('提示', '您的门店信息发生改变，请同步配送平台信息。如果是自有账号，请联系对应配送方业务经理。', [{
                  text: '去同步',
                  onPress: () => {
                    this.onPress(Config.ROUTE_DELIVERY_LIST);
                  },
                }])
              }
              if (this.props.route.params.actionBeforeBack) {
                this.props.route.params.actionBeforeBack({shouldRefresh: true});
              }
              _this.props.navigation.goBack();

            }
          })
        );
      });
    }
  }


  onCheckData() {
    let {
      name,
      district,
      owner_name,
      owner_nation_id,
      location_long,
      location_lat,
      tel,
      mobile,
      dada_address,
      owner_id,
      open_end,
      open_start,
      vice_mgr,
      call_not_print,
      ship_way,
      printer_cfg,
      auto_add_tips,
      sale_category
    } = this.state;
    let error_msg = "";

    if (tool.length(name) < 1 || tool.length(name) > 64) {
      error_msg = "店名应在1-64个字符内";
    } else if (!sale_category) {
      error_msg = "请选择店铺类型";
    } else if (tool.length(tel) < 8 || tool.length(tel) > 11) {
      error_msg = "门店电话格式有误";
    } else if (tool.length(dada_address) < 1) {
      error_msg = "请输入门店地址";
    } else if (tool.length(district) < 1) {
      error_msg = "请输入门店所在区域";
    } else if (location_long === "" || location_lat === "") {
      error_msg = "请选择门店定位信息";
    } else if (!this.state.selectCity.cityId) {
      error_msg = "请选择门店所在城市";
    } else if (!owner_nation_id || (tool.length(owner_nation_id) !== 18 && tool.length(owner_nation_id) !== 11)) {
      // error_msg = "身份证格式有误";
    } else if (this.state.isBd && !this.state.templateInfo.key) {
      // error_msg = "请选择模板店";
    } else if (this.state.isBd && !this.state.bdInfo.key) {
      // error_msg = "请选择bd";
    } else if (!(owner_id > 0)) {
      error_msg = "请选择门店店长";
    } else if (tool.length(mobile) !== 11) {
      error_msg = "店长手机号格式有误";
    } else if (!owner_name) {
      error_msg = "请输入店长实名";
    }
    if (error_msg === "") {
      this.setState({onSubmitting: true});
      showModal('提交中')
      return true;
    } else {
      ToastLong(error_msg);
      return false;
    }
  }

  _hideDateTimePicker = () =>
    this.setState({
      isStartVisible: false,
      isEndVisible: false
    });


  _handleDatePicked = (date) => {
    let Hours = date.getHours();
    let Minutes = date.getMinutes();
    Hours = Hours < 10 ? "0" + Hours : Hours;
    Minutes = Minutes < 10 ? "0" + Minutes : Minutes;
    let confirm_time = `${Hours}:${Minutes}`;
    if (this.state.timerType === "start") {
      let end_hour = this.state.open_time_conf[this.state.timerIdx].end_time.split(":")[0];
      if (Hours > end_hour) {
        showError("开始营业时间不能大于结束营业时间");
      } else {
        this.state.open_time_conf[this.state.timerIdx].start_time = confirm_time;
        this.setState({open_time_conf: this.state.open_time_conf});
      }
    } else {
      let start_hour = this.state.open_time_conf[this.state.timerIdx].start_time.split(":")[0];
      if (start_hour > Hours) {
        showError("结束营业时间不能小于开始营业时间");
      } else {
        this.state.open_time_conf[this.state.timerIdx].end_time = confirm_time;
        this.setState({open_time_conf: this.state.open_time_conf});
      }
    }
    this._hideDateTimePicker()
  };

  render() {
    let {vice_mgr} = this.state
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <KeyboardAwareScrollView enableOnAndroid={false}
                                 style={{flex: 1, backgroundColor: colors.f2, marginHorizontal: 10}}>
          {this.renderErrmsg()}
          {this.renderStoreInfo()}
          {this.renderWorker()}
          {this.renderPayInfo()}
          {this.renderBack()}
          {this.renderOther()}
        </KeyboardAwareScrollView>
        <WorkerPopup
          multiple={this.state.workerPopupMulti}
          visible={this.state.workerPopupVisible}
          selectWorkerIds={vice_mgr ? vice_mgr.split(",") : []}
          onClickWorker={(worker) => {
            this.setState({
              workerPopupVisible: false,
              owner_id: worker.id,
              mobile: worker.mobilephone ? worker.mobilephone : "",
              createUserName: worker.name ? worker.name : "",
            });
          }}
          onComplete={(workers) => {
            let vice_mgr = _.map(workers, 'id').join(",");
            this.setState({vice_mgr, workerPopupVisible: false});
          }}
          onCancel={() => this.setState({workerPopupVisible: false})}
        />
        {this.showDatePicker()}
        {this.renderTimeModal()}

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
          <Entypo name='chevron-thin-left' style={{fontWeight: "bold", fontSize: 20, marginLeft: 5}}/>
        </TouchableOpacity>
        <Text style={{flex: 1, color: "#4a4a4a", fontSize: 16, fontWeight: "bold", textAlign: "center"}}>{title} </Text>

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
          <Entypo name="dots-three-horizontal" style={{fontSize: 18, marginRight: 10}}/>
        </ModalSelector>
      </View>
    )
  }

  renderErrmsg() {
    return (
      <If condition={this.state.err_num > 0}>
        <View style={{flexDirection: 'row', marginTop: 5, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontSize: pxToDp(25), color: '#E88A8A', textDecorationLine: 'underline'}}>
            检测到{this.state.err_num}家配送平台所留信息不一致
          </Text>
          <Button onPress={() => this.onPress(Config.ROUTE_DELIVERY_LIST)}
                  title={'去修改'}
                  titleStyle={{fontSize: 12, color: colors.white}}
                  buttonStyle={{height: 30, marginLeft: pxToDp(40), backgroundColor: "#EE2626"}}>
            去修改
          </Button>
        </View>
      </If>
    )
  }

  renderStoreInfo() {
    let {name, location_long, location_lat, tel, dada_address, shelfNos} = this.state;
    return (
      <View style={{backgroundColor: colors.white, borderRadius: 8, marginVertical: 10, padding: 10,}}>
        <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
          <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
            门店信息
          </Text>
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{fontSize: 14}}>店铺名称</Text>
          <TextInput
            onChangeText={name => this.setState({name})}
            value={name}
            placeholder="64个字符以内"
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
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
          <Text style={{fontSize: 14}}>门店电话 </Text>
          <TextInput
            onChangeText={tel => this.setState({tel})}
            value={tel}
            placeholder="请输入店铺电话"
            maxLength={11} // 可输入的最大长度
            keyboardType="numeric" //默认弹出的键盘
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
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
          <Text style={{fontSize: 14}}>定位地址 </Text>

          <Text onPress={() => {
            let center = "";
            if (location_long && location_lat) {
              center = `${location_long},${location_lat}`;
            }
            const params = {
              center: center,
              show_select_city: false,
              keywords: this.state.dada_address,
              onBack: (res) => {
                this.setAddress.bind(this)(res)
              },
            };
            this.onPress(Config.ROUTE_SEARC_HSHOP, params);
          }} style={{fontSize: 14, color: colors.color333, flex: 1, textAlign: "right"}}>
            {location_long !== "" && location_lat !== "" && location_lat !== undefined
              ? `${location_long}、${location_lat}`
              : "点击选择地址"}
          </Text>

          <Entypo name="location-pin" style={{color: colors.main_color, fontSize: 20,}}/>

        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{fontSize: 14,}}>门店地址 </Text>
          <TextInput
            onChangeText={dada_address => this.setState({dada_address})}
            value={dada_address}
            placeholder="请输入门店地址"
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
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
          <Text style={{fontSize: 14}}>店铺类型 </Text>

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
            <Text style={{fontSize: 14, color: colors.color333, textAlign: 'right'}}>
              {this.state.sale_category_name || '点击选择店铺类型'}
            </Text>
          </ModalSelector>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18}}/>
        </View>

        <TouchableOpacity onPress={() => {
          this.setState({
            timemodalType: true
          })

        }} style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{fontSize: 14}}>营业时间 </Text>
          <View style={{flex: 1}}></View>
          <View>
            <If condition={this.state.open_time_conf}>
              <For of={this.state.open_time_conf} index="idx" each="item">
                <Text style={{fontSize: 14}} key={idx}>{item.start_time} —— {item.end_time} </Text>
              </For>
            </If>

            <If condition={!this.state.open_time_conf}>
              <Text style={{fontSize: 14}}>设置营业时间</Text>
            </If>
          </View>

          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18}}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderWorker() {
    let {mobile, owner_id,} = this.state;
    return (
      <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, padding: 10,}}>

        <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
          <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
            店长信息
          </Text>
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
          <Text style={{fontSize: 14}}>店长 </Text>
          <Text style={{fontSize: 14, flex: 1, textAlign: "right"}}>
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
          <Text style={{fontSize: 14}}>店长手机号 </Text>
          <TextInput
            onChangeText={mobile => this.setState({mobile})}
            value={mobile}
            maxLength={11} // 可输入的最大长度
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
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
          <Text style={{fontSize: 14}}>店助 </Text>
          <Text style={{fontSize: 14, flex: 1, textAlign: "right"}}>
            {this.getViceMgrName()}
          </Text>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18,}}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderPayInfo() {
    let {receiveSecretKey} = this.state
    return (

      <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, padding: 10}}>

        <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
          <Text style={{padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>结算收款信息 </Text>
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{fontSize: 14}}>店长实名 </Text>
          <TextInput
            onChangeText={owner_name => {
              if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                this.setState({owner_name});
              } else {
                ToastShort('联系BD/运营人员修改')
              }

            }}
            value={this.state.owner_name}
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
            underlineColorAndroid="transparent"
          />
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8
        }}>
          <Text style={{fontSize: 14, width: 80}}>收款密钥 </Text>
          {receiveSecretKey ?
            <View style={{flexDirection: "row"}}>
              <Text style={{color: colors.color333, width: 140}}>{receiveSecretKey} </Text>
              <Button titleStyle={{color: colors.color333, fontSize: 14}}
                      buttonStyle={{width: 60, marginLeft: 10, backgroundColor: colors.f2}} title={'复制'}
                      onPress={() => this.copyReceiveSecretKey(receiveSecretKey)}/>
            </View> :
            <View style={{flex: 1}}>
              <Button title={'获取收款密钥'} titleStyle={{color: colors.color333, fontSize: 14}}
                      buttonStyle={{width: 260, backgroundColor: colors.f2}}
                      onPress={() => {
                        if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                          this.getReceiveSecretKey()
                        } else {
                          ToastShort('联系BD/运营人员修改')
                        }
                      }}/>
            </View>
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
          <Text style={{fontSize: 14}}>订单信息 </Text>
          <Text style={{fontSize: 14, color: colors.color999, flex: 1}}>
            （选填，可不填）
          </Text>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18}}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
            this.props.navigation.navigate(Config.ROUTE_SHOP_BANK, {
              bankcard_code: this.state.bankcard_code,
              bankcard_address: this.state.bankcard_address,
              bankcard_username: this.state.bankcard_username,
              onBack: (res) => {
                this.setBank.bind(this)(res)
              },
            })
          } else {
            ToastShort('联系BD/运营人员修改')
          }

        }} style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          borderRadius: 8,
          marginBottom: 10,
          height: pxToDp(90),
          backgroundColor: colors.white,
        }}>
          <Text style={{fontSize: 14}}>银行卡信息 </Text>
          <Text style={{fontSize: 14, color: colors.color999, flex: 1}}>
            （选填，可不填）
          </Text>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18,}}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderOther() {

    let {owner_nation_id,} = this.state;

    return (
      <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 100, padding: 10}}>

        <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
          <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
            其他信息
          </Text>
        </View>

        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: pxToDp(90),
        }}>
          <Text style={{fontSize: 14}}>
            门店类型
          </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                this.setState({
                  fn_price_controlled: option.value,
                  fn_price_controlledname: option.label
                });
              } else {
                ToastShort('联系BD/运营人员修改')
              }

            }}
            data={this.state.shoptypes}
            skin="customer"
            defaultKey={-999}
          >
            <Text style={{fontSize: 14, color: colors.color333, textAlign: 'right'}}>
              {this.state.fn_price_controlledname || '点击选择门店类型'}
            </Text>
          </ModalSelector>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18}}/>
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
          <Text style={{fontSize: 14}}>商家资质 </Text>
          <Text style={{fontSize: 14, flex: 1, textAlign: "right"}}>
            {this.state.qualification.name || '点击上传'}
          </Text>
          <Entypo name="chevron-thin-right" style={{color: colors.color666, fontSize: 18}}/>
        </TouchableOpacity>
        <View style={{
          borderBottomWidth: 1,
          borderColor: colors.colorCCC,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          <Text style={{fontSize: 14}}>身份证号 </Text>
          <TextInput
            onChangeText={owner_nation_id => this.setState({owner_nation_id})}
            value={owner_nation_id}
            maxLength={18} // 可输入的最大长度
            placeholder="请输入本人身份证号"
            keyboardType="numeric" //默认弹出的键盘
            style={{textAlign: 'right', fontSize: 14, flex: 1, height: pxToDp(90)}}
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
          <Text style={{fontSize: 14}}>选择模版店 </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                this.setState({
                  templateInfo: {
                    key: option.key,
                    label: option.label
                  }
                });
              } else {
                ToastShort('联系BD/运营人员修改')
              }
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
          <Text style={{fontSize: 14}}>选择BD </Text>
          <ModalSelector
            style={{flex: 1}}
            onChange={option => {
              if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                this.setState({
                  bdInfo: {
                    key: option.key,
                    label: option.label
                  }
                });
              } else {
                ToastShort('联系BD/运营人员修改')
              }
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
        <View style={{borderBottomWidth: 1, borderColor: colors.colorCCC, flexDirection: 'row', padding: 8}}>
          <Text style={{fontSize: 14, marginTop: 5}}>备注: </Text>
          <TextArea
            multiline={true}
            numberOfLines={4}
            value={this.state.remark}
            onChange={(remark) => {
              if (this.state.isServiceMgr || this.state.isBd || this.props.route.params.btn_type === "add") {
                this.setState({remark})
              } else {
                ToastShort('联系BD/运营人员修改')
              }
            }}
            showCounter={false}
            underlineColorAndroid="transparent" //取消安卓下划线
            style={{
              borderWidth: 1,
              borderColor: '#efefef',
              height: 100,
              width: 260,
              marginLeft: 15,
              backgroundColor: colors.f2
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
        <Button title={this.state.btn_type === "edit" ? "确认修改" : "创建门店"}
                onPress={() => this.onStoreAdd()}
                buttonStyle={{borderRadius: pxToDp(10), backgroundColor: colors.main_color}}
                titleStyle={{color: colors.white, fontSize: 16}}
        />
      </View>
    )
  }

  showDatePicker() {
    let {datePickerValue} = this.state
    return <View style={{marginTop: 12}}>
      <DateTimePicker
        cancelTextIOS={'取消'}
        headerTextIOS={'选择日期'}
        isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
        confirmTextIOS={'确定'}
        customHeaderIOS={() => {
          return (
            <Text style={{fontSize: pxToDp(20), textAlign: 'center', lineHeight: pxToDp(40), paddingTop: pxToDp(20)}}>
              选择营业时间
            </Text>
          )
        }}
        date={new Date()}
        mode='time'
        isVisible={this.state.isShowTimepicker}
        onConfirm={(value) => this._handleDatePicked(value)}
        onCancel={() => this.setState({isShowTimepicker: false})}
      />
    </View>
  }

  renderTimeModal() {
    return (
      <Modal visible={this.state.timemodalType}
             onRequestClose={() => this.setState({timemodalType: false})}
             transparent={true} animationType="slide"
      >
        <TouchableOpacity
          style={{backgroundColor: 'rgba(0,0,0,0.15)', flex: 3, minHeight: pxToDp(200)}}
          onPress={() => this.setState({timemodalType: false})}>
        </TouchableOpacity>

        <ScrollView style={{backgroundColor: colors.fa}}
                    overScrollMode="always"
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}>

          <View style={{backgroundColor: colors.fa}}>
            <View style={{
              marginHorizontal: 10,
              borderBottomLeftRadius: pxToDp(20),
              borderBottomRightRadius: pxToDp(20),
              backgroundColor: colors.white,
              flexDirection: "column",
              justifyContent: "space-evenly",
              marginBottom: pxToDp(10)
            }}>
              <View style={{padding: pxToDp(20)}}>
                <Text style={{color: colors.color333}}>营业时间</Text>
              </View>


              {this.state.open_time_conf && this.state.open_time_conf.map((timeItem, idx) => {
                return (<View style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderTopColor: "#f7f7f7"
                }}>
                  <View style={{paddingVertical: pxToDp(4)}}>
                    <TouchableOpacity
                      onPress={() => {
                        this.state.timerIdx = idx
                        this.state.timerType = "start"
                        this.setState({isStartVisible: true, isShowTimepicker: true});
                      }}
                    >
                      <Text style={{
                        paddingLeft: pxToDp(8),
                        fontSize: pxToDp(30),
                        color: colors.color333,
                        lineHeight: pxToDp(70),
                        height: pxToDp(70),
                        textAlignVertical: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "right",
                      }}>{timeItem.start_time} </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{paddingVertical: pxToDp(4)}}>
                    <Text style={{color: colors.color333}}>——</Text>
                  </View>
                  <View style={{paddingVertical: pxToDp(4)}}>
                    <TouchableOpacity
                      onPress={() => {
                        this.state.timerIdx = idx
                        this.state.timerType = "end"
                        this.setState({isStartVisible: true, isShowTimepicker: true});
                      }}
                    >
                      <Text style={{
                        paddingLeft: pxToDp(8),
                        fontSize: pxToDp(30),
                        color: colors.color333,
                        lineHeight: pxToDp(70),
                        height: pxToDp(70),
                        textAlignVertical: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "right",
                      }}>{timeItem.end_time} </Text>
                    </TouchableOpacity>

                  </View>
                  <View style={{paddingVertical: pxToDp(4)}}>
                    <TouchableOpacity
                      onPress={() => {
                        let arr = [];
                        this.state.open_time_conf.map((val, index) => {
                          if (index !== idx) {
                            arr.push(val)
                          }
                        })
                        this.setState({open_time_conf: arr, isStartVisible: false})
                      }}
                    >
                      <Text style={{color: colors.color333}}>❌</Text>
                    </TouchableOpacity>
                  </View>
                </View>)
              })}


              {this.state.isStartVisible && this.showDatePicker()}

              {tool.length(this.state.open_time_conf) < 3 ?
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  marginVertical: pxToDp(15),
                  marginBottom: pxToDp(10)
                }}>
                  <View style={{flex: 1}}>
                    <TouchableOpacity onPress={() => {
                      let timeobj = {};
                      timeobj['start_time'] = "00:00";
                      timeobj['end_time'] = "24:00";
                      if (!this.state.open_time_conf) {
                        this.state.open_time_conf = []
                      }
                      this.state.open_time_conf.push(timeobj);
                      this.setState({
                        open_time_conf: this.state.open_time_conf
                      })

                    }} style={{marginHorizontal: pxToDp(10)}}>
                      <Text
                        style={{
                          height: 40,
                          color: colors.main_color,
                          fontSize: pxToDp(30),
                          fontWeight: "bold",
                          textAlign: "center",
                          paddingTop: pxToDp(15),
                          paddingHorizontal: pxToDp(30),
                          borderRadius: pxToDp(10),
                          marginBottom: pxToDp(20),
                        }}>添加营业时间</Text>
                    </TouchableOpacity>
                  </View>
                </View> : null}
              <TouchableOpacity
                onPress={() => {
                  const {accessToken} = this.props.global;
                  if (this.props.route.params.btn_type === "add") {
                    this.setState({
                      timemodalType: false
                    })
                    return
                  }
                  const api = `/v1/new_api/stores/update_store_business_time?access_token=${accessToken}`
                  HttpUtils.get.bind(this.props)(api, {
                    app_open_time_conf: JSON.stringify(this.state.open_time_conf),
                    store_id: this.state.store_id
                  }).then((res) => {
                    this.setState({
                      timemodalType: false
                    })
                    ToastLong(res.reason)
                  }, ((res) => {
                    this.setState({
                      timemodalType: false
                    })
                    ToastLong('操作失败：' + res.reason)
                  })).catch((e) => {
                    this.setState({
                      timemodalType: false
                    })
                    ToastLong('操作失败：' + e.desc)
                  })
                }}
              ><Text style={{
                height: 40,
                backgroundColor: colors.main_color,
                color: 'white',
                fontSize: pxToDp(30),
                fontWeight: "bold",
                textAlign: "center",
                paddingTop: pxToDp(15),
                paddingHorizontal: pxToDp(30),
                borderRadius: pxToDp(10)
              }}>修 改</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    )
  }
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreInfo);
