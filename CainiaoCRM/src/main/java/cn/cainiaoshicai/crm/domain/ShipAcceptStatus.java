package cn.cainiaoshicai.crm.domain;

import cn.cainiaoshicai.crm.Cts;

/**
 * Created by liuzhr on 5/31/17.
 */

public class ShipAcceptStatus {
    private int status = Cts.SHIP_ACCEPT_OFF;
    private int expireTs;
    private int storeId;
    private String desc;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getExpireTs() {
        return expireTs;
    }

    public void setExpireTs(int expireTs) {
        this.expireTs = expireTs;
    }

    public int getStoreId() {
        return storeId;
    }

    public void setStoreId(int storeId) {
        this.storeId = storeId;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
