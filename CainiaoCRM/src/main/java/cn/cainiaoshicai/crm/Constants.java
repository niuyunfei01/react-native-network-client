package cn.cainiaoshicai.crm;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/**
 */
public class Constants {

    public static final int MAX_EXCELL_SPENT_TIME = 50;

    public static final int WM_ORDER_STATUS_UNKNOWN = -1;
    public static final int WM_ORDER_STATUS_TO_READY = 1;
    public static final int WM_ORDER_STATUS_TO_SHIP = 2;
    public static final int WM_ORDER_STATUS_TO_ARRIVE = 3;
    public static final int WM_ORDER_STATUS_ARRIVED = 4;
    public static final int WM_ORDER_STATUS_INVALID = 5;


    public static final Platform PLAT_BD = new Platform("百度", 1);
    public static final Platform PLAT_WX = new Platform("微信", 2);
    public static final Platform PLAT_MT  = new Platform("美团", 3);
    public static final Platform PLAT_ELEME  = new Platform("饿了么", 4);
    public static final Platform PLAT_UNKNOWN  = new Platform("-", 5);


    static public class Platform {
        public final String name;
        public final int id;

        public Platform(String name, int id) {
            this.name = name;
            this.id = id;
        }

        static public Platform find(int id) {
            for (Platform next : Arrays.asList(PLAT_BD, PLAT_WX, PLAT_MT, PLAT_ELEME)) {
                if (next.id == id) {
                    return next;
                }
            }

            return PLAT_UNKNOWN;
        }
    }

}