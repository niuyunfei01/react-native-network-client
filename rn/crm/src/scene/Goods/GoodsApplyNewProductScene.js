import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label
} from "../../weui/index";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import { getVendorStores } from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";

import {
  uploadImg,
  newProductSave
} from "../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../common/tool";
import Cts from "../../Cts";
import { NavigationItem } from "../../widget";
import native from "../../common/native";
import { ToastLong } from "../../util/ToastUtils";
import { NavigationActions } from "react-navigation";
import { Toast, Dialog, Icon, Button } from "../../weui/index";

function mapStateToProps(state) {
  const { mine, product, global } = state;
  return { mine: mine, product: product, global: global };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        uploadImg,
        newProductSave,
        ...globalActions
      },
      dispatch
    )
  };
}

class GoodsApplyWorkNewProductScene extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let { type, backPage } = params;

    return {
      headerTitle: "我要上新",
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
            if (type == "add") {
              native.nativeBack();
            } else {
              navigation.goBack();
            }
          }}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    let { currVendorId } = tool.vendor(this.props.global);
    let currStoreId = this.props.navigation.state.params.store_id;
    if (!currStoreId) {
      currStoreId = this.props.global.currStoreId;
    }
    this.state = {
      vendor_id: currVendorId,
      store_id: currStoreId,
      isRefreshing: false,
      isUploadImg: false,
      goods_name: "",
      price_desc: "",
      slogan: "",
      list_img: {},
      upload_files: [],
      goBackValue: false
    };
    this.uploadImg = this.uploadImg.bind(this);
    this.upLoad = this.upLoad.bind(this);
    this.getVendorStore = this.getVendorStore.bind(this);
  }

  back(type) {
    if (type == "add") {
      native.gotoPage(type);
    } else {
      this.props.navigation.goBack();
    }
  }

  getVendorStore() {
    const { dispatch } = this.props;
    const { accessToken } = this.props.global;
    let { currVendorId } = tool.vendor(this.props.global);
    let _this = this;
    dispatch(
      getVendorStores(currVendorId, accessToken, resp => {
        console.log("store resp -> ", resp.ok, resp.desc);
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

  upLoad = async () => {
    let {
      vendor_id,
      store_id,
      goods_name,
      price_desc,
      slogan,
      upload_files
    } = this.state;
    let formData = {
      vendor_id,
      store_id,
      goods_name,
      price_desc,
      slogan,
      upload_files
    };
    let check_res = this.dataValidate(formData);
    const { dispatch } = this.props;
    const { accessToken } = this.props.global;
    if (check_res) {
      this.setState({ uploading: true });
      dispatch(
        newProductSave(formData, accessToken, async (ok, reason, obj) => {
          this.setState({ uploading: false });
          if (ok) {
            this.setState({ dialogStatus: true });
          } else {
            ToastLong(reason);
          }
        })
      );
    }
  };

  dataValidate(formData) {
    let { goods_name, price_desc } = formData;
    let err_msg = "";
    if (goods_name.length <= 0) {
      err_msg = "请输入商品名";
    } else if (price_desc <= 0) {
      err_msg = "请输入正确的价格描述";
    }
    if (err_msg === "") {
      return true;
    } else {
      ToastLong(err_msg);
      return false;
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
    const { dispatch } = this.props;
    let { isUploadImg, list_img, upload_files } = this.state;
    if (isUploadImg) {
      return false;
    }
    this.setState({ isUploadImg: true });
    dispatch(
      uploadImg(
        image_info,
        resp => {
          if (resp.ok) {
            let { name, uri } = image_info;
            let { file_id, fspath } = resp.obj;
            list_img[file_id] = {
              url: Config.staticUrl(fspath),
              name: name
            };
            upload_files.push({ id: file_id, name: name });
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
        },
        "ProductApply"
      )
    );
  }

  renderBtn() {
    return (
      <View>
        <Button
          style={[styles.save_btn]}
          onPress={() => {
            if (this.state.uploading) {
              return false;
            }
            this.upLoad();
          }}
        >
          <Text style={{ color: colors.white }}>保存</Text>
        </Button>
        <Button
          style={[
            styles.save_btn,
            {
              backgroundColor: colors.back_color,
              borderColor: colors.main_color
            }
          ]}
          onPress={() => {
            this.props.navigation.navigate(Config.ROUTE_GOODS_EDIT, {
              type: "add"
            });
          }}
        >
          <Text style={{ color: colors.main_color }}>直接上新</Text>
        </Button>
      </View>
    );
  }

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          paddingVertical: 36,
          paddingHorizontal: 18
        }}
      >
        {/*创建和搜索*/}
        <Search
          bgc="#559ae7"
          title="扫码创建"
          image={require(`../../img/new/scan.png`)}
          onPress={() => {
            native.gotoNativeActivity(
              "cn.cainiaoshicai.crm.ui.scanner.FullScannerActivity",
              false
            );
          }}
        />
        <Search
          bgc="#ff648d"
          mgt={27}
          title="搜索上传"
          image={require(`../../img/new/search.png`)}
          onPress={() => {
            this.props.navigation.navigate("SearchGoods");
          }}
        />
      </ScrollView>
    );
  }
}

class Search extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { bgc, title, mgt, image, onPress } = this.props;
    return (
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            paddingVertical: 25,
            width: "100%",
            justifyContent: "center",
            backgroundColor: "white",
            alignItems: "center",
            borderRadius: 10,
            marginTop: mgt
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 40,
              backgroundColor: bgc
            }}
          >
            <Image source={image} style={{ width: 40, height: 40 }} />
          </View>

          <View>
            <Text style={{ color: "#3e3e3e", fontSize: 17, marginTop: 10 }}>
              {title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  cellBorderBottom: {
    borderBottomWidth: pxToDp(1),
    borderStyle: "solid",
    borderColor: "#EAEAEA"
  },
  my_cells: {
    marginTop: 0,
    marginLeft: 0,
    borderWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0
  },

  my_cell: {
    marginLeft: 0,
    borderColor: colors.new_back,
    paddingHorizontal: pxToDp(30),
    flexDirection: "row",
    alignItems: "center",
    margin: 0
  },
  cell_label: {
    width: pxToDp(130),
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
    marginLeft: 0,
    paddingLeft: 0,
    color: colors.color777
  },
  add_img_wrapper: {
    minHeight: pxToDp(215),
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: pxToDp(20),
    paddingTop: pxToDp(10)
  },
  save_btn: {
    backgroundColor: colors.main_color,
    marginTop: pxToDp(50),
    marginHorizontal: pxToDp(30)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(
  GoodsApplyWorkNewProductScene
);

