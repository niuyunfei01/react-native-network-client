package cn.cainiaoshicai.crm.orders.domain;

import java.util.ArrayList;
import java.util.HashMap;

public class OrderContainer {

    private int total_task_mine = 0;
    private int except_count = 0;

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

    public int getTotal_task_mine() {
        return total_task_mine;
    }

    public void setTotal_task_mine(int total_task_mine) {
        this.total_task_mine = total_task_mine;
    }

    @Override
    public String toString() {
        return "OrderContainer{" +
                ", orders=" + orders +
                ", totals=" + totals +
                ", except_count=" + except_count +
                '}';
    }

    public int getExcept_count() {
        return except_count;
    }

    public void setExcept_count(int except_count) {
        this.except_count = except_count;
    }
}