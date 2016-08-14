package cn.cainiaoshicai.crm.orders.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by liuzhr on 8/8/16.
 */
public class Feedback implements Serializable {
    private int id;
    private String content;
    private String userName;
    private int from_user;
    private int reported_by;
    private int source;
    private int from_order;

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
}
