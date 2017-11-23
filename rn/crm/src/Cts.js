'use strict';

/**
 * 业务相关的常量
 */

export default {

  TASK_STATUS_WAITING: 0,//未处理
  TASK_STATUS_DONE: 1,//已处理
  TASK_STATUS_CONFIRMED: 2,//已确认

  ORDER_STATUS_TO_READY: 1,
  ORDER_STATUS_TO_SHIP: 2,
  ORDER_STATUS_SHIPPING: 3,
  ORDER_STATUS_ARRIVED: 4,
  ORDER_STATUS_INVALID: 5,

  VERSION_DIRECT: 'direct',

  TASK_ALL_REFUND: 100,
  TASK_ALL_SHIP: 101,
  TASK_ALL_AFTER_SALE: 102,

  TASK_TYPE_UN_CLASSIFY: 0,//未归类
  TASK_TYPE_COMPLAIN: 1,//待处理评价
  TASK_TYPE_REFUND: 2,//客服待处理退款
  TASK_TYPE_OTHER_IMP: 3,//其他事项
  TASK_TYPE_OTHER: 0,
  TASK_TYPE_REMIND: 4,//催单
  TASK_TYPE_REFUND_BY_USER: 5,//用户申请退款
  TASK_TYPE_DELIVERY_FAILED: 6,//京东配送员申请取消配送
  TASK_TYPE_ORDER_CHANGE: 7, //订单修改
  TASK_TYPE_UPLOAD_GOODS_FAILED: 8, //外卖上传商品失败

  //任务紧急程度
  TASK_QUICK_NO: 0,
  TASK_QUICK: 1, //一般紧急
  TASK_EMERGENCY: 2,  //中等紧急
  TASK_SERIOUS: 3, //非常紧急

  WORKER_STATUS_OK: 1,//员工启用状态
  WORKER_STATUS_DISABLED: 0,//员工禁用状态

  SHIP_AUTO: 0, //不自动
  SHIP_AUTO_FN_DD: 64, //自动排单

  REFUND_AUDIT_AGREE: 1, //同意退款
  REFUND_AUDIT_REFUSE: 0, //拒绝退款


  WM_PLAT_ID_BD: 1,
  WM_PLAT_ID_WX: 2,
  WM_PLAT_ID_MT: 3,
  WM_PLAT_ID_ELE: 4,
  WM_PLAT_ID_APP: 5,
  WM_PLAT_ID_JD: 6,
  WM_PLAT_UNKNOWN: -1,

  STORE_PROD_ON_SALE: 1,
  STORE_PROD_OFF_SALE: 3,
  STORE_PROD_SOLD_OUT: 2,

  SHIP_AUTO_FN: 1,//蜂鸟
  SHIP_AUTO_NEW_DADA: 2,//新达达
  SHIP_AUTO_BD: 5,//百度
  SHIP_AUTO_SX: 6,//闪送

  ID_DADA_SHIP_WORKER: -999,
  ID_DADA_MANUAL_WORKER: -998,

// //新达达：状态编码(待接单＝1 待取货＝2 配送中＝3 已完成＝4 已取消＝5 已过期＝7 指派单=8)
  DADA_STATUS_NEVER_START : 0,
  DADA_STATUS_TO_ACCEPT : 1,
  DADA_STATUS_TO_FETCH : 2,
  DADA_STATUS_SHIPPING : 3,
  DADA_STATUS_ARRIVED : 4,
  DADA_STATUS_CANCEL : 5,
  DADA_STATUS_TIMEOUT : 7,
  DADA_STATUS_ABNORMAL : 8,

}