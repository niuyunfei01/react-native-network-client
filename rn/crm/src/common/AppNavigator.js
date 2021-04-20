import React, {Component} from "react";
//import {StackNavigator, TabBarBottom, TabNavigator} from "react-navigation";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import Config from "../config";
import color from "../widget/color";
import TabBarItem from "../widget/TabBarItem";
import MyTabBarItem from "./MyTabBarItem";
import RemindScene from "../scene/Remind/RemindScene";
import MineScene from "../scene/Mine/MineScene";
import DeliveryScene from "../scene/Delivery/DeliveryScene";
import SeetingDelivery from "../scene/Delivery/SeetingDelivery";
import BindDelivery from "../scene/Delivery/BindDelivery";
import OrderScene from "../scene/Order/OrderScene";
import UrgeShipScene from "../scene/Order/UrgeShipScene";
import LoginScene from "../scene/Login/LoginScene";
import GoodsScene from "../scene/Goods/GoodsScene";
import TabOperation from '../scene/Tab/Operation'
import WebScene from "../widget/WebScene";
import ApplyScene from "../scene/Apply/ApplyScene";
import RegisterScene from "../scene/Login/RegisterScene";
import PlatformScene from "../scene/Platform/PlatformScene";
import native from "./native";
import TestWeuiScene from "../scene/TestWeui/TestWeuiScene";
import WorkerListScene from "../scene/Worker/WorkerListScene";
import WorkerSchedule from "../scene/Worker/WorkerSchedule";
import UserScene from "../scene/User/UserScene";
import UserAddScene from "../scene/User/UserAddScene";
import ProductAutocomplete from "../scene/Order/ProductAutocomplete.android";
import SettingScene from "../scene/Setting/SettingScene";
import CloudPrinterScene from "../scene/Setting/CloudPrinterScene";
import AuditRefundScene from "../scene/Order/AuditRefundScene";
import OrderEditScene from "../scene/Order/OrderEditScene";
import OrderToInvalidScene from "../scene/Order/OrderToInvalidScene";
import StoreScene from "../scene/Store/StoreScene";
import StoreAddScene from "../scene/Store/StoreAddScene";
import StoreRate from "../scene/Store/StoreRate";
import StoreGoodsList from "../scene/Goods/StoreGoodsList";
import StoreGoodsSearch from "../scene/Goods/StoreGoodsSearch";
import StoreRule from '../scene/Store/StoreRule'
import DoneRemindScene from "../scene/Remind/DoneRemindScene";
import PlatformBind from "../scene/Login/PlatformBind"
import pxToDp from "../util/pxToDp";
import colors from "../styles/colors";
import TakeOutScene from "../scene/Store/TakeOutScene";
import StoreStatusScene from "../scene/Store/StoreStatusScene";
import GoodsDetailScene from "../scene/Goods/GoodsDetailScene";
import VersionScene from "../scene/Mine/VersionScene";
import SelectStoreScene from "../scene/Setting/SelectStoreScene";

import GoodsEditScene from "../scene/Goods/GoodsEditScene";
import GoodsClassifyScene from "../scene/Goods/GoodsClassifyScene";
import GoodsBatchPriceScene from "../scene/Goods/GoodsBatchPriceScene";
import GoodsApplyRecordScene from "../scene/Goods/GoodsApplyRecordScene";
import GoodsRelateScene from "../scene/Goods/GoodsRelateScene";
import GoodsApplyNewProductScene from "../scene/Goods/GoodsApplyNewProductScene";
import GoodsWorkNewProductScene from "../scene/Goods/GoodsWorkNewProductScene";
import GoodsManageScene from "../scene/Goods/GoodsManageScene";
import GoodsPriceDetailsScene from "../scene/Goods/GoodsPriceDetailsScene";
import GoodsAdjustScene from '../scene/Goods/GoodsAdjustScene'
import GoodsApplyPrice from '../scene/Goods/GoodsApplyPrice'
import GoodsPriceIndex from '../scene/Goods/GoodsPriceIndex'
import GoodsPriceArea from "../scene/Goods/AreaGoodsPrice";
import GoodsList from '../scene/Goods/GoodsList'
import GoodsAnalysis from '../scene/Goods/GoodsAnalysis'
import GoodsMarketExamine from "../scene/Goods/GoodsMarketExamine";
import GoodsMarketExamineHistory from "../scene/Goods/GoodsMarketExamineHistory";
// 订单相关
import OrderSearchScene from "../scene/Order/OrderSearchScene";
import OrderEditStoreScene from "../scene/Order/OrderEditStoreScene";
import OrderTodoScene from "../scene/Order/OrderTodoScene";
import OrderCallShip from "../scene/Order/OrderCallShip";
import OrderSendMoney from '../scene/Order/OrderSendMoney'
import OrderSurcharge from '../scene/Order/OrderSurcharge'
import OrderSetPackDone from "../scene/Order/OrderSetPackDone";
import OrderSetShipStart from "../scene/Order/OrderSetShipStart";
import OrderShipDetail from "../scene/Order/OrderShipDetail";
import OrderCancelShip from "../scene/Order/OrderCancelShip";
import Refund from "../scene/Order/Refund";
import OrderRefundByWeight from "../scene/Order/RefundByWeight";
import OrderTransferThird from "../scene/Order/OrderTransferThird";
import OrderScan from "../scene/Order/OrderScan";
import OrderSetReady from "../scene/Order/OrderSetReady";
import OrderPackage from '../scene/Order/OrderPackage'
import OrderCancelToEntry from "../scene/Order/OrderCancelToEntry";
import OrderExitLog from '../scene/Order/OrderExitLog'

import HelpScene from "../scene/Help/HelpScene";
import SettlementScene from "../scene/Settlement/SettlementScene";
import SettlementDetailsScene from "../scene/Settlement/SettlementDetailsScene";
import SettlementGatherScene from "../scene/Settlement/SettlementGatherScene";

import SelectWorkerScene from "../scene/Store/SelectWorkerScene";
import OperateProfitScene from "../scene/OperateProfit/OperateProfitScene";
import OperateDetailScene from "../scene/OperateProfit/OperateDetailScene";
import OperateIncomeDetailScene from "../scene/OperateProfit/OperateIncomeDetailScene";
import OperateExpendDetailScene from "../scene/OperateProfit/OperateExpendDetailScene";
import OperateOtherExpendDetailScene from "../scene/OperateProfit/OperateOtherExpendDetailScene";
import ActivityRuleScene from "../scene/Activity/ActivityRuleScene";
import ActivityEditRuleScene from "../scene/Activity/ActivityEditRuleScene";
import ActivitySelectStoreScene from "../scene/Activity/ActivitySelectStoreScene";
import ActivityManageScene from "../scene/Activity/ActivityManageScene";
import ActivityListScene from "../scene/Activity/ActivityListScene";
import ActivitySelectGoodScene from "../scene/Activity/ActivitySelectGoodScene";
import ActivitySelectClassifyScene from "../scene/Activity/ActivitySelectClassifyScene";
import JdAuditDeliveryScene from "../scene/Order/JdAuditDeliveryScene";
import GoodsScanSearchScene from "../scene/Goods/GoodsScanSearchScene";
import NewProduct from "../scene/Goods/NewProduct";

import InvoicingScene from "../scene/Invoicing/InvoicingScene";
import InvoicingGatherDetailScene from "../scene/Invoicing/InvoicingGatherDetailScene";
import InvoicingShippingDetailScene from "../scene/Invoicing/InvoicingShippingDetailScene";
import InvoicingShippingScene from "../scene/Invoicing/InvoicingShippingScene"
import SupplementWage from '../scene/User/SupplementWage'
//扫码创新
import CreateScan from "../scene/Goods/CreateScan";
import SearchGoods from "../scene/Goods/SearchGoods";
import OnlineStoreProduct from "../scene/Goods/OnlineStoreProduct";
//新产品详情
import NewProductDetail from "../scene/Goods/NewProductDetail";
import CreateApplyNewProductRemindScene from "../scene/Goods/CreateApplyNewProductRemindScene"
import SelectCity from "../scene/Store/SelectCity";
import Qualification from "../scene/Store/Qualification";
// 库存相关
import InventoryProductPutIn from '../scene/Inventory/ProductPutIn'
import InventoryProductInfo from '../scene/Inventory/ProductInfo'
import InventoryMaterialList from '../scene/Inventory/MaterialList'
import InventoryMaterialPutIn from '../scene/Inventory/MaterialPutIn'
import InventoryMaterialDetailUpdate from '../scene/Inventory/MaterialDetailUpdate'
import InventoryStandardPutIn from '../scene/Inventory/StandardPutIn'
import InventoryStandardDetailUpdate from '../scene/Inventory/StandardDetailUpdate'
import InventoryMaterialTask from '../scene/Inventory/MaterialTask'
import InventoryMaterialTaskFinish from '../scene/Inventory/MaterialTaskFinish'
import InventoryStockCheck from '../scene/Inventory/StockCheck'
import InventoryStockCheckHistory from '../scene/Inventory/StockCheckHistory'
import InventoryReportLoss from '../scene/Inventory/ReportLoss'
import InventoryDetail from '../scene/Inventory/Detail'
import InventoryHome from "../scene/Inventory/InventoryHome";

import ZtOrderPrint from "../scene/Ziti/OrderPrint";

import Cts from "../Cts";
import _ from "lodash"
import SendRedeemCoupon from "../scene/Order/_GoodCoupon/SendRedeemCoupon";
import SeparatedExpense from "../scene/SeparatedExpense/SeparatedExpense";
import SeparatedExpenseInfo from "../scene/SeparatedExpense/SeparatedExpenseInfo";
import SeparatedAccountFill from "../scene/SeparatedExpense/SeparatedAccountFill";
import BindPlatformWebView from "../scene/Login/BindPlatformWebView"
import InventoryItems from "../scene/Inventory/InventoryItems";
import GoodStoreDetailScene from "../scene/Goods/GoodStoreDetailScene";


const tabDef = (store_) => {
    let isBlx = false;
    let global = null;
    if (store_ && store_.getState()) {
        let storeState = store_.getState();
        let storeVendorId = _.get(storeState, 'global.config.vendor.id');
        if (storeVendorId && (storeVendorId == Cts.STORE_TYPE_BLX || storeVendorId == Cts.STORE_TYPE_SELF)) {
            isBlx = true;
        }
        global = storeState.global
    }
    const Tab = createBottomTabNavigator();
    return (
        <Tab.Navigator
            initialRouteName="Home"
        >
            <Tab.Screen
                name="Home"
                component={RemindScene}
                options={{
                    tabBarLabel: "提醒",
                    tabBarIcon: ({focused, tintColor}) => (
                        <MyTabBarItem
                            tintColor={tintColor}
                            focused={focused}
                            normalImage={require("../img/tabbar/tab_warn.png")}
                            selectedImage={require("../img/tabbar/tab_warn_pre.png")}
                        />
                    ),
                }}
            />
            <Tab.Screen
            name="Orders"
            component={RemindScene}
            options={{
                tabBarLabel: "订单",
                tabBarIcon: ({focused, tintColor}) => (
                    <MyTabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require("../img/tabbar/tab_list.png")}
                        selectedImage={require("../img/tabbar/tab_list_pre.png")}
                    />
                ),
            }}
        />
            <Tab.Screen
                name="Orders"
                component={RemindScene}
                options={{
                    tabBarLabel: "订单",
                    tabBarIcon: ({focused, tintColor}) => (
                        <MyTabBarItem
                            tintColor={tintColor}
                            focused={focused}
                            normalImage={require("../img/tabbar/tab_list.png")}
                            selectedImage={require("../img/tabbar/tab_list_pre.png")}
                        />
                    ),
                    tabBarOnPress: () => {
                        console.log("do tabBarOnPress");
                        native.toOrders();
                    }
                }}
            />

        </Tab.Navigator>
    )
    // let tab = {
    //
    //     Goods: {
    //         screen: createStackNavigator({ Goods: StoreGoodsList }),
    //         navigationOptions: ({navigation}) => ({
    //             tabBarLabel: "商品",
    //             tabBarIcon: ({focused, tintColor}) => (
    //                 <TabBarItem
    //                     tintColor={tintColor}
    //                     focused={focused}
    //                     normalImage={require("../img/tabbar/tab_goods.png")}
    //                     selectedImage={require("../img/tabbar/tab_goods_pre.png")}
    //                 />
    //             ),
    //             tabBarOnPress: (scene, jumpToIndex) => {
    //                 console.log("do navigateToGoods");
    //                 //const {enabled_good_mgr = true} = store_.getState().global.config;
    //                 //if (enabled_good_mgr) {
    //                 native.toGoods(global, null, navigation);
    //                 //} else {
    //                 //jumpToIndex(scene.index);
    //                 //}
    //             }
    //         })
    //     }
    // }
    //
    // if (isBlx) {
    //     tab.Operation = {
    //         screen: createStackNavigator({ Operation: TabOperation }),
    //         navigationOptions: ({navigation}) => ({
    //             tabBarLabel: "运营",
    //             tabBarIcon: ({focused, tintColor}) => (
    //                 <TabBarItem
    //                     tintColor={tintColor}
    //                     focused={focused}
    //                     normalImage={require("../img/tabbar/tab_operation.png")}
    //                     selectedImage={require("../img/tabbar/tab_operation_pre.png")}
    //                 />
    //             )
    //         })
    //     }
    // }
    //
    // tab.Mine = {
    //     screen: createStackNavigator({ Mine: MineScene }),
    //     navigationOptions: ({navigation}) => ({
    //         tabBarLabel: "我的",
    //         tabBarIcon: ({focused, tintColor}) => (
    //             <TabBarItem
    //                 tintColor={tintColor}
    //                 focused={focused}
    //                 normalImage={require("../img/tabbar/tab_me.png")}
    //                 selectedImage={require("../img/tabbar/tab_me_pre.png")}
    //             />
    //         )
    //     })
    // }
    // tab.navigationOptions = {
    //     headerShown: false,
    // };
    // return createBottomTabNavigator(tab);
};

const AppNavigator = (props) => {
    const Stack = createStackNavigator();
    const Tab = createBottomTabNavigator();
    console.log(111)
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
            >
                <Stack.Screen name="Home" component={RemindScene} />
                <Stack.Screen name="Web" component={WebScene} />
            </Stack.Navigator>
            {tabDef(props.store_)}
        </NavigationContainer>
    );
    // return NavigationContainer(createStackNavigator(
    //     {
    //         Tab: { screen: tabDef(props.store_) },
    //         Web: { screen: WebScene },
    //         //GroupPurchase: { screen: GroupPurchaseScene },
    //     },
    //     {
    //         defaultNavigationOptions: {
    //             headerBackTitle: ' ',
    //             headerTintColor: '#333333',
    //             showIcon: true,
    //         },
    //     }
    // ))
}


export default AppNavigator;



