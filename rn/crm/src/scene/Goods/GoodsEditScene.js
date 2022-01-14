import React, {PureComponent} from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {ActionSheet, Button, Dialog} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchSgTagTree, productSave, uploadImg} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../common/tool";
import Cts from "../../Cts";
import {NavigationItem} from "../../widget";
import {hideModal, showError, showModal, ToastLong} from "../../util/ToastUtils";
import {QNEngine} from "../../util/QNEngine";
import {NavigationActions} from '@react-navigation/compat';
//组件
import {Left} from "../component/All";
import Icon from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import _ from 'lodash';
import Scanner from "../../Components/Scanner";
import HttpUtils from "../../util/http";
import Styles from "../../themes/Styles";
import Moment from "moment";
import {Button as AntButton, Icon as AntIcon, List, Modal, Provider} from '@ant-design/react-native';
import SegmentedControl from "@ant-design/react-native/es/segmented-control/segmented.android";

const Item = List.Item;

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        uploadImg,
        productSave,
        fetchSgTagTree,
        ...globalActions
      },
      dispatch
    )
  };
}

function checkImgURL(url) {
  return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const right = <Text style={{fontSize: 18, color: "#ccc", fontWeight: "bold"}}>&gt;</Text>;

/**
 * 导航带入的参数：
 * scan: true|false 支持默认打开扫码
 * type: add|edit
 * task_id: 任务id
 * backPage: 返回的页面
 */
class GoodsEditScene extends PureComponent {
  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    let {type} = params;
    navigation.setOptions({
      headerTitle: type === "edit" ? "修改商品" : "新增商品",
      headerRight: () => (type !== 'edit' &&
        <View style={{flexDirection: "row", paddingRight: pxToDp(30), height: pxToDp(72)}}>
          {type !== "edit" &&
          <NavigationItem icon={require("../../img/Goods/qr_scan_icon_2.jpg")} iconStyle={Styles.navLeftIcon}
                          onPress={() => this.startScan(true)} title="扫码新增"/>}
        </View>
      )
    });
  };

  constructor(props) {
    super(props);
    let {currVendorId, fnProviding} = tool.vendor(this.props.global);
    let {scan} = (this.props.route.params || {});
    this.state = {
      isLoading: false,
      isUploadImg: false,
      editable_upc: true,
      showRecommend: false,
      showImgMenus: false,
      buttonDisabled: true,
      //basic_cat_list: [],
      basic_categories: [],
      store_tags: {},
      sg_tag_tree: [],
      sku_units: [{label: "斤", key: 0}, {label: "个", key: 1}],
      head_supplies: [
        {label: "门店自采", key: Cts.STORE_SELF_PROVIDED},
        {label: "总部供货", key: Cts.STORE_COMMON_PROVIDED}
      ],
      selling_categories: [
        {label: "上架", key: Cts.STORE_PROD_ON_SALE},
        {label: "缺货", key: Cts.STORE_PROD_SOLD_OUT}
      ],

      scanBoolean: scan === true,
      goBackValue: false,
      selectToWhere: false,
      torchMode: "on",
      cameraType: "back",
      task_id: 0,
      vendor_id: currVendorId,
      fnProviding: fnProviding,
      visible: false,
      store_has: false,
      searchValue: '',
      categoryId: '',
      newArr: []
    };
    this.navigationOptions(this.props)
    this.startUploadImg = this.startUploadImg.bind(this)
    this.upLoad = this.upLoad.bind(this)
    this.back = this.back.bind(this)
    this.dataValidate = this.dataValidate.bind(this)
    this.renderSelectTag = this.renderSelectTag.bind(this)
  }

  UNSAFE_componentWillMount() {
    let {type} = this.props.route.params;
    this.initEmptyState();

    if (type === "edit") {
      let product_detail = tool.deepClone(
        this.props.route.params.product_detail
      );
      this.onReloadProd(product_detail);
    } else {
      let {task_id, name, images} = this.props.route.params || {};
      if (task_id && name) {
        let upload_files = {};
        let list_img = {};
        let cover_img = '';
        if (images && _.isArray(images)) {
          let validImages = _.filter(images, function (o) {
            return checkImgURL(o);
          });
          if (validImages && validImages.length > 0) {
            let idx = 0;
            cover_img = validImages[0];
            validImages.forEach(function (imgUrl) {
              idx = idx - 1;
              let name = imgUrl.replace(/^.*[\\\/]/, '');
              let imgPath = imgUrl.replace("https://www.cainiaoshicai.cn", "");
              list_img[idx] = {url: imgUrl, name: name};
              upload_files[idx] = {
                id: idx,
                name: name,
                path: imgPath,
                mid_thumb: imgPath
              }
            });
          }
        }
        this.setState({
          task_id: task_id,
          name: name,
          upload_files: upload_files,
          list_img: list_img,
          cover_img: cover_img
        });
      }
    }

    this.getSgTagTree()
    let {store_tags, basic_category} = this.props.product;
    let {vendor_id} = this.state;
    if (store_tags[vendor_id] === undefined || basic_category[vendor_id] === undefined) {
      this.getCascaderCate();
      this.getCatByVendor(vendor_id);
    } else {
      // let basic_cat_list = this.toModalData(basic_category[vendor_id]);
      this.setState({
        //   basic_cat_list: basic_cat_list,
        basic_categories: basic_category[vendor_id],
        store_tags: store_tags
      });
    }
  }

  getCascaderCate() {
    const {accessToken} = this.props.global;
    const url = `productSku/getCascaderSku?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((obj) => {
      this.setState({
        basic_categories: obj,
      },);
    })
  }


  getCatByVendor(_v_id) {
    if (_v_id > 0) {
      const {accessToken} = this.props.global;
      const url = `Stores/get_cat_by_vendor/${_v_id}/1/.json?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url).then((obj) => {
        this.setState({
          store_tags: obj
        },);
      })
    }
  }

  componentWillUnmount() {
    QNEngine.removeEmitter()
  }

  onClose = () => {
    this.setState({
      visible: false,
      basic_category_obj: {},
      sku_tag_id: 0,

    });
  };

  initEmptyState(appendState) {
    this.setState({
      provided: 1,
      name: "",
      sku_having_unit: "1",
      tag_info_nur: "",
      promote_name: "",
      list_img: {},
      selectedItems: [],
      cover_img: "",
      upload_files: {},
      price: "",
      basic_category_obj: {},
      basic_category: 0,
      sku_tag_id: 0,
      store_categories: [],
      tag_list: "选择门店分类",
      id: 0,
      sku_unit: "个",
      weight: "1",
      likeProds: [],
      upc: '',
      sale_status: Cts.STORE_PROD_ON_SALE, //默认为售卖状态
      transCode: '', //条码
      typeCode: '', //条码类型
      ...appendState
    })
  }

  isProdEditable = () => {
    let {type} = this.props.route.params;
    return type === 'edit' || (type === 'add' && this.state.id <= 0)
  }

  isStoreProdEditable = () => {
    let {type} = this.props.route.params;
    return type === 'add'
  }

  isAddProdToStore = () => {
    let {type} = this.props.route.params;
    return type === 'add' && this.state.id > 0
  }

  onReloadProd = (product_detail) => {
    const {
      basic_category, sku_tag_id, id, sku_unit, tag_list_id, name, weight, sku_having_unit, tag_list, tag_info_nur,
      promote_name, mid_list_img, coverimg, upc, store_has
    } = product_detail;

    let upload_files = {};
    if (tool.length(mid_list_img) > 0) {
      for (let img_id in mid_list_img) {
        if (mid_list_img.hasOwnProperty(img_id)) {
          let img_data = mid_list_img[img_id];
          upload_files[img_id] = {id: img_id, name: img_data.name};
        }
      }
    }

    this.setState({
      upc,
      name, id, sku_unit, weight, sku_having_unit,
      tag_info_nur: tag_info_nur || "",
      promote_name: promote_name || "",
      list_img: mid_list_img,
      cover_img: coverimg,
      upload_files: upload_files,
      sku_tag_id: sku_tag_id,
      basic_category: basic_category,
      store_categories: tag_list_id,
      tag_list: tag_list,
      store_has: store_has === 1 ? true : false,
    });
  }

  onReloadUpc = (upc_data) => {
    let upload_files = {};
    if (upc_data.pic) {
      let mid_list_img = [upc_data.pic];
      if (tool.length(mid_list_img) > 0) {
        for (let img_id in mid_list_img) {
          if (mid_list_img.hasOwnProperty(img_id)) {
            let img_data = mid_list_img[img_id];
            let name = tool.length(img_data.name) > 0 ? img_data.name : img_data;
            let path = tool.length(img_data.path) > 0 ? img_data.path : img_data;
            upload_files[img_id] = {id: img_id, name: name, path: path};
            this.setState({
              upload_files: upload_files,
            })
          }
        }
      }
    }
    if (tool.length(upc_data.basic_category_obj) !== 0) {
      this.setState({
        basic_category_obj: upc_data.basic_category_obj,
        sku_tag_id: upc_data.basic_category_obj.id
      })
    }
    this.setState({
      name: upc_data.name,
      upc: upc_data.barcode,
      weight: upc_data.grossweight,
      brand: upc_data.brand,
      cover_img: upc_data.pic,
    });
  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setParams({
      upLoad: this.upLoad,
      startScan: this.startScan,
    });

    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: (data) => {
        this.setState({loadingPercent: Number(data.percent * 100) + '%'})
      },
      onComplete: (data) => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          const {list_img, upload_files, newImageKey} = this.state;
          const uri = res + newImageKey
          const file_id = Object.keys(upload_files) + 1;
          list_img[file_id] = {url: uri, name: newImageKey}
          upload_files[file_id] = {id: 0, name: this.state.newImageKey, path: uri};

          hideModal()
          this.setState({
            list_img: list_img,
            upload_files: upload_files,
            isUploadImg: false
          });
        }, () => {
          ToastLong("获取上传图片的地址失败");
          hideModal()
          this.setState({
            isUploadImg: false
          });
        })
      },
      onError: (data) => {
        switch (data.code) {
          case '-2':
            ToastLong('任务已暂停', 2)
            break;
          default:
            ToastLong('错误：' + data.msg, 2)
            break;
        }
      }
    })
  }

  onNameChanged = (name) => {
    let {type} = this.props.route.params;
    this.setState({name})
    if (name && type !== 'edit') {
      this.recommendProdByName(name)
    }
  }

  onNameClear = () => {
    let {type} = this.props.route.params;
    if (type !== 'edit') {
      this.initEmptyState()
    }
    this.setState({name: '', showRecommend: false})
  }

  onRecommendTap = (prod) => {
    if (!prod['in_store']) {
      this.setState({showRecommend: false})
      this.onReloadProd(prod)
    }
  }

  onScanSuccess = (code) => {
    if (code) {
      this.initEmptyState({upc: code});
      this.getProdDetailByUpc(code)
    }
  }

  onScanFail = (code) => {
    Modal.alert('错误提示', '商品编码不合法，请重新扫描', [
      {text: '确定', onPress: () => console.log('ok')},
    ]);
  }


  onSgTagTreeValueChange = (item) => {
    console.log(item)
  }

  componentDidUpdate() {
    let {key, params} = this.props.route;
    let {store_categories, tag_list} = params || {};
    if (store_categories && tag_list) {
      this.setState({store_categories: store_categories, tag_list: tag_list});
    }
  }

  startScan = flag => {
    this.setState({scanBoolean: flag, store_has: false});
  };

  back() {
    this.props.navigation.goBack();
  }

  async setBeforeRefresh() {
    let {state, dispatch} = this.props.navigation;
    const setRefreshAction = NavigationActions.setParams({
      params: {isLoading: true},
      key: state.params.detail_key
    });
    dispatch(setRefreshAction);
  }

  // toModalData(obj) {
  //   let arr = [];
  //   Object.keys(obj).map(key => {
  //     if (`${key}` !== Cts.TAG_HIDE) {
  //       let json = {};
  //       json.label = obj[key];
  //       json.key = key;
  //       arr.push(json);
  //     }
  //   });
  //   return arr;
  // }

  goBackButtons = () => {
    const buttons = [{
      type: "default", label: "商品主页", onPress: () => {
        this.props.navigation.goBack();
        this.setState({selectToWhere: false});
      }
    }, {
      type: "primary", label: "继续添加", onPress: () => {
        this.setState({selectToWhere: false});
        this.onNameClear()
      }
    }];
    if (this.state.task_id > 0) {
      buttons.push({
        type: "default", label: "回申请页面", onPress: () => {
          this.setState({selectToWhere: false});
          this.props.navigation.navigate("Remind");
        }
      })
    }
    return buttons
  }


  upLoad = async () => {
    let {type} = this.props.route.params;
    if (!this.state.fnProviding) {
      this.setState({provided: Cts.STORE_COMMON_PROVIDED});
    }
    let {
      id,
      name,
      vendor_id,
      sku_unit,
      weight,
      sku_having_unit,
      sku_tag_id,
      store_categories,
      upload_files,
      price,
      sale_status,
      provided,
      task_id
    } = this.state;

    const {accessToken, currStoreId} = this.props.global;

    let formData = {
      id,
      vendor_id,
      name,
      sku_unit,
      weight,
      sku_having_unit,
      sku_tag_id,
      store_categories,
      upload_files,
      task_id,
      upc: this.state.upc,
      limit_stores: [currStoreId],
    };
    if (type === "add") {
      formData.store_goods_status = {
        price: price,
        sale_status: sale_status,
        provided: provided
      };
    }
    const {dispatch} = this.props;
    let check_res = this.dataValidate(formData);
    const save_done = async (ok, reason, obj) => {
      hideModal()
      this.setState({uploading: false});
      if (ok) {
        this.setState({selectToWhere: true});
      } else {
        ToastLong(reason);
      }
    }

    if (check_res) {
      showModal('提交中')
      this.setState({uploading: true});
      if (this.state.uploading) {
        return false;
      }
      if (this.isAddProdToStore()) {
        this.addProdToStore(save_done)
      } else {
        dispatch(
          productSave(formData, accessToken, save_done)
        );
      }
    }
  };

  dataValidate(formData) {
    let type = this.props.route.params.type;
    const {
      id,
      name,
      vendor_id,
      sku_unit,
      weight,
      sku_having_unit,
      sku_tag_id,
      store_categories,
    } = formData;
    let err_msg = "";
    if (type === "edit" && id <= 0) {
      err_msg = "数据异常, 无法保存";
    } else if (type === "add") {
      //增加商品
      let {price, sale_status, provided} = formData.store_goods_status;
      if (parseInt(price) < 0) {
        err_msg = "请输入正确的商品价格";
      } else if (!price) {
        err_msg = "请输入商品价格";
      } else if (
        !(
          sale_status === Cts.STORE_PROD_ON_SALE ||
          sale_status === Cts.STORE_PROD_SOLD_OUT
        )
      ) {
        err_msg = "请选择售卖状态";
      } else if (
        !(
          provided === Cts.STORE_SELF_PROVIDED ||
          provided === Cts.STORE_COMMON_PROVIDED
        )
      ) {
        err_msg = "选择供货方式";
      }
    }

    if (!this.isAddProdToStore()) {
      if (name.length <= 0) {
        err_msg = "请输入商品名";
      } else if (!(vendor_id > 0)) {
        err_msg = "无效的品牌商";
      } else if (sku_unit !== "斤" && sku_unit !== "个") {
        err_msg = "选择SKU单位";
      } else if (sku_having_unit <= 0) {
        err_msg = "请输入正确的份含量";
      } else if (!(weight > 0)) {
        err_msg = "请输入正确的重量";
      } else if (store_categories.length <= 0) {
        err_msg = "请选择门店分类";
      }
    }

    if (err_msg === "") {
      return true;
    } else {
      ToastLong(err_msg);
      return false;
    }
  }

  renderAddGood() {
    let {type} = this.props.route.params;
    if (!(type === "edit")) {
      return (
        <View>
          <GoodAttrs name="选填信息"/>
          <ModalSelector skin="customer" data={this.state.selling_categories} onChange={option => {
            this.setState({sale_status: option.key});
          }}>
            <Left title="售卖状态" info={tool.sellingStatus(this.state.sale_status)} right={right}/>
          </ModalSelector>

          {this.state.fnProviding ? (
            <ModalSelector skin="customer" data={this.state.head_supplies} onChange={option => {
              this.setState({provided: option.key});
            }}>
              <Left title="供货方式" info={tool.headerSupply(this.state.provided)} right={right}/>
            </ModalSelector>
          ) : null}

          {!this.isAddProdToStore() && this.state.editable_upc &&
          <Left title="UPC" value={`${this.state.upc}`} placeholder="一般为商品包装上的条形码"
                onChangeText={upc => this.setState({upc})}/>}

          {!this.isAddProdToStore() &&
          <Left title="商品类目" onPress={() => {
            this.setState({'visible': true})
          }} info={this.state.basic_category_obj.name_path ? (this.state.basic_category_obj.name_path) : ("选择基础类目")}
                right={right}/>
          }

          {!this.isAddProdToStore() && <ModalSelector skin="customer" data={this.state.sku_units}
                                                      onChange={option => {
                                                        this.setState({sku_unit: option.label});
                                                      }}>
            <Left title="库存单位" info={this.state.sku_unit} right={right}/>
          </ModalSelector>}

          {!this.isAddProdToStore() && <Left title="份含量" placeholder="请输入商品份含量" value={`${this.state.sku_having_unit}`}
                                             onChangeText={text => this.setState({sku_having_unit: text})}/>}

          {/*<PickerCascader data={this.state.sg_tag_tree} onValueChange={(item) => this.onSgTagTreeValueChange(item)}> >>>> </PickerCascader>*/}

        </View>
      );
    }
  }

  pickSingleImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: false,
        includeExif: true
      })
        .then(image => {

          console.log("done fetch image:", image)

          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[image_arr.length - 1];
          this.startUploadImg(image_path, image_name);
        })
        .catch(e => {
          console.log("error -> ", e);
        });
    }, 1000)

  }

  pickCameraImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: false,
        includeExif: true
      }).then(image => {
        console.log("done upload image:", image)
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[image_arr.length - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }


  getSgTagTree() {
    const {accessToken} = this.props.global;
    const {sg_tag_tree, sg_tag_tree_at} = this.props.product
    const {dispatch} = this.props;

    if (sg_tag_tree && Moment().unix() - sg_tag_tree_at < 24 * 3600) {
      this.setState({sg_tag_tree})
    } else {
      this.setState({isLoading: true})
      dispatch(fetchSgTagTree(this.props, accessToken, (tree) => {
        this.setState({sg_tag_tree, isLoading: false})
      }, (ok, reason, obj) => {
        this.setState({fatalMsg: '获取闪购分类失败，请返回重试', isLoading: false})
      }))
    }
  }

  recommendProdByName = (name) => {
    const {accessToken} = this.props.global;
    const url = `api_products/like_name_to_create?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(url, {name}).then(prods => {
      this.setState({likeProds: prods, showRecommend: true})
    })
  }


  getProdDetailByUpc = (upc) => {
    showModal("加载中...")
    const {accessToken, currStoreId} = this.props.global;
    let data = {
      store_id: currStoreId,
      upc: upc
    }
    HttpUtils.post.bind(this.props)(`api/get_product_by_upc?access_token=${accessToken}`, data).then(p => {
      hideModal();
      // if (p && p['store_has'] === 1) {
      //   this.props.navigation.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {
      //     pid: p['id'],
      //     storeId: currStoreId
      //   });
      // } else
      if (p && p['id']) {
        this.onReloadProd(p)
      } else if (p && p['upc_data']) {
        this.onReloadUpc(p['upc_data'])
        if (p['upc_data'].category_id) {
          this.onSelectedItemsChange([(p['upc_data'].category_id).toString()])
        }
      }
    }).catch(() => {
      hideModal()
    })
  }

  addProdToStore = (save_done_callback) => {
    const {accessToken, currStoreId} = this.props.global;
    const url = `api_products/add_prod_to_store?access_token=${accessToken}`
    const params = {
      product_id: this.state.id,
      store_id: currStoreId,
      sale_status: this.state.sale_status,
      store_price: this.state.price
    };
    HttpUtils.post.bind(this.props)(url, params).then(obj => {
      save_done_callback(true, '', obj)
    }, save_done_callback)
  }

  startUploadImg(imgPath, imgName) {
    showModal('图片上传中')
    this.setState({newImageKey: tool.imageKey(imgName), isUploadImg: true})

    HttpUtils.get.bind(this.props)('/qiniu/getToken', {bucket: 'goods-image'}).then(res => {
      console.log(`upload done by token: ${imgPath}`)
      const params = {
        filePath: imgPath,
        upKey: this.state.newImageKey,
        upToken: res,
        zone: 1
      }
      QNEngine.setParams(params)
      QNEngine.startTask()
    }).catch(error => {
      Alert.alert('error', '图片上传失败！')
    })
  }

  onSelectedItemsChange = (store_categories) => {
    this.setState({store_categories: store_categories});
  };

  SearchCommodityCategories(searchValue, basic_categories) {
    let result = this.searchCategories(basic_categories, function(category){
      return category.name.indexOf(searchValue) === 0
    })

    if (result) {
      this.setState({
        basic_category_obj: result
      })
      this.renderSelectTag()
    } else {
      showError('找不到此类目')
    }
  }

  searchCategories(tree, func) {
    for (const data of tree) {
      if (func(data)) return data
      if (data.children) {
        const res = this.searchCategories(data.children, func)
        if (res) return res
      }
    }
    return false
  }

  render() {
    let {searchValue, basic_categories, basic_category_obj} = this.state
    return <Provider>
      <View style={{flex: 1}}>
        <ScrollView>
          <Scanner visible={this.state.scanBoolean} title="返回"
                   onClose={() => this.setState({scanBoolean: false})}
                   onScanSuccess={code => this.onScanSuccess(code)}
                   onScanFail={code => this.onScanFail(code)}/>
          <Left title="名称" placeholder="例: 西红柿 约250g/份" required={true} editable={this.isProdEditable}
                maxLength={20} value={this.state.name} onChangeText={this.onNameChanged}
                right={this.state.name && <Text style={styles.clearBtn} onPress={this.onNameClear}>清除</Text> ||
                <Text/>}/>
          {this.state.showRecommend &&
          <View style={styles.recommendList}>
            {this.state.likeProds.map(like =>
              <View style={styles.recommendItem} key={like.id}>
                <Text onPress={() => this.onRecommendTap(like)}
                      style={[{flex: 1}, like.status_text && styles.viceFontColor || {color: colors.color333}]}
                      numberOfLines={1}>{like.name}</Text>
                {like.status_text &&
                <Text style={[{alignSelf: 'flex-end'}, styles.viceFontColor]}>{like.status_text}</Text>}
              </View>
            )}
          </View>
          }
          {this.renderUploadImg()}

          {this.state.store_has ? <Text style={{
            padding: '3%',
            paddingLeft: '4%',
            backgroundColor: colors.white,
            color: colors.warn_color
          }}>商品已存在</Text> : null}

          <Left title="报价" placeholder={"商品报价"} required={true}
                right={<Text style={{fontSize: 14, color: colors.color333}}>元</Text>}
                type="numeric" value={this.state.price} onChangeText={text => this.setState({price: text})}/>

          {!this.isAddProdToStore() &&
          <Left title="重量" placeholder="请输入单份商品克重" required={true} value={"" + this.state.weight} type="numeric"
                right={<Text style={Styles.n1grey3}>克</Text>}
                onChangeText={text => this.setState({weight: text})}/>}

          {!this.isAddProdToStore() && <View
            style={[{
              backgroundColor: "#fff",
              paddingHorizontal: pxToDp(10),
              paddingVertical: 15
            }]}
          >
            <SectionedMultiSelect
              items={this.state.store_tags}
              IconRenderer={Icon}
              uniqueKey="id"
              subKey="children"
              selectText="请选择门店分类"
              showDropDowns={true}
              readOnlyHeadings={true}
              onSelectedItemsChange={this.onSelectedItemsChange}
              selectChildren={true}
              highlightChildren={true}
              selectedItems={this.state.store_categories}
              selectedText={"个已选中"}
              searchPlaceholderText='搜索门店分类'
              confirmText={"确认选择"}
              colors={{primary: '#59b26a'}}

            />
          </View>
          }
          {this.renderAddGood()}
        </ScrollView>
        <View style={[Styles.around, {
          backgroundColor: '#fff',
          // marginLeft: pxToDp(20), marginRight: pxToDp(20),
          borderWidth: 1,
          borderColor: '#ddd',
          shadowColor: '#000',
          shadowOffset: {width: -4, height: -4},
          height: pxToDp(120),
        }]}>
          {<Button style={[styles.bottomBtn]} onPress={this.upLoad} type={'primary'} size={'small'}>保存</Button>}
        </View>

        {/*<Toast icon="loading" show={this.state.isUploadImg}>*/}
        {/*  图片上传中...{this.state.loadingPercent > 0 && `(${this.state.loadingPercent})`}*/}
        {/*</Toast>*/}

        {/*<Toast icon="loading" show={this.state.uploading} onRequestClose={() => {}}>提交中</Toast>*/}
        <Dialog onRequestClose={() => {
        }} visible={this.state.selectToWhere}
                buttons={this.goBackButtons()}>
          {<Text style={{width: "100%", textAlign: "center", fontSize: pxToDp(30), color: colors.color333}}>上传成功</Text>}
          {<Text style={{width: "100%", textAlign: "center"}}>商品已成功添加到门店</Text>}
        </Dialog>

        <ActionSheet visible={this.state.showImgMenus} onRequestClose={() => {
          this.setState({showImgMenus: false})
        }}
                     menus={[{label: '拍照', onPress: this.pickCameraImg.bind(this)}, {
                       label: '从相册选择',
                       onPress: this.pickSingleImg.bind(this)
                     }]}
                     actions={[{label: '取消', onPress: () => this.setState({showImgMenus: false})}]}
        />
        <Modal
          popup maskClosable
          visible={this.state.visible}
          animationType="slide-up"
          onClose={this.onClose}
          style={{
            'height': '75%',
          }}

        >
          <View style={[Styles.endcenter, {
            'marginLeft': 15,
            'marginRight': 15, position: 'relative', bottom: 0
          }]}>
            <Text style={[{
              textAlign: 'center',
              flex: 1,
              paddingVertical: 5,
              paddingHorizontal: 10
            }, Styles.n1b]}>商品类目</Text>
            <TouchableOpacity
              style={[Styles.endcenter, {width: pxToDp(120), height: pxToDp(120), marginTop: 1, position: 'absolute'}]}
              onPress={this.onClose}>
              <Text style={Styles.n1b}><AntIcon name="close" size="md" color="red"/>
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingRight: 15, paddingLeft: 15, marginTop: 10 }}>
            <View style={{ height: 40, backgroundColor: "#eee", borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: "space-around"}} >
              <Icon name={"search"} size={26}/>
              <TextInput defaultValue={this.state.searchValue ? this.state.searchValue : ''} onChangeText={value => this.setState({searchValue: value})} style={{ width: 150, padding: 0 }}></TextInput>
              <TouchableOpacity onPress={() => {this.SearchCommodityCategories(searchValue, basic_categories)}}>
                <Text style={{ color: '#59b26a', fontSize: 14 }}>搜索</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[{
            flexDirection: "row",
            alignItems: "center", marginLeft: 10, paddingVertical: 10, justifyContent: "flex-start"
          }]}>
            <SegmentedControl
                onValueChange={() => {
                  let {basic_category_obj} = this.state
                  if (Object.keys(basic_category_obj).length) {
                    let id_path = basic_category_obj.id_path;
                    let arr = id_path.substr(0, id_path.length - 1).substr(1, id_path.length - 1).split(',');
                    arr.pop();
                    if (arr.length >= 1) {
                      basic_category_obj.id = arr[arr.length - 1]
                      basic_category_obj.id_path = ',' + arr.toString() + ',';
                      let name_path = basic_category_obj.name_path;
                      name_path = name_path.split(',')
                      name_path.pop()
                      basic_category_obj.name = name_path[name_path.length - 1]
                      basic_category_obj.name_path = name_path.toString();
                    } else {
                      basic_category_obj = {};
                    }
                    this.setState({basic_category_obj: {...basic_category_obj}, buttonDisabled: true})
                  }

                }}
                tintColor={'#59b26a'}
                values={basic_category_obj.name_path ? basic_category_obj.name_path.split(",") : ['请选择']}
                style={{ height: 30, width: "90%", marginLeft: "4%"}}
                selectedIndex={basic_category_obj.name_path ? basic_category_obj.name_path.split(",").length - 1 : 1}
            />
          </View>
          {this.renderSelectTag()}
          <Button type={'primary'} disabled={this.state.buttonDisabled} style={{width: "100%", borderRadius: 0, position : "absolute", bottom: 0}} onPress={() => {
            this.setState({
              visible: false,
            });
          }}>
            确认选中
          </Button>
        </Modal>
      </View>
    </Provider>;

  }

  renderSelectTag() {
    let arr = [];
    let {basic_categories, basic_category_obj} = this.state
    if (Object.keys(basic_category_obj).length) {
      let {id_path} = basic_category_obj
      arr = id_path.substr(0, id_path.length - 1).substr(1, id_path.length - 1).split(',');
    }
    let list = this.treeMenuList(basic_categories, arr);
    if (tool.length(list) === 0) {
      return null
    }
    return (
      <ScrollView style={{
        'height': '75%',
      }}>
        <View style={{paddingBottom: "10%"}}>
          <List>
            {list.map((item) => {
              return (tool.length(item.children) > 0 ? <Item arrow="horizontal" onPress={() => {
                this.setState({
                  basic_category_obj: {...item},
                  sku_tag_id: item.id
                })
                let {basic_category_obj, sku_tag_id} = this.state
              }}>
                {item.name}
              </Item> : <Item onPress={() => {
                this.setState({
                  basic_category_obj: {...item},
                  sku_tag_id: item.id,
                  // visible: false,
                })
              }}>
                {item.name}
              </Item>)
            })}
          </List>
        </View>
      </ScrollView>
    );
  }

  treeMenuList(children, ids) {
    let id = ids.shift();
    if (id != undefined) {
      for (var item in children) {
        if (children[item].id == id) {
          if (ids.length >= 0) {
            if (children[item].children != undefined) {
              return this.treeMenuList(children[item].children, ids)
            } else {
              this.setState({buttonDisabled: false})
              return children;
            }
          } else {
            if (children[item].children != undefined) {
              this.setState({buttonDisabled: false})
              return children[item].children
            } else {
              return children;
            }
          }
        }
      }
    } else {
      return children;
    }
  }

  renderUploadImg() {
    return <View style={[
      styles.area_cell,
      {
        minHeight: pxToDp(215),
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: pxToDp(20),
        paddingTop: pxToDp(10),
        borderBottomWidth: 1,
        borderColor: colors.main_back
      }
    ]}>
      {tool.length(this.state.list_img) > 0 ? (
        tool.objectMap(this.state.list_img, (img_data, img_id) => {
          let img_url = img_data["url"];
          return (
            <View key={img_id}
                  style={{height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"}}>
              <Image style={styles.img_add} source={{uri: Config.staticUrl(img_url)}}/>
              {this.isProdEditable() &&
              <TouchableOpacity style={{position: "absolute", right: pxToDp(2), top: pxToDp(4)}}
                                onPress={() => {
                                  delete this.state.list_img[img_id];
                                  delete this.state.upload_files[img_id];
                                  this.forceUpdate();
                                }}>
                <Icon name={"clear"} size={pxToDp(40)} style={{backgroundColor: "#fff"}} color={"#d81e06"} msg={false}/>
              </TouchableOpacity>}
            </View>
          );
        })
      ) : this.state.cover_img ? (
        <View style={{height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"}}>
          <Image style={styles.img_add} source={{uri: Config.staticUrl(this.state.cover_img)}}/>
          {this.isProdEditable() &&
          <TouchableOpacity style={{position: "absolute", right: pxToDp(4), top: pxToDp(4)}} onPress={() => {
            this.setState({cover_img: ""});
          }}>
            <Icon name={"clear"} size={pxToDp(40)} style={{backgroundColor: "#fff"}} color={"#d81e06"} msg={false}/>
          </TouchableOpacity>}
        </View>
      ) : <View style={{height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "center"}}>
        <Text style={{color: colors.main_color, fontSize: pxToDp(20), fontWeight: "bold"}}>此商品暂无图片</Text>
      </View>}
      {this.isProdEditable() &&
      <View style={{height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"}}>
        <TouchableOpacity
          style={[styles.img_add, styles.img_add_box]}
          onPress={() => this.setState({showImgMenus: true})}>
          <Text style={{
            fontSize: pxToDp(36),
            color: "#bfbfbf",
            textAlignVertical: "center",
            textAlign: "center"
          }}>+</Text>
        </TouchableOpacity>
      </View>}
    </View>;
  }
}

class GoodAttrs extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.GoodAttrs]}>
        <Text style={{fontSize: pxToDp(30)}}>{this.props.name}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  GoodAttrs: {
    height: pxToDp(90),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: pxToDp(30)
  },
  attr_name: {
    width: pxToDp(120),
    marginRight: pxToDp(42),
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  cellBorderBottom: {
    borderBottomWidth: pxToDp(1),
    borderStyle: "solid",
    borderColor: "#EAEAEA"
  },
  clearBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.color777,
    fontSize: 12,
    color: colors.white,
    padding: pxToDp(6),
    borderRadius: pxToDp(12),
    marginLeft: pxToDp(6)
  },
  bottomBtn: {
    height: pxToDp(70), flex: 0.8, alignItems: 'center', justifyContent: 'center'
  },
  viceFontColor: {
    color: colors.color999
  },
  recommendList: {
    paddingHorizontal: pxToDp(31),
    backgroundColor: "#fff",
  },
  recommendItem: {
    flexDirection: "row",
    paddingVertical: pxToDp(20),
    paddingHorizontal: pxToDp(20),
    lineHeight: pxToDp(42),
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.main_back,
  },
  my_cells: {
    marginTop: 0,
    marginLeft: 0
  },
  my_cell: {
    marginLeft: 0,
    borderColor: colors.new_back,
    paddingHorizontal: pxToDp(30),
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    margin: 0
  },
  cell_label: {
    width: pxToDp(135),
    color: "#363636"
  },
  cell_body: {
    flex: 1
  },
  area_cell: {
    paddingHorizontal: pxToDp(30),
    borderTopColor: colors.new_back,
    borderStyle: "solid",
    borderTopWidth: pxToDp(1),
    paddingVertical: pxToDp(35),
    backgroundColor: "#fff"
  },
  area_input_title: {
    color: "#363636",
    fontSize: pxToDp(30)
  },
  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    justifyContent: "space-around",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
  img_add_box: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
  input_text: {
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    height: "100%",
    color: colors.main_color,
    textAlignVertical: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsEditScene);
