import React, {PureComponent} from "react";
import {Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {ActionSheet, Button, Dialog} from "../../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {fetchSgTagTree, getProdDetailByUpc, productSave} from "../../../reducers/product/productActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import Config from "../../../pubilc/common/config";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../../pubilc/util/tool";
import Cts from "../../../pubilc/common/Cts";
import {hideModal, showError, showModal, showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";
import {QNEngine} from "../../../pubilc/util/QNEngine";
//组件
import _ from 'lodash';
import Scanner from "../../../pubilc/component/Scanner";
import HttpUtils from "../../../pubilc/util/http";
import SegmentedControl from "@ant-design/react-native/es/segmented-control/segmented.android";
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
        ...globalActions
      },
      dispatch
    )
  };
}

function checkImgURL(url) {
  return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

let category_obj_new = {}
let basic_category_name_path = []

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
      label: '取消', onPress: () => this.setState({showImgMenus: false})
    }
  ]

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    const {currVendorId, fnProviding} = tool.vendor(props.global);
    const {scan, product_detail} = (props.route.params || {});
    const {currStoreId} = this.props.global;
    this.state = {
      isSelectCategory: true,
      selectHeaderText: '闪购类目',
      actualNum: '',//库存
      visible: false,//modal
      weightList: [],//重量单位列表
      selectWeight: product_detail?.unit_info || {label: '克', value: 1},//选择重量单位
      provided: 1,
      name: "",//商品名称
      sku_having_unit: "1",
      tag_info_nur: "",
      promote_name: "",
      list_img: {},
      selectedItems: [],
      cover_img: "",
      upload_files: {},
      price: "",//商品价格
      basic_category_obj: {},
      basic_category: [],
      basic_categories: [],
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
      editable_upc: true,
      showRecommend: false,
      showImgMenus: false,
      buttonDisabled: true,

      store_tags: {},
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
      fnProviding: fnProviding,

      store_has: false,
      searchValue: '',//搜索内容
      spec_type: 'spec_single',
      multiSpecsList: [{
        sku_name: '',//规格
        price: '',//价格
        weight: '',//重量
        sku_unit: '克',
        selectWeight: {value: 1, label: '克'},//选择重量
        upc: '',//条形码
        actualNum: '',//库存
        inventory: {
          actualNum: '',
          differenceType: 2,
          totalRemain: '',
          remark: '',
          store_id: currStoreId,
          skipCheckChange: 1
        }
      }],
      isScanMultiSpecsUpc: false,
      scanMultiSpecsUpcIndex: 0,
      allow_multi_spec: 0
    };

  }

  navigationOptions = ({navigation, route}) => {
    const {params = {}} = route;
    let {type} = params;
    navigation.setOptions({
      headerTitle: type === "edit" ? "修改商品" : "新增商品",
      headerRight: () => this.headerRight(type)
    })

  };

  headerRight = (type) => {
    return (
      <If condition={'edit' !== type}>
        <TouchableOpacity style={styles.headerWrap}
                          onPress={() => this.startScan(true)}>
          <Text style={styles.headerText}>
            扫码上新
          </Text>
          <Ionicons name={'scan-sharp'} size={16} iconStyle={styles.navLeftIcon}/>
        </TouchableOpacity>
      </If>
    )
  }

  componentDidMount() {

    this.navigationOptions(this.props)

    this.getWeightUnitList()
    this.getAllowMultiSpecs()
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
          upload_files[file_id] = {id: 0, name: newImageKey, path: uri};
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
    //this.initEmptyState();

    if (type === "edit") {
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
          if (validImages && tool.length(validImages) > 0) {
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
    let {vendor_id} = this.state;
    const url = `/data_dictionary/get_app_sg_tags/${vendor_id}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((obj) => {
      this.setState({
        basic_categories: obj,
      });
    }).catch()
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
    });
  };

  initEmptyState(appendState) {
    this.setState({
      provided: 1,
      name: "",
      actualNum: '',
      sku_having_unit: "1",
      tag_info_nur: "",
      promote_name: "",
      list_img: {},
      selectedItems: [],
      cover_img: "",
      upload_files: {},
      price: "",
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
      basic_category, sg_tag_id, id, sku_unit, tag_list_id, name, weight, sku_having_unit, tag_list, tag_info_nur,
      promote_name, mid_list_img, coverimg, upc, store_has, spec_list, series_id
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
      list_img: mid_list_img,
      cover_img: coverimg,
      upload_files: upload_files,
      sg_tag_id: sg_tag_id,
      basic_category: basic_category,
      store_categories: tag_list_id,
      tag_list: tag_list,
      spec_type: parseInt(series_id) > 0 ? 'spec_multi' : 'spec_single',
      multiSpecsList: spec_list,
      store_has: store_has === 1 && this.props.route.params.type === 'add',
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
        sg_tag_id: upc_data.basic_category_obj.id
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

  onNameChanged = (name) => {
    // let {type} = this.props.route.params;
    this.setState({name})
    this.recommendProdByName(name)
    // if (name && type !== 'edit') {
    //   this.recommendProdByName(name)
    // } else {
    //   this.setState({name: ''}, () => {
    //     this.recommendProdByName(name)
    //   })
    // }
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
    Alert.alert('错误提示', '商品编码不合法，请重新扫描', [
      {
        text: '确定', onPress: () => {
        }
      },
    ]);
  }

  componentDidUpdate() {
    let {params} = this.props.route;
    let {store_categories, tag_list} = params || {};
    if (store_categories && tag_list) {
      this.setState({store_categories: store_categories, tag_list: tag_list});
    }
  }

  startScan = (flag, isScanMultiSpecsUpc = false, index = 0) => {
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
    if (!this.state.fnProviding) {
      this.setState({provided: Cts.STORE_COMMON_PROVIDED});
    }
    let {
      id, name, vendor_id, weight, sku_having_unit, sg_tag_id, store_categories, upload_files, price,
      sale_status, provided, task_id, actualNum, selectWeight, upc, spec_type, multiSpecsList
    } = this.state;

    const {accessToken, currStoreId} = this.props.global;

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
      limit_stores: [currStoreId],
    };
    formData.spec_type = spec_type
    if (spec_type === 'spec_multi') {
      formData.spec_list = multiSpecsList
    }
    if (type === "add") {
      formData.store_goods_status = {
        price: price,
        sale_status: sale_status,
        provided: provided
      };
      if (spec_type === 'spec_single') {
        formData.store_goods_status.price = price
        formData.inventory = {
          actualNum: actualNum,
          differenceType: 2,
          totalRemain: actualNum,
          remark: '',
          store_id: currStoreId,
          skipCheckChange: 1
        }
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
          } else {
            showSuccess("修改成功");
            navigation.goBack();
          }
        } else {

          ToastLong(reason);
        }
      }
      showModal('提交中')
      this.setState({uploading: true});
      if (this.state.uploading) {
        return false;
      }
      if (this.isAddProdToStore()) {
        this.addProdToStore(save_done)
      } else {

        dispatch(productSave(formData, accessToken, save_done));
      }
    }
  };

  dataValidate = (formData) => {
    let {type = 'add'} = this.props.route.params;
    const {
      id, name, vendor_id, weight, store_categories, store_goods_status, spec_list, spec_type
    } = formData;
    if (type === "edit" && id <= 0) {
      ToastLong('数据异常, 无法保存')
      return false
    }
    if (type === "add") {
      //增加商品
      let {price, sale_status, provided} = store_goods_status;
      if ('spec_single' === spec_type) {
        if (parseInt(price) < 0) {
          ToastLong('请输入正确的商品价格')
          return false
        }
        if (!price) {
          ToastLong('请输入商品价格')
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

    }

    if ('spec_multi' === spec_type) {
      if (!Array.isArray(spec_list) || spec_list.length <= 0) {
        ToastLong('数据异常, 无法保存')
        return false
      }

      for (let i = 0; i < spec_list.length; i++) {
        if (!spec_list[i].sku_name) {
          ToastLong('请输入多规格名称')
          return false
        }
        if (!spec_list[i].price && type === 'add') {
          ToastLong('请输入多规格价格')
          return false
        }
        if (!spec_list[i].weight) {
          ToastLong('请输入多规格重量')
          return false
        }
        if (type === 'add' && !spec_list[i].inventory.actualNum) {
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
      if (!(vendor_id > 0)) {
        ToastLong('无效的品牌商')
        return false
      }

      if (!(weight > 0) && 'spec_single' === spec_type) {

        ToastLong('请输入正确的重量')
        return false
      }
      if (tool.length(store_categories) <= 0) {
        ToastLong('请选择门店分类')
        return false
      }
    }
    return true;
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

  menus = [
    {
      label: '拍照', onPress: this.pickCameraImg
    },
    {
      label: '从相册选择', onPress: this.pickSingleImg
    }
  ]

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

  recommendProdByName = (name) => {
    const {accessToken} = this.props.global;
    const url = `api_products/like_name_to_create?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(url, {name}).then(prods => {
      this.setState({likeProds: prods, showRecommend: true})
    })
  }

  getProdDetailByUpc = (upc) => {
    showModal("加载商品中...", 'loading', 20000)
    const {dispatch} = this.props;
    const {accessToken, currStoreId} = this.props.global;
    dispatch(getProdDetailByUpc(accessToken, currStoreId, upc, this.state.vendor_id, async (ok, desc, p) => {
      if (ok) {
        hideModal()
        if (p && p['id']) {
          this.onReloadProd(p)
        } else if (p && p['upc_data']) {
          this.onReloadUpc(p['upc_data'])
          if (p['upc_data'].category_id) {
            this.onSelectedItemsChange([(p['upc_data'].category_id).toString()])
          }
          if (p['upc_data']['sg_tag_id']) {
            this.setState({sg_tag_id: `${p['upc_data']['sg_tag_id']}`})
            this.SearchCommodityCategories(p['upc_data']['sg_tag_id'], 'id')
          }
        }
      } else {
        hideModal()
        showError(`${desc}`)
      }
    }))
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

  startUploadImg = (imgPath, imgName) => {
    showModal('图片上传中')
    this.setState({newImageKey: imageKey(imgName), isUploadImg: true})

    HttpUtils.get.bind(this.props)('/qiniu/getToken', {bucket: 'goods-image'}).then(res => {
      const params = {
        filePath: imgPath,
        upKey: this.state.newImageKey,
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

  SearchCommodityCategories = (searchValue, key = 'name') => {
    const {isSelectCategory, basic_categories} = this.state
    let result = this.searchCategories(basic_categories, function (category) {
      if (undefined === category[key])
        return false
      return category[key].indexOf(searchValue) === 0
    })
    if (result) {
      if (isSelectCategory)
        this.setState({
          basic_category_obj: result,
          sg_tag_id: result.id
        })
      else this.setState({
        store_categories_obj: result
      })
      this.renderSelectTag()
    } else {
      showError('找不到此类目')
    }
  }

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
  renderBaseInfo = () => {
    let {
      basic_category_obj, name, upc, weightList, weight, sale_status, fnProviding, likeProds, store_has, showRecommend,
      store_tags, editable_upc, price, selectWeight, actualNum, store_categories, spec_type, allow_multi_spec
    } = this.state
    const {type} = this.props.route.params;
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          基本信息
        </Text>
        <LineView/>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            <Text style={styles.leftFlag}>
              *
            </Text>商品名称
          </Text>
          <TextInput
            value={name}
            style={styles.textInputStyle}
            onChangeText={text => this.onNameChanged(text)}
            placeholderTextColor={colors.color999}
            placeholder={'不超过40个字符'}/>
          <If condition={name}>
            <Text style={styles.clearBtn} onPress={this.onNameClear}>
              清除
            </Text>
          </If>
          <If condition={!name}>
            <View style={styles.rightEmptyView}/>
          </If>

        </View>
        <If condition={showRecommend}>
          <View style={styles.recommendList}>
            {likeProds.map(like =>
              <View style={styles.recommendItem} key={like.id}>
                <Text onPress={() => this.onRecommendTap(like)}
                      style={[{flex: 1}, like.status_text && styles.viceFontColor || {color: colors.color333}]}
                      numberOfLines={1}>
                  {like.name}
                </Text>
                <If condition={like.status_text}>
                  <Text style={[{alignSelf: 'flex-end'}, styles.viceFontColor]}>{like.status_text} </Text>
                </If>
              </View>
            )}
          </View>
        </If>
        <If condition={store_has}>
          <Text style={{padding: '3%', paddingLeft: '4%', backgroundColor: colors.white, color: colors.warn_color}}>
            商品已存在
          </Text>
        </If>
        <LineView/>
        <View style={styles.baseRowWrap}>
          <Text style={styles.leftText}>
            <Text style={styles.leftFlag}>
              *
            </Text>商品图片
          </Text>
          {
            this.renderUploadImg()
          }
        </View>
        <LineView/>
        <If condition={this.isStoreProdEditable() && spec_type === 'spec_single'}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              <Text style={styles.leftFlag}>
                *
              </Text>报价
            </Text>
            <TextInput
              style={styles.textInputStyle}
              value={price}
              keyboardType={'numeric'}
              onChangeText={text => this.setState({price: text})}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品报价'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <If condition={!this.isAddProdToStore()}>
          <If condition={spec_type === 'spec_single'}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>重量
              </Text>
              <TextInput
                style={styles.textInputStyle}
                value={weight}
                keyboardType={'numeric'}
                onChangeText={text => this.setState({weight: text})}
                placeholderTextColor={colors.color999}
                placeholder={'请输入商品重量'}/>
              <ModalSelector style={styles.rightSelect}
                             data={weightList}
                             skin={'customer'}
                             onChange={item => this.setState({selectWeight: item})}
                             defaultKey={-999}>
                <View style={styles.weightUnitWrap}>
                  <Text style={styles.weightUnit}>
                    {`${selectWeight.label}>`}
                  </Text>
                </View>
              </ModalSelector>
            </View>
            <LineView/>
          </If>
          <If condition={editable_upc && this.isStoreProdEditable() && spec_type === 'spec_single'}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                商品条码
              </Text>
              <TextInput
                value={upc}
                editable={this.isStoreProdEditable()}
                onChangeText={upc => this.setState({upc: upc})}
                style={styles.textInputStyle}
                placeholderTextColor={colors.color999}
                placeholder={'请扫描或输入条形码'}/>
              <View style={styles.rightEmptyView}/>
            </View>
            <LineView/>
          </If>
          <If condition={fnProviding && this.isStoreProdEditable() && spec_type === 'spec_single'}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>库存
              </Text>
              <TextInput
                value={actualNum}
                onChangeText={text => this.setState({actualNum: text})}
                style={styles.textInputStyle}
                placeholderTextColor={colors.color999}
                placeholder={'请输入商品库存'}/>
              <View style={styles.rightEmptyView}/>
            </View>
            <LineView/>
          </If>
          <If condition={this.isStoreProdEditable()}>
            <TouchableOpacity style={styles.baseRowCenterWrap}
                              onPress={() => this.setSelectHeaderText('闪购类目', true)}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>闪购类目
              </Text>
              <View style={styles.textInputStyle}>
                <Text style={styles.selectTipText}>
                  {basic_category_obj.name_path ?? '请选择类目'}
                </Text>
              </View>
              <MaterialIcons name={'chevron-right'} style={styles.rightEmptyView} color={colors.colorCCC} size={26}/>
            </TouchableOpacity>
            <LineView/>
          </If>

          <If condition={tool.length(store_tags) > 0}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>商品分类
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
          <If condition={this.isStoreProdEditable()}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>上架状态
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
          </If>
          <If condition={allow_multi_spec === 1 && 'add' === type}>
            <View style={styles.baseRowCenterWrap}>
              <Text style={styles.leftText}>
                商品规格
              </Text>
              <View style={styles.saleStatusWrap}>
                <TouchableOpacity style={styles.saleStatusItemWrap}
                                  onPress={() => this.setState({spec_type: 'spec_single'})}>
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
                                  onPress={() => this.setState({spec_type: 'spec_multi'})}>
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
      </View>
    )
  }

  renderMultiSpecs = () => {
    const {multiSpecsList, weightList, fnProviding} = this.state
    const {type = 'add'} = this.props.route.params;
    return (
      <>
        <Text style={styles.multiSpecsTip}>
          提示：当前添加商品为多规格，保存后商品至少有一个规格，不可更改为单规格
        </Text>
        {
          multiSpecsList && multiSpecsList.map((item, index) => {
            return this.renderMultiSpecsInfo(item, index, weightList, multiSpecsList, fnProviding, type)
          })
        }
      </>
    )
  }

  setMultiSpecsInfo = (index, key, value) => {
    const {currStoreId} = this.props.global;
    const {multiSpecsList} = this.state
    const multiSpecsInfo = multiSpecsList[index]
    multiSpecsInfo[key] = value
    if ('selectWeight' === key)
      multiSpecsInfo['sku_unit'] = multiSpecsInfo[key].label
    if ('inventory' === key)
      multiSpecsInfo['inventory'] = {
        actualNum: value,//库存
        differenceType: 2,
        totalRemain: value,
        remark: '',
        store_id: currStoreId,
        skipCheckChange: 1
      }
    this.setState({
      multiSpecsList: multiSpecsList.concat([])
    })

  }

  renderMultiSpecsInfo = (item, index, weightList, multiSpecsList, fnProviding, type) => {
    const {inventory = {}, upc, weight, price, sku_name} = multiSpecsList[index]
    const {actualNum = '0'} = inventory
    return (
      <View style={Styles.zoneWrap} key={index}>
        <Text style={Styles.headerTitleText}>
          规格信息
        </Text>
        <LineView/>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            <Text style={styles.leftFlag}>
              *
            </Text>规格名称
          </Text>
          <TextInput
            maxLength={40}
            value={sku_name}
            //editable={this.isStoreProdEditable()}
            onChangeText={value => this.setMultiSpecsInfo(index, 'sku_name', value)}
            style={styles.textInputStyle}
            placeholderTextColor={colors.color999}
            placeholder={'请填写规格名称，例如200g'}/>
          <View style={styles.rightEmptyView}/>
        </View>
        <LineView/>
        <If condition={'add' === type}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              <Text style={styles.leftFlag}>
                *
              </Text>报价
            </Text>
            <TextInput
              keyboardType={'numeric'}
              value={price}
              //editable={this.isStoreProdEditable()}
              onChangeText={value => this.setMultiSpecsInfo(index, 'price', value)}
              style={styles.textInputStyle}
              placeholderTextColor={colors.color999}
              placeholder={'请输入商品报价'}/>
            <View style={styles.rightEmptyView}/>
          </View>
          <LineView/>
        </If>
        <View style={styles.baseRowCenterWrap}>
          <Text style={styles.leftText}>
            <Text style={styles.leftFlag}>
              *
            </Text>重量
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
                         onChange={item => this.setMultiSpecsInfo(index, 'selectWeight', item)}
                         defaultKey={-999}>
            <View style={styles.weightUnitWrap}>
              <Text style={styles.weightUnit}>
                {`${item.selectWeight.label}>`}
              </Text>
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
        <If condition={fnProviding && 'add' === type}>
          <View style={styles.baseRowCenterWrap}>
            <Text style={styles.leftText}>
              <Text style={styles.leftFlag}>
                *
              </Text>库存
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
          <If condition={multiSpecsList.length === index + 1 && 'add' === type}>
            <TouchableOpacity style={styles.addSpecsWrap} onPress={this.addSpecs}>
              <AntDesign name={'plus'} size={12} color={colors.main_color}/>
              <Text style={styles.addSpecsText}>
                添加规格
              </Text>
            </TouchableOpacity>
          </If>
          <If condition={multiSpecsList.length > 1 && index !== 0}>
            <TouchableOpacity style={styles.deleteSpecsWrap} onPress={() => this.deleteSpecs(index)}>
              <AntDesign name={'delete'} size={22} color={colors.main_color}/>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }
  addSpecs = () => {
    const {currStoreId} = this.props.global;
    const {multiSpecsList} = this.state
    const multiSpecsInfo = {
      sku_name: '',//规格
      price: '',//价格
      weight: '',//重量
      sku_unit: '克',
      selectWeight: {value: 1, label: '克'},//选择重量
      upc: '',//条形码
      actualNum: '',
      inventory: {
        actualNum: '',//库存
        differenceType: 2,
        totalRemain: '',
        remark: '',
        store_id: currStoreId,
        skipCheckChange: 1

      }
    }
    multiSpecsList.push(multiSpecsInfo)
    this.setState({
      multiSpecsList: multiSpecsList.concat([])
    })
  }

  deleteSpecs = (index) => {
    const {type} = this.props.route.params;
    if ('edit' === type) {
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
    this.deletedSpecsInfo(index)
  }

  deleteSpecsInfoToServer = (index) => {
    const {currStoreId} = this.props.global;
    const {multiSpecsList} = this.state
    const {id} = multiSpecsList[index]
    if (!id) {
      showError('规格信息不完整，不可删除')
      return
    }
    const url = `/v1/new_api/store_product/del_store_pro/${currStoreId}/${id}`
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
      <If condition={fnProviding && this.isStoreProdEditable()}>
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

            <MaterialIcons name={'chevron-right'} style={styles.rightEmptyView} color={colors.colorCCC} size={26}/>
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

  renderModal = () => {
    const {
      searchValue, basic_category_obj, visible, buttonDisabled, isSelectCategory,
      selectHeaderText, store_categories_obj
    } = this.state
    let values, selectedIndex
    if (isSelectCategory) {
      values = basic_category_obj.name_path ? basic_category_obj.name_path.split(",") : ['请选择']
      selectedIndex = basic_category_obj.name_path ? tool.length(basic_category_obj.name_path.split(",")) - 1 : 1
    } else {
      values = store_categories_obj.name_path ? store_categories_obj.name_path.split(",") : ['请选择']
      selectedIndex = store_categories_obj.name_path ? tool.length(store_categories_obj.name_path.split(",")) - 1 : 1
    }
    return (
      <If condition={visible}>
        <CommonModal position={'flex-end'} visible={visible} animationType={'slide-up'}>
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
                <MaterialIcons name={"search"} size={26} style={styles.modalSearchIcon}/>
                <TextInput value={searchValue ? searchValue : ''}
                           placeholder={`搜索${selectHeaderText}`}
                           placeholderTextColor={colors.color999}
                           onChangeText={value => this.setState({searchValue: value})}
                           style={{flex: 1, padding: 0}}/>
                <TouchableOpacity style={styles.modalSearchIcon}
                                  onPress={() => this.SearchCommodityCategories(searchValue)}>
                  <Text style={styles.modalSearch}>搜索 </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.selectCateStyle}>
              <SegmentedControl
                onValueChange={() => this.onValueChange(isSelectCategory ? basic_category_obj : store_categories_obj)}
                tintColor={colors.main_color}
                values={values}
                style={{height: 30, width: "90%", marginLeft: "4%"}}
                selectedIndex={selectedIndex}
              />
            </View>
            {this.renderSelectTag()}
            <Button type={'primary'}
                    disabled={buttonDisabled}
                    style={styles.selectedCateStyle}
                    onPress={() => this.setState({visible: false})}>
              确认选中
            </Button>
          </View>
        </CommonModal>
      </If>
    )
  }

  render() {
    const {spec_type, allow_multi_spec} = this.state
    return (
      <>
        <ScrollView>
          {this.renderBaseInfo()}
          <If condition={spec_type === 'spec_multi' && allow_multi_spec === 1}>
            {this.renderMultiSpecs()}
          </If>
          {this.renderOtherInfo()}
        </ScrollView>
        {this.renderSaveInfo()}
        {this.renderScanner()}
        {this.renderSuccessInfo()}
        {this.renderActionSheet()}
        {this.renderModal()}
      </>
    )
  }

  onValueChange = (category_obj) => {
    let {isSelectCategory} = this.state
    if (Object.keys(category_obj).length) {
      let id_path = category_obj.id_path;
      let arr = id_path.substr(0, tool.length(id_path) - 1).substr(1, tool.length(id_path) - 1).split(',');
      arr.pop();
      if (tool.length(arr) >= 1) {
        category_obj_new.id = arr[tool.length(arr) - 1]
        category_obj_new.id_path = ',' + arr.toString() + ',';
        let name_path = category_obj.name_path;
        name_path = name_path.split(',')
        name_path.pop()
        category_obj_new.name = name_path[tool.length(name_path) - 1]
        category_obj_new.name_path = name_path.toString();
      } else {
        category_obj_new = {};
      }
      if (isSelectCategory)
        this.setState({basic_category_obj: {...category_obj_new}, buttonDisabled: true})
      else this.setState({store_categories_obj: {...category_obj_new}, buttonDisabled: true})
    }
  }

  renderItem = ({item}) => {
    const {basic_category_obj, isSelectCategory, store_categories_obj} = this.state
    if (isSelectCategory) {
      basic_category_name_path = basic_category_obj?.name_path ? basic_category_obj?.name_path?.split(",") : ['']
    } else {
      basic_category_name_path = store_categories_obj?.name_path ? store_categories_obj?.name_path?.split(",") : ['']
    }
    return (
      <>
        <If condition={tool.length(item.children) > 0}>
          <TouchableOpacity style={styles.itemWrap} onPress={() => this.setSelectItem(item)}>
            <Text style={styles.itemText}>
              {item.name}
            </Text>
            <AntDesign name={'right'} color={colors.color999} size={16}/>
          </TouchableOpacity>
        </If>
        <If condition={tool.length(item.children) <= 0}>
          <TouchableOpacity style={styles.itemWrap} onPress={() => this.setSelectItem(item)}>
            <Text style={styles.itemText}>
              {item.name}
            </Text>
            <If condition={item.name === basic_category_name_path[tool.length(basic_category_name_path) - 1]}>
              <AntDesign name={'check'} color={colors.main_color} size={16}/>
            </If>
          </TouchableOpacity>
        </If>
      </>
    )
  }
  setSelectItem = (item) => {
    const {isSelectCategory} = this.state
    if (isSelectCategory)
      this.setState({basic_category_obj: {...item}, sg_tag_id: item.id})
    else {
      if (undefined === item.children)
        this.setState({store_categories: [item.id], store_categories_obj: {...item}})
      else
        this.setState({store_categories_obj: {...item}})
    }
  }
  getItemLayout = (data, index) => ({
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index
  })
  renderSelectTag = () => {
    const {basic_categories, basic_category_obj, isSelectCategory, store_tags, store_categories_obj} = this.state

    let arr = [], list
    if (isSelectCategory) {
      if (Object.keys(basic_category_obj).length) {
        let {id_path} = basic_category_obj

        arr = id_path.substr(0, tool.length(id_path) - 1).substr(1, tool.length(id_path) - 1).split(',');
      }
      list = this.treeMenuList(basic_categories, arr);
    } else {
      if (Object.keys(store_categories_obj).length) {
        let {id_path} = store_categories_obj

        arr = id_path && id_path.substr(0, tool.length(id_path) - 1).substr(1, tool.length(id_path) - 1).split(',');
      }
      list = this.treeMenuList(store_tags, arr);
    }
    return (
      <FlatList style={styles.modalStyle}
                data={list}
                renderItem={this.renderItem}
                initialNumToRender={10}
                getItemLayout={(data, index) => this.getItemLayout(data, index)}
                keyExtractor={(item, index) => `${index}`}/>
    );
  }

  treeMenuList(children, ids) {

    if (undefined === ids) {

      return children

    }
    let id = ids && ids.shift();
    if (id !== undefined) {
      for (const item in children) {
        if (children[item].id === id) {
          if (tool.length(ids) >= 0) {
            if (children[item].children !== undefined) {
              return this.treeMenuList(children[item].children, ids)
            } else {
              this.setState({buttonDisabled: false})
              return children;
            }
          } else {
            if (children[item].children !== undefined) {
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

  deleteUploadImage = (img_id) => {
    const {list_img, upload_files} = this.state
    delete list_img[img_id];
    delete upload_files[img_id];
    this.forceUpdate()
  }

  renderUploadImg = () => {
    const {list_img, cover_img} = this.state
    return (
      <View style={styles.area_cell}>
        <If condition={tool.length(list_img) > 0}>
          {
            tool.objectMap(list_img, (img_data, img_id) => {
              return (
                <View key={img_id} style={styles.hasImageList}>
                  <Image style={styles.img_add} source={{uri: Config.staticUrl(img_data["url"])}}/>
                  <If condition={this.isProdEditable()}>
                    <TouchableOpacity style={styles.deleteUploadImageIcon}
                                      onPress={() => this.deleteUploadImage(img_id)}>
                      <MaterialIcons name={"clear"} size={pxToDp(40)} style={{backgroundColor: colors.white}}
                                     color={"#d81e06"}
                                     msg={false}/>
                    </TouchableOpacity>
                  </If>

                </View>
              );
            })
          }
        </If>
        <If condition={tool.length(list_img) <= 0}>
          <If condition={cover_img}>
            <View style={styles.hasImageList}>
              <Image style={styles.img_add} source={{uri: Config.staticUrl(cover_img)}}/>
              <If condition={this.isProdEditable()}>
                <TouchableOpacity style={{position: "absolute", right: pxToDp(4), top: pxToDp(4)}}
                                  onPress={() => this.setState({cover_img: ""})}>
                  <MaterialIcons name={"clear"} size={pxToDp(40)} style={{backgroundColor: colors.white}}
                                 color={"#d81e06"}
                                 msg={false}/>
                </TouchableOpacity>
              </If>
            </View>
          </If>
          <If condition={!cover_img}>
            <View style={styles.imageIconWrap}>
              <FontAwesome5 name={'images'} size={32} color={colors.colorCCC}/>
            </View>
          </If>
        </If>
        <If condition={this.isProdEditable()}>
          <View style={styles.plusIconWrap}>
            <TouchableOpacity
              style={[styles.img_add, styles.img_add_box]}
              onPress={() => this.setState({showImgMenus: true})}>
              <Text style={styles.plusIcon}>+ </Text>
            </TouchableOpacity>
          </View>
        </If>
      </View>
    )
  }

}

const ITEM_HEIGHT = 48
const styles = StyleSheet.create({
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
    height: pxToDp(170),
    width: pxToDp(170),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  plusIconWrap: {
    height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"
  },
  plusIcon: {
    fontSize: pxToDp(36),
    color: "#bfbfbf",
    textAlignVertical: "center",
    textAlign: "center"
  },
  itemWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    height: ITEM_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.colorEEE
  },
  itemText: {
    fontSize: 16,
    color: colors.color333
  },
  weightUnitWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'center'
  },
  weightUnit: {
    fontSize: 12, fontWeight: '400', color: colors.color333, lineHeight: 17,
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
  selectCateStyle: {
    flexDirection: "row", alignItems: "center", marginLeft: 10, paddingVertical: 10, justifyContent: "flex-start"
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
    height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"
  },
  deleteUploadImageIcon: {
    position: "absolute", right: pxToDp(2), top: pxToDp(4)
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
    height: '75%',
    paddingLeft: 8,
    paddingRight: 8
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
