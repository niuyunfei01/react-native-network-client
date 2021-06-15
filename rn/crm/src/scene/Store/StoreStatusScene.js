import React from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native'
import pxToDp from "../../util/pxToDp";
import ModalSelector from "react-native-modal-selector";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {Toast, Portal} from "@ant-design/react-native";
import Config from "../../config";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Styles from "../../themes/Styles";
import Metrics from "../../themes/Metrics";

function mapStateToProps (state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

class StoreStatusScene extends React.Component {
  constructor (props) {
    super(props)
    const {navigation} = this.props

    navigation.setOptions({
      headerTitle: '店铺状态',
      headerRight: () => {
        const {navigation, route} = this.props
        if (route.params?.allow_edit) {
          return <TouchableOpacity
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(Config.ROUTE_STORE_ADD, {
                  btn_type: "edit",
                  editStoreId: this.props.global.currStoreId,
                  actionBeforeBack: resp => {
                    console.log("edit resp =====> ", resp);
                  }
                });
              });
            }}>
            <FontAwesome name='pencil-square-o' style={styles.btn_edit}/>
          </TouchableOpacity>
        }
      }
    })

    this.state = {
      timeOptions: [
        {label: '30分钟', value: 30, key: 30},
        {label: '1小时', value: 60, key: 60},
        {label: '2小时', value: 120, key: 120},
        {label: '4小时', value: 240, key: 240},
        {label: '8小时', value: 480, key: 480},
        {label: '关到下班前', value: 'CLOSE_TO_OFFLINE', key: 'CLOSE_TO_OFFLINE'},
      ],
      all_close: false,
      all_open: false,
      allow_self_open: false,
      business_status: []
    }
  }

  UNSAFE_componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    const self = this
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/get_store_business_status/${store_id}?access_token=${access_token}`
    const toastKey = Toast.loading('请求中...', 0)
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      self.setState({
        all_close: res.all_close,
        all_open: res.all_open,
        allow_self_open: res.allow_self_open,
        business_status: res.business_status
      })
      const {updateStoreStatusCb} = this.props.route.params;
      if (updateStoreStatusCb) {
        updateStoreStatusCb(res)
      }
      this.props.navigation.setParams({
        allow_edit: res.allow_edit_store
      })
      Portal.remove(toastKey)
    }).catch(() => {
      Portal.remove(toastKey)
    })
  }

  openStore () {
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/open_store/${store_id}?access_token=${access_token}`
    const toastKey = Toast.loading('请求中...', 0)
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      Portal.remove(toastKey)
      this.fetchData()
    }).catch(() => {
      Portal.remove(toastKey)
    })
  }

  closeStore (minutes) {
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/close_store/${store_id}/${minutes}?access_token=${access_token}`
    const toastKey = Toast.loading('请求中...', 0)
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.fetchData()
    }).catch(() => {
      Portal.remove(toastKey)
    })
  }

  renderBody () {
    const business_status = this.state.business_status
    let items = []
    for (let i in business_status) {
      const store = business_status[i]
      items.push(
        <View style={[Styles.between, {paddingTop: pxToDp(14), paddingBottom: pxToDp(14), borderTopWidth: Metrics.one, borderTopColor: colors.colorDDD, backgroundColor: colors.white}]}>
          <Image style={[styles.wmStatusIcon]} source={this.getPlatIcon(store.icon_name)} />
          <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
            <Text style={styles.wm_store_name}>{store.name}</Text>
            <View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
              <Text style={[ !store.open ? Styles.close_text : Styles.open_text, {fontSize: pxToDp(24)}]}>{store.status_label}</Text>
              {store.show_open_time &&
                <Text style={{color: '#595959', fontSize: pxToDp(20)}}>开店时间：{store.next_open_desc || store.next_open_time}</Text>}
            </View>
          </View>
        </View>)
    }

    return (
      <ScrollView style={styles.bodyContainer}>
        {items}
      </ScrollView>
    )
  }

  getPlatIcon = (icon_name) =>  {
    if (icon_name === 'eleme') {
      return require(`../../img/PlatformLogo/pl_store_eleme.png`)
    } else if (icon_name === 'jd') {
      return require(`../../img/PlatformLogo/pl_store_jd.png`)
    } else if (icon_name === 'meituan') {
      return require(`../../img/PlatformLogo/pl_store_meituan.png`)
    } else if (icon_name === 'txd') {
      return require(`../../img/PlatformLogo/pl_store_txd.jpg`)
    } else if (icon_name === 'weixin') {
      return require(`../../img/PlatformLogo/pl_store_weixin.png`)
    }

    return require(`../../img/PlatformLogo/pl_store_unknown.png`)
  }

  renderFooter () {
    let canOpen = !this.state.all_open && this.state.allow_self_open
    let canClose = !this.state.all_close && this.state.allow_self_open
    return (
      <View style={styles.footerContainer}>
        <If condition={canOpen}>
          <TouchableOpacity style={styles.footerItem} onPress={() => this.openStore()}>
            <View style={[styles.footerBtn, canOpen ? styles.successBtn : styles.disabledBtn]}>
              <Text style={styles.footerBtnText}>开店接单</Text>
            </View>
          </TouchableOpacity>
        </If>
        <If condition={!canOpen}>
          <View style={[styles.footerItem, styles.footerBtn, canOpen ? styles.successBtn : styles.disabledBtn]}>
            <Text style={styles.footerBtnText}>开店接单</Text>
          </View>
        </If>


        <If condition={canClose}>
          <ModalSelector
              style={[styles.footerItem, {flex: 1}]}
              touchableStyle={[styles.footerItem, {width: '100%', flex: 1}]}
              childrenContainerStyle={[styles.footerItem, {width: '100%', flex: 1}]}
              onChange={(option) => {
                this.closeStore(option.value);
              }}
              cancelText={'取消'}
              data={this.state.timeOptions}
          >
            <View style={[styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}>
              <Text style={styles.footerBtnText}>{this.getLabelOfCloseBtn()}</Text>
            </View>
          </ModalSelector>
        </If>
        <If condition={!canClose}>
          <View style={[styles.footerItem, styles.footerBtn, canClose ? styles.errorBtn : styles.disabledBtn]}>
            <Text style={styles.footerBtnText}>{this.getLabelOfCloseBtn()}</Text>
          </View>
        </If>
      </View>
    )
  }

  getLabelOfCloseBtn() {
    return this.state.all_close ? '已全部关店' : "紧急关店"
  }

  render () {
    return (
      <View style={{flex: 1}}>
        {this.renderBody()}
        {this.renderFooter()}
      </View>
    )
  }
}

export default connect(mapStateToProps)(StoreStatusScene)

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1
  },
  cell_title: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  },
  cells: {
    marginBottom: pxToDp(10),
    marginTop: 0,
    paddingLeft: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999
  },
  wmStatusIcon: {
    width: pxToDp(72),
    height: pxToDp(72),
    marginLeft: pxToDp(20),
    marginRight: pxToDp(20),
  },
  cell_height: {
    height: pxToDp(70)
  },
  cell_content: {
    justifyContent: "center",
    marginLeft: 0,
    paddingRight: 0
  },
  wm_store_name: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.listTitleColor
  },
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
    width: '100%'
  },
  footerItem: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  successBtn: {
    backgroundColor: '#59b26a'
  },
  errorBtn: {
    backgroundColor: '#e94f4f'
  },
  disabledBtn: {
    backgroundColor: 'grey'
  },
  footerBtnText: {
    color: '#fff'
  },
  btn_edit: {
    fontSize: pxToDp(40),
    width: pxToDp(42),
    height: pxToDp(36),
    color: colors.color666,
    marginRight: pxToDp(30),
  }
})
