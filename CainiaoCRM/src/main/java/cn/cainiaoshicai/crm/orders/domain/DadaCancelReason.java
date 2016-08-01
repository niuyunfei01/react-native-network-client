package cn.cainiaoshicai.crm.orders.domain;

import java.io.Serializable;

/**
 * Created by liuzhr on 7/30/16.
 */
public class DadaCancelReason implements Serializable {

    private int id;
    private String text;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
