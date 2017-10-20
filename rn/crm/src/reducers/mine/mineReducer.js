'use strict';

const {
  GET_USER_COUNT,
  GET_WORKER,
  RESET_WORKER,
  GET_VENDOR_STORES,
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
        user_list: worker_list(state, action),
      };
    // case RESET_WORKER:
    //   return reset_worker(state, action);
    case GET_VENDOR_STORES:
      return {
        vendor_stores: vendor_stores(state, action),
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

function worker_list(state, action) {
  const user_map = {};
  let normal = [];
  let forbidden = [];
  // for(let worker of action.workers) {
  //   user_map[worker.id] = worker;
  //   if(parseInt(worker.status) === Cts.WORKER_STATUS_OK){
  //     normal.push(worker);
  //   } else {
  //     forbidden.push(worker);
  //   }
  // }
  let workers = action.workers;
  for (let idx in workers) {
    if (workers.hasOwnProperty(idx)) {
      let worker = workers[idx];
      user_map[worker.id] = worker;
      if (parseInt(worker.status) === Cts.WORKER_STATUS_OK) {
        normal.push(worker);
      } else {
        forbidden.push(worker);
      }
    }
  }

  state.user_list[action._v_id] = user_map;
  state.normal[action._v_id] = normal;
  state.forbidden[action._v_id] = forbidden;
  return state.user_list;
}

function vendor_stores(state, action) {
  state.vendor_stores[action._v_id] = action.store_list;
  return state.vendor_stores;
}

// function reset_worker(state, action) {
//   let {_v_id, user_id, user_status} = action;
//   state.user_list[_v_id][user_id].status = user_status;
//
//   let normal = [];
//   let forbidden = [];
//   for(let worker of action.user_list) {
//     if(parseInt(worker.status) === Cts.WORKER_STATUS_OK){
//       normal.push(worker);
//     } else {
//       forbidden.push(worker);
//     }
//   }
//   state.normal[action._v_id] = normal;
//   state.forbidden[action._v_id] = forbidden;
//   return state;
// }





