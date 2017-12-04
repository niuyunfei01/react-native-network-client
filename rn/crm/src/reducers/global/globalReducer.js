/**
 * # globalReducer.js
 *
 *
 */

'use strict';
import {host} from "../../config";

const {
  LOGIN_PROFILE_SUCCESS,
  SESSION_TOKEN_SUCCESS,
  SET_CURR_STORE,
  SET_CURR_PROFILE,
  
  LOGOUT_SUCCESS,
  UPDATE_CFG,
  HOST_UPDATED,
  UPDATE_CFG_ITEM,

} = require('../../common/constants').default

const initialState = {
  currentUser: null,
  currStoreId: 0,
  accessToken: '',
  refreshToken: '',
  expireTs: 0,
  config: {},
  currentUserProfile: {},
  canReadStores: {},  // store_id => store, 当前用户可以访问的店铺列表
  canReadVendors: {},  // vendor_id => vendor, 当前用户可以访问的品牌信息, store 里的 vendor_id 可通过这里获得,
  remindTags:null,
  host: '',
  cfgOfKey: {},
};

/**
 * ## globalReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function globalReducer (state = initialState, action) {

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
        console.log('SET_CURR_STORE -> ', action.payload);
        return {
          ...state,
          currStoreId: action.payload,
        }
      } else return state;

    case SESSION_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        expireTs: action.payload.expires_in_ts,
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        currentUser: '',
        currStoreId: 0,
        currentUserProfile: {},
        accessToken: '',
        refreshToken: '',
      };
      
    case UPDATE_CFG:
      return action.payload ? {
        ...state,
        canReadStores: action.payload.canReadStores || state.canReadStores,
        canReadVendors: action.payload.canReadVendors || state.canReadVendors,
        config: action.payload.config || state.config,
      } : state;

    case HOST_UPDATED:
      const host = action.host;
      return host ? {...state, host} : state;

    case UPDATE_CFG_ITEM:
      return (action.key && action.value) ? {...state, cfgOfKey: {...state.cfgOfKey, [action.key]: action.value}}
        : state;
  }
  return state
}
