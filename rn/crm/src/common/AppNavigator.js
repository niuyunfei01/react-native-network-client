import React, {Component} from "react";
//import {StackNavigator, TabBarBottom, TabNavigator} from "react-navigation";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import {find} from "underscore";


const tabDef = (store_,initialRouteName,initialRouteParams) => {
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
                initialRouteName={(initialRouteName === "Tab" && (initialRouteParams || {}).initTab )?(initialRouteParams || {}).initTab : initialRouteName}
                tabBarOptions= {{
                    activeTintColor:color.theme,
                    inactiveTintColor: "#666",
                    style: {backgroundColor: "#ffffff"},
                    animationEnabled: false,
                    lazy: true,
                }}
            >
            <Tab.Screen
                name="Home"
                component={RemindScene}
                options={
                    {
                        tabBarLabel: "提醒",
                        tabBarIcon: ({focused, tintColor}) => (
                            <MyTabBarItem
                                tintColor={tintColor}
                                focused={focused}
                                normalImage={require("../img/tabbar/tab_warn.png")}
                                selectedImage={require("../img/tabbar/tab_warn_pre.png")}
                            />
                        )
                    }
                }
            />

            <Tab.Screen
                name="Orders"
                component={OrderScene}
                listeners={() => ({
                    tabPress: e => {
                        native.toOrders();
                    },
                })}
                options={
                    {
                        tabBarLabel: "订单",
                        tabBarIcon: ({focused, tintColor}) => (
                        <TabBarItem
                            tintColor={tintColor}
                            focused={focused}
                            normalImage={require("../img/tabbar/tab_list.png")}
                            selectedImage={require("../img/tabbar/tab_list_pre.png")}
                        />
                        ),

                    }
                }
            />
            <Tab.Screen
                name="Goods"
                component={StoreGoodsList}
                listeners={({ navigation, global }) => ({
                    tabPress: e => {
                        native.toGoods(global, null, navigation);
                    },
                })}
                options={
                    {
                        tabBarLabel: "商品",
                        tabBarIcon: ({focused, tintColor}) => (
                            <TabBarItem
                                tintColor={tintColor}
                                focused={focused}
                                normalImage={require("../img/tabbar/tab_goods.png")}
                                selectedImage={require("../img/tabbar/tab_goods_pre.png")}
                            />
                        ),
                    }
                }
            />
            {isBlx?
                <Tab.Screen
                    name="Operation"
                    component={RemindScene}
                    options={{
                                tabBarLabel: "运营",
                                tabBarIcon: ({focused, tintColor}) => (
                                <TabBarItem
                                tintColor={tintColor}
                                focused={focused}
                                normalImage={require("../img/tabbar/tab_operation.png")}
                                selectedImage={require("../img/tabbar/tab_operation_pre.png")}
                                />
                                )
                            }
                        }/>:null
            }
            <Tab.Screen
                name="Mine"
                component={MineScene}
                options={
                    {
                        tabBarLabel: "我的",
                        tabBarIcon: ({focused, tintColor}) => (
                            <TabBarItem
                                tintColor={tintColor}
                                focused={focused}
                                normalImage={require("../img/tabbar/tab_me.png")}
                                selectedImage={require("../img/tabbar/tab_me_pre.png")}
                            />
                        )
                    }
                }
            />
        </Tab.Navigator>
    )
};

const AppNavigator = (props) => {
    const Stack = createStackNavigator();
    const {store_,initialRouteName,initialRouteParams} = props;
    return (
        <NavigationContainer>
            <Stack.Navigator

                initialRouteName={initialRouteName}
                screenOptions={() =>({
                    headerShown:true,
                        headerStyle: {
                            height: pxToDp(96),
                            borderColor: colors.new_back,
                            borderBottomWidth: pxToDp(1)
                        },
                        headerTitleStyle: {
                            color: "#4a4a4a",
                            fontSize: pxToDp(30),
                            fontWeight: "bold",
                            marginHorizontal: 0,
                            paddingLeft: pxToDp(24),
                            borderColor: colors.new_back,
                            borderLeftWidth: pxToDp(1)
                        },
                        headerBackTitle: null,
                        headerTintColor: "#333333",
                        showIcon: true

                })}
            >
                <Stack.Screen name="Tab" options={{headerShown:false}} initialRouteName="Login" component={ () => tabDef(store_,initialRouteName,initialRouteParams)} />
                <Stack.Screen name="Order" component={OrderScene} initialParams={initialRouteParams}/>
                <Stack.Screen name="Web" options={{headerShown:true}} component={WebScene} />
                <Stack.Screen name="Home" options={{headerShown:false}} component={RemindScene} />
                <Stack.Screen  name="Login" options={{headerShown:false}} component={LoginScene} initialParams={initialRouteParams} />
                <Stack.Screen name="Register" options={{headerShown:false}} component={RegisterScene} />
                <Stack.Screen name="Platform" options={{headerShown:false}} component={PlatformScene} />
                <Stack.Screen name="Apply" options={{headerShown:false}} component={ApplyScene} />
                <Stack.Screen name="TestWeui" options={{headerShown:false}} component={TestWeuiScene} />
                <Stack.Screen name="User" options={{headerShown:false}} component={UserScene} />
                <Stack.Screen name="UserAdd" options={{headerShown:false}} component={UserAddScene} />
                <Stack.Screen name="Mine" options={{headerShown:false}} component={MineScene}/>
                <Stack.Screen name="ProductAutocomplete" component={ProductAutocomplete} />

                <Stack.Screen name={Config.ROUTE_DELIVERY_LIST} component={DeliveryScene} />
                <Stack.Screen name={Config.ROUTE_BIND_DELIVERY} component={BindDelivery} />
                <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY} component={SeetingDelivery} />
                <Stack.Screen name={Config.ROUTE_SETTING} component={SettingScene} />
                <Stack.Screen name={Config.ROUTE_CLOUD_PRINTER} component={CloudPrinterScene} />
                <Stack.Screen name={Config.ROUTE_REFUND_AUDIT} component={AuditRefundScene} />
                {/*// 订单相关*/}
                <Stack.Screen name={Config.ROUTE_ORDER_CALL_SHIP} component={OrderCallShip} />
                <Stack.Screen name={Config.ROUTE_ORDER_EDIT} component={OrderEditScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_PACK} component={OrderSetPackDone} />
                <Stack.Screen name={Config.ROUTE_ORDER_START_SHIP} component={OrderSetShipStart} />
                <Stack.Screen name={Config.ROUTE_ORDER_URGE} component={UrgeShipScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_TODO} component={OrderTodoScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_TO_INVALID} component={OrderToInvalidScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_TRANSFER_THIRD} component={OrderTransferThird} />
                <Stack.Screen name={Config.ROUTE_ORDER_STORE} component={OrderEditStoreScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_SHIP_DETAIL} component={OrderShipDetail} />
                <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_SHIP} component={OrderCancelShip} />
                <Stack.Screen name={Config.ROUTE_ORDER_SEND_MONEY} component={OrderSendMoney} />
                <Stack.Screen name={Config.ROUTE_ORDER_SURCHARGE} component={OrderSurcharge} />
                <Stack.Screen name={Config.ROUTE_ORDER_SEARCH} component={OrderSearchScene} />
                <Stack.Screen name={Config.ROUTE_ORDER_SCAN} component={OrderScan} />
                <Stack.Screen name={Config.ROUTE_ORDER_SCAN_REDAY} component={OrderSetReady} />
                <Stack.Screen name={Config.ROUTE_ORDER_REFUND_BY_WEIGHT} component={OrderRefundByWeight} />
                <Stack.Screen name={Config.ROUTE_ORDER_PACKAGE} component={OrderPackage} />
                <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_TO_ENTRY} component={OrderCancelToEntry} />
                <Stack.Screen name={Config.ROUTE_ORDER_EXIT_LOG} component={OrderExitLog} />
                <Stack.Screen name={Config.ROUTE_ORDER_GOOD_COUPON} component={SendRedeemCoupon} />

                <Stack.Screen name={Config.ROUTE_STORE} component={StoreScene} />
                <Stack.Screen name={Config.ROUTE_STORE_ADD} component={StoreAddScene} />
                <Stack.Screen name={Config.ROUTE_STORE_RATE} component={StoreRate} />
                <Stack.Screen name={Config.ROUTE_STORE_RULE} component={StoreRule} />
                <Stack.Screen name={Config.ROUTE_DONE_REMIND} component={DoneRemindScene} />
                <Stack.Screen name={Config.PLATFORM_BIND} component={PlatformBind} />
                <Stack.Screen name={Config.BIND_PLATFORM_WEB_VIEW} component={BindPlatformWebView} />
                <Stack.Screen name={Config.ROUTE_TAKE_OUT} component={TakeOutScene} />
                <Stack.Screen name={Config.ROUTE_STORE_STATUS} component={StoreStatusScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_DETAIL} component={GoodsDetailScene} />
                <Stack.Screen name={Config.ROUTE_GOOD_STORE_DETAIL} component={GoodStoreDetailScene} />
                <Stack.Screen name={Config.ROUTE_VERSION} component={VersionScene} />
                <Stack.Screen name={Config.ROUTE_SELECT_STORE} component={SelectStoreScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_CLASSIFY} component={GoodsClassifyScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_APPLY_RECORD} component={GoodsApplyRecordScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_EDIT} component={GoodsEditScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_APPLY_NEW_PRODUCT} component={GoodsApplyNewProductScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_WORK_NEW_PRODUCT} component={GoodsWorkNewProductScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_ADJUST} component={GoodsAdjustScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_APPLY_PRICE} component={GoodsApplyPrice} />
                <Stack.Screen name={Config.ROUTE_GOODS_LIST} component={GoodsList} />
                <Stack.Screen name={Config.ROUTE_GOODS_PRICE_INDEX} component={GoodsPriceIndex} />
                <Stack.Screen name={Config.ROUTE_AREA_GOODS_PRICE} component={GoodsPriceArea} />
                <Stack.Screen name={Config.ROUTE_GOODS_ANALYSIS} component={GoodsAnalysis} />
                <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE} component={GoodsMarketExamine} />
                <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE_HISTORY} component={GoodsMarketExamineHistory} />

                <Stack.Screen name={Config.ROUTE_SETTLEMENT} component={SettlementScene} />
                <Stack.Screen name={Config.ROUTE_SETTLEMENT_DETAILS} component={SettlementDetailsScene} />
                <Stack.Screen name={Config.ROUTE_SELECT_WORKER} component={SelectWorkerScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_BATCH_PRICE} component={GoodsBatchPriceScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_RELATE} component={GoodsRelateScene} />
                <Stack.Screen name={Config.ROUTE_HELP} component={HelpScene} />
                <Stack.Screen name={Config.ROUTE_OPERATE_PROFIT} component={OperateProfitScene} />
                <Stack.Screen name={Config.ROUTE_OPERATE_DETAIL} component={OperateDetailScene} />
                <Stack.Screen name={Config.ROUTE_OPERATE_INCOME_DETAIL} component={OperateIncomeDetailScene} />
                <Stack.Screen name={Config.ROUTE_OPERATE_EXPEND_DETAIL} component={OperateExpendDetailScene} />
                <Stack.Screen name={Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL} component={OperateOtherExpendDetailScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_MANAGE} component={GoodsManageScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_PRICE_DETAIL} component={GoodsPriceDetailsScene} />
                <Stack.Screen name={Config.ROUTE_SETTLEMENT_GATHER} component={SettlementGatherScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_RULE} component={ActivityRuleScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_EDIT_RULE} component={ActivityEditRuleScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_SELECT_STORE} component={ActivitySelectStoreScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_MANAGE} component={ActivityManageScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_LIST} component={ActivityListScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_SELECT_GOOD} component={ActivitySelectGoodScene} />
                <Stack.Screen name={Config.ROUTE_ACTIVITY_CLASSIFY} component={ActivitySelectClassifyScene} />
                <Stack.Screen name={Config.ROUTE_JD_AUDIT_DELIVERY} component={JdAuditDeliveryScene} />
                <Stack.Screen name={Config.ROUTE_GOODS_SCAN_SEARCH} component={GoodsScanSearchScene} />
                <Stack.Screen name={Config.ROUTE_CREATE_SCAN} component={CreateScan} />
                <Stack.Screen name={Config.ROUTE_SEARCH_GOODS} component={SearchGoods} />
                <Stack.Screen name={Config.ROUTE_ONLINE_STORE_PRODUCT} component={OnlineStoreProduct} />
                <Stack.Screen name={Config.ROUTE_NEW_PRODUCT} component={NewProduct} />
                <Stack.Screen name={Config.ROUTE_NEW_PRODUCT_DETAIL} component={NewProductDetail} />
                <Stack.Screen name={Config.ROUTE_CREATE_NEW_GOOD_REMIND} component={CreateApplyNewProductRemindScene} />
                <Stack.Screen name={Config.ROUTE_REFUND_DETAIL} component={Refund} />
                <Stack.Screen name={Config.ROUTE_INVOICING} component={InvoicingScene} />
                <Stack.Screen name={Config.ROUTE_INVOICING_GATHER_DETAIL} component={InvoicingGatherDetailScene} />
                <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_DETAIL} component={InvoicingShippingDetailScene} />
                <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_LIST} component={InvoicingShippingScene} />
                <Stack.Screen name={Config.ROUTE_STORE_GOODS_LIST} component={StoreGoodsList} />
                <Stack.Screen name={Config.ROUTE_NEW_GOODS_SEARCH} component={StoreGoodsSearch} />
                <Stack.Screen name={Config.ROUTE_PLATFORM_LIST} component={PlatformScene} />
                <Stack.Screen name={Config.ROUTE_SEP_EXPENSE} component={SeparatedExpense} />
                <Stack.Screen name={Config.ROUTE_SEP_EXPENSE_INFO} component={SeparatedExpenseInfo} />
                <Stack.Screen name={Config.ROUTE_ACCOUNT_FILL} component={SeparatedAccountFill} />

                <Stack.Screen name={Config.ROUTE_SELECT_CITY_LIST} component={SelectCity} />
                <Stack.Screen name={Config.ROUTE_SELECT_QUALIFICATION} component={Qualification} />
                <Stack.Screen name={Config.ROUTE_SUPPLEMENT_WAGE} component={SupplementWage} />
                <Stack.Screen name={Config.ROUTE_OPERATION} component={TabOperation} />
                {/*// 库存相关*/}
                <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_PUT_IN} component={InventoryProductPutIn} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_INFO} component={InventoryProductInfo} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_LIST} component={InventoryMaterialList} />
                <Stack.Screen name='InventoryHome' component={InventoryHome} />
                <Stack.Screen name='InventoryItems' component={InventoryItems} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_PUT_IN} component={InventoryMaterialPutIn} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE} component={InventoryMaterialDetailUpdate} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_PUT_IN} component={InventoryStandardPutIn} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE} component={InventoryStandardDetailUpdate} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK} component={InventoryMaterialTask} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH} component={InventoryMaterialTaskFinish} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK} component={InventoryStockCheck} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY} component={InventoryStockCheckHistory} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_REPORT_LOSS} component={InventoryReportLoss} />
                <Stack.Screen name={Config.ROUTE_INVENTORY_DETAIL} component={InventoryDetail} />
                {/*// 员工相关*/}
                <Stack.Screen name={Config.ROUTE_WORKER} component={WorkerListScene} />
                <Stack.Screen name={Config.ROUTE_WORKER_SCHEDULE} component={WorkerSchedule} />
                {/*// 自提相关*/}
                <Stack.Screen name={Config.ROUTE_ZT_ORDER_PRINT} component={ZtOrderPrint} />





            </Stack.Navigator>
        </NavigationContainer>
    );
}


export default AppNavigator;



