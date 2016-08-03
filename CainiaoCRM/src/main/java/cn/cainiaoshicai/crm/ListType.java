package cn.cainiaoshicai.crm;

/**
 * Created by liuzhr on 8/3/16.
 */
public enum ListType {
    NONE(0, "ALL"), WAITING_READY(1, "打包中"), WAITING_SENT(2, "待送"), WAITING_ARRIVE(3, "在途"), ARRIVED(4, "送达"), INVALID(5, "无效");

    private int value;
    private String name;

    ListType(int value, String name) {
        this.value = value;
        this.name = name;
    }

    public int getValue() {
        return value;
    }

    public String getName() {
        return name;
    }

    static public ListType findByType(int type) {
        if (type == 0) return NONE;
        if (type == 1) return WAITING_READY;
        if (type == 2) return WAITING_SENT;
        if (type == 3) return WAITING_ARRIVE;
        if (type == 4) return ARRIVED;
        if (type == 5) return INVALID;
        return null;
    }
}
