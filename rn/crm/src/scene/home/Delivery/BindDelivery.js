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
import {SFCategory} from "../../../pubilc/util/tool";

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}


class BindDelivery extends PureComponent {

  constructor(props) {
    super(props);
    const {
      store_info,
    } = this.props.global;
    this.state = {
      value: [],
      app_key: '',
      app_secret: '',
      shop_id: '',
      storename : store_info?.name
    }

    this.onChange = value => {
      this.setState({value});
    };

    this.onBindDelivery = this.onBindDelivery.bind(this)
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
        <Text style={{fontSize: 16, color: colors.color333, padding: 10}}>{this.state.storename} </Text>
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
            data={SFCategory}
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
