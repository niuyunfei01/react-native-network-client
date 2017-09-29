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
 * @param initialState the state with for keys:
 * device, global, auth, profile
 */
export default function configureStore () {
    const store = createStore(
        reducer,
        undefined,
        compose(
            applyMiddleware(
                thunk,
              logger
            ),
            autoRehydrate()
        )
    );

    const cfg = {
      keyPrefix: 'cn.cainiaoshicai.blx.crm',
        debounce: 100,
        storage: AsyncStorage
    };

    persistStore(store, cfg, () => {
        console.log('rehydration complete')
    });

  return store
}
