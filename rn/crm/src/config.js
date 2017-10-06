'use strict';

export default {
    'AppName':'Crm',
    'ServiceUrl':'https://preview.cainiaoshicai.cn/',
    FetchTimeout:10000,

    GRANT_TYP_PASSWORD: "password",
    GRANT_CLIENT_ID: "NTQ5NTE5MGViMTgzMDUw",

    ACCESS_TOKEN_EXPIRE_DEF_SECONDS: 3600,

    ROUTE_WEB: 'Web',
    ROUTE_LOGIN: 'Login',
    ROUTE_ORDER: 'Order',
    ROUTE_ALERT: 'Alert',
    ROUTE_ORDERS: 'Orders',

    //任务状态
    TASK_STATUS_WAITING: 0,//未处理
    TASK_STATUS_DONE: 1,//已处理
    TASK_STATUS_CONFIRMED: 2,//已确认
};
