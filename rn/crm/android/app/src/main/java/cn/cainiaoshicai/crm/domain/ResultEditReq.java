package cn.cainiaoshicai.crm.domain;

import cn.cainiaoshicai.crm.orders.domain.ResultBean;

/**
 * Created by liuzhr on 3/8/17.
 */
public class ResultEditReq extends ResultBean {

    private int total_req_cnt;

    public ResultEditReq(boolean b, String desc) {
        super(b, desc);
    }

    public int getTotal_req_cnt() {
        return total_req_cnt;
    }

    public void setTotal_req_cnt(int total_req_cnt) {
        this.total_req_cnt = total_req_cnt;
    }
}
