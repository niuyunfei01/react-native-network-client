/**
 * # reducers
 *
 * This class combines all the reducers into one
 *
 */
"use strict";
/**
 * ## Imports
 *
 * our 4 reducers
 */
import product from "./product/productReducer";
import device from "./device/deviceReducer";
import global from "./global/globalReducer";
import order from "./order/orderReducer";
import remind from "./remind/remindReducer";
import store from "./store/storeReducer";
import mine from "./mine/mineReducer";
import user from "./user/userReducer";
import activity from "./activity/activityReducer";
import invoicing from "./invoicing/invoicingReducer";

import {combineReducers} from "redux";

/**
 * ## CombineReducers
 *
 * the rootReducer will call each and every reducer with the state and action
 * EVERY TIME there is a basic action
 */
const rootReducer = combineReducers({
  device,
  global,
  order,
  remind,
  store,
  mine,
  product,
  user,
  activity,
  invoicing
});

export default rootReducer;
