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
  SET_SIMPLE_STORE,
  SET_CURR_PROFILE,

  CHECK_VERSION_AT,
  BLE_STARTED,

  LOGOUT_SUCCESS,
  UPDATE_CFG,
  HOST_UPDATED,
  UPDATE_CFG_ITEM,
  UPDATE_EDIT_PRODUCT_STORE_ID,
  SET_PRINTER_ID,
  SET_PRINTER_NAME,
  SET_USER_CONFIG,
  SET_SHOW_EXT_STORE,
  SET_EXT_STORE,
} = require('../../pubilc/common/constants').default

const initialState = {
  currentUser: null,
  currStoreId: 0,
  simpleStore: {}, //使用前需校验是否与 currStoreId 对应, 没有则需要去服务器端获得; 默认随config等一起大批更新
  accessToken: '',
  refreshToken: '',
  expireTs: 0,
  config: {},
  currentUserProfile: {},
  canReadStores: {},  // store_id => store, 当前用户可以访问的店铺列表
  canReadVendors: {},  // vendor_id => vendor, 当前用户可以访问的品牌信息, store 里的 vendor_id 可通过这里获得,
  remindTags: null,
  host: '',
  cfgOfKey: {},
  last_get_cfg_ts: 0,
  currentNewProductStoreId: 0,
  listeners: [],
  printer_id: '',
  mixpanel_id: '',
  bleStarted: false,
  user_config: {
    order_list_by: 'expectTime asc',
  }
};

/**
 * ## globalReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function globalReducer(state = initialState, action) {

  switch (action.type) {
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
        if (typeof action.payload.store != 'undefined') {
          return {...state, currStoreId: action.payload.id, simpleStore: action.payload.store}
        } else {
          return {...state, currStoreId: action.payload.id}
        }
      } else return state;

    case SET_SIMPLE_STORE:
      if (action.payload) {
        return {...state, simpleStore: action.payload}
      } else return state;

    case SESSION_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        expireTs: action.payload.expires_in_ts,
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
        currentUser: null,
        currStoreId: 0,
        currentUserProfile: {},
        accessToken: '',
        refreshToken: '',
        canReadStores: {},
        canReadVendors: {},
        currentNewProductStoreId: 0,
        bleStarted: false
      };

    case UPDATE_CFG:
      const newState = action.payload ? {
        ...state,
        canReadStores: action.payload.canReadStores || state.canReadStores,
        canReadVendors: action.payload.canReadVendors || state.canReadVendors,
        config: action.payload.config || state.config,
        last_get_cfg_ts: action.last_get_cfg_ts || state.last_get_cfg_ts,
      } : state;

      //有定义即可更新 simpleStore
      if (typeof (action.payload.simpleStore) != 'undefined') {
        state.simpleStore = action.payload.simpleStore
      }

      return newState;
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
      console.log(action.info, 'info')
      return {...state, user_config: action.info}

    case SET_SHOW_EXT_STORE:
      return {...state, show_orderlist_ext_store: action.show}


    case SET_EXT_STORE:
      return {...state, ext_store: action.list}

    case UPDATE_EDIT_PRODUCT_STORE_ID:
      return {...state, currentNewProductStoreId: action.storeId}
  }
  return state
}
