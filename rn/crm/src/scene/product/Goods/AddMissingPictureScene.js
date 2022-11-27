import React from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {LineView, Styles} from "../../home/GoodsIncrementService/GoodsIncrementServiceStyle";
import colors from "../../../pubilc/styles/colors";
import tool from "../../../pubilc/util/tool";
import Config from "../../../pubilc/common/config";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import pxToDp from "../../../pubilc/util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import ImagePicker from "react-native-image-crop-picker";
import {ActionSheet} from "../../../weui";
import {hideModal, showError, showModal, showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";
import {imageKey} from "../../../pubilc/util/md5";
import HttpUtils from "../../../pubilc/util/http";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import {productSave} from "../../../reducers/product/productActions";

const styles = StyleSheet.create({
  baseRowWrap: {
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

  },
  leftFlag: {
    color: '#EE2626'
  },
  textInputStyle: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
  },
  rightEmptyView: {
    textAlign: 'center',
    width: 40,
  },
  imageIconWrap: {
    height: pxToDp(170),
    width: pxToDp(170),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  hasImageList: {
    height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"
  },
  area_cell: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(35),
    minHeight: 100,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    justifyContent: "space-around",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
  deleteUploadImageIcon: {
    position: "absolute", right: pxToDp(2), top: pxToDp(4)
  },
  plusIconWrap: {
    height: pxToDp(170), width: pxToDp(170), flexDirection: "row", alignItems: "flex-end"
  },
  img_add_box: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
  plusIcon: {
    fontSize: pxToDp(36),
    color: "#bfbfbf",
    textAlignVertical: "center",
    textAlign: "center"
  },
  saveZoneWrap: {marginTop: 32, justifyContent: 'flex-end', backgroundColor: colors.white},
})


class AddMissingPictureScene extends React.PureComponent {


  state = {
    list_img: {},
    upload_files: {},
    cover_img: '',
    showImgMenus: false,
    productInfo: {}
  }
  actions = [
    {
      label: '取消', onPress: () => this.setState({showImgMenus: false})
    }
  ]

  getProductInfo = () => {
    const {vendor_id, store_id, accessToken} = this.props.global
    const {goodsInfo} = this.props.route.params
    const url = `/api/get_product_detail/${goodsInfo?.id}/${vendor_id}/${store_id}?access_token=${accessToken}`

    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({productInfo: res})

    })
  }

  componentDidMount() {
    this.getProductInfo()
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

  componentWillUnmount() {
    QNEngine.removeEmitter()
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
    }).catch(() => {
      Alert.alert('图片上传失败！')
    })
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

  renderActionSheet = () => {
    const {showImgMenus} = this.state
    return (
      <ActionSheet visible={showImgMenus} menus={this.menus} actions={this.actions}/>
    )
  }
  deleteUploadImage = (img_id) => {
    const {list_img, upload_files} = this.state
    delete list_img[img_id];
    delete upload_files[img_id];
    this.forceUpdate()
  }
  renderUploadImg = () => {
    const {list_img = {}, cover_img = ''} = this.state
    return (
      <View style={styles.area_cell}>
        <If condition={tool.length(list_img) > 0}>
          {
            tool.objectMap(list_img, (img_data, img_id) => {
              return (
                <View key={img_id} style={styles.hasImageList}>
                  <Image style={styles.img_add} source={{uri: Config.staticUrl(img_data?.url)}}/>
                  <TouchableOpacity style={styles.deleteUploadImageIcon}
                                    onPress={() => this.deleteUploadImage(img_id)}>
                    <MaterialIcons name={"clear"} size={pxToDp(40)} style={{backgroundColor: colors.white}}
                                   color={"#d81e06"}
                                   msg={false}/>
                  </TouchableOpacity>

                </View>
              );
            })
          }
        </If>
        <If condition={tool.length(list_img) <= 0}>
          <If condition={cover_img}>
            <View style={styles.hasImageList}>
              <Image style={styles.img_add} source={{uri: Config.staticUrl(cover_img)}}/>
              <TouchableOpacity style={{position: "absolute", right: pxToDp(4), top: pxToDp(4)}}
                                onPress={() => this.setState({cover_img: ""})}>
                <MaterialIcons name={"clear"} size={pxToDp(40)} style={{backgroundColor: colors.white}}
                               color={"#d81e06"}
                               msg={false}/>
              </TouchableOpacity>
            </View>
          </If>
          <If condition={!cover_img}>
            <View style={styles.imageIconWrap}>
              <FontAwesome5 name={'images'} size={32} color={colors.colorCCC}/>
            </View>
            <View style={styles.plusIconWrap}>
              <TouchableOpacity
                style={[styles.img_add, styles.img_add_box]}
                onPress={() => this.setState({showImgMenus: true})}>
                <Text style={styles.plusIcon}>+ </Text>
              </TouchableOpacity>
            </View>
          </If>
        </If>

      </View>
    )
  }


  upLoad = () => {
    const {dispatch, global} = this.props;
    const {vendor_id, store_id, accessToken} = global
    const {productInfo, upload_files} = this.state
    const formData = {
      id: productInfo.id,
      limit_stores: [store_id],
      name: productInfo.name,
      sg_tag_id: productInfo.sg_tag_id,
      sku_having_unit: productInfo.sku_having_unit,
      sku_tag_id: productInfo.sku_tag_id,
      sku_unit: productInfo.sku_unit,
      spec_type: parseInt(productInfo.series_id) > 0 ? 'spec_multi' : 'spec_single',
      store_categories: productInfo.tag_list_id,
      task_id: 0,
      upc: productInfo.upc,
      upload_files: upload_files,
      vendor_id: vendor_id,
      weight: productInfo.weight
    }
    if (!tool.length(upload_files) > 0) {
      showError('请先上传图片！')
    }
    dispatch(productSave(formData, accessToken, (ok, reason, obj) => {
      if (ok) {
        showSuccess('添加主图成功')
        this.props.navigation.goBack()
      } else showError(reason)
    }));
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

  render() {
    const {goodsInfo} = this.props.route.params

    return (
      <>
        <ScrollView>
          <View style={Styles.zoneWrap}>
            <Text style={Styles.headerTitleText}>
              基本信息
            </Text>
            <LineView/>
            <View style={styles.baseRowWrap}>
              <Text style={styles.leftText}>
                <Text style={styles.leftFlag}>
                  *
                </Text>商品图片
              </Text>
              <Text style={styles.textInputStyle}>
                {goodsInfo.name}
              </Text>
              <View style={styles.rightEmptyView}/>
            </View>
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
          </View>
        </ScrollView>
        {this.renderSaveInfo()}
        {this.renderActionSheet()}
      </>
    )

  }
}

function mapStateToProps(state) {
  const {global} = state
  return {global: global}
}

export default connect(mapStateToProps)(AddMissingPictureScene)
