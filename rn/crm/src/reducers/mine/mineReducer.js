'use strict';

const {
    GET_USER_COUNT
} = require('../../common/constants').default;


/**
 * ## Initial State
 */
const initialState = {
    sign_count : 0,
    bad_cases_of : 0,
};

export default function mine(state = initialState, action) {
    switch (action.type) {
        case GET_USER_COUNT:
            return {...state,
                sign_count : action.sign_count,
                bad_cases_of : action.bad_cases_of,
            };
        default:
            return state;
    }
}