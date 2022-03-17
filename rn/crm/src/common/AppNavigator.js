import React, {useRef} from "react";
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationRef} from '../RootNavigation';
import native from "./native";
import Config from "../config";
import {Dimensions} from "react-native";

let width = Dimensions.get("window").width;
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
            height: 40,
          },
          headerTitleStyle: {
            color: "#4a4a4a",
            fontSize: 16,
            fontWeight: "bold",
            width: width / 1.7,
            textAlign: "center",
          },
          headerBackTitle: null,
          headerTruncatedBackTitle: null,
          headerTintColor: "#333333",
          showIcon: true
        })}>
        <Stack.Screen name="Tab" options={{headerShown: false}} initialParams={initialRouteParams}
                      getComponent={() => require("../scene/TabHome").default}
        />
        <Stack.Screen name="Login"
                      options={{headerShown: false}}
                      getComponent={() => require("../scene/Login/LoginScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name="Order" options={{headerTitle: '订单详情'}}
                      getComponent={() => require("../scene/Order/OrderInfo").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name="Web" options={{headerShown: true}}
                      getComponent={() => require("../widget/WebScene").default}/>
        <Stack.Screen name="Home" getComponent={() => require("../scene/Remind/RemindScene").default}
                      options={{headerShown: false}}/>
        <Stack.Screen name="Register" options={{headerTitle: '我要注册'}}
                      getComponent={() => require("../scene/Login/RegisterScene").default}/>
        <Stack.Screen name="Platform" options={{headerShown: false}}
                      getComponent={() => require("../scene/Platform/PlatformScene").default}/>
        <Stack.Screen name="Apply" options={{headerTitle: '注册门店信息'}}
                      getComponent={() => require("../scene/Apply/ApplyScene").default}/>
        <Stack.Screen name="User" options={{headerShown: true}}
                      getComponent={() => require("../scene/User/UserScene").default}/>
        <Stack.Screen name="UserAdd" options={{headerShown: true}}
                      getComponent={() => require("../scene/User/UserAddScene").default}/>
        <Stack.Screen name="Mine" options={{headerShown: false}}
                      getComponent={() => require("../scene/Mine/MineScene").default}/>
        <Stack.Screen name="ProductAutocomplete"
                      getComponent={() => require("../scene/Order/ProductAutocomplete.android").default}/>
        <Stack.Screen name={Config.ROUTE_DELIVERY_LIST} options={{headerTitle: '配送平台管理'}}
                      getComponent={() => require("../scene/Delivery/DeliveryList").default}/>
        <Stack.Screen name={Config.ROUTE_DELIVERY_INFO} options={{headerTitle: '配送平台信息'}}
                      getComponent={() => require("../scene/Delivery/DeliveryInfo").default}/>
        <Stack.Screen name={Config.ROUTE_METTUAN_PAOTUI} options={{headerTitle: '绑定美团跑腿'}}
                      getComponent={() => require("../scene/Delivery/MeituanPaotui").default}/>
        <Stack.Screen name={Config.ROUTE_BIND_DELIVERY} options={{headerTitle: '绑定配送信息'}}
                      getComponent={() => require("../scene/Delivery/BindDelivery").default}/>
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../scene/Delivery/SeetingDelivery").default}
        />
        <Stack.Screen name={Config.ROUTE_APPLY_DELIVERY} options={{headerTitle: '开通配送'}}
                      getComponent={() => require("../scene/Delivery/ApplyDelivery").default}
        />
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY_INFO} options={{headerTitle: '设置配送方式'}}
                      getComponent={() => require("../scene/Delivery/SeetingDeliveryInfo").default}
        />
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY_ORDER} options={{headerTitle: '就近分配订单'}}
                      getComponent={() => require("../scene/Delivery/DistributionOrder").default}
        />

        <Stack.Screen name={Config.ROUTE_SETTING} options={{headerTitle: '设置'}}
                      getComponent={() => require("../scene/Setting/SettingScene").default}/>
        <Stack.Screen name={Config.ROUTE_CLOUD_PRINTER} options={{headerTitle: '云打印机'}}
                      getComponent={() => require("../scene/Setting/CloudPrinterScene").default}/>
        <Stack.Screen name={Config.ROUTE_PRINTER_CONNECT} options={{headerTitle: '添加蓝牙打印机'}}
                      getComponent={() => require("../scene/Setting/BluePrinterSettings").default}
        />
        <Stack.Screen name={Config.ROUTE_PRINTERS} options={{headerTitle: '打印设置'}}
                      getComponent={() => require("../scene/Setting/PrinterSetting").default}/>
        <Stack.Screen name={Config.ROUTE_INFORM} options={{headerTitle: '消息与铃声'}}
                      getComponent={() => require("../scene/Setting/InfromSetting").default}/>
        <Stack.Screen name={Config.ROUTE_PUSH} options={{headerTitle: '推送通知'}}
                      getComponent={() => require("../scene/Setting/PushSetting").default}/>
        <Stack.Screen name={Config.ROUTE_MSG_VOICE} options={{headerTitle: '消息铃声检测'}}
                      getComponent={() => require("../scene/Setting/MsgVoiceScene").default}/>
        <Stack.Screen name={Config.ROUTE_GUIDE} options={{headerTitle: '设置提醒教程'}}
                      getComponent={() => require("../scene/Setting/GuideScene").default}/>
        <Stack.Screen name={Config.DIY_PRINTER} options={{headerTitle: '小票设置'}}
                      getComponent={() => require("../scene/Setting/DiyPrinter").default}/>
        <Stack.Screen name={Config.ROUTE_RECEIPT} options={{headerTitle: '小票'}}
                      getComponent={() => require("../scene/Setting/ReceiptScene").default}/>
        <Stack.Screen name={Config.ROUTE_REMARK} options={{headerTitle: '自定义备注'}}
                      getComponent={() => require("../scene/Setting/PrinterRemark").default}/>
        <Stack.Screen name={Config.ROUTE_REFUND_AUDIT} options={{headerTitle: '退单详情'}}
                      getComponent={() => require("../scene/Order/AuditRefundScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CALL_SHIP} options={{headerTitle: '发配送'}}
                      getComponent={() => require("../scene/Order/OrderCallShip").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_EDIT} options={{headerTitle: '修改订单信息'}}
                      getComponent={() => require("../scene/Order/OrderEditScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SETTING} options={{headerTitle: '创建订单'}}
                      getComponent={() => require("../scene/Order/OrderSettingPack").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_PACK} options={{headerTitle: '设置打包完成'}}
                      getComponent={() => require("../scene/Order/OrderSetPackDone").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_START_SHIP} options={{headerTitle: '出发提醒'}}
                      getComponent={() => require("../scene/Order/OrderSetShipStart").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_URGE} options={{headerTitle: '催单'}}
                      getComponent={() => require("../scene/Order/UrgeShipScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TODO} options={{headerTitle: '添加稍后处理事项'}}
                      getComponent={() => require("../scene/Order/OrderTodoScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TO_INVALID} options={{headerTitle: '置为无效'}}
                      getComponent={() => require("../scene/Order/OrderToInvalidScene").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_TRANSFER_THIRD} options={{headerTitle: '发第三方配送'}}
                      getComponent={() => require("../scene/Order/OrderTransferThird").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_STORE} options={{headerTitle: '修改店铺'}}
                      getComponent={() => require("../scene/Order/OrderEditStoreScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SHIP_DETAIL} options={{headerTitle: '配送详情'}}
                      getComponent={() => require("../scene/Order/OrderShipDetail").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_SHIP} options={{headerTitle: '撤回呼叫'}}
                      getComponent={() => require("../scene/Order/OrderCancelShip").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_SEND_MONEY} options={{headerTitle: '发红包'}}
                      getComponent={() => require("../scene/Order/OrderSendMoney").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SURCHARGE} options={{headerTitle: '订单补偿'}}
                      getComponent={() => require("../scene/Order/OrderSurcharge").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH} options={{headerTitle: '订单搜索'}}
                      getComponent={() => require("../scene/Order/OrderSearchScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN} options={{headerTitle: '订单过机'}}
                      getComponent={() => require("../scene/Order/OrderScan").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN_REDAY} options={{headerTitle: '扫码打包完成'}}
                      getComponent={() => require("../scene/Order/OrderSetReady").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_REFUND_BY_WEIGHT} options={{headerTitle: '按重退款'}}
                      getComponent={() => require("../scene/Order/RefundByWeight").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_PACKAGE} options={{headerTitle: '拆单详情'}}
                      getComponent={() => require("../scene/Order/OrderPackage").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_TO_ENTRY} options={{headerTitle: '退单商品入库'}}
                      getComponent={() => require("../scene/Order/OrderCancelToEntry").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_EXIT_LOG} options={{headerTitle: '订单出库详情'}}
                      getComponent={() => require("../scene/Order/OrderExitLog").default}/>
        <Stack.Screen name={Config.ROUTE_COMPLAIN} options={{headerTitle: '投诉信息'}}
                      getComponent={() => require("../scene/Order/_OrderScene/Complain").default}/>


        <Stack.Screen name={Config.ROUTE_ORDER_GOOD_COUPON} options={{headerTitle: '发送兑换码'}}
                      getComponent={() => require("../scene/Order/_GoodCoupon/SendRedeemCoupon").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH_RESULT} options={{headerTitle: '订单搜索'}}
                      getComponent={() => require("../scene/Order/OrderQueryResultScene").default}
        />
        <Stack.Screen name={Config.ROUTE_STORE} options={{headerTitle: '店铺管理'}}
                      getComponent={() => require("../scene/Store/StoreScene").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_ADD}
                      getComponent={() => require("../scene/Store/StoreAddScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_STORE_RATE} options={{headerTitle: '店铺评分'}}
                      getComponent={() => require("../scene/Store/StoreRate").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_RULE} options={{headerTitle: '规则处理'}}
                      getComponent={() => require("../scene/Store/StoreRule").default}/>
        <Stack.Screen name={Config.ROUTE_DONE_REMIND}
                      getComponent={() => require("../scene/Remind/DoneRemindScene").default}/>
        <Stack.Screen name={Config.PLATFORM_BIND} options={{headerTitle: '绑定平台信息'}}
                      getComponent={() => require("../scene/Login/PlatformBind").default}/>
        <Stack.Screen name={Config.ROUTE_EBBIND} options={{headerTitle: '饿了么零售'}}
                      getComponent={() => require("../scene/Platform/EbBindScene").default}/>
        <Stack.Screen name={Config.ROUTE_SGBIND} options={{headerTitle: '美团闪购'}}
                      getComponent={() => require("../scene/Platform/BindMeituanSg").default}/>
        <Stack.Screen name={Config.ROUTE_TAKE_OUT} options={{headerTitle: '外卖平台列表'}}
                      getComponent={() => require("../scene/Store/TakeOutScene").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_STATUS} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../scene/Store/StoreStatusScene").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_DETAIL} options={{headerTitle: '商品详情'}}
                      getComponent={() => require("../scene/Goods/GoodsDetailScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOOD_STORE_DETAIL} options={{headerTitle: '门店商品详情'}}
                      getComponent={() => require("../scene/Goods/GoodStoreDetailScene").default}
        />
        <Stack.Screen name={Config.ROUTE_VERSION} options={{headerTitle: '版本信息'}}
                      getComponent={() => require("../scene/Mine/VersionScene").default}/>
        <Stack.Screen name={Config.ROUTE_SELECT_STORE} options={{headerTitle: '选择门店'}}
                      getComponent={() => require("../scene/Setting/SelectStoreScene").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_CLASSIFY} options={{headerTitle: '门店分类'}}
                      getComponent={() => require("../scene/Goods/GoodsClassifyScene").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_RECORD} options={{headerTitle: '申请记录'}}
                      getComponent={() => require("../scene/Goods/GoodsApplyRecordScene").default}

                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_EDIT}
                      getComponent={() => require("../scene/Goods/GoodsEditScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_NEW_PRODUCT} options={{headerTitle: '我要上新'}}
                      getComponent={() => require("../scene/Goods/GoodsApplyNewProductScene").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_WORK_NEW_PRODUCT} options={{headerTitle: '申请工单上新'}}
                      getComponent={() => require("../scene/Goods/GoodsWorkNewProductScene").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_ADJUST} options={{headerTitle: '商品变动'}}
                      getComponent={() => require("../scene/Goods/GoodsAdjustScene").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_PRICE} options={{headerTitle: '修改价格'}}
                      getComponent={() => require("../scene/Goods/GoodsApplyPrice").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_LIST}
                      getComponent={() => require("../scene/Goods/GoodsList").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_INDEX} options={{headerTitle: '价格指数'}}
                      getComponent={() => require("../scene/Goods/GoodsPriceIndex").default}
        />
        <Stack.Screen name={Config.ROUTE_AREA_GOODS_PRICE} options={{headerTitle: '同商圈价格调研'}}
                      getComponent={() => require("../scene/Goods/AreaGoodsPrice").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_ANALYSIS} options={{headerTitle: '热销新品上架'}}
                      getComponent={() => require("../scene/Goods/GoodsAnalysis").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE} options={{headerTitle: '价格市调'}}
                      getComponent={() => require("../scene/Goods/GoodsMarketExamine").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_SOLDOUT} options={{headerTitle: '缺货商品'}}
                      getComponent={() => require('../scene/Goods/GoodsSoldoutScene').default}
        />

        <Stack.Screen name={Config.ROUTE_SETTLEMENT} options={{headerTitle: '打款记录'}}
                      getComponent={() => require('../scene/Settlement/SettlementScene').default}
        />
        <Stack.Screen name={Config.ROUTE_DistributionAnalysis} options={{headerTitle: '数据分析'}}
                      getComponent={() => require('../scene/Setting/DistributionanalysisScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_DETAILS} options={{headerTitle: '结算详情'}}
                      getComponent={() => require('../scene/Settlement/SettlementDetailsScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SELECT_WORKER} options={{headerTitle: '选择员工'}}
                      getComponent={() => require('../scene/Store/SelectWorkerScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_BATCH_PRICE} options={{headerTitle: '批量改价'}}
                      getComponent={() => require('../scene/Goods/GoodsBatchPriceScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_RELATE} options={{headerTitle: '商品关联'}}
                      getComponent={() => require('../scene/Goods/GoodsRelateScene').default}/>
        <Stack.Screen name={Config.ROUTE_HELP} options={{headerTitle: '帮助'}}
                      getComponent={() => require('../scene/Help/HelpScene').default}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_PROFIT} options={{headerTitle: '运营收益'}}
                      getComponent={() => require('../scene/OperateProfit/OperateProfitScene').default}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_DETAIL} options={{headerTitle: '运营明细'}}
                      getComponent={() => require('../scene/OperateProfit/OperateDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_INCOME_DETAIL} options={{headerTitle: '收入详情'}}
                      getComponent={() => require('../scene/OperateProfit/OperateIncomeDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_EXPEND_DETAIL}
                      getComponent={() => require('../scene/OperateProfit/OperateExpendDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL} options={{headerTitle: '其他支出流水'}}
                      getComponent={() => require('../scene/OperateProfit/OperateOtherExpendDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_MANAGE} options={{headerTitle: '商品管理'}}
                      getComponent={() => require('../scene/Goods/GoodsManageScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_DETAIL} options={{headerTitle: '价格监管'}}
                      getComponent={() => require('../scene/Goods/GoodsPriceDetailsScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_GATHER} options={{headerTitle: '月销量汇总'}}
                      getComponent={() => require('../scene/Settlement/SettlementGatherScene').default}
        />
        <Stack.Screen name={Config.ROUTE_JD_AUDIT_DELIVERY} options={{headerTitle: '审核配送失败'}}
                      getComponent={() => require('../scene/Order/JdAuditDeliveryScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_SCAN_SEARCH}
                      getComponent={() => require('../scene/Goods/GoodsScanSearchScene').default}
        />
        <Stack.Screen name={Config.ROUTE_CREATE_SCAN} options={{headerTitle: '扫码创建'}}
                      getComponent={() => require('../scene/Goods/CreateScan').default}
        />
        <Stack.Screen name={Config.ROUTE_SEARCH_GOODS}
                      getComponent={() => require('../scene/Goods/SearchGoods').default}
        />
        <Stack.Screen name={Config.ROUTE_ONLINE_STORE_PRODUCT} options={{headerTitle: '上架商品'}}
                      getComponent={() => require('../scene/Goods/OnlineStoreProduct').default}
        />
        <Stack.Screen name={Config.ROUTE_NEW_PRODUCT} options={{headerTitle: '新增商品'}}
                      getComponent={() => require('../scene/Goods/NewProduct').default}
        />
        <Stack.Screen name={Config.ROUTE_NEW_PRODUCT_DETAIL} options={{headerTitle: '新增商品'}}
                      getComponent={() => require('../scene/Goods/NewProductDetail').default}
        />
        <Stack.Screen name={Config.ROUTE_CREATE_NEW_GOOD_REMIND} options={{headerTitle: '申请上新'}}
                      getComponent={() => require('../scene/Goods/CreateApplyNewProductRemindScene').default}
        />
        <Stack.Screen name={Config.ROUTE_REFUND_DETAIL} options={{headerTitle: '退单详情'}}
                      getComponent={() => require('../scene/Order/Refund').default}
        />
        <Stack.Screen name={Config.ROUTE_INVOICING} options={{headerTitle: '进销存系统'}}
                      getComponent={() => require('../scene/Invoicing/InvoicingScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_GATHER_DETAIL}
                      getComponent={() => require('../scene/Invoicing/InvoicingGatherDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_DETAIL}
                      getComponent={() => require('../scene/Invoicing/InvoicingShippingDetailScene').default}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_LIST} options={{headerTitle: '进销存系统'}}
                      getComponent={() => require('../scene/Invoicing/InvoicingShippingScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_NEW_GOODS_SEARCH} options={{headerTitle: '商品搜索'}}
                      getComponent={() => require('../scene/Goods/StoreGoodsSearch').default}/>
        <Stack.Screen name={Config.ROUTE_PLATFORM_LIST} options={{headerTitle: '绑定平台信息'}}
                      getComponent={() => require('../scene/Platform/PlatformScene').default}/>
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE} options={{headerTitle: '帐户清单'}}
                      getComponent={() => require('../scene/SeparatedExpense/SeparatedExpense').default}
        />
        <Stack.Screen name={Config.ROUTE_OLDSEP_EXPENSE} options={{headerTitle: '帐户清单'}}
                      getComponent={() => require('../scene/SeparatedExpense/OldSeparatedExpense').default}
        />
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE_INFO} options={{headerTitle: '清单详情'}}
                      getComponent={() => require('../scene/SeparatedExpense/SeparatedExpenseInfo').default}
        />
        <Stack.Screen name={Config.ROUTE_ACCOUNT_FILL} options={{headerTitle: '账户充值'}}
                      getComponent={() => require('../scene/SeparatedExpense/SeparatedAccountFill').default}/>
        <Stack.Screen name={Config.ROUTE_SELECT_CITY_LIST} options={{headerTitle: '选择城市'}}
                      getComponent={() => require('../scene/Store/SelectCity').default}/>
        <Stack.Screen name={Config.ROUTE_SELECT_QUALIFICATION} options={{headerTitle: '提交资质'}}
                      getComponent={() => require('../scene/Store/Qualification').default}/>
        <Stack.Screen name={Config.ROUTE_SUPPLEMENT_WAGE} options={{headerTitle: '提成预估'}}
                      getComponent={() => require('../scene/User/SupplementWage').default}/>
        <Stack.Screen name={Config.ROUTE_OPERATION} options={{headerTitle: 'Operation'}}
                      getComponent={() => require('../scene/Tab/Operation').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_PUT_IN} options={{headerTitle: '商品入库'}}
                      getComponent={() => require('../scene/Inventory/ProductPutIn').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_INFO} options={{headerTitle: '库管详情'}}
                      getComponent={() => require('../scene/Inventory/ProductInfo').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_LIST}
                      getComponent={() => require('../scene/Inventory/MaterialList').default}/>
        <Stack.Screen name='InventoryHome' options={{headerTitle: '库存'}}
                      getComponent={() => require('../scene/Inventory/InventoryHome').default}/>
        <Stack.Screen name='InventoryItems' options={{headerTitle: '库存'}}
                      getComponent={() => require('../scene/Inventory/InventoryItems').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_PUT_IN} options={{headerTitle: '原料入库'}}
                      getComponent={() => require('../scene/Inventory/MaterialPutIn').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE} options={{headerTitle: '原料收货详情'}}
                      getComponent={() => require('../scene/Inventory/MaterialDetailUpdate').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_PUT_IN} options={{headerTitle: '标品入库'}}
                      getComponent={() => require('../scene/Inventory/StandardPutIn').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE} options={{headerTitle: '标品入库'}}
                      getComponent={() => require('../scene/Inventory/StandardDetailUpdate').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK} options={{headerTitle: '任务中心'}}
                      getComponent={() => require('../scene/Inventory/MaterialTask').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH} options={{headerTitle: '我完成的任务'}}
                      getComponent={() => require('../scene/Inventory/MaterialTaskFinish').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK} options={{headerTitle: '库存盘点'}}
                      getComponent={() => require('../scene/Inventory/StockCheck').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY} options={{headerTitle: '商品盘点历史'}}
                      getComponent={() => require('../scene/Inventory/StockCheckHistory').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_REPORT_LOSS} options={{headerTitle: '商品报损'}}
                      getComponent={() => require('../scene/Inventory/ReportLoss').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_DETAIL} options={{headerTitle: '商品出入库明细'}}
                      getComponent={() => require('../scene/Inventory/Detail').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_SEARC_HSHOP} options={{headerTitle: '门店搜索'}}
                      getComponent={() => require('../Components/SearchShop/SearchShop').default}
        />
        <Stack.Screen name={Config.ROUTE_SHOP_ORDER} options={{headerTitle: '选填订单信息'}}
                      getComponent={() => require('../scene/Store/StoreOrderMsg').default}/>
        <Stack.Screen name={Config.ROUTE_SHOP_BANK} options={{headerTitle: '选填银行卡信息'}}
                      getComponent={() => require('../scene/Store/StoreBankMsg').default}/>
        <Stack.Screen name={Config.ROUTE_BIND_MEITUAN} options={{headerTitle: '绑定美团外卖'}}
                      getComponent={() => require('../scene/Platform/BindMeituan').default}/>
        <Stack.Screen name={Config.ROUTE_WORKER} options={{headerTitle: '员工管理'}}
                      getComponent={() => require('../scene/Worker/WorkerListScene').default}/>
        <Stack.Screen name={Config.ROUTE_WORKER_SCHEDULE} options={{headerTitle: '排班详情'}}
                      getComponent={() => require('../scene/Worker/WorkerSchedule').default}/>
        <Stack.Screen name={Config.ROUTE_ZT_ORDER_PRINT} options={{headerTitle: '打印自提单'}}
                      getComponent={() => require('../scene/Ziti/OrderPrint').default}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default AppNavigator;



