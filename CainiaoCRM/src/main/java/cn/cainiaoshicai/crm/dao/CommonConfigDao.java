package cn.cainiaoshicai.crm.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.domain.Config;
import cn.cainiaoshicai.crm.domain.ShipOptions;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Created by liuzhr on 4/12/16.
 */
public class CommonConfigDao {

    private String access_token;

    public CommonConfigDao(String access_token) {
        this.access_token = access_token;
    }

    public LinkedHashMap<Long, Store> listStores(long storeId) throws ServiceException {
        String url = URLHelper.API_ROOT() + "/list_store.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.put("_sid", String.valueOf(storeId));

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("list stores:" + json);

        LinkedHashMap<Long, Store> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<LinkedHashMap<Long, Store>>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    public ArrayList<Tag> getTags(long currStoreId) throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        try {
            String storeIdPath = currStoreId > 0 ? String.valueOf(currStoreId) : "";
            String url = URLHelper.API_ROOT() + "/list_tags/"+ storeIdPath +".json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ArrayList<Tag>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getTags] json syntax error:" + e.getMessage(), e);
            return new ArrayList<>(0);
        }
    }


    public ResultBean<ArrayList<ShipOptions>> shipOptions() throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        try {
            String url = URLHelper.API_ROOT() + "/ship_options.json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultBean<ArrayList<ShipOptions>>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[shipOptions] json syntax error:" + e.getMessage(), e);
            return new ResultBean<>(false, "数据错误");
        }
    }

    public ResultBean<HashMap<String, String>> configItem(String key) throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.put("key", key);

        try {
            String url = URLHelper.API_ROOT() + "/config_item.json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultBean<HashMap<String, String>>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[config_item] json syntax error:" + e.getMessage(), e);
            return ResultBean.readingFailed();
        }
    }
}
