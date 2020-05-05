import {ListItem} from "react-native-elements"
import {View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, {PureComponent} from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import Dialog from "react-native-dialog"
import * as globalActions from "../../reducers/global/globalActions"
import HttpUtils from "../../util/http";

mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class PlatformBind extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '绑定平台信息',
    }
  }

  constructor(props) {
    super(props)
    const params = this.props.navigation.state.params
    this.state = {
      platformsList: [
        {
          name: '美团',
          avatar_url: 'http://s0.meituan.net/bs/fe-web-meituan/fa5f0f0/img/logo.png',
          subtitle: '建议sku数量少于200的商户选用',
          enable: true,
        },
        {
          name: '饿了么',
          avatar_url: '',
          subtitle: '建议sku数量少于200的商户选用',
          enable: false,
        },
        {
          name: '美团闪购',
          avatar_url: 'https://awps-assets.meituan.net/reco/shangou_fe_web_portal/static/img/logo.38f11cc2.png',
          subtitle: '建议sku数量多于200的商户选用',
          enable: false,
        },
        {
          name: '饿了么开放平台',
          avatar_url: '',
          subtitle: '建议sku数量多于200的商户选用',
          enable: false,
        }
      ],
      dialogVisible: false,
      developerId: '',
      businessId: '',
      ePoiId: params.ePoiId,
      sign: '',
      ePoiName: params.ePoiName,
      timestamp: ''
    }
  }
  componentDidMount () {
    this.fetch()
  }

  fetch() {
    const {accessToken, orderId, to_u_mobile} = this.state
    const self = this
    const params = {orderId, to_u_mobile};
    HttpUtils.get.bind(this.props)(`/api/redeem_good_coupon_type?access_token=${accessToken}`, params).then(res => {
      self.setState({coupon_type_list: res.type_list, mobiles: res.mobiles, to_u_mobile: res.to_u_mobile})
    })
  }

  keyExtractor = (item, index) => index.toString()

  handleConfirm = () => {
    this.setState({dialogVisible: false});
  };

  renderItem = ({item}) => (
    <ListItem
      title={item.name}
      subtitle={item.subtitle}
      leftAvatar={{
        source: item.avatar_url,
        title: item.name
      }}
      bottomDivider
      chevron
      onPress={() => {
        if (item.enable) {
          this.props.navigation.navigate('Web', {url: 'https://open-erp.meituan.com/error'})
        } else {
          this.setState({dialogVisible: true});
        }
      }}
      disable={!item.enable}
    />
  )


  render() {
    return (
      <View>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={this.state.platformsList}
          renderItem={this.renderItem}
        />
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
