import React, {PureComponent} from "react";
import {Image, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Dialog, Icon, Toast} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {fetchVendorTags, productSave, uploadImg} from "../../reducers/product/productActions";
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../common/tool";
import Cts from "../../Cts";
import {NavigationItem} from "../../widget";
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import MyBtn from "../../common/MyBtn";
//组件
import {Adv, Left} from "../component/All";

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
        ...globalActions
      },
      dispatch
    )
  };
}

let configState = {
  isRefreshing: false,
  isUploadImg: false,
  basic_cat_list: [],
  basic_categories: [],
  store_tags: {},
  sku_units: [{label: "斤", key: 0}, {label: "个", key: 1}],
  head_supplies: [
    {label: "门店自采", key: Cts.STORE_SELF_PROVIDED},
    {label: "总部供货", key: Cts.STORE_COMMON_PROVIDED}
  ],
  provided: 1,
  name: "",
  sku_having_unit: "",
  tag_info_nur: "",
  promote_name: "",
  list_img: {},
  cover_img: "",
  upload_files: {},
  price: "",
  basic_category: 0,
  store_categories: [],
  tag_list: "选择门店分类",
  id: 0,
  sku_unit: "请选择SKU单位",
  weight: "",
  selling_categories: [
    {label: "上架", key: Cts.STORE_PROD_ON_SALE},
    {label: "下架", key: Cts.STORE_PROD_OFF_SALE},
    {label: "缺货", key: Cts.STORE_PROD_SOLD_OUT}
  ],
  sale_status: -1,
  vendor_stores: "",
  goBackValue: false,
  task_id: 0,
  selectToWhere: false,
  torchMode: "on",
  cameraType: "back",
  scanBoolean: true
};

class GoodsEditScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type, backPage, task_id, name} = params;
    console.log("navigation.state.params", params);
    return {
      headerTitle: type === "edit" ? "修改商品" : "新增商品",
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => {
            if (!!backPage) {
              native.nativeBack();
            } else {
              navigation.goBack();
            }
          }}
        />
      ),
      headerRight: (
        <View
          style={{
            flexDirection: "row",
            paddingRight: pxToDp(30)
          }}
        >
          <MyBtn
            text="保存"
            style={{
              fontSize: pxToDp(32),
              color: "#59b26a"
            }}
            onPress={() => {
              params.upLoad();
            }}
          />
        </View>
      )
    };
  };

  constructor(props) {
    super(props);
    let {currVendorId, fnProviding} = tool.vendor(this.props.global);
    this.state = {
      ...configState,
      vendor_id: currVendorId,
      fnProviding: fnProviding
    };
    this.uploadImg = this.uploadImg.bind(this);
    this.upLoad = this.upLoad.bind(this);
    this.getVendorStore = this.getVendorStore.bind(this);
    this.back = this.back.bind(this);
    this.toModalData = this.toModalData.bind(this);
    this.dataValidate = this.dataValidate.bind(this);
  }

  componentWillMount() {
    let _this = this;
    let {params} = this.props.navigation.state;
    let {type} = params;
    if (type === "edit") {
      let product_detail = tool.deepClone(
        this.props.navigation.state.params.product_detail
      );
      const {
        basic_category,
        id,
        sku_unit,
        tag_list_id,
        name,
        weight,
        sku_having_unit,
        tag_list,
        tag_info_nur,
        promote_name,
        list_img,
        mid_list_img,
        coverimg
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
      console.log("mid_list_img>>>>", mid_list_img);
      console.log("upload_files>>>>", upload_files);
      this.setState({
        name: name,
        sku_having_unit: sku_having_unit,
        tag_info_nur: tag_info_nur || "",
        promote_name: promote_name || "",
        list_img: mid_list_img,
        cover_img: coverimg,
        upload_files: upload_files,
        basic_category: basic_category,
        store_categories: tag_list_id,
        tag_list: tag_list,
        id: id,
        sku_unit: sku_unit,
        weight: weight
      });
    } else {
      let vendor_store = this.toStores(
        this.props.mine.vendor_stores[this.state.vendor_id]
      );
      let {task_id, name} = this.props.navigation.state.params || {};
      if (vendor_store) {
        this.setState({vendor_stores: vendor_store});
      } else {
        _this.getVendorStore();
      }
      if (task_id && name) {
        this.setState({
          task_id: task_id,
          name: name
        });
      } else if (type === "scan") {
        let {
          name,
          weight,
          img
        } = this.props.navigation.state.params.product_detail;
        let upload_files = {};
        if (img != null && tool.length(img) > 0) {
          for (let img_id in img) {
            if (img.hasOwnProperty(img_id)) {
              let img_data = img[img_id];
              upload_files[img_id] = {
                id: img_id,
                name: img_data.name,
                path: img_data.path,
                mid_thumb: img_data.mid_thumb
              };
            }
          }
        }
        this.setState({
          name: name,
          list_img: img,
          weight: weight,
          upload_files: upload_files
        });
      }
    }

    let {store_tags, basic_category} = this.props.product;
    let {vendor_id} = this.state;
    if (
      store_tags[vendor_id] === undefined ||
      basic_category[vendor_id] === undefined
    ) {
      this.getVendorTags(vendor_id);
    } else {
      let basic_cat_list = this.toModalData(basic_category[vendor_id]);
      this.setState({
        basic_cat_list: basic_cat_list,
        basic_categories: basic_category[vendor_id],
        store_tags: store_tags
      });
    }
  }

  getVendorTags(_v_id) {
    if (_v_id > 0) {
      const {accessToken} = this.props.global;
      const {dispatch} = this.props;
      InteractionManager.runAfterInteractions(() => {
        dispatch(
          fetchVendorTags(_v_id, accessToken, resp => {
            console.log(resp.ok, resp.obj.basic_category, resp.ok.store_tags);
            if (resp.ok) {
              let {store_tags, basic_category} = resp.obj;
              let basic_cat_list = this.toModalData(basic_category);
              this.setState({
                basic_cat_list: basic_cat_list,
                basic_categories: basic_category,
                store_tags: store_tags
              });
            }
          })
        );
      });
    }
  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setParams({
      upLoad: this.upLoad,
      setScanflag: this.setScanflag
    });
  }

  componentDidUpdate() {
    let {key, params} = this.props.navigation.state;
    let {store_categories, tag_list} = params || {};
    if (store_categories && tag_list) {
      this.setState({store_categories: store_categories, tag_list: tag_list});
    }
  }

  setScanflag = flag => {
    this.setState({scanBoolean: flag});
  };

  back(type) {
    if (type === "add") {
      native.gotoPage(type);
    } else {
      this.props.navigation.goBack();
    }
  }

  async setBeforeRefresh() {
    let {state, dispatch} = this.props.navigation;
    const setRefreshAction = NavigationActions.setParams({
      params: {isRefreshing: true},
      key: state.params.detail_key
    });
    dispatch(setRefreshAction);
  }

  getVendorStore() {
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      getVendorStores(currVendorId, accessToken, resp => {
        if (resp.ok) {
          let curr_stores = resp.obj;
          let curr_stores_arr = [];
          Object.values(curr_stores).forEach((item, id) => {
            curr_stores_arr.push(item.name);
          });
          _this.setState({
            vendor_stores: curr_stores_arr.join(" , ")
          });
        }
      })
    );
  }

  resetRouter() {
    this.setState({...configState});
    resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: "GoodsEdit",
          params: {type: "add"}
        }) //要跳转到的页面名字
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }

  toModalData(obj) {
    let arr = [];
    Object.keys(obj).map(key => {
      if (key != Cts.TAG_HIDE) {
        let json = {};
        json.label = obj[key];
        json.key = key;
        arr.push(json);
      }
    });
    return arr;
  }

  upLoad = async () => {
    let {type} = this.props.navigation.state.params;
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
      basic_category,
      store_categories,
      promote_name,
      tag_info_nur,
      upload_files,
      price,
      sale_status,
      provided,
      task_id
    } = this.state;
    let formData = {
      id,
      vendor_id,
      name,
      sku_unit,
      weight,
      sku_having_unit,
      basic_category,
      store_categories,
      promote_name,
      tag_info_nur,
      upload_files,
      task_id
    };
    if (type === "add" || type === "scan") {
      formData.store_goods_status = {
        price: price,
        sale_status: sale_status,
        provided: provided
      };
    }
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    let check_res = this.dataValidate(formData);
    if (check_res) {
      this.setState({uploading: true});
      if (this.state.uploading) {
        return false;
      }
      dispatch(
        productSave(formData, accessToken, async (ok, reason, obj) => {
          this.setState({uploading: false});
          if (ok) {
            if (task_id > 0) {
              this.setState({selectToWhere: true});
            } else if (type === "scan") {
              ToastLong("上传成功");
              this.resetRouter();
            } else {
              await this.setBeforeRefresh();
              this.back(type);
            }
          } else {
            ToastLong(reason);
          }
        })
      );
    }
  };

  dataValidate(formData) {
    let type = this.props.navigation.state.params.type;
    const {
      id,
      name,
      vendor_id,
      sku_unit,
      weight,
      sku_having_unit,
      basic_category,
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
          sale_status === Cts.STORE_PROD_OFF_SALE ||
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

    if (name.length <= 0 || name == undefined) {
      err_msg = "请输入商品名";
    } else if (!(vendor_id > 0)) {
      err_msg = "无效的品牌商";
    } else if (sku_unit !== "斤" && sku_unit !== "个") {
      err_msg = "选择SKU单位";
    } else if (sku_having_unit <= 0) {
      err_msg = "请输入正确的份含量";
    } else if (!(weight > 0)) {
      err_msg = "请输入正确的重量";
    } else if (!(basic_category > 0)) {
      err_msg = "请选择基础分类";
    } else if (basic_category == Cts.TAG_HIDE) {
      err_msg = "请勿将基础分类放入列表中隐藏";
    } else if (store_categories.length <= 0) {
      err_msg = "请选择门店分类";
    }

    if (err_msg === "") {
      return true;
    } else {
      ToastLong(err_msg);
      return false;
    }
  }

  renderAddGood() {
    let {type} = this.props.navigation.state.params;
    let _this = this;
    if (!(type === "edit")) {
      return (
        <View>
          <GoodAttrs name="门店信息"/>
          <ModalSelector
            skin="customer"
            data={this.state.selling_categories}
            onChange={option => {
              this.setState({sale_status: option.key});
            }}
          >
            <Left
              title="售卖状态"
              info={tool.sellingStatus(this.state.sale_status)}
              right={
                <Text
                  style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}
                >
                  >
                </Text>
              }
            />
          </ModalSelector>
          <Left
            title="商品价格"
            placeholder={"商品价格"}
            right={<Text style={{fontSize: 14, color: "#ccc"}}>元</Text>}
            type="numeric"
            value={this.state.price}
            onChangeText={text => this.setState({price: text})}
          />
          {this.state.fnProviding ? (
            <ModalSelector
              skin="customer"
              data={this.state.head_supplies}
              onChange={option => {
                this.setState({provided: option.key});
              }}
            >
              <Left
                title="总部供货"
                info={tool.headerSupply(this.state.provided)}
                right={
                  <Text
                    style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}
                  >
                    >
                  </Text>
                }
              />
            </ModalSelector>
          ) : null}
          <Left title="库存" info={"初始为0,请各门店单独设置"}/>
          <View style={{paddingHorizontal: pxToDp(30)}}>
            <Text
              style={{
                color: "#B2B2B2",
                fontSize: pxToDp(30),
                marginTop: pxToDp(32)
              }}
            >
              发布到以下门店:
            </Text>
            <Text
              style={{
                color: "#B2B2B2",
                fontSize: pxToDp(30),
                marginTop: pxToDp(25),
                marginBottom: pxToDp(32)
              }}
            >
              {this.state.vendor_stores}
            </Text>
          </View>
        </View>
      );
    }
  }

  pickSingleImg() {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: "MediumQuality",
      includeExif: true
    })
      .then(image => {
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[image_arr.length - 1];
        let image_info = {
          uri: image_path,
          name: image_name
        };
        this.uploadImg(image_info);
      })
      .catch(e => {
        console.log("error -> ", e);
      });
  }

  uploadImg(image_info) {
    const {dispatch} = this.props;
    let {isUploadImg, list_img, upload_files} = this.state;
    if (isUploadImg) {
      return false;
    }
    this.setState({isUploadImg: true});
    dispatch(
      uploadImg(image_info, resp => {
        console.log("image_resp ===> ", resp);
        if (resp.ok) {
          let {name, uri} = image_info;
          let {file_id, fspath} = resp.obj;
          list_img[file_id] = {
            url: Config.staticUrl(fspath),
            name: name
          };
          upload_files[file_id] = {id: file_id, name: name};
          console.log("list_img --> ", list_img);
          this.setState({
            list_img: list_img,
            upload_files: upload_files,
            isUploadImg: false
          });
        } else {
          ToastLong(resp.desc);
          this.setState({
            isUploadImg: false
          });
        }
      })
    );
  }

  toStores(obj) {
    let arr = [];
    if (obj) {
      tool.objectMap(obj, (item, id) => {
        arr.push(item.name);
      });
      return arr.join(" , ");
    }
  }

  barcodeReceived(e) {
    console.warn("Barcode: " + e.data);
  }

  render() {
    let {scanBoolean} = this.state;
    return (
      <ScrollView>
        <GoodAttrs name="基本信息"/>
        <Left
          title="商品名称"
          placeholder="输入商品名(不超过20个字)"
          maxLength={20}
          value={this.state.name}
          onChangeText={text => this.setState({name: text})}
        />
        <ModalSelector
          skin="customer"
          data={this.state.sku_units}
          onChange={option => {
            this.setState({sku_unit: option.label});
          }}
        >
          <Left
            title="SKU单位"
            info={this.state.sku_unit}
            right={
              <Text style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}>
                >
              </Text>
            }
          />
        </ModalSelector>
        <Left
          title="份含量"
          placeholder="请输入商品份含量"
          value={`${this.state.sku_having_unit}`}
          onChangeText={text => this.setState({sku_having_unit: text})}
        />
        <Left
          title="平均重量"
          placeholder="请输入商品重量"
          value={"" + this.state.weight}
          type="numeric"
          right={<Text style={{fontSize: 14, color: "#ccc"}}>克</Text>}
          onChangeText={text => this.setState({weight: text})}
        />
        <ModalSelector
          skin="customer"
          data={this.state.basic_cat_list}
          onChange={option => {
            this.setState({basic_category: option.key});
          }}
        >
          <Left
            title="基础分类"
            info={
              !this.state.basic_categories[this.state.basic_category]
                ? "选择基础分类"
                : this.state.basic_categories[this.state.basic_category]
            }
            right={
              <Text style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}>
                >
              </Text>
            }
          />
        </ModalSelector>
        <Left
          title="门店分类"
          info={this.state.tag_list}
          onPress={() => {
            let {state, navigate} = this.props.navigation;
            navigate(Config.ROUTE_GOODS_CLASSIFY, {
              nav_key: state.key,
              store_categories: this.state.store_categories,
              vendor_id: this.state.vendor_id
            });
          }}
          right={
            <Text style={{fontSize: 14, color: "#ccc", fontWeight: "bold"}}>
              >
            </Text>
          }
        />
        <Adv
          title={"广告词"}
          right={`${tool.length(this.state.promote_name)} / 20`}
          onChangeText={text => this.setState({promote_name: text})}
          placeholder={"输入广告词"}
          value={this.state.promote_name}
          maxLength={20}
        />
        <Adv
          title={"商品介绍"}
          right={`${tool.length(this.state.tag_info_nur)} / 50`}
          onChangeText={text => this.setState({tag_info_nur: text})}
          placeholder={"请输入商品介绍"}
          value={this.state.tag_info_nur}
          maxLength={50}
        />
        <GoodAttrs name="上传图片"/>
        <View
          style={[
            styles.area_cell,
            {
              minHeight: pxToDp(215),
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: pxToDp(20),
              paddingTop: pxToDp(10)
            }
          ]}
        >
          {tool.length(this.state.list_img) > 0 ? (
            tool.objectMap(this.state.list_img, (img_data, img_id) => {
              let img_url = img_data["url"];
              return (
                <View
                  key={img_id}
                  style={{
                    height: pxToDp(170),
                    width: pxToDp(170),
                    flexDirection: "row",
                    alignItems: "flex-end"
                  }}
                >
                  <Image style={styles.img_add} source={{uri: img_url}}/>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: pxToDp(4),
                      top: pxToDp(4)
                    }}
                    onPress={() => {
                      delete this.state.list_img[img_id];
                      delete this.state.upload_files[img_id];
                      this.forceUpdate();
                    }}
                  >
                    <Icon
                      name={"clear"}
                      size={pxToDp(40)}
                      style={{backgroundColor: "#fff"}}
                      color={"#d81e06"}
                      msg={false}
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : this.state.cover_img ? (
            <View
              style={{
                height: pxToDp(170),
                width: pxToDp(170),
                flexDirection: "row",
                alignItems: "flex-end"
              }}
            >
              <Image
                style={styles.img_add}
                source={{uri: this.state.cover_img}}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: pxToDp(4),
                  top: pxToDp(4)
                }}
                onPress={() => {
                  this.setState({cover_img: ""});
                }}
              >
                <Icon
                  name={"clear"}
                  size={pxToDp(40)}
                  style={{backgroundColor: "#fff"}}
                  color={"#d81e06"}
                  msg={false}
                />
              </TouchableOpacity>
            </View>
          ) : null}
          <View
            style={{
              height: pxToDp(170),
              width: pxToDp(170),
              flexDirection: "row",
              alignItems: "flex-end"
            }}
          >
            <TouchableOpacity
              style={[styles.img_add, styles.img_add_box, {flexWrap: "wrap"}]}
              onPress={() => this.pickSingleImg()}
            >
              <Text style={{fontSize: pxToDp(36), color: "#bfbfbf"}}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {this.renderAddGood()}
        <Toast icon="loading" show={this.state.isUploadImg}>
          图片上传中...
        </Toast>

        <Toast
          icon="loading"
          show={this.state.uploading}
          onRequestClose={() => {
          }}
        >
          提交中
        </Toast>
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.selectToWhere}
          buttons={[
            {
              type: "default",
              label: "回申请页面",
              onPress: () => {
                this.setState({selectToWhere: false});
                this.props.navigation.navigate("Remind");
              }
            },
            {
              type: "primary",
              label: "去商品页面",
              onPress: () => {
                this.setState({selectToWhere: false});
                native.toGoods();
              }
            }
          ]}
        >
          <Text
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: pxToDp(30),
              color: colors.color333
            }}
          >
            上传成功
          </Text>
          <Text style={{width: "100%", textAlign: "center"}}>
            商品已成功添加到门店
          </Text>
        </Dialog>
      </ScrollView>
    );
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
