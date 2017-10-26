import React, {Component} from 'react';
import {NativeModules} from 'react-native';
import {addNavigationHelpers, NavigationActions, StackNavigator, TabNavigator, TabBarBottom} from 'react-navigation';

import Config from '../config';
import color from '../widget/color'
import TabBarItem from '../widget/TabBarItem'

import RemindScene from '../scene/Remind/RemindScene'
import MineScene from '../scene/Mine/MineScene';
import OrderScene from '../scene/Order/OrderScene';
import UrgeShipScene from '../scene/Order/UrgeShipScene';
import LoginScene from '../scene/Login/LoginScene'
import GoodsScene from '../scene/Goods/GoodsScene'

import WebScene from '../widget/WebScene'
import ApplyScene from "../scene/Apply/ApplyScene";
import native from "./native";
import screen from './screen'
import TestWeuiScene from "../scene/TestWeui/TestWeuiScene";
import WorkerScene from "../scene/Worker/WorkerScene";
import UserScene from "../scene/User/UserScene";
import UserAddScene from "../scene/User/UserAddScene";
import ProductAutocomplete from "../scene/Order/ProductAutocomplete";
import SettingScene from "../scene/Setting/SettingScene";
import CloudPrinterScene from "../scene/Setting/CloudPrinterScene";
import PrinterConnectScene from "../scene/Setting/PrinterConnectScene";
import AuditRefundScene from "../scene/Order/AuditRefundScene";
import StoreScene from "../scene/Store/StoreScene";
import StoreAddScene from "../scene/Store/StoreAddScene";

const Tab = TabNavigator(
  {
    Remind: {
      screen: RemindScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: '提醒',
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require('../img/tabbar/tab_warn.png')}
            selectedImage={require('../img/tabbar/tab_warn_pre.png')}
          />
        )
      }),
    },

    Orders: {
      screen: OrderScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: '订单',
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require('../img/tabbar/tab_list.png')}
            selectedImage={require('../img/tabbar/tab_list_pre.png')}
          />
        ),
        tabBarOnPress: () => {
          console.log('do tabBarOnPress');
          native.toOrders();
        }
      }),
    },

    Goods: {
      screen: GoodsScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: '商品',
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require('../img/tabbar/tab_goods.png')}
            selectedImage={require('../img/tabbar/tab_goods_pre.png')}
          />
        ),
        tabBarOnPress: () => {
          console.log('do navigateToGoods');
          native.toGoods();
        }
      }),
    },

    Mine: {
      screen: MineScene,
      // screen: StoreScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: '我的',
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require('../img/tabbar/tab_me.png')}
            selectedImage={require('../img/tabbar/tab_me_pre.png')}
          />
        )
      }),
    },
  },
  {
    initialRouteName: 'Remind',
    // initialRouteName: 'Mine',
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    lazy: true,
    tabBarOptions: {
      activeTintColor: color.theme,
      inactiveTintColor: '#99579797',
      style: {backgroundColor: '#ffffff'},
    },
  }
);

class Navigator extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const {initialRouteName, screenProps, initialRouteParams} = this.props;
    let stackNavigatorConfigs = {
      navigationOptions: {
        // headerStyle: { backgroundColor: color.theme }
        headerBackTitle: null,
        headerTintColor: '#333333',
        showIcon: true,
      },
    };

    if (initialRouteName) {
      stackNavigatorConfigs = {
        ...stackNavigatorConfigs,
        initialRouteName: initialRouteName,
        initialRouteParams: initialRouteParams || {}
      }
    }

    const CustomNavigator = StackNavigator(
      {
        Tab: {screen: Tab},
        Order: {
          screen: OrderScene,
          path: 'order/:orderId',
        },
        Web: {screen: WebScene},
        Home: {screen: RemindScene},
        Login: {
          screen: LoginScene,
          path: 'Login/:next/:nextParams'
        },
        Apply: {screen: ApplyScene},
        TestWeui: {screen: TestWeuiScene},
        Worker: {screen: WorkerScene},
        User: {screen: UserScene},
        UserAdd: {screen: UserAddScene},
        Mine: {screen: MineScene},
        ProductAutocomplete: {screen: ProductAutocomplete},
        [Config.ROUTE_SETTING]: {screen: SettingScene},
        [Config.ROUTE_CLOUD_PRINTER]: {screen: CloudPrinterScene},
        [Config.ROUTE_PRINTER_CONNECT]: {screen: PrinterConnectScene},
        [Config.ROUTE_ORDER_URGE]: {screen: UrgeShipScene},
        [Config.ROUTE_REFUND_AUDIT]: {screen: AuditRefundScene},
        [Config.ROUTE_STORE]: {screen: StoreScene},
        [Config.ROUTE_STORE_ADD]: {screen: StoreAddScene},

      },
      stackNavigatorConfigs
    );
    // console.log('go with config:', stackNavigatorConfigs, "props", this.props);
    // console.log("screen:", screen);
    return <CustomNavigator screenProps={screenProps}/>
  }
}

export default Navigator