package cn.cainiaoshicai.crm.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by liuzhr on 4/15/17.
 */

public class ProductProvideList {

    private String orderId;
    private String expectTimeStr;
    private String expectToAddr;
    private String orderByName;
    private String orderByPhone;

    private String provideName;
    private String providePhone;

    private List<Item> items = new ArrayList<Item>();

    public String getExpectTimeStr() {
        return expectTimeStr;
    }

    public void setExpectTimeStr(String expectTimeStr) {
        this.expectTimeStr = expectTimeStr;
    }

    public String getOrderByName() {
        return orderByName;
    }

    public void setOrderByName(String orderByName) {
        this.orderByName = orderByName;
    }

    public String getOrderByPhone() {
        return orderByPhone;
    }

    public void setOrderByPhone(String orderByPhone) {
        this.orderByPhone = orderByPhone;
    }

    public String getProvideName() {
        return provideName;
    }

    public void setProvideName(String provideName) {
        this.provideName = provideName;
    }

    public String getProvidePhone() {
        return providePhone;
    }

    public void setProvidePhone(String providePhone) {
        this.providePhone = providePhone;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    static public class Item {
        private String name;
        private String quantity;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getQuantity() {
            return quantity;
        }

        public void setQuantity(String quantity) {
            this.quantity = quantity;
        }
    }

    public String getExpectToAddr() {
        return expectToAddr;
    }

    public void setExpectToAddr(String expectToAddr) {
        this.expectToAddr = expectToAddr;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
}
