import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import JbbModal from "../../../pubilc/component/JbbModal";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class AddAccount extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      workerRoles: [],
      // storeList: [
      //   {label: '所有门店', value: 0}
      // ],
      roleStoreList: [],
      worker_role_grade: '',
      worker_role_grade_value: 0,
      worker_store_id_belong: '',
      worker_store_id_belong_value: '',
      worker_name: '',
      worker_account: '',
      worker_id: 0,
      worker_password: '',
      showModal: false
    }
  }

  componentDidMount() {
    this.navigationOptions()
    this.setWorkerInfo()
    this.getListStoreCanRead()
  }

  headerRight = () => {
    return (
      <TouchableOpacity
        style={headerRightStyles.resetBind}
        onPress={() => this.setState({showModal: true})}
      >
        <Text style={headerRightStyles.text}>删除</Text>
      </TouchableOpacity>
    )
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  getListStoreCanRead = () => {
    const {accessToken} = this.props.global;
    const api = `/v4/wsb_store/listStoreCanRead`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken
    }).then(res => {
      let stores = []
      res?.stores.map(item => {
        stores.push({
          label: item.name,
          value: Number(item.id)
        })
      })
      this.setState({
        // storeList: this.state.storeList.concat(stores),
        workerRoles: res?.roles,
        roleStoreList: stores
      })
    })
  }

  setWorkerInfo = () => {
    let {worker} = this.props.route.params
    this.setState({
      worker_name: worker?.name,
      worker_id: worker?.id,
      worker_account: worker?.mobile,
      worker_role_grade: worker?.role_desc,
      worker_role_grade_value: worker?.role_store,
      worker_store_id_belong_value: Number(worker?.store_id),
      worker_store_id_belong: worker?.store_name
    })
  }

  deleteWorker = () => {
    const {store_id, accessToken, vendor_id} = this.props.global;
    let {worker_id} = this.state
    const api = `/v4/wsb_worker/workerDelete`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: store_id,
      vendor_id: vendor_id,
      worker_id: worker_id
    }).then(res => {
      ToastShort('删除成功')
      this.setState({
        showModal: false
      }, () => {
        this.props.navigation.goBack();
      })
    }, (e) => {
      this.setState({
        showModal: false
      })
      ToastShort(`${e.reason}`)
    }).catch((e) => {
      ToastShort(`${e.reason}`)
      ToastLong('操作失败')
    })
  }

  editWorker = () => {
    const {store_id, accessToken, vendor_id} = this.props.global;
    let {
      worker_role_grade_value,
      worker_store_id_belong_value,
      worker_name,
      worker_account,
      worker_id,
      worker_password
    } = this.state
    if (worker_role_grade_value < 1) {
      ToastLong('请选择账号权限')
      return
    }
    if (worker_store_id_belong_value === '') {
      ToastLong('请选择归属门店')
      return
    }
    if (worker_name === '') {
      ToastLong('请填写员工称呼')
      return
    }
    if (worker_account === '') {
      ToastLong('请填写登录账号')
      return
    }
    ToastShort('提交中')
    const api = `/v4/wsb_worker/workerAddOrUpdate`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: store_id,
      vendor_id: vendor_id,
      worker_role_grade: worker_role_grade_value,
      worker_store_id_belong: Number(worker_store_id_belong_value),
      worker_name: worker_name,
      worker_account: worker_account,
      worker_id: worker_id,
      worker_password: worker_password
    }).then(res => {
      ToastShort('修改成功，即将返回')
      setTimeout(() => {
        this.props.navigation.goBack();
      }, 1000)
    }, (e) => {
      ToastShort(`${e.reason}`)
    }).catch((e) => {
      ToastShort(`${e.reason}`)
      ToastLong('操作失败')
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          style={styles.Content}>
          {this.renderEditInfo()}
        </ScrollView>
        {this.renderBtn()}
        {this.renderModal()}
      </View>
    );
  }

  renderEditInfo = () => {
    let {
      workerRoles,
      worker_role_grade,
      worker_store_id_belong,
      worker_name,
      worker_account,
      // storeList,
      roleStoreList
    } = this.state
    return (
      <View style={styles.InfoBox}>
        <View style={styles.item_body}>
          <View style={styles.item_row}>
            <Text style={styles.row_label}>账号权限 </Text>
            <View style={styles.row_fix}>
              <ModalSelector
                onChange={option => {
                  this.setState({
                    worker_role_grade: option.label,
                    worker_role_grade_value: option.value
                  }, () => {
                    this.setState({
                      worker_store_id_belong: ''
                    })
                  })
                }}
                data={workerRoles}
                skin="customer"
                defaultKey={-999}
              >
                <Text style={[styles.row_desc, {color: worker_role_grade === '' ? colors.color999 : colors.color333}]}>
                  {worker_role_grade || '请选择权限'}
                </Text>
              </ModalSelector>
              <Entypo name="chevron-thin-right" style={styles.row_right}/>
            </View>
          </View>
          <View style={[styles.item_row, styles.borderTop]}>
            <Text style={styles.row_label}>归属门店 </Text>
            <View style={styles.row_fix}>
              <ModalSelector
                onChange={option => {
                  this.setState({
                    worker_store_id_belong: option.label,
                    worker_store_id_belong_value: option.value
                  })
                }}
                data={roleStoreList}
                skin="customer"
                defaultKey={-999}
              >
                <Text
                  style={[styles.row_desc, {color: worker_store_id_belong === '' ? colors.color999 : colors.color333}]}>
                  {worker_store_id_belong || '请选择归属门店'}
                </Text>
              </ModalSelector>
              <Entypo name="chevron-thin-right" style={styles.row_right}/>
            </View>
          </View>
          <View style={[styles.item_row, styles.borderTop]}>
            <Text style={styles.row_label}>员工称呼 </Text>
            <TextInput
              onChangeText={name => this.setState({worker_name: name})}
              value={worker_name}
              maxLength={15}
              style={{textAlign: 'right', fontSize: 14, marginRight: pxToDp(5)}}
              placeholder="填写员工称呼"
              placeholderTextColor={colors.color999}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={[styles.item_row, styles.borderTop]}>
            <Text style={styles.row_label}>登录账号 </Text>
            <TextInput
              onChangeText={code => this.setState({worker_account: code})}
              value={worker_account}
              maxLength={11}
              keyboardType={'numeric'}
              style={{textAlign: 'right', fontSize: 14, marginRight: pxToDp(5)}}
              placeholder="请填写登录账号"
              placeholderTextColor={colors.color999}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={[styles.item_row, styles.borderTop]}>
            <Text style={styles.row_label}>账号密码 </Text>
            <Text style={[styles.row_desc, {color: colors.color999}]}>暂不支持，请使用验证码登录 </Text>
          </View>
        </View>
      </View>
    )
  }

  renderModal = () => {
    let {showModal} = this.state;
    return (
      <JbbModal visible={showModal} onClose={this.closeModal} modal_type={'center'}>
        <View style={{marginBottom: 20}}>
          <Text style={styles.modalDesc}>确定要删除该员工吗？ </Text>
          <View style={styles.modalBtnBox}>
            <Button title={'暂  不'}
                    onPress={this.closeModal}
                    containerStyle={[styles.modalBtnCancel, {marginRight: pxToDp(10)}]}
                    buttonStyle={{backgroundColor: colors.f5,}}
                    titleStyle={styles.modalBtnCancelTitle}/>

            <Button title={'删 除'}
                    onPress={this.deleteWorker}
                    containerStyle={styles.modalBtnCancel}
                    buttonStyle={{backgroundColor: colors.main_color,}}
                    titleStyle={styles.modalBtnSure}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'保存'}
                onPress={() => this.editWorker()}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

}

const headerRightStyles = StyleSheet.create({
  resetBind: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    width: 100,
    padding: 10
  },
  text: {fontSize: 14, color: colors.color333}
})

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  row_fix: {flexDirection: "row", alignItems: "center"},
  InfoBox: {
    width: width * 0.94,
    marginLeft: width * 0.03,
    marginTop: pxToDp(15)
  },
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: pxToDp(5)
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18
  },
  row_label: {
    fontSize: 15,
    color: colors.color333,
    flex: 1,
    fontWeight: 'bold'
  },
  row_desc: {
    fontSize: 15,
    marginRight: pxToDp(5)
  },
  row_right: {
    color: colors.color999,
    fontSize: 14,
  },
  bottomBtn: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: 10
  },
  btn: {
    backgroundColor: colors.main_color,
    borderRadius: 20
  },
  btnTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.e5
  },
  modalDesc: {
    fontSize: 17,
    color: colors.color333,
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
  },
  modalBtnBox: {flexDirection: 'row', justifyContent: 'space-between'},
  modalBtnCancel: {
    flex: 1,
    borderRadius: 20
  },
  modalBtnCancelTitle: {color: colors.color333, fontWeight: 'bold', fontSize: 16, lineHeight: 28},
  modalBtnSure: {color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 28}
});

export default connect(mapStateToProps)(AddAccount)
