package cn.cainiaoshicai.crm.orders.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;


import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class OrdersDao {

    private String getJson() throws ServiceException {
        String url = URLHelper.API_ROOT + "/orders/" + this.day + ".json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.put("status", String.valueOf(this.listType));

        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public OrderContainer get() throws ServiceException {
        String json = getJson();

        AppLogger.v("get orders:" + json);

        OrderContainer value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<OrderContainer>() {}.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage());
        }

        return value;
    }

    private String access_token;
    private int listType;
    private String day;

    public OrdersDao(String access_token, Date orderDay, int listType) {
        if (orderDay == null) {
            throw new IllegalArgumentException("orderDay cant be null");
        }

        this.day = DateTimeUtils.shortYmd(orderDay);
        this.listType = listType;
        this.access_token = access_token;
    }
}
