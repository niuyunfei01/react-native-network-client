package cn.cainiaoshicai.crm.orders.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.cainiaoshicai.crm.Cts;

/**
 * Created by liuzhr on 8/8/16.
 */
public class Feedback implements Serializable {

    private int id;
    private String content;
    private String userName;
    private Date reported_at;
    private int from_user;
    private int reported_by;
    private int source;
    private int from_order;
    private int status;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Date getReported_at() {
        return reported_at;
    }

    public void setReported_at(Date reported_at) {
        this.reported_at = reported_at;
    }

    private List<FeedbackLog> logs = new ArrayList<>(0);

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getFrom_user() {
        return from_user;
    }

    public void setFrom_user(int from_user) {
        this.from_user = from_user;
    }

    public int getReported_by() {
        return reported_by;
    }

    public void setReported_by(int reported_by) {
        this.reported_by = reported_by;
    }

    public int getSource() {
        return source;
    }

    public void setSource(int source) {
        this.source = source;
    }

    public List<FeedbackLog> getLogs() {
        return logs;
    }

    public void setLogs(List<FeedbackLog> logs) {
        this.logs = logs;
    }

    public String getSourceName() {
        return "百度差评";
    }

    public int getFrom_order() {
        return from_order;
    }

    public void setFrom_order(int from_order) {
        this.from_order = from_order;
    }

    public String getFromUserName() {
        return "流星花园张先生";
    }

    public String getStatusTxt() {
        switch(this.status) {
            case Cts.FB_STATUS_DOING: return Cts.FB_STATUS_DOING_T;
            case Cts.FB_STATUS_FIXED: return Cts.FB_STATUS_FIXED_T;
            default:
                return Cts.FB_STATUS_UNKNOWN_T;
        }
    }
}
