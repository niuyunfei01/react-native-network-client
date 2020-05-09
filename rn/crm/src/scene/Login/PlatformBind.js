import {View} from 'react-native'
import React from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import Dialog from "react-native-dialog"
import * as globalActions from "../../reducers/global/globalActions"
import HttpUtils from "../../util/http"
import {keySort, makeObjToString} from "../../util/common"
import {List} from 'antd-mobile-rn'
import PropType from 'prop-types'
import sha1 from 'js-sha1'

const Item = List.Item
const Brief = Item.Brief

mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class PlatformBind extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '绑定平台信息',
    }
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
    const params = this.props.navigation.state.params
    this.state = {
      platformsList: [
        //TODO fix avatar for platforms
        {
          name: '美团',
          alias: 'mt',
          avatar_url: 'http://s0.meituan.net/bs/fe-web-meituan/fa5f0f0/img/logo.png',
          subtitle: '建议sku数量少于200的商户选用',
          enable: true,
        },
        {
          name: '饿了么',
          alias: 'ele',
          avatar_url: '',
          subtitle: '建议sku数量少于200的商户选用',
          enable: true,
        },
        {
          name: '美团闪购',
          alias: 'sg',
          avatar_url: 'https://awps-assets.meituan.net/reco/shangou_fe_web_portal/static/img/logo.38f11cc2.png',
          subtitle: '建议sku数量多于200的商户选用',
          enable: false,
        },
        {
          name: '饿了么开放平台',
          alias: 'ele-open',
          avatar_url: '',
          subtitle: '建议sku数量多于200的商户选用',
          enable: false,
        }
      ],
      dialogVisible: false,
      mtDeveloperId: '',
      businessId: '',
      ePoiId: params.ePoiId,
      sign: '',
      ePoiName: params.ePoiName,
      // es_id: params.es_id,
      es_id: params.es_id,
      timestamp: '',
      mtSignKey: '',
      eleClientId: '',
      eleRedirectUri: '',
      vendorId: '',
      accessToken: this.props.global.accessToken,
    }
  }

  componentDidMount() {
    this.fetchDevData()
  }

  fetchDevData() {
    HttpUtils.get.bind(this.props)(`/api/get_dev_data?es_id=${this.state.es_id}&access_token=${this.state.accessToken}`)
      .then(res => {
        this.setState({
          mtDeveloperId: res.mtDeveloperId,
          mtSignKey: res.mtSignKey,
          eleClientId: res.eleClientId,
          eleRedirectUri: res.eleRedirectUri,
        })
      })
  }

  makeMtUrl() {
    let tempStr = ''
    let timestamp = Math.floor(new Date().getTime() / 1000)
    let tempObj = {
      'mtDeveloperId': this.state.mtDeveloperId,
      'ePoiId': 'mt' + this.state.ePoiId,
      'businessId': this.state.businessId,
      'ePoiName': this.state.ePoiName,
      'timestamp': timestamp
    }
    tempObj = keySort(tempObj)
    tempStr = makeObjToString(tempObj)
    let sign = sha1(this.state.mtSignKey + tempStr)
    return `https://open-erp.meituan.com/storemap?mtDeveloperId=${tempObj.mtDeveloperId}&businessId=${tempObj.businessId}&ePoiId=${tempObj.ePoiId}&ePoiName=${tempObj.ePoiName}&timestamp=${tempObj.timestamp}&sign=${sign}`
  }

  makeEleUrl() {
    let state = 'cainiaoshicai-' + this.state.eleClientId + '-' + this.state.vendorId + '-' + this.state.ePoiId + '-' + '1'
    return `https://open-api.shop.ele.me/authorize?response_type=code&client_id=${this.state.eleClientId}&redirect_uri=${this.state.eleRedirectUri}&state=${state}&scope=all`
  }

  handleConfirm = () => {
    this.setState({dialogVisible: false})
  }

  renderItemWithImg = () => {
    const platformsList = this.state.platformsList
    let returnArray = []
    platformsList.map((item, index) => {
        returnArray.push(
          <Item
            wrap
            multipleLine
            align="top"
            arrow="horizontal"
            thumb={item.avatar_url}
            key={index}
            onClick={() => {
              if (item.enable && item.alias === 'mt') {
                this.props.navigation.navigate('BindPlatformWebView', {
                  url: this.makeMtUrl()
                })
              } else if (item.enable && item.alias === 'ele') {
                this.props.navigation.navigate('BindPlatformWebView', {
                  url: this.makeEleUrl()
                })
              } else {
                this.setState({dialogVisible: true})
              }
            }}>
            {item.name}
            <Brief>{item.subtitle}</Brief>
          </Item>
        )
      }
    )
    return returnArray
  }


  render() {
    return (
      <View>
        <List>
          {this.renderItemWithImg()}
        </List>
        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>绑定信息</Dialog.Title>
          <Dialog.Description>该平台暂未开放</Dialog.Description>
          <Dialog.Button label="确定" onPress={this.handleConfirm}/>
        </Dialog.Container>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformBind)
