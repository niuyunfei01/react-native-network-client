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
  ORDER_STATUS_DONE: 6,

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
  TASK_TYPE_UPLOAD_NEW_GOODS: 9, //商家申请上新任务
  TASK_TYPE_UP_SUPPLY_PRICE: 10, //向上调价
  TASK_TYPE_DOWN_SUPPLY_PRICE: 11,//向下调价
  TASK_TYPE_AFS_SERVICE_BY_USER:12,//jd 部分退款
  TASK_TYPE_CHG_SUPPLY_PRICE: 200,

  //任务紧急程度
  TASK_QUICK_NO: 0,
  TASK_QUICK: 1, //一般紧急
  TASK_EMERGENCY: 2,  //中等紧急
  TASK_SERIOUS: 3, //非常紧急

  WORKER_STATUS_OK: 1,//员工启用状态
  WORKER_STATUS_DISABLED: 0,//员工禁用状态

  SHIP_AUTO: 0, //不自动
  SHIP_AUTO_FN_DD: 64, //自动排单


  RESERVATION_ORDER_PRINT_REAL_TIME: 0, //实时打印
  RESERVATION_ORDER_PRINT_AUTO: -1, //默认送达前打印

  REFUND_AUDIT_AGREE: 1, //同意退款
  REFUND_AUDIT_REFUSE: 0, //拒绝退款
  //审核状态
  AUDIT_STATUS_WAIT: 0,//审核中
  AUDIT_STATUS_PASSED: 1,//已完成
  AUDIT_STATUS_FAILED: 2,//未完成
  //
  BILL_STATUS_WAIT: 0,//待打款
  BILL_STATUS_PAID: 1,//已打款
  BILL_STATUS_INVALID: 2,//已作废


  WM_PLAT_ID_BD: 1,//百度
  WM_PLAT_ID_WX: 2,//微信
  WM_PLAT_ID_MT: 3,//美团
  WM_PLAT_ID_ELE: 4,//饿了么
  WM_PLAT_ID_APP: 5,
  WM_PLAT_ID_JD: 6,//京东
  WM_PLAT_UNKNOWN: -1,

  STORE_PROD_ON_SALE: 1,//上架
  STORE_PROD_OFF_SALE: 3,//下架
  STORE_PROD_SOLD_OUT: 2,//缺货

  STORE_SELF_PROVIDED: 1,//门店自采
  STORE_COMMON_PROVIDED: 0,//总部供货

  SHIP_AUTO_FN: 1,//蜂鸟
  SHIP_AUTO_NEW_DADA: 2,//新达达
  SHIP_AUTO_BD: 5,//百度
  SHIP_AUTO_SX: 6,//闪送
  SHIP_AUTO_MT: 7,//美团跑腿
  SHIP_AUTO_MT_ZB: 8, //美团众包

  ID_DADA_SHIP_WORKER: -999,
  ID_DADA_MANUAL_WORKER: -998,

  DADA_STATUS_NEVER_START: 0,
  DADA_STATUS_TO_ACCEPT: 1,//待接单
  DADA_STATUS_TO_FETCH: 2,//待取货
  DADA_STATUS_SHIPPING: 3,//配送中
  DADA_STATUS_ARRIVED: 4,//已完成
  DADA_STATUS_CANCEL: 5,//已取消
  DADA_STATUS_TIMEOUT: 7,//已过期
  DADA_STATUS_ABNORMAL: 8,//指派单
  // 蜂鸟
  FN_STATUS_ACCEPTED: 1,//	系统已接单	蜂鸟配送开放平台接单后,商户接收到系统已接单状态, 支持取消
  FN_STATUS_ASSIGNED: 20,//	已分配骑手	蜂鸟配送开放平台接单后,商户接收到已分配骑手状态, 支持取消
  FN_STATUS_ARRIVED_STORE: 80, //	骑手已到店	蜂鸟配送开放平台将骑手已到店状态回调给商户, 支持取消
  FN_STATUS_ON_WAY: 2, //	配送中	蜂鸟配送开放平台将骑手配送中状态回调给商户, 不支持取消
  FN_STATUS_ARRIVED: 3, //	已送达	蜂鸟配送开放平台将已送达状态回调给商户, 不支持取消
  FN_STATUS_CANCELED: 4, //	已取消(同步取消不需要关注此状态)	商户主动取消订单请求处理成功后,蜂鸟配送开放平台将已取消状态回调给商户
  FN_STATUS_ABNORMAL: 5, //	异常	推单到物流开放平台后任何阶段产生异常,蜂鸟配送开放平台将异常状态回调给商户
  //专送status
  ZS_STATUS_NEVER_START: 0,//待召唤
  ZS_STATUS_TO_ACCEPT: 1,//待接单
  ZS_STATUS_TO_FETCH: 2,//待取货
  ZS_STATUS_ON_WAY: 3,//在途
  ZS_STATUS_ARRIVED: 4,//送达
  ZS_STATUS_CANCEL: 5,//取消
  ZS_STATUS_ABNORMAL: 6,//异常
  ZS_STATUS_TO_ACCEPT_EX: 21,//选自送状态

  //专送方式
  SHIP_ZS_JD: 21,//京东专送
  SHIP_ZS_MT: 22, //美团专送
  SHIP_ZS_ELE: 23, //饿了专送
  SHIP_ZS_BD: 24, //百度专送
  SHIP_KS_MT: 25, //美团快送
  SHIP_KS_ELE: 26, //饿了么快送
  SHIP_SELF: 30, //自配送
  SHIP_THIRD: 40, // 三方配送

  TAG_HIDE: '74911547', //列表中隐藏tag_id
  ORDER_CANCEL_SHIP_REASON: 10000,
  //运营结算的详情的类型  收入的类型
  OPERATE_ORDER_IN: 1,//订单收入
  OPERATE_OTHER_IN: 2,//其他收入
  OPERATE_REFUND_OUT: 3,//退款
  OPERATE_DISTRIBUTION_TIPS: 4,//加小费
  OPERATE_DISTRIBUTION_FEE: 5,//运费
  OPERATE_OUT_BASIC: 7,//保底结算
  OPERATE_OUT_BLX: 8,//运营服务费
  OPERATE_OUT_PLAT_FEE: 9,  //外卖平台服务费
  OPERATE_OTHER_OUT: 6, //其他支出
  //品牌常量
  STORE_TYPE_SELF: 1,//菜鸟食材
  STORE_TYPE_AFFILIATE: 2,//菜鸟
  STORE_TYPE_GZW: 4,//果知味
  STORE_TYPE_BLX: 5,//比邻鲜
  STORE_TYPE_XGJ: 6,//鲜果集
  STORE_TYPE_HLCS: 7,//华联超市
  STORE_TYPE_JNGY: 9, //嘉农果园
  // 商品管理的排序值
  GOODS_MANAGE_DEFAULT_SORT: '',
  GOODS_MANAGE_SOLD_SORT: 'sold',
  GOODS_CLASSIFY_ALL: '999999999',
  GOODS_CLASSIFY_UNCLASSIFIED: '11111111',
  RULE_TYPE_GENERAL : 1,//1-通用规则
  RULE_TYPE_SPECIAL : 2,//2-特殊分类规则
  Rule_PRICE_UPPER:1000000,

  // 同行商品变动类型
  TRACK_PROD_CHG_UP: 3,
  TRACK_PROD_CHG_DOWN: 4,

  COUPON_TYPE_GOOD_REDEEM_LIMIT_U: 10,
  COUPON_TYPE_GOOD_REDEEM_NO_LIMIT: 11,

  RE_ON_SALE_OFF_WORK:  1, //下班后再上架 (缺货状态）
  RE_ON_SALE_PROVIDED: 2, //供应商来货时上架 (缺货状态)
  RE_ON_SALE_MANUAL: 3, //手动上架 (缺货状态）
  RE_ON_SALE_NONE: 4, //长期下架 (下架状态）

  GOODS_SEARCH_PAGE_NUM: 50,

  CODE_ACCESS_DENIED:  10001,
}
