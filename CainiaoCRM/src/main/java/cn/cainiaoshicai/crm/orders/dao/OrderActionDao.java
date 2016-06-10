package cn.cainiaoshicai.crm.orders.dao;

import android.support.annotation.Nullable;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class OrderActionDao {

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.putAll(params);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public ResultBean startShip(Constants.Platform platform, String platformId, int ship_worker_id) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", String.valueOf(ship_worker_id));
        return actionWithResult(platform, platformId, "/order_start_ship/", params);
    }

    public ResultBean setArrived(Constants.Platform platform, String platform_oid) throws ServiceException {
        return actionWithResult(platform, platform_oid, "/order_set_arrived", new HashMap<String, String>());
    }

    public ResultBean setReady(Constants.Platform platform, String platform_oid, int workerId) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", String.valueOf(workerId));
        return actionWithResult(platform, platform_oid, "/order_set_ready", params);
    }

    @Nullable
    private ResultBean actionWithResult(Constants.Platform platform, String platformId, String pathSuffix,
                                        HashMap<String, String> params) throws ServiceException {
        String path = pathSuffix + "/" + platform.id + "/" + platformId;
        return actionWithResult(path, params);
    }

    @Nullable
    private ResultBean actionWithResult(String path, HashMap<String, String> params) throws ServiceException {
        if (params == null) {
            params = new HashMap<>();
        }

        String json = getJson(path, params);

        AppLogger.v("action" + path + ":" + json);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultBean>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            return ResultBean.readingFailed();
        }
    }

    private String access_token;
    public OrderActionDao(String access_token) {
        this.access_token = access_token;
    }

    public ResultBean confirmAccepted(Constants.Platform platform, String platformOid) throws ServiceException {
        return actionWithResult(platform, platformOid, "/order_confirm_accepted", null);
    }

    public ResultBean saveDelayReason(Constants.Platform platform, String platformOid, HashMap<String, String> params) throws ServiceException {
        return actionWithResult(platform, platformOid, "/save_order_delay_reason", params);
    }

    public Order getOrder(int platform, String platformOid) {
        return _order("/order/" + platform + "/" + platformOid);
    }

    public Order getOrder(int orderId) {
        return _order("/order/" + orderId);
    }

    private Order _order(String path) {
        try {
            String json = getJson(path, new HashMap<String, String>());
            AppLogger.v("action: order " + json);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<Order>() {}.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
        } catch (ServiceException e) {
            AppLogger.e("exception to get order:" + e.getMessage(), e);
        }

        return null;
    }

    public ResultBean setOrderInvalid(int orderId) throws ServiceException {
        return actionWithResult("/order_set_invalid/"+orderId, new HashMap<String, String>());
    }

    public ResultBean logOrderPrinted(int orderId) throws ServiceException {
        return actionWithResult("/order_log_print/"+orderId, new HashMap<String, String>());
    }
}
