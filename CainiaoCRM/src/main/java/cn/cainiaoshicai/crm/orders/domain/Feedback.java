package cn.cainiaoshicai.crm.orders.domain;

import java.io.Serializable;

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

    public String getSourceName() {
        return "百度差评";
    }

    public String getFromUserName() {
        return "流星花园张先生";
    }
}
