package cn.cainiaoshicai.crm.orders.domain;

import java.util.ArrayList;
import java.util.HashMap;

public class OrderContainer {

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
                ", orders=" + orders +
                '}';
    }
}