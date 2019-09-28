package cn.cainiaoshicai.crm.domain;

import java.util.Date;

/**
 * Created by liuzhr on 6/30/16.
 */
public class StoreProduct {
    private int id;
    private int store_id;
    private int product_id;
    private int total_to_store;
    private int expect_store_in_store;
    private int giveaway_in_store;
    private float loss_in_store;
    private int sold_in_store;
    private int deleted;
    private int status;
    private int price;
    private int sold_from_last_stat;
    private Date last_stat;
    private int total_last_stat;
    private float store_gap;
    private float total_left_in_store;
    private int left_since_last_stat;
    private int re_on_sale_time;

    private int risk_min_stat;
    private int self_provided;
    private int auto_off_sale;
    private int sold_7day;
    private int sold_weekend;
    private int sold_latest;
    private int req_total;
    private String req_mark;
    private String expect_check_time;

    private String shelf_no;

    private int supply_price;

    private int applying_price;

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

    public int getProduct_id() {
        return product_id;
    }

    public void setProduct_id(int product_id) {
        this.product_id = product_id;
    }

    public int getTotal_to_store() {
        return total_to_store;
    }

    public void setTotal_to_store(int total_to_store) {
        this.total_to_store = total_to_store;
    }

    public int getExpect_store_in_store() {
        return expect_store_in_store;
    }

    public void setExpect_store_in_store(int expect_store_in_store) {
        this.expect_store_in_store = expect_store_in_store;
    }

    public int getGiveaway_in_store() {
        return giveaway_in_store;
    }

    public void setGiveaway_in_store(int giveaway_in_store) {
        this.giveaway_in_store = giveaway_in_store;
    }

    public float getLoss_in_store() {
        return loss_in_store;
    }

    public void setLoss_in_store(float loss_in_store) {
        this.loss_in_store = loss_in_store;
    }

    public int getSold_in_store() {
        return sold_in_store;
    }

    public void setSold_in_store(int sold_in_store) {
        this.sold_in_store = sold_in_store;
    }

    public int getDeleted() {
        return deleted;
    }

    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public int getSold_from_last_stat() {
        return sold_from_last_stat;
    }

    public void setSold_from_last_stat(int sold_from_last_stat) {
        this.sold_from_last_stat = sold_from_last_stat;
    }

    public Date getLast_stat() {
        return last_stat;
    }

    public void setLast_stat(Date last_stat) {
        this.last_stat = last_stat;
    }

    public int getTotal_last_stat() {
        return total_last_stat;
    }

    public void setTotal_last_stat(int total_last_stat) {
        this.total_last_stat = total_last_stat;
    }

    public float getStore_gap() {
        return store_gap;
    }

    public void setStore_gap(float store_gap) {
        this.store_gap = store_gap;
    }

    public float getTotal_left_in_store() {
        return total_left_in_store;
    }

    public void setTotal_left_in_store(float total_left_in_store) {
        this.total_left_in_store = total_left_in_store;
    }

    public int getLeft_since_last_stat() {
        return left_since_last_stat;
    }

    public void setLeft_since_last_stat(int left_since_last_stat) {
        this.left_since_last_stat = left_since_last_stat;
    }

    public int getRisk_min_stat() {
        return risk_min_stat;
    }

    public void setRisk_min_stat(int risk_min_stat) {
        this.risk_min_stat = risk_min_stat;
    }

    public int getSelf_provided() {
        return self_provided;
    }

    public void setSelf_provided(int self_provided) {
        this.self_provided = self_provided;
    }

    public int getAuto_off_sale() {
        return auto_off_sale;
    }

    public void setAuto_off_sale(int auto_off_sale) {
        this.auto_off_sale = auto_off_sale;
    }

    public int getSold_7day() {
        return sold_7day;
    }

    public void setSold_7day(int sold_7day) {
        this.sold_7day = sold_7day;
    }

    public int getSold_weekend() {
        return sold_weekend;
    }

    public void setSold_weekend(int sold_weekend) {
        this.sold_weekend = sold_weekend;
    }

    public int getReq_total() {
        return req_total;
    }

    public void setReq_total(int req_total) {
        this.req_total = req_total;
    }

    public String getReq_mark() {
        return req_mark;
    }

    public int getRe_on_sale_time() {
        return re_on_sale_time;
    }

    public void setRe_on_sale_time(int re_on_sale_time) {
        this.re_on_sale_time = re_on_sale_time;
    }

    public void setReq_mark(String req_mark) {
        this.req_mark = req_mark;
    }

    public int getSupply_price() {
        return supply_price;
    }

    public void setSupply_price(int supply_price) {
        this.supply_price = supply_price;
    }

    public int getApplying_price() {
        return applying_price;
    }

    public void setApplying_price(int applying_price) {
        this.applying_price = applying_price;
    }

    public String getShelf_no() {
        return shelf_no;
    }

    public void setShelf_no(String shelf_no) {
        this.shelf_no = shelf_no;
    }

    public int getSold_latest() {
        return sold_latest;
    }

    public void setSold_latest(int sold_latest) {
        this.sold_latest = sold_latest;
    }

    public String getExpect_check_time() {
        return expect_check_time;
    }

    public void setExpect_check_time(String expect_check_time) {
        this.expect_check_time = expect_check_time;
    }
}
