'use strict';

const {
	GET_USER_COUNT,
	GET_WORKER,
	GET_VENDOR_STORES,
	GET_STORE_TURNOVER,
	GET_WM_STORES,
	GET_USER_WAGE_DATA
} = require('../../common/constants').default;
import Cts from "../../Cts";

/**
 * ## Initial State
 */
const initialState = {
	sign_count: {},
	bad_cases_of: {},
	normal: {},
	forbidden: {},
	vendor_stores: {},
	user_list: {},
	order_num: {},
	turnover: {},
	wm_list: {},
	wage_data: {}
};

export default function mine(state = initialState, action) {
	switch (action.type) {
		case GET_USER_COUNT:
			return {
				...state,
				sign_count: sign_count(state, action),
				bad_cases_of: bad_cases_of(state, action),
			};
		case GET_WORKER:
			return {
				...state,
				user_list: user_list(state, action),
			};
		case GET_VENDOR_STORES:
			return {
				...state,
				vendor_stores: vendor_stores(state, action),
			};
		case GET_STORE_TURNOVER:
			return {
				...state,
				order_num: order_num(state, action),
				turnover: turnover(state, action),
			};
		case GET_WM_STORES:
			return {
				...state,
				wm_list: wm_list(state, action),
			};
		case GET_USER_WAGE_DATA:
			return {
				...state,
				wage_data: wage_data(state, action)
			};
		default:
			return state;
	}
}

function sign_count(state, action) {
	state.sign_count[action.u_id] = action.sign_count;
	return state.sign_count;
}

function bad_cases_of(state, action) {
	state.bad_cases_of[action.u_id] = action.bad_cases_of;
	return state.bad_cases_of;
}

function user_list(state, action) {
	state.user_list[action._v_id] = action.user_list;
	state.normal[action._v_id] = action.normal;
	state.forbidden[action._v_id] = action.forbidden;
	return state.user_list;
}

function vendor_stores(state, action) {
	state.vendor_stores[action._v_id] = action.store_list;
	return state.vendor_stores;
}

function order_num(state, action) {
	state.order_num[action.store_id] = action.order_num;
	return state.order_num;
}

function turnover(state, action) {
	state.turnover[action.store_id] = action.turnover;
	return state.turnover;
}

function wm_list(state, action) {
	state.wm_list[action.store_id] = action.wm_list;
	return state.wm_list;
}

function wage_data(state, action) {
	state.wage_data = action.wageData;
	return state.wage_data
}




