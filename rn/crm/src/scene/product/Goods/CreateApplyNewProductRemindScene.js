import React, {PureComponent} from "react";
import {Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, Dialog, Icon, Label} from "../../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {getVendorStores} from "../../../reducers/mine/mineActions";
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import {newProductSave, uploadImg} from "../../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../../pubilc/util/tool";
import native from "../../../pubilc/util/native";

import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import ActionSheet from "../../../weui/ActionSheet/ActionSheet";

import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {getWithTpl} from "../../../pubilc/util/common";

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
        newProductSave,
        ...globalActions
      },
      dispatch
    )
  };
}

class CreateApplyNewProductRemindScene extends PureComponent {
  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let currStoreId = this.props.route.params.store_id;
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
      goBackValue: false,
      camera: "openPicker",
      opVisible: false,
      isShow: false
    };
    this.uploadImg = this.uploadImg.bind(this);
    this.upLoad = this.upLoad.bind(this);
    this.getVendorStore = this.getVendorStore.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type, backPage, store_id} = params;
    return {
      headerLeft: () => (
        <TouchableOpacity
          style={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => native.toGoods.bind(this)()}
        >
          <FontAwesome5 name={'arrow-left'} style={{fontSize: 25}}/>
        </TouchableOpacity>
      )
    };
  };

  back(type) {
    if (type == "add") {
      native.gotoPage(type);
    } else {
      this.props.navigation.goBack();
    }
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

  UNSAFE_componentWillMount() {
    let {currVendorId} = tool.vendor(this.props.global);
    let url = `api/is_service_mgr/${currVendorId}?access_token=${
      this.props.global.accessToken
    }`;
    getWithTpl(
      url,
      json => {
        if (json.ok) {
          this.setState({
            isShow: json.obj.is_mgr
          });
        } else {
          this.setState({
            isShow: false
          });
        }
      },
      error => {
        this.setState({
          isShow: false
        });
      }
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
    const {dispatch} = this.props;
    const {accessToken} = this.props.global;
    if (check_res) {
      showModal("提交中")
      this.setState({uploading: true});
      dispatch(
        newProductSave(formData, accessToken, async (ok, reason, obj) => {
          this.setState({uploading: false});
          hideModal()
          if (ok) {
            this.setState({dialogStatus: true});
          } else {
            ToastLong(reason);
          }
        })
      );
    }
  };

  dataValidate(formData) {
    let {goods_name, price_desc} = formData;
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

  //弹出相机和相册

  //弹出面板
  renderActionSheet = callback => {
    return (
      <ActionSheet
        visible={this.state.opVisible}
        onRequestClose={() => {
        }}
        menus={[
          {
            type: "primary",
            label: "照相机",
            onPress: () => {
              this.setState({opVisible: false, camera: "openCamera"}, () => {
                this.pickSingleImg();
              });
            }
          },
          {
            type: "primary",
            label: "相册",
            onPress: () => {
              this.setState(
                {
                  opVisible: false,
                  camera: "openPicker"
                },
                () => {
                  this.pickSingleImg();
                }
              );
            }
          }
        ]}
        actions={[
          {
            type: "default",
            label: "取消",
            onPress: () => {
              this.setState({opVisible: false});
            }
          }
        ]}
      />
    );
  };

  pickSingleImg() {
    ImagePicker[this.state.camera]({
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
  }

  uploadImg(image_info) {
    const {dispatch} = this.props;
    let {isUploadImg, list_img, upload_files} = this.state;
    if (isUploadImg) {
      return false;
    }
    showModal('图片上传中')
    this.setState({isUploadImg: true});
    dispatch(
      uploadImg(
        image_info,
        resp => {
          hideModal();
          if (resp.ok) {
            let {name} = image_info;
            let {file_id, fspath} = resp.obj;
            list_img[file_id] = {
              url: Config.staticUrl(fspath),
              name: name
            };
            upload_files.push({id: file_id, name: name});
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
        "ProductApply", 1
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
          <Text style={{color: colors.white}}>保存 </Text>
        </Button>
        {this.state.isShow ? (
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
            <Text style={{color: colors.main_color}}>直接上新 </Text>
          </Button>
        ) : null}
      </View>
    );
  }

  render() {
    return (
      <ScrollView>
        <View>
          {this.renderActionSheet()}
          <Cells style={styles.my_cells}>
            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>商品名称</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder="输入商品名(不超过20个字)"
                  underlineColorAndroid="transparent"
                  maxLength={20}
                  style={[styles.input_text]}
                  value={this.state.goods_name}
                  onChangeText={text => {
                    this.setState({goods_name: text});
                  }}
                />
              </CellBody>
            </Cell>

            <Cell customStyle={[styles.my_cell]}>
              <CellHeader style={styles.attr_name}>
                <Label style={[styles.cell_label]}>价格描述</Label>
              </CellHeader>
              <CellBody>
                <TextInput
                  placeholder="如1.25元每斤或每瓶3元"
                  underlineColorAndroid="transparent"
                  style={[styles.input_text]}
                  value={`${this.state.price_desc}`}
                  onChangeText={text => {
                    this.setState({price_desc: text});
                  }}
                />
              </CellBody>
              <CellFooter/>
            </Cell>

            <View style={[styles.area_cell, {height: pxToDp(250)}]}>
              <View>
                <Text style={[styles.area_input_title]}>商品介绍 </Text>
              </View>
              <View
                style={{
                  height: pxToDp(134),
                  width: "100%",
                  flexDirection: "row"
                }}
              >
                <TextInput
                  multiline={true}
                  underlineColorAndroid="transparent"
                  placeholder="请输入商品介绍"
                  style={[
                    styles.input_text,
                    {flex: 1, textAlignVertical: "top"}
                  ]}
                  value={this.state.slogan}
                  onChangeText={text => {
                    this.setState({slogan: text});
                  }}
                />
                <Text style={{alignSelf: "flex-end"}}>
                  {this.state.slogan.length}/50
                </Text>
              </View>
            </View>
          </Cells>
        </View>
        <View style={[styles.area_cell, styles.add_img_wrapper]}>
          {tool.objectMap(this.state.list_img, (img_data, img_id) => {
            let img_url = img_data["url"];
            let img_name = img_data["name"];
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
          })}
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
              // onPress={() => this.pickSingleImg()}
              onPress={() =>
                this.setState({
                  opVisible: true
                })
              }
            >
              <Text style={{fontSize: pxToDp(36), color: "#bfbfbf"}}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {this.renderBtn()}

        {/*<Toast icon="loading" show={this.state.isUploadImg}>*/}
        {/*  图片上传中...*/}
        {/*</Toast>*/}
        {/*<Toast*/}
        {/*  icon="loading"*/}
        {/*  show={this.state.uploading}*/}
        {/*  onRequestClose={() => {*/}
        {/*  }}*/}
        {/*>*/}
        {/*  提交中*/}
        {/*</Toast>*/}
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.dialogStatus}
          buttons={[
            {
              type: "default",
              label: "知道了",
              onPress: () => {
                // this.setState({
                //   goods_name: "",
                //   price_desc: "",
                //   slogan: "",
                //   list_img: {},
                //   upload_files: {},
                //   dialogStatus: false
                // });
                //this.props.navigation.goBack();
                native.toGoods.bind(this)()
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
            提交成功
          </Text>
          <Text style={{width: "100%", textAlign: "center"}}>
            门店经理会在48小时内完成上新操作请耐心等候
          </Text>
        </Dialog>
      </ScrollView>
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
  CreateApplyNewProductRemindScene
);
