package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 10/27/16.
 */

public class ProvideReq {

    public static final int STATUS_CREATED = 0;
    public static final int STATUS_LOCKED = 1;
    public static final int STATUS_SHIPPED = 2;
//    public static final int STATUS_ARRIVED = 3;
    public static final int STATUS_CONFIRMED = 4;
    public static final int STATUS_TRASHED = 5;

    private int id;
    private int store_id;
    private int status;
    private int total_req;
    private String day;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getStore_id() {
        return store_id;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getTotal_req() {
        return total_req;
    }

    public void setTotal_req(int total_req) {
        this.total_req = total_req;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }
}
