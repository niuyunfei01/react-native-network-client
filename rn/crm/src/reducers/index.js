/**
 * # reducers
 *
 * This class combines all the reducers into one
 *
 */
'use strict'
/**
 * ## Imports
 *
 * our 4 reducers
 */
import device from './device/deviceReducer'
import global from './global/globalReducer'
import order from './order/orderReducer'
import alert from './alert/alertReducer'

import { combineReducers } from 'redux'

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
    alert
})

export default rootReducer
