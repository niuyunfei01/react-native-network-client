import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import ImagePicker from "react-native-image-crop-picker";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import Icon from "react-native-vector-icons/MaterialIcons";
import {Button, Input} from "react-native-elements";
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {ActionSheet, Cells, CellsTitle} from "../../../weui";
import tool from "../../../pubilc/util/tool";
import {imageKey} from "../../../pubilc/util/md5";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}


function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}


class PrinterRemark extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      showImgMenus: false,
      upload_files: [],
      list_img: [],
      newImageKey: '',
      remark: '',
      img: false
    }
    this.get_printer_custom_cfg()
  }

  get_printer_custom_cfg() {
    const {store_id, accessToken} = this.props.global;
    const api = `api/get_printer_custom_cfg/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        remark: res.remark,
        img: res.remark_img,
        isRefreshing: false
      })
    })
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
      onComplete: () => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          ToastShort('上传成功')
          const {newImageKey} = this.state;
          const uri = res + newImageKey
          this.setState({
            img: uri
          });
        }, () => {
          ToastShort("获取上传图片的地址失败");

        })
      },
      onError: (data) => {
        switch (data.code) {
          case '-2':
            ToastShort('任务已暂停')
            break;
          default:
            ToastShort('错误：' + data.msg)
            break;
        }
      }
    })
  }

  componentWillUnmount() {

  }

  onHeaderRefresh() {

  }


  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }


  submit = () => {
    tool.debounces(() => {
      const {store_id, accessToken} = this.props.global;
      const {remark, img} = this.state;
      let fromData = {
        remark: remark,
        remark_img: img,
        store_id: store_id,
      }
      const api = `api/set_printer_custom_cfg?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(() => {
        ToastShort('操作成功')
        this.props.navigation.goBack();
      }, () => {
        ToastShort('操作失败')
      })
    }, 1000)
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
        borderColor: colors.f2
      }
    ]}>
      <View style={{
        height: pxToDp(170),
        width: pxToDp(170),
        flexDirection: "row",
        alignItems: "flex-end",
        borderWidth: pxToDp(3),
        borderColor: colors.fontGray,
        margin: pxToDp(10)
      }}>
        <TouchableOpacity
          style={{
            height: pxToDp(170),
            width: pxToDp(170),
            justifyContent: "center",
            paddingBottom: pxToDp(30),
          }}
          onPress={() => this.setState({showImgMenus: true})}>
          <Text style={{
            marginTop: pxToDp(30),
            fontSize: pxToDp(50),
            color: "#bfbfbf",
            textAlign: "center"
          }}>+</Text>
        </TouchableOpacity>
      </View>

      {!!this.state.img &&
      <View style={{
        marginLeft: pxToDp(40),
        marginBottom: pxToDp(15),
        height: pxToDp(170),
        width: pxToDp(170),
        flexDirection: "row",
        alignItems: "flex-end"
      }}>
        <Image style={styles.img_add} source={{uri: this.state.img}}/>
        <TouchableOpacity style={{position: "absolute", right: pxToDp(14), top: pxToDp(14)}} onPress={() => {
          this.setState({img: false});
        }}>
          <Icon name={"clear"} size={pxToDp(40)} style={{backgroundColor: "#fff"}} color={"#d81e06"} msg={false}/>
        </TouchableOpacity>
      </View>}

    </View>;
  }


  pickSingleImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker(tool.pickImageOptions(true))
        .then(image => {


          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[tool.length(image_arr) - 1];
          this.startUploadImg(image_path, image_name);
        })
    }, 1000)

  }

  pickCameraImg() {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openCamera(tool.pickImageOptions(true)).then(image => {
        let image_path = image.path;
        let image_arr = image_path.split("/");
        let image_name = image_arr[tool.length(image_arr) - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }

  startUploadImg(imgPath, imgName) {
    showModal("图片上传中...")
    this.setState({newImageKey: imageKey(imgName)})

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
      Alert.alert('error', '图片上传失败！')
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          } style={{backgroundColor: colors.f2}}>

          <CellsTitle style={styles.cell_title}>备注内容</CellsTitle>
          <Cells style={[styles.cell_box]}>
            <Input containerStyle={{
              marginVertical: 8,
              marginHorizontal: "4%",
              width: '92%',
              borderWidth: pxToDp(2),
              borderColor: colors.fontGray,
              height: 120,
            }}
                   inputContainerStyle={{

                     borderWidth: 0,
                     height: 118,
                   }}
                   inputStyle={{
                     // height: 118,
                   }}
                   placeholder="支持输入广告/联系方式" value={this.state.remark}
                   onChangeText={(remark) => this.setState({remark})}/>
            {/*<View style={{margin: pxToDp(20), borderWidth: pxToDp(3), borderColor: colors.fontGray}}>*/}
            {/*  {this.renderUploadImg()}*/}
            {/*</View>*/}
          </Cells>
        </ScrollView>
        <View style={styles.btn_submit}>
          <Button onPress={() => this.submit()} title={'保存'} titleStyle={{color: colors.white, fontSize: 14}}
                  buttonStyle={{backgroundColor: colors.main_color, borderWidth: 0}}/>
        </View>
        <ActionSheet visible={this.state.showImgMenus} onRequestClose={() => {
          this.setState({showImgMenus: false})
        }}
                     menus={[{label: '拍照', onPress: this.pickCameraImg.bind(this)}, {
                       label: '从相册选择',
                       onPress: this.pickSingleImg.bind(this)
                     }]}
                     actions={[{label: '取消', onPress: () => this.setState({showImgMenus: false})}]}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },


  cell_box_top: {
    marginTop: pxToDp(15),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },

  cell_box: {
    marginTop: 15,
    borderTopWidth: pxToDp(1),
    // borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
    borderBottomWidth: 0,
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  body_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.main_color,
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  printer_status_error: {
    color: '#f44040',
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
    width: pxToDp(100)
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },

  right_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color999,
  },

  img_add: {
    height: pxToDp(145),
    width: pxToDp(145),
    justifyContent: "space-around",
    borderWidth: pxToDp(1),
    borderColor: "#bfbfbf"
  },
  btn_submit: {
    marginHorizontal: pxToDp(30),
    height: pxToDp(65),
    marginBottom: pxToDp(70),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(PrinterRemark)
