'use strict';

import GlobalUtil from "../util/GlobalUtil";
import {Platform} from "react-native";

export function apiUrl(path) {
  const hp = GlobalUtil.getHostPort() || C.defaultHost;
  return `https://${hp}/${path}`;
}

export function staticUrl(path) {
  if (path !== null) {
    let isFullUrl = path.indexOf("http");
    if (isFullUrl === -1) {
      return serverUrl(path, true);
    }
    if (path) {
      return path.replace("http://", "https://");
    }
    return path;

  }
}


/**
 * get server url
 * @param path string
 * @param useHttps
 * @returns {string}
 */
export function serverUrl(path, useHttps = true) {
  const proto = useHttps ? "https" : "http";
  const hp = GlobalUtil.getHostPort() || C.defaultHost;
  path = path[0] === "/" ? path.substr(1) : path;
  return `${proto}://${hp}/${path}`;
}

export function hostPort() {
  return global.hostPort ? global.hostPort : C.defaultHost;
}

/**
 * 系统参数配置信息
 */
const C = {
  https: true,
  /** Host应该根据设置从系统中获得 (see #host)，而不是直接写死；实在没有，才从这里获得 */
  defaultHost: "www.waisongbang.com",
  AppName: "Crm",

  DownloadUrl: `https://api.waisongbang.com/util/crm_dl`,
  MAP_WAY_URL: "util/amap_way",
  FetchTimeout: 60000,
  LongFetchTimeout: 200000,

  GRANT_TYP_PASSWORD: "password",
  GRANT_CLIENT_ID: "NTQ5NTE5MGViMTgzMDUw",

  ACCESS_TOKEN_EXPIRE_DEF_SECONDS: 3600,

  LOC_PICKER: "loc_picker",

  STORE_VENDOR_CACHE_TS: 86400, //店铺/品牌的缓存过期时间

  ROUTE_WEB: 'Web',
  ROUTE_LOGIN: 'Login',
  ROUTE_ORDER: 'Order',
  ROUTE_ORDER_NEW: 'OrderNew',
  ROUTE_OPERATION_LOG: 'OrderOperationLog',
  ROUTE_ALERT: 'Tab', //home for reminds
  ROUTE_ORDERS: 'Orders',
  ROUTE_ORDER_ALL: 'OrderAll',
  ROUTE_USER: 'User',
  ROUTE_USER_ADD: 'UserAdd',
  ROUTE_USER_CHOOSE: 'UserChoose',
  ROUTE_MINE: 'Mine',
  ROUTE_MINE_NEW: 'MineNew',
  ROUTE_SETTING: 'Setting',
  ROUTE_CLOUD_PRINTER: 'CloudPrinter',
  ROUTE_PRINTER_CONNECT: 'PrinterConnect',
  ROUTE_ORDER_URGE: 'UrgeOrder',
  ROUTE_REFUND_AUDIT: 'AuditRefund',
  ROUTE_NEW_REFUND_AUDIT: 'newAuditRefund',
  ROUTE_ORDER_EDIT: 'OrderEdit',
  ROUTE_ORDER_SETTING: 'SettingOrders',       // 新建订单
  ROUTE_ORDER_TO_INVALID: 'OrderToInvalid',
  ROUTE_ORDER_CALL_SHIP: 'OrderCallShip',
  ROUTE_ORDER_TRANSFER_THIRD: 'OrderTransferThird',
  ROUTE_ORDER_CALL_DELIVERY: 'OrderCallDelivery',
  ROUTE_ORDER_AIN_SEND: 'orderAinSend',
  ROUTE_ORDER_PACK: 'OrderSetPack',
  ROUTE_ORDER_START_SHIP: 'OrderStartShip',
  ROUTE_ORDER_CANCEL_SHIP: 'OrderCancelShip',
  ROUTE_ORDER_SHIP_DETAIL: 'OrderShipDetail',
  ROUTE_ORDER_TODO: 'OrderTodo',
  ROUTE_ORDER_STORE: 'OrderChgStore',
  ROUTE_ORDER_SEND_MONEY: 'OrderSendMoney',
  ROUTE_ORDER_SURCHARGE: 'OrderSurcharge',                            // 订单补偿
  ROUTE_ORDER_SCAN: 'OrderScan',                                      // 订单扫码过机
  ROUTE_ORDER_REFUND_BY_WEIGHT: 'OrderRefundByWeight',                // 订单按重退款
  ROUTE_ORDER_SCAN_REDAY: 'OrderSetReady',
  ROUTE_ORDER_PACKAGE: 'OrderPackage',                                // 订单拆单分包
  ROUTE_ORDER_CANCEL_TO_ENTRY: 'OrderCancelToEntry',                  // 退单商品入库
  ROUTE_ORDER_EXIT_LOG: 'OrderExitLog',                               // 订单出库记录
  ROUTE_COMPLAIN: 'Complain',
  ROUTE_ORDER_GOOD_COUPON: 'SendRedeemCoupon',
  ROUTE_ORDER_SEARCH_RESULT: 'OrderSearchResult',
  ROUTE_ORDER_ADDRESS_BOOK: 'OrderAddressBook',
  ROUTE_ORDER_RECEIVING_INFO: 'OrderReceivingInfo',
  ROUTE_ORDER_RETAIL_PRICE: 'RetailPrice',

  ROUTE_CONSOLE_STOCKING_TASKS: 'STOCKING_TASKS',//备货任务
  ROUTE_CONSOLE_SIGN_IN: 'SignIn',
  ROUTE_HOME_SETTLEMENT_STALL_SETTLEMENT: 'StallSettlementScene',//摊位汇总
  ROUTE_HOME_SETTLEMENT_STALL_DETAIL: 'StallDetail',//摊位详情
  ROUTE_HOME_SETTLEMENT_STALL_DETAILS: 'StallDetails',//摊位明细

  ROUTE_BAD_REVIEW_REMINDER: 'ROUTE_BAD_REVIEW_REMINDER',//差评提醒
  ROUTE_AUTOMATIC_FEEDBACK: 'ROUTE_AUTOMATIC_FEEDBACK',//自动回评
  ROUTE_AUTOMATIC_PACKAGING: 'ROUTE_AUTOMATIC_PACKAGING',//自动打包
  ROUTE_TEMPLATE_SETTINGS: 'ROUTE_TEMPLATE_SETTINGS',//回评模板
  ROUTE_INCREMENT_SERVICE_DESCRIPTION: 'ROUTE_INCREMENT_SERVICE_DESCRIPTION',//详情介绍
  ROUTE_OPEN_MEMBER: 'ROUTE_OPEN_MEMBER',//开通会员
  ROUTE_Member_Agreement: 'ROUTE_Member_Agreement',//会员协议

  ROUTE_STORE: 'Store',
  ROUTE_STORE_LIST: 'StoreList',
  ROUTE_SAVE_STORE: 'SaveStore',
  ROUTE_STORE_ADD: 'StoreAdd',
  ROUTE_STORE_RATE: 'StoreRate',
  ROUTE_STORE_RULE: 'StoreRule',
  ROUTE_DONE_REMIND: 'DoneRemind',
  PLATFORM_BIND: 'PlatformBind',
  ROUTE_EBBIND: 'EbBindScence',
  ROUTE_SGBIND: 'BindMeituanSg',
  ROUTE_TAKE_OUT: 'TakeOut',
  ROUTE_STORE_STATUS: 'StoreStatus',
  ROUTE_STORE_SELECT: 'StoreSelect',
  ROUTE_COMES_BACK: 'ComesBack',
  ROUTE_COMES_BACK_INFO: 'ComesBackInfo',
  ROUTE_STORE_CLOSE: 'StoreClose',
  ROUTE_GOODS_DETAIL: 'GoodsDetail',
  ROUTE_GOOD_STORE_DETAIL: 'GoodStoreDetail',
  ROUTE_ORDER_SEARCH: 'OrderSearch',
  ROUTE_SEARCH_ORDER: 'SearchOrder',
  ROUTE_ORDER_INVALID: 'OrderInvalid',
  ROUTE_ORDER_SERIOUS_DELAY: 'OrderSeriousDelay',
  ROUTE_ORDER_PEND_PAYMENT: 'OrderPendingPayment',
  ROUTE_VERSION: 'Version',
  ROUTE_GOODS: 'goods',
  ROUTE_SELECT_STORE: 'SelectStore',
  ROUTE_GOODS_EDIT: 'GoodsEdit',
  ROUTE_GOODS_CLASSIFY: 'GoodsClassify',
  ROUTE_GOODS_BATCH_PRICE: 'GoodsBatchPrice',
  ROUTE_GOODS_APPLY_RECORD: 'GoodsApplyRecord',
  ROUTE_STORE_GOODS_EDIT: 'StoreGoodsEdit',
  ROUTE_GOODS_SOLDOUT: 'GoodsSoldout',                // 订单按重退款
  ROUTE_HELP: 'Help',
  ROUTE_SETTLEMENT: 'Settlement',
  ROUTE_BIND_PAY: 'BindPay',
  ROUTE_DistributionAnalysis: 'DistributionAnalysis', // 数据分析
  ROUTE_PROFITANDLOSS: 'ProfitAndLoss',
  ROUTE_SETTLEMENT_DETAILS: 'SettlementDetails',
  ROUTE_SETTLEMENT_PLATFORM: 'SettlementPlatform',
  ROUTE_SETTLEMENT_ORDER: 'SettlementOrder',
  ROUTE_SELECT_WORKER: 'SelectWorkerScene',
  ROUTE_GOODS_RELATE: 'GoodsRelate',
  ROUTE_GOODS_WORK_NEW_PRODUCT: 'GoodsWorkNewProduct',
  ROUTE_OPERATE_PROFIT: 'OperateProfit',
  ROUTE_OPERATE_DETAIL: 'OperateDetail',
  ROUTE_OPERATE_INCOME_DETAIL: 'OperateIncomeDetail',
  ROUTE_OPERATE_EXPEND_DETAIL: 'OperateExpendDetail',
  ROUTE_OPERATE_OTHER_EXPEND_DETAIL: 'OperateOtherExpendDetail',
  ROUTE_SEP_EXPENSE: 'SeparatedExpense',        //独立费用账单
  ROUTE_PER_IDENTIFY: 'PermissionToIdentify',        //权限标识
  ROUTE_ADD_ACCOUNT: 'AddAccount',        //添加员工
  ROUTE_EDIT_ACCOUNT: 'EditAccount',        //编辑员工
  ROUTE_OLDSEP_EXPENSE: 'OldSeparatedExpense',        //老版独立费用账单
  ROUTE_SEP_EXPENSE_INFO: 'SeparatedExpenseInfo',        //账单详细
  ROUTE_SERVICE_CHARGE_INFO: 'ServiceChargeInfo',        //服务费详细
  ROUTE_SERVICE_CHARGE_DESC: 'ServiceChargeDesc',        //服务费详细
  ROUTE_FREEZE_LIST: 'FREEZE_LIST',        //冻结列表
  ROUTE_PLATFORM_LIST: 'PlatformScene',        //独立费用账单
  ROUTE_ACCOUNT_FILL: 'SeparatedAccountFill',             //独立帐户充值
  ROUTE_TRIPARTITE_RECHARGE: 'TripartiteRecharge',             //独立帐户充值
  // ROUTE_DELIVERY_LIST: 'DeliveryScene',
  ROUTE_BIND_DELIVERY: 'BindDelivery',
  ROUTE_BIND_SHUNFENG: 'BindShunfeng',
  ROUTE_REGISTER_SHUNFENG: 'RegisterShunfeng',
  ROUTE_APPLY_DELIVERY: 'ApplyDelivery',
  ROUTE_PRINTERS: 'PrinterSetting',
  ROUTE_INFORM: 'InfromSetting',              //通知设置
  ROUTE_PUSH: 'PushSetting',                  //推送设置
  ROUTE_HISTORY_NOTICE: 'HistoryNoticeScene', //  历史公告
  ROUTE_DETAIL_NOTICE: 'DetailNoticeScene', // 公告详情
  ROUTE_MSG_VOICE: 'MsgVoiceScene',              //消息铃声设置检测
  ROUTE_GUIDE: 'GuideScene',              //消息铃声设置检测
  DIY_PRINTER: 'Diyprinter',              //小票设置
  DIY_PRINTER_ITEM: 'DiyprinterItem',              //小票详情设置
  ROUTE_RECEIPT: 'ReceiptScene',              //小票预览
  ROUTE_REMARK: 'PrinterRemark',              //小票备注
  ROUTE_SEETING_DELIVERY: 'SeetingDelivery',
  ROUTE_SEETING_DELIVERY_INFO: 'SettingDeliveryInfo',//设置配送方式
  ROUTE_AUTO_CALL_DELIVERY: 'AutoCallDelivery',
  ROUTE_ORDER_RETAIL_PRICE_NEW: 'NewRetailPrice',
  ROUTE_SEETING_DELIVERY_ORDER: 'DistributionOrder',   //就近分派订单
  ROUTE_SEETING_PREFERENCE_DELIVERY: 'PreferenceBillingSetting',   //偏好发单设置
  ROUTE_SEETING_MININUM_DELIVERY: 'SeetingMiniNumDelivery',   //保底配送
  ROUTE_GOODS_MANAGE: 'GoodsManage',
  ROUTE_GOODS_COMMODITY_PRICING: 'GoodsCommodityPricing',
  ROUTE_GOODS_PRICE_DETAIL: 'GoodsPriceDetails',
  ROUTE_SETTLEMENT_GATHER: 'SettlementGather',
  ROUTE_ACTIVITY_RULE: 'ActivityRule',
  ROUTE_ACTIVITY_EDIT_RULE: 'ActivityEditRule',
  ROUTE_ACTIVITY_SELECT_STORE: 'ActivitySelectStore',
  ROUTE_ACTIVITY_MANAGE: 'ActivityManage',
  ROUTE_ACTIVITY_SELECT_GOOD: 'ActivitySelectGood',
  ROUTE_ACTIVITY_CLASSIFY: 'ActivitySelectClassify',
  ROUTE_ACTIVITY_LIST: 'ActivityList',
  ROUTE_JD_AUDIT_DELIVERY: 'JdAuditDelivery',
  ROUTE_SCAN: 'Scan',
  ROUTE_CREATE_NEW_GOOD_REMIND: 'CreateApplyNewProductRemind',
  ROUTE_GOODS_SCAN_SEARCH: 'GoodsScanSearch',
  ROUTE_CREATE_SCAN: 'CreateScan',
  ROUTE_SEARCH_GOODS: 'SearchGoods',
  ROUTE_STORE_GOODS_LIST: 'goods',
  ROUTE_NEW_GOODS_SEARCH: 'StoreGoodsSearch',
  ROUTE_SEARCH_AND_CREATE_GOODS: 'SearchAndCreateGoodsScene',
  ROUTE_ONLINE_STORE_PRODUCT: 'OnlineStoreProduct',
  ROUTE_ADD_MISSING_PICTURE: 'ROUTE_ADD_MISSING_PICTURE',//添加缺失图片

  ROUTE_INVOICING: 'Invoicing',
  ROUTE_INVOICING_GATHER_DETAIL: 'InvoicingGatherDetail',
  ROUTE_INVOICING_SHIPPING_DETAIL: 'InvoicingShippingDetail',
  ROUTE_INVOICING_SHIPPING_LIST: 'InvoicingShippingList',
  ROUTE_REFUND_DETAIL: 'RefundDetail',
  ROUTE_SELECT_CITY_LIST: "SelectCity",
  ROUTE_SELECT_QUALIFICATION: "Qualification",
  ROUTE_GOODS_LIST: 'GoodsList',
  ROUTE_GOODS_ADJUST: 'GoodsAdjust',
  ROUTE_GOODS_APPLY_PRICE: 'GoodsApplyPrice',
  ROUTE_GOODS_PRICE_INDEX: 'GoodsPriceIndex',
  ROUTE_GOODS_ANALYSIS: 'GoodsAnalysis',
  ROUTE_GOODS_MARKET_EXAMINE: 'GoodsMarketExamine',                             // 商品-市调
  ROUTE_GOODS_MARKET_EXAMINE_HISTORY: 'GoodsMarketExamineHistory',              // 商品-市调历史
  ROUTE_AREA_GOODS_PRICE: 'AreaGoodsPrice',
  ROUTE_SUPPLEMENT_WAGE: 'SupplementWage',
  ROUTE_OPERATION: 'Operation',
  // 员工相关
  ROUTE_WORKER: 'Worker',
  ROUTE_WORKER_SCHEDULE: 'WorkerSchedule',
  // 库存相关
  ROUTE_INVENTORY_PRODUCT_PUT_IN: 'InventoryProductPutIn',                      // 库存 - 商品入库
  ROUTE_INVENTORY_PRODUCT_INFO: 'InventoryProductInfo',                         // 库存 - 商品库管详情
  ROUTE_INVENTORY_MATERIAL_LIST: 'InventoryMaterialList',                       // 库存 - 原材料列表
  ROUTE_INVENTORY_MATERIAL_PUT_IN: 'InventoryMaterialPutIn',                    // 库存 - 原材料手动入库
  ROUTE_INVENTORY_MATERIAL_DETAIL_UPDATE: 'InventoryMaterialDetailUpdate',      // 库存 - 原材料详情修改
  ROUTE_INVENTORY_STANDARD_PUT_IN: 'InventoryStandardPutIn',                    // 库存 - 标品入库
  ROUTE_INVENTORY_STANDARD_DETAIL_UPDATE: 'InventoryStandardDetailUpdate',      // 库存 - 标品详情修改
  ROUTE_INVENTORY_MATERIAL_TASK: 'InventoryMaterialTask',                       // 库存 - 原材料任务
  ROUTE_INVENTORY_MATERIAL_TASK_FINISH: 'InventoryMaterialTaskFinish',          // 库存 - 原材料我完成的任务
  ROUTE_INVENTORY_STOCK_CHECK: 'InventoryStockCheck',                           // 库存 - 库存盘点
  ROUTE_INVENTORY_STOCK_CHECK_HISTORY: 'InventoryStockCheckHistory',            // 库存 - 库存盘点历史
  ROUTE_INVENTORY_REPORT_LOSS: 'InventoryReportLoss',                           // 库存 - 库存报损
  ROUTE_INVENTORY_DETAIL: 'InventoryDetail',                                    // 库存 - 商品出入库明细
  // 自提相关
  ROUTE_ZT_ORDER_PRINT: 'ZtOrderPrint',                                         // 自提 - 订单打印

  //  店铺搜索地图
  ROUTE_SEARC_HSHOP: 'Searchshop',//店铺-搜索
  ROUTE_SHOP_MAP: 'Shopmap',//店铺 - 地图
  // 店铺修改
  ROUTE_SHOP_ORDER: 'StoreOrderMsg',//店铺 - 订单信息选填
  ROUTE_SHOP_BANK: 'StoreBankMsg',//店铺 - 银行卡信息选填

  ROUTE_BIND_MEITUAN: 'BindMeituan',
  ROUTE_BIND_SET_MEITUAN: 'BindSetMeituan',


  //配送相关
  ROUTE_DELIVERY_LIST: 'DeliveryList',
  ROUTE_DELIVERY_INFO: 'DeliveryInfo',
  ROUTE_METTUAN_PAOTUI: 'MeituanPaotui',


  RIDER_TRSJECTORY: 'RiderTrajectory',

  //wechat app_id
  APP_ID: "wx0ffb81c6dc194253",
  Program_id: "gh_ecf3cb98d5ef",
  universalLink: Platform.select({ios: 'https://e.waisongbang.com/', android: undefined,}),

  serverUrl,
  apiUrl,
  staticUrl,
  hostPort
};

C.Listener = {
  KEY_LISTENER_IDS: 'listenerIds',
  KEY_SCAN_ORDER_BAR_CODE: 'listenScanBarCode',                                 // 扫描订单条形码
  KEY_SCAN_PROD_QR_CODE: 'listenScanProductCode',                               // 扫描商品打包二维码
  KEY_SCAN_STANDARD_PROD_BAR_CODE: 'listenScanStandardProdBarCode',             // 扫描标准品条形码
  KEY_SCAN_PACK_PROD_BAR_CODE: 'listenScanIrCode',                              // 扫描打包品条形码

  KEY_PRINT_BT_ORDER_ID: 'listenPrintBt',                                       // 支持蓝牙打印
  KEY_NEW_ORDER_NOT_PRINT_BT: 'listenNewNotPrint',                              // 来单，但是不需要蓝牙打印
}


export default C;
