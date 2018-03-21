'use strict';
import GoodsRelateScene from "./scene/Goods/GoodsRelateScene";
import OperateProfitScene from "./scene/OperateProfit/OperateProfitScene";
import OperateIncomeDetailScene from "./scene/OperateProfit/OperateIncomeDetailScene";
import OperateExpendDetailScene from "./scene/OperateProfit/OperateExpendDetailScene";
import GoodsPriceDetailsScene from "./scene/Goods/GoodsPriceDetailsScene";
import SettlementGatherScene from "./scene/Settlement/SettlementGatherScene";
import ActivityEditRuleScene from "./scene/Activity/ActivityEditRuleScene";
import ActivitySelectStoreScene from "./scene/Activity/ActivitySelectStoreScene";
import ActivityManageScene from "./scene/Activity/ActivityManageScene";
import ActivitySelectClassifyScene from "./scene/Activity/ActivitySelectClassifyScene";
import ActivityListScene from "./scene/Activity/ActivityListScene";


const {
  HOST_UPDATED,
} = require('./common/constants').default

/**
 * if none in global, return the default host and try to update from settings into global
 * @param globalRed the reducer of global
 * @param dispatch
 * @param native
 * @returns {*}
 * @deprecated 直接使用 apiUrl
 */
export function host(globalRed, dispatch, native) {
  if (globalRed.host) {
    return globalRed.host;
  } else {
    native.host((host) => {
      if (host) {
        dispatch({type: HOST_UPDATED, host: host});
      }
    });

    return C.defaultHost;
  }
}

export function apiUrl(path) {
  const hp = (global.hostPort ? global.hostPort : C.defaultHost);
  return `https://${hp}/${path}`;
}

export function staticUrl(path) {
  const hp = (global.hostPort ? global.hostPort : C.defaultHost);
  path = path[0] === '/' ? path.substr(1) : path;
  return `https://${hp}/${path}`;
}

/**
 * get server url
 * @param path string
 * @param useHttps
 * @returns {string}
 */
export function serverUrl(path, useHttps = true) {
  const proto = useHttps ? 'https' : 'http';
  const hp = (global.hostPort ? global.hostPort : C.defaultHost);
  path = path[0] === '/' ? path.substr(1) : path;
  return `${proto}://${hp}/${path}`;
}

/**
 * 系统参数配置信息
 */
const C = {
  https: true,
  /** Host应该根据设置从系统中获得 (see #host)，而不是直接写死；实在没有，才从这里获得 */
  defaultHost: 'www.cainiaoshicai.cn',
  'AppName': 'Crm',

  'DownloadUrl': `https://www.cainiaoshicai.cn/util/crm_dl`,
  MAP_WAY_URL: 'util/amap_way',
  FetchTimeout: 30000,

  GRANT_TYP_PASSWORD: "password",
  GRANT_CLIENT_ID: "NTQ5NTE5MGViMTgzMDUw",

  ACCESS_TOKEN_EXPIRE_DEF_SECONDS: 3600,

  LOC_PICKER: 'loc_picker',

  ROUTE_WEB: 'Web',
  ROUTE_LOGIN: 'Login',
  ROUTE_ORDER: 'Order',
  ROUTE_ALERT: 'Tab', //Home for reminds
  ROUTE_ORDERS: 'Orders',
  ROUTE_WORKER: 'Worker',
  ROUTE_USER: 'User',
  ROUTE_USER_ADD: 'UserAdd',
  ROUTE_Mine: 'Mine',
  ROUTE_SETTING: 'Setting',
  ROUTE_CLOUD_PRINTER: 'CloudPrinter',
  ROUTE_PRINTER_CONNECT: 'PrinterConnect',
  ROUTE_ORDER_URGE: 'UrgeOrder',
  ROUTE_REFUND_AUDIT: 'AuditRefund',
  ROUTE_ORDER_EDIT: 'OrderEdit',
  ROUTE_ORDER_TO_INVALID: 'OrderToInvalid',
  ROUTE_ORDER_CALL_SHIP: 'OrderCallShip',
  ROUTE_ORDER_PACK: 'OrderSetPack',
  ROUTE_ORDER_START_SHIP: 'OrderStartShip',
  ROUTE_ORDER_CANCEL_SHIP: 'OrderCancelShip',
  ROUTE_ORDER_SHIP_DETAIL: 'OrderShipDetail',
  ROUTE_ORDER_TODO: 'OrderTodo',
  ROUTE_ORDER_STORE: 'OrderChgStore',
  ROUTE_STORE: 'Store',
  ROUTE_STORE_ADD: 'StoreAdd',
  ROUTE_DONE_REMIND: 'DoneRemind',
  ROUTE_TAKE_OUT: 'TakeOut',
  ROUTE_GOODS_DETAIL: 'GoodsDetail',
  ROUTE_GOODS_COMMENT: 'GoodsComment',
  ROUTE_ORDER_SEARCH: 'OrderSearch',
  ROUTE_ORDER_INVALID: 'OrderInvalid',
  ROUTE_ORDER_SERIOUS_DELAY: 'OrderSeriousDelay',
  ROUTE_VERSION: 'Version',
  ROUTE_GOODS: 'Goods',
  ROUTE_SELECT_STORE: 'SelectStore',
  ROUTE_GOODS_EDIT: 'GoodsEdit',
  ROUTE_GOODS_CLASSIFY: 'GoodsClassify',
  ROUTE_GOODS_BATCH_PRICE: 'GoodsBatchPrice',
  ROUTE_GOODS_APPLY_RECORD:'GoodsApplyRecord',
  ROUTE_STORE_GOODS_EDIT: 'StoreGoodsEdit',
  ROUTE_HELP:'Help',
  ROUTE_SETTLEMENT:'Settlement',
  ROUTE_SETTLEMENT_DETAILS:'SettlementDetails',
  ROUTE_SETTLEMENT_ORDER:'SettlementOrder',
  ROUTE_SELECT_WORKER:'SelectWorkerScene',
  ROUTE_GOODS_RELATE: 'GoodsRelate',
  ROUTE_GOODS_APPLY_NEW_PRODUCT:'GoodsApplyNewProduct',
  ROUTE_GOODS_WORK_NEW_PRODUCT:'GoodsWorkNewProduct',
  ROUTE_OPERATE_PROFIT:'OperateProfit',
  ROUTE_OPERATE_DETAIL:'OperateDetail',
  ROUTE_OPERATE_INCOME_DETAIL:'OperateIncomeDetail',
  ROUTE_OPERATE_EXPEND_DETAIL:'OperateExpendDetail',
  ROUTE_OPERATE_OTHER_EXPEND_DETAIL:'OperateOtherExpendDetail',
  ROUTE_GOODS_MANAGE:'GoodsManage',
  ROUTE_GOODS_PRICE_DETAIL:'GoodsPriceDetails',
  ROUTE_SETTLEMENT_GATHER:'SettlementGather',
  ROUTE_ACTIVITY_RULE:'ActivityRule',
  ROUTE_ACTIVITY_EDIT_RULE:'ActivityEditRule',
  ROUTE_ACTIVITY_SELECT_STORE:'ActivitySelectStore',
  ROUTE_ACTIVITY_MANAGE:'ActivityManage',
  ROUTE_ACTIVITY_SELECT_GOOD:'ActivitySelectGood',
  ROUTE_ACTIVITY_CLASSIFY:'ActivitySelectClassify',
  ROUTE_ACTIVITY_LIST:'ActivityList',
  ROUTE_JD_AUDIT_DELIVERY:'JdAuditDelivery',
  ROUTE_SCAN:'Scan',
  ROUTE_GOODS_SCAN_SEARCH:'GoodsScanSearch',
  serverUrl,
  apiUrl,
  staticUrl,
  /**
   * @see host
   */
  host,
};

export default C;
