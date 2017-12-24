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
import OrderEditScene from "../scene/Order/OrderEditScene";
import OrderToInvalidScene from "../scene/Order/OrderToInvalidScene";
import StoreScene from "../scene/Store/StoreScene";
import StoreAddScene from "../scene/Store/StoreAddScene";
import DoneRemindScene from '../scene/Remind/DoneRemindScene';
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import NavigationItem from "../widget/NavigationItem";
import TakeOutScene from "../scene/Store/TakeOutScene";
import GoodsDetailScene from "../scene/Goods/GoodsDetailScene";
import OrderEditStoreScene from "../scene/Order/OrderEditStoreScene";
import OrderSearchScene from "../scene/Order/OrderSearchScene";
import VersionScene from "../scene/Mine/VersionScene";
import SelectStoreScene from "../scene/Setting/SelectStoreScene";
import OrderTodoScene from "../scene/Order/OrderTodoScene";
import OrderCallShip from "../scene/Order/OrderCallShip";
import GoodsEditScene from '../scene/Goods/GoodsEditScene';
import GoodsClassifyScene from '../scene/Goods/GoodsClassifyScene';
import GoodsBatchPriceScene from "../scene/Goods/GoodsBatchPriceScene";
import GoodsApplyRecordScene from '../scene/Goods/GoodsApplyRecordScene';



import OrderSetPackDone from "../scene/Order/OrderSetPackDone";
import OrderSetShipStart from "../scene/Order/OrderSetShipStart";
import OrderShipDetail from "../scene/Order/OrderShipDetail";
import OrderCancelShip from "../scene/Order/OrderCancelShip";

import  HelpScene from '../scene/Help/HelpScene';

const tabDef = {
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
};
const tabInit = {
  initialRouteName: 'Remind',
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  swipeEnabled: false,
  animationEnabled: false,
  lazy: true,
  tabBarOptions: {
    activeTintColor: color.theme,
    inactiveTintColor: '#666',
    style: {backgroundColor: '#ffffff'},
  },
};

class Navigator extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const {initialRouteName, screenProps, initialRouteParams} = this.props;

    let stackNavigatorConfigs = {
      navigationOptions: {
        headerStyle: {
          // backgroundColor: colors.back_color,
          // height: pxToDp(78),
          // borderColor: '#999',
          // borderBottomWidth: pxToDp(1),
          height: pxToDp(96),
          borderColor: colors.new_back,
          borderBottomWidth: pxToDp(1),
        },
        headerTitleStyle: {
          color: '#4a4a4a',
          fontSize: pxToDp(30),
          fontWeight: 'bold',
          marginHorizontal: 0,
          paddingLeft: pxToDp(24),
          borderColor: colors.new_back,
          borderLeftWidth:pxToDp(1),
        },
        headerBackTitle: null,
        headerTintColor: '#333333',
        showIcon: true,
      },
    };

    if (initialRouteName) {
      stackNavigatorConfigs = {
        ...stackNavigatorConfigs,
        initialRouteName: initialRouteName,
        initialRouteParams: initialRouteParams || {},
      }
    }

    let tabInitN;
    if (initialRouteName === 'Tab' && (initialRouteParams || {}).initTab) {
      tabInitN = {...tabInit, initialRouteName: (initialRouteParams || {}).initTab}
    } else {
      tabInitN = tabInit;
    }

    // console.log(tabInitN);

    const CustomNavigator = StackNavigator(
      {
        Tab: {screen: TabNavigator(tabDef, tabInitN)},
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
        [Config.ROUTE_ORDER_CALL_SHIP]: {screen: OrderCallShip},
        [Config.ROUTE_ORDER_PACK]: {screen: OrderSetPackDone},
        [Config.ROUTE_ORDER_START_SHIP]: {screen: OrderSetShipStart},
        [Config.ROUTE_SETTING]: {screen: SettingScene},
        [Config.ROUTE_CLOUD_PRINTER]: {screen: CloudPrinterScene},
        [Config.ROUTE_PRINTER_CONNECT]: {screen: PrinterConnectScene},
        [Config.ROUTE_ORDER_URGE]: {screen: UrgeShipScene},
        [Config.ROUTE_REFUND_AUDIT]: {screen: AuditRefundScene},
        [Config.ROUTE_ORDER_EDIT]: {screen: OrderEditScene},
        [Config.ROUTE_ORDER_TO_INVALID]: {screen: OrderToInvalidScene},
        [Config.ROUTE_ORDER_TODO]: {screen: OrderTodoScene},
        [Config.ROUTE_ORDER_STORE]: {screen: OrderEditStoreScene},
        [Config.ROUTE_ORDER_SHIP_DETAIL]: {screen: OrderShipDetail},
        [Config.ROUTE_ORDER_CANCEL_SHIP]: {screen: OrderCancelShip},
        [Config.ROUTE_STORE]: {screen: StoreScene},
        [Config.ROUTE_STORE_ADD]: {screen: StoreAddScene},
        [Config.ROUTE_DONE_REMIND]: {screen: DoneRemindScene},
        [Config.ROUTE_TAKE_OUT]: {screen: TakeOutScene},
        [Config.ROUTE_GOODS_DETAIL]: {screen: GoodsDetailScene},
        [Config.ROUTE_ORDER_SEARCH]: {screen: OrderSearchScene},
        [Config.ROUTE_VERSION]: {screen: VersionScene},
        [Config.ROUTE_SELECT_STORE]: {screen: SelectStoreScene},
        [Config.ROUTE_GOODS_EDIT]: {screen: GoodsEditScene},
        [Config.ROUTE_GOODS_CLASSIFY]: {screen: GoodsClassifyScene},
        [Config.ROUTE_GOODS_BATCH_PRICE]:{screen:GoodsBatchPriceScene},
        [Config.ROUTE_GOODS_APPLY_RECORD]:{screen:GoodsApplyRecordScene},
        [Config.ROUTE_HELP]: {screen: HelpScene},


      },
      stackNavigatorConfigs
    );
    // console.log('go with config:', stackNavigatorConfigs, " | props ->", this.props);
    // console.log("screen:", screen);
    return <CustomNavigator screenProps={screenProps}/>
  }
}

export default Navigator