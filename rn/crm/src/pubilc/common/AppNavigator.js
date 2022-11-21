import React, {PureComponent, useRef} from "react";
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationRef} from '../../RootNavigation';
import Config from "./config";
import {Alert, Dimensions, Platform} from "react-native";
import TabHome from "../../scene/common/TabHome";
import native from "../util/native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {setAccessToken, setCheckVersionAt} from "../../reducers/global/globalActions";
import store from "../util/configureStore";
import {setNoLoginInfo} from "./noLoginInfo";
import dayjs from "dayjs";
import HttpUtils from "../util/http";
import {doJPushSetAlias, sendDeviceStatus,} from "../component/jpushManage";
import {nrRecordMetric} from "../util/NewRelicRN";
import {handlePrintOrder, initBlueTooth, unInitBlueTooth} from "../util/ble/handleBlueTooth";
import GlobalUtil from "../util/GlobalUtil";
import {setDeviceInfo} from "../../reducers/device/deviceActions";
import {AMapSdk} from "react-native-amap3d";
import DeviceInfo from "react-native-device-info";
import {downloadApk} from "rn-app-upgrade";
import JPush from "jpush-react-native";

let {width} = Dimensions.get("window");
const Stack = createStackNavigator();
const screenOptions = ({
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
})

function mapStateToProps(state) {
  const {global, device} = state;
  return {global: global, device: device}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const Page = (props) => {
  const {initialRouteName, initialRouteParams} = props;
  const routeNameRef = useRef();
  initialRouteParams.initialRouteName = initialRouteName
  return (
    <NavigationContainer ref={navigationRef}
                         onReady={() => routeNameRef.current = navigationRef.current.getCurrentRoute().name}
                         onStateChange={async () => {
                           const previousRouteName = routeNameRef.current;
                           const currentRouteName = navigationRef.current.getCurrentRoute().name;

                           if (previousRouteName !== currentRouteName) {
                             await native.reportRoute(currentRouteName);
                           }
                           global.currentRouteName = currentRouteName

                           // Save the current route name for later comparison
                           routeNameRef.current = currentRouteName;
                         }}>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
        <Stack.Screen name="Tab"
                      options={{headerShown: false}}
                      initialParams={initialRouteParams}
                      component={TabHome}
        />
        <Stack.Screen name="Login"
                      options={{headerShown: false}}
          //component={LoginScene}
                      getComponent={() => require('../../scene/common/Login/LoginScene').default}
                      initialParams={initialRouteParams}/>
        {/*<Stack.Screen name="Order" options={{headerTitle: '订单详情'}}*/}
        {/*              getComponent={() => require("../../scene/order/OrderInfo").default}*/}
        {/*              initialParams={initialRouteParams}/>*/}
        <Stack.Screen name="OrderNew" options={{headerTitle: '订单详情'}}
                      getComponent={() => require("../../scene/order/OrderInfoNew").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_OPERATION_LOG} options={{headerTitle: '操作日志'}}
                      getComponent={() => require("../../scene/order/OrderOperationLog").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_ORDERS} options={{headerShown: false}}
                      getComponent={() => require("../../scene/order/OrderListScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_ORDER_ALL} options={{headerShown: false}}
                      getComponent={() => require("../../scene/order/OrderAllScene").default}
                      initialParams={initialRouteParams}/>

        <Stack.Screen name={Config.ROUTE_MINE_NEW} options={{headerShown: false}}
                      getComponent={() => require("../../scene/home/Mine/Mine").default}
                      initialParams={initialRouteParams}/>

        <Stack.Screen name="OrderOperation" options={{headerTitle: '订单操作'}}
                      getComponent={() => require("../../scene/order/OrderOperation").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name="Web" getComponent={() => require("./WebScene").default}/>
        <Stack.Screen name="Apply" options={{headerTitle: '注册门店信息'}}
                      getComponent={() => require("../../scene/common/Login/ApplyScene").default}/>
        <Stack.Screen name="User" getComponent={() => require("../../scene/home/User/UserScene").default}/>
        <Stack.Screen name="UserAdd" getComponent={() => require("../../scene/home/User/UserAddScene").default}/>
        <Stack.Screen name={Config.ROUTE_DELIVERY_LIST} options={{headerShown: false}}
                      getComponent={() => require("../../scene/home/Delivery/DeliveryList").default}/>
        <Stack.Screen name={Config.ROUTE_DELIVERY_INFO} options={{headerTitle: '配送平台信息'}}
                      getComponent={() => require("../../scene/home/Delivery/DeliveryInfo").default}/>
        <Stack.Screen name={Config.ROUTE_METTUAN_PAOTUI} options={{headerTitle: '美团跑腿帮送授权说明'}}
                      getComponent={() => require("../../scene/home/Delivery/MeituanPaotui").default}/>
        <Stack.Screen name={Config.ROUTE_BIND_DELIVERY} options={{headerTitle: '绑定配送信息'}}
                      getComponent={() => require("../../scene/home/Delivery/BindDelivery").default}/>
        <Stack.Screen name={Config.ROUTE_BIND_SHUNFENG} options={{headerTitle: '绑定顺丰'}}
                      getComponent={() => require('../../scene/home/Delivery/BindShunfeng').default}/>
        <Stack.Screen name={Config.ROUTE_REGISTER_SHUNFENG} options={{headerTitle: '注册顺丰'}}
                      getComponent={() => require('../../scene/home/Delivery/RegisterShunfeng').default}/>
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../../scene/home/Delivery/SeetingDelivery").default}
        />
        <Stack.Screen name={Config.ROUTE_APPLY_DELIVERY} options={{headerTitle: '开通配送'}}
                      getComponent={() => require("../../scene/home/Delivery/ApplyDelivery").default}
        />
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY_INFO} options={{headerTitle: '设置配送方式'}}
                      getComponent={() => require("../../scene/home/Delivery/SettingDeliveryInfo").default}
        />
        <Stack.Screen name={Config.ROUTE_SEETING_DELIVERY_ORDER} options={{headerTitle: '就近分配订单'}}
                      getComponent={() => require("../../scene/home/Delivery/DistributionOrder").default}
        />
        <Stack.Screen name={Config.ROUTE_SEETING_PREFERENCE_DELIVERY} options={{headerTitle: '设置配送方式'}}
                      getComponent={() => require("../../scene/home/Delivery/PreferenceBillingSetting").default}
        />

        <Stack.Screen name={Config.ROUTE_SEETING_MININUM_DELIVERY} options={{headerTitle: '保底配送'}}
                      getComponent={() => require("../../scene/home/Delivery/SeetingMiniNumDelivery").default}
        />

        <Stack.Screen name={Config.ROUTE_SETTING} options={{headerTitle: '设置'}}
                      getComponent={() => require("../../scene/home/Setting/SettingScene").default}/>
        <Stack.Screen name={Config.ROUTE_CLOUD_PRINTER} options={{headerTitle: '云打印机'}}
                      getComponent={() => require("../../scene/home/Setting/CloudPrinterScene").default}/>
        <Stack.Screen name={Config.ROUTE_PRINTER_CONNECT} options={{headerTitle: '添加蓝牙打印机'}}
                      getComponent={() => require("../../scene/home/Setting/BluePrinterSettings").default}
        />

        <Stack.Screen name={Config.ROUTE_HISTORY_NOTICE} options={{headerTitle: '历史公告'}}
                      getComponent={() => require("../../scene/home/Notice/HistoryNoticeScene").default}/>
        <Stack.Screen name={Config.ROUTE_DETAIL_NOTICE} options={{headerTitle: '公告详情'}}
                      getComponent={() => require("../../scene/home/Notice/DetailNoticeScene").default}/>

        <Stack.Screen name={Config.ROUTE_PRINTERS} options={{headerTitle: '打印设置'}}
                      getComponent={() => require("../../scene/home/Setting/PrinterSetting").default}/>
        <Stack.Screen name={Config.ROUTE_INFORM} options={{headerTitle: '消息与铃声'}}
                      getComponent={() => require("../../scene/home/Setting/InfromSetting").default}/>
        <Stack.Screen name={Config.ROUTE_PUSH} options={{headerTitle: '推送通知'}}
                      getComponent={() => require("../../scene/home/Setting/PushSetting").default}/>
        <Stack.Screen name={Config.ROUTE_MSG_VOICE} options={{headerTitle: '消息铃声检测'}}
                      getComponent={() => require("../../scene/home/Setting/MsgVoiceScene").default}/>
        <Stack.Screen name={Config.ROUTE_GUIDE} options={{headerTitle: '设置提醒教程'}}
                      getComponent={() => require("../../scene/home/Setting/GuideScene").default}/>
        <Stack.Screen name={Config.DIY_PRINTER} options={{headerTitle: '小票设置'}}
                      getComponent={() => require("../../scene/home/Setting/DiyPrinter").default}/>
        <Stack.Screen name={Config.DIY_PRINTER_ITEM}
                      getComponent={() => require("../../scene/home/Setting/DiyPrinterItem").default}/>
        <Stack.Screen name={Config.ROUTE_RECEIPT} options={{headerTitle: '小票'}}
                      getComponent={() => require("../../scene/home/Setting/ReceiptScene").default}/>
        <Stack.Screen name={Config.ROUTE_REMARK} options={{headerTitle: '自定义备注'}}
                      getComponent={() => require("../../scene/home/Setting/PrinterRemark").default}/>
        <Stack.Screen name={Config.ROUTE_REFUND_AUDIT} options={{headerTitle: '退单详情'}}
                      getComponent={() => require("../../scene/order/AuditRefundScene").default}/>
        <Stack.Screen name={Config.ROUTE_NEW_REFUND_AUDIT} options={{headerTitle: '退单详情'}}
                      getComponent={() => require("../../scene/order/newRefundScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_EDIT} options={{headerTitle: '修改订单信息'}}
                      getComponent={() => require("../../scene/order/OrderEditScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SETTING} options={{headerTitle: '创建订单'}}
                      getComponent={() => require("../../scene/order/OrderSettingPack").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_PACK} options={{headerTitle: '设置打包完成'}}
                      getComponent={() => require("../../scene/order/OrderSetPackDone").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_URGE} options={{headerTitle: '催单'}}
                      getComponent={() => require("../../scene/order/UrgeShipScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TODO} options={{headerTitle: '添加稍后处理事项'}}
                      getComponent={() => require("../../scene/order/OrderTodoScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_TO_INVALID} options={{headerTitle: '置为无效'}}
                      getComponent={() => require("../../scene/order/OrderToInvalidScene").default}
        />
        {/*<Stack.Screen name={Config.ROUTE_ORDER_TRANSFER_THIRD} options={{headerTitle: '发第三方配送'}}*/}
        {/*              getComponent={() => require("../../scene/order/OrderTransferThird").default}*/}
        {/*/>*/}

        <Stack.Screen name={Config.ROUTE_ORDER_CALL_DELIVERY} options={{headerShown: false}}
                      getComponent={() => require("../../scene/order/OrderCallDelivery").default}
        />

        {/*<Stack.Screen name={Config.ROUTE_ORDER_AIN_SEND} options={{headerTitle: '自配送'}}*/}
        {/*              getComponent={() => require("../../scene/order/OrderAinSend").default}*/}
        {/*/>*/}

        <Stack.Screen name={Config.ROUTE_ORDER_STORE} options={{headerTitle: '修改店铺'}}
                      getComponent={() => require("../../scene/order/OrderEditStoreScene").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_SHIP} options={{headerTitle: '取消配送'}}
                      getComponent={() => require("../../scene/order/OrderCancelShip").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_SEND_MONEY} options={{headerTitle: '发红包'}}
                      getComponent={() => require("../../scene/order/OrderSendMoney").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SURCHARGE} options={{headerTitle: '订单补偿'}}
                      getComponent={() => require("../../scene/order/OrderSurcharge").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH} options={{headerTitle: '订单搜索'}}
                      getComponent={() => require("../../scene/order/OrderSearchScene").default}/>
        <Stack.Screen name={Config.ROUTE_SEARCH_ORDER} options={{headerShown: false}}
                      getComponent={() => require("../../scene/order/SearchOrder").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN} options={{headerTitle: '订单过机'}}
                      getComponent={() => require("../../scene/order/OrderScan").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_SCAN_REDAY} options={{headerTitle: '扫码打包完成'}}
                      getComponent={() => require("../../scene/order/OrderSetReady").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_PACKAGE} options={{headerTitle: '拆单详情'}}
                      getComponent={() => require("../../scene/order/OrderPackage").default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_CANCEL_TO_ENTRY} options={{headerTitle: '退单商品入库'}}
                      getComponent={() => require("../../scene/order/OrderCancelToEntry").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_EXIT_LOG} options={{headerTitle: '订单出库详情'}}
                      getComponent={() => require("../../scene/order/OrderExitLog").default}/>
        <Stack.Screen name={Config.ROUTE_COMPLAIN} options={{headerTitle: '投诉信息'}}
                      getComponent={() => require("../../scene/order/_OrderScene/Complain").default}/>


        <Stack.Screen name={Config.ROUTE_ORDER_GOOD_COUPON} options={{headerTitle: '发送兑换码'}}
                      getComponent={() => require("../../scene/order/_GoodCoupon/SendRedeemCoupon").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_SEARCH_RESULT} options={{headerTitle: '全部订单'}}
                      getComponent={() => require("../../scene/order/OrderQueryResultScene").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_ADDRESS_BOOK} options={{headerTitle: '地址簿'}}
                      getComponent={() => require("../../scene/order/OrderAddressBook").default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_RECEIVING_INFO} options={{headerTitle: '收货信息'}}
                      getComponent={() => require("../../scene/order/OrderReceivingInfo").default}
        />
        <Stack.Screen name={Config.ROUTE_STORE} options={{headerTitle: '店铺管理'}}
                      getComponent={() => require("../../scene/home/Store/StoreScene").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_LIST} options={{headerShown: false}}
                      getComponent={() => require("../../scene/home/Store/StoreList").default}/>
        <Stack.Screen name={Config.ROUTE_SAVE_STORE} options={{headerShown: false}}
                      getComponent={() => require("../../scene/home/Store/SaveStore").default}/>

        <Stack.Screen name={Config.ROUTE_STORE_ADD} options={{headerShown: false}}
                      getComponent={() => require("../../scene/home/Store/StoreInfo").default}
                      initialParams={initialRouteParams}/>

        <Stack.Screen name={Config.ROUTE_STORE_RATE} options={{headerTitle: '店铺评分'}}
                      getComponent={() => require("../../scene/home/Store/StoreRate").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_RULE} options={{headerTitle: '规则处理'}}
                      getComponent={() => require("../../scene/home/Store/StoreRule").default}/>
        <Stack.Screen name={Config.PLATFORM_BIND} options={{headerTitle: '绑定平台信息'}}
                      getComponent={() => require("../../scene/home/Platform/PlatformBind").default}/>
        <Stack.Screen name={Config.ROUTE_EBBIND} options={{headerTitle: '饿了么零售'}}
                      getComponent={() => require("../../scene/home/Platform/EbBindScene").default}/>
        <Stack.Screen name={Config.ROUTE_SGBIND} options={{headerTitle: '美团闪购'}}
                      getComponent={() => require("../../scene/home/Platform/BindMeituanSg").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_STATUS} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../../scene/home/Store/StoreStatusScene").default}/>
        <Stack.Screen name={Config.ROUTE_STORE_SELECT} options={{headerTitle: '搜索店铺'}}
                      getComponent={() => require("../../scene/home/Store/StoreSelectScene").default}/>
        <Stack.Screen name={Config.ROUTE_COMES_BACK} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../../scene/home/Store/ComesBack").default}/>
        <Stack.Screen name={Config.ROUTE_COMES_BACK_INFO} options={{headerTitle: '店铺信息'}}
                      getComponent={() => require("../../scene/home/Store/ComesBackInfo").default}/>

        <Stack.Screen name={Config.ROUTE_STORE_CLOSE} options={{headerTitle: ''}}
                      getComponent={() => require("../../scene/home/Store/CloseStore").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_DETAIL} options={{headerTitle: '商品详情'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsDetailScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOOD_STORE_DETAIL} options={{headerTitle: '门店商品详情'}}
                      getComponent={() => require("../../scene/product/Goods/GoodStoreDetailScene").default}
        />
        {/*<Stack.Screen name={Config.ROUTE_VERSION} options={{headerTitle: '版本信息'}}*/}
        {/*              getComponent={() => require("../../scene/home/Mine/VersionScene").default}/>*/}
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_RECORD} options={{headerTitle: '申请记录'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsApplyRecordScene").default}
                      initialParams={initialRouteParams}/>

        <Stack.Screen name={Config.ROUTE_GOODS_EDIT}
                      getComponent={() => require("../../scene/product/Goods/GoodsEditScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_SELECT_SPEC} options={{headerTitle: '选择规格'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsSelectSpecScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_ADD_SPEC} options={{headerTitle: '新建规格'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsAddSpecScene").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_WORK_NEW_PRODUCT} options={{headerTitle: '申请工单上新'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsWorkNewProductScene").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_ADJUST} options={{headerTitle: '商品变动'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsAdjustScene").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_APPLY_PRICE} options={{headerTitle: '修改价格'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsApplyPrice").default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_INDEX} options={{headerTitle: '价格指数'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsPriceIndex").default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_ANALYSIS} options={{headerTitle: '热销新品上架'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsAnalysis").default}/>
        <Stack.Screen name={Config.ROUTE_GOODS_MARKET_EXAMINE} options={{headerTitle: '价格市调'}}
                      getComponent={() => require("../../scene/product/Goods/GoodsMarketExamine").default}
        />

        <Stack.Screen name={Config.ROUTE_SETTLEMENT} options={{headerTitle: '结算'}}
                      getComponent={() => require('../../scene/home/Settlement/SettlementScene').default}
        />
        <Stack.Screen name={Config.ROUTE_BIND_PAY} options={{headerTitle: '绑定账号'}}
                      getComponent={() => require('../../scene/home/Settlement/BindPay').default}
        />
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_DETAILS} options={{headerTitle: '结算详情'}}
                      getComponent={() => require('../../scene/home/Settlement/SettlementDetailsScene').default}
        />

        <Stack.Screen name={Config.ROUTE_DistributionAnalysis} options={{headerTitle: '数据分析'}}
                      getComponent={() => require('../../scene/home/Setting/DistributionanalysisScene').default}
        />
        <Stack.Screen name={Config.ROUTE_PROFITANDLOSS} options={{headerTitle: '盈亏明细'}}
                      getComponent={() => require('../../scene/home/Setting/ProfitAndLossScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_PLATFORM} options={{headerTitle: '平台结算'}}
                      getComponent={() => require('../../scene/home/Settlement/SettlementPlatform').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_BATCH_PRICE} options={{headerTitle: '批量改价'}}
                      getComponent={() => require('../../scene/product/Goods/GoodsBatchPriceScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_GOODS_RELATE} options={{headerTitle: '商品关联'}}
                      getComponent={() => require('../../scene/product/Goods/GoodsRelateScene').default}/>
        <Stack.Screen name={Config.ROUTE_HELP} options={{headerTitle: '帮助'}}
                      getComponent={() => require('../../scene/home/Help/HelpScene').default}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_PROFIT} options={{headerTitle: '运营收益'}}
                      getComponent={() => require('../../scene/operation/OperateProfitScene').default}/>
        <Stack.Screen name={Config.ROUTE_OPERATE_DETAIL} options={{headerTitle: '运营明细'}}
                      getComponent={() => require('../../scene/operation/OperateDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_INCOME_DETAIL} options={{headerTitle: '收入详情'}}
                      getComponent={() => require('../../scene/operation/OperateIncomeDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_EXPEND_DETAIL}
                      getComponent={() => require('../../scene/operation/OperateExpendDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL} options={{headerTitle: '其他支出流水'}}
                      getComponent={() => require('../../scene/operation/OperateOtherExpendDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_COMMODITY_PRICING} options={{headerTitle: '商品调价信息'}}
                      getComponent={() => require('../../scene/product/Goods/GoodsCommodityPricingScene').default}
        />
        <Stack.Screen name={Config.ROUTE_GOODS_PRICE_DETAIL} options={{headerTitle: '价格监管'}}
                      getComponent={() => require('../../scene/product/Goods/GoodsPriceDetailsScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SETTLEMENT_GATHER} options={{headerTitle: '月销量汇总'}}
                      getComponent={() => require('../../scene/home/Settlement/SettlementGatherScene').default}
        />
        <Stack.Screen name={Config.ROUTE_JD_AUDIT_DELIVERY} options={{headerTitle: '审核配送失败'}}
                      getComponent={() => require('../../scene/order/JdAuditDeliveryScene').default}
        />
        <Stack.Screen name={Config.ROUTE_SEARCH_GOODS}
                      getComponent={() => require('../../scene/product/Goods/SearchGoods').default}
        />
        <Stack.Screen name={Config.ROUTE_ONLINE_STORE_PRODUCT} options={{headerTitle: '上架商品'}}
                      getComponent={() => require('../../scene/product/Goods/OnlineStoreProduct').default}
        />

        <Stack.Screen name={Config.ROUTE_CREATE_NEW_GOOD_REMIND} options={{headerTitle: '申请上新'}}
                      getComponent={() => require('../../scene/product/Goods/CreateApplyNewProductRemindScene').default}
        />
        <Stack.Screen name={Config.ROUTE_REFUND_DETAIL} options={{headerTitle: '退单详情'}}
                      getComponent={() => require('../../scene/order/Refund').default}
        />
        <Stack.Screen name={Config.ROUTE_INVOICING} options={{headerTitle: '进销存系统'}}
                      getComponent={() => require('../../scene/product/Invoicing/InvoicingScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_GATHER_DETAIL}
                      getComponent={() => require('../../scene/product/Invoicing/InvoicingGatherDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_DETAIL}
                      getComponent={() => require('../../scene/product/Invoicing/InvoicingShippingDetailScene').default}/>
        <Stack.Screen name={Config.ROUTE_INVOICING_SHIPPING_LIST} options={{headerTitle: '进销存系统'}}
                      getComponent={() => require('../../scene/product/Invoicing/InvoicingShippingScene').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_NEW_GOODS_SEARCH} options={{headerTitle: '商品搜索'}}
                      getComponent={() => require('../../scene/product/Goods/StoreGoodsSearch').default}/>
        <Stack.Screen name={Config.ROUTE_SEARCH_AND_CREATE_GOODS} options={{headerTitle: '搜索新建商品'}}
                      getComponent={() => require('../../scene/product/Goods/SearchAndCreateGoodsScene').default}/>
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE} options={{headerTitle: '账户清单'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/SeparatedExpense').default}
        />
        <Stack.Screen name={Config.ROUTE_OLDSEP_EXPENSE} options={{headerTitle: '账户清单'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/OldSeparatedExpense').default}
        />
        <Stack.Screen name={Config.ROUTE_SEP_EXPENSE_INFO} options={{headerTitle: '清单详情'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/SeparatedExpenseInfo').default}
        />

        <Stack.Screen name={Config.ROUTE_SERVICE_CHARGE_INFO} options={{headerTitle: '账单明细'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/ServiceChargeInfo').default}
        />

        <Stack.Screen name={Config.ROUTE_SERVICE_CHARGE_DESC} options={{headerTitle: '计费规则'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/ServiceChargeDesc').default}
        />


        <Stack.Screen name={Config.ROUTE_FREEZE_LIST} options={{headerTitle: ""}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/FreezeList').default}
        />

        <Stack.Screen name={Config.ROUTE_ACCOUNT_FILL} options={{headerTitle: '我的钱包'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/SeparatedAccountFill').default}/>
        <Stack.Screen name={Config.ROUTE_TRIPARTITE_RECHARGE} options={{headerTitle: '三方充值'}}
                      getComponent={() => require('../../scene/home/SeparatedExpense/TripartiteRecharge').default}/>
        <Stack.Screen name={Config.ROUTE_SELECT_CITY_LIST} options={{headerTitle: '选择城市'}}
                      getComponent={() => require('../../scene/home/Store/SelectCity').default}/>
        <Stack.Screen name={Config.ROUTE_SELECT_QUALIFICATION} options={{headerTitle: '提交资质'}}
                      getComponent={() => require('../../scene/home/Store/Qualification').default}/>
        {/*<Stack.Screen name={Config.ROUTE_SUPPLEMENT_WAGE} options={{headerTitle: '提成预估'}}*/}
        {/*              getComponent={() => require('../../scene/home/User/SupplementWage').default}/>*/}

        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_PUT_IN} options={{headerTitle: '商品入库'}}
                      getComponent={() => require('../../scene/product/Inventory/ProductPutIn').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_PRODUCT_INFO} options={{headerTitle: '库管详情'}}
                      getComponent={() => require('../../scene/product/Inventory/ProductInfo').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_LIST}
                      getComponent={() => require('../../scene/product/Inventory/MaterialList').default}/>
        <Stack.Screen name='InventoryHome' options={{headerTitle: '库存'}}
                      getComponent={() => require('../../scene/product/Inventory/InventoryHome').default}/>
        <Stack.Screen name='InventoryItems' options={{headerTitle: '库存'}}
                      getComponent={() => require('../../scene/product/Inventory/InventoryItems').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_PUT_IN} options={{headerTitle: '原料入库'}}
                      getComponent={() => require('../../scene/product/Inventory/MaterialPutIn').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE} options={{headerTitle: '原料收货详情'}}
                      getComponent={() => require('../../scene/product/Inventory/MaterialDetailUpdate').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_PUT_IN} options={{headerTitle: '标品入库'}}
                      getComponent={() => require('../../scene/product/Inventory/StandardPutIn').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE} options={{headerTitle: '标品入库'}}
                      getComponent={() => require('../../scene/product/Inventory/StandardDetailUpdate').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK} options={{headerTitle: '任务中心'}}
                      getComponent={() => require('../../scene/product/Inventory/MaterialTask').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_MATERIAL_TASK_FINISH} options={{headerTitle: '我完成的任务'}}
                      getComponent={() => require('../../scene/product/Inventory/MaterialTaskFinish').default}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK} options={{headerTitle: '库存盘点'}}
                      getComponent={() => require('../../scene/product/Inventory/StockCheck').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY} options={{headerTitle: '商品盘点历史'}}
                      getComponent={() => require('../../scene/product/Inventory/StockCheckHistory').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_REPORT_LOSS} options={{headerTitle: '商品报损'}}
                      getComponent={() => require('../../scene/product/Inventory/ReportLoss').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_INVENTORY_DETAIL} options={{headerTitle: '商品出入库明细'}}
                      getComponent={() => require('../../scene/product/Inventory/Detail').default}
                      initialParams={initialRouteParams}/>
        <Stack.Screen name={Config.ROUTE_SEARC_HSHOP} options={{headerShown: false}}
                      getComponent={() => require('../component/SearchShop').default}
        />
        <Stack.Screen name={Config.ROUTE_SHOP_ORDER} options={{headerTitle: '选填订单信息'}}
                      getComponent={() => require('../../scene/home/Store/StoreOrderMsg').default}/>
        <Stack.Screen name={Config.ROUTE_SHOP_BANK} options={{headerTitle: '选填银行卡信息'}}
                      getComponent={() => require('../../scene/home/Store/StoreBankMsg').default}/>
        <Stack.Screen name={Config.ROUTE_BIND_MEITUAN} options={{headerTitle: '绑定美团外卖'}}
                      getComponent={() => require('../../scene/home/Platform/BindMeituan').default}/>
        <Stack.Screen name={Config.ROUTE_BIND_SET_MEITUAN} options={{headerTitle: '美团外卖更换绑定说明'}}
                      getComponent={() => require('../../scene/home/Platform/BindSetMeituan').default}/>

        <Stack.Screen name={Config.ROUTE_WORKER} options={{headerTitle: '员工管理'}}
                      getComponent={() => require('../../scene/home/Worker/WorkerListScene').default}/>
        <Stack.Screen name={Config.ROUTE_WORKER_SCHEDULE} options={{headerTitle: '排班详情'}}
                      getComponent={() => require('../../scene/home/Worker/WorkerSchedule').default}/>
        <Stack.Screen name={Config.ROUTE_ZT_ORDER_PRINT} options={{headerTitle: '打印自提单'}}
                      getComponent={() => require('../../scene/order/Ziti/OrderPrint').default}/>
        <Stack.Screen name={Config.ROUTE_CONSOLE_STOCKING_TASKS} options={{headerTitle: '备货'}}
                      getComponent={() => require('../../scene/console/StockingTasks').default}/>
        <Stack.Screen name={Config.ROUTE_ORDER_RETAIL_PRICE} options={{headerTitle: '零售价格'}}
                      getComponent={() => require('../../scene/order/RetailPriceScene').default}
        />
        <Stack.Screen name={Config.ROUTE_HOME_SETTLEMENT_STALL_SETTLEMENT} options={{headerTitle: '摊位结算'}}
                      getComponent={() => require('../../scene/home/stall/StallSettlementScene').default}
        />
        <Stack.Screen name={Config.ROUTE_HOME_SETTLEMENT_STALL_DETAIL} options={{headerTitle: '摊位详情 '}}
                      getComponent={() => require('../../scene/home/stall/StallDetailScene').default}
        />
        <Stack.Screen name={Config.ROUTE_CONSOLE_SIGN_IN} options={{headerTitle: '打卡'}}
                      getComponent={() => require('../../scene/console/SignInScene').default}/>
        <Stack.Screen name={Config.ROUTE_BAD_REVIEW_REMINDER}
                      options={{headerTitle: '差评提醒'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/BadReviewReminderScene').default}
        />
        <Stack.Screen name={Config.ROUTE_AUTOMATIC_FEEDBACK}
                      options={{headerTitle: '自动回评'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/AutomaticFeedbackScene').default}
        />
        <Stack.Screen name={Config.ROUTE_AUTOMATIC_PACKAGING}
                      options={{headerTitle: '自动打包'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/AutomaticPackagingScene').default}
        />
        <Stack.Screen name={Config.ROUTE_TEMPLATE_SETTINGS}
                      options={{headerTitle: '模板设置'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/TemplateSettingsScene').default}
        />
        <Stack.Screen name={Config.ROUTE_INCREMENT_SERVICE_DESCRIPTION}
                      options={{title: '功能详情'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/IncrementServiceDescription').default}
        />
        <Stack.Screen name={Config.ROUTE_OPEN_MEMBER}
                      options={{title: '开通会员权限'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/OpenMemberScene').default}/>
        <Stack.Screen name={Config.ROUTE_Member_Agreement}
                      options={{title: '会员服务协议'}}
                      getComponent={() => require('../../scene/home/GoodsIncrementService/MemberAgreementScene').default}/>
        <Stack.Screen name={Config.ROUTE_AUTO_CALL_DELIVERY}
                      options={{headerTitle: '自动呼叫配送介绍'}}
                      getComponent={() => require('../../scene/home/Delivery/AutoCallDelivery').default}
        />
        <Stack.Screen name={Config.ROUTE_ORDER_RETAIL_PRICE_NEW}
                      options={{headerTitle: '零售价格'}}
                      getComponent={() => require('../../scene/order/NewRetailPriceScene').default}/>


        <Stack.Screen name={Config.RIDER_TRSJECTORY}
                      options={{headerTitle: '地图'}}
                      getComponent={() => require('../../scene/order/RiderTrajectory').default}/>
        <Stack.Screen name={Config.ROUTE_ADD_MISSING_PICTURE}
                      options={{headerTitle: '添加图片'}}
                      getComponent={() => require('../../scene/product/Goods/AddMissingPictureScene').default}/>
        <Stack.Screen name={Config.ROUTE_PER_IDENTIFY}
                      options={{headerTitle: '账号管理'}}
                      getComponent={() => require('../../scene/home/Setting/AccountManagement').default}/>
        <Stack.Screen name={Config.ROUTE_ADD_ACCOUNT}
                      options={{headerTitle: '添加员工'}}
                      getComponent={() => require('../../scene/home/Setting/AddAccount').default}/>
        <Stack.Screen name={Config.ROUTE_EDIT_ACCOUNT}
                      options={{headerTitle: '编辑账号'}}
                      getComponent={() => require('../../scene/home/Setting/EditAccount').default}/>
        <Stack.Screen name={Config.ROUTE_CHANGE_DELIVERY_ACCOUNT}
                      getComponent={() => require('../../scene/home/Delivery/ChangeDeliveryAccount').default}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
let notInit = true

class AppNavigator extends PureComponent {

  checkVersion = () => {
    HttpUtils.get('/api/check_version', {r: DeviceInfo.getBuildNumber()}).then(res => {
      if (res.yes) {
        Alert.alert('新版本提示', res.desc, [
          {text: '稍等再说', style: 'cancel'},
          {
            text: '现在更新',
            style: 'default',
            onPress: async () => {
              await downloadApk({
                interval: 250, // listen to upload progress event, emit every 666ms
                apkUrl: res.download_url,
                downloadInstall: true
              })
            }
          },
        ])
      }
    })
  }

  handleNoLoginInfo = (reduxGlobal) => {
    if ((dayjs().valueOf() - reduxGlobal?.getTokenTs) / 1000 >= reduxGlobal?.expireTs * 0.9 && reduxGlobal?.refreshToken)
      this.refreshAccessToken(reduxGlobal?.refreshToken)
    if (reduxGlobal.vendor_id === '' || reduxGlobal.vendor_id === undefined || reduxGlobal?.vendor_id === '' || reduxGlobal?.printer_id === '') {
      return;
    }
    if (reduxGlobal.store_id === 0)
      return;
    if (reduxGlobal.vendor_id === 0)
      return;
    const flag = reduxGlobal.accessToken === global.noLoginInfo.accessToken &&
      reduxGlobal.currentUser === global.noLoginInfo.currentUser &&
      reduxGlobal.store_id === global.noLoginInfo.store_id &&
      reduxGlobal.host === global.noLoginInfo.host &&
      reduxGlobal.vendor_id === global.noLoginInfo.currVendorId &&
      reduxGlobal?.enabled_good_mgr === global.noLoginInfo.enabledGoodMgr &&
      reduxGlobal?.printer_id === global.noLoginInfo.printer_id &&
      reduxGlobal?.order_list_by === global.noLoginInfo?.order_list_by

    if (flag) {
      return
    }
    const noLoginInfo = {
      accessToken: reduxGlobal.accessToken,
      currentUser: reduxGlobal.currentUser,
      currStoreId: reduxGlobal.store_id,
      host: reduxGlobal.host || Config.defaultHost,
      enabledGoodMgr: reduxGlobal.enabled_good_mgr,
      currVendorId: reduxGlobal.vendor_id,
      printer_id: reduxGlobal.printer_id || '0',
      show_bottom_tab: reduxGlobal.show_bottom_tab,
      autoBluetoothPrint: reduxGlobal.autoBluetoothPrint,
      refreshToken: reduxGlobal.refreshToken,
      expireTs: reduxGlobal.expireTs,
      getTokenTs: reduxGlobal.getTokenTs,
      order_list_by: reduxGlobal.order_list_by,
    }
    global.noLoginInfo = noLoginInfo
    setNoLoginInfo(JSON.stringify(noLoginInfo))

  }

  refreshAccessToken = (refreshToken) => {
    const url = `/v4/WsbUser/refreshToken`
    const params = {refresh_token: refreshToken}
    const {dispatch} = this.props
    HttpUtils.post(url, params).then(res => {
      const {access_token, refresh_token, expires_in: expires_in_ts} = res;
      dispatch(setAccessToken({access_token, refresh_token, expires_in_ts}))
    })
  }
  initJPush = () => {

    JPush.setLoggerEnable(false)
    JPush.init()
    JPush.addConnectEventListener(({connectEnable}) => {
      //console.log("connectEnable:" + connectEnable)
      if (connectEnable)
        doJPushSetAlias(currentUser);
    })

    // JPush.getRegistrationID(({registerID}) => {
    //     console.log("registerID:" + JSON.stringify(registerID))
    //   }
    // )
    const {accessToken, autoBluetoothPrint, currentUser, currStoreId} = this.props.global
    //tag alias事件回调
    JPush.addTagAliasListener(({code}) => {
      //console.log("tagAliasListener:" + code)
      if (code) {
        doJPushSetAlias(currentUser)
      }
    });
    //通知回调

    JPush.addNotificationListener(async ({messageID, extras, notificationEventType}) => {
      // console.log("notificationListener,extras:" + JSON.stringify(extras))
      // console.log("notificationListener,notificationEventType:" + notificationEventType)
      const {type, order_id} = extras
      if ('notificationArrived' === notificationEventType) {
        if (type !== 'new_order') {
          sendDeviceStatus(accessToken, {
            msgId: messageID,
            listener_stores: currStoreId,
            orderId: order_id,
            btConnected: '收到极光推送，不是新订单不需要打印',
            auto_print: autoBluetoothPrint
          })
          return
        }
        await handlePrintOrder(this.props, {msgId: messageID, orderId: order_id, listener_stores: currStoreId})
      }
      if ('notificationOpened' === notificationEventType) {
        JPush.setBadge({appBadge: 0, badge: 0})
      }
    });
  }

  whiteNoLoginInfo = () => {
    this.unSubscribe = store.subscribe(async () => {
      const {global} = store.getState()
      this.handleNoLoginInfo(global)
      const {accessToken, lastCheckVersion = 0} = global;
      //如果登录了，才可以进行后续的初始化，并且只初始化一次
      if (accessToken && notInit) {
        notInit = false
        this.initJPush()
        if (Platform.OS === 'android') {
          await native.xunfeiIdentily()
          await this.calcAppStartTime()
        }
        await initBlueTooth(global)

        const currentTs = dayjs().valueOf()
        if (currentTs - lastCheckVersion > 8 * 3600 && Platform.OS !== 'ios') {
          store.dispatch(setCheckVersionAt(currentTs))
          this.checkVersion();
        }

        GlobalUtil.getDeviceInfo().then(deviceInfo => store.dispatch(setDeviceInfo(deviceInfo)))

        AMapSdk.init(
          Platform.select({
            android: "1d669aafc6970cb991f9baf252bcdb66",
            ios: "48148de470831f4155abda953888a487",
          })
        );
      }
    })
  }

  componentDidMount() {
    this.whiteNoLoginInfo()
  }

  componentWillUnmount() {
    this.unSubscribe()
    //this.iosBluetoothPrintListener && this.iosBluetoothPrintListener.remove()
    //this.androidBluetoothPrintListener && this.androidBluetoothPrintListener.remove()
    unInitBlueTooth()
  }


  calcAppStartTime = async () => {
    await native.getStartAppTime((flag, startAppTime) => {
      if (flag) {
        const startAppEndTime = dayjs().valueOf()
        const duration = startAppEndTime - parseInt(startAppTime)
        if (global.isLoginToOrderList)
          return
        const {currStoreId, currentUser} = this.props.global

        nrRecordMetric("start_app_end_time", {
          startAppTimeDuration: duration,
          store_id: currStoreId,
          user_id: currentUser
        })
      }
    })
  }

  // printByBluetoothIOS = () => {
  //   const {global} = this.props
  //   let {accessToken, autoBluetoothPrint} = global;
  //   //const iosEmitter = new NativeEventEmitter(NativeModules.IOSToReactNativeEventEmitter)
  //   // this.iosBluetoothPrintListener = iosEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, async (obj) => {
  //   //   if (obj.order_type !== 'new_order') {
  //   //     sendDeviceStatus(accessToken, {
  //   //       ...obj,
  //   //       btConnected: '收到极光推送，不是新订单不需要打印',
  //   //       auto_print: autoBluetoothPrint
  //   //     })
  //   //     return
  //   //   }
  //   //   await handlePrintOrder(this.props, obj)
  //   // })
  // }


  // printByBluetoothAndroid = () => {
  //   this.androidBluetoothPrintListener = DeviceEventEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, async (obj) => {
  //     await handlePrintOrder(this.props, obj)
  //
  //   })
  // }

  // printByBluetooth = () => {
  //   switch (Platform.OS) {
  //     case "ios":
  //       this.printByBluetoothIOS()
  //       break
  //     case "android":
  //       this.printByBluetoothAndroid()
  //       break
  //   }
  // }


  render() {
    const {initialRouteName, initialRouteParams} = this.props;
    return (
      <Page initialRouteName={initialRouteName} initialRouteParams={initialRouteParams}/>
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(AppNavigator);
