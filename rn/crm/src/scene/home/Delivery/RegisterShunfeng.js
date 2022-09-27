import React, {PureComponent} from "react";
import {Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import {ActionSheet} from "../../../weui";
import ImagePicker from "react-native-image-crop-picker";
import {showError, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import HttpUtils from "../../../pubilc/util/http";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {imageKey} from "../../../pubilc/util/md5";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const exampleImg = {uri: 'https://cnsc-pics.cainiaoshicai.cn/%2Fhome%2FBusinessLicense.png'}

const DATA = [
  {value: 1, label: '快餐'},
  {value: 2, label: '送药'},
  {value: 3, label: '百货'},
  {value: 4, label: '脏衣服收'},
  {value: 5, label: '干净衣服派'},
  {value: 6, label: '生鲜'},
  {value: 7, label: '保单'},
  {value: 8, label: '高端饮品'},
  {value: 9, label: '现场勘验'},
  {value: 10, label: '快递'},
  {value: 12, label: '文件'},
  {value: 13, label: '蛋糕'},
  {value: 14, label: '鲜花'},
  {value: 15, label: '电子数码'},
  {value: 16, label: '服装鞋帽'},
  {value: 17, label: '汽车配件'},
  {value: 18, label: '珠宝'},
  {value: 20, label: '披萨'},
  {value: 21, label: '中餐'},
  {value: 22, label: '水产'},
  {value: 27, label: '专人直送'},
  {value: 32, label: '中端饮品'},
  {value: 33, label: '便利店'},
  {value: 34, label: '面包糕点'},
  {value: 35, label: '火锅'},
  {value: 36, label: '证照'},
  {value: 40, label: '烧烤小龙虾'},
  {value: 41, label: '外部落地配'},
  {value: 47, label: '烟酒行'},
  {value: 48, label: '成人用品'},
  {value: 99, label: '其他'}];

class RegisterShunfeng extends PureComponent {

  state = {
    store: {
      storeName: '',
      name: '',
      phone: '',
      address: '',
      location: '',
      saleCategory: {
        value: -1,
        label: ''
      }
    },
    subject: {
      phone: '',
      personNum: ''
    },
    value: {},
    imageUrl: '',
    success: false,
    showImgMenus: false,
    newImageKey: '',
  }
  subjectTextTip = '需与营业执照信息保持一致'

  getStoreInfo = (currStoreId, accessToken) => {
    const url = `/api/read_store/${currStoreId}/1?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url, {}).then(res => {
      const {name, dada_address, owner_name, tel, location_lat, location_long} = res
      this.setState({
        store: {
          ...this.state.store,
          storeName: name,
          name: owner_name,
          phone: tel,
          address: dada_address,
          location: `${location_long}，${location_lat}`
        }
      })

    })
  }

  uploadImageTask = () => {
    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: () => {

      },
      onComplete: () => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          showSuccess('上传成功')
          const {newImageKey} = this.state;
          const uri = res + newImageKey
          this.setState({
            imageUrl: uri,
          });
        }, (error) => {
          showError("获取上传图片的地址失败，原因：" + error.error_msg);
        })
      },
      onError: (data) => {
        switch (data.code) {
          case '-2':
            showError('任务已暂停')
            break;
          default:
            showError('错误：' + data.msg)
            break;
        }
      }
    })
  }

  componentDidMount() {
    const {accessToken, currStoreId} = this.props.global

    this.getStoreInfo(currStoreId, accessToken)
    this.uploadImageTask()
  }

  onChange = (value) => {
    this.setState({value});
    this.setState({store: {...this.state.store, saleCategory: value}})
  }

  renderStoreInfo = () => {
    const {store} = this.state
    return (
      <View>
        <View style={styles.storeInfoTitleStyle}>
          <Text style={styles.titleStyle}>
            店铺信息
          </Text>
        </View>
        <View style={{width: '100%', height: 1}}/>
        <View style={styles.storeInfoStyle}>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *店铺
            </Text>
            <TextInput style={styles.textInputStyle}
                       onChangeText={text => this.setState({store: {...store, storeName: text}})}
                       value={store.storeName}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *联系人
            </Text>
            <TextInput style={styles.textInputStyle}
                       onChangeText={text => this.setState({store: {...store, name: text}})}
                       value={store.name}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *联系人电话
            </Text>
            <TextInput style={styles.textInputStyle}
                       keyboardType={'numeric'}
                       onChangeText={text => this.setState({store: {...store, phone: text}})}
                       value={store.phone}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *店铺地址
            </Text>
            <TextInput style={styles.textInputStyle}
                       onChangeText={text => this.setState({store: {...store, address: text}})}
                       value={store.address}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *经纬度
            </Text>
            <TextInput style={styles.textInputStyle}
                       onChangeText={text => this.setState({store: {...store, location: text}})}
                       value={store.location}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *经营品类
            </Text>
            <ModalSelector
              onChange={value => this.onChange(value)}
              data={DATA}
              skin="customer"
              defaultKey={-999}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10
              }}>
                <View style={{flex: 1}}></View>
                <Text style={{color: colors.color333, textAlign: 'right'}}>
                  {this.state.value.label ? this.state.value.label : '请选择'}
                </Text>
                <View style={{flex: 1}}></View>
                <Entypo name='chevron-thin-down'
                        style={{fontSize: 16, color: colors.color333, marginRight: 20}}/>
              </View>
            </ModalSelector>
          </View>
        </View>
      </View>
    )
  }

  uploadImageItem = () => {
    this.setState({showImgMenus: true})
  }

  pickCameraImg = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openCamera(tool.pickImageOptions(false)).then(image => {
        const image_path = image.path;
        const image_arr = image_path.split("/");
        const image_name = image_arr[tool.length(image_arr) - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }

  startUploadImg = (imgPath, imgName) => {
    showModal("图片上传中...")
    const newImageKey = imageKey(imgName) + imgName
    this.setState({newImageKey: newImageKey})
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
      Alert.alert('error', '图片上传失败！')
    })

  }

  pickSingleImg = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker(tool.pickImageOptions(false))
        .then(image => {
          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[tool.length(image_arr) - 1];
          this.startUploadImg(image_path, image_name);
        })
    }, 1000)

  }

  menus = [
    {
      label: '拍照', onPress: this.pickCameraImg
    },
    {
      label: '从相册选择', onPress: this.pickSingleImg
    }
  ]

  onRequestClose = () => {
    this.setState({showImgMenus: false})
  }

  renderSubjectInfo = () => {
    const {subject, imageUrl} = this.state
    return (
      <>
        <View style={styles.storeInfoTitleStyle}>
          <Text style={styles.titleStyle}>
            店铺信息
          </Text>
        </View>
        <View style={{width: '100%', height: 1}}/>
        <View style={styles.storeInfoStyle}>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *负责人电话
            </Text>
            <TextInput style={styles.textInputStyle}
                       placeholder={this.subjectTextTip}
                       placeholderTextColor={'gray'}
                       onChangeText={text => this.setState({subject: {...subject, phone: text}})}
                       value={subject.phone}
                       keyboardType={'numeric'}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <Text style={styles.textStyle}>
              *负责人身份证号码
            </Text>
            <TextInput style={styles.textInputStyle}
                       keyboardType={'numeric'}
                       placeholder={this.subjectTextTip}
                       placeholderTextColor={'gray'}
                       onChangeText={text => this.setState({subject: {...subject, personNum: text}})}
                       value={subject.personNum}
                       underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.imageRowWrap}>
            {
              tool.length(imageUrl) > 0 ?
                <Image source={{uri: imageUrl}} style={styles.imageWrap}/> : (
                  <Pressable style={styles.imageWrap} onPress={this.uploadImageItem}>
                    <FontAwesome5 name={'plus'} size={24} color={'#666666'}/>
                    <Text style={styles.subjectText}>
                      上传营业执照
                    </Text>
                  </Pressable>
                )
            }
            <View style={styles.imageWrap}>
              <ImageBackground style={styles.imageBackgroundWrap}
                               source={exampleImg}>
                <Text style={styles.subjectTipText}>
                  示例
                </Text>
              </ImageBackground>
            </View>
          </View>
          <Text style={styles.tip}>
            请标准拍摄、禁止边框缺失、照片模糊、闪光强烈。
          </Text>
          <ActionSheet visible={this.state.showImgMenus}
                       onRequestClose={this.onRequestClose}
                       menus={this.menus}
                       actions={[{label: '取消', onPress: this.onRequestClose}]}
          />
        </View>
      </>
    )
  }

  renderSuccess = () => {
    return (
      <>
        <View style={styles.successWrap}>
          <View style={styles.iconWrap}>
            <FontAwesome5 name={'clock'} color={'#59B26A'} size={120}/>
          </View>
          <Text style={styles.successText}>
            已提交注册申请
          </Text>
        </View>
        <Pressable style={styles.contactTextWrap} onPress={this.find}>
          <Text style={styles.contactText}>
            联系客服
          </Text>
        </Pressable>
      </>
    )
  }

  submitInfo = () => {
    if (this.enableSubmit) {
      const {store, subject, imageUrl} = this.state
      const {currStoreId, accessToken} = this.props.global
      let {currVendorId} = tool.vendor(this.props.global);
      const params = {
        store_id: currStoreId,
        account_contact_name: store.name,
        shop_product_type: store.saleCategory.value,
        account_contact_phone: subject.phone,
        account_id_card: subject.personNum,
        business_license: imageUrl,
      }
      const url = `v1/new_api/delivery/register_sf?access_token=${accessToken}&vendorId=${currVendorId}`
      HttpUtils.post.bind(this.props)(url, params).then(res => {
        this.setState({success: true})
      }, res => {
        showError('注册失败，原因：' + res.reason)
      }).catch((error) => {
        showError('注册失败，原因：' + error.reason)
      })
      return
    }
    showError('输入带星号的内容或上传营业执照图片')
  }

  notSubmit = (store, subject) => {

    this.enableSubmit = tool.length(store.name) > 0 && tool.length(store.saleCategory.label) > 0
      && tool.length(subject.personNum) > 0 && tool.length(subject.phone) > 0 && tool.length(this.state.imageUrl) > 0;
    const style = this.enableSubmit ? styles.submitWrap : styles.cannotSubmitWrap
    return (
      <>
        {
          this.renderStoreInfo(store)
        }
        {
          this.renderSubjectInfo(subject)
        }
        <Pressable style={style} onPress={this.submitInfo}>
          <Text style={styles.submitText}>
            提交
          </Text>
        </Pressable>
      </>
    )
  }

  find = () => {
    try {
      const {currVendorId} = tool.vendor(this.props.global)
      const data = {
        v: currVendorId,
        s: this.props.global.currStoreId,
        u: this.props.global.currentUser,
        m: this.props.global.currentUserProfile.mobilephone,
        place: 'mine'
      }
      JumpMiniProgram("/pages/service/index", data);
    } catch (e) {
      showError('打开小程序失败')
    }

  }

  render() {
    const {store, subject, success} = this.state
    return (
      <SafeAreaView style={styles.content}>
        <KeyboardAwareScrollView>
          {
            success ? this.renderSuccess() : this.notSubmit(store, subject)
          }
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },
  storeInfoTitleStyle: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  storeInfoStyle: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  titleStyle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21
  },
  textStyle: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24
  },
  textInputStyle: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    fontWeight: '400',
    color: '#333333',
  },
  rowWrap: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  imageRowWrap: {
    paddingTop: 10,
    paddingLeft: 13,
    flexDirection: 'row'
  },
  imageWrap: {
    backgroundColor: '#dddddd',
    height: 104,
    width: 104,
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'grey',
    borderStyle: 'dotted',
  },
  subjectText: {
    fontSize: 14, color: '#666666', marginTop: 14
  },
  subjectTipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22
  },
  imageBackgroundWrap: {
    width: 67.5, height: 90, alignItems: 'center', justifyContent: 'center', resizeMode: 'contain'
  },
  tip: {
    fontSize: 9, fontWeight: '400', color: '#F41111', lineHeight: 13
  },
  cannotSubmitWrap: {
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    paddingTop: 8,
    flex: 1,
    paddingBottom: 8,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  submitWrap: {
    backgroundColor: '#59B26A',
    borderRadius: 2,
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 42,
    marginLeft: 10,
    marginBottom: 42,
    marginRight: 10,
  },
  submitText: {
    fontSize: 16, fontWeight: '400', color: '#FFFFFF', textAlign: 'center'
  },
  iconWrap: {
    height: 120,
    width: 120,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'grey',
    borderStyle: 'dotted',
    marginTop: 39,
    marginLeft: 118,
    marginRight: 117,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  successWrap: {
    marginTop: 15,
    height: 355,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF'
  },
  contactTextWrap: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 276,
    paddingLeft: 144,
    paddingRight: 145,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: '#59B26A'
  },
  contactText: {fontSize: 16, fontWeight: '400', color: '#FFFFFF', lineHeight: 22},
  successText: {
    fontSize: 24, fontWeight: '600', color: '#59B26A', lineHeight: 33, textAlign: 'center'
  }
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(RegisterShunfeng)
