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

    public ResultBean startShip(Constants.Platform platform, String platformId) throws ServiceException {
        return actionWithResult(platform, platformId, "/order_start_ship");
    }

    public ResultBean setArrived(Constants.Platform platform, String platform_oid) throws ServiceException {
        return actionWithResult(platform, platform_oid, "/order_set_arrived");
    }

    public ResultBean setReady(Constants.Platform platform, String platform_oid) throws ServiceException {
        return actionWithResult(platform, platform_oid, "/order_set_ready");
    }

    @Nullable
    private ResultBean actionWithResult(Constants.Platform platform, String platformId, String pathSuffix) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("platform", String.valueOf(platform.id));
        params.put("platform_oid", platformId);

        String json = getJson(pathSuffix + "/" + platform.id + "/" + platformId, params);

        AppLogger.v("action" + pathSuffix + ":" + json);

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
        return actionWithResult(platform, platformOid, "/order_confirm_accepted");
    }

    public Order getOrder(int platform, String platformOid) {
        try {
            String json = getJson("/order/" + platform + "/" + platformOid, new HashMap<String, String>());
            AppLogger.v("action: order "  + json);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<Order>() {}.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
        } catch (ServiceException e) {
            AppLogger.e("exception to get order:" + e.getMessage(), e);
        }

        return null;
    }
}
