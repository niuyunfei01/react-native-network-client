'use strict';
import AppConfig from '../config.js'

export default {
    timeout(ms, promise) {
        return new Promise(function(resolve, reject) {
            const timer = setTimeout(function() {
                reject(new Error('请求超时，请重新尝试'))
            }, ms);
            promise.then(
                (res) => {
                    clearTimeout(timer);
                    resolve(res);
                },
                (err) => {
                    clearTimeout(timer);
                    reject(err);
                }
            );
        })
    },
    post(action,formData){
        let url = AppConfig.ServiceUrl+action;
        return fetch(url, {
            credential:'include',//带上cookie发送请求请求
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        });
    },
    get(action, paras = ''){
        if(!paras)
            paras='';
        let url = AppConfig.ServiceUrl+action+(paras===''?'':'?'+paras);
        console.log('url: ', url);
        return fetch(url, {
            credential:'include',//带上cookie发送请求请求
            method: 'GET'
        });
    }
};