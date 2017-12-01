'use strict';
const {
  HOST_UPDATED,
} = require('./common/constants').default

/**
 * if none in global, return the default host and try to update from settings into global
 * @param global
 * @param dispatch
 * @param native
 * @returns {*}
 */
export function host(global, dispatch, native) {
  if (global.host) {
    return global.host;
  } else {
    native.host((host) => {
      if (host) {
        dispatch({type: HOST_UPDATED, host: host});
      }
    });

    return C.defaultHost;
  }
}

/**
 * get server url
 * @param host
 * @param path string
 * @param useHttps
 * @returns {string}
 */
export function serverUrl(host, path, useHttps = true) {
  const proto = useHttps ? 'https' : 'http';
  path = path[0] === '/' ? path.substr(1) : path;
  return `${proto}://${host}/${path}`;
}

/**
 * 系统参数配置信息
 */
const C = {
  https: true,
  /** Host应该根据是否预发布从系统中获得，而不是直接写死；实在没有，才从这里获得 */
  defaultHost: 'www.cainiaoshicai.cn',
  'AppName': 'Crm',
  'ServiceUrl': 'https://preview.cainiaoshicai.cn/',
  'DownloadUrl': `https://www.cainiaoshicai.cn/cc.apk`,
  MAP_WAY_URL: 'util/amap_way',
  FetchTimeout: 10000,

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
  ROUTE_STORE_GOODS_EDIT: 'StoreGoodsEdit',
  serverUrl,

  /**
   * @see host
   */
  host,
};

export default C;