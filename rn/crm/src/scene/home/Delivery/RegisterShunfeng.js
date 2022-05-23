import React, {PureComponent} from "react";
import {Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AntDesign from 'react-native-vector-icons/AntDesign'
import Evillcons from 'react-native-vector-icons/EvilIcons'
import {ActionSheet} from "../../../weui";
import ImagePicker from "react-native-image-crop-picker";
import {showError, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import HttpUtils from "../../../pubilc/util/http";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {connect} from "react-redux";
import Select from '../../../weui/Select/MySelect'
import {MyText} from '../../../weui/Text/MyText'
import {MyTextInput} from "../../../weui/TextInput/MyTextInput";

const INFO = [
  {
    type: 'store',
    title: {
      wrapStyle: {
        marginTop: 15,
        marginLeft: 10,
        marginRight: 10,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      },
      titleStyle: {
        color: '#333333',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 21
      },
      text: '店铺信息'
    },
    line: {
      lineStyle: {
        width: '100%', height: 1
      }
    },
    contentZone: {
      contentZoneStyle: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8
      },
      content: [
        {
          id: 0,
          contentStyle: {
            flexDirection: 'row', padding: 12, justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '店铺',
          },
          textInput: {
            key: 'name',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              textAlign: 'right',
              fontWeight: '400',
              color: '#333333',
              backgroundColor: '#FF0000'
            }
          }
        },
        {
          id: 1,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '联系人电话',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        },
        {
          id: 2,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '店铺地址',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        },
        {
          id: 3,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '经纬度',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        },
        {
          id: 4,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '经营品类',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        }
      ]
    }

  },
  {
    type: '',
    title: {
      wrapStyle: {
        marginTop: 15,
        marginLeft: 10,
        marginRight: 10,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      },
      titleStyle: {
        color: '#333333',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 21
      },
      text: '营业执照'
    },
    line: {
      lineStyle: {
        width: '100%', height: 1
      }
    },
    contentZone: {
      contentZoneStyle: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8
      },
      content: [
        {
          id: 0,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '负责人电话',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        },
        {
          id: 1,
          contentStyle: {
            flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between'
          },
          text: {
            textStyle: {
              color: '#333333',
              fontSize: 17,
              fontWeight: '400',
              lineHeight: 24
            },
            content: '负责人身份证号',
          },
          textInput: {
            key: '',
            value: '',
            textInputStyle: {
              fontSize: 15,
              flex: 1,
              fontWeight: '400',
              color: '#333333',
              lineHeight: 21,
              backgroundColor: '#FF0000'
            }
          }
        }
      ]
    }
  }
]

class RegisterShunfeng extends PureComponent {

  state = {
    store: {
      storeName: '',
      name: '',
      phone: '',
      address: '',
      location: '',
      saleCategory: {
        id: -1,
        name: ''
      }
    },
    subject: {
      phone: '',
      personNum: ''
    },
    imageUrl: '',
    success: false,
    showImgMenus: false,
    newImageKey: '',
    SaleCategory: []
  }

  renderStore = () => {
    const {store, comm} = this.state
    return INFO.map((info, index) => {
      const {title, line, contentZone, type} = info
      return (
        <View key={info}>
          <View style={title.wrapStyle}>
            <MyText style={title.titleStyle}>
              {title.text}
            </MyText>
          </View>
          <View style={line.lineStyle}/>
          <View style={contentZone.contentZoneStyle}>
            {
              contentZone.content.map(content => {
                const {contentStyle, id, text, textInput} = content
                const value = type === 'store' ? store[textInput.key] : comm[textInput.key]
                return (
                  <View style={contentStyle} key={id}>
                    <MyText style={text.textStyle}>
                      {text.content}
                    </MyText>
                    <MyTextInput style={textInput.textInputStyle}
                                 onChangeText={text => this.onChangeText(text, type)}
                                 value={value}
                                 underlineColorAndroid={'transparent'}/>
                  </View>
                )
              })
            }
          </View>
        </View>
      )
    })
  }

  onSelect = (item) => {
    this.setState({store: {...this.state.store, saleCategory: item}})
  }

  componentDidMount() {
    const {accessToken, currStoreId} = this.props.global
    const api = `/data_dictionary/sale_category?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.setState({SaleCategory: res})

    }).catch((reason) => {
      showError(reason)
    })
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

    }).catch((reason) => {
      showError(reason)
    })

    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: (data) => {
        this.setState({loadingPercent: Number(data.percent * 100) + '%'})
      },
      onComplete: (data) => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          showSuccess('上传成功')
          const {newImageKey} = this.state;
          const uri = res + newImageKey
          this.setState({
            img: uri,
          });
        }, () => {
          showError("获取上传图片的地址失败");
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

  renderStoreInfo = () => {
    const {SaleCategory, store} = this.state
    return (
      <View>
        <View style={styles.storeInfoTitleStyle}>
          <MyText style={styles.titleStyle}>
            店铺信息
          </MyText>
        </View>
        <View style={{width: '100%', height: 1}}/>
        <View style={styles.storeInfoStyle}>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              店铺
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         onChangeText={text => this.setState({store: {...store, storeName: text}})}
                         value={store.storeName}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              *联系人
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         onChangeText={text => this.setState({store: {...store, name: text}})}
                         value={store.name}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              联系人电话
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         keyboardType={'numeric'}
                         onChangeText={text => this.setState({store: {...store, phone: text}})}
                         value={store.phone}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              店铺地址
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         onChangeText={text => this.setState({store: {...store, address: text}})}
                         value={store.address}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              经纬度
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         onChangeText={text => this.setState({store: {...store, location: text}})}
                         value={store.location}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              *经营品类
            </MyText>
            <Select itemArray={SaleCategory}
                    onSelect={this.onSelect}
                    selectWidth={150}
                    defaultText={store.saleCategory.name}/>
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
      ImagePicker.openCamera({
        width: 800,
        height: 800,
        cropping: false,
        cropperCircleOverlay: false,
        includeExif: true
      }).then(image => {
        const image_path = image.path;
        const image_arr = image_path.split("/");
        const image_name = image_arr[image_arr.length - 1];
        this.startUploadImg(image_path, image_name);
      })
    }, 1000)
  }


  startUploadImg=(imgPath, imgName)=> {
    showModal("图片上传中...")
    this.setState({newImageKey: tool.imageKey(imgName)})
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
      Alert.alert('error', '图片上传失败！')
    })

  }

  pickSingleImg = () => {
    this.setState({showImgMenus: false})
    setTimeout(() => {
      ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: false,
        cropperCircleOverlay: false,
        includeExif: true
      })
        .then(image => {
          let image_path = image.path;
          let image_arr = image_path.split("/");
          let image_name = image_arr[image_arr.length - 1];
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
    const {subject} = this.state
    return (
      <View>
        <View style={styles.storeInfoTitleStyle}>
          <MyText style={styles.titleStyle}>
            店铺信息
          </MyText>
        </View>
        <View style={{width: '100%', height: 1}}/>
        <View style={styles.storeInfoStyle}>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              *负责人电话
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         onChangeText={text => this.setState({subject: {...subject, phone: text}})}
                         value={subject.phone}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.rowWrap}>
            <MyText style={styles.textStyle}>
              *负责人身份证号码
            </MyText>
            <MyTextInput style={styles.textInputStyle}
                         keyboardType={'numeric'}
                         onChangeText={text => this.setState({subject: {...subject, personNum: text}})}
                         value={subject.personNum}
                         underlineColorAndroid={'transparent'}/>
          </View>
          <View style={styles.imageRowWrap}>
            <Pressable style={styles.imageWrap} onPress={this.uploadImageItem}>
              <AntDesign name={'plus'} size={24} color={'#666666'}/>
              <MyText style={styles.subjectText}>
                上传营业执照
              </MyText>
            </Pressable>
            <View style={styles.imageWrap}>
              <ImageBackground style={styles.imageBackgroundWrap}>
                <MyText style={styles.subjectTipText}>
                  示例
                </MyText>
              </ImageBackground>

            </View>
          </View>
          <MyText style={styles.tip}>
            请标准拍摄、禁止边框缺失、照片模糊、闪光强烈。
          </MyText>
          <ActionSheet visible={this.state.showImgMenus}
                       onRequestClose={this.onRequestClose}
                       menus={this.menus}
                       actions={[{label: '取消', onPress: this.onRequestClose}]}
          />
        </View>
      </View>
    )
  }

  renderSuccess = () => {
    return (
      <View>
        <View style={styles.successWrap}>
          <View style={styles.iconWrap}>
            <Evillcons name={'clock'} color={'#59B26A'} size={120}/>
          </View>
          <MyText style={styles.successText}>
            已提交注册申请
          </MyText>
        </View>
        <Pressable style={{
          marginLeft: 10,
          marginRight: 10,
          marginTop: 276,
          paddingLeft: 144,
          paddingRight: 145,
          paddingTop: 7,
          paddingBottom: 7,
          backgroundColor: '#59B26A'
        }} onPress={this.find}>
          <MyText style={{fontSize: 16, fontWeight: '400', color: '#FFFFFF', lineHeight: 22}}>
            联系客服
          </MyText>
        </Pressable>
      </View>
    )
  }

  submitInfo = () => {
    const {store, subject, imageUrl} = this.state
    const {currStoreId, accessToken} = this.props.global
    let {currVendorId} = tool.vendor(this.props.global);
    const params = {
      store_id: currStoreId,
      account_contact_name: store.name,
      shop_product_type: store.saleCategory.id,
      account_contact_phone: subject.phone,
      account_id_card: subject.personNum,
      business_license: imageUrl,
      access_token: accessToken,
      vendorId: currVendorId
    }
    const url = `v1/new_api/delivery/register_sf`
    console.log('params', params)
    HttpUtils.post.bind(this.props)(url, params).then(res => {
      console.log('res', res)
      this.setState({success: true})
    }).catch(() => {
      showError('注册失败')
    })
  }

  notSubmit = (store, subject) => {
    let enableSubmit = false
    if (store.name.length > 0 && store.saleCategory.name > 0 && subject.personNum.length > 0 && subject.phone.length > 0 && this.state.imageUrl.length > 0)
      enableSubmit = true
    const style = enableSubmit ? styles.submitWrap : styles.cannotSubmitWrap
    return (
      <>
        {
          this.renderStoreInfo(store)
        }
        {
          this.renderSubjectInfo(subject)
        }
        <Pressable style={style} onPress={this.submitInfo}>
          <MyText style={styles.submitText}>
            提交
          </MyText>
        </Pressable>
      </>
    )
  }

  find = () => {
    const {currVendorId} = tool.vendor(this.props.global)
    const data = {
      v: currVendorId,
      s: this.props.global.currStoreId,
      u: this.props.global.currentUser,
      m: this.props.global.currentUserProfile.mobilephone,
      place: 'mine'
    }
    JumpMiniProgram("/pages/service/index", data);
    // this.callCustomerService()

  }

  render() {
    const {store, subject, success} = this.state
    return (
      <SafeAreaView style={styles.content}>
        <ScrollView>
          {
            success ? this.renderSuccess() : this.notSubmit(store, subject)
          }
        </ScrollView>
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
    borderRadius: 4
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
    width: 67.5, height: 90, alignItems: 'center', justifyContent: 'center'
  },
  tip: {
    fontSize: 9, fontWeight: '400', color: '#F41111', lineHeight: 13
  },
  cannotSubmitWrap: {
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    paddingLeft: 161,
    paddingTop: 8,
    paddingRight: 161,
    paddingBottom: 8,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  submitWrap: {
    backgroundColor: '#59B26A',
    borderRadius: 2,
    paddingLeft: 161,
    paddingTop: 8,
    paddingRight: 161,
    paddingBottom: 8,
    marginTop: 42,
    marginLeft: 10,
    marginBottom: 42,
    marginRight: 10,
  },
  submitText: {
    fontSize: 16, fontWeight: '400', color: '#FFFFFF'
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
  successText: {
    fontSize: 24, fontWeight: '600', color: '#59B26A', lineHeight: 33, textAlign: 'center'
  }
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(RegisterShunfeng)
