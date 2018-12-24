package cn.cainiaoshicai.crm.orders.domain;

import android.text.TextUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.domain.ShipCallOption;
import cn.cainiaoshicai.crm.orders.util.TextUtil;

public class Order implements Serializable {

    private int id;
    private int user_id;
    private int gender;

    private String dayId;
    private String userName;
    private String address;
    private String mobile;
    private double orderMoney;
    private double paid_by_user;
    private double supplyMoney = 0;
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

    private long store_id;

    private List<CartItem> items = new ArrayList<>();
    private String ship_worker_name;
    private int ship_worker_id;
    private int pack_operator;
    private String pack_workers;
    private int order_times;
    private int paid_done;
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
    private String direction = "";
    private int additional_to_pay;
    private String ship_worker_mobile;

    private boolean remark_warning;
    private String fullStoreName = "";
    private String store_name = "";
    private String printFooter1 = "";
    private String printFooter2 = "";
    private String printFooter3 = "";

    private ArrayList<ShipCallOption> callWays = new ArrayList<>();
    private int selected_way;
    private String line_additional;
    private String line_money_total;

    private String mobile_suffix;
    private String real_mobile;

    private String ele_id;
    private int eb_order_from;

    //外卖店铺标示
    private String es_mark_name;

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

    public String getGenderText() {
        return this.gender == 1 ? "先生" : "女士";
    }

    public void setOrderMoney(double pay) {
        this.orderMoney = pay;
    }

    public double getOrderMoney() {
        return orderMoney;
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
        this.print_times++;
    }

    public long getStore_id() {
        return store_id;
    }

    public void setStore_id(long store_id) {
        this.store_id = store_id;
    }

    public int getShip_worker_id() {
        return ship_worker_id;
    }

    public void setShip_worker_id(int ship_worker_id) {
        this.ship_worker_id = ship_worker_id;
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

        //避免京东的一长串单子
        if (this.getPlatform() == Cts.PLAT_JDDJ.id && (dayNo != null && dayNo.length() > 8)) {
            dayNo = "";
        }
        String esMarkName = this.getEs_mark_name();
        if (esMarkName == null) {
            esMarkName = "";
        }
        esMarkName = esMarkName.trim();
        //饿百订单显示饿了么信息
        if (this.getPlatform() == Cts.PLAT_BD.id && this.getEb_order_from() == Cts.EB_ORDER_FROM_ELE) {
            return String.format("(%s %s#%s)", Cts.Platform.find(Cts.PLAT_ELEME.id).name, esMarkName, dayNo);
        }
        return String.format("(%s %s#%s)", Cts.Platform.find(this.getPlatform()).name, esMarkName, dayNo);
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
        for (String sId : w) {
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

    public String getEle_id() {
        return ele_id;
    }

    public void setEle_id(String ele_id) {
        this.ele_id = ele_id;
    }

    public int getEb_order_from() {
        return eb_order_from;
    }

    public void setEb_order_from(int eb_order_from) {
        this.eb_order_from = eb_order_from;
    }

    public String getEs_mark_name() {
        return es_mark_name;
    }

    public void setEs_mark_name(String es_mark_name) {
        this.es_mark_name = es_mark_name;
    }

    public void copy(Order updatedO) {
        this.id = updatedO.id;
        user_id = updatedO.user_id;
        gender = updatedO.gender;

        dayId = updatedO.dayId;
        userName = updatedO.userName;
        address = updatedO.address;
        mobile = updatedO.mobile;
        orderMoney = updatedO.orderMoney;
        supplyMoney = updatedO.supplyMoney;
        paid_by_user = updatedO.paid_by_user;
        expectTime = updatedO.expectTime;
        expectTimeStr = updatedO.expectTimeStr;
        orderTime = updatedO.orderTime;
        remark = updatedO.remark;
        orderStatus = updatedO.orderStatus;
        platform = updatedO.platform;
        platform_oid = updatedO.platform_oid;
        platform_dayId = updatedO.platform_dayId;
        store_remark = updatedO.store_remark;

        time_start_ship = updatedO.time_start_ship;
        time_ready = updatedO.time_ready;
        time_arrived = updatedO.time_arrived;
        review_deliver = updatedO.review_deliver;

        print_times = updatedO.print_times;

        store_id = updatedO.store_id;

        items = updatedO.items;
        ship_worker_name = updatedO.ship_worker_name;
        ship_worker_id = updatedO.ship_worker_id;
        pack_operator = updatedO.pack_operator;
        pack_workers = updatedO.pack_workers;
        order_times = updatedO.order_times;
        paid_done = updatedO.paid_done;
        readyLeftMin = updatedO.readyLeftMin;

        dada_status = updatedO.dada_status;
        dada_call_at = updatedO.dada_call_at;
        dada_distance = updatedO.dada_distance;
        dada_order_id = updatedO.dada_order_id;
        dada_fee = updatedO.dada_fee;

        dada_mobile = updatedO.dada_mobile;
        dada_dm_id = updatedO.dada_dm_id;
        dada_dm_name = updatedO.dada_dm_name;
        auto_plat = updatedO.auto_plat;
        ship_sch = updatedO.ship_sch;
        ship_sch_desc = updatedO.ship_sch_desc;

        source_ready = updatedO.source_ready;

        feedback = updatedO.feedback;
        direction = updatedO.direction;
        additional_to_pay = updatedO.additional_to_pay;
        ship_worker_mobile = updatedO.ship_worker_mobile;
        remark_warning = updatedO.remark_warning;
        ele_id = updatedO.ele_id;
        eb_order_from = updatedO.eb_order_from;
        es_mark_name = updatedO.es_mark_name;
    }

    public boolean isRemark_warning() {
        return remark_warning;
    }

    public void setRemark_warning(boolean remark_warning) {
        this.remark_warning = remark_warning;
    }

    public String getFullStoreName() {
        return fullStoreName;
    }

    public void setFullStoreName(String fullStoreName) {
        this.fullStoreName = fullStoreName;
    }

    public String getPrintFooter1() {
        return printFooter1;
    }

    public void setPrintFooter1(String printFooter1) {
        this.printFooter1 = printFooter1;
    }

    public String getPrintFooter2() {
        return printFooter2;
    }

    public void setPrintFooter2(String printFooter2) {
        this.printFooter2 = printFooter2;
    }

    public String getPrintFooter3() {
        return printFooter3;
    }

    public void setPrintFooter3(String printFooter3) {
        this.printFooter3 = printFooter3;
    }

    public ArrayList<ShipCallOption> getCallWays() {
        return callWays;
    }

    public void setCallWays(ArrayList<ShipCallOption> callWays) {
        this.callWays = callWays;
    }

    public double getPaid_by_user() {
        return paid_by_user;
    }

    public void setPaid_by_user(double paid_by_user) {
        this.paid_by_user = paid_by_user;
    }

    public String[] callOptions() {
        ArrayList<String> labels;
        if (this.callWays != null && !this.callWays.isEmpty()) {
            labels = new ArrayList<>(callWays.size());
            for (int i = 0; i < callWays.size(); i++) {
                labels.add(this.callWays.get(i).desc());
            }
        } else {
            labels = new ArrayList<>(0);
        }
        return labels.toArray(new String[0]);
    }

    public int getSelected_way() {
        return this.selected_way;
    }

    public void setSelected_way(int way) {
        this.selected_way = way;
    }

    public int getSelectedCallOptionIdx() {
        for (int idx = 0; idx < this.callWays.size(); idx++) {
            if (this.selected_way == this.callWays.get(idx).getWay()) {
                return idx;
            }
        }
        return 0;
    }

    public void setSelectedCallOptionIdx(int selectedCallOptionIdx) {
        this.selected_way = this.callWays.get(selectedCallOptionIdx).getWay();
    }

    public String getLine_additional() {
        return line_additional;
    }

    public void setLine_additional(String line_additional) {
        this.line_additional = line_additional;
    }

    public String getLine_money_total() {
        return line_money_total;
    }

    public void setLine_money_total(String line_money_total) {
        this.line_money_total = line_money_total;
    }

    public String getStore_name() {
        return store_name;
    }

    public void setStore_name(String store_name) {
        this.store_name = store_name;
    }

    public String getMobile_suffix() {
        return mobile_suffix;
    }

    public void setMobile_suffix(String mobile_suffix) {
        this.mobile_suffix = mobile_suffix;
    }

    public String getReal_mobile() {
        return real_mobile;
    }

    public void setReal_mobile(String real_mobile) {
        this.real_mobile = real_mobile;
    }

    public double getSupplyMoney() {
        return supplyMoney;
    }

    public void setSupplyMoney(double supplyMoney) {
        this.supplyMoney = supplyMoney;
    }
}

