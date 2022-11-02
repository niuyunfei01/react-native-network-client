import React, {PureComponent} from "react";
import {ScrollView, Text, View} from "react-native";
import {LineView, Styles} from '../GoodsIncrementService/GoodsIncrementServiceStyle'

const CONTENT = [
  {
    showId: 1,
    des: [
      {
        headerText: '1、什么是自动呼叫配送',
        descriptionText: '最长呼单时间：外送帮自动发起配送的时间，在最长呼单时间之内，依次呼叫设置的配送方式\n发单间隔=最长呼单时间/自动发单配送数量\n在最长呼单时间之内，系统按价格由低到高依次呼叫设置的配送（含外送帮账号以及商家自有账号配送）'
      },
      {
        headerText: '2、开启自动发单有什么优势',
        descriptionText: '开启自动发单后，商家可以省心省力，增强配送履约时效，减少用餐高峰期因发单不及时导致的顾客催单率，有效提升店铺整体的满意度'
      },
      {
        headerText: '3、如何开启自动配送',
        descriptionText: '设置及时单、预订单自动发单时间，设置最长发单时间，勾选需要自动发起的配送方式'
      },
      {
        headerText: '4、注意事项',
        descriptionText: '在开启自动发单后，新来的订单外送帮才会自动发起，设置之前来的新订单，仍然需要手动发起配送'
      }
    ]
  },
  {
    showId: 2,
    des: [
      {
        headerText: '1、什么是偏好发单',
        descriptionText: '优先呼叫商家设置的偏好配送，超过自定义时间后，系统按设置的自动发单规则，按价格由低到高依次呼叫配送（含外送帮账号以及商家自有账号配送）'
      },
      {
        headerText: '2、如何开启偏好发单',
        descriptionText: '开启偏好发单设置，选择需要优先发的配送，设置偏好发单时间，可将所有偏好发单设置应用于所有的外卖店铺'
      },
      {
        headerText: '3、注意事项',
        descriptionText: '在开启偏好发单后来的新订单外送帮才会优先发起配送，设置之前来的新订单，不会优先发起'
      }
    ]
  },
  {
    showId: 3,
    des: [
      {
        headerText: '1、什么是保底配送',
        descriptionText: '开启保底配送，选择一个配送方式作为备用，在设置规定的时间后没有骑手接单，外送帮自动呼叫商家设置的保底配送（只发外送帮账号配送）'
      },
      {
        headerText: '2、如何开启保底配送',
        descriptionText: '开启保底配送设置，选择保底配送，设置触发兜底配送的时间，可将保底发单设置应用于所有的外卖店铺'
      },
      {
        headerText: '3、注意事项',
        descriptionText: '如果存在相同的配送，为了避免可能同时接单的情况，系统先取消上一次的配送再进行重新发单'
      }
    ]
  },
]

export default class AutoCallDelivery extends PureComponent {

  constructor(props) {
    super(props);
    this.navigationOptions()
  }

  navigationOptions = () => {
    const {navigation, route} = this.props
    let txt = ''
    switch (route.params.showId) {
      case 1:
        txt = '自动呼叫配送介绍'
        break
      case 2:
        txt = '偏好发单介绍'
        break
      case 3:
        txt = '保底配送介绍'
        break
    }
    const option = {headerTitle: () => this.headerTitle(txt)}
    navigation.setOptions(option);
  }
  headerTitle = (txt) => {
    return (
      <Text style={Styles.titleText}>{txt} </Text>
    )
  }

  render() {
    return (
      <ScrollView>
        {
          CONTENT.map((content, index) => {
            return (
              <If condition={content.showId === this.props.route.params.showId} key={index}>
                {
                  content.des.map((item, id) => {
                    return (
                      <View style={Styles.zoneWrap} key={id}>
                        <Text style={Styles.headerTitleText}>
                          {item.headerText}
                        </Text>
                        <LineView/>
                        <Text style={Styles.descriptionText}>
                          {item.descriptionText}
                        </Text>
                      </View>
                    )
                  })
                }
              </If>
            )
          })
        }
      </ScrollView>
    )
  }
}
