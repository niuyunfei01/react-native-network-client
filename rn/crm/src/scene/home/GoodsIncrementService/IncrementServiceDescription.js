import React, {PureComponent} from "react";
import { ScrollView, Text, View} from 'react-native'
import {LineView, Styles} from "./GoodsIncrementServiceStyle";

const DESCRIPTION_LIST = [
  {
    id: 0,
    title: '差评提醒',
    description: '当日差评自动短信/电话提醒，协助商家及时解决问题，降低差评数量，提高店铺评分。'
  },
  {
    id: 1,
    title: '自动回评',
    description: '根据评价类型（星级），自动回复客户评价，提供回复模板，帮助商家更好的运营店铺。'
  },
  {
    id: 2,
    title: '自动打包',
    description: '根据订单预计送达时间控制拣货时长，完成自动打包。'
  },
]

export default class IncrementServiceDescription extends PureComponent {

  render() {
    return (
      <ScrollView>
        {
          DESCRIPTION_LIST.map((item, index) => {
            return (
              <View style={Styles.zoneWrap} key={index}>
                <Text style={Styles.headerTitleText}>
                  {item.title}
                </Text>

                <LineView/>
                <Text style={Styles.descriptionText}>
                  {item.description}
                </Text>
                <If condition={item.id === 0}>
                  <Text style={Styles.tipText}>
                    短信、电话通讯费用另计（由通讯公司收取费用）
                  </Text>
                </If>
              </View>
            )
          })
        }
      </ScrollView>
    )
  }
}
