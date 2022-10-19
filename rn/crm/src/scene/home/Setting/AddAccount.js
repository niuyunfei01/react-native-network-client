import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  View
} from 'react-native';
import {Button} from "react-native-elements";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class AddAccount extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      workerRoles: [
        {label: '店长', value: 1},
        {label: '店助', value: 2},
        {label: '店员', value: 3}
      ],
      storeList: [
        {label: '所有门店', value: 0}
      ],
      worker_role_grade: '',
      worker_role_grade_value: 0,
      worker_store_id_belong: '',
      worker_store_id_belong_value: '',
      worker_name: '',
      worker_account: '',
      worker_id: 0,
      worker_password: ''
    }
  }

  componentDidMount() {
    this.getStoreList()
  }

  getStoreList = () => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `/v4/wsb_store/getOwnerStores`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: currStoreId
    }).then(res => {
      let stores = []
      res.map(item => {
        stores.push({
          label: item.name,
          value: Number(item.id)
        })
      })
      this.setState({
        storeList: this.state.storeList.concat(stores)
      })
    })
  }

  addWorker = () => {
    const {currStoreId, accessToken, vendor_id} = this.props.global;
    let {worker_role_grade_value, worker_store_id_belong_value, worker_name, worker_account, worker_id, worker_password} = this.state
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
      ToastLong('请填写登陆账号')
      return
    }
    ToastShort('提交中')
    const api = `/v4/wsb_worker/workerAddOrUpdate`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      store_id: currStoreId,
      vendor_id: vendor_id,
      worker_role_grade: worker_role_grade_value,
      worker_store_id_belong: Number(worker_store_id_belong_value),
      worker_name: worker_name,
      worker_account: worker_account,
      worker_id: worker_id,
      worker_password: worker_password
    }).then(res => {
      ToastShort('添加成功，即将返回')
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

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.Content}>
          {this.renderEditInfo()}
        </ScrollView>
        {this.renderBtn()}
      </View>
    );
  }

  renderEditInfo = () => {
    let {workerRoles, worker_role_grade, worker_store_id_belong, worker_name, worker_account, storeList} = this.state
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
                data={storeList}
                skin="customer"
                defaultKey={-999}
              >
                <Text style={[styles.row_desc, {color: worker_store_id_belong === '' ? colors.color999 : colors.color333}]}>
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
            <Text style={styles.row_label}>登陆账号 </Text>
            <TextInput
              onChangeText={code => this.setState({worker_account: code})}
              value={worker_account}
              maxLength={11}
              keyboardType={'numeric'}
              style={{textAlign: 'right', fontSize: 14, marginRight: pxToDp(5)}}
              placeholder="请填写登陆账号"
              placeholderTextColor={colors.color999}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={[styles.item_row, styles.borderTop]}>
            <Text style={styles.row_label}>账号密码 </Text>
            <Text style={[styles.row_desc, {color: colors.color999}]}>暂不支持，请使用验证码登陆 </Text>
          </View>
        </View>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'确定'}
                onPress={() => this.addWorker()}
                containerStyle={{flex: 1}}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
        />
      </View>
    )
  }

}

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
    fontWeight: '500'
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
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.e5
  }
});

export default connect(mapStateToProps)(AddAccount)
