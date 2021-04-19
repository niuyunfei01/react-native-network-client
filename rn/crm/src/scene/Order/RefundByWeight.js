import BaseComponent from "../BaseComponent";
import React from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Colors, Metrics, Styles} from "../../themes";
import {tool} from "../../common";
import {Button, Button1, Line, Yuan} from "../component/All";
import Mapping from "../../Mapping";
import JbbInput from "../component/JbbInput";
import {ToastLong} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";
import { createStackNavigator } from '@react-navigation/stack';
import {connect} from "react-redux";
import {WhiteSpace} from "@ant-design/react-native";
import JbbCellTitle from "../component/JbbCellTitle";

const mapStateToProps = state => {
  return {
    global: state.global //全局token,
  };
};

class RefundByWeight extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state
    return {
      headerTitle: '按重退款'
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      order: this.props.navigation.state.params.order,
      goodsItems: this.props.navigation.state.params.order.items,
      remark: ''
    }
  }
  
  selectRefund (element, idx) {
    element.active = !element.active
    const goodsItems = this.state.goodsItems
    goodsItems.splice(idx, 1, element)
    this.setState({goodsItems})
  }
  
  onChangeGoodsWeight (value, element, idx) {
    element.refund_weight = value
    element.active = value > 0
    const goodsItems = this.state.goodsItems
    goodsItems.splice(idx, 1, element)
    this.setState({goodsItems})
  }
  
  refund () {
    const self = this
    if (!this.state.remark) return ToastLong("请输入退款原因！")
    
    let refundgoodsList = [];
    this.state.goodsItems.map(element => {
      if (element.active && element.refund_weight > 0) {
        refundgoodsList.push({id: element.id, refund_weight: element.refund_weight});
      }
    });
    
    if (!refundgoodsList.length) return ToastLong("请选择退款商品！")
    
    let params = {
      order_id: this.state.order.id,
      items: refundgoodsList,
      reason: this.state.remark,
      refund_type: 'weight'
    };

    HttpUtils.post.bind(this.props)(`api/manual_refund?access_token=${this.props.global.accessToken}`, params).then(res => {
      ToastLong("退款成功！");
      self.props.navigation.goBack()
      self.props.navigation.state.params.onSuccess()
    })
  }
  
  renderTop () {
    const {id, orderStatus, orderTime, platform_oid, pl_name, expectTime, dayId} = this.state.order
    return (
      <View style={styles.topContainer}>
        <View style={{flexDirection: "row", alignItems: "center"}}>
          <Text style={Styles.h32bf}>{tool.shortOrderDay(orderTime)}#{dayId}</Text>
          <Button fontStyle={Styles.h22theme} t={Mapping.Tools.MatchLabel(Mapping.Order.ORDER_STATUS, orderStatus)}/>
        </View>
        <Line mgt={15}/>
        {/*订单号*/}
        <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 15}}>
          <Text style={Styles.h22a2}>订单号：{id}</Text>
          <Text style={Styles.h22a2}>期望送达：{tool.orderExpectTime(expectTime)}</Text>
        </View>
        <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 15}}>
          <Text style={Styles.h22a2}>
            {pl_name}：{platform_oid}
          </Text>
          <Text style={Styles.h22a2}>
            下单时间：{tool.orderOrderTimeShort(orderTime)}
          </Text>
        </View>
        {/*下单提示*/}
        <Text style={[Styles.h18theme, {marginVertical: 15}]}>
          提示：订单已完成并且已过完成当天，将从结算记录中扣除相应费用
        </Text>
      </View>
    )
  }
  
  renderProducts () {
    return (
      <For of={this.state.goodsItems} each="element" index="idx">
        <View style={styles.goodsItemRow} key={idx}>
          <TouchableOpacity onPress={() => this.selectRefund(element, idx)} style={{flex: 1}}>
            <View style={styles.goodsItem}>
              <Yuan
                icon={"md-checkmark"}
                size={10}
                ic={Colors.white}
                w={18}
                bw={Metrics.one}
                bgc={element.active ? Colors.theme : Colors.white}
                bc={element.active ? Colors.theme : Colors.greyc}
                mgr={20}
                onPress={() => this.selectRefund(element, idx)}
              />
              <View style={styles.goodsImgBox}>
                <Image source={{uri: element.product_img}} style={{width: 40, height: 40}}/>
              </View>
              <View style={{flex: 1}}>
                <Text style={Styles.h203e} numberOfLines={3}>{element.name}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <JbbInput
            onChange={value => this.onChangeGoodsWeight(value, element, idx)}
            value={element.refund_weight ? element.refund_weight : ''}
            styles={styles.goodsItemInput}
          />
        </View>
      </For>
    )
  }
  
  renderReason () {
    return (
      <View style={styles.reason}>
        <JbbInput
          onChange={remark => this.setState({remark})}
          value={this.state.remark}
          rows={5}
          placeholder={'请输入退款原因'}
        />
      </View>
    )
  }
  
  render () {
    return (
      <View>
        <ScrollView>
          {this.renderTop()}
          
          <JbbCellTitle>选择商品并填写重量</JbbCellTitle>
          {this.renderProducts()}
          
          <JbbCellTitle>选择商品并填写重量</JbbCellTitle>
          {this.renderReason()}
          
          <WhiteSpace/>
          <View style={styles.footer}>
            <Button1 t="确认退款所选商品" w="100%" onPress={() => this.refund()}/>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default connect(mapStateToProps)(RefundByWeight)

const styles = StyleSheet.create({
  topContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  goodsItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%'
  },
  goodsItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10
  },
  goodsItemInput: {
    height: 30,
    width: 50,
    paddingVertical: 3,
    marginHorizontal: 0
  },
  goodsImgBox: {
    width: 42,
    height: 42,
    borderWidth: 1,
    marginRight: 10,
    borderColor: "#ccc"
  },
  reason: {
    backgroundColor: '#fff',
    paddingVertical: 10
  },
  footer: {
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    justifyContent: 'center'
  }
})