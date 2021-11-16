'use strict';

import GlobalUtil from "./util/GlobalUtil";

const {HOST_UPDATED} = require("./common/constants").default;

/**
 * if none in global, return the default host and try to update from settings into global
 * @param globalRed the reducer of global
 * @param dispatch
 * @param native
 * @returns {*}
 * @deprecated 直接使用 apiUrl
 */
export function host (globalRed, dispatch, native) {
  if (globalRed.host) {
    return globalRed.host;
  } else {
    native.host(host => {
      if (host) {
        dispatch({type: HOST_UPDATED, host: host});
      }
    });

    return C.defaultHost;
  }
}

export function apiUrl (path) {
  const hp = GlobalUtil.getHostPort() || C.defaultHost;
  return `https://${hp}/${path}`;
}

export function staticUrl (path) {
  let isFullUrl = path.indexOf("http");
  if (isFullUrl === -1) {
    return serverUrl(path, true);
  } else if (path) {
    return path.replace("http://", "https://");
  } else {
    return path;
  }
}


/**
 * get server url
 * @param path string
 * @param useHttps
 * @returns {string}
 */
export function serverUrl (path, useHttps = true) {
  const proto = useHttps ? "https" : "http";
  const hp = GlobalUtil.getHostPort() || C.defaultHost;
  path = path[0] === "/" ? path.substr(1) : path;
  return `${proto}://${hp}/${path}`;
}

export function hostPort () {
  return global.hostPort ? global.hostPort : C.defaultHost;
}

/**
 * 系统参数配置信息
 */
const C = {
  https: true,
  /** Host应该根据设置从系统中获得 (see #host)，而不是直接写死；实在没有，才从这里获得 */
  defaultHost: "www.cainiaoshicai.cn",
  AppName: "Crm",

  DownloadUrl: `https://api.waisongbang.com/util/crm_dl`,
  MAP_WAY_URL: "util/amap_way",
  FetchTimeout: 60000,
  LongFetchTimeout: 200000,

  GRANT_TYP_PASSWORD: "password",
  GRANT_CLIENT_ID: "NTQ5NTE5MGViMTgzMDUw",

  ACCESS_TOKEN_EXPIRE_DEF_SECONDS: 3600,

  LOC_PICKER: "loc_picker",

  STORE_VENDOR_CACHE_TS: 300, //店铺/品牌的缓存过期时间

  ROUTE_WEB: 'Web',
  ROUTE_LOGIN: 'Login',
  ROUTE_ORDER: 'Order',
  ROUTE_ALERT: 'Tab', //Home for reminds
  ROUTE_ORDERS: 'Orders',
  ROUTE_USER: 'User',
  ROUTE_USER_ADD: 'UserAdd',
  ROUTE_USER_CHOOSE: 'UserChoose',
  ROUTE_Mine: 'Mine',
  ROUTE_SETTING: 'Setting',
  ROUTE_CLOUD_PRINTER: 'CloudPrinter',
  ROUTE_PRINTER_CONNECT: 'PrinterConnect',
  ROUTE_ORDER_URGE: 'UrgeOrder',
  ROUTE_REFUND_AUDIT: 'AuditRefund',
  ROUTE_ORDER_EDIT: 'OrderEdit',
  ROUTE_ORDER_TO_INVALID: 'OrderToInvalid',
  ROUTE_ORDER_CALL_SHIP: 'OrderCallShip',
  ROUTE_ORDER_TRANSFER_THIRD: 'OrderTransferThird',
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
  ROUTE_ORDER_GOOD_COUPON: 'SendRedeemCoupon',
  ROUTE_ORDER_SEARCH_RESULT: 'OrderSearchResult',

  ROUTE_STORE: 'Store',
  ROUTE_STORE_ADD: 'StoreAdd',
  ROUTE_STORE_RATE: 'StoreRate',
  ROUTE_STORE_RULE: 'StoreRule',
  ROUTE_DONE_REMIND: 'DoneRemind',
  PLATFORM_BIND: 'PlatformBind',
  ROUTE_TAKE_OUT: 'TakeOut',
  ROUTE_STORE_STATUS: 'StoreStatus',
  ROUTE_GOODS_DETAIL: 'GoodsDetail',
  ROUTE_GOOD_STORE_DETAIL: 'GoodStoreDetail',
  ROUTE_GOODS_COMMENT: 'GoodsComment',
  ROUTE_ORDER_SEARCH: 'OrderSearch',
  ROUTE_ORDER_INVALID: 'OrderInvalid',
  ROUTE_ORDER_SERIOUS_DELAY: 'OrderSeriousDelay',
  ROUTE_ORDER_PEND_PAYMENT: 'OrderPendingPayment',
  ROUTE_VERSION: 'Version',
  ROUTE_GOODS: 'Goods',
  ROUTE_SELECT_STORE: 'SelectStore',
  ROUTE_GOODS_EDIT: 'GoodsEdit',
  ROUTE_GOODS_CLASSIFY: 'GoodsClassify',
  ROUTE_GOODS_BATCH_PRICE: 'GoodsBatchPrice',
  ROUTE_GOODS_APPLY_RECORD: 'GoodsApplyRecord',
  ROUTE_STORE_GOODS_EDIT: 'StoreGoodsEdit',
  ROUTE_GOODS_SOLDOUT: 'GoodsSoldout',                // 订单按重退款
  ROUTE_HELP: 'Help',
  ROUTE_SETTLEMENT: 'Settlement',
  ROUTE_DistributionAnalysis: 'DistributionAnalysis', // 配送分析
  ROUTE_SETTLEMENT_DETAILS: 'SettlementDetails',
  ROUTE_SETTLEMENT_ORDER: 'SettlementOrder',
  ROUTE_SELECT_WORKER: 'SelectWorkerScene',
  ROUTE_GOODS_RELATE: 'GoodsRelate',
  ROUTE_GOODS_APPLY_NEW_PRODUCT: 'GoodsApplyNewProduct',
  ROUTE_GOODS_WORK_NEW_PRODUCT: 'GoodsWorkNewProduct',
  ROUTE_OPERATE_PROFIT: 'OperateProfit',
  ROUTE_OPERATE_DETAIL: 'OperateDetail',
  ROUTE_OPERATE_INCOME_DETAIL: 'OperateIncomeDetail',
  ROUTE_OPERATE_EXPEND_DETAIL: 'OperateExpendDetail',
  ROUTE_OPERATE_OTHER_EXPEND_DETAIL: 'OperateOtherExpendDetail',
  ROUTE_SEP_EXPENSE: 'SeparatedExpense',        //独立费用账单
  ROUTE_SEP_EXPENSE_INFO: 'SeparatedExpenseInfo',        //账单详细
  ROUTE_PLATFORM_LIST: 'PlatformScene',        //独立费用账单
  ROUTE_ACCOUNT_FILL: 'SeparatedAccountFill',             //独立帐户充值
  ROUTE_DELIVERY_LIST: 'DeliveryScene',
  ROUTE_BIND_DELIVERY:'BindDelivery',
  ROUTE_PRINTERS: 'PrinterSetting',
  ROUTE_INFORM: 'InfromSetting',              //通知设置
  ROUTE_PUSH: 'PushSetting',                  //推送设置
  ROUTE_MSG_VOICE: 'MsgVoiceScene',              //消息铃声设置检测
  ROUTE_GUIDE: 'GuideScene',              //消息铃声设置检测
  DIY_PRINTER: 'Diyprinter',              //小票设置
  ROUTE_RECEIPT: 'ReceiptScene',              //小票预览
  ROUTE_REMARK: 'PrinterRemark',              //小票备注
  ROUTE_SEETING_DELIVERY:'SeetingDelivery',
  ROUTE_GOODS_MANAGE: 'GoodsManage',
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
  ROUTE_STORE_GOODS_LIST: 'Goods',
  ROUTE_NEW_GOODS_SEARCH: 'StoreGoodsSearch',
  ROUTE_ONLINE_STORE_PRODUCT: 'OnlineStoreProduct',
  ROUTE_NEW_PRODUCT: 'NewProduct',
  ROUTE_NEW_PRODUCT_DETAIL: 'NewProductDetail',
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

  serverUrl,
  apiUrl,
  staticUrl,
  /**
   * @see host
   */
  host,
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
