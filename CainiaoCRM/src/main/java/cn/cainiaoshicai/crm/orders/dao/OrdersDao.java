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
 */
public class OrdersDao {

    private String getJson() throws ServiceException {
        String url = URLHelper.API_ROOT + "/orders.json" ;

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
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    private String access_token;
    private int listType;

    public OrdersDao(String access_token, int listType) {
        this.listType = listType;
        this.access_token = access_token;
    }
}
