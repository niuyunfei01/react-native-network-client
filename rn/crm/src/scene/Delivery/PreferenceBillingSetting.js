import React, {PureComponent} from "react";
import {
  InteractionManager,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Input} from "../../weui";
import {CheckBox} from 'react-native-elements'
import * as globalActions from "../../reducers/global/globalActions";
import { Button } from 'react-native-elements';
import {ToastLong} from "../../util/ToastUtils";
import Config from "../../config";

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
      checked_item: false
    };
  }

  componentDidMount() {
    this.getDeliveryConf();
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

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      this.setState({
        isRefreshing: false,
        menus: response.menus ? response.menus : []
      })

    })
  }

  _onToSetDeliveryWays () {
    const {navigation} = this.props;
    ToastLong('设置成功,即将返回上一页');
    setTimeout(() => {
      navigation.navigate(Config.ROUTE_SEETING_DELIVERY, {
        isSetting: true
      })
    }, 1000)
  }

  render() {
    const {menus, selectArr, checked_item} = this.state;
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
                        checked={item.checked !== undefined && item.checked ? true : false}
                        checkedColor={colors.main_color}
                        onPress={() => {
                          let menu = [...this.state.menus]
                          menu[idx].checked = item.checked !== undefined && menu[idx].checked ? false : true;
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
                  <Input onChangeText={(deploy_time) => this.setState({deploy_time})}
                         value={this.state.deploy_time}
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
