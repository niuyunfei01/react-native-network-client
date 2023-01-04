/**
 * # globalReducer.js
 *
 *
 */

'use strict';

const {
  LOGIN_PROFILE_SUCCESS,
  SESSION_TOKEN_SUCCESS,
  SET_CURR_STORE,
  SET_CURR_PROFILE,
  CHECK_VERSION_AT,
  BLE_STARTED,
  LOGOUT_SUCCESS,
  UPDATE_CONFIG,
  HOST_UPDATED,
  UPDATE_CFG_ITEM,
  UPDATE_EDIT_PRODUCT_STORE_ID,
  SET_PRINTER_ID,
  SET_PRINTER_NAME,
  SET_USER_CONFIG,
  SET_ORLDER_LIST_BY,
  SET_CALL_DELIVERY_OBJ,
  SET_SHOW_FLOAT_SERVICE_ICON,
  SET_EXT_STORE,
  SET_NO_LOGIN_INFO,
  SET_GOODS_SG_CATEGORY,
  SET_BLUETOOTH_DEVICE_LIST,
  SET_SCANNING_BLUETOOTH_DEVICE,
  SET_AUTO_PRINT,
  SET_VOLUME,
  SET_INIT_JPUSH,
  SET_NET_INFO_STATUS
} = require('../../pubilc/common/constants').default

const initialState = {
  currentUser: null,
  currentNewProductStoreId: 0,
  expireTs: 0,
  currentUserProfile: {},
  host: '',
  store_id: 0,
  vendor_id: 0,
  store_info: {
    vip_info: {
      show_vip: false,
      expire_time: '未开通',
      is_free: false,
      exist_vip: false,
      vip_invalid: false
    }
  },
  vendor_info: {},
  help_uid: [],
  enabled_good_mgr: false,
  show_goods_monitor: false,
  show_sign_center: false,
  float_kf_icon: false,
  show_expense_center: false,
  is_record_request_monitor: false,
  customer_service_auth: {},
  show_float_service_icon: true,
  user_config: {},
  order_list_by: 'expectTime asc',
  only_one_store: false,
  is_vendor_admin: false,
  menu_list: {
    delivery: 1,
    myself: 1,
    news: 0,
    product: 0,
    switch_store: 1,
    work: 0
  },
  basic_categories: [],
  bluetoothDeviceList: [],
  bleStarted: false,
  printer_id: '0',
  isScanningBluetoothDevice: false,
  autoBluetoothPrint: false,
  accessToken: '',
  refreshToken: '',
  getTokenTs: 0,
  lastCheckVersion: 0,
  call_delivery_obj: {},
  volume: 0,
  not_init_jpush: true,
  net_info: {}
};

/**
 * ## globalReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function globalReducer(state = initialState, action) {

  switch (action.type) {
    case SET_INIT_JPUSH:
      return {
        ...state,
        not_init_jpush: action.payload
      }
    case SET_VOLUME:
      return {
        ...state,
        volume: action.payload
      }
    case SET_NET_INFO_STATUS:
      return {
        ...state,
        net_info: action.payload
      }
    case SET_AUTO_PRINT:
      return {
        ...state,
        autoBluetoothPrint: action.payload
      }
    case SET_SCANNING_BLUETOOTH_DEVICE:
      return {
        ...state,
        isScanningBluetoothDevice: action.payload
      }

    case SET_BLUETOOTH_DEVICE_LIST:
      if (action.payload) {
        return {
          ...state,
          bluetoothDeviceList: action.payload,
        }
      }
      break
    case SET_GOODS_SG_CATEGORY:
      if (action.payload) {
        return {
          ...state,
          basic_categories: action.payload
        }
      }
      break
    case SET_NO_LOGIN_INFO:
      if (action.payload) {
        if (action.payload.store_id == 0 || action.payload.vendor_id == 0 || action.payload.currentUser == 0)
          return state
        return {
          ...state,
          currentUser: action.payload.currentUser,
          accessToken: action.payload.accessToken,
          store_id: action.payload.store_id,
          vendor_id: action.payload.vendor_id,
          host: action.payload.host,
          printer_id: action.payload.printer_id,
          autoBluetoothPrint: action.payload.autoBluetoothPrint,
          refreshToken: action.payload.refreshToken,
          expireTs: action.payload.expireTs,
          getTokenTs: action.payload.getTokenTs,
          order_list_by: action.payload.order_list_by,
          enabled_good_mgr: action.payload.enabled_good_mgr,
          lastCheckVersion: action.payload.lastCheckVersion
        }
      }
      break
    case LOGIN_PROFILE_SUCCESS:
      if (action.payload && action.payload.id) {
        return {
          ...state,
          currentUser: action.payload.id,
          currentUserProfile: action.payload,
        };
      } else return state;

    case SET_CURR_PROFILE:
      return {...state, currentUserProfile: action.profile};

    case SET_CURR_STORE:
      if (action.payload) {
        return {...state, store_id: action.payload.id}
      } else return state;

    case SESSION_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        expireTs: action.payload.expires_in_ts,
        getTokenTs: action.payload.getTokenTs
      };

    case CHECK_VERSION_AT:
      return {
        ...state,
        lastCheckVersion: action.payload
      };

    case BLE_STARTED:
      return {
        ...state,
        bleStarted: action.payload
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        currentUser: 0,
        accessToken: '',
        store_id: 0,
        vendor_id: 0,
        host: '',
        printer_id: '0',
        autoBluetoothPrint: false,
        refreshToken: '',
        expireTs: 0,
        getTokenTs: 0,
        order_list_by: 'expectTime asc',
        enabled_good_mgr: false,
        currentUserProfile: {},
        currentNewProductStoreId: 0,
        bleStarted: false
      };


    case UPDATE_CONFIG:
      return action.payload ? {
        ...state,
        store_id: action.payload.store_id || state.store_id,
        vendor_id: action.payload.vendor_id || state.vendor_id,
        store_info: action.payload.store_info || state.store_info,
        vendor_info: action.payload.vendor_info || state.vendor_info,
        help_uid: action.payload.help_uid || state.help_uid,
        enabled_good_mgr: action.payload && action.payload.enabled_good_mgr,
        show_goods_monitor: action.payload.show_goods_monitor || state.show_goods_monitor,
        show_sign_center: action.payload.show_sign_center || state.show_sign_center,
        float_kf_icon: action.payload.float_kf_icon || state.float_kf_icon,
        show_expense_center: action.payload.show_expense_center || state.show_expense_center,
        is_record_request_monitor: action.payload.is_record_request_monitor || state.is_record_request_monitor,
        customer_service_auth: action.payload.customer_service_auth || state.customer_service_auth,
        menu_list: action.payload.menu_list || state.menu_list,
        is_vendor_admin: Boolean(action.payload.is_vendor_admin),
        only_one_store: Boolean(action.payload.only_one_store),
      } : state;

    case HOST_UPDATED:
      const host = action.host;
      return host ? {...state, host} : state;

    case UPDATE_CFG_ITEM:
      return (action.key && action.value) ? {...state, cfgOfKey: {...state.cfgOfKey, [action.key]: action.value}}
        : state;

    case SET_PRINTER_ID:
      return {...state, printer_id: action.printer_id}


    case SET_PRINTER_NAME:
      return {...state, printer_name: action.printer_info.name}

    case SET_USER_CONFIG:
      return {...state, user_config: action.info}

    case SET_ORLDER_LIST_BY:
      return {...state, order_list_by: action.val}

    case SET_SHOW_FLOAT_SERVICE_ICON:
      return {...state, show_float_service_icon: action.show}


    case SET_EXT_STORE:
      return {...state, ext_store: action.list}

    case UPDATE_EDIT_PRODUCT_STORE_ID:
      return {...state, currentNewProductStoreId: action.storeId}

    case SET_CALL_DELIVERY_OBJ:
      return {...state, call_delivery_obj: action.obj}

  }
  return state
}
