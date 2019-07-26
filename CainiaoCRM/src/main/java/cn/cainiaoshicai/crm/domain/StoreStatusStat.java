package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 3/8/17.
 */
public class StoreStatusStat {

    private int total_on_sale;
    private int total_risk;
    private int total_sold_out;
    private int total_off_sale;
    private int total_req_cnt;
    private int total_sold_empty;
    private int total_need_check;
    private int total_no_code;
    private int total_no_shelf;
    private int total_sales_time;

    public int getTotal_on_sale() {
        return total_on_sale;
    }

    public void setTotal_on_sale(int total_on_sale) {
        this.total_on_sale = total_on_sale;
    }

    public int getTotal_risk() {
        return total_risk;
    }

    public int getTotal_off_sale() {
        return total_off_sale;
    }

    public void setTotal_off_sale(int total_off_sale) {
        this.total_off_sale = total_off_sale;
    }

    public void setTotal_risk(int total_risk) {
        this.total_risk = total_risk;
    }

    public int getTotal_sold_out() {
        return total_sold_out;
    }

    public void setTotal_sold_out(int total_sold_out) {
        this.total_sold_out = total_sold_out;
    }

    public void setTotal_req_cnt(int total_req_cnt) {
        this.total_req_cnt = total_req_cnt;
    }

    public int getTotal_req_cnt() {
        return total_req_cnt;
    }

    public int getTotal_sold_empty() {
        return total_sold_empty;
    }

    public void setTotal_sold_empty(int total_sold_empty) {
        this.total_sold_empty = total_sold_empty;
    }

    public int getTotal_need_check() {
        return total_need_check;
    }

    public void setTotal_need_check(int total_need_check) {
        this.total_need_check = total_need_check;
    }

    public int getTotal_no_code() {
        return total_no_code;
    }

    public void setTotal_no_code(int total_no_code) {
        this.total_no_code = total_no_code;
    }

    public int getTotal_no_shelf() {
        return total_no_shelf;
    }

    public void setTotal_no_shelf(int total_no_shelf) {
        this.total_no_shelf = total_no_shelf;
    }

    public int getTotal_sales_time() {
        return total_sales_time;
    }

    public void setTotal_sales_time(int total_sales_time) {
        this.total_sales_time = total_sales_time;
    }
}
