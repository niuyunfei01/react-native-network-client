package cn.cainiaoshicai.crm;

import java.util.Arrays;

import cn.cainiaoshicai.crm.domain.ShipAcceptStatus;
import cn.cainiaoshicai.crm.domain.Store;

/**
 */
public class Cts {

    public static final int SHIP_ACCEPT_OFF = 1;
    public static final int SHIP_ACCEPT_ON = 2;

    public static final int STORE_HLG = 1;
    public static final int STORE_YYC = 2;
    public static final int STORE_WJ = 3;
    public static final int STORE_UNKNOWN = -1;
    public static final int STORE_ALL = 0;

    public static final String BLX_TYPE_BASIC = "basic";
    public static final String BLX_TYPE_PRO = "pro"; //带基本连锁功能
    public static final String BLX_TYPE_FULL = "full"; //带完整连锁功能
    public static final String BLX_TYPE_DIRECT = "direct";

    public static final Store ST_UNKNOWN = new Store("未知店",  STORE_UNKNOWN);
    public static final Store ST_ALL = new Store("全部",  STORE_ALL);

    public static final int ID_AUTO_SHIP_WORKER = -999;
    public static final int ID_DADA_MANUAL_WORKER = -998;

    public static final int MAX_EXCELL_SPENT_TIME = 50;

    public static final int WM_ORDER_STATUS_UNKNOWN = -1;
    public static final int WM_ORDER_STATUS_TO_READY = 1;
    public static final int WM_ORDER_STATUS_TO_SHIP = 2;
    public static final int WM_ORDER_STATUS_TO_ARRIVE = 3;
    public static final int WM_ORDER_STATUS_ARRIVED = 4;
    public static final int WM_ORDER_STATUS_INVALID = 5;

    public static final int FB_STATUS_DOING = 0;
    public static final int FB_STATUS_FIXED = 1;
    public static final String FB_STATUS_DOING_T = "处理中";
    public static final String FB_STATUS_FIXED_T = "已解决";
    public static final String FB_STATUS_UNKNOWN_T = "未知";


    public static final int EB_ORDER_FORM_BD = 1;
    public static final int EB_ORDER_FROM_ELE = 2;
    public static final Platform PLAT_BD = new Platform("百度", 1);
    public static final Platform PLAT_WX = new Platform("微信", 2);
    public static final Platform PLAT_MT  = new Platform("美团", 3);
    public static final Platform PLAT_ELEME  = new Platform("饿了么", 4);
    public static final Platform PLAT_APP  = new Platform("菜鸟APP", 5);
    public static final Platform PLAT_JDDJ  = new Platform("JD到家", 6);
    public static final Platform PLAT_UNKNOWN  = new Platform("未知", -1);

    public static final String ERR_INVALID_GRANT = "invalid_grant";

    public static final int POSITION_ALL = 0;
    public static final int POSITION_EXT_SHIP = 3;
    public static final int POSITION_PACK = 4;
    public static final int POSITION_STORE_DAY_MGR = 5;

    public static final int PRICE_CONTROLLER_NO = 0;
    public static final int PRICE_CONTROLLER_YES = 1;

    public static final int RATE_PRICE_CONTROLLER_NO = 0;
    public static final int RATE_PRICE_CONTROLLER_YES = 1;

    public static final int PROFIT_CONTROLLER_NO = 0;
    public static final int PROFIT_CONTROLLER_YES = 1;

    public static final Provide PROVIDE_SLEF = new Provide(1, "自采");
    public static final Provide PROVIDE_COMMON = new Provide(0, "直供");

    public static final int  DADA_STATUS_NEVER_START = 0;
    public static final int  DADA_STATUS_TO_ACCEPT = 1;
    public static final int  DADA_STATUS_TO_FETCH = 2;
    public static final int  DADA_STATUS_SHIPPING = 3;
    public static final int  DADA_STATUS_ARRIVED = 4;
    public static final int  DADA_STATUS_CANCEL = 5;
    public static final int  DADA_STATUS_TIMEOUT = 7;
    public static final int  DADA_STATUS_ABNORMAL = 8;

    public static final int  SIGN_ACTION_NONE = 0;
    public static final int  SIGN_ACTION_IN = 1;
    public static final int  SIGN_ACTION_OFF = 2;
    public static final int  SIGN_ACTION_VACATION = 3;

    public static final String labelSignIn = "打卡";
    public static final String labelWorking = "工作中";
    public static final String labelOffwork = "已下班";
    public static final String labelVocation = "请假";

    public static final String LABEL_SHIP_ACCEPT_ON = "接单中";
    public static final String LABEL_SHIP_ACCEPT_OFF = "不接单";

    public static String getSignInLabel(int sign_status) {
        final String label;
        if (sign_status == Cts.SIGN_ACTION_IN) {
            label = labelWorking;
        } else if (sign_status == Cts.SIGN_ACTION_OFF) {
            label = labelOffwork;
        } else if (sign_status == Cts.SIGN_ACTION_VACATION) {
            label = labelVocation;
        } else if (sign_status == Cts.SIGN_ACTION_NONE) {
            label = labelSignIn;
        } else {
            label = "未知";
        }
        return label;
    }

    public static String getShipStatusLabel(ShipAcceptStatus status) {
        return status != null && status.getStatus() == Cts.SHIP_ACCEPT_ON
                ? Cts.LABEL_SHIP_ACCEPT_ON : Cts.LABEL_SHIP_ACCEPT_OFF;
    }

    static public class Provide {
        public final int value;
        public final String name;

        public Provide(int value, String name) {
            this.value = value;
            this.name = name;
        }
    }

    static public class Platform {
        public final String name;
        public final int id;

        public Platform(String name, int id) {
            this.name = name;
            this.id = id;
        }

        static public Platform find(int id) {
            for (Platform next : Arrays.asList(PLAT_BD, PLAT_WX, PLAT_MT, PLAT_ELEME, PLAT_APP, PLAT_JDDJ)) {
                if (next.id == id) {
                    return next;
                }
            }

            return PLAT_UNKNOWN;
        }
    }

    public static final DeliverReview DELIVER_UNKNOWN = new DeliverReview("-", 0);
    public static final DeliverReview DELIVER_GOOD = new DeliverReview("提前", 1);
    public static final DeliverReview DELIVER_OK = new DeliverReview("准时", 2);
    public static final DeliverReview DELIVER_LATE = new DeliverReview("延误", 3);
    public static final DeliverReview DELIVER_SERIOUS = new DeliverReview("严重延误", 4);

    static public class DeliverReview {
        public final String name;
        public final int value;

        public DeliverReview(String name, int value) {
            this.name = name;
            this.value = value;
        }

        static public DeliverReview find(int val) {
            for (DeliverReview next : Arrays.asList(DELIVER_GOOD, DELIVER_LATE, DELIVER_OK, DELIVER_SERIOUS)) {
                if (next.value == val) {
                    return next;
                }
            }

            return DELIVER_UNKNOWN;
        }

        public boolean isGood() {
            return this.value == DELIVER_GOOD.value || this.value == DELIVER_OK.value;
        }
    }


    public static final String PUSH_TYPE_NEW_ORDER = "new_order";
    public static final String PUSH_TYPE_NEW_COMMENT = "new_comment";
    public static final String PUSH_TYPE_REDY_TIMEOUT = "ready_timeout";
    public static final String PUSH_TYPE_SYNC_BROKEN = "warning_no_active_sync";
    public static final String PUSH_TYPE_SERIOUS_TIMEOUT = "serious_timeout";
    public static final String PUSH_TYPE_MANUAL_DADA_TIMEOUT = "manual_dada_timeout";
    public static final String PUSH_TYPE_STORAGE_WARNING = "storage_warning";
    public static final String PUSH_TYPE_BECOME_OFF_SALE = "store_prod_off_sale";
    public static final String PUSH_TYPE_WM_GOOD_NOT_MAP = "prod_wm_not_map";
    public static final String PUSH_TYPE_EXT_WARNING = "ext_store_warning";
    public static final String PUSH_TYPE_ORDER_CANCELLED = "order_cancelled";
    public static final String PUSH_TYPE_REMIND_DELIVER = "remind_deliver";
    public static final String PUSH_TYPE_ASK_CANCEL = "ask_cancel";
    public static final String PUSH_TYPE_ORDER_UPDATE = "order_update";
    public static final String PUSH_TYPE_TODO_COMPLAIN = "task_complain";
    public static final String PUSH_TYPE_SYS_ERROR = "system_error";
    public static final String PUSH_TYPE_TASK_REMIND = "task_remind";
    public static final String PUSH_TYPE_PRODUCT_ADJUST = "product_adjust";

    public static final String PUSH_TYPE_USER_TALK = "talk";
}