package cn.cainiaoshicai.crm.orders.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.domain.NewOrderReminder;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 */
public class NewOrderDao {

    private String getJson() throws ServiceException {
        String url = URLHelper.API_ROOT + "/orders_new.json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public List<NewOrderReminder> newOrders() throws ServiceException {
        String json = getJson();

        AppLogger.v("newOrders new orders:" + json);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            NewOrderContainer containers = gson.fromJson(json, new TypeToken<NewOrderContainer>() {
            }.getType());
            return containers.getOrders();
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            return null;
        }
    }

    private String access_token;

    public NewOrderDao(String access_token) {
        this.access_token = access_token;
    }

    static public class NewOrderContainer {
        private List<NewOrderReminder> orders;

        public List<NewOrderReminder> getOrders() {
            return orders;
        }

        public void setOrders(List<NewOrderReminder> orders) {
            this.orders = orders;
        }
    }
}
