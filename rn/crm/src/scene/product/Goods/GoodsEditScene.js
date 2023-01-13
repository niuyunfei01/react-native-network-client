import React, {PureComponent} from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  InteractionManager,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {ActionSheet, Button, Dialog} from "../../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {setSGCategory} from "../../../reducers/global/globalActions";
import {fetchSgTagTree, getProdDetailByUpc, productSave} from "../../../reducers/product/productActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../../pubilc/util/tool";
import Cts from "../../../pubilc/common/Cts";
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import {QNEngine} from "../../../pubilc/util/QNEngine";
//组件
import _ from 'lodash';
import Scanner from "../../../pubilc/component/Scanner";
import HttpUtils from "../../../pubilc/util/http";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import {LineView, Styles} from "../../home/GoodsIncrementService/GoodsIncrementServiceStyle";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import AntDesign from "react-native-vector-icons/AntDesign";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import {SvgXml} from "react-native-svg";
import {radioSelected, radioUnSelected} from "../../../svg/svg";
import {imageKey} from "../../../pubilc/util/md5";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import FastImage from "react-native-fast-image";
import {DraggableGrid} from '../../../pubilc/component/react-native-draggable-grid';
import Config from "../../../pubilc/common/config";

const {height} = Dimensions.get("window");

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        productSave,
        fetchSgTagTree,
        getProdDetailByUpc,
        setSGCategory,
        ...globalActions
      },
      dispatch
    )
  };
}

function checkImgURL(url) {
  return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const PICTURE_SIZE = 85

/**
 * 导航带入的参数：
 * scan: true|false 支持默认打开扫码
 * type: add|edit
 * task_id: 任务id
 * backPage: 返回的页面
 */
class GoodsEditScene extends PureComponent {
  actions = [
    {
      label: '取消', onPress: () => this.setState({showImgMenus: false, showActionMenus: false})
    }
  ]

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    const {currVendorId} = tool.vendor(props.global);
    const {scan, product_detail} = (props.route.params || {});
    const {store_id, store_info} = this.props.global;
    this.isCanLoadMore = false
    this.state = {
      isSelectCategory: true,
      selectHeaderText: '闪购类目',
      actualNum: '',//库存
      visible: false,//modal
      dragPicVisible: false,
      searchPicVisible: false,
      selectPicType: true,//true-添加图片 false-替换图片
      picList: [],
      isSearchPicList: false,
      searchPicText: '',
      page: 1,
      pageSize: 12,
      isLastPage: false,
      isLoadingPic: false,
      weightList: [],//重量单位列表
      selectWeight: product_detail?.unit_info || {label: '克', value: 1},//选择重量单位
      provided: 1,
      name: "",//商品名称
      sku_having_unit: "1",
      tag_info_nur: "",
      promote_name: "",
      selectedItems: [],
      upload_files: [],
      price: '',//零售价格
      supply_price: "",//商品报价
      basic_category_obj: {},
      basic_category: [],
      select_basic_categories: {},
      secondary_categories: [],
      select_secondary_categories: {},
      three_categories: [],
      sg_tag_id: '0',
      store_categories: [],
      store_categories_obj: {},
      tag_list: "选择门店分类",
      id: 0,
      sku_unit: "个",
      weight: "",//商品重量
      likeProds: [],
      upc: '',
      sale_status: Cts.STORE_PROD_ON_SALE, //默认为售卖状态
      transCode: '', //条码
      typeCode: '', //条码类型
      isLoading: false,
      isUploadImg: false,
      showRecommend: false,
      showImgMenus: false,
      buttonDisabled: true,
      selectPreviewPic: {url: '', index: -1, key: ''},
      store_tags: [],
      sg_tag_tree: [],
      head_supplies: [
        {label: "门店自采", key: Cts.STORE_SELF_PROVIDED},
        {label: "总部供货", key: Cts.STORE_COMMON_PROVIDED}
      ],

      scanBoolean: scan === true,
      goBackValue: false,
      selectToWhere: false,
      torchMode: "on",
      cameraType: "back",
      task_id: 0,
      vendor_id: currVendorId,
      fnProviding: store_info.strict_providing,

      store_has: false,//门店默认没有
      vendor_has: false,//商品库默认没有
      searchValue: '',//搜索内容
      spec_type: 'spec_single',
      multiSpecsList: [{
        sku_name: '',//规格
        price: '',//零售价格
        supply_price: '',//报价
        weight: '',//重量
        sku_unit: '克',
        selectWeight: {value: 1, label: '克'},//选择重量
        upc: '',//条形码
        inventory: {
          actualNum: '',//库存
          differenceType: 2,
          totalRemain: '',
          remark: '',
          store_id: store_id,
          skipCheckChange: 1
        }
      }],
      isScanMultiSpecsUpc: false,
      scanMultiSpecsUpcIndex: 0,
      allow_multi_spec: 0,
      searchCategoriesKey: '',
      searchCategoriesList: [],
      allow_switch_multi: true,
      selected_pids: []
    };

  }

  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    let {type} = params;
    navigation.setOptions({
      headerTitle: type === "edit" ? "修改商品" : "新增商品"
    })

  };

  componentDidMount() {
    this.navigationOptions(this.props)
    this.searchGoodsByUpcCode(this.props)
    this.searchGoodsByGoodsName(this.props)
    this.getWeightUnitList()
    this.getAllowMultiSpecs()
    this.uploadImageFile()
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  searchGoodsByUpcCode = ({route}) => {
    const {upcCode} = route.params || {}
    if (upcCode)
      this.getProdDetailByUpc(upcCode)
  }

  searchGoodsByGoodsName = ({route}) => {
    const {goodsInfo} = route.params || {}
    if (goodsInfo) {
      const {
        barcode, name, sg_tag_id, weight, sku_unit, category_id, pic, vendor_has, store_has, series_id, spec_list, id
      } = goodsInfo
      this.setState({
        id: id,
        upc: barcode,
        name: name,
        sg_tag_id: sg_tag_id,
        weight: weight,
        sku_unit: sku_unit,
        store_categories: category_id,
        upload_files: [{id: '0', url: pic, name: pic, path: pic, key: pic}],
        selectWeight: {value: '1', label: sku_unit},
        vendor_has: Number(vendor_has) === 1,
        store_has: Number(store_has) === 1,
        spec_type: parseInt(series_id) > 0 ? 'spec_multi' : 'spec_single',
        allow_switch_multi: false,
        multiSpecsList: spec_list
      })
      this.getBasicCategory(sg_tag_id)
    }

  }

  uploadImageFile = () => {
    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: (data) => {
        //this.setState({loadingPercent: Number(data.percent * 100) + '%'})
      },
      onComplete: (data) => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          let {upload_files, newImageKey, selectPicType, selectPreviewPic} = this.state;
          const uri = res + newImageKey
          const img = {id: newImageKey, url: uri, name: newImageKey, path: uri, isNewPic: true, key: newImageKey}
          if (selectPicType) {
            const index = upload_files.findIndex(item => item.key === '+')
            if (index > 0)
              upload_files.splice(index, 0, img)
            else
              upload_files.push(img);
          } else {
            selectPreviewPic = {...selectPreviewPic, url: uri}
            upload_files[selectPreviewPic.index] = img
          }
          hideModal()
          this.setState({
            selectPreviewPic: selectPreviewPic,
            upload_files: upload_files,
            isUploadImg: false
          })
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

  getAllowMultiSpecs = () => {
    const {accessToken} = this.props.global
    const url = `/vendor/get_settings?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      const {allow_multi_spec = 0} = res
      this.setState({
        allow_multi_spec: allow_multi_spec
      })
    })
  }
  getWeightUnitList = () => {
    const {accessToken} = this.props.global
    const url = `/api_products/weight_unit_lists?access_token=${accessToken}`
    HttpUtils.get(url).then(res => {
      this.setState({weightList: res})

    }).catch(error => {

    })
  }

  UNSAFE_componentWillMount() {
    let {type, product_detail} = this.props.route.params;

    if (type === "edit") {
      this.onReloadProd(product_detail);
    } else {
      let {task_id, name, images} = this.props.route.params || {};

      if (task_id && name) {
        let upload_files = [];

        if (images && _.isArray(images)) {
          let validImages = _.filter(images, function (o) {
            return checkImgURL(o);
          });
          if (validImages && tool.length(validImages) > 0) {
            let idx = 0;
            validImages.forEach(function (imgUrl) {
              idx = idx - 1;
              let name = imgUrl.replace(/^.*[\\\/]/, '');
              let imgPath = imgUrl.replace("https://www.cainiaoshicai.cn", "");
              upload_files.push({
                id: idx,
                url: imgUrl,
                name: name,
                path: imgPath,
                mid_thumb: imgPath,
                key: name
              })
            });
          }
        }

        this.setState({
          task_id: task_id,
          name: name,
          upload_files: upload_files,
        });
      }
    }

    this.getSgTagTree()
    const {dispatch, product} = this.props
    let {store_tags, basic_category} = product;
    let {vendor_id} = this.state;
    if (store_tags[vendor_id] === undefined || basic_category[vendor_id] === undefined) {
      this.getCatByVendor(vendor_id);
    } else {
      // let basic_cat_list = this.toModalData(basic_category[vendor_id]);
      dispatch(setSGCategory(basic_category[vendor_id]))
      this.setState({
        //   basic_cat_list: basic_cat_list,
        store_tags: store_tags
      });
    }
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
      sg_tag_id: '0',
      buttonDisabled: true,
      searchValue: '',
      store_categories: [],
      store_categories_obj: {},
      searchCategoriesList: [],
      searchCategoriesKey: ''
    });
  };

  initEmptyState(appendState) {
    const {store_id} = this.props.global;
    this.setState({
      provided: 1,
      name: "",
      actualNum: '',
      sku_having_unit: "1",
      tag_info_nur: "",
      promote_name: "",
      selectedItems: [],
      upload_files: [],
      price: '',
      supply_price: "",
      basic_category_obj: {},
      basic_category: [],
      sg_tag_id: 0,
      store_categories: [],
      store_categories_obj: {},
      tag_list: "选择门店分类",
      id: 0,
      sku_unit: "个",
      weight: "",
      likeProds: [],
      store_has: false,
      vendor_has: false,
      upc: '',
      sale_status: Cts.STORE_PROD_ON_SALE, //默认为售卖状态
      transCode: '', //条码
      typeCode: '', //条码类型
      allow_switch_multi: true,
      spec_type: 'spec_single',
      multiSpecsList: [{
        sku_name: '',//规格
        price: '',//零售价格
        supply_price: '',//报价
        weight: '',//重量
        sku_unit: '克',
        selectWeight: {value: 1, label: '克'},//选择重量
        upc: '',//条形码
        inventory: {
          actualNum: '',//库存
          differenceType: 2,
          totalRemain: '',
          remark: '',
          store_id: store_id,
          skipCheckChange: 1
        }
      }],
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
      basic_category, sg_tag_id, id, sku_unit, tag_list_id, name, weight, sku_having_unit, tag_list, tag_info_nur,
      promote_name, mid_list_img, upc, store_has, spec_list, series_id, actualNum, price, supply_price, vendor_has
    } = product_detail;
    let upload_files = []
    mid_list_img && Object.keys(mid_list_img).map(img_id => {
      if (mid_list_img[img_id]) {
        upload_files.push({
          id: img_id,
          name: mid_list_img[img_id].name,
          url: mid_list_img[img_id]?.url,
          key: mid_list_img[img_id].name
        })
      }
    })

    spec_list && spec_list.map(spec => {
      spec.selectWeight = {
        value: '0',
        label: spec.sku_unit
      }
    })
    this.setState({
      upc,
      name, id, sku_unit, weight, sku_having_unit,
      tag_info_nur: tag_info_nur || "",
      promote_name: promote_name || "",
      upload_files: upload_files,
      sg_tag_id: sg_tag_id,
      basic_category: basic_category,
      store_categories: tag_list_id,
      tag_list: tag_list,
      spec_type: parseInt(series_id) > 0 ? 'spec_multi' : 'spec_single',
      multiSpecsList: spec_list,
      store_has: store_has == 1 && this.props.route.params.type === 'add',
      vendor_has: vendor_has == 1 && this.props.route.params.type === 'add',
      allow_switch_multi: false,
      actualNum: actualNum || '',
      price: price || '',
      supply_price: supply_price || ''
    });
    this.getBasicCategory(sg_tag_id)
    this.getSaleStatus(id)
  }

  getSaleStatus = (id) => {
    const {store_id, accessToken} = this.props.global
    const url = `/api_products/get_prod_with_store_detail/${store_id}/${id}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(url).then(({sp = {}}) => {
      this.setState({sale_status: Number(sp?.status) || 1})
    })
  }

  onReloadUpc = (upc_data) => {
    if (upc_data.pic) {
      this.setState({
        upload_files: [{id: '0', name: upc_data.pic, path: upc_data.pic, url: upc_data.pic, key: upc_data.pic}]
      })
    }
    if (tool.length(upc_data.basic_category_obj) !== 0) {
      this.setState({
        basic_category_obj: upc_data.basic_category_obj,
        sg_tag_id: upc_data.basic_category_obj.id
      })
    }
    this.setState({
      name: upc_data.name,
      upc: upc_data.barcode,
      weight: upc_data.weight,
      brand: upc_data.brand,
      vendor_has: Number(upc_data.vendor_has) === 1,
      store_has: Number(upc_data.store_has) === 1,
      allow_switch_multi: false
    });
  }

  onNameChanged = (name) => {
    let {type} = this.props.route.params;
    this.setState({name: name})
    if ('add' === type) {
      this.getProductByName(name)
    }
  }

  getProductByName = (name) => {
    if (!name) {
      return
    }
    const {accessToken, store_id, vendor_id} = this.props.global;
    const url = `/api_products/get_sg_tags_by_name?access_token=${accessToken}`

    const params = {
      vendor_id: vendor_id,
      store_id: store_id,
      name: name
    }
    HttpUtils.get(url, params).then(res => {
      const {self = [], sg} = res
      setTimeout(() => {
        if (sg.id)
          this.getBasicCategory(sg.id)
        if (Array.isArray(self)) {
          this.setState({store_categories: self})
        }
      }, 100)
    }).catch(() => {
    })

  }

  getBasicCategory = (id) => {
    const {basic_categories} = this.props.global
    for (let firstIndex = 0, firstLength = basic_categories.length; firstIndex < firstLength; firstIndex++) {
      const secondaryArray = basic_categories[firstIndex].children
      if (secondaryArray) {
        for (let secondaryIndex = 0, secondaryLength = secondaryArray.length; secondaryIndex < secondaryLength; secondaryIndex++) {
          const threeArray = secondaryArray[secondaryIndex].children

          if (threeArray) {
            for (let threeIndex = 0, threeLength = threeArray.length; threeIndex < threeLength; threeIndex++) {
              if (id == threeArray[threeIndex].id) {

                this.setState({
                  basic_category_obj: threeArray[threeIndex],
                  sg_tag_id: threeArray[threeIndex].id,
                  three_categories: threeArray,
                  secondary_categories: secondaryArray,
                  select_secondary_categories: secondaryArray[secondaryIndex],
                  select_basic_categories: basic_categories[firstIndex],
                  buttonDisabled: false
                })
              }
            }
          }
        }
      }

    }
  }

  onNameClear = () => {
    let {type} = this.props.route.params;
    if (type !== 'edit') {
      this.initEmptyState()
    }
    this.setState({name: '', showRecommend: false})
  }

  onScanSuccess = (code) => {
    const {isScanMultiSpecsUpc, scanMultiSpecsUpcIndex} = this.state
    if (code) {
      if (isScanMultiSpecsUpc) {
        this.setMultiSpecsInfo(scanMultiSpecsUpcIndex, 'upc', code)
        return
      }
      this.mixpanel.track('自动填入upc')
      this.initEmptyState({upc: code});
      this.getProdDetailByUpc(code)
    }
  }

  onScanFail = () => {
    Alert.alert('错误提示', '商品编码不合法，请重新扫描', [{text: '确定'}]);
  }

  componentDidUpdate() {
    let {params} = this.props.route;
    let {store_categories, tag_list} = params || {};
    if (store_categories && tag_list) {
      this.setState({store_categories: store_categories, tag_list: tag_list});
    }
  }

  startScan = (flag, isScanMultiSpecsUpc = false, index = 0) => {
    if (!isScanMultiSpecsUpc)
      this.mixpanel.track('商品新增页_扫码新增')
    this.setState({
      scanBoolean: flag,
      store_has: false,
      isScanMultiSpecsUpc: isScanMultiSpecsUpc,
      scanMultiSpecsUpcIndex: index
    });
  };

  goBackButtons = () => {
    const buttons = [
      {
        type: "default",
        label: "商品主页",
        onPress: () => {
          this.setState({selectToWhere: false});
          this.props.navigation.goBack();
        }
      },
      {
        type: "primary",
        label: "继续添加",
        onPress: () => {
          this.setState({selectToWhere: false});
          this.onNameClear()
        }
      }];
    if (this.state.task_id > 0) {
      buttons.push({
        type: "default",
        label: "回申请页面",
        onPress: () => {
          this.setState({selectToWhere: false});
          this.props.navigation.navigate("Remind");
        }
      })
    }
    return buttons
  }

  upLoad = async () => {
    let {type} = this.props.route.params;
    let {
      id, name, vendor_id, weight, sku_having_unit, sg_tag_id, store_categories, upload_files, supply_price,
      sale_status, provided, task_id, actualNum, selectWeight, upc, spec_type, multiSpecsList, price, fnProviding
    } = this.state;
    if (!fnProviding) {
      this.setState({provided: Cts.STORE_COMMON_PROVIDED});
    }
    const {accessToken, store_id, vendor_info} = this.props.global;

    let formData = {
      id,
      vendor_id,
      name,
      sku_unit: selectWeight.label,
      weight,
      sku_having_unit,
      sg_tag_id,
      store_categories,
      upload_files,
      task_id,
      upc: upc,
      sku_tag_id: 0,
      limit_stores: [store_id],
    };
    formData.spec_type = spec_type
    if (spec_type === 'spec_multi') {
      Object.keys(multiSpecsList).map(key => {
        delete multiSpecsList[key]?.checked
      })
      formData.spec_list = multiSpecsList
    }

    formData.store_goods_status = {
      sale_status: sale_status,
      provided: provided
    };

    if (spec_type === 'spec_single') {
      if (vendor_info.price_type === 1)
        formData.store_goods_status.price = price
      formData.store_goods_status.supply_price = supply_price
      formData.inventory = {
        actualNum: actualNum,
        differenceType: 2,
        totalRemain: actualNum,
        remark: '',
        store_id: store_id,
        skipCheckChange: 1
      }
    }

    const {dispatch, navigation} = this.props;

    if (this.dataValidate(formData)) {
      const save_done = async (ok, reason, obj) => {
        hideModal()
        this.setState({uploading: false});
        if (ok) {
          if (type === "add") {
            this.mixpanel.track('商品新增页面_点击保存')
            this.setState({selectToWhere: true});
            return
          }
          showSuccess("修改成功");
          navigation.goBack();
          return
        }
        ToastLong(reason);
      }
      showModal('提交中')
      this.setState({uploading: true});
      if (this.state.uploading) {
        return false;
      }
      upload_files.map(item => {
        const {isNewPic = false} = item
        if (isNewPic)
          item.id = 0
      })
      dispatch(productSave(formData, accessToken, save_done));
    }
  };

  dataValidate = (formData) => {
    const {price_type} = this.props.global.vendor_info
    let {type = 'add'} = this.props.route.params;
    const {fnProviding} = this.state
    const {
      id, name, vendor_id, weight, store_categories, store_goods_status, spec_list, spec_type, inventory, sg_tag_id,
      upload_files
    } = formData;
    if (type === "edit" && id <= 0) {
      ToastLong('数据异常, 无法保存')
      return false
    }

    let {supply_price, sale_status, provided, price} = store_goods_status;
    if ('spec_single' === spec_type) {
      if (!supply_price) {
        ToastLong('请输入报价')
        return false
      }
      if (parseFloat(supply_price) <= 0) {
        ToastLong('请输入正确的报价')
        return false
      }
      if (price_type === 1 && !price) {
        ToastLong('请输入零售价格')
        return false
      }
      if (price_type === 1 && parseFloat(price) <= 0) {
        ToastLong('请输入正确的零售价格')
        return false
      }
      if (!inventory.actualNum && fnProviding === '1') {
        ToastLong('请输入商品库存')
        return false
      }
      if (Number(inventory.actualNum) < 0 && fnProviding === '1') {
        ToastLong('请输入正确的商品库存')
        return false
      }
    }

    if (!(sale_status === Cts.STORE_PROD_ON_SALE || sale_status === Cts.STORE_PROD_OFF_SALE)) {
      ToastLong('请选择上架状态')
      return false
    }
    if (!(provided === Cts.STORE_SELF_PROVIDED || provided === Cts.STORE_COMMON_PROVIDED)) {
      ToastLong('选择供货方式')
      return false
    }


    if ('spec_multi' === spec_type) {
      if (!Array.isArray(spec_list) || spec_list.length <= 0) {
        ToastLong('多规格数据异常, 无法保存')
        return false
      }

      for (let i = 0; i < spec_list.length; i++) {
        if (!spec_list[i].sku_name) {
          ToastLong('请输入多规格名称')
          return false
        }
        if (!spec_list[i].supply_price) {
          ToastLong('请输入多规格价格')
          return false
        }
        if (parseFloat(spec_list[i].supply_price) <= 0) {
          ToastLong('请输入正确的多规格价格')
          return false
        }
        if (price_type === 1 && !spec_list[i].price) {
          ToastLong('请输入多规格零售价格')
          return false
        }
        if (price_type === 1 && parseFloat(spec_list[i].price) <= 0) {
          ToastLong('请输入正确的多规格零售价格')
          return false
        }
        if (!spec_list[i].weight) {
          ToastLong('请输入多规格重量')
          return false
        }
        if (!spec_list[i].inventory.actualNum && fnProviding === '1') {
          ToastLong('请输入多规格库存')
          return false
        }
      }
    }
    if (!this.isAddProdToStore()) {
      if (tool.length(name) <= 0) {
        ToastLong('请输入商品名称')
        return false
      }
      if (upload_files.length <= 0) {
        ToastLong('请添加商品图片')
        return false
      }
      if (!(vendor_id > 0)) {
        ToastLong('无效的品牌商')
        return false
      }

      if (!(weight > 0) && 'spec_single' === spec_type) {

        ToastLong('请输入正确的重量')
        return false
      }
      if (sg_tag_id == 0) {
        ToastLong('请选择闪购类目')
        return false
      }
      if (tool.length(store_categories) <= 0) {
        ToastLong('请选择门店分类')
        return false
      }
    }
    return true;
  }

  getSgTagTree() {
    const {dispatch, global, product} = this.props;
    const {accessToken} = global;
    const {sg_tag_tree, sg_tag_tree_at} = product

    if (sg_tag_tree && dayjs().unix() - sg_tag_tree_at < 24 * 3600) {
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

  getProdDetailByUpc = (upc) => {
    showModal("加载商品中...", 'loading', 20000)
    const {dispatch} = this.props;
    const {accessToken, store_id} = this.props.global;
    dispatch(getProdDetailByUpc(accessToken, store_id, upc, this.state.vendor_id, async (ok, desc, p) => {
      if (ok) {
        hideModal()
        const {id, upc_data} = p
        if (id) {
          this.onReloadProd(p)
          return
        }
        if (upc_data) {
          this.onReloadUpc(upc_data)
          const {category_id, sg_tag_id, weight} = upc_data
          if (category_id) {
            this.onSelectedItemsChange([category_id])
          }
          if (sg_tag_id) {
            this.setState({sg_tag_id: sg_tag_id})
            this.getBasicCategory(sg_tag_id)
          }
          if (weight)
            this.setState({weight: weight})
        }
      } else {
        showError(`${desc}`)
      }
    }))
  }

  startUploadImg = (imgPath, imgName) => {
    showModal('图片上传中')
    const newImageKey = imageKey(imgName)
    this.setState({newImageKey: newImageKey, isUploadImg: true})

    HttpUtils.get.bind(this.props)('/qiniu/getToken', {bucket: 'goods-image'}).then(res => {
      const params = {
        filePath: imgPath,
        upKey: newImageKey,
        upToken: res,
        zone: 1
      }
      QNEngine.setParams(params)
      QNEngine.startTask()
    }).catch(error => {
      Alert.alert('图片上传失败！')
    })
  }

  onSelectedItemsChange = (store_categories) => {
    this.setState({store_categories: store_categories});
  };

  searchCategories = (tree, func) => {
    for (const data of tree) {
      if (func(data)) return data
      if (data.children) {
        const res = this.searchCategories(data.children, func)
        if (res) return res
      }
    }
    return false
  }

  setSelectHeaderText = (showHeaderText, isSelectCategory) => {
    this.setState({
      visible: true,
      selectHeaderText: showHeaderText,
      isSelectCategory: isSelectCategory
    })
  }

  setPushSpec = (resp) => {
    let {multiSpecsList, selected_pids} = this.state
    let multiSpecsListCopy = []
    resp.map(item => {
      item = {
        ...item,
        inventory: {actualNum: ''},
        selectWeight: item?.unit_info,
        price: '',
        supply_price: '',
        actualNum: ''
      }
      delete item?.unit_info
      multiSpecsListCopy.push(item)
      selected_pids.push(item.id)
    })
    this.setState({
      multiSpecsList: multiSpecsList.concat(multiSpecsListCopy)
    }, () => {
      this.renderMultiSpecs()
    })
  }

  changeProductSpec = (status) => {
    let {type, product_detail = {}} = this.props.route.params;
    const {series_id = ''} = product_detail
    if ('add' === type) {
      this.setState({
        spec_type: status
      })
    } else {
      if (parseInt(series_id) !== 0) {
        return ToastShort('不可更改为单规格！')
      } else {
        let {name, upc, weight, price, supply_price, selectWeight, actualNum, id} = this.state
        let {multiSpecsList = []} = this.state
        const multiSpecsInfo = {
          id: id,
          sku_name: name,
          supply_price: supply_price,
          price: price,
          weight: weight,
          sku_unit: selectWeight.label,
          selectWeight: selectWeight,
          upc: upc,
          inventory: {
            actualNum: actualNum,
            differenceType: 2,
            totalRemain: '',
            remark: '',
            skipCheckChange: 1
          },
          checked: false
        }
        if (multiSpecsList.length < 1) {
          multiSpecsList = [...multiSpecsList, multiSpecsInfo]
        }
        this.setState({
          multiSpecsList: multiSpecsList,
          spec_type: status
        })
      }
    }
  }

  renderBaseInfo = () => {
    let {
      basic_category_obj, name, upc, weightList, weight, sale_status, fnProviding, price, store_tags, supply_price,
      selectWeight, actualNum, store_categories, spec_type, allow_multi_spec, store_has, vendor_has, allow_switch_multi
    } = this.state
    const {price_type} = this.props.global.vendor_info
    const {type} = this.props.route.params;
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          基本信息
        </Text>
        <LineView/>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            商品名称
            <Text style={styles.leftFlag}>
              *
            </Text>
          </Text>
          <TextInput
            editable={!vendor_has && !store_has}
            value={name}
            style={styles.textInputStyle}
            onChangeText={text => this.onNameChanged(text)}
            placeholderTextColor={colors.color999}
            maxLength={45}
            placeholder={'不超过45个字符'}/>
          <If condition={name}>
            <Text style={styles.clearBtn} onPress={this.onNameClear}>
              清除
            </Text>
          </If>
          <If condition={!name}>
            <View style={styles.rightEmptyView}/>
          </If>

        </View>
        <If condition={store_has}>
          <Text style={{padding: '3%', paddingLeft: '4%', backgroundColor: colors.white, color: colors.warn_color}}>
            商品已存在
          </Text>
        </If>
        <LineView/>
        <View style={styles.baseRowWrap}>
          <Text style={styles.leftText}>
            商品图片
            <Text style={styles.leftFlag}>
              *
            </Text>
          </Text>
          {
            this.renderUploadImg()
          }
        </View>
        <LineView/>
        <If condition={spec_type === 'spec_single'}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              报价
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              style={styles.textInputStyle}
              value={supply_price}
              keyboardType={'numeric'}
              onChangeText={text => this.setState({supply_price: text})}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品报价'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <If condition={price_type && spec_type === 'spec_single'}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              零售价格
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              value={price}
              keyboardType={'numeric'}
              onChangeText={text => this.setState({price: text})}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请输入零售价格'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <If condition={!this.isAddProdToStore()}>

          <If condition={spec_type === 'spec_single'}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                重量
                <Text style={styles.leftFlag}>
                  *
                </Text>
              </Text>
              <TextInput
                editable={!vendor_has && !store_has}
                style={styles.textInputStyle}
                value={`${weight}`}
                keyboardType={'numeric'}
                onChangeText={text => this.setState({weight: text})}
                placeholderTextColor={colors.color999}
                placeholder={'请输入商品重量'}/>
              <ModalSelector style={styles.rightSelect}
                             data={weightList}
                             disabled={vendor_has || store_has}
                             skin={'customer'}
                             onChange={item => this.setState({selectWeight: item})}
                             defaultKey={-999}>
                <View style={styles.weightUnitWrap}>
                  <Text style={styles.weightUnit}>
                    {`${selectWeight.label}`}
                  </Text>
                  <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.color999} size={14}/>
                </View>
              </ModalSelector>
            </View>
            <LineView/>
          </If>
          <If condition={!vendor_has && !store_has && spec_type === 'spec_single'}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                商品条码
              </Text>
              <TextInput
                value={upc}
                // editable={this.isStoreProdEditable()}
                onChangeText={upc => this.setState({upc: upc})}
                style={styles.textInputStyle}
                placeholderTextColor={colors.color999}
                placeholder={'请扫描或输入条形码'}/>
              <Ionicons name={'scan-sharp'} style={styles.rightEmptyView} color={colors.color333} size={22}
                        onPress={() => this.startScan(true)}/>
            </View>
            <LineView/>
          </If>

        </If>
        <If condition={fnProviding === '1' && spec_type === 'spec_single'}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              库存
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              value={actualNum}
              keyboardType={'numeric'}
              onChangeText={text => this.setState({actualNum: text})}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品库存'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <If condition={!this.isAddProdToStore()}>
          <If condition={!vendor_has && !store_has}>
            <TouchableOpacity style={styles.baseRowCenterWrap}
                              onPress={() => this.setSelectHeaderText('闪购类目', true)}>
              <Text style={styles.leftText}>
                闪购类目
                <Text style={styles.leftFlag}>
                  *
                </Text>
              </Text>
              <View style={styles.textInputStyle}>
                <Text style={styles.selectTipText}>
                  {basic_category_obj.name_path ?? '请选择类目'}
                </Text>
              </View>
              <AntDesign name={'right'} style={styles.rightEmptyView} color={colors.colorCCC} size={16}/>
            </TouchableOpacity>
            <LineView/>

          </If>
          <If condition={!vendor_has && !store_has}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                商品分类
                <Text style={styles.leftFlag}>
                  *
                </Text>
              </Text>
              {/*<TouchableOpacity style={styles.textInputStyle}*/}
              {/*                  onPress={() => this.setSelectHeaderText('商品分类', false)}>*/}
              {/*  <Text style={styles.selectTipText}>*/}
              {/*    {store_categories_obj.name_path ?? '请选择分类'}*/}
              {/*  </Text>*/}

              {/*</TouchableOpacity>*/}
              {/*<MaterialIcons name={'chevron-right'} style={styles.rightEmptyView} color={colors.colorCCC} size={26}/>*/}
              <View style={styles.textInputStyle}>
                <SectionedMultiSelect
                  items={store_tags || []}
                  IconRenderer={MaterialIcons}
                  uniqueKey="id"
                  subKey="children"
                  selectText="请选择分类"
                  showDropDowns={true}
                  readOnlyHeadings={true}
                  onSelectedItemsChange={this.onSelectedItemsChange}
                  selectChildren={true}
                  highlightChildren={true}
                  selectedItems={store_categories}
                  selectedText={"个已选中"}
                  searchPlaceholderText='搜索门店分类'
                  confirmText={tool.length(store_categories) > 0 ? '确定' : '关闭'}

                  colors={{primary: colors.main_color}}
                />
              </View>
            </View>
            <LineView/>
          </If>
          <If condition={allow_multi_spec === 1}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                商品规格
              </Text>
              <View style={styles.saleStatusWrap}>
                <TouchableOpacity style={styles.saleStatusItemWrap}
                                  onPress={() => this.changeProductSpec('spec_single')}>
                  <If condition={spec_type === 'spec_single'}>
                    <SvgXml xml={radioSelected(18, 18)}/>
                  </If>
                  <If condition={spec_type !== 'spec_single'}>
                    <SvgXml xml={radioUnSelected(18, 18)}/>
                  </If>
                  <Text style={styles.saleStatusText}>
                    单规格
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saleStatusItemWrap}
                                  onPress={() => this.changeProductSpec('spec_multi')}>
                  <If condition={spec_type === 'spec_multi'}>
                    <SvgXml xml={radioSelected(18, 18)}/>
                  </If>
                  <If condition={spec_type !== 'spec_multi'}>
                    <SvgXml xml={radioUnSelected(18, 18)}/>
                  </If>
                  <Text style={styles.saleStatusText}>
                    多规格
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rightEmptyView}/>
            </View>
          </If>
        </If>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            上架状态
            <Text style={styles.leftFlag}>
              *
            </Text>
          </Text>
          <View style={styles.saleStatusWrap}>
            <TouchableOpacity style={styles.saleStatusItemWrap}
                              onPress={() => this.setState({sale_status: Cts.STORE_PROD_ON_SALE})}>
              <If condition={sale_status === Cts.STORE_PROD_ON_SALE}>
                <SvgXml xml={radioSelected(18, 18)}/>
              </If>
              <If condition={sale_status !== Cts.STORE_PROD_ON_SALE}>
                <SvgXml xml={radioUnSelected(18, 18)}/>
              </If>
              <Text style={styles.saleStatusText}>
                上架
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saleStatusItemWrap}
                              onPress={() => this.setState({sale_status: Cts.STORE_PROD_OFF_SALE})}>
              <If condition={sale_status === Cts.STORE_PROD_OFF_SALE}>
                <SvgXml xml={radioSelected(18, 18)}/>
              </If>
              <If condition={sale_status !== Cts.STORE_PROD_OFF_SALE}>
                <SvgXml xml={radioUnSelected(18, 18)}/>
              </If>
              <Text style={styles.saleStatusText}>
                下架
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightEmptyView}/>
        </View>
        <LineView/>
      </View>
    )
  }

  renderMultiSpecs = () => {
    const {multiSpecsList, weightList, fnProviding, vendor_has, store_has} = this.state
    const {type = 'add'} = this.props.route.params;
    return (
      <>
        <Text style={styles.multiSpecsTip}>
          提示：当前添加商品为多规格，保存后商品至少有一个规格，不可更改为单规格
        </Text>
        {
          multiSpecsList && multiSpecsList.map((item, index) => {
            return this.renderMultiSpecsInfo(item, index, weightList, multiSpecsList, fnProviding, type, vendor_has, store_has)
          })
        }
      </>
    )
  }

  setMultiSpecsInfo = (index, key, value) => {
    const {store_id, vendor_info} = this.props.global;
    const {multiSpecsList} = this.state

    const multiSpecsInfo = multiSpecsList[index]
    if ('price' !== key || vendor_info.price_type === 1)
      multiSpecsInfo[key] = value
    if ('selectWeight' === key)
      multiSpecsInfo['sku_unit'] = multiSpecsInfo[key].label
    if ('inventory' === key)
      multiSpecsInfo['inventory'] = {
        actualNum: value,//库存
        differenceType: 2,
        totalRemain: value,
        remark: '',
        store_id: store_id,
        skipCheckChange: 1
      }
    this.setState({
      multiSpecsList: multiSpecsList.concat([])
    })

  }

  renderMultiSpecsInfo = (item, index, weightList, multiSpecsList, fnProviding, type, vendor_has, store_has) => {
    const {inventory = {}, upc, weight, supply_price, price, sku_name, checked = false} = multiSpecsList[index]
    const {actualNum = ''} = inventory
    const {price_type} = this.props.global.vendor_info;
    let {product_detail = {}} = this.props.route.params;
    const {series_id = '', sku_max_num = 0} = product_detail;
    const {store_id} = this.props.global;
    const {selected_pids} = this.state;
    return (
      <View style={Styles.zoneWrap} key={index}>
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
          <Text style={Styles.headerTitleText}>
            规格信息
          </Text>
          <If condition={index === 0 && 'add' !== type && parseInt(series_id) > 0}>
            <TouchableOpacity
              style={{flexDirection: "row", alignItems: "center", marginRight: 12}}
              onPress={() =>
                this.onPress(
                  Config.ROUTE_GOODS_SELECT_SPEC,
                  {
                    series_id: series_id,
                    store_id: store_id,
                    selected_pids: selected_pids,
                    sku_max_num: sku_max_num,
                    onBack: resp => {
                      this.setPushSpec(resp)
                    }
                  }
                )
              }
            >
              <Text style={{color: colors.main_color, fontSize: 14}}>选择规格 </Text>
              <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.main_color} size={14}/>
            </TouchableOpacity>
          </If>
        </View>
        <LineView/>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            规格名称
            <Text style={styles.leftFlag}>
              *
            </Text>
          </Text>
          <TextInput
            maxLength={20}
            value={sku_name}
            editable={!vendor_has && !store_has}
            //editable={this.isStoreProdEditable()}
            onChangeText={value => this.setMultiSpecsInfo(index, 'sku_name', value)}
            style={styles.textInputStyle}
            placeholderTextColor={colors.color999}
            placeholder={'请填写规格名称，例如200g'}/>
          <View style={styles.rightEmptyView}/>
        </View>
        <LineView/>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            报价
            <Text style={styles.leftFlag}>
              *
            </Text>
          </Text>
          <TextInput
            keyboardType={'numeric'}
            value={supply_price}
            //editable={this.isStoreProdEditable()}
            onChangeText={value => this.setMultiSpecsInfo(index, 'supply_price', value)}
            style={styles.textInputStyle}
            placeholderTextColor={colors.color999}
            placeholder={'请输入商品报价'}/>
          <View style={styles.rightEmptyView}/>
        </View>
        <LineView/>
        <If condition={price_type === 1}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              零售价格
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              keyboardType={'numeric'}
              value={price}
              onChangeText={value => this.setMultiSpecsInfo(index, 'price', value)}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品零售价格'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>

        <If condition={!vendor_has && !store_has || 'add' !== type}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              重量
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              style={styles.textInputStyle}
              value={weight}
              keyboardType={'numeric'}
              onChangeText={value => this.setMultiSpecsInfo(index, 'weight', value)}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品重量'}/>
            <ModalSelector style={styles.rightSelect}
                           data={weightList}
                           skin={'customer'}
                           disabled={vendor_has || store_has}
                           onChange={item => this.setMultiSpecsInfo(index, 'selectWeight', item)}
                           defaultKey={-999}>
              <View style={styles.weightUnitWrap}>
                <Text style={styles.weightUnit}>
                  {`${item.selectWeight.label}`}
                </Text>
                <AntDesign name={'right'} style={{textAlign: 'center'}} color={colors.color999} size={14}/>
              </View>
            </ModalSelector>
          </View>
          <LineView/>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              商品条码
            </Text>
            <TextInput
              value={upc}
              //editable={this.isStoreProdEditable()}
              onChangeText={value => this.setMultiSpecsInfo(index, 'upc', value)}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请扫描或输入条形码'}/>
            <Ionicons name={'scan-sharp'} style={styles.rightEmptyView} color={colors.color333} size={22}
                      onPress={() => this.startScan(true, true, index)}/>
          </View>
          <LineView/>
        </If>

        <If condition={fnProviding === '1'}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              库存
              <Text style={styles.leftFlag}>
                *
              </Text>
            </Text>
            <TextInput
              keyboardType={'numeric'}
              value={actualNum}
              //editable={this.isStoreProdEditable()}
              onChangeText={value => this.setMultiSpecsInfo(index, 'inventory', value)}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品库存'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <View style={multiSpecsList.length > 1 ? styles.operationSpecsBtnWrap : {}}>
          <If
            condition={multiSpecsList.length === index + 1 && !vendor_has && !store_has && (parseInt(series_id) <= 0 || 'add' === type)}>
            <TouchableOpacity style={styles.addSpecsWrap} onPress={this.addSpecs}>
              <AntDesign name={'plus'} size={12} color={colors.main_color}/>
              <Text style={styles.addSpecsText}>
                添加规格
              </Text>
            </TouchableOpacity>
          </If>
          <If condition={multiSpecsList.length > 1 && index !== 0 && !vendor_has && !store_has}>
            <TouchableOpacity style={styles.deleteSpecsWrap} onPress={() => this.deleteSpecs(index, checked, item.id)}>
              <AntDesign name={'delete'} size={22} color={colors.main_color}/>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }
  addSpecs = () => {
    const {store_id, vendor_info} = this.props.global;
    const {multiSpecsList} = this.state
    const multiSpecsInfo = {
      sku_name: '',//规格
      supply_price: '',//报价
      weight: '',//重量
      sku_unit: '克',
      selectWeight: {value: 1, label: '克'},//选择重量
      upc: '',//条形码
      checked: true,
      inventory: {
        actualNum: '',//库存
        differenceType: 2,
        totalRemain: '',
        remark: '',
        store_id: store_id,
        skipCheckChange: 1

      }
    }
    if (vendor_info.price_type)
      multiSpecsInfo.price = ''
    multiSpecsList.push(multiSpecsInfo)
    this.setState({
      multiSpecsList: multiSpecsList.concat([])
    })
  }

  deleteSpecs = (index, checked, id = '') => {
    const {type} = this.props.route.params;
    if ('edit' === type && !checked) {
      Alert.alert('删除规格', '将从商品库中删除规格信息，会从关联的门店中消失，确定是否要删除？',
        [
          {
            text: '取消'
          },
          {
            text: '确定',
            onPress: () => {
              this.deleteSpecsInfoToServer(index)
              this.deletedSpecsInfo(index)
            }
          }
        ])
      return
    }
    if (id) {
      this.state.selected_pids.splice(this.state.selected_pids.findIndex(item => item == id), 1)
    }
    this.deletedSpecsInfo(index)
  }

  deleteSpecsInfoToServer = (index) => {
    const {store_id} = this.props.global;
    const {multiSpecsList} = this.state
    const {id} = multiSpecsList[index]
    if (!id) {
      showError('规格信息不完整，不可删除')
      return
    }
    const url = `/v1/new_api/store_product/del_store_pro/${store_id}/${id}`
    HttpUtils.get(url, {}, false, true).then((res) => {
      showSuccess(`${res.reason}`)
    }, error => {
      showError(error.reason)
    })
  }

  deletedSpecsInfo = (index) => {
    const {multiSpecsList} = this.state
    if (multiSpecsList.length > 1)
      multiSpecsList.splice(index, 1)
    this.setState({
      multiSpecsList: multiSpecsList.concat([])
    })
  }

  renderOtherInfo = () => {
    const {fnProviding, provided, head_supplies} = this.state
    return (
      <If condition={fnProviding}>
        <View style={Styles.zoneWrap}>
          <Text style={Styles.headerTitleText}>
            其他信息
          </Text>
          <LineView/>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              供货方式
            </Text>
            <ModalSelector skin="customer" data={head_supplies} style={styles.textInputStyle}
                           onChange={option => this.setState({provided: option.key})}>
              <Text style={styles.selectTipText}>
                {tool.headerSupply(provided)}
              </Text>
            </ModalSelector>

            <AntDesign name={'right'} style={styles.rightEmptyView} color={colors.colorCCC} size={16}/>
          </View>
        </View>
      </If>
    )
  }

  renderSaveInfo = () => {
    return (
      <View style={styles.saveZoneWrap}>
        <TouchableOpacity style={Styles.saveWrap} onPress={this.upLoad}>
          <Text style={Styles.saveText}>
            保存
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderScanner = () => {
    const {scanBoolean} = this.state
    return (
      <Scanner visible={scanBoolean} title="返回"
               onClose={() => this.setState({scanBoolean: false})}
               onScanSuccess={code => this.onScanSuccess(code)}
               onScanFail={code => this.onScanFail(code)}/>
    )
  }

  renderSuccessInfo = () => {
    const {selectToWhere} = this.state
    return (
      <Dialog visible={selectToWhere} buttons={this.goBackButtons()}>
        <Text style={styles.successTipText}>
          上传成功
        </Text>
        <Text style={styles.successAddStoreTipText}>
          商品已成功添加到门店
        </Text>
      </Dialog>
    )
  }

  renderActionSheet = () => {
    const {showImgMenus} = this.state
    return (
      <ActionSheet visible={showImgMenus} menus={this.menus} actions={this.actions}/>
    )
  }
  pickSingleImg = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker(tool.pickImageOptions(true))
        .then(image => {
          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[tool.length(image_arr) - 1];
          this.startUploadImg(image_path, image_name);
        }).catch(() => {
      })
    }, 500)
  }

  pickCameraImg = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openCamera(tool.pickImageOptions(true)).then(image => {
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[tool.length(image_arr) - 1];
        this.startUploadImg(image_path, image_name);
      }).catch(() => {
      })
    }, 500)

  }

  selectPicFromLibrary = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => this.setState({searchPicVisible: true}), 500)
  }

  menus = [
    {
      label: '从图库选择', onPress: this.selectPicFromLibrary
    },
    {
      label: '拍照', onPress: this.pickCameraImg
    },
    {
      label: '从相册选择', onPress: this.pickSingleImg
    }
  ]

  getSearchCategoriesByName = (value) => {
    if (!value) {
      showError('搜索的类目不能为空', 100)
      return
    }
    const {accessToken} = this.props.global
    const url = `/api_products/search_sg_tag_by_name?access_token=${accessToken}`
    HttpUtils.get(url, {keyword: value}).then(res => {
      this.setState({
        searchCategoriesKey: value,
        searchCategoriesList: res
      })
    })

  }

  closePreviewImage = () => {
    const {upload_files} = this.state
    const index = upload_files.findIndex(item => item.key === '+')
    if (index > 0)
      upload_files.splice(index, 1)
    this.setState({dragPicVisible: false, upload_files: [...upload_files]})
  }

  renderModal = () => {
    let {
      searchValue, visible, buttonDisabled, selectHeaderText, dragPicVisible, upload_files, selectPreviewPic,
      vendor_has, store_has
    } = this.state
    if (visible) {
      return (
        <CommonModal position={'flex-end'} visible={visible} animationType={'slide-up'} onRequestClose={this.onClose}>
          <View style={styles.modalWrap}>
            <View style={styles.modalHeaderWrap}>
              <View style={{padding: 8}}/>
              <Text style={styles.modalHeaderText}>{selectHeaderText} </Text>
              <TouchableOpacity style={{padding: 8}} onPress={this.onClose}>
                <AntDesign name={'close'} size={20} color={colors.red}/>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchZone}>
              <View style={styles.modalSearchWrap}>
                <AntDesign name={"search1"} size={16} style={styles.modalSearchIcon}/>
                <TextInput value={searchValue ? searchValue : ''}
                           placeholder={`搜索${selectHeaderText}`}
                           placeholderTextColor={colors.color999}
                           onChangeText={value => this.setState({searchValue: value})}
                           style={{flex: 1, padding: 0}}/>
                <TouchableOpacity style={styles.modalSearchIcon}
                                  onPress={() => this.getSearchCategoriesByName(searchValue)}>
                  <Text style={styles.modalSearch}>搜索 </Text>
                </TouchableOpacity>
              </View>
            </View>

            {this.renderSelectSG()}
            <Button type={'primary'}
                    disabled={buttonDisabled}
                    style={styles.selectedCateStyle}
                    onPress={() => this.setState({visible: false})}>
              确定
            </Button>
          </View>
        </CommonModal>
      )
    }
    let data = [...upload_files]
    const hasPlus = upload_files.filter(item => item.key === '+')
    if (hasPlus.length <= 0)
      data = [...upload_files, {key: '+', disabledDrag: true, disabledReSorted: true}]
    if (dragPicVisible) {
      return (
        <CommonModal visible={dragPicVisible} onRequestClose={this.closePreviewImage}>
          <>
            <SafeAreaView style={styles.modifyPicModal}>
              <View style={styles.modifyPicHeader}>
                <AntDesign name={'left'} color={colors.white} size={20} style={{padding: 8}}
                           onPress={this.closePreviewImage}/>
                <Text style={styles.modifyPicHeaderText}>
                  预览（{selectPreviewPic.index + 1}/{tool.length(hasPlus.length <= 0 ? upload_files.length : upload_files.length - 1)}）
                </Text>
                <View/>
              </View>
              <View style={styles.modifyMainPic}>
                <If condition={selectPreviewPic?.url}>
                  <FastImage source={{uri: selectPreviewPic?.url}}
                             resizeMode={FastImage.resizeMode.contain}
                             style={{height: 2.5 * height / 5.2}}/>
                </If>
              </View>
              <DraggableGrid numColumns={4}
                             style={styles.modifyPicList}
                             data={data}
                             delayLongPress={100}
                             onItemPress={(item) => this.onPressCell(item)}
                             onDragRelease={(data, item) => this.onDragRelease(data, item)}
                             renderItem={(item, index) => this.renderModalItem(item, index)}/>

              <View style={styles.modifyPicBtnWrap}>
                <If condition={selectPreviewPic.index !== 0 && upload_files.length > 0}>
                  <TouchableOpacity onPress={this.setMainPic}
                                    style={[{backgroundColor: colors.main_color}, styles.modifyPicBtn]}>
                    <Text style={styles.modifyPicBtnText}>
                      设为主图
                    </Text>
                  </TouchableOpacity>
                </If>
                <If condition={!vendor_has && !store_has && upload_files.length > 0}>
                  <TouchableOpacity style={[{backgroundColor: colors.colorCCC}, styles.modifyPicBtn]}
                                    onPress={() => this.setState({showImgMenus: true, selectPicType: false})}>
                    <Text style={styles.modifyPicBtnText}>
                      替换图片
                    </Text>
                  </TouchableOpacity>
                </If>
              </View>
            </SafeAreaView>
            {this.renderActionSheet()}
            {this.renderSearchPic()}
          </>
        </CommonModal>
      )
    }
  }

  onDragRelease = (data, item) => {
    const index = data.findIndex(datas => datas.key === item.key)
    this.setState({upload_files: data, selectPreviewPic: {...item, index: index}})
  }

  renderLockedItem(item, index) {
    const {upload_files, vendor_has, store_has} = this.state
    if (!vendor_has && !store_has && tool.length(upload_files) < 8)
      return (
        <View style={styles.plusIconWrap}>
          <TouchableOpacity style={[styles.img_add_box]}
                            onPress={() => this.setState({showImgMenus: true, selectPicType: true})}>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>
      )
  }

  onPressCell = (item) => {
    const {upload_files} = this.state
    const itemIndex = upload_files.findIndex(items => items.key === item.key)
    this.setState({selectPreviewPic: {url: item?.url, index: itemIndex, key: item?.id}})
  }

  closePicList = () => {
    this.setState({searchPicVisible: false, searchPicText: '', picList: [], isSearchPicList: false})
  }
  resetPicList = () => {
    this.setState({searchPicText: '', picList: [], isSearchPicList: false})
  }
  renderSearchPic = () => {
    const {searchPicVisible, picList, searchPicText} = this.state
    if (searchPicVisible)
      return (
        <CommonModal visible={searchPicVisible} position={'flex-end'}
                     onRequestClose={() => this.setState({searchPicVisible: false, searchPicText: '', picList: []})}>
          <View style={styles.searchModalWrap}>
            <View style={styles.searchModalHeaderWrap}>
              <Text style={styles.searchModalHeaderText}>
                搜索图片
              </Text>
              <AntDesign name={'close'}
                         size={16}
                         style={{padding: 12}}
                         onPress={this.closePicList}
                         color={colors.colorCCC}/>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.searchModalInputWrap}>
                <AntDesign name={'search1'} style={{paddingLeft: 11, paddingVertical: 6}}/>
                <TextInput value={searchPicText}
                           onChangeText={value => this.setSearchPicText(value)}
                           placeholder={'请输入图片名称'}
                           returnKeyType={'search'}
                           onSubmitEditing={() => this.searchPicList(searchPicText)}
                           placeholderTextColor={colors.colorCCC}
                           style={styles.searchModalInput}/>
                <If condition={searchPicText}>
                  <AntDesign name={'close'} style={styles.searchModalClearText}
                             onPress={() => this.setSearchPicText('')}/>
                </If>
              </View>
            </View>
            <FlatList data={picList}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      style={{flex: 1}}
                      numColumns={3}
                      getItemLayout={this._getItemLayout}
                      onRefresh={this.onRefresh}
                      refreshing={false}
                      ListEmptyComponent={this.ListEmptyComponent()}
                      onEndReachedThreshold={0.2}
                      onEndReached={this.onLoadMore}
                      onScrollBeginDrag={this.onScrollBeginDrag}
                      initialNumToRender={10}
                      keyExtractor={(item, index) => `${index}`}
                      renderItem={this.renderPicListItem}/>
          </View>
        </CommonModal>
      )
  }

  ListEmptyComponent = () => {
    const {searchPicText, picList, isSearchPicList} = this.state
    if (searchPicText && isSearchPicList && picList.length === 0)
      return (
        <Text style={styles.noResultText}>
          无匹配结果，请重新输入关键字
        </Text>
      )
    return <View/>
  }

  onScrollBeginDrag = () => {
    this.isCanLoadMore = true
  }
  onRefresh = () => {
    this.setState({page: 1}, () => this.searchPicList(this.state.searchPicText))
  }
  onLoadMore = () => {

    let {page, isLastPage, isLoadingPic, searchPicText} = this.state
    if (isLastPage) {
      showError('没有更多图片', 100)
      this.isCanLoadMore = false
      return
    }
    if (!this.isCanLoadMore || isLoadingPic)
      return;
    this.setState({page: page + 1, isLoadingPic: true}, () => {
      this.isCanLoadMore = false
      this.searchPicList(searchPicText)
    })
  }

  _getItemLayout = (data, index) => {
    return {length: 122, offset: 122 * index, index}
  }
  setSearchPicText = (value) => {
    this.setState({searchPicText: value})
    if (!value) {
      this.resetPicList()
    }
  }

  searchPicList = (searchPicText) => {
    Keyboard.dismiss()
    showModal('加载中', 'loading', 6000, 100)
    const {vendor_id, accessToken} = this.props.global
    const {page, pageSize, picList} = this.state
    if (!searchPicText) {
      this.setState({picList: [], page: 1, isLastPage: false, isLoadingPic: false})
      return
    }
    const url = `/api_products/search_product_pic_by_name?access_token=${accessToken}`
    const params = {
      vendor_id: vendor_id,
      name: searchPicText,
      page: page,
      pageSize: pageSize
    }

    HttpUtils.get(url, params).then(res => {
      hideModal()
      const {lists = [], isLastPage = false, page = 1} = res
      if (Array.isArray(lists))
        this.setState({
          picList: Number(page) === 1 ? lists : picList.concat(lists),
          isLastPage: isLastPage,
          page: page,
          isSearchPicList: true,
          isLoadingPic: false
        })
      else {
        showError('返回的结果有问题', 100)
        this.setState({isSearchPicList: true, isLoadingPic: false})
      }
    }).catch(() => {
      showError('返回的结果有问题', 100)
      this.setState({isSearchPicList: true, isLoadingPic: false})
    })

  }

  modifyPic = (item) => {
    let {selectPreviewPic, upload_files} = this.state
    upload_files[selectPreviewPic.index] = {id: item.id, name: item.name, url: item.thumb, key: item.name}
    selectPreviewPic = {...selectPreviewPic, id: item.id, url: item.thumb}
    this.setState({
      upload_files: upload_files,
      searchPicVisible: false,
      selectPreviewPic: selectPreviewPic,
      searchPicText: '',
      picList: []
    })
  }

  addPic = (item) => {
    let {upload_files} = this.state
    const index = upload_files.findIndex(item => item.key === '+')
    if (index > 0)
      upload_files.splice(index, 0, {id: item.id, name: item.name, url: item.thumb, key: item.name})
    else
      upload_files.push({id: item.id, name: item.name, url: item.thumb, key: item.name})
    this.setState({
      upload_files: upload_files,
      searchPicVisible: false,
      searchPicText: '',
      picList: []
    })
  }

  operatePicType = (item) => {
    const {selectPicType} = this.state
    if (selectPicType) {
      this.addPic(item)
      return
    }
    this.modifyPic(item)
  }

  renderPicListItem = ({item}) => {
    return (
      <TouchableOpacity onPress={() => this.operatePicType(item)}>
        <FastImage source={{uri: item.thumb}}
                   resizeMode={FastImage.resizeMode.contain}
                   style={styles.searchModalImageWrap}/>
      </TouchableOpacity>
    )
  }

  setMainPic = () => {
    let {selectPreviewPic, upload_files} = this.state;

    [upload_files[0], upload_files[selectPreviewPic.index]] = [upload_files[selectPreviewPic.index], upload_files[0]]

    selectPreviewPic = {index: 0, url: upload_files[0]?.url, key: upload_files[0].id}

    this.setState({upload_files: [...upload_files], selectPreviewPic: selectPreviewPic})
  }

  renderModalItem = (item, index) => {
    const {selectPreviewPic, vendor_has, store_has} = this.state
    if (item.disabledDrag)
      return this.renderLockedItem(item, index)
    return (
      <View style={styles.hasImageList}>
        <FastImage style={selectPreviewPic.index === index ? styles.selectImage : styles.img_add}
                   source={{uri: item?.url}}
                   resizeMode={FastImage.resizeMode.contain}/>
        <If condition={!vendor_has && !store_has && this.isProdEditable()}>
          <TouchableOpacity style={styles.deleteUploadImageIcon}
                            onPress={() => this.deleteUploadImage(index)}>
            <MaterialIcons name={"clear"} size={pxToDp(40)} color={"#d81e06"} msg={false}/>
          </TouchableOpacity>
        </If>
        <If condition={0 === index}>
          <Text style={styles.isMainPicFlagText}>
            主图
          </Text>
        </If>
      </View>
    )
  }

  render() {
    const {spec_type, allow_multi_spec} = this.state
    return (
      <>
        <KeyboardAwareScrollView>
          <View style={{flex: 1}}>
            {this.renderBaseInfo()}
            <If condition={spec_type === 'spec_multi' && allow_multi_spec === 1}>
              {this.renderMultiSpecs()}
            </If>
            {this.renderOtherInfo()}
          </View>
          {this.renderScanner()}
          {this.renderSuccessInfo()}
          {this.renderActionSheet()}
          {this.renderModal()}
          {this.renderSearchPic()}
        </KeyboardAwareScrollView>
        {this.renderSaveInfo()}
      </>
    )
  }

  getItemLayout = (data, index) => ({
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index
  })

  getCategoryIdBySGId = (sg_tag_id) => {
    const {accessToken, vendor_id, store_id} = this.props.global
    const url = `/api_products/get_self_tags_by_sg?access_token=${accessToken}`
    const params = {
      vendor_id: vendor_id,
      store_id: store_id,
      sg_id: sg_tag_id
    }
    HttpUtils.get(url, params).then(res => {
      const {self = []} = res
      if (Array.isArray(self))
        this.setState({store_categories: self})
    }).catch(() => {
    })
  }

  selectItem = (item, category) => {
    switch (category) {
      case 1:
        this.setState({
          secondary_categories: item.children,
          three_categories: [],
          select_basic_categories: item,
          buttonDisabled: true
        })
        break
      case 2:
        this.setState({
          three_categories: item.children,
          select_secondary_categories: item,
          buttonDisabled: true,
          sg_tag_id: '0'
        })
        break
      case 3:
        this.setState({basic_category_obj: {...item}, sg_tag_id: item.id, buttonDisabled: false})
        this.getCategoryIdBySGId(item.id)
        break
    }
  }

  renderBasicCategories = ({item}, category) => {
    if (item.children) {
      const {select_basic_categories, select_secondary_categories} = this.state
      return (
        <TouchableOpacity
          style={select_basic_categories.id === item.id || select_secondary_categories.id === item.id ? styles.selectItemWrap : styles.itemWrap}
          onPress={() => this.selectItem(item, category)}>
          <Text style={styles.itemText}>
            {item.name}
          </Text>

          <AntDesign name={'right'} color={colors.color999} size={14}/>
        </TouchableOpacity>
      )
    }
    const {sg_tag_id} = this.state
    return (
      <TouchableOpacity style={styles.itemWrap} onPress={() => this.selectItem(item, category)}>
        <Text style={styles.itemText}>
          {item.nameShow ?? item.name}
        </Text>
        <If condition={item.id === sg_tag_id}>
          <AntDesign name={'check'} color={colors.main_color} size={14}/>
        </If>
      </TouchableOpacity>
    )
  }

  renderSelectSG = () => {
    const {basic_categories} = this.props.global
    const {secondary_categories, three_categories, searchCategoriesKey, searchCategoriesList} = this.state
    if (searchCategoriesKey)
      return (
        <View style={styles.modalStyle}>
          <FlatList data={searchCategoriesList}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={{flex: 1}}
                    initialNumToRender={10}
                    getItemLayout={(data, index) => this.getItemLayout(data, index)}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={(item) => this.renderBasicCategories(item, 3)}/>
        </View>
      )
    return (
      <View style={styles.modalStyle}>
        <FlatList data={basic_categories}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  style={{flex: 1}}
                  initialNumToRender={10}
                  getItemLayout={(data, index) => this.getItemLayout(data, index)}
                  keyExtractor={(item, index) => `${index}`}
                  renderItem={(item) => this.renderBasicCategories(item, 1)}/>
        <FlatList data={secondary_categories}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  style={{flex: 1}}
                  initialNumToRender={10}
                  getItemLayout={(data, index) => this.getItemLayout(data, index)}
                  keyExtractor={(item, index) => `${index}`}
                  renderItem={(item) => this.renderBasicCategories(item, 2)}/>
        <FlatList data={three_categories}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  style={{flex: 1}}
                  initialNumToRender={10}
                  getItemLayout={(data, index) => this.getItemLayout(data, index)}
                  keyExtractor={(item, index) => `${index}`}
                  renderItem={(item) => this.renderBasicCategories(item, 3)}/>
      </View>
    )
  }

  deleteUploadImage = (index) => {
    const {upload_files, selectPreviewPic} = this.state
    if (upload_files.length > 0) {
      upload_files.splice(index, 1)
    }

    const nextImage = upload_files[selectPreviewPic.index]
    if (nextImage) {
      this.setState({
        selectPreviewPic: {...selectPreviewPic, url: nextImage?.url},
        upload_files: [...upload_files]
      })
      return
    }
    if (upload_files[0]) {
      this.setState({
        selectPreviewPic: {...selectPreviewPic, index: 0, url: upload_files[0]?.url},

        upload_files: [...upload_files]
      })
      return;
    }
    this.setState({
      selectPreviewPic: {...selectPreviewPic, index: -1, url: ''},
      upload_files: [...upload_files]
    })
  }

  renderUploadImg = () => {
    let {upload_files, selectPreviewPic, store_has, vendor_has} = this.state
    return (
      <View style={styles.area_cell}>
        <If condition={tool.length(upload_files) > 0}>
          {
            upload_files.map((item, index) => {
              if (index === 0)
                selectPreviewPic = {index: 0, url: item?.url, key: item.id}
              return (
                <View key={index} style={styles.hasImageList}>
                  <TouchableOpacity
                    onPress={() => this.setState({dragPicVisible: true, selectPreviewPic: selectPreviewPic})}>
                    <FastImage style={styles.img_add} source={{uri: item?.url}}
                               resizeMode={FastImage.resizeMode.contain}/>
                  </TouchableOpacity>
                  <If condition={!vendor_has && !store_has && this.isProdEditable()}>
                    <TouchableOpacity style={styles.deleteUploadImageIcon}
                                      onPress={() => this.deleteUploadImage(index)}>
                      <MaterialIcons name={"clear"} size={pxToDp(40)} color={"#d81e06"} msg={false}/>
                    </TouchableOpacity>
                  </If>

                </View>
              );
            })
          }
        </If>
        <If condition={tool.length(upload_files) <= 0}>
          <View style={styles.imageIconWrap}>
            <FontAwesome5 name={'images'} size={32} color={colors.colorCCC}/>
          </View>
        </If>
        <If condition={!vendor_has && !store_has && tool.length(upload_files) < 8}>
          <View style={styles.plusIconWrap}>
            <TouchableOpacity style={[styles.img_add_box]}
                              onPress={() => this.setState({showImgMenus: true, selectPicType: true})}>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </If>
      </View>
    )
  }

}

const ITEM_HEIGHT = 36
const PIC_SIZE_WRAP = 112

const styles = StyleSheet.create({
  searchPicFromLib: {fontSize: 16, padding: 8, color: colors.color333},
  noResultText: {color: colors.colorEEE, fontSize: 16, textAlign: 'center'},
  searchModalWrap: {
    width: '100%',
    maxHeight: height * 0.8,
    minHeight: height * 0.6,
    backgroundColor: colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  searchModalHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1
  },
  searchModalHeaderText: {fontSize: 15, fontWeight: 'bold', lineHeight: 21, padding: 12},
  searchModalInputWrap: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: '#F7F7F7',
    marginLeft: 10,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  searchModalInput: {flex: 1, padding: 6},
  searchModalClearText: {paddingRight: 8, paddingVertical: 6, color: colors.color999},
  searchModalImageWrap: {
    height: PIC_SIZE_WRAP,
    width: PIC_SIZE_WRAP,
    borderWidth: 1,
    borderColor: colors.colorCCC,
    borderRadius: 4,
    marginTop: 10,
    marginLeft: 10,
  },
  modifyPicModal: {backgroundColor: colors.color000, flex: 1},
  modifyPicHeader: {
    flex: 0.6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 11
  },
  modifyPicHeaderText: {fontSize: 18, fontWeight: 'bold', color: colors.white, lineHeight: 25},
  modifyMainPic: {
    flex: 2.5,
    marginHorizontal: 11,
    marginTop: height * 0.07,
    marginBottom: height * 0.167,
    justifyContent: 'center'
  },
  modifyPicList: {marginLeft: 11, flex: 2},
  modifyPicBtnWrap: {flex: 0.5, flexDirection: 'row', alignItems: 'center'},
  modifyPicBtn: {flex: 1, marginHorizontal: 10, borderRadius: 2},
  modifyPicBtnText: {color: colors.white, fontSize: 16, paddingVertical: 7, textAlign: 'center'},
  operationSpecsBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',

    //justifyContent: 'space-around'
  },
  addSpecsWrap: {
    flex: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteSpecsWrap: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingVertical: 13,
  },
  addSpecsText: {
    paddingVertical: 13,
    fontSize: 16,
    color: colors.main_color,
    lineHeight: 22
  },
  multiSpecsTip: {
    marginLeft: 14,
    marginTop: 4,
    fontSize: 10,
    color: colors.color333,
    lineHeight: 14
  },
  imageIconWrap: {
    height: PICTURE_SIZE,
    width: PICTURE_SIZE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  plusIconWrap: {
    height: PICTURE_SIZE, width: PICTURE_SIZE, flexDirection: "row", alignItems: "flex-end"
  },
  plusIcon: {
    fontSize: 48,
    color: colors.color999,
    textAlign: "center"
  },
  itemWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    height: ITEM_HEIGHT,
    flexWrap: 'wrap'
  },
  selectItemWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.colorEEE,
    marginHorizontal: 8,
    height: ITEM_HEIGHT,
    flexWrap: 'wrap'
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: colors.color333
  },
  weightUnitWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'center'
  },
  weightUnit: {
    fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 17,
  },
  modalSearchIcon: {width: 40, textAlign: 'center'},
  modalSearch: {color: colors.main_color, fontSize: 14},
  successTipText: {width: "100%", textAlign: "center", fontSize: pxToDp(30), color: colors.color333},
  successAddStoreTipText: {width: "100%", textAlign: "center"},
  saveZoneWrap: {marginTop: 32, justifyContent: 'flex-end', backgroundColor: colors.white},
  headerWrap: {
    height: pxToDp(72),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingRight: pxToDp(30)
  },
  headerText: {
    fontWeight: "bold", marginRight: 8, color: colors.color333, fontSize: 12
  },
  modalHeaderWrap: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalHeaderText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: colors.color333,
    fontSize: 14,
    fontWeight: "bold"
  },
  modalSearchZone: {
    paddingRight: 15, paddingLeft: 15
  },
  modalSearchWrap: {
    height: 40,
    backgroundColor: colors.colorEEE,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-around"
  },

  selectedCateStyle: {
    width: "100%", borderRadius: 0, bottom: 0
  },
  baseRowWrap: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingLeft: 12,
    flex: 1,
  },
  baseRowCenterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    flex: 1,
  },

  leftText: {
    width: 70,
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20
  },
  leftFlag: {
    color: '#EE2626'
  },
  hasImageList: {
    height: PICTURE_SIZE, width: PICTURE_SIZE, flexDirection: "row", alignItems: "flex-end"
  },
  deleteUploadImageIcon: {
    position: "absolute", right: pxToDp(2), top: pxToDp(4)
  },
  isMainPicFlagText: {
    position: 'absolute',
    top: 12,
    left: 4,
    backgroundColor: '#464646',
    opacity: 0.71,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 14
  },
  textInputStyle: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
  },
  saleStatusWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

  },
  saleStatusItemWrap: {
    width: 80,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saleStatusText: {
    paddingLeft: 4,
    fontSize: 12,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 17
  },
  rightSelect: {
    width: 40,
  },
  rightEmptyView: {
    textAlign: 'center',
    width: 40,
  },
  modalStyle: {
    flex: 1,
    height: '75%',
    marginTop: 12,
    flexDirection: 'row'
  },
  modalWrap: {
    height: '75%', backgroundColor: colors.white, borderTopLeftRadius: 8, borderTopRightRadius: 8
  },
  selectTipText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color999,
    lineHeight: 17
  },

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
    fontSize: 14,
    color: colors.main_color,
    marginRight: pxToDp(22)
  },
  bottomBtn: {
    height: pxToDp(70), flex: 0.8, alignItems: 'center', justifyContent: 'center'
  },
  viceFontColor: {
    color: colors.color999
  },
  recommendList: {
    paddingHorizontal: pxToDp(31),
    backgroundColor: colors.white,
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
    paddingVertical: pxToDp(35),
    minHeight: 100,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  area_input_title: {
    color: "#363636",
    fontSize: pxToDp(30)
  },
  img_add_box: {
    height: 73,
    width: 73,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfbfbf"
  },
  img_add: {
    height: 73,
    width: 73,
    borderWidth: 1,
    borderColor: "#bfbfbf"
  },
  selectImage: {
    height: 73,
    width: 73,
    justifyContent: "space-around",
    borderWidth: pxToDp(1),
    borderColor: colors.red
  },
  input_text: {
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  navLeftIcon: {
    width: pxToDp(28),
    height: pxToDp(28),
    marginRight: 16,
    color: colors.color333
  },
  n1grey3: {
    color: colors.color333,
    fontSize: 14
  },
  around: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  n1b: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: "bold"
  },
  endcenter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GoodsEditScene);
