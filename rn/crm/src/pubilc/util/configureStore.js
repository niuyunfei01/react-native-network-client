import {applyMiddleware, compose, createStore} from 'redux'
import thunk from 'redux-thunk'
/**
 * ## Reducer
 * The reducer contains the 4 reducers from
 * device, global, profile
 */
import reducer from '../../reducers'

const store = createStore(reducer, compose(applyMiddleware(thunk)))
export default store
