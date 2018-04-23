import React, { Component } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  Image
} from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as globalActions from "../../reducers/global/globalActions";
import * as tool from "../../common/tool";
import { Styles, Metrics, Colors } from "../../themes";

import Icon from "react-native-vector-icons/Ionicons";
import _ from "lodash";
import ImagePicker from "react-native-image-crop-picker";

import { Button, Button1 } from "../component/All";
import { cityList } from "../data";
import { Line } from "../component/All";
import { NavigationItem } from "../../widget";
import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import { ToastLong } from "../../util/ToastUtils";
import ActionSheet from "../../weui/ActionSheet/ActionSheet";

function mapStateToProps(state) {
  const { mine, global } = state;
  return { mine: mine, global: global };
}

class Qualification extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: "提交资质",
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
            navigation.goBack();
          }}
        />
      ),
      headerRight: (
        <View style={{ marginRight: pxToDp(31) }}>
          <Text>联系客服</Text>
        </View>
      )
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      imageList: [
        { id: 1, imageUrl: undefined, imageInfo: undefined },
        { id: 2, imageUrl: undefined, imageInfo: undefined },
        { id: 3, imageUrl: undefined, imageInfo: undefined }
      ],
      storeImageUrl: undefined,
      storeImageInfo: undefined,
      bossImageUrl: undefined,
      bossImageInfo: undefined,
      camera: "openPicker",
      opVisible: false
    };
    this.config = {
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: "MediumQuality",
      includeExif: true,
      includeBase64: true
    };
  }
  title = (title, desc) => {
    return (
      <View
        style={{
          paddingHorizontal: pxToDp(31),
          marginTop: pxToDp(31),
          marginBottom: pxToDp(24)
        }}
      >
        <Text
          style={{
            color: Colors.grey3,
            fontSize: pxToDp(30),
            fontWeight: "bold"
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            marginTop: pxToDp(21),
            color: "#bfbfbf",
            fontSize: pxToDp(24)
          }}
        >
          {desc}
        </Text>
      </View>
    );
  };
  //点击弹出面板
  pickSingleImg = callback => {
    this.callback = callback;
    this.setState({
      opVisible: true
    });
  };
  //弹出面板
  renderActionSheet = callback => {
    return (
      <ActionSheet
        visible={this.state.opVisible}
        onRequestClose={() => {}}
        menus={[
          {
            type: "primary",
            label: "照相机",
            onPress: () => {
              this.setState({ opVisible: false, camera: "openCamera" }, () => {
                this.picker();
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
                  this.picker();
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
              this.setState({ opVisible: false });
            }
          }
        ]}
      />
    );
  };
  //选择相册相机后的函数
  picker = () => {
    ImagePicker[this.state.camera](this.config).then(image => {
      console.log("image:%o", image);
      let imagePath = image.path;
      let image_arr = imagePath.split("/");
      let image_name = image_arr[image_arr.length - 1];
      let image_info = {
        uri: imagePath,
        name: image_name
      };
      this.callback(image, image_info);
    });
  };
  render() {
    let list = [];
    this.state.imageList.map(element => {
      if (element.imageUrl) {
        list.push(element);
      }
    });
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView style={{ flex: 1 }}>
          {this.title("营业执照", "请上传门店执照或身份证")}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Upload
              desc="上传文字清晰照片"
              imageUrl={this.state.storeImageUrl}
              deleteImage={() => {
                this.state.storeImageUrl = undefined;
                this.forceUpdate();
              }}
              width={Metrics.CW - 80}
              height={(Metrics.CW - 80) * 0.54}
              onPress={() =>
                this.pickSingleImg((image, imageInfo) => {
                  let storeImageUrl = this.state.storeImageUrl;
                  storeImageUrl = `data:${image.mime};base64, ${image.data}`;
                  this.setState({
                    storeImageUrl: storeImageUrl,
                    storeImageInfo: imageInfo
                  });
                })
              }
            />
          </View>
          {this.title("店铺实景", "请上传店铺门头照片（至少上传一张照片）")}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: pxToDp(31)
            }}
          >
            {this.state.imageList.map((element, index) => {
              return (
                <Upload
                  desc="上传门头照片"
                  imageUrl={element.imageUrl}
                  deleteImage={() => {
                    this.state.imageList[index].imageUrl = undefined;
                    this.forceUpdate();
                  }}
                  onPress={() => {
                    this.pickSingleImg((image, imageInfo) => {
                      let imageList = this.state.imageList;
                      imageList[index].imageInfo = imageInfo;
                      imageList[index].imageUrl = `data:${image.mime};base64, ${
                        image.data
                      }`;
                      this.setState({
                        imageList: imageList
                      });
                    });
                  }}
                  //   onPress={() =>
                  //     // this.pickSingleImg((image, imageInfo) => {
                  //     //   let imageList = this.state.imageList;
                  //     //   imageList[index].imageInfo = imageInfo;
                  //     //   imageList[index].imageUrl = `data:${image.mime};base64, ${
                  //     //     image.data
                  //     //   }`;
                  //     //   this.setState({
                  //     //     imageList: imageList
                  //     //   });
                  //     // })
                  //   }
                />
              );
            })}
          </View>
          {this.title("老板形象", "请上传老板照片")}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Upload
              desc="上传老板照片"
              imageUrl={this.state.bossImageUrl}
              deleteImage={() => {
                this.state.bossImageUrl = undefined;
                this.forceUpdate();
              }}
              onPress={() =>
                this.pickSingleImg((image, imageInfo) => {
                  let bossImageUrl = this.state.bossImageUrl;
                  bossImageUrl = `data:${image.mime};base64, ${image.data}`;
                  this.setState({
                    bossImageUrl: bossImageUrl,
                    bossImageInfo: imageInfo
                  });
                })
              }
            />
          </View>
        </ScrollView>
        {this.renderActionSheet()}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Button1
            t="提交"
            w={(Metrics.CW - pxToDp(31) * 2 - 20) / 3}
            r={5}
            mgb={20}
            onPress={() => {
              if (!this.state.storeImageUrl) return ToastLong("请上传营业执照");
              if (!this.state.bossImageUrl) return ToastLong("请上传老板形象");
              if (!list.length) return ToastLong("请至少上传一张店铺实景");
              this.props.navigation.state.params.callback({
                name: "资质已上传",
                info: {
                  imageList: list,
                  storeImageInfo: this.state.storeImageInfo,
                  bossImageInfo: this.state.bossImageInfo
                }
              });
              this.props.navigation.goBack();
            }}
          />
        </View>
      </View>
    );
  }
}
class Upload extends Component {
  render() {
    const { desc, onPress, width, height, imageUrl, deleteImage } = this.props;
    return imageUrl ? (
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: width ? width : (Metrics.CW - pxToDp(31) * 2 - 20) / 3,
          height: height
            ? height
            : (Metrics.CW - pxToDp(31) * 2 - 20) / 3 * 0.9,
          position: "relative"
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            right: pxToDp(4),
            top: pxToDp(4)
          }}
          onPress={deleteImage}
        >
          <Icon name={"md-close-circle"} size={pxToDp(40)} />
        </TouchableOpacity>
      </Image>
    ) : (
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: width ? width : (Metrics.CW - pxToDp(31) * 2 - 20) / 3,
          height: height
            ? height
            : (Metrics.CW - pxToDp(31) * 2 - 20) / 3 * 0.9,
          backgroundColor: "#f2f2f2",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View>
          <Text style={{ textAlign: "center", color: Colors.theme }}>
            +添加
          </Text>
          <Text
            style={{
              marginTop: pxToDp(10),
              color: "#bfbfbf",
              fontSize: pxToDp(24)
            }}
          >
            {desc}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connect(mapStateToProps)(Qualification);
