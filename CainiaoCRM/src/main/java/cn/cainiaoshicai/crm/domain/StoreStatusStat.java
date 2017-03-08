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
}
