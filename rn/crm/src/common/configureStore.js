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
import {applyMiddleware, compose, createStore} from 'redux'
import thunk from 'redux-thunk'
import {autoRehydrate, persistStore} from 'redux-persist'
import {AsyncStorage} from 'react-native'
import createExpirationTransform from 'redux-persist-transform-expire';
import FilesystemStorage from 'redux-persist-filesystem-storage'
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
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default function configureStore(persistDoneCall) {
  const store = createStore(
    reducer,
    composeEnhancers(applyMiddleware(
      thunk,
      // logger
      ),
      autoRehydrate())
  );

  const expireTransform = createExpirationTransform({
    expireKey: 'persistExpiresAt',
    defaultState: {
      custom: {}
    }
  });

  const cfg = {
    keyPrefix: 'cn.blx.crm.',
    storage: FilesystemStorage,
    transforms: [expireTransform]
  };

  persistStore(store, cfg, () => {
    if (persistDoneCall) {
      persistDoneCall(store)
    }
  });

  return store
}
