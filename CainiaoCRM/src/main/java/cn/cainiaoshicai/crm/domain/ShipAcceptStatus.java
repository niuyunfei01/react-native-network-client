package cn.cainiaoshicai.crm.domain;

import java.util.List;

import cn.cainiaoshicai.crm.Cts;

/**
 * Created by liuzhr on 5/31/17.
 */

public class ShipAcceptStatus {
    private int status = Cts.SHIP_ACCEPT_OFF;
    private int expireTs;
    private int storeId;
    private String desc;
    private String[] printers;
    private String checkedPrinter;

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

    public String[] getPrinters() {
        return printers;
    }

    public void setPrinters(String[] printers) {
        this.printers = printers;
    }

    public String getCheckedPrinter() {
        return checkedPrinter;
    }

    public void setCheckedPrinter(String checkedPrinter) {
        this.checkedPrinter = checkedPrinter;
    }

    public int getCheckedIdx() {
        if (printers != null && printers.length > 0) {
            for (int i = 0; i < printers.length; i++) {
                if (printers[i].equals(checkedPrinter)) {
                    return i;
                }
            }
        }
        return 0;
    }
}
