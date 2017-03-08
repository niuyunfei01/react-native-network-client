package cn.cainiaoshicai.crm.orders.domain;

import java.util.List;

/**
 * Created by liuzhr on 3/8/17.
 */
public class NewOrderContainer {
    private List<NewOrderReminder> orders;

    public List<NewOrderReminder> getOrders() {
        return orders;
    }

    public void setOrders(List<NewOrderReminder> orders) {
        this.orders = orders;
    }
}
