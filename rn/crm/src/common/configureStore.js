/**
 * # configureStore.js
 *
 * A Redux boilerplate setup
 *
 */
'use strict'

/**
 * ## Imports
 *
 * redux functions
 */
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import {persistStore, autoRehydrate} from 'redux-persist'
import {AsyncStorage} from 'react-native'

/**
* ## Reducer
* The reducer contains the 4 reducers from
* device, global, profile
*/
import reducer from '../reducers'

/**
 * ## configureStore
 * @param persistDoneCall
 * the state with for keys:
 * device, global, auth, profile
 */
export default function configureStore (persistDoneCall) {
    const store = createStore(
        reducer,
        undefined,
        compose(
            applyMiddleware(
                thunk,
              // logger
            ),
            autoRehydrate()
        )
    );

    const cfg = {
      keyPrefix: 'cn.blx.crm.',
        storage: AsyncStorage
    };

    persistStore(store, cfg, () => {
        console.log(new Date(), 'rehydration complete')
        if (persistDoneCall) {
            persistDoneCall(store)
        }
    });

  return store
}
