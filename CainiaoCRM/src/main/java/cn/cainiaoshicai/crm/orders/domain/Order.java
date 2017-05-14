package cn.cainiaoshicai.crm.orders.domain;

import android.text.TextUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.orders.util.TextUtil;

public class Order implements Serializable {

    private int id;
    private int user_id;
    private String area;
    private int gender;
    private Date receivedTime;

    private String dayId;
    private String userName;
    private String address;
    private String mobile;
    private double orderMoney;
    private Date expectTime;
    private String expectTimeStr;
    private Date orderTime;
    private String remark;
    private int orderStatus;
    private int platform;
    private String platform_oid;
    private String platform_dayId;
    private String store_remark;

    private Date time_start_ship;
    private Date time_ready;
    private Date time_arrived;
    private int review_deliver;

    private int print_times;

    private int store_id;

    private List<CartItem> items = new ArrayList<>();
    private String ship_worker_name;
    private int ship_worker_id;
    private int pack_operator;
    private String pack_workers;
    private int order_times;
    private int paid_done;
    private boolean showReadyDelay;
    private int readyLeftMin;

    private int dada_status;
    private Date dada_call_at;
    private float dada_distance;
    private String dada_order_id;
    private float dada_fee;

    private String dada_mobile;
    private int dada_dm_id;
    private String dada_dm_name;
    private String auto_plat = "达达自动";
    private String ship_sch;
    private String ship_sch_desc;

    private int source_ready;

    private Feedback feedback;
    private String direction;
    private int additional_to_pay;
    private String ship_worker_mobile;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDayId() {
        return dayId;
    }

    public void setDayId(String dayId) {
        this.dayId = dayId;
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Date getExpectTime() {
        return expectTime;
    }

    public void setExpectTime(Date expectTime) {
        this.expectTime = expectTime;
    }

    public Date getReceivedTime() {
        return receivedTime;
    }

    public void setReceivedTime(Date receivedTime) {
        this.receivedTime = receivedTime;
    }

    public String getGenderText() {
        return this.gender == 1 ? "先生" : "女士";
    }

    public void setOrderMoney(double pay) {
        this.orderMoney = pay;
    }

    public double getOrderMoney() {
        return orderMoney;
    }

    public int getGender() {
        return gender;
    }

    public void setGender(int gender) {
        this.gender = gender;
    }

    public Date getOrderTime() {
        return orderTime;
    }

    public void setOrderTime(Date orderTime) {
        this.orderTime = orderTime;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public int getOrderStatus() {
        return orderStatus;
    }

    public Date getTime_start_ship() {
        return time_start_ship;
    }

    public void setTime_start_ship(Date time_start_ship) {
        this.time_start_ship = time_start_ship;
    }

    public Date getTime_ready() {
        return time_ready;
    }

    public void setTime_ready(Date time_ready) {
        this.time_ready = time_ready;
    }

    public Date getTime_arrived() {
        return time_arrived;
    }

    public void setTime_arrived(Date time_arrived) {
        this.time_arrived = time_arrived;
    }

    public void setOrderStatus(int orderStatus) {
        this.orderStatus = orderStatus;
    }

    public int getPlatform() {
        return platform;
    }

    public void setPlatform(int platform) {
        this.platform = platform;
    }

    public String getPlatform_oid() {
        return platform_oid;
    }

    public void setPlatform_oid(String platform_oid) {
        this.platform_oid = platform_oid;
    }

    public String getPlatform_dayId() {
        return platform_dayId;
    }

    public void setPlatform_dayId(String platform_dayId) {
        this.platform_dayId = platform_dayId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public String getExpectTimeStr() {
        return expectTimeStr;
    }

    public void setExpectTimeStr(String expectTimeStr) {
        this.expectTimeStr = expectTimeStr;
    }

    public String getShip_worker_name() {
        return ship_worker_name;
    }

    public void setShip_worker_name(String ship_worker_name) {
        this.ship_worker_name = ship_worker_name;
    }

    public int getOrder_times() {
        return order_times;
    }

    public void setOrder_times(int order_times) {
        this.order_times = order_times;
    }

    public int isPaid_done() {
        return paid_done;
    }

    public void setPaid_done(int paid_done) {
        this.paid_done = paid_done;
    }

    public boolean isPaidDone() {
        return this.paid_done == 1;
    }

    public int getReview_deliver() {
        return review_deliver;
    }

    public void setReview_deliver(int review_deliver) {
        this.review_deliver = review_deliver;
    }

    public int getPaid_done() {
        return paid_done;
    }

    public boolean isShowReadyDelay() {
        return showReadyDelay;
    }

    public void setShowReadyDelay(boolean showReadyDelay) {
        this.showReadyDelay = showReadyDelay;
    }

    public int getReadyLeftMin() {
        return readyLeftMin;
    }

    public void setReadyLeftMin(int readyLeftMin) {
        this.readyLeftMin = readyLeftMin;
    }

    public int getPrint_times() {
        return print_times;
    }

    public void setPrint_times(int print_times) {
        this.print_times = print_times;
    }

    public void incrPrintTimes() {
        this.print_times ++;
    }

    public int getStore_id() {
        return store_id;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public int getShip_worker_id() {
        return ship_worker_id;
    }

    public void setShip_worker_id(int ship_worker_id) {
        this.ship_worker_id = ship_worker_id;
    }

    public int getSimplifiedId() {
        return getId()%1000;
    }

    public int getSource_ready() {
        return source_ready;
    }

    public void setSource_ready(int source_ready) {
        this.source_ready = source_ready;
    }

    public int getPack_operator() {
        return pack_operator;
    }

    public void setPack_operator(int pack_operator) {
        this.pack_operator = pack_operator;
    }

    public String platformWithId() {
        boolean dayIdInvalid = TextUtil.isEmpty(this.getPlatform_dayId()) || "0".equals(this.getPlatform_dayId());
        String dayNo = dayIdInvalid ? this.getPlatform_oid() : this.getPlatform_dayId();
        if (this.getPlatform() == Cts.PLAT_JDDJ.id) {
            dayNo = "";
        }
        return String.format("(%s#%s)", Cts.Platform.find(this.getPlatform()).name, dayNo);
    }

    public boolean shouldTryAutoPrint() {
        return (this.store_id == Cts.STORE_UNKNOWN && print_times <= 2)
                || this.print_times < 1;
    }

    public int getDada_status() {
        return dada_status;
    }

    public void setDada_status(int dada_status) {
        this.dada_status = dada_status;
    }

    public Date getDada_call_at() {
        return dada_call_at;
    }

    public void setDada_call_at(Date dada_call_at) {
        this.dada_call_at = dada_call_at;
    }

    public float getDada_distance() {
        return dada_distance;
    }

    public void setDada_distance(float dada_distance) {
        this.dada_distance = dada_distance;
    }

    public String getDada_order_id() {
        return dada_order_id;
    }

    public void setDada_order_id(String dada_order_id) {
        this.dada_order_id = dada_order_id;
    }

    public float getDada_fee() {
        return dada_fee;
    }

    public void setDada_fee(float dada_fee) {
        this.dada_fee = dada_fee;
    }

    public String getDada_mobile() {
        return dada_mobile;
    }

    public void setDada_mobile(String dada_mobile) {
        this.dada_mobile = dada_mobile;
    }

    public int getDada_dm_id() {
        return dada_dm_id;
    }

    public void setDada_dm_id(int dada_dm_id) {
        this.dada_dm_id = dada_dm_id;
    }

    public String getDada_dm_name() {
        return dada_dm_name;
    }

    public String getStore_remark() {
        return store_remark;
    }

    public void setStore_remark(String store_remark) {
        this.store_remark = store_remark;
    }

    public Feedback getFeedback() {
        return feedback;
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
    }

    public void setDada_dm_name(String dada_dm_name) {
        this.dada_dm_name = dada_dm_name;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getPack_workers() {
        return pack_workers;
    }

    public void setPack_workers(String pack_workers) {
        this.pack_workers = pack_workers;
    }

    public int getAdditional_to_pay() {
        return additional_to_pay;
    }

    public void setAdditional_to_pay(int additional_to_pay) {
        this.additional_to_pay = additional_to_pay;
    }

    public List<Integer> getPackWorkers() {
        ArrayList<Integer> workers = new ArrayList<>();
        String[] w = TextUtils.split(this.pack_workers, ",");
        for(String sId : w) {
            workers.add(Integer.parseInt(sId));
        }
        return workers;
    }

    public String getShip_worker_mobile() {
        return ship_worker_mobile;
    }

    public void setShip_worker_mobile(String ship_worker_mobile) {
        this.ship_worker_mobile = ship_worker_mobile;
    }

    public String getAuto_plat() {
        return auto_plat;
    }

    public void setAuto_plat(String auto_plat) {
        this.auto_plat = auto_plat;
    }

    public String getShip_sch() {
        return ship_sch;
    }

    public void setShip_sch(String ship_sch) {
        this.ship_sch = ship_sch;
    }

    public String getShip_sch_desc() {
        return ship_sch_desc;
    }

    public void setShip_sch_desc(String ship_sch_desc) {
        this.ship_sch_desc = ship_sch_desc;
    }
}

