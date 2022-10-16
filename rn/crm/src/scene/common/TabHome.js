import React from 'react'
import {connect} from "react-redux";
import {View} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import colors from "../../pubilc/styles/colors";
import Icon from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import OrderListScene from '../order/OrderListScene'
import PropTypes from "prop-types";

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

  render() {
    let remind = this.props.remind?.remindNum;
    let {route} = this.props
    const initialRouteName = route.params?.initialRouteName ?? 'Login'
    const initTab = initialRouteName === "Tab" && (route.params?.initTab || "Orders") || initialRouteName
    let {show_bottom_tab, menu_list} = this.props.global;
    let {news, product, work} = menu_list;
    return (
      <Tab.Navigator
        initialRouteName={initTab}
        tabBarOptions={{
          activeTintColor: colors.main_color,
          inactiveTintColor: colors.color666,
          style: {backgroundColor: colors.white, height: show_bottom_tab ? 49 : 0},
          animationEnabled: false,
          lazy: true,
          labelStyle: {fontSize: 15, opacity: show_bottom_tab ? 1 : 0}
        }}>
        <If condition={Number(work) === 1}>
          <Tab.Screen name={'Console'}
                      getComponent={() => require("../console/ConsoleScene").default}
                      options={{
                        tabBarLabel: '控制台',
                        tabBarIcon: ({focused}) => (
                          <Icon name={'grid'} size={26} color={focused ? colors.main_color : colors.colorCCC}/>)
                      }}/>
        </If>
        <Tab.Screen
          name="Orders"
          component={OrderListScene}
          options={
            {
              tabBarLabel: "工作台",
              tabBarIcon: ({focused}) => (
                <FontAwesome5 name={'file-alt'} size={22}
                              style={{opacity: show_bottom_tab ? 1 : 0}}
                              color={focused ? colors.main_color : colors.colorCCC}/>
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
                  <Icon name={"shopping-bag"}
                        style={{fontSize: 22, color: focused ? colors.main_color : colors.colorCCC}}/>
                ),
              }
            }
          />
        </If>


        <If condition={Number(news) === 1}>
          <Tab.Screen
            name="Home"
            getComponent={() => require("../notice/NoticeList").default}
            options={
              {
                tabBarBadge: remind > 99 ? '99+' : remind,
                tabBarLabel: "提醒",
                tabBarIcon: ({focused}) => (
                  <View style={{position: "relative"}}>
                    <FontAwesome5 name={'bell'} size={22}
                                  color={focused ? colors.main_color : colors.colorCCC}
                    />
                  </View>
                )
              }
            }
          />
        </If>

        {/*<Tab.Screen*/}
        {/*  name="Mine"*/}
        {/*  getComponent={() => require("../home/Mine/MineScene").default}*/}
        {/*  options={*/}
        {/*    {*/}
        {/*      tabBarLabel: "我的",*/}
        {/*      tabBarIcon: ({focused}) => (*/}
        {/*        <FontAwesome5 name={'user-cog'} size={22}*/}
        {/*                      color={focused ? colors.main_color : colors.colorCCC}*/}
        {/*        />*/}
        {/*      )*/}
        {/*    }*/}
        {/*  }*/}
        {/*/>*/}

      </Tab.Navigator>
    )
  }
}

export default connect(mapStateToProps)(TabHome)
