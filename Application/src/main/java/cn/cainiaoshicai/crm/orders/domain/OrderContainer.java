package cn.cainiaoshicai.crm.orders.domain;

import java.util.ArrayList;
import java.util.HashMap;

public class OrderContainer {

    private ArrayList<Order> orders;
    private HashMap<Integer, Integer> totals;

    public ArrayList<Order> getOrders() {
        return orders;
    }

    public void setOrders(ArrayList<Order> orders) {
        this.orders = orders;
    }

    public HashMap<Integer, Integer> getTotals() {
        return totals;
    }

    public void setTotals(HashMap<Integer, Integer> totals) {
        this.totals = totals;
    }

    @Override
    public String toString() {
        return "OrderContainer{" +
                ", orders=" + orders +
                ", totals=" + totals +
                '}';
    }
}