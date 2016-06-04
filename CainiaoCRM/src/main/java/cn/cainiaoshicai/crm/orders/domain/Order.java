package cn.cainiaoshicai.crm.orders.domain;

import java.util.Date;
import java.util.List;

public class Order {

    private int id;
    private int userId;
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

    private Date time_start_ship;
    private Date time_ready;
    private Date time_arrived;
    private int review_deliver;

    private List<CartItem> items;
    private String ship_worker_name;
    private int order_times;
    private int paid_done;

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

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
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
}

