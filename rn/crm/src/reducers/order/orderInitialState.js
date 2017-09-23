'use strict'
/**
 * ## Import
 */
import {Record} from 'immutable'

var InitialState = Record({
    isFetching: false,
    error:'',
    order: {},
    order_id: 0,
    currentUser: null,
    showState: false,
    currentState: null,
    store: null
})
export default InitialState
