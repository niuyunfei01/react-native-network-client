import React from 'react'
import {connect} from "react-redux";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import colors from "../../pubilc/styles/colors";
import OrderListScene from '../order/OrderListScene'
import PropTypes from "prop-types";
import {
  bottom_tab_control,
  bottom_tab_control_check,
  bottom_tab_goods,
  bottom_tab_goods_check,
  bottom_tab_home,
  bottom_tab_home_check,
  bottom_tab_message,
  bottom_tab_message_check,
  bottom_tab_workbench,
  bottom_tab_workbench_check
} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const Tab = createBottomTabNavigator();

class TabHome extends React.Component {
  static propTypes = {
    route: PropTypes.object,
    remind: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  tabBarOptions = () => {
    return {
      activeTintColor: colors.main_color,
      inactiveTintColor: colors.color666,
      style: {backgroundColor: colors.white},
      animationEnabled: false,
      lazy: true,
      labelStyle: {textAlign: 'center', fontSize: 12}
    }
  }

  render() {
    let remind = this.props.remind?.remindNum;
    let {route} = this.props
    const initialRouteName = route.params?.initialRouteName ?? 'Login'
    const initTab = initialRouteName === "Tab" && (route.params?.initTab || "Orders") || initialRouteName
    let {menu_list} = this.props.global;
    let {news, product, work} = menu_list;
    return (
      <Tab.Navigator
        initialRouteName={initTab}
        tabBarOptions={this.tabBarOptions()}>
        <If condition={Number(work) === 1}>
          <Tab.Screen name={'Console'}
                      getComponent={() => require("../console/ConsoleScene").default}
                      options={{
                        tabBarLabel: '工作台',
                        tabBarIcon: ({focused}) => (
                          focused ? <SvgXml xml={bottom_tab_workbench_check()} width={24} height={24}/> :
                            <SvgXml xml={bottom_tab_workbench()} width={24} height={24}/>
                        )
                      }}/>
        </If>

        <Tab.Screen
          name="Orders"
          component={OrderListScene}
          options={
            {
              tabBarLabel: "订单",
              tabBarIcon: ({focused}) => (
                focused ? <SvgXml xml={bottom_tab_control_check()} width={24} height={24}/> :
                  <SvgXml xml={bottom_tab_control()} width={24} height={24}/>
              ),

            }
          }
        />

        <If condition={Number(product) === 1}>
          <Tab.Screen
            name="Goods"
            getComponent={() => require("../product/Goods/StoreGoodsList").default}
            options={
              {
                tabBarLabel: "商品",
                tabBarIcon: ({focused}) => (
                  focused ? <SvgXml xml={bottom_tab_goods_check()} width={24} height={24}/> :
                    <SvgXml xml={bottom_tab_goods()} width={24} height={24}/>
                ),
              }
            }
          />
        </If>

        <Tab.Screen
          name="Home"
          getComponent={() => require("../notice/NoticeList").default}
          options={
            {
              tabBarBadge: remind > 99 ? '99+' : remind,
              tabBarLabel: "消息",
              tabBarIcon: ({focused}) => (
                focused ? <SvgXml xml={bottom_tab_message_check()} width={24} height={24}/> :
                  <SvgXml xml={bottom_tab_message()} width={24} height={24}/>
              )
            }
          }
        />

        <Tab.Screen
          name='MineNew'
          getComponent={() => require("../home/Mine/Mine").default}
          options={
            {
              tabBarLabel: "我的",
              tabBarIcon: ({focused}) => (
                focused ? <SvgXml xml={bottom_tab_home_check()} width={24} height={24}/> :
                  <SvgXml xml={bottom_tab_home()} width={24} height={24}/>
              )
            }
          }
        />
      </Tab.Navigator>
    )
  }
}

export default connect(mapStateToProps)(TabHome)
