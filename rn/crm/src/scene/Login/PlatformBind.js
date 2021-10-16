import {Linking, StyleSheet, Text, View} from 'react-native'
import React from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import Dialog from "react-native-dialog"
import * as globalActions from "../../reducers/global/globalActions"
import HttpUtils from "../../util/http"
import {keySort, makeObjToString} from "../../util/common"
import {List, Provider, WhiteSpace, WingBlank} from '@ant-design/react-native'
import PropType from 'prop-types'
import sha1 from 'js-sha1'
import Config from "../../config";
import BottomModal from '../component/BottomModal';
import {Left} from "../component/All";
import * as tool from "../../common/tool";
import {ToastLong} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";

const Item = List.Item
const Brief = Item.Brief

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class PlatformBind extends React.Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '绑定平台信息'
    })
  }
  static propTypes = {
    dialogVisible: PropType.bool,
    platformsList: PropType.array,
    mtDeveloperId: PropType.string,
    businessId: PropType.string,
    ePoiId: PropType.string,
    sign: PropType.string,
    ePoiName: PropType.string,
    timestamp: PropType.string,
    mtSignKey: PropType.string,
    eleClientId: PropType.string,
    eleRedirectUri: PropType.string,
    vendorId: PropType.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      platformsList: [
        {
          name: '美团',
          alias: 'mt',
          avatar_url: `https://cnsc-pics.cainiaoshicai.cn/platform/3.jpg`,
          subtitle: '建议sku数量少于200的商户选用',
          enable: true,
        },
        {
          name: '饿了么',
          alias: 'ele',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platform/4.jpg',
          subtitle: '建议sku数量少于200的商户选用',
          enable: true,
        },
        {
          name: '美团闪购',
          alias: 'sg',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platform/7.jpg',
          subtitle: '建议sku数量多于200的商户选用',
          enable: false,
        },
        {
          name: '饿了么零售开放平台',
          alias: 'ele-open',
          avatar_url: 'https://cnsc-pics.cainiaoshicai.cn/platform/1.jpg',
          subtitle: '建议sku数量多于200的商户选用',
          enable: true,
        }
      ],
      dialogVisible: false,
      mtDeveloperId: '',
      businessId: 2,
      ePoiId: this.props.global.currStoreId,
      sign: '',
      ePoiName: '',
      timestamp: '',
      mtSignKey: '',
      eleClientId: '',
      eleRedirectUri: '',
      vendorId: 68,
      accessToken: this.props.global.accessToken,
      shouldShowModal: false,
      shopId: 0,
    }
    this.navigationOptions(this.props)
  }

  componentDidMount() {
    this.fetchDevData()
  }

  fetchDevData() {
    HttpUtils.get.bind(this.props)(`/api/get_dev_data?offline_store_id=${this.state.ePoiId}&access_token=${this.state.accessToken}`)
      .then(res => {
        this.setState({
          mtDeveloperId: res.mtDeveloperId,
          mtSignKey: res.mtSignKey,
          eleClientId: res.eleClientId,
          eleRedirectUri: res.eleRedirectUri,
          vendorId: res.vendorId,
          ePoiName: res.ePoiName
        })
      })
  }

  makeMtUrl() {
    let tempStr = ''
    let timestamp = Math.floor(new Date().getTime() / 1000)
    let tempObj = {
      'developerId': this.state.mtDeveloperId,
      'ePoiId': 'mt' + this.state.ePoiId,
      'businessId': this.state.businessId,
      'ePoiName': this.state.ePoiName,
      'timestamp': timestamp
    }
    tempObj = keySort(tempObj)
    tempStr = makeObjToString(tempObj)
    let sign = sha1(this.state.mtSignKey + tempStr)
    let dest = encodeURIComponent(`https://open-erp.meituan.com/storemap?developerId=${tempObj.developerId}&businessId=${tempObj.businessId}&ePoiId=${tempObj.ePoiId}&ePoiName=${tempObj.ePoiName}&timestamp=${tempObj.timestamp}&sign=${sign}`);
    return Config.serverUrl(`/bind_mt.php?destUrl=${dest}`)
  }

  accreditEbStore(shopId) {
    const {dispatch} = this.props;
    let {currVendorId} = tool.vendor(this.props.global);
    let store_id = this.props.global.currStoreId
    if (this.state.shopId) {
      HttpUtils.get.bind(this.props)(`/api/eb_accredit_url/${this.state.shopId}/${store_id}?access_token=${this.state.accessToken}`).then(res => {
        console.log(res)
        if (res) {
          this.props.navigation.navigate(Config.ROUTE_WEB, {
            url: res
          })
          ToastLong("请绑定");
        } else {
          ToastLong("品牌不支持绑定，请联系管理员");
        }
      })
      this.setState({shouldShowModal: false})
    } else {
      ToastLong("请填写门店id");
    }
  }

  makeEleUrl() {
    let state = 'cainiaoshicai-' + this.state.eleClientId + '-' + this.state.vendorId + '-' + this.state.ePoiId + '-' + '1'
    let dest = encodeURIComponent(`https://open-api.shop.ele.me/authorize?response_type=code&client_id=${this.state.eleClientId}&redirect_uri=${this.state.eleRedirectUri}&state=${state}&scope=all`);
    return Config.serverUrl(`/bind_mt.php?destUrl=${dest}`)
  }

  handleConfirm = () => {
    this.setState({dialogVisible: false})
    Linking.openURL('tel:13241729048')
  }

  handleCancel = () => {
    this.setState({dialogVisible: false})
  }

  renderItemWithImg = () => {
    const platformsList = this.state.platformsList
    let returnArray = []
    platformsList.map((item, index) => {
        returnArray.push(
          <View>
            <WhiteSpace size="lg"/>
            <Item
              wrap
              multipleLine
              align="top"
              // arrow="horizontal"
              thumb={item.avatar_url}
              key={index}
              extra={<Text style={[styles.status_err]}>去授权</Text>}
              onPress={() => {
                if (item.enable && item.alias === 'mt') {
                  this.props.navigation.navigate(Config.ROUTE_WEB, {
                    url: this.makeMtUrl()
                  })
                } else if (item.enable && item.alias === 'ele') {
                  this.props.navigation.navigate(Config.ROUTE_WEB, {
                    url: this.makeEleUrl()
                  })
                } else if (item.enable && item.alias === 'ele-open') {
                  this.setState({shouldShowModal: true})
                } else {
                  this.setState({dialogVisible: true})
                }
              }}>
              {item.name}
              <Brief>{item.subtitle}</Brief>
            </Item>
          </View>
        )
      }
    )
    return returnArray
  }


  render() {
    return (
      <Provider>
        <View>
          <List>
            {this.renderItemWithImg()}
          </List>
          <BottomModal
            title={'饿了么零售'}
            actionText={'继续绑定'}
            onPress={() => this.accreditEbStore()}
            visible={this.state.shouldShowModal}
            onClose={() => this.setState({
              shouldShowModal: false,
              selectedItem: {}
            })}
          >
            <Text style={[{marginTop: 10, marginBottom: 10}]}></Text>
            <Left title="平台门店ID" placeholder="" required={true} value={this.state.shopId} type="numeric"
                  textInputAlign='right'
                  textInputStyle={[{marginRight: 10, height: 40}]}
                  onChangeText={text => this.setState({shopId: text})}/>
          </BottomModal>
          <Dialog.Container visible={this.state.dialogVisible}>
            <Dialog.Title>绑定信息</Dialog.Title>
            <Dialog.Description>自助绑定尚未上线，请在9:00-20:00之间联系外送帮运营协助绑定。 稍后处理,
              现在呼叫 13241729048</Dialog.Description>
            <Dialog.Button label="现在呼叫" onPress={this.handleConfirm}/>
            <WingBlank size="lg"/>
            <Dialog.Button label="取消" onPress={this.handleCancel}/>
          </Dialog.Container>

        </View>
      </Provider>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformBind)

const styles = StyleSheet.create({
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    padding: pxToDp(10),
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    // padding: pxToDp(3),
    color: colors.f7,
  },
})
