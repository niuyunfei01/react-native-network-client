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
  
  LOGOUT_SUCCESS,
  UPDATE_CFG,

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
  remindTags:null
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

    case SET_CURR_STORE:
      if (action.payload) {
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
        canReadVendors: action.payload.canReadVendors || action.payload.can_read_vendors || state.canReadVendors,
        config: action.payload.config || state.config,
      } : state;
  }
  return state
}
