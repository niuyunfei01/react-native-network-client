import AppConfig from '../../config.js';
import HttpUtils from "../../util/http";
import {ToastLong} from '../../util/ToastUtils';
import { Reducer } from 'redux';
import {IUserRegister} from "../data";
export interface UserModelState {
    list: IUserRegister[];
}
export interface RegisterType{
    namespace: 'Register';
    effects: {
    };
    reducers: {
    };
}

// @ts-ignore
const RegisterModel :RegisterType={
    namespace: 'Register',
    effects:{},
    reducers: {
    }
};
export default RegisterModel;
