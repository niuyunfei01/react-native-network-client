import React, {useRef} from "react";
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Config from "../config";
import RemindScene from "../scene/Remind/RemindScene";
import MineScene from "../scene/Mine/MineScene";
import DeliveryScene from "../scene/Delivery/DeliveryScene";
import SeetingDelivery from "../scene/Delivery/SeetingDelivery";
import SeetingDeliveryInfo from "../scene/Delivery/SeetingDeliveryInfo";
import BindDelivery from "../scene/Delivery/BindDelivery";
import ApplyDelivery from "../scene/Delivery/ApplyDelivery";
import OrderScene from "../scene/Order/OrderScene";
import UrgeShipScene from "../scene/Order/UrgeShipScene";
import LoginScene from "../scene/Login/LoginScene";
import GoodsSoldoutScene from "../scene/Goods/GoodsSoldoutScene";
import TabOperation from '../scene/Tab/Operation'
import WebScene from "../widget/WebScene";
import ApplyScene from "../scene/Apply/ApplyScene";
import RegisterScene from "../scene/Login/RegisterScene";
import PlatformScene from "../scene/Platform/PlatformScene";
import native from "./native";
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
import StoreGoodsSearch from "../scene/Goods/StoreGoodsSearch";
import StoreRule from '../scene/Store/StoreRule'
import DoneRemindScene from "../scene/Remind/DoneRemindScene";
import PlatformBind from "../scene/Login/PlatformBind"
import EbBindScene from "../scene/Platform/EbBindScene"
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
import Complain from '../scene/Order/_OrderScene/Complain';
import OrderSettingScene from "../scene/Order/OrderSettingPack";

import HelpScene from "../scene/Help/HelpScene";
import SettlementScene from "../scene/Settlement/SettlementScene";
import DistributionanalysisScene from '../scene/Setting/DistributionanalysisScene'
import SettlementDetailsScene from "../scene/Settlement/SettlementDetailsScene";
import SettlementGatherScene from "../scene/Settlement/SettlementGatherScene";

import SelectWorkerScene from "../scene/Store/SelectWorkerScene";
import OperateProfitScene from "../scene/OperateProfit/OperateProfitScene";
import OperateDetailScene from "../scene/OperateProfit/OperateDetailScene";
import OperateIncomeDetailScene from "../scene/OperateProfit/OperateIncomeDetailScene";
import OperateExpendDetailScene from "../scene/OperateProfit/OperateExpendDetailScene";
import OperateOtherExpendDetailScene from "../scene/OperateProfit/OperateOtherExpendDetailScene";
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

import SendRedeemCoupon from "../scene/Order/_GoodCoupon/SendRedeemCoupon";
import SeparatedExpense from "../scene/SeparatedExpense/SeparatedExpense";
import SeparatedExpenseInfo from "../scene/SeparatedExpense/SeparatedExpenseInfo";
import SeparatedAccountFill from "../scene/SeparatedExpense/SeparatedAccountFill";
import InventoryItems from "../scene/Inventory/InventoryItems";
import GoodStoreDetailScene from "../scene/Goods/GoodStoreDetailScene";
import TabHome from "../scene/TabHome";
import OrderQueryResultScene from "../scene/Order/OrderQueryResultScene";
import BluePrinterSettings from "../scene/Setting/BluePrinterSettings";
import PrinterSetting from "../scene/Setting/PrinterSetting";
import InfromSetting from "../scene/Setting/InfromSetting";
import PushSetting from "../scene/Setting/PushSetting";
import MsgVoiceScene from "../scene/Setting/MsgVoiceScene";
import GuideScene from "../scene/Setting/GuideScene";
import DiyPrinter from "../scene/Setting/DiyPrinter";
import ReceiptScene from "../scene/Setting/ReceiptScene";
import PrinterRemark from "../scene/Setting/PrinterRemark";
import {navigationRef} from '../RootNavigation';
import INItSearchShop from "../Components/SearchShop/SearchShop";

import MapShop from "../Components/SearchShop/ShopInMap";


import DeliveryList from "../scene/Delivery/DeliveryList";
import DeliveryInfo from "../scene/Delivery/DeliveryInfo";


import BindMeituan from "../scene/Platform/BindMeituan"

const AppNavigator = (props) => {
  const Stack = createStackNavigator();
  const {initialRouteName, initialRouteParams} = props;

  const routeNameRef = useRef();

  initialRouteParams.initialRouteName = initialRouteName

  return (
    <NavigationContainer ref={navigationRef}
                         onReady={() =>
                           (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
                         }
                         onStateChange={async () => {
                           const previousRouteName = routeNameRef.current;
                           const currentRouteName = navigationRef.current.getCurrentRoute().name;

                           if (previousRouteName !== currentRouteName) {
                             await native.reportRoute(currentRouteName);
                           }
                           // Save the current route name for later comparison
                           routeNameRef.current = currentRouteName;
                         }}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={() => ({
          headerShown: true,
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
          headerTruncatedBackTitle: null,
          headerTintColor: "#333333",
          showIcon: true

        })}>
        <Stack.Screen name="Tab" options={{headerShown: false}} initialParams={initialRouteParams} component={TabHome}/>
        <Stack.Screen name="Order" component={OrderScene} initialParams={initialRouteParams}/>
        <Stack.Screen name="Web" options={{headerShown: true}} component={WebScene}/>
        <Stack.Screen name="Home" options={{headerShown: false}} component={RemindScene}/>
        <Stack.Screen name="Login" options={{headerShown: false}} component={LoginScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name="Register" options={{headerTitle: '我要注册'}} component={RegisterScene}/>
        <Stack.Screen name="Platform" options={{headerShown: false}} component={PlatformScene}/>
        <Stack.Screen name="Apply" options={{headerTitle: '注册门店信息'}} component={ApplyScene}/>
        <Stack.Screen name="User" options={{headerShown: true}} component={UserScene}/>
        <Stack.Screen name="UserAdd" options={{headerShown: true}} component={UserAddScene}/>
        <Stack.Screen name="Mine" options={{headerShown: false}} component={MineScene}/>
        <Stack.Screen name="ProductAutocomplete" component={ProductAutocomplete}/>

        {/*<Stack.Screen name={Config.ROUTE_DELIVERY_LIST} options={{headerTitle: '配送设置'}} component={DeliveryScene}/>*/}
        <Stack.Screen name={Config.ROUTE_DELIVERY_LIST} options={{headerTitle: '配送平台管理'}} component={DeliveryList}/>
        <Stack.Screen name={Config.ROUTE_DELIVERY_INFO} options={{headerTitle: '配送平台信息'}} component={DeliveryInfo}/>
        <Stack.Screen name={Config.ROUTE_BIND_DELIVERY} options={{headerTitle: '绑定配送信息'}} component={BindDelivery}/>
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY} options={{headerTitle: '店铺信息'}}
                      component={SeetingDelivery}/>
        <Stack.Screen name={Config.ROUTE_APPLY_DELIVERY} options={{headerTitle: '开通配送'}}
                      component={ApplyDelivery}/>
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY_INFO} options={{headerTitle: '设置配送方式'}}
                      component={SeetingDeliveryInfo}/>
        <Stack.Screen name={Config.ROUTE_SETTING} options={{headerTitle: '设置'}} component={SettingScene}/>
        <Stack.Screen name={Config.ROUTE_CLOUD_PRINTER} options={{headerTitle: '云打印机'}} component={CloudPrinterScene}/>
        <Stack.Screen name={Config.ROUTE_PRINTER_CONNECT} options={{headerTitle: '添加蓝牙打印机'}}
                      component={BluePrinterSettings}/>
        <Stack.Screen name={Config.ROUTE_PRINTERS} options={{headerTitle: '打印设置'}} component={PrinterSetting}/>
        <Stack.Screen name={Config.ROUTE_INFORM} options={{headerTitle: '消息与铃声'}} component={InfromSetting}/>
        <Stack.Screen name={Config.ROUTE_PUSH} options={{headerTitle: '推送通知'}} component={PushSetting}/>
        <Stack.Screen name={Config.ROUTE_MSG_VOICE} options={{headerTitle: '消息铃声检测'}} component={MsgVoiceScene}/>
        <Stack.Screen name={Config.ROUTE_GUIDE} options={{headerTitle: '设置提醒教程'}} component={GuideScene}/>
        <Stack.Screen name={Config.DIY_PRINTER} options={{headerTitle: '小票设置'}} component={DiyPrinter}/>
        <Stack.Screen name={Config.ROUTE_RECEIPT} options={{headerTitle: '小票'}} component={ReceiptScene}/>
        <Stack.Screen name={Config.ROUTE_REMARK} options={{headerTitle: '自定义备注'}} component={PrinterRemark}/>
        <Stack.Screen name={Config.ROUTE_REFUND_AUDIT} options={{headerTitle: '退单详情'}} component={AuditRefundScene}/>
        {/*// 订单相关*/}
        <Stack.Screen name={Config.ROUTE_ORDER_CALL_SHIP} options={{headerTitle: '发配送'}} component={OrderCallShip}/>
        <Stack.Screen name={Config.ROUTE_ORDER_EDIT} options={{headerTitle: '修改订单信息'}} component={OrderEditScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SETTING} options={{headerTitle: '创建订单'}} component={OrderSettingScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_PACK} options={{headerTitle: '设置打包完成'}} component={OrderSetPackDone}/>
        <Stack.Screen name={Config.ROUTE_ORDER_START_SHIP} options={{headerTitle: '出发提醒'}}
                      component={OrderSetShipStart}/>
        <Stack.Screen name={Config.ROUTE_ORDER_URGE} options={{headerTitle: '催单'}} component={UrgeShipScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TODO} options={{headerTitle: '添加稍后处理事项'}} component={OrderTodoScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TO_INVALID} options={{headerTitle: '置为无效'}}
                      component={OrderToInvalidScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TRANSFER_THIRD} options={{headerTitle: '发第三方配送'}}
                      component={OrderTransferThird}/>
        <Stack.Screen name={Config.ROUTE_ORDER_STORE} options={{headerTitle: '修改店铺'}} component={OrderEditStoreScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SHIP_DETAIL} options={{headerTitle: '配送详情'}}
                      component={OrderShipDetail}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_SHIP} options={{headerTitle: '撤回呼叫'}}
                      component={OrderCancelShip}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SEND_MONEY} options={{headerTitle: '发红包'}} component={OrderSendMoney}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SURCHARGE} options={{headerTitle: '订单补偿'}} component={OrderSurcharge}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH} options={{headerTitle: '订单搜索'}} component={OrderSearchScene}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN} options={{headerTitle: '订单过机'}} component={OrderScan}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN_REDAY} options={{headerTitle: '扫码打包完成'}} component={OrderSetReady}/>
        <Stack.Screen name={Config.ROUTE_ORDER_REFUND_BY_WEIGHT} options={{headerTitle: '按重退款'}}
                      component={OrderRefundByWeight}/>
        <Stack.Screen name={Config.ROUTE_ORDER_PACKAGE} options={{headerTitle: '拆单详情'}} component={OrderPackage}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_TO_ENTRY} options={{headerTitle: '退单商品入库'}}
                      component={OrderCancelToEntry}/>
        <Stack.Screen name={Config.ROUTE_ORDER_EXIT_LOG} options={{headerTitle: '订单出库详情'}} component={OrderExitLog}/>
        <Stack.Screen name={Config.ROUTE_COMPLAIN} options={{headerTitle: '投诉信息'}} component={Complain}/>
        <Stack.Screen name={Config.ROUTE_ORDER_GOOD_COUPON} options={{headerTitle: '发送兑换码'}}
                      component={SendRedeemCoupon}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH_RESULT} options={{headerTitle: '订单搜索'}}
                      component={OrderQueryResultScene}/>
        <Stack.Screen name={Config.ROUTE_STORE} options={{headerTitle: '店铺管理'}} component={StoreScene}/>
        <Stack.Screen name={Config.ROUTE_STORE_ADD} component={StoreAddScene} initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_STORE_RATE} options={{headerTitle: '店铺评分'}} component={StoreRate}/>
        <Stack.Screen name={Config.ROUTE_STORE_RULE} options={{headerTitle: '规则处理'}} component={StoreRule}/>
        <Stack.Screen name={Config.ROUTE_DONE_REMIND} component={DoneRemindScene}/>
        <Stack.Screen name={Config.PLATFORM_BIND} options={{headerTitle: '绑定平台信息'}} component={PlatformBind}/>
        <Stack.Screen name={Config.ROUTE_EBBIND} options={{headerTitle: '饿了么零售'}} component={EbBindScene}/>
        <Stack.Screen name={Config.ROUTE_TAKE_OUT} options={{headerTitle: '外卖平台列表'}} component={TakeOutScene}/>
        <Stack.Screen name={Config.ROUTE_STORE_STATUS} options={{headerTitle: '店铺信息'}} component={StoreStatusScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_DETAIL} options={{headerTitle: '商品详情'}} component={GoodsDetailScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOOD_STORE_DETAIL} options={{headerTitle: '门店商品详情'}}
                      component={GoodStoreDetailScene}/>
        <Stack.Screen name={Config.ROUTE_VERSION} options={{headerTitle: '版本信息'}} component={VersionScene}/>
        <Stack.Screen name={Config.ROUTE_SELECT_STORE} options={{headerTitle: '选择门店'}} component={SelectStoreScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_CLASSIFY} options={{headerTitle: '门店分类'}}
                      component={GoodsClassifyScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_RECORD} options={{headerTitle: '申请记录'}}
                      component={GoodsApplyRecordScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_EDIT} component={GoodsEditScene} initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_NEW_PRODUCT} options={{headerTitle: '我要上新'}}
                      component={GoodsApplyNewProductScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_WORK_NEW_PRODUCT} options={{headerTitle: '申请工单上新'}}
                      component={GoodsWorkNewProductScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_ADJUST} options={{headerTitle: '商品变动'}} component={GoodsAdjustScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_PRICE} options={{headerTitle: '修改价格'}} component={GoodsApplyPrice}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_LIST} component={GoodsList}/>
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_INDEX} options={{headerTitle: '价格指数'}}
                      component={GoodsPriceIndex}/>
        <Stack.Screen name={Config.ROUTE_AREA_GOODS_PRICE} options={{headerTitle: '同商圈价格调研'}}
                      component={GoodsPriceArea}/>
        <Stack.Screen name={Config.ROUTE_GOODS_ANALYSIS} options={{headerTitle: '热销新品上架'}} component={GoodsAnalysis}/>
        <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE} options={{headerTitle: '价格市调'}}
                      component={GoodsMarketExamine}/>
        <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE_HISTORY} options={{headerTitle: '价格市调历史'}}
                      component={GoodsMarketExamineHistory}/>
        <Stack.Screen name={Config.ROUTE_GOODS_SOLDOUT} options={{headerTitle: '缺货商品'}} component={GoodsSoldoutScene}/>

        <Stack.Screen name={Config.ROUTE_SETTLEMENT} options={{headerTitle: '打款记录'}} component={SettlementScene}/>
        <Stack.Screen name={Config.ROUTE_DistributionAnalysis} options={{headerTitle: '数据分析'}}
                      component={DistributionanalysisScene}/>
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_DETAILS} options={{headerTitle: '结算详情'}}
                      component={SettlementDetailsScene}/>
        <Stack.Screen name={Config.ROUTE_SELECT_WORKER} options={{headerTitle: '选择员工'}} component={SelectWorkerScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_BATCH_PRICE} options={{headerTitle: '批量改价'}}
                      component={GoodsBatchPriceScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_RELATE} options={{headerTitle: '商品关联'}} component={GoodsRelateScene}/>
        <Stack.Screen name={Config.ROUTE_HELP} options={{headerTitle: '帮助'}} component={HelpScene}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_PROFIT} options={{headerTitle: '运营收益'}}
                      component={OperateProfitScene}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_DETAIL} options={{headerTitle: '运营明细'}}
                      component={OperateDetailScene}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_INCOME_DETAIL} options={{headerTitle: '收入详情'}}
                      component={OperateIncomeDetailScene}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_EXPEND_DETAIL} component={OperateExpendDetailScene}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL} options={{headerTitle: '其他支出流水'}}
                      component={OperateOtherExpendDetailScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_MANAGE} options={{headerTitle: '商品管理'}} component={GoodsManageScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_DETAIL} options={{headerTitle: '价格监管'}}
                      component={GoodsPriceDetailsScene}/>
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_GATHER} options={{headerTitle: '月销量汇总'}}
                      component={SettlementGatherScene}/>
        <Stack.Screen name={Config.ROUTE_JD_AUDIT_DELIVERY} options={{headerTitle: '审核配送失败'}}
                      component={JdAuditDeliveryScene}/>
        <Stack.Screen name={Config.ROUTE_GOODS_SCAN_SEARCH} component={GoodsScanSearchScene}/>
        <Stack.Screen name={Config.ROUTE_CREATE_SCAN} options={{headerTitle: '扫码创建'}} component={CreateScan}/>
        <Stack.Screen name={Config.ROUTE_SEARCH_GOODS} component={SearchGoods}/>
        <Stack.Screen name={Config.ROUTE_ONLINE_STORE_PRODUCT} options={{headerTitle: '上架商品'}}
                      component={OnlineStoreProduct}/>
        <Stack.Screen name={Config.ROUTE_NEW_PRODUCT} options={{headerTitle: '新增商品'}} component={NewProduct}/>
        <Stack.Screen name={Config.ROUTE_NEW_PRODUCT_DETAIL} options={{headerTitle: '新增商品'}}
                      component={NewProductDetail}/>
        <Stack.Screen name={Config.ROUTE_CREATE_NEW_GOOD_REMIND} options={{headerTitle: '申请上新'}}
                      component={CreateApplyNewProductRemindScene}/>
        <Stack.Screen name={Config.ROUTE_REFUND_DETAIL} options={{headerTitle: '退单详情'}} component={Refund}/>
        <Stack.Screen name={Config.ROUTE_INVOICING} options={{headerTitle: '进销存系统'}} component={InvoicingScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_GATHER_DETAIL} component={InvoicingGatherDetailScene}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_DETAIL} component={InvoicingShippingDetailScene}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_LIST} options={{headerTitle: '进销存系统'}}
                      component={InvoicingShippingScene}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_NEW_GOODS_SEARCH} options={{headerTitle: '商品搜索'}}
                      component={StoreGoodsSearch}/>
        <Stack.Screen name={Config.ROUTE_PLATFORM_LIST} options={{headerTitle: '绑定平台信息'}} component={PlatformScene}/>
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE} options={{headerTitle: '帐户清单'}} component={SeparatedExpense}/>
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE_INFO} options={{headerTitle: '清单详情'}}
                      component={SeparatedExpenseInfo}/>
        <Stack.Screen name={Config.ROUTE_ACCOUNT_FILL} options={{headerTitle: '账户充值'}}
                      component={SeparatedAccountFill}/>

        <Stack.Screen name={Config.ROUTE_SELECT_CITY_LIST} options={{headerTitle: '选择城市'}} component={SelectCity}/>
        <Stack.Screen name={Config.ROUTE_SELECT_QUALIFICATION} options={{headerTitle: '提交资质'}}
                      component={Qualification}/>
        <Stack.Screen name={Config.ROUTE_SUPPLEMENT_WAGE} options={{headerTitle: '提成预估'}} component={SupplementWage}/>
        <Stack.Screen name={Config.ROUTE_OPERATION} options={{headerTitle: 'Operation'}} component={TabOperation}/>
        {/*// 库存相关*/}
        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_PUT_IN} options={{headerTitle: '商品入库'}}
                      component={InventoryProductPutIn}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_INFO} options={{headerTitle: '库管详情'}}
                      component={InventoryProductInfo}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_LIST} component={InventoryMaterialList}/>
        <Stack.Screen name='InventoryHome' options={{headerTitle: '库存'}} component={InventoryHome}/>
        <Stack.Screen name='InventoryItems' options={{headerTitle: '库存'}} component={InventoryItems}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_PUT_IN} options={{headerTitle: '原料入库'}}
                      component={InventoryMaterialPutIn}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE} options={{headerTitle: '原料收货详情'}}
                      component={InventoryMaterialDetailUpdate}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_PUT_IN} options={{headerTitle: '标品入库'}}
                      component={InventoryStandardPutIn}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE} options={{headerTitle: '标品入库'}}
                      component={InventoryStandardDetailUpdate}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK} options={{headerTitle: '任务中心'}}
                      component={InventoryMaterialTask}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH} options={{headerTitle: '我完成的任务'}}
                      component={InventoryMaterialTaskFinish}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK} options={{headerTitle: '库存盘点'}}
                      component={InventoryStockCheck}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY} options={{headerTitle: '商品盘点历史'}}
                      component={InventoryStockCheckHistory}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_REPORT_LOSS} options={{headerTitle: '商品报损'}}
                      component={InventoryReportLoss}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_DETAIL} options={{headerTitle: '商品出入库明细'}}
                      component={InventoryDetail}
                      initialParams={initialRouteParams}/>


        <Stack.Screen name={Config.ROUTE_SEARC_HSHOP} options={{headerTitle: '门店搜索'}}
                      component={INItSearchShop}
                      initialParams={INItSearchShop}/>

        <Stack.Screen name={Config.ROUTE_SHOP_MAP} options={{headerTitle: '确认门店位置'}}
                      component={MapShop}
                      initialParams={MapShop}/>

        <Stack.Screen name={Config.ROUTE_BIND_MEITUAN} options={{headerTitle: '绑定美团外卖'}} component={BindMeituan}/>


        {/*// 员工相关*/}
        <Stack.Screen name={Config.ROUTE_WORKER} options={{headerTitle: '员工管理'}} component={WorkerListScene}/>
        <Stack.Screen name={Config.ROUTE_WORKER_SCHEDULE} options={{headerTitle: '排班详情'}} component={WorkerSchedule}/>
        {/*// 自提相关*/}
        <Stack.Screen name={Config.ROUTE_ZT_ORDER_PRINT} options={{headerTitle: '打印自提单'}} component={ZtOrderPrint}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default AppNavigator;



