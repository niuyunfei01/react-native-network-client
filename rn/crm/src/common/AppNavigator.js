import React, {Component} from "react";
import {StackNavigator, TabBarBottom, TabNavigator} from "react-navigation";

import Config from "../config";
import color from "../widget/color";
import TabBarItem from "../widget/TabBarItem";
import MyTabBarItem from "./MyTabBarItem";
import RemindScene from "../scene/Remind/RemindScene";
import MineScene from "../scene/Mine/MineScene";
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

import ZtOrderPrint from "../scene/Ziti/OrderPrint";

import Cts from "../Cts";
import _ from "lodash"
import SendRedeemCoupon from "../scene/Order/_GoodCoupon/SendRedeemCoupon";
import SeparatedExpense from "../scene/SeparatedExpense/SeparatedExpense";
import SeparatedExpenseInfo from "../scene/SeparatedExpense/SeparatedExpenseInfo";
import SeparatedAccountFill from "../scene/SeparatedExpense/SeparatedAccountFill";

const tabDef = function (store_) {
  let isBlx = false;
  if (store_ && store_.getState()) {
    let storeState = store_.getState();
    let storeVendorId = _.get(storeState, 'global.config.vendor.id');
    if (storeVendorId && (storeVendorId == Cts.STORE_TYPE_BLX || storeVendorId == Cts.STORE_TYPE_SELF)) {
      isBlx = true;
    }
  }
  let tab = {
    Remind: {
      screen: RemindScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: "提醒",
        tabBarIcon: ({focused, tintColor}) => (
          <MyTabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require("../img/tabbar/tab_warn.png")}
            selectedImage={require("../img/tabbar/tab_warn_pre.png")}
          />
        )
      })
    },

    Orders: {
      screen: OrderScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: "订单",
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
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
      })
    },

    Goods: {
      screen: GoodsScene,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: "商品",
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require("../img/tabbar/tab_goods.png")}
            selectedImage={require("../img/tabbar/tab_goods_pre.png")}
          />
        ),
        tabBarOnPress: (scene, jumpToIndex) => {
          console.log("do navigateToGoods");
          //const {enabled_good_mgr = true} = store_.getState().global.config;
          //if (enabled_good_mgr) {
          native.toGoods();
          //} else {
          //jumpToIndex(scene.index);
          //}
        }
      })
    }
  }

  if (isBlx) {
    tab.Operation = {
      screen: TabOperation,
      navigationOptions: ({navigation}) => ({
        tabBarLabel: "运营",
        tabBarIcon: ({focused, tintColor}) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage={require("../img/tabbar/tab_operation.png")}
            selectedImage={require("../img/tabbar/tab_operation_pre.png")}
          />
        )
      })
    }
  }

  tab.Mine = {
    screen: MineScene,
    navigationOptions: ({navigation}) => ({
      tabBarLabel: "我的",
      tabBarIcon: ({focused, tintColor}) => (
        <TabBarItem
          tintColor={tintColor}
          focused={focused}
          normalImage={require("../img/tabbar/tab_me.png")}
          selectedImage={require("../img/tabbar/tab_me_pre.png")}
        />
      )
    })
  }

  return tab
};

const tabInit = {
  initialRouteName: "Remind",
  tabBarComponent: TabBarBottom,
  tabBarPosition: "bottom",
  swipeEnabled: false,
  animationEnabled: false,
  lazy: true,
  tabBarOptions: {
    activeTintColor: color.theme,
    inactiveTintColor: "#666",
    style: {backgroundColor: "#ffffff"}
  }
};

class Navigator extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    console.log('app navigation', this.props)
    const {initialRouteName, screenProps, initialRouteParams, store_} = this.props;

    let stackNavigatorConfigs = {
      navigationOptions: {
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
      }
    };

    if (initialRouteName) {
      stackNavigatorConfigs = {
        ...stackNavigatorConfigs,
        initialRouteName: initialRouteName,
        initialRouteParams: initialRouteParams || {}
      };
    }

    let tabInitN;
    if (initialRouteName === "Tab" && (initialRouteParams || {}).initTab) {
      tabInitN = {
        ...tabInit,
        initialRouteName: (initialRouteParams || {}).initTab
      };
    } else {
      tabInitN = tabInit;
    }

    // console.log(tabInitN);

    const CustomNavigator = StackNavigator(
      {
        Tab: {screen: TabNavigator(tabDef(store_), tabInitN)},
        Order: {screen: OrderScene, path: "order/:orderId"},
        Web: {screen: WebScene},
        Home: {screen: RemindScene},
        Login: {screen: LoginScene, path: "Login/:next/:nextParams"},
        Register: {screen: RegisterScene},
        Platform: {screen: PlatformScene},
        Apply: {screen: ApplyScene},
        TestWeui: {screen: TestWeuiScene},
        User: {screen: UserScene},
        UserAdd: {screen: UserAddScene},
        Mine: {screen: MineScene},
        ProductAutocomplete: {screen: ProductAutocomplete},

        [Config.ROUTE_SETTING]: {screen: SettingScene},
        [Config.ROUTE_CLOUD_PRINTER]: {screen: CloudPrinterScene},
        [Config.ROUTE_REFUND_AUDIT]: {screen: AuditRefundScene},
        // 订单相关
        [Config.ROUTE_ORDER_CALL_SHIP]: {screen: OrderCallShip},
        [Config.ROUTE_ORDER_EDIT]: {screen: OrderEditScene},
        [Config.ROUTE_ORDER_PACK]: {screen: OrderSetPackDone},
        [Config.ROUTE_ORDER_START_SHIP]: {screen: OrderSetShipStart},
        [Config.ROUTE_ORDER_URGE]: {screen: UrgeShipScene},
        [Config.ROUTE_ORDER_TODO]: {screen: OrderTodoScene},
        [Config.ROUTE_ORDER_TO_INVALID]: {screen: OrderToInvalidScene},
        [Config.ROUTE_ORDER_TRANSFER_THIRD]: {screen: OrderTransferThird},
        [Config.ROUTE_ORDER_STORE]: {screen: OrderEditStoreScene},
        [Config.ROUTE_ORDER_SHIP_DETAIL]: {screen: OrderShipDetail},
        [Config.ROUTE_ORDER_CANCEL_SHIP]: {screen: OrderCancelShip},
        [Config.ROUTE_ORDER_SEND_MONEY]: {screen: OrderSendMoney},
        [Config.ROUTE_ORDER_SURCHARGE]: {screen: OrderSurcharge},
        [Config.ROUTE_ORDER_SEARCH]: {screen: OrderSearchScene},
        [Config.ROUTE_ORDER_SCAN]: {screen: OrderScan},
        [Config.ROUTE_ORDER_SCAN_REDAY]: {screen: OrderSetReady},
        [Config.ROUTE_ORDER_REFUND_BY_WEIGHT]:{screen:OrderRefundByWeight},
        [Config.ROUTE_ORDER_PACKAGE]: {screen: OrderPackage},
        [Config.ROUTE_ORDER_CANCEL_TO_ENTRY]: {screen: OrderCancelToEntry},
        [Config.ROUTE_ORDER_EXIT_LOG]: {screen: OrderExitLog},
        [Config.ROUTE_ORDER_GOOD_COUPON]: {screen: SendRedeemCoupon},

        [Config.ROUTE_STORE]: {screen: StoreScene},
        [Config.ROUTE_STORE_ADD]: {screen: StoreAddScene},
        [Config.ROUTE_STORE_RATE]: {screen: StoreRate},
        [Config.ROUTE_STORE_RULE]: {screen: StoreRule},
        [Config.ROUTE_DONE_REMIND]: {screen: DoneRemindScene},
        [Config.PLATFORM_BIND]: {screen: PlatformBind},
        [Config.ROUTE_TAKE_OUT]: {screen: TakeOutScene},
        [Config.ROUTE_STORE_STATUS]: {screen: StoreStatusScene},
        [Config.ROUTE_GOODS_DETAIL]: {screen: GoodsDetailScene},
        [Config.ROUTE_VERSION]: {screen: VersionScene},
        [Config.ROUTE_SELECT_STORE]: {screen: SelectStoreScene},
        [Config.ROUTE_GOODS_CLASSIFY]: {screen: GoodsClassifyScene},
        [Config.ROUTE_GOODS_APPLY_RECORD]: {screen: GoodsApplyRecordScene},
        [Config.ROUTE_GOODS_EDIT]: {screen: GoodsEditScene},
        [Config.ROUTE_GOODS_APPLY_NEW_PRODUCT]: {screen: GoodsApplyNewProductScene},
        [Config.ROUTE_GOODS_WORK_NEW_PRODUCT]: {screen: GoodsWorkNewProductScene},
        [Config.ROUTE_GOODS_ADJUST]: {screen: GoodsAdjustScene},
        [Config.ROUTE_GOODS_APPLY_PRICE]: {screen: GoodsApplyPrice},
        [Config.ROUTE_GOODS_LIST]: {screen: GoodsList},
        [Config.ROUTE_GOODS_PRICE_INDEX]: {screen: GoodsPriceIndex},
        [Config.ROUTE_AREA_GOODS_PRICE]: {screen: GoodsPriceArea},
        [Config.ROUTE_GOODS_ANALYSIS]: {screen: GoodsAnalysis},
        [Config.ROUTE_GOODS_MARKET_EXAMINE]: {screen: GoodsMarketExamine},
        [Config.ROUTE_GOODS_MARKET_EXAMINE_HISTORY]: {screen: GoodsMarketExamineHistory},

        [Config.ROUTE_SETTLEMENT]: {screen: SettlementScene},
        [Config.ROUTE_SETTLEMENT_DETAILS]: {screen: SettlementDetailsScene},
        [Config.ROUTE_SELECT_WORKER]: {screen: SelectWorkerScene},
        [Config.ROUTE_GOODS_BATCH_PRICE]: {screen: GoodsBatchPriceScene},
        [Config.ROUTE_GOODS_RELATE]: {screen: GoodsRelateScene},
        [Config.ROUTE_HELP]: {screen: HelpScene},
        [Config.ROUTE_OPERATE_PROFIT]: {screen: OperateProfitScene},
        [Config.ROUTE_OPERATE_DETAIL]: {screen: OperateDetailScene},
        [Config.ROUTE_OPERATE_INCOME_DETAIL]: {screen: OperateIncomeDetailScene},
        [Config.ROUTE_OPERATE_EXPEND_DETAIL]: {screen: OperateExpendDetailScene},
        [Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL]: {screen: OperateOtherExpendDetailScene},
        [Config.ROUTE_GOODS_MANAGE]: {screen: GoodsManageScene},
        [Config.ROUTE_GOODS_PRICE_DETAIL]: {screen: GoodsPriceDetailsScene},
        [Config.ROUTE_SETTLEMENT_GATHER]: {screen: SettlementGatherScene},
        [Config.ROUTE_ACTIVITY_RULE]: {screen: ActivityRuleScene},
        [Config.ROUTE_ACTIVITY_EDIT_RULE]: {screen: ActivityEditRuleScene},
        [Config.ROUTE_ACTIVITY_SELECT_STORE]: {screen: ActivitySelectStoreScene},
        [Config.ROUTE_ACTIVITY_MANAGE]: {screen: ActivityManageScene},
        [Config.ROUTE_ACTIVITY_LIST]: {screen: ActivityListScene},
        [Config.ROUTE_ACTIVITY_SELECT_GOOD]: {screen: ActivitySelectGoodScene},
        [Config.ROUTE_ACTIVITY_CLASSIFY]: {screen: ActivitySelectClassifyScene},
        [Config.ROUTE_JD_AUDIT_DELIVERY]: {screen: JdAuditDeliveryScene},
        [Config.ROUTE_GOODS_SCAN_SEARCH]: {screen: GoodsScanSearchScene},
        [Config.ROUTE_CREATE_SCAN]: {screen: CreateScan},
        [Config.ROUTE_SEARCH_GOODS]: {screen: SearchGoods},
        [Config.ROUTE_ONLINE_STORE_PRODUCT]: {screen: OnlineStoreProduct},
        [Config.ROUTE_NEW_PRODUCT]: {screen: NewProduct},
        [Config.ROUTE_NEW_PRODUCT_DETAIL]: {screen: NewProductDetail},
        [Config.ROUTE_CREATE_NEW_GOOD_REMIND]: {screen: CreateApplyNewProductRemindScene},
        [Config.ROUTE_REFUND_DETAIL]: {screen: Refund},
        [Config.ROUTE_INVOICING]: {screen: InvoicingScene},
        [Config.ROUTE_INVOICING_GATHER_DETAIL]: {screen: InvoicingGatherDetailScene},
        [Config.ROUTE_INVOICING_SHIPPING_DETAIL]: {screen: InvoicingShippingDetailScene},
        [Config.ROUTE_INVOICING_SHIPPING_LIST]: {screen: InvoicingShippingScene},

        [Config.ROUTE_SEP_EXPENSE]: {screen: SeparatedExpense},
          [Config.ROUTE_SEP_EXPENSE_INFO]: {screen: SeparatedExpenseInfo
          },
        [Config.ROUTE_ACCOUNT_FILL]: {screen: SeparatedAccountFill},

        [Config.ROUTE_SELECT_CITY_LIST]: {screen: SelectCity},
        [Config.ROUTE_SELECT_QUALIFICATION]: {screen: Qualification},
        [Config.ROUTE_SUPPLEMENT_WAGE]: {screen: SupplementWage},
        [Config.ROUTE_OPERATION]: {screen: TabOperation},
        // 库存相关
        [Config.ROUTE_INVENTORY_PRODUCT_PUT_IN]: {screen: InventoryProductPutIn},
        [Config.ROUTE_INVENTORY_PRODUCT_INFO]: {screen: InventoryProductInfo},
        [Config.ROUTE_INVENTORY_MATERIAL_LIST]: {screen: InventoryMaterialList},
        [Config.ROUTE_INVENTORY_MATERIAL_PUT_IN]: {screen: InventoryMaterialPutIn},
        [Config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE]: {screen: InventoryMaterialDetailUpdate},
        [Config.ROUTE_INVENTORY_STANDARD_PUT_IN]: {screen: InventoryStandardPutIn},
        [Config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE]: {screen: InventoryStandardDetailUpdate},
        [Config.ROUTE_INVENTORY_MATERIAL_TASK]: {screen: InventoryMaterialTask},
        [Config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH]: {screen: InventoryMaterialTaskFinish},
        [Config.ROUTE_INVENTORY_STOCK_CHECK]: {screen: InventoryStockCheck},
        [Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY]: {screen: InventoryStockCheckHistory},
        [Config.ROUTE_INVENTORY_REPORT_LOSS]: {screen: InventoryReportLoss},
        [Config.ROUTE_INVENTORY_DETAIL]: {screen: InventoryDetail},
        // 员工相关
        [Config.ROUTE_WORKER]: {screen: WorkerListScene},
        [Config.ROUTE_WORKER_SCHEDULE]: {screen: WorkerSchedule},
        // 自提相关
        [Config.ROUTE_ZT_ORDER_PRINT]: {screen: ZtOrderPrint}
      },
      stackNavigatorConfigs
    );
    return <CustomNavigator screenProps={screenProps}/>;
  }
}

export default Navigator;
