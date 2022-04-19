import {createStore} from "redux";
import storeReducer from '../store/storeReducer'

const store = createStore(storeReducer)

export default store