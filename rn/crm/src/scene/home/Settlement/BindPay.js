import React, {PureComponent} from "react";
import {Image, ScrollView, Text, TextInput, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button} from "react-native-elements";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class BindPay extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      wechat: false,
      alipay: false,
      aliname: '',
      aliaccount: '',
    }
  }

  render() {
    return (
      <ScrollView style={{flex: 1, padding: 10, backgroundColor: colors.background}}>
        {this.renderWechatInfo()}
        {this.renderAlipayInfo()}
      </ScrollView>
    );
  }

  renderWechatInfo() {
    return (
      <View style={{backgroundColor: colors.white, padding: 10, borderRadius: 8}}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>微信</Text>
        </View>
        <If condition={this.state.wechat}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: pxToDp(1),
            borderColor: colors.colorEEE
          }}>
            <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg'}}
                   style={{width: 40, height: 40, margin: 4}}/>
            <View style={{justifyContent: 'center', marginLeft: 10}}>
              <Text style={{color: colors.color333, fontSize: 16}}>其实这路途</Text>
              <Text style={{color: colors.color999, fontSize: 14, marginTop: 5}}>ID:13fdkfnasdfnaskdfasnkfndaskf</Text>
            </View>
          </View>
        </If>
        {this.state.wechat ?
          <View>
            <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前微信的零钱中。</Text>
            <View style={{padding: 10, paddingBottom: 4}}>
              <Button title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white}}/>
            </View>
          </View> :
          <View style={{padding: 10, paddingBottom: 4}}>
            <Button onPress={() => {

            }} title={'绑定微信打款'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                    titleStyle={{color: colors.white}}/>
          </View>
        }
      </View>
    )
  }

  renderAlipayInfo() {
    return (
      <View style={{backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10}}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>支付宝</Text>
        </View>
        <View style={{
          justifyContent: 'center',
          padding: 10,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10
          }}>
            <Text style={{fontSize: 14, color: colors.color333}}>姓&nbsp;名</Text>
            <TextInput placeholder=""
                       onChangeText={(aliname) => {
                         this.setState({aliname})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.aliname}
                       style={{
                         marginLeft: 20,
                         color: colors.color333,
                         borderWidth: 1,
                         borderColor: '#999',
                         fontSize: 14,
                         width: "80%",
                         height: 35,
                       }}
                       underlineColorAndroid="transparent"/>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10
          }}>
            <Text style={{fontSize: 14, color: colors.color333}}>账&nbsp;号</Text>
            <TextInput placeholder=""
                       onChangeText={(aliaccount) => {
                         this.setState({aliaccount})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.aliaccount}
                       style={{
                         marginLeft: 20,
                         color: colors.color333,
                         borderWidth: 1,
                         borderColor: '#999',
                         fontSize: 14,
                         width: "80%",
                         height: 35,
                       }}
                       underlineColorAndroid="transparent"/>
          </View>
        </View>

        {this.state.alipay ?
          <View>
            <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前微信的零钱中。</Text>
            <View style={{padding: 10, paddingBottom: 4}}>
              <Button title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white}}/>
            </View>
          </View> :
          <View style={{padding: 10, paddingBottom: 4, flexDirection: 'row', justifyContent: 'center'}}>
            <Button title={'取消'} buttonStyle={{width: 120, backgroundColor: colors.colorEEE}}
                    titleStyle={{color: colors.white}}/>
            <Button title={'确定'} buttonStyle={{width: 120, backgroundColor: colors.main_color, marginLeft: 30}}
                    titleStyle={{color: colors.white}}/>
          </View>
        }

      </View>
    )
  }


}

export default connect(mapStateToProps, mapDispatchToProps)(BindPay);
