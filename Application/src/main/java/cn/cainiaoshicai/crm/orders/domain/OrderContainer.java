package cn.cainiaoshicai.crm.orders.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.HashMap;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderContainer extends ApiInvokeResult {

    @JsonProperty("orders")
    private ArrayList<Order> orders;

    public ArrayList<Order> getOrders() {
        return orders;
    }

    public void setOrders(ArrayList<Order> orders) {
        this.orders = orders;
    }

    @Override
    public String toString() {
        return "OrderContainer{" +
                ", success=" + success +
                ", error=" + error +
                ", orders=" + orders +
                '}';
    }
}