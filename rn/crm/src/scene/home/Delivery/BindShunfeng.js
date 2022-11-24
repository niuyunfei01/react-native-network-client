import React, {PureComponent} from "react";
import {
  Alert,
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import tool, {SFCategory} from "../../../pubilc/util/tool";
import FastImage from "react-native-fast-image";
import {connect} from "react-redux";
import {showError, showModal, showSuccess, ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import {SvgXml} from "react-native-svg";
import {closeNew, closeRound, isSelected, right, rightCheck} from "../../../svg/svg";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import HttpUtils from "../../../pubilc/util/http";
import {BackgroundImage} from "react-native-elements/dist/config";
import {QNEngine} from "../../../pubilc/util/QNEngine";
import {ActionSheet} from "../../../weui";
import ImagePicker from "react-native-image-crop-picker";
import {imageKey} from "../../../pubilc/util/md5";
import Config from "../../../pubilc/common/config";

const exampleImg = {uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/subjectImage.png'}
const tipContent = [
  {text: '1.  打开顺丰商家APP，点击右击右上角进入“我的”'},
  {text: '2. 进入“我的”页，再次点击“店铺名称”进入店铺资料页'},
  {text: '3. 店铺资料页面点击“基本信息”后可见店铺ID信息'},
  {text: '4. 复制店铺ID信息到上方框内即可完成绑定'},
]
let checkInput = ''

class BindShunfeng extends PureComponent {

  state = {
    selectItem: 'login',
    selectAccountType: 1,
    selectAccountText: '立即绑定',
    bindShunFengByIdVisible: false,
    registerShunFengVisible: false,
    selectShunFengCategoryVisible: false,
    store: {
      store_id: this.props.route.params.store_id,
      storeName: '',
      account_contact_name: '',//联系人
      account_contact_phone: '',//联系电话
      law_name: '',//法人姓名
      account_id_card: '',//身份证号
      business_license: '',//营业执照地址
      name: '',
      address: '',//门店地址
      detailAddress: '',//详细地址
      location: '',
      saleCategory: {
        value: -1,
        label: '设置门店品类'
      },
    },
    sfStoreID: '',

    deliveryStatusObj: {},
    showImgMenus: false,
    storeList: [],
    page_size: 20,
    page: 1,
    isLastPage: false,
    isSelectedCategory: true,
    refreshing: false,
    registerShunFengObj: {
      register_success: true,
      fail_reason: '',
      sf_store_id: ''
    }
  }

  navigateRoute = (route, params = {}, callback = {}) => {
    const {navigation} = this.props
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(route, params, callback);
    });
  }
  setAddress = (detailAddress) => {
    const {address = '', city = '', area = '', province = ''} = detailAddress
    const {store} = this.state
    this.setState({
      registerShunFengVisible: true,
      store: {
        ...store,
        address: province === city ? city + area : province + city + area,
        detailAddress: address
      }
    })
  }
  setStoreAddress = () => {
    const {store} = this.state
    this.setState({registerShunFengVisible: false})
    const params = {
      center: store.location,
      keywords: store.address,
      onBack: (address) => this.setAddress.bind(this)(address),
    };
    this.navigateRoute(Config.ROUTE_SEARCH_SHOP, params);
  }
  uploadImageTask = () => {
    //所有的原生通知统一管理
    QNEngine.eventEmitter({
      onProgress: () => {

      },
      onComplete: () => {
        HttpUtils.get('/qiniu/getOuterDomain', {bucket: 'goods-image'}).then(res => {
          showSuccess('上传成功')
          const {newImageKey, store} = this.state;
          const uri = res + newImageKey
          this.setState({store: {...store, business_license: uri}});
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
    this.uploadImageTask()
    this.findStore()
    this.getStoreList()
    this.getStoreInfo()

  }

  getStoreList = () => {
    const {accessToken, only_one_store} = this.props.global;
    const {page_size, page, storeList, isLastPage} = this.state
    if (only_one_store || isLastPage)
      return
    let params = {
      keywords: '',
      page: page,
      page_size: page_size
    }
    this.setState({refreshing: true})
    const api = `/v1/new_api/stores/get_can_read_stores?access_token=${accessToken}`;
    HttpUtils.get(api, params).then(res => {
      const {lists, page, pageSize, count} = res
      let list = []
      Object.keys(lists).map((key) => {
        let item = {...lists[key]};
        item['searchStr'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        item['cursor'] = `${item['city']}-${item['vendor']}-${item['name']}(${item['id']})`;
        list.push(item);
      })
      list = page !== 1 ? storeList.concat(list) : list
      this.setState({
        storeList: list,
        page: page + 1,
        page_size: pageSize,
        refreshing: false,
        isLastPage: lists && page * pageSize >= count
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  findStore = () => {
    const {accessToken} = this.props.global;
    const {store} = this.state
    const url = `/v4/wsb_delivery/getSfRegisterResult?access_token=${accessToken}`
    const params = {store_id: store.store_id}
    HttpUtils.get(url, params).then(res => {
      const {register_success = true, fail_reason = '', shop_info = ''} = res
      const {
        shop_name, shop_address, sale_category, category_desc, shop_contact_name, shop_contact_phone, latitude,
        longitude, account_contact_name, account_id_card, business_license, sf_store_id
      } = shop_info
      this.setState({
        store: {
          ...store,
          storeName: shop_name,
          address: shop_address,
          saleCategory: {
            value: sale_category,
            label: category_desc,
          },
          account_contact_name: shop_contact_name,
          account_contact_phone: shop_contact_phone,
          law_name: account_contact_name,
          account_id_card: account_id_card,
          business_license: business_license,
          location: `${latitude},${longitude}`
        },
        registerShunFengObj: {
          register_success: register_success,
          fail_reason: fail_reason,
          sf_store_id: sf_store_id
        }
      })
    }, () => {
    }).catch((error) => ToastShort(error.reason))
  }


  bindShunFengById = () => {
    const {sfStoreID} = this.state
    const {shunFengInfo} = this.props.route.params
    const params = {
      name: shunFengInfo.name,
      type: this.props.route.params.id,
      app_key: '',
      app_secret: '',
      shop_id: sfStoreID,
      model_id: this.props.global.currStoreId,
    }
    if (!sfStoreID) {
      ToastShort('请输入顺丰店铺id', 1)
      return
    }
    HttpUtils.post.bind(this.props)(`/v1/new_api/Delivery/store`, params).then(() => {
      this.setState({
        bindShunFengByIdVisible: false,
        sfStoreID: ''
      }, () => ToastShort('绑定成功'))
    }).catch(() => {
      this.setState({
        bindShunFengByIdVisible: false,
        sfStoreID: ''
      }, () => ToastShort('绑定失败'))
    })
  }
  getStoreInfo = () => {
    const {accessToken} = this.props.global
    const {store} = this.state
    const url = `/api/read_store/${store.store_id}/1?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url, {}).then(res => {
      const {name = '', dada_address = '', owner_name = '', tel = '', location_long = '', location_lat = ''} = res
      this.setState({
        store: {
          ...this.state.store,
          storeName: name,
          account_contact_name: owner_name,
          account_contact_phone: tel,
          address: dada_address,
          location: `${location_long},${location_lat}`
        }
      })

    })

  }

  renderWSBDelivery = () => {
    const {selectAccountType = 0} = this.state

    return (
      <TouchableOpacity style={selectAccountType === 1 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                        onPress={() => this.selectAccountItem(1, '立即绑定')}>
        <Text style={styles.wsbDeliverHeader}>
          使用顺丰账号绑定
        </Text>
        <Text style={styles.wsbDeliverContentDescription}>
          使用顺丰商家账号授权后即可发单，与顺丰APP价格优惠活动一致。
        </Text>
        <If condition={selectAccountType === 1}>
          {this.renderRightCheck()}
        </If>
      </TouchableOpacity>
    )
  }

  renderRightCheck = () => {
    return (
      <View style={styles.rightCheck}>
        <SvgXml xml={rightCheck()}/>
      </View>
    )
  }

  renderStoreDelivery = () => {
    const {selectAccountType = 0} = this.state
    return (
      <TouchableOpacity style={selectAccountType === 2 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                        onPress={() => this.selectAccountItem(2, '立即绑定')}>
        <Text style={styles.wsbDeliverHeader}>
          使用顺丰店铺ID绑定
        </Text>

        <Text style={styles.wsbDeliverContentDescription}>
          登录顺丰同城APP，在基本信息中获取店铺ID，授权开发者搜索【外送帮】，复制店铺ID填写在下方。
        </Text>
        <If condition={selectAccountType === 2}>
          {this.renderRightCheck()}
        </If>
      </TouchableOpacity>
    )
  }
  selectAccountItem = (selectAccountType, selectAccountText) => {
    this.setState({
      selectAccountType: selectAccountType,
      selectAccountText: selectAccountText
    })
  }
  renderNotHasAccount = () => {
    const {selectAccountType = 0, registerShunFengObj = {}} = this.state
    const {register_success} = registerShunFengObj
    if (register_success)
      return (
        <TouchableOpacity style={selectAccountType === 3 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                          onPress={() => this.selectAccountItem(3, '立即注册')}>
          <Text style={styles.wsbDeliverHeader}>
            还没有顺丰账号
          </Text>
          <Text style={styles.wsbDeliverContentDescription}>
            点击一键注册按钮，并上传外送帮门店信息及营业执照即可注册商家账号并使用。
          </Text>
          <If condition={selectAccountType === 3}>
            {this.renderRightCheck()}
          </If>
        </TouchableOpacity>
      )
  }
  renderFailRegister = () => {
    const {selectAccountType = 0, registerShunFengObj = {}} = this.state
    const {sf_store_id = '', fail_reason = '', register_success} = registerShunFengObj
    if (!register_success)
      return (
        <TouchableOpacity style={selectAccountType === -1 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                          onPress={() => this.selectAccountItem(-1, '再次完善门店资料')}>
          <Text style={styles.subjectFailHeaderText}>
            审核失败
          </Text>
          <If condition={sf_store_id}>
            <Text style={styles.subjectFailContentText}>
              顺丰店铺ID：{sf_store_id}
            </Text>
          </If>
          <Text style={[styles.subjectFailContentText, styles.subjectFailContentReason]}>
            失败原因：{fail_reason}
          </Text>
          <If condition={selectAccountType === -1}>
            {this.renderRightCheck()}
          </If>
        </TouchableOpacity>
      )
  }
  renderBindShunFengModal = () => {
    const {bindShunFengByIdVisible, sfStoreID} = this.state
    if (bindShunFengByIdVisible)
      return (
        <CommonModal visible={bindShunFengByIdVisible} position={'flex-end'} onRequestClose={this.closeModalByBindId}>
          <KeyboardAvoidingView style={styles.modalWrap}
                                behavior={Platform.select({android: 'height', ios: 'padding'})}>
            <View style={styles.modalHeaderWrap}>
              <Text style={styles.modalHeaderText}>
                绑定顺丰
              </Text>
              <SvgXml xml={closeNew()} style={styles.closeModal} onPress={this.closeModalByBindId}/>
            </View>
            <TextInput placeholder={'请在此填写顺丰店铺ID'}
                       placeholderTextColor={colors.color999}
                       value={sfStoreID}
                       style={styles.bindShunFengTextInput}
                       onChangeText={text => this.setSFStoreID(text)}
                       keyboardType={'numeric'}/>
            <Text style={styles.bindShunFengTipText}>
              如何绑定？
            </Text>
            {
              tipContent.map((item, index) => {
                return (
                  <Text key={index} style={styles.bindShunFengTipContent}>
                    {item.text}
                  </Text>
                )
              })
            }
            <TouchableOpacity style={styles.openBtnWrap} onPress={this.bindShunFengById}>
              <Text style={styles.openBtnText}>
                立即绑定
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </CommonModal>
      )
  }
  closeModalByBindId = () => {
    this.setState({bindShunFengByIdVisible: false})
  }

  closeModalByRegisterShunFeng = () => {
    this.setState({registerShunFengVisible: false})
  }
  setSFStoreID = (value) => {
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      this.setState({sfStoreID: value})
      return
    }
    showError('请输入正确的顺丰店铺ID', 1)
  }

  setStoreInfo = (key, value) => {
    switch (key) {
      case 'account_contact_name':
        checkInput = value === '' || /[\u4e00-\u9fa5]/.test(value)
        if (!checkInput) {
          ToastShort('请输入联系人', 1)
          return
        }
        break
      case 'law_name':
        checkInput = value === '' || /[\u4e00-\u9fa5]/.test(value)
        if (!checkInput) {
          ToastShort('请输入法人姓名', 1)
          return
        }
        break
      case 'account_contact_phone':
        checkInput = value === '' || /\d/.test(value)
        if (!checkInput) {
          ToastShort('请输入联系电话', 1)
          return
        }
        break
      case 'account_id_card':
        checkInput = value === '' || /^[\d|x|X]*$/.test(value)
        if (!checkInput) {
          ToastShort('请输入法人身份证号', 1)
          return
        }
        break
    }
    const {store} = this.state
    store[key] = value
    this.setState({store: {...store}})
  }

  closeSelectShunFengCategoryModal = () => {
    this.setState({selectShunFengCategoryVisible: false})
  }
  renderShunFengCategoryItem = ({item}) => {
    const {store = {}} = this.state
    const {saleCategory} = store
    return (
      <TouchableOpacity onPress={() => this.setStoreInfo('saleCategory', item)}
                        style={saleCategory.value === item.value ? styles.activeCategoryItemWrap : styles.categoryItemWrap}>
        <Text style={saleCategory.value === item.value ? styles.activeCategoryItemText : styles.categoryItemText}>
          {item.label}
        </Text>
      </TouchableOpacity>
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

  setShowChildrenModal = (categoryModal, isSelectedCategory) => {

    this.setState({
      selectShunFengCategoryVisible: categoryModal,
      isSelectedCategory: isSelectedCategory
    })
  }

  renderRegisterShunFengModal = () => {
    const {store, registerShunFengVisible, selectShunFengCategoryVisible, showImgMenus} = this.state
    const {business_license = ''} = store
    const {only_one_store} = this.props.global
    if (registerShunFengVisible)
      return (
        <CommonModal visible={registerShunFengVisible}
                     onRequestClose={this.closeModalByRegisterShunFeng}
                     position={'flex-end'}>
          <>
            <View style={[styles.modalWrap, {height: '85%'}]}>
              <View style={styles.modalHeaderWrap}>
                <Text style={styles.modalHeaderText}>
                  免费注册顺丰
                </Text>
                <SvgXml xml={closeNew()} style={styles.closeModal} onPress={this.closeModalByRegisterShunFeng}/>
              </View>
              <KeyboardAwareScrollView enableOnAndroid={false}>
                <Text style={styles.modalTipText}>
                  门店信息
                </Text>
                <TouchableOpacity style={styles.modalStoreInfoItemWrap}
                                  disabled={only_one_store}
                                  onPress={() => this.setShowChildrenModal(true, false)}>
                  <Text style={styles.modalStoreInfoItemLeftText}>门店名称</Text>
                  <View style={styles.rowCenter}>
                    <Text style={styles.modalStoreInfoItemRightText}>{store.storeName}</Text>
                    <SvgXml xml={right()} style={styles.rightIcon}/>
                  </View>
                </TouchableOpacity>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>门店地址</Text>
                  <View style={styles.rowCenter}>
                    <Text style={styles.modalStoreInfoItemRightText} onPress={this.setStoreAddress}>
                      {store.address}
                    </Text>
                    <SvgXml xml={right()} style={styles.rightIcon}/>
                  </View>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoNotRightItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>详细地址</Text>
                  <View style={styles.rowCenter}>
                    <TextInput style={styles.modalStoreInfoItemRightText}
                               placeholder={'填写详细门牌号'}
                               placeholderTextColor={colors.color999}
                               onChangeText={text => this.setStoreInfo('detailAddress', text)}
                               value={store.detailAddress}/>
                  </View>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>经营品类</Text>
                  <TouchableOpacity style={styles.rowCenter} onPress={() => this.setShowChildrenModal(true, true)}>
                    <Text
                      style={store.saleCategory.value === -1 ? styles.notSelectModalStoreInfoItemRightText : styles.modalStoreInfoItemRightText}>
                      {store.saleCategory.label}
                    </Text>
                    <SvgXml xml={right()} style={styles.rightIcon}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoNotRightItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>联系人</Text>
                  <View style={styles.rowCenter}>
                    <TextInput style={styles.modalStoreInfoItemRightText}
                               placeholder={'请填写门店联系人'}
                               value={store.account_contact_name}
                               onChangeText={text => this.setStoreInfo('account_contact_name', text)}
                               placeholderTextColor={colors.color999}/>

                  </View>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoNotRightItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>联系电话</Text>
                  <View style={styles.rowCenter}>
                    <TextInput style={styles.modalStoreInfoItemRightText}
                               placeholder={'请填写门店联系电话'}
                               placeholderTextColor={colors.color999}
                               value={store.account_contact_phone}
                               keyboardType={'numeric'}
                               onChangeText={text => this.setStoreInfo('account_contact_phone', text)}/>

                  </View>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoNotRightItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>法人姓名</Text>
                  <View style={styles.rowCenter}>
                    <TextInput style={styles.modalStoreInfoItemRightText}
                               placeholder={'请填写法人姓名'}
                               placeholderTextColor={colors.color999}
                               value={store.law_name}
                               onChangeText={text => this.setStoreInfo('law_name', text)}/>
                  </View>
                </View>
                <View style={styles.line}/>
                <View style={styles.modalStoreInfoNotRightItemWrap}>
                  <Text style={styles.modalStoreInfoItemLeftText}>身份证号</Text>
                  <View style={styles.rowCenter}>
                    <TextInput style={styles.modalStoreInfoItemRightText}
                               placeholder={'请填写法人身份证'}
                               placeholderTextColor={colors.color999}
                               value={store.account_id_card}
                               onChangeText={text => this.setStoreInfo('account_id_card', text)}/>

                  </View>
                </View>
                <Text style={styles.modalTipText}>营业执照</Text>
                <View style={styles.rowCenter}>
                  <BackgroundImage style={styles.uploadImageWrap} source={exampleImg}>
                    <Text style={styles.exampleImageText}>示例图</Text>
                  </BackgroundImage>
                  <TouchableOpacity style={styles.uploadImageWrap} onPress={this.uploadImageItem}>
                    <If condition={business_license}>
                      <FastImage style={{width: 148, height: 102}}
                                 source={{uri: business_license}}
                                 resizeMode={FastImage.resizeMode.contain}/>
                      <SvgXml xml={closeRound(32, 32)}
                              style={styles.deleteImage}
                              onPress={() => this.setStoreInfo('business_license', '')}/>
                    </If>
                    <If condition={!business_license}>
                      <Text style={{fontSize: 32, color: colors.color999}}>+</Text>
                      <Text style={styles.uploadImageTipText}>点击上传营业执照</Text>
                    </If>

                  </TouchableOpacity>
                </View>

              </KeyboardAwareScrollView>
              <TouchableOpacity style={[styles.openBtnWrap]} onPress={this.registerShunFeng}>
                <Text style={styles.openBtnText}>
                  确认信息并注册
                </Text>
              </TouchableOpacity>

            </View>
            <ActionSheet visible={showImgMenus}
                         onRequestClose={this.onRequestClose}
                         menus={this.menus}
                         actions={[{label: '取消', onPress: this.onRequestClose}]}/>
            <CommonModal visible={selectShunFengCategoryVisible}
                         position={'flex-end'}
                         onRequestClose={this.closeSelectShunFengCategoryModal}>
              <>
                {this.renderShunFengCategory()}
                {this.renderStoreList()}
              </>
            </CommonModal>
          </>
        </CommonModal>
      )
  }

  setStore = (name, id) => {
    this.setState({
      store: {
        ...this.state.store,
        store_id: id,
        storeName: name
      }
    }, () => this.getStoreInfo())
  }

  renderStoreListItem = ({item}) => {
    const {name, id} = item
    const {store} = this.state
    return (
      <TouchableOpacity style={store.store_id == id ? styles.isSelectStoreWrap : styles.normalStoreWrap}
                        onPress={() => this.setStore(name, id)}>
        <Text style={store.store_id == id ? styles.isSelectStoreText : styles.normalStoreText}>
          {name}
        </Text>
        <If condition={store.store_id == id}>
          <SvgXml xml={isSelected()} style={{paddingRight: 20}}/>
        </If>
      </TouchableOpacity>
    )
  }

  changeStore = () => {
    this.setState({selectShunFengCategoryVisible: false})

  }
  renderStoreList = () => {
    const {isSelectedCategory, storeList, refreshing} = this.state
    if (!isSelectedCategory) {
      return (
        <View style={[styles.modalWrap]}>
          <View style={styles.modalHeaderWrap}>
            <Text style={styles.modalHeaderText}>
              选择门店
            </Text>
            <SvgXml xml={closeNew()} style={styles.closeModal} onPress={this.closeSelectShunFengCategoryModal}/>
          </View>
          <FlatList data={storeList}
                    initialNumToRender={6}
                    style={{marginLeft: 20, marginRight: 10, height: '45%'}}
                    keyExtractor={(item, index) => `${index}`}
                    onEndReachedThreshold={0.3}
                    onEndReached={this.getStoreList}
                    refreshing={refreshing}
                    renderItem={this.renderStoreListItem}/>
          <TouchableOpacity style={styles.openBtnWrap} onPress={this.changeStore}>
            <Text style={styles.openBtnText}>
              确定
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  renderShunFengCategory = () => {
    const {isSelectedCategory} = this.state
    if (isSelectedCategory)
      return (
        <View style={styles.modalWrap}>
          <View style={styles.modalHeaderWrap}>
            <Text style={styles.modalHeaderText}>
              经营品类
            </Text>
            <SvgXml xml={closeNew()} style={styles.closeModal} onPress={this.closeSelectShunFengCategoryModal}/>
          </View>
          <FlatList data={SFCategory}
                    numColumns={3}
                    initialNumToRender={21}
                    style={{marginLeft: 20, marginRight: 10, height: '45%'}}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={this.renderShunFengCategoryItem}/>
          <TouchableOpacity style={styles.openBtnWrap}
                            onPress={() => this.setState({selectShunFengCategoryVisible: false})}>
            <Text style={styles.openBtnText}>
              确定
            </Text>
          </TouchableOpacity>
        </View>
      )
  }

  registerShunFeng = () => {
    const {accessToken, vendor_id} = this.props.global
    const url = `v1/new_api/delivery/register_sf?access_token=${accessToken}&vendorId=${vendor_id}`
    const {store} = this.state
    const params = {
      store_id: store.store_id,
      account_contact_name: store.account_contact_name,
      shop_product_type: store.saleCategory.value,
      account_contact_phone: store.account_contact_phone,
      account_id_card: store.account_id_card,
      business_license: store.business_license,
    }
    if (store.saleCategory.value === -1) {
      ToastShort('请选择门店品类', 1)
      return;
    }
    if (!store.account_contact_name) {
      ToastShort('请输入联系人', 1)
      return
    }
    checkInput = /0?(13|14|15|16|17|18|19)[0-9]{9}/.test(store.account_contact_phone)
    if (!checkInput) {
      ToastShort('请输入正确的手机号', 1)
      return
    }
    if (!store.law_name) {
      ToastShort('请输入法人姓名', 1)
      return
    }
    checkInput = /\d{17}[\d|x]|\d{15}/.test(store.account_id_card)
    if (!checkInput) {
      ToastShort('请输入正确的法人身份证号', 1)
      return
    }
    if (!store.business_license) {
      ToastShort('请上传先营业执照', 1)
      return
    }
    HttpUtils.post.bind(this.props)(url, params).then(() => {
      this.setState({
        registerShunFengVisible: false,
        selectShunFengCategoryVisible: false
      }, () => ToastShort('注册顺丰信息提交成功，请等待审核'))
    }).catch(error => {
      this.setState({
        registerShunFengVisible: false,
        selectShunFengCategoryVisible: false
      }, () => ToastShort(error.reason))
    })
  }

  bindShunFeng = () => {
    const {selectAccountType} = this.state
    const {shunFengInfo} = this.props.route.params
    switch (selectAccountType) {
      case 1:
        this.navigateRoute('Web', {url: shunFengInfo.auth_url})
        break
      case 2:
        this.setState({bindShunFengByIdVisible: true})
        break
      case 3:
      case -1:
        this.setState({registerShunFengVisible: true})
        break
    }
  }

  render() {

    const {selectAccountText} = this.state

    return (
      <View style={styles.content}>
        <ScrollView>
          {this.renderWSBDelivery()}
          {this.renderStoreDelivery()}
          {this.renderNotHasAccount()}
          {this.renderFailRegister()}


        </ScrollView>
        <TouchableOpacity style={styles.openBtnWrap} onPress={this.bindShunFeng}>
          <Text style={styles.openBtnText}>
            {selectAccountText}
          </Text>
        </TouchableOpacity>

        {this.renderBindShunFengModal()}
        {this.renderRegisterShunFengModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  isSelectStoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.e5
  },
  isSelectStoreText: {fontSize: 14, color: colors.color333, lineHeight: 20, paddingLeft: 20, paddingVertical: 14},
  normalStoreWrap: {borderBottomWidth: 0.5, borderBottomColor: colors.e5},
  normalStoreText: {fontSize: 14, color: colors.color666, lineHeight: 20, paddingLeft: 20, paddingVertical: 14},

  deleteImage: {position: 'absolute', right: -12, top: -12},
  content: {flex: 1, backgroundColor: colors.white},
  rowCenter: {flexDirection: 'row', alignItems: 'center', flex: 1},

  wsbDeliveryWrap: {borderRadius: 6, borderColor: '#26B942', borderWidth: 1, marginHorizontal: 20, marginTop: 10},
  wsbDeliverHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.color333,
    paddingTop: 15,
    paddingLeft: 12,
    paddingBottom: 8,
    lineHeight: 21
  },
  wsbDeliverContentDescription: {
    fontSize: 13,
    color: colors.color666,
    paddingHorizontal: 12,
    paddingBottom: 10,
    lineHeight: 18
  },
  wsbDeliverContentText: {fontSize: 13, color: colors.color666, paddingHorizontal: 12, paddingBottom: 15},

  storeDeliveryWrap: {borderRadius: 6, backgroundColor: '#F5F5F5', marginHorizontal: 20, marginTop: 10},
  storeDeliveryText: {fontSize: 13, color: colors.color333, paddingHorizontal: 12, paddingBottom: 15},
  storeDeliveryLeft: {color: '#FF862C'},

  openBtnWrap: {backgroundColor: '#26B942', borderRadius: 24, margin: 20, marginTop: 10},
  openBtnText: {fontSize: 16, fontWeight: '500', color: colors.white, paddingVertical: 10, textAlign: 'center'},

  modalWrap: {backgroundColor: colors.white, borderTopLeftRadius: 10, borderTopRightRadius: 10},
  modalHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderText: {fontSize: 16, fontWeight: 'bold', color: colors.color333, padding: 20},
  closeModal: {padding: 12, marginRight: 12},
  modalTipText: {
    fontSize: 14,
    color: colors.color999,
    paddingVertical: 10,
    paddingLeft: 20,
    backgroundColor: '#F5F5F5'
  },
  modalStoreInfoItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1
  },
  modalStoreInfoNotRightItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
    flex: 1
  },
  modalStoreInfoItemLeftText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
    paddingVertical: 18,
    paddingLeft: 20
  },
  notSelectModalStoreInfoItemRightText: {
    fontSize: 14,
    color: colors.color999,
    paddingVertical: 18,
    // backgroundColor: 'red',
    textAlign: 'right',
    flex: 1,
  },
  modalStoreInfoItemRightText: {
    fontSize: 14,
    color: colors.color333,
    paddingVertical: 18,
    // backgroundColor: 'red',
    textAlign: 'right',
    flex: 1,
  },
  rightIcon: {paddingRight: 20, paddingLeft: 2},
  line: {borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5', marginHorizontal: 12},
  uploadImageWrap: {
    width: 148,
    height: 102,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exampleImageText: {fontSize: 12, color: colors.white},
  uploadImageTipText: {fontSize: 12, color: colors.color999, paddingTop: 8},

  bindShunFengTextInput: {
    fontSize: 16,
    color: colors.color333,
    padding: 12,
    marginHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 6
  },
  bindShunFengTipText: {fontSize: 14, color: colors.color333, lineHeight: 20, paddingVertical: 10, paddingLeft: 20},
  bindShunFengTipContent: {fontSize: 13, color: colors.color666, lineHeight: 18, marginBottom: 10, marginLeft: 20},

  subjectFailHeaderText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF862C',
    lineHeight: 21,
    paddingTop: 15,
    paddingLeft: 12,
    paddingBottom: 8
  },
  subjectFailContentText: {fontSize: 13, color: colors.color666, lineHeight: 18, paddingHorizontal: 12},
  subjectFailContentReason: {paddingTop: 5, paddingBottom: 15},

  categoryItemWrap: {
    borderWidth: 1,
    borderColor: colors.colorDDD,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 10,
    width: 105,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCategoryItemWrap: {
    backgroundColor: '#E4FFE7',
    borderWidth: 1,
    borderColor: '#26B942',
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 10,
    width: 105,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCategoryItemText: {
    fontSize: 14,
    color: '#26B942',
    lineHeight: 20
  },
  categoryItemText: {
    fontSize: 14,
    color: colors.color333,
    lineHeight: 20
  },

  rightCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26B942',
    borderLeftWidth: 1,
    borderLeftColor: 'transparent'

  }
})

const mapStateToProps = ({global}) => ({global: global})

export default connect(mapStateToProps)(BindShunfeng)
