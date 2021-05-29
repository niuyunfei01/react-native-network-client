package cn.cainiaoshicai.crm.support.utils;

import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.GeoBean;
import cn.cainiaoshicai.crm.orders.domain.MessageBean;
import cn.cainiaoshicai.crm.orders.domain.MessageListBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.UserBean;

/**
 * User: qii
 * Date: 13-3-29
 */
public class ObjectToStringUtility {

    public static String toString(Order order) {
        return order.toString();
    }

    public static String toString(MessageBean messageBean) {
        return messageBean.toString();
    }

    public static String toString(MessageListBean messageListBean) {
        return "messageListBean";
    }

    public static String toString(GeoBean geoBean) {
        return "geobean";
    }

    public static String toString(AccountBean accountBean) {
        return "account_bean";
    }

    public static String toString(UserBean userBean) {
        return "userBean";
    }
}
