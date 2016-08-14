package cn.cainiaoshicai.crm.orders.domain;

import java.util.Date;

/**
 * Created by liuzhr on 8/10/16.
 */
public class FeedbackLog {

    private int by;
    private String by_userName;
    private String log;
    private int status;
    private Date created;

    public int getBy() {
        return by;
    }

    public void setBy(int by) {
        this.by = by;
    }

    public String getLog() {
        return log;
    }

    public void setLog(String log) {
        this.log = log;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public String getBy_userName() {
        return by_userName;
    }

    public void setBy_userName(String by_userName) {
        this.by_userName = by_userName;
    }
}
