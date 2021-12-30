import React, {PureComponent} from 'react'
import {Image, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Button, List} from "@ant-design/react-native";
import colors from "../../styles/colors";
import Ionicons from "react-native-vector-icons/Ionicons";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}


class BindMeituan extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
    }
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{backgroundColor: colors.main_back, flexGrow: 1}}>
          <Text style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            fontSize: pxToDp(26),
            marginTop: pxToDp(20),
            color: colors.fontGray
          }}>请根据您当前的接单方式选择绑定方式</Text>
          <List style={{margin: 10}}>
            <TouchableOpacity onPress={() => {
              this.setState({
                chosed: 1
              })
            }} style={{padding: pxToDp(10)}}>
              <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>默认方式</Text>
                <View style={{flex: 1}}>
                  <View style={{width: 20, height: 20, marginLeft: 30}}>
                    {this.state.chosed === 1 ? <Image
                        source={require("../../img/My/correct.png")}
                        style={{
                          width: pxToDp(40),
                          height: pxToDp(40),
                          marginRight: pxToDp(10)
                        }}/> :
                      <Ionicons name={'radio-button-off-outline'}
                                style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
                  </View>
                </View>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#333333',
                lineHeight: 17,
                marginLeft: pxToDp(20),
                marginRight: pxToDp(30),
                marginBottom: pxToDp(30)
              }}>
                未使用云打印机也没绑定其他第三方否的系统接单时，请继续使用原接单方式，外送帮将不给您自动接单。
              </Text>
            </TouchableOpacity>
          </List>

          <List style={{margin: 10}}>
            <TouchableOpacity onPress={() => {
              this.setState({
                chosed: 2
              })
            }} style={{padding: pxToDp(10)}}>
              <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>云打印机</Text>
                <View style={{flex: 1}}>
                  <View style={{
                    width: 20,
                    height: 20,
                    marginLeft: 30
                  }}>
                    {this.state.chosed === 2 ? <Image
                        source={require("../../img/My/correct.png")}
                        style={{
                          width: pxToDp(40),
                          height: pxToDp(40),
                          marginRight: pxToDp(10)
                        }}/> :
                      <Ionicons name={'radio-button-off-outline'}
                                style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
                  </View>
                </View>
              </View>

              <Text style={{
                fontSize: 12,
                color: '#333333',
                lineHeight: 17,
                marginLeft: pxToDp(20),
                marginRight: pxToDp(30),
                marginBottom: pxToDp(10)
              }}>
                通过入飞蛾、中午、芯烨云等云打印机接单打印，应先把打印机绑定到外送帮，再去绑定美团。外送帮将自动为您接单。
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: '#59B26A',
                  lineHeight: 17,
                  textAlign: "right",
                  marginTop: pxToDp(20),
                  marginRight: pxToDp(40)
                }}>
                已绑定云打印机：芯烨云
              </Text>

            </TouchableOpacity>

          </List>

          <List style={{margin: 10}}>
            <TouchableOpacity onPress={() => {
              this.setState({
                chosed: 3
              })
            }} style={{padding: pxToDp(10)}}>
              <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>收银系统</Text>
                <View style={{flex: 1}}>
                  <View style={{
                    width: 20,
                    height: 20,
                    marginLeft: 30
                  }}>
                    {this.state.chosed === 3 ? <Image
                        source={require("../../img/My/correct.png")}
                        style={{
                          width: pxToDp(40),
                          height: pxToDp(40),
                          marginRight: pxToDp(10)
                        }}/> :
                      <Ionicons name={'radio-button-off-outline'}
                                style={{fontSize: pxToDp(40), color: colors.fontBlack}}/>}
                  </View>
                </View>
              </View>

              <Text style={{
                fontSize: 12,
                color: '#333333',
                lineHeight: 17,
                marginLeft: pxToDp(20),
                marginRight: pxToDp(30),
                marginBottom: pxToDp(30)
              }}>
                已绑定如美团收银，客如云，哗啦啦或由总部控制的系统，如兼容建议选择此模式，但暂不支持在外送帮发起美团商户端的美团跑腿。
              </Text>

            </TouchableOpacity>

          </List>
        </ScrollView>
        <View style={{
          flexDirection: 'row',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: pxToDp(70),
        }}>

          <Button
            type={'primary'}
            onPress={() => {
            }}
            style={{
              backgroundColor: colors.main_color,
              color: colors.white,
              width: '40%',
              lineHeight: pxToDp(60),
              textAlign: 'center',
              borderRadius: pxToDp(20),
              borderWidth: pxToDp(0)
            }}>咨询客服</Button>

          <Button
            type={'primary'}
            onPress={() => {

            }}
            style={{
              backgroundColor: this.state.chosed > 0 ? colors.main_color : '#bbb',
              color: colors.white,
              width: '40%',
              marginLeft: "10%",
              lineHeight: pxToDp(60),
              textAlign: 'center',
              borderRadius: pxToDp(20),
              borderWidth: pxToDp(0)
            }}>绑定店铺</Button>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({});


export default connect(mapStateToProps, mapDispatchToProps)(BindMeituan)
