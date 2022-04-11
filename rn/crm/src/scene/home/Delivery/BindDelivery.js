//import liraries
import React, {PureComponent} from "react";
import {ScrollView, Text, View,} from "react-native";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {connect} from "react-redux";

import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import {Button, Input} from "react-native-elements";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import Entypo from "react-native-vector-icons/Entypo";

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}
const data = [
  {value: '1', label: '快餐'},
  {value: '2', label: '送药'},
  {value: '3', label: '百货'},
  {value: '4', label: '脏衣服收'},
  {value: '5', label: '干净衣服派'},
  {value: '6', label: '生鲜'},
  {value: '7', label: '保单'},
  {value: '8', label: '高端饮品'},
  {value: '9', label: '现场勘验'},
  {value: '10', label: '快递'},
  {value: '12', label: '文件'},
  {value: '13', label: '蛋糕'},
  {value: '14', label: '鲜花'},
  {value: '15', label: '电子数码'},
  {value: '16', label: '服装鞋帽'},
  {value: '17', label: '汽车配件'},
  {value: '18', label: '珠宝'},
  {value: '20', label: '披萨'},
  {value: '21', label: '中餐'},
  {value: '22', label: '水产'},
  {value: '27', label: '专人直送'},
  {value: '32', label: '中端饮品'},
  {value: '33', label: '便利店'},
  {value: '34', label: '面包糕点'},
  {value: '35', label: '火锅'},
  {value: '36', label: '证照'},
  {value: '40', label: '烧烤小龙虾'},
  {value: '41', label: '外部落地配'},
  {value: '47', label: '烟酒行'},
  {value: '48', label: '成人用品'},
  {value: '99', label: '其他'}];

let storename;

class BindDelivery extends PureComponent {

  constructor(props) {
    super(props);
    const {
      canReadStores,
      currStoreId,
    } = this.props.global;
    this.state = {
      value: [],
      app_key: '',
      app_secret: '',
      shop_id: '',
    }

    this.onChange = value => {
      this.setState({value});
    };

    this.onBindDelivery = this.onBindDelivery.bind(this)
    storename = (canReadStores[currStoreId] || {}).vendor + (canReadStores[currStoreId] || {}).name
  }

  onBindDelivery() {
    if (!this.state.shop_id) {
      ToastShort("请输入门店id")
      return;
    }
    this.props.actions.addDelivery({
      name: this.props.route.params.name,
      type: this.props.route.params.id,
      app_key: this.state.app_key,
      value: this.state.value,
      app_secret: this.state.app_secret,
      shop_id: this.state.shop_id,
      model_id: this.props.global.currStoreId,
    }, (success) => {
      if (success) {
        ToastShort('绑定成功')
      } else {
        ToastShort('绑定失败')
      }
      this.props.navigation.goBack();
    })
  }

  render() {
    return (
      <ScrollView style={{
        marginBottom: pxToDp(22),
        backgroundColor: colors.white
      }}
                  automaticallyAdjustContentInsets={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
      >
        <Text style={{fontSize: 16, color: colors.color333, padding: 10}}>{storename} </Text>
        <Text style={{
          fontSize: 16,
          color: colors.color333,
          padding: 10
        }}>登录顺丰同城急送APP，在商户信息页面授权开发者选择【外送帮】，并复制【店铺ID】填写到下方 </Text>


        <View style={{
          padding: 10,
          flexDirection: "row",
          borderColor: colors.fontColor,
          borderWidth: pxToDp(1),
          // justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: pxToDp(30),
          }}>配送平台门店ID :</Text>
          <Input
            onChangeText={(shop_id) => {
              shop_id = shop_id.replace(/[^\d]+/, '');
              this.setState({shop_id})
            }}
            containerStyle={{width: "65%", height: 40}}
            keyboardType="numeric"
            placeholder="64个字符以内"
            underlineColorAndroid="transparent" //取消安卓下划线
          />
        </View>

        <View style={{
          flexDirection: "row",
          padding: 10,
          borderColor: colors.fontColor,
          borderWidth: pxToDp(1),
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: pxToDp(30),
          }}>店铺类型选择 :</Text>

          <ModalSelector
            style={{width: "100%"}}
            onChange={value => {

              this.setState({value});
            }}
            data={data}
            skin="customer"
            defaultKey={-999}
          >
            <View style={{
              flexDirection: 'row',
              height: 40,
              width: '65%',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10
            }}>
              <View style={{flex: 1}}></View>
              <Text style={{color: colors.color333, textAlign: 'right'}}>
                {this.state.value.label ? this.state.value.label : '请选择'}
              </Text>
              <View style={{flex: 1}}></View>
              <Entypo name='chevron-thin-down' style={{fontSize: 16, color: colors.color333, marginRight: 20}}/>
            </View>
          </ModalSelector>
        </View>


        <Button title={'确认绑定'}
                onPress={() => {
                  this.onBindDelivery()
                }}
                buttonStyle={{
                  marginTop: 20,
                  marginHorizontal: '3%',
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.back_color,
                  fontSize: 14
                }}
        />

      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BindDelivery);
