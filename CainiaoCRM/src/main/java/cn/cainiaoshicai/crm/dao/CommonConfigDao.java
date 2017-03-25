package cn.cainiaoshicai.crm.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.domain.Config;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
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

    public Config get() throws ServiceException {
        String url = URLHelper.API_ROOT() + "/common_config.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("common config:" + json);

        Config value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<Config>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    public LinkedHashMap<Integer, Store> listStores() throws ServiceException {
        String url = URLHelper.API_ROOT() + "/list_store.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("list stores:" + json);

        LinkedHashMap<Integer, Store> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<LinkedHashMap<Integer, Store>>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    public ArrayList<Tag> getTags() throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        try {
            String url = URLHelper.API_ROOT() + "/list_tags.json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ArrayList<Tag>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getTags] json syntax error:" + e.getMessage(), e);
            return new ArrayList<>(0);
        }
    }


    public ResultObject<HashMap<String, String>> configItem(String key) throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.put("key", key);

        try {
            String url = URLHelper.API_ROOT() + "/config_item.json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultObject<HashMap<String, String>>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[config_item] json syntax error:" + e.getMessage(), e);
            return ResultObject.readingFailed();
        }
    }
}
