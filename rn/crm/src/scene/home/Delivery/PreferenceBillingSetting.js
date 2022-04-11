import React, {PureComponent} from "react";
import {InteractionManager, Platform, RefreshControl, ScrollView, StyleSheet, Text, View,} from "react-native";
import colors from "../../../pubilc/styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Input} from "../../../weui";
import {Button, CheckBox} from 'react-native-elements'
import * as globalActions from "../../../reducers/global/globalActions";
import {showError, showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import HttpUtils from "../../../pubilc/util/http";

const mapStateToProps = state => {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
}
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class PreferenceBillingSetting extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: true,
      menus: [],
      selectArr: [],
      checked: false,
      checked_item: false,
      ext_store_id: this.props.route.params.ext_store_id,
      deploy_time: "0"
    };
  }

  componentDidMount() {
    this.getPreferenceShipConfig()
  }

  onHeaderRefresh() {
    this.getDeliveryConf();
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  getPreferenceShipConfig() {
    let {ext_store_id} = this.state
    let access_token = this.props.global.accessToken
    const api = `/v1/new_api/ExtStores/get_preference_ship_config/${ext_store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.setState({
        deploy_time: res && res.keep_min ? '' + res.keep_min : '0',
        checked_item: res && res.sync_all ? true : false,
        selectArr: res && res.ship_ways ? [...res.ship_ways] : []
      }, () => {
        this.getDeliveryConf();
      })
    }).catch(() => {
    })
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      let arr = [];
      if (response !== undefined && response.menus.length > 0) {
        for (let item of response.menus) {
          item.checked = false;
          if (this.state.selectArr.indexOf(item.id) > -1) {
            item.checked = true;
          }
          arr.push(item)
        }
      }
      this.setState({
        isRefreshing: false,
        menus: arr
      })

    })
  }

  _onToSetDeliveryWays() {
    const {navigation} = this.props;
    let access_token = this.props.global.accessToken
    let {selectArr, checked_item, ext_store_id, deploy_time} = this.state
    // if (selectArr && selectArr.length === 0) {
    //   showError("需要勾选配送方式");
    //   this.setState({isRefreshing: false});
    //   return;
    // }
    if (deploy_time && deploy_time == 0) {
      showError("请填写发单时间");
      this.setState({isRefreshing: false});
      return;
    }
    const api = `/v1/new_api/ExtStores/set_preference_ship_config/${ext_store_id}`
    HttpUtils.post.bind(this.props)(api, {
      access_token: access_token,
      ship_ways: selectArr,
      keep_min: deploy_time,
      sync_all: checked_item ? 1 : 0
    }).then(res => {
      showSuccess('设置成功,即将返回上一页')
      setTimeout(() => {
        navigation.navigate(Config.ROUTE_SEETING_DELIVERY, {
          isSetting: true
        })
      }, 1000)
    }).catch(() => {
      ToastLong('设置失败请重试！')
    })
  }

  render() {
    const {menus, selectArr, checked_item, deploy_time} = this.state;
    return (
        <View style={{flex: 1}}>
          <ScrollView style={styles.container}
                      refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={() => this.onHeaderRefresh()}
                            tintColor='gray'
                        />
                      }
                      automaticallyAdjustContentInsets={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
          >

            <For index="idx" each='item' of={menus}>
              <Cells style={{
                marginLeft: "2%",
                marginRight: "2%",
                marginTop: 5,
                borderRadius: pxToDp(20),
                borderColor: colors.white
              }}>
                <Cell customStyle={{height: pxToDp(100), justifyContent: "center"}}>
                  <CellBody>
                    <Text>{item.name}</Text>
                  </CellBody>
                  <CellFooter>
                    <CheckBox
                        checked={item.checked}
                        checkedColor={colors.main_color}
                        onPress={() => {
                          let menu = [...this.state.menus]
                          menu[idx].checked = menu[idx].checked ? false : true;
                          this.setState({
                            menus: menu
                          })
                          if (menu[idx].checked) {
                            selectArr.push(item.id)
                          } else {
                            selectArr.splice(selectArr.findIndex(index => Number(index) == item.id), 1)
                          }
                        }}
                    />
                  </CellFooter>
                </Cell>
              </Cells>
            </For>
            <View style={{marginVertical: pxToDp(5)}}></View>
            <CellsTitle style={styles.cell_title}><Text style={{
              fontSize: pxToDp(22),
              color: colors.warn_color
            }}>优先发起勾选的配送，超过发单时间后，按自动发单规则呼叫配送</Text></CellsTitle>
            <Cells style={{
              marginLeft: "2%",
              marginRight: "2%",
              marginBottom: "2%",
              marginTop: 5,
              borderColor: colors.white,
              borderRadius: pxToDp(20)
            }}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  发单时间
                </CellBody>
                <CellFooter>
                  <Input onChangeText={(deploy_time) => {
                    this.setState({deploy_time})
                  }}
                         value={deploy_time}
                         style={Platform.OS === 'ios' ? [styles.cell_inputs] : [styles.cell_input]}
                         placeholder=""
                         underlineColorAndroid='transparent'
                  />
                  <Text>分钟</Text>
                </CellFooter>
              </Cell>
            </Cells>

            <Cells style={{
              marginLeft: "2%",
              marginRight: "2%",
              marginTop: 5,
              borderRadius: pxToDp(20),
              borderColor: colors.white
            }}>
              <Cell customStyle={{height: pxToDp(100), justifyContent: "center"}}>
                <CellBody>
                  将发单偏好应用到所有的外卖店铺
                </CellBody>
                <CellFooter>
                  <CheckBox
                      checked={checked_item}
                      checkedColor={colors.main_color}
                      onPress={() => {
                        this.setState({
                          checked_item: !checked_item
                        })
                      }}
                  />
                </CellFooter>
              </Cell>
            </Cells>

          </ScrollView>
          <View style={{backgroundColor: colors.white, padding: pxToDp(20)}}>
            <Button title={'保存'}
                    onPress={() => {
                      this._onToSetDeliveryWays()
                    }}
                    buttonStyle={{
                      width: '99%',
                      backgroundColor: colors.main_color,
                    }}

                    titleStyle={{
                      color: colors.white,
                      fontSize: 16
                    }}
            />
          </View>
        </View>

    );
  }
}

const
    styles = StyleSheet.create({
      container: {
        backgroundColor: colors.f7
      },
      cell_title: {
        marginBottom: pxToDp(10),
        fontSize: pxToDp(26),
        color: colors.color999
      },
      cell_row: {
        height: pxToDp(90),
        justifyContent: "center"
      },
      cell_input: {
        fontSize: pxToDp(30),
        height: pxToDp(70),
        borderWidth: pxToDp(1),
        width: pxToDp(120),
        paddingTop: pxToDp(13),
        marginLeft: pxToDp(10),
        marginRight: pxToDp(10),
      },
      cell_inputs: {
        textAlign: 'center',
        fontSize: pxToDp(30),
        height: pxToDp(60),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        width: pxToDp(120),
        marginLeft: pxToDp(10),
        marginRight: pxToDp(10),
      },
    });

export default connect(mapStateToProps, mapDispatchToProps)(PreferenceBillingSetting);
